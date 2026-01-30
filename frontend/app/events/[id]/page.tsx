'use client';

import { Screen } from '@/components/seats/Screen';
import { SeatLegend } from '@/components/seats/SeatLegend';
import { SeatMap } from '../../../components/seats/SeatMap';
import { Seat } from '@/types/seat';
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

type EventData = {
  name: string;
  date: string;
  imageUrl?: string;
};

// Helper to get "tomorrow at 12:00 PM" for demo purposes
function getTomorrowNoon() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(12, 0, 0, 0);
  return tomorrow;
}

export default function EventSeatsPage() {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [seats, setSeats] = useState<Record<string, Seat>>({});
  const [event, setEvent] = useState<EventData | null>(null);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [isLocking, setIsLocking] = useState(false);
  const [loading, setLoading] = useState(true);

  const [paymentTTL, setPaymentTTL] = useState<number | null>(null);
  const [seatsLocked, setSeatsLocked] = useState(false);
  const [lockedSeatIds, setLockedSeatIds] = useState<string[]>([]);
  const [isRedirecting, setIsRedirecting] = useState(false);

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

  // Step 1: Lock seats only
  async function handleLockSeats() {
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
      
      // Get TTL for countdown
      const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/seats/lock/${selectedSeatIds[0]}/ttl`
      );
      const data = await res.json();
      setPaymentTTL(data.ttl);
      setLockedSeatIds([...selectedSeatIds]);
      setSeatsLocked(true);
      setSelectedSeatIds([]);

    } catch (error) {
      console.error(error);
      alert('Failed to lock seats');
    } finally {
      setIsLocking(false);
    }
  }

  // Step 2: Redirect to Stripe payment
  async function handleProceedToPayment() {
    if (lockedSeatIds.length === 0) return;
    
    setIsRedirecting(true);

    try {
      const { url } = await createPaymentSession(lockedSeatIds, eventId as string);
      
      const newWindow = window.open(url, '_blank');
      
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        // Popup blocked - fallback to same window
        window.location.href = url;
      }
    } catch (error) {
      console.error(error);
      alert('Failed to create payment session');
      setIsRedirecting(false);
    }
  }

  useEffect(() => {
    if (!user) return;

    const action = getPostAuthAction();
    if (!action) return;

    if (action.type === 'BOOK_SEATS') {
      clearPostAuthAction();
      handleLockSeats();
    }
  }, [user]);

  const seatsLockedRef = useRef(seatsLocked);
  useEffect(() => { seatsLockedRef.current = seatsLocked; }, [seatsLocked]);

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

      // If locked by someone else, remove from selection
      if (lockedByUserId !== userRef.current?.id) {
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

      if (expiredForMe && seatsLockedRef.current) {
          alert('Your seat lock expired. Please select again.');
          setSeatsLocked(false);
          setLockedSeatIds([]);
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

      // If my seats were booked, reset state
      if (seatsLockedRef.current) {
         setSeatsLocked(false);
         setLockedSeatIds([]);
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

  // Get my locked seats for display
  const myLockedSeats = Object.values(seats).filter(
    s => s.status === 'LOCKED' && s.lockedByUserId === user?.id
  );

  return (
    <div className="min-h-screen pb-24">
      {/* Event Header */}
      {event && (
        <div className="relative h-48 sm:h-56 overflow-hidden">
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
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {event.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {getTomorrowNoon().toLocaleDateString('en-US', { 
                  weekday: 'short',
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {getTomorrowNoon().toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit',
                  hour12: true
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
          isLocking={isLocking || seatsLocked}
          onToggleSeat={toggleSeat}
          currentUserId={user?.id || ''}
        />

        {/* Selection Summary - only when selecting */}
        {!seatsLocked && selectedSeatIds.length > 0 && (
          <SelectionSummary
            seats={Object.values(seats)}
            selectedSeatIds={selectedSeatIds}
          />
        )}

        {/* Locked Seats Summary + Countdown + Pay Button */}
        {seatsLocked && paymentTTL !== null && (
          <div className="mt-6 p-6 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">
                  Seats Locked
                </h3>
                <p className="text-sm text-white/60 mb-2">
                  {myLockedSeats.map(s => `${s.row}${s.number}`).join(', ')}
                </p>
                <PaymentCountdown initialSeconds={paymentTTL} />
              </div>
              
              <button
                onClick={handleProceedToPayment}
                disabled={isRedirecting}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors disabled:opacity-50"
              >
                {isRedirecting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Redirecting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Proceed to Payment
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        <SeatLegend />
      </div>

      {/* Bottom Bar - Only when selecting (not locked) */}
      {!seatsLocked && (
        <div 
          className="fixed bottom-0 left-0 right-0 z-40 animate-slide-up"
          style={{
            background: 'rgba(3, 0, 20, 0.9)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              {/* Left side info */}
              <div className="hidden sm:block">
                <p className="text-sm text-[var(--foreground-muted)]">
                  {user ? 'Select seats to book' : 'Login to continue'}
                </p>
                <p className="text-xs text-[var(--foreground-muted)] opacity-60 mt-0.5">
                  Seats are held for 5 minutes after booking
                </p>
              </div>
              
              {/* CTA Button */}
              <button
                disabled={selectedSeatIds.length === 0 || isLocking}
                onClick={user ? handleLockSeats : () => setShowAuthModal(true)}
                className={`
                  relative group flex items-center gap-2 px-8 py-3.5 rounded-xl text-white font-bold text-base
                  transition-all duration-300 overflow-hidden
                  ${selectedSeatIds.length === 0 || isLocking
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:scale-105 hover:shadow-[0_0_30px_rgba(14,165,233,0.4)] active:scale-100'
                  }
                `}
                style={{
                  background: selectedSeatIds.length === 0 || isLocking
                    ? 'rgba(100, 116, 139, 0.5)' 
                    : 'var(--gradient-brand)',
                  boxShadow: selectedSeatIds.length === 0 || isLocking ? 'none' : '0 0 20px rgba(14, 165, 233, 0.3)',
                }}
              >
                {/* Shine effect */}
                {selectedSeatIds.length > 0 && !isLocking && (
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                )}
                
                {/* Icon */}
                <span className="relative">
                  {isLocking ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : user ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                  )}
                </span>
                
                {/* Text */}
                <span className="relative">
                  {isLocking ? 'Locking...' : user ? 'Book Seats' : 'Login to Book'}
                </span>
                
                {/* Arrow */}
                <svg className="relative w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <AuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}
