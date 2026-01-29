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
import { LoadingScreen } from '@/components/ui/LoadingSpinner';

// Concurrency Demo Imports
import { GlobalStatsBar } from '@/components/concurrency/GlobalStatsBar';
import { SystemPanel } from '@/components/concurrency/SystemPanel';
import { ConcurrencyControls } from '@/components/concurrency/ConcurrencyControls';
import { useConcurrencyMock } from '@/hooks/useConcurrencyMock';

type EventData = {
  name: string;
  date: string;
  imageUrl?: string;
};

export default function EventSeatsPage() {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [seats, setSeats] = useState<Record<string, Seat>>({});
  const [event, setEvent] = useState<EventData | null>(null);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [isLocking, setIsLocking] = useState(false);
  const [loading, setLoading] = useState(true);

  const [paymentTTL, setPaymentTTL] = useState<number | null>(null);
  const [showPaymentUI, setShowPaymentUI] = useState(false);

  const { id: eventId } = useParams();

  // Concurrency Mock Logic
  const allSeatIds = Object.keys(seats);
  const { modeState, setModeState, events: lockEvents, seatStates } = useConcurrencyMock(allSeatIds);

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

    if (!user) {
      setPostAuthAction({
        type: 'BOOK_SEATS',
        seatIds: selectedSeatIds,
        eventId: eventId as string,
      });
      setShowAuthModal(true);
      return;
    }

    setIsLocking(true);

    try {
      await lockSeatsApi(selectedSeatIds);
      
      const { url } = await createPaymentSession(selectedSeatIds, eventId as string);
      
      const newWindow = window.open(url, '_blank');
      
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        // Popup blocked - could show manual link
      }

      setShowPaymentUI(true);
      
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

  const showPaymentUIRef = useRef(showPaymentUI);
  useEffect(() => { showPaymentUIRef.current = showPaymentUI; }, [showPaymentUI]);

  const userRef = useRef(user);
  useEffect(() => { userRef.current = user; }, [user]);


  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on('seat:locked', async ({ seatIds, lockedByUserId }) => {
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

      if (lockedByUserId === userRef.current?.id) {
         setSelectedSeatIds([]);
         setIsLocking(false);
      } else {
         setSelectedSeatIds(prev => prev.filter(id => !seatIds.includes(id)));
      }
    });

    socket.on('seat:unlocked', ({ seatIds }) => {
      let expiredForMe = false;

      setSeats((prev) => {
        const next = { ...prev };
        for (const id of seatIds) {
          if (!next[id]) continue;
          
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
  }, [eventId]);

  if (loading) {
    return <LoadingScreen message="Loading seats..." />;
  }

  return (
    <div className="min-h-screen pb-24 relative">
      {/* Global Live Stats Bar */}
      <GlobalStatsBar state={modeState} />

      {/* System Side Panel */}
      <SystemPanel events={lockEvents} modeState={modeState} />

      {/* Event Header with Image Backdrop */}
      {event && (
        <div className="relative h-64 sm:h-80 overflow-hidden">
          {/* Background Image */}
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt={event.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div 
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(135deg, var(--brand-primary) 0%, var(--background) 100%)',
              }}
            />
          )}
          
          {/* Gradient Overlay */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to bottom, rgba(3,0,20,0.3) 0%, rgba(3,0,20,0.7) 50%, var(--background) 100%)',
            }}
          />
          
          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 max-w-4xl mx-auto">
            <div 
              className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white mb-3"
              style={{
                background: 'rgba(16, 185, 129, 0.8)',
                backdropFilter: 'blur(4px)',
              }}
            >
              🎬 IMAX Experience
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 animate-fade-in-up">
              SeatLock — Guaranteed seat allocation
            </h1>
            <p className="text-white/60 text-lg mb-6 max-w-2xl">
                Visual demo of real-time seat contention and lock resolution under extreme concurrency.
            </p>
            
            {/* Aha Moment Explainer - Only in Concurrency Mode */}
            {modeState.isEnabled && (
                <div className="mb-8 p-4 bg-indigo-500/10 border border-indigo-400/30 rounded-lg max-w-xl animate-fade-in-up">
                    <div className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-1">Why SeatLock Exists</div>
                    <p className="text-sm text-indigo-100/90 leading-relaxed">
                        In high-traffic systems, thousands of users may attempt to reserve the same resource at the exact same millisecond. 
                        SeatLock enforces <span className="text-white font-bold">strict locking and conflict resolution</span> to guarantee safe, single ownership under any load.
                    </p>
                </div>
            )}
            
            {/* Controls */}
            <div className="mb-4">
                <ConcurrencyControls 
                    state={modeState}
                    onToggleMode={(val) => setModeState(p => ({ ...p, isEnabled: val }))}
                    onToggleComparison={(val) => setModeState(p => ({ ...p, showComparison: val }))}
                    onRunTest={() => setModeState(p => ({ ...p, activeUsers: p.activeUsers + 500 }))}
                />
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                IMAX Mumbai
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date(event.date).toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {new Date(event.date).toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Screen />

        <SeatMap
          seats={Object.values(seats)}
          selectedSeatIds={selectedSeatIds}
          isLocking={isLocking || showPaymentUI}
          onToggleSeat={toggleSeat}
          currentUserId={user?.id || ''}
          concurrencyStates={seatStates}
          showComparison={modeState.showComparison}
        />

        <SelectionSummary
          seats={Object.values(seats)}
          selectedSeatIds={selectedSeatIds}
        />

        {showPaymentUI && paymentTTL !== null && (
          <div className="mt-6">
            <PaymentCountdown initialSeconds={paymentTTL} />
          </div>
        )}

        <SeatLegend />
      </div>

      <ProceedToPaymentBar
        disabled={selectedSeatIds.length === 0 || isLocking || showPaymentUI}
        onLock={handleProceedToPayment}
        user={user}
      />

      <AuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}
