'use client';

import { Screen } from '@/components/seats/Screen';
import { SeatLegend } from '@/components/seats/SeatLegend';
import { SeatMap } from '../../../components/seats/SeatMap';
import { Seat } from '@/types/seat';
import { ProceedToPaymentBar } from '@/components/seats/PaymentBar';
import { SelectionSummary } from '@/components/seats/SelectionSummary';
import { useEffect, useState } from 'react';
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

export default function EventSeatsPage() {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [seats, setSeats] = useState<Record<string, Seat>>({});
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
        // later: setEvent(data.event)
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
    } catch (error) {
      console.error(error);
      setIsLocking(false);
      alert('Failed to lock seats');
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

      setSelectedSeatIds([]);
      setIsLocking(false);

      // ✅ Only for current user
      if (lockedByUserId === 'user-1') {
        // STEP A: fetch TTL from backend (single seat is enough)
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/seats/lock/${seatIds[0]}/ttl`
        );
        const data = await res.json();

        setPaymentTTL(data.ttl);
        setShowPaymentUI(true);

        // STEP B: create payment session
        const { url } = await createPaymentSession(seatIds, eventId as string);

        // small delay so user sees countdown (UX polish)
        setTimeout(() => {
          window.location.href = url;
        }, 800);
      }
    });

    socket.on('seat:unlocked', ({ seatIds }) => {
      setSeats((prev) => {
        const next = { ...prev };
        for (const id of seatIds) {
          if (!next[id]) continue;
          next[id] = {
            ...next[id],
            status: 'AVAILABLE',
            lockedByUserId: null,
          };
        }
        return next;
      });
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
    });

    return () => {
      socket.off('seat:locked');
      socket.off('seat:unlocked');
      socket.off('seat:booked');
    };
  }, [eventId]);

  if (loading) {
    return <div>Loading seats...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Screen />

      <SeatMap
        seats={Object.values(seats)}
        selectedSeatIds={selectedSeatIds}
        isLocking={isLocking || showPaymentUI}
        onToggleSeat={toggleSeat}
        currentUserId="user-1"
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
      />

      <SeatLegend />
    </div>
  );
}
