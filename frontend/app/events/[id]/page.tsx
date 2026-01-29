'use client';

import { Screen } from '@/components/seats/Screen';
import { SeatLegend } from '@/components/seats/SeatLegend';
import { SeatMap } from '../../../components/seats/SeatMap';
import { Seat } from '@/types/seat';
import { ProceedToPaymentBar } from '@/components/seats/PaymentBar';
import { SelectionSummary } from '@/components/seats/SelectionSummary';
import { useEffect, useState, useRef } from 'react';
import {
  createPaymentSession,
  fetchEventWithSeats,
  lockSeatsApi,
} from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { useParams } from 'next/navigation';
import { PaymentCountdown } from '@/components/payment/PaymentCountdown';
import { useAuth } from '@/context/AuthContext';
import {
  clearPostAuthAction,
  getPostAuthAction,
  setPostAuthAction,
} from '@/lib/authIntent';
import { AuthModal } from '@/components/auth/AuthModal';

export default function EventSeatsPage() {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [seats, setSeats] = useState<Record<string, Seat>>({});
  const [event, setEvent] = useState<{ name: string; date: string } | null>(null);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [isLocking, setIsLocking] = useState(false);
  const [loading, setLoading] = useState(true);

  const [paymentTTL, setPaymentTTL] = useState<number | null>(null);
  const [showPaymentUI, setShowPaymentUI] = useState(false);

  const { id: eventId } = useParams();

  useEffect(() => {
    async function loadEvent() {
      try {
        const data = await fetchEventWithSeats(eventId as string);

        const seatMap = Object.fromEntries(
          data.seats.map((seat: Seat) => [seat.id, seat])
        );

        setSeats(seatMap);
        if (data.event) {
           setEvent(data.event);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [eventId]);

  function toggleSeat(seatId: string) {
    setSelectedSeatIds((prev) =>
      prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId]
    );
  }

  async function handleProceedToPayment() {
    if (selectedSeatIds.length === 0) return;

    // 🔐 Not logged in → open modal
    if (!user) {
      setPostAuthAction({
        type: 'BOOK_SEATS',
        seatIds: selectedSeatIds,
        eventId: eventId as string,
      });
      setShowAuthModal(true);
      return;
    }

    // ✅ Logged in → proceed
    setIsLocking(true);

    try {
      await lockSeatsApi(selectedSeatIds);
      
      // 🚀 Optimistic/Direct flow: Create payment session immediately
      // This keeps the "user gesture" context alive for potential window.open (though async might still be risky for strict blockers, it's better than socket)
      // Actually, for "new tab", reliable way is <Link target="_blank"> or user click.
      // But user said "clicking on book seats... should redirect".
      
      const { url } = await createPaymentSession(selectedSeatIds, eventId as string);
      
      // UX: Open in new tab as requested
      const newWindow = window.open(url, '_blank');
      
      // Fallback if popup blocker blocked it (optional improvement)
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
         // Fallback: Redirect in same tab or show a manual link
         // For now, let's respect the "new tab" request and assume standard browser settings or user allows it.
         // Or getting back to "same tab" if new tab fails is cleaner? 
         // User *explicitly* asked for another tab.
         // If blocked, we might want to let them click a link.
         // Let's just try window.open.
      }

      // Show temporary UI or allow socket to update state
      setShowPaymentUI(true);
      
      // We can fetch TTL here too if we want to show the countdown
      const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/seats/lock/${selectedSeatIds[0]}/ttl`
      );
      const data = await res.json();
      setPaymentTTL(data.ttl);

    } catch (error) {
      console.error(error);
      setIsLocking(false);
      alert('Failed to lock seats or create payment session');
    }
  }

  useEffect(() => {
    if (!user) return;

    const action = getPostAuthAction();
    if (!action) return;

    if (action.type === 'BOOK_SEATS') {
      clearPostAuthAction();
      handleProceedToPayment();
    }
  }, [user]);

  /* 
     State Refs for Event Listeners 
     (needed because socket listeners close over state)
  */
  const showPaymentUIRef = useRef(showPaymentUI);
  useEffect(() => { showPaymentUIRef.current = showPaymentUI; }, [showPaymentUI]);

  const userRef = useRef(user);
  useEffect(() => { userRef.current = user; }, [user]);


  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on('seat:locked', async ({ seatIds, lockedByUserId }) => {
      // update seat state
      setSeats((prev) => {
        const next = { ...prev };
        for (const id of seatIds) {
          if (!next[id]) continue;
          next[id] = {
            ...next[id],
            status: 'LOCKED',
            lockedByUserId,
          };
        }
        return next;
      });

      // If we locked it, we essentially handled the UI in handleProceedToPayment already
      // But clearing selection is good
      if (lockedByUserId === userRef.current?.id) {
         setSelectedSeatIds([]);
         setIsLocking(false); // Enable buttons/UI again if needed, or keep locked for payment UI
      } else {
         // Someone else locked seats: deselect ours if conflict
         setSelectedSeatIds(prev => prev.filter(id => !seatIds.includes(id)));
      }
    });

    socket.on('seat:unlocked', ({ seatIds }) => {
      let expiredForMe = false;

      setSeats((prev) => {
        const next = { ...prev };
        for (const id of seatIds) {
          if (!next[id]) continue;
          
          // Check if this was locked by ME
          if (next[id].lockedByUserId === userRef.current?.id) {
             expiredForMe = true;
          }

          next[id] = {
            ...next[id],
            status: 'AVAILABLE',
            lockedByUserId: null,
          };
        }
        return next;
      });

      // 🕒 Handling Expiry
      if (expiredForMe && showPaymentUIRef.current) {
          alert('Your seat lock expired. Please select again.');
          setShowPaymentUI(false);
          setPaymentTTL(null);
      }
    });

    socket.on('seat:booked', ({ seatIds }) => {
      setSeats((prev) => {
        const next = { ...prev };
        for (const id of seatIds) {
          if (!next[id]) continue;
          next[id] = {
            ...next[id],
            status: 'BOOKED',
            lockedByUserId: null,
          };
        }
        return next;
      });

      // ✅ Fix: Clear payment UI if these were our seats
      // (selectedSeatIds is empty after lock, so we check showPaymentUI or if we just booked them logic)
      // Actually, after booking success, we usually redirect or show success.
      // But if we are still on this page (e.g. separate tab flow), we should clear UI.
      if (showPaymentUIRef.current) {
         setShowPaymentUI(false);
         setPaymentTTL(null);
      }
    });

    return () => {
      socket.off('seat:locked');
      socket.off('seat:unlocked');
      socket.off('seat:booked');
    };
  }, [eventId]); // Removed 'user' dependency to avoid re-binding socket, using refs instead

  if (loading) {
    return <div>Loading seats...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 🎬 Phase 2: Event Header */}
      {event && (
        <div className="mb-8 border-b pb-6">
          <h1 className="text-3xl font-bold text-gray-900">{event.name}</h1>
          <div className="mt-2 flex items-center text-gray-600 gap-4">
             <div className="flex items-center gap-1">
                <span>📍</span>
                <span>IMAX Mumbai</span> 
             </div>
             <div className="flex items-center gap-1">
                <span>🗓</span>
                <span>{new Date(event.date).toLocaleDateString()} | {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
             </div>
          </div>
        </div>
      )}

      <Screen />

      <SeatMap
        seats={Object.values(seats)}
        selectedSeatIds={selectedSeatIds}
        isLocking={isLocking || showPaymentUI}
        onToggleSeat={toggleSeat}
        currentUserId={user?.id || ''}
      />

      <SelectionSummary
        seats={Object.values(seats)}
        selectedSeatIds={selectedSeatIds}
      />

      {showPaymentUI && paymentTTL !== null && (
        <div className="mb-4 rounded-md border border-yellow-300 bg-yellow-50 p-3">
          <PaymentCountdown secondsLeft={paymentTTL} />
          <p className="text-sm text-gray-600 mt-1">
            Redirecting to secure payment…
          </p>
        </div>
      )}

      <ProceedToPaymentBar
        disabled={selectedSeatIds.length === 0 || isLocking || showPaymentUI}
        onLock={handleProceedToPayment}
        user={user}
      />

      <SeatLegend />

      <AuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}
