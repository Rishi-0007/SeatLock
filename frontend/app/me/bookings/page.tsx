'use client';

import { useEffect, useState } from 'react';
import { fetchMyBookings } from '@/lib/api';
import Link from 'next/link';
import { LoadingScreen } from '@/components/ui/LoadingSpinner';

type Booking = {
  id: string;
  eventName: string;
  seatNumber: string;
  date: string;
  status: string;
};

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyBookings()
      .then((data) => setBookings(data.bookings))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingScreen message="Loading your bookings..." />;

  return (
    <div className="min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Bookings</h1>
          <p className="text-[var(--foreground-muted)]">
            Your upcoming events and ticket history
          </p>
        </div>

        {bookings.length === 0 ? (
          /* Empty State */
          <div 
            className="text-center py-16 rounded-2xl animate-fade-in"
            style={{
              background: 'rgba(15, 10, 60, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <div className="text-6xl mb-4">🎟️</div>
            <h2 className="text-xl font-semibold text-white mb-2">No bookings yet</h2>
            <p className="text-[var(--foreground-muted)] mb-6">
              Start your entertainment journey by booking your first event!
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105"
              style={{
                background: 'var(--gradient-brand)',
                boxShadow: '0 0 20px rgba(14, 165, 233, 0.3)',
              }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Browse Events
            </Link>
          </div>
        ) : (
          /* Bookings List */
          <div className="space-y-4">
            {bookings.map((booking, index) => (
              <div
                key={booking.id}
                className="relative rounded-2xl overflow-hidden animate-fade-in-up"
                style={{
                  background: 'rgba(15, 10, 60, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Left: Ticket stub with perforation */}
                  <div 
                    className="sm:w-24 p-4 flex sm:flex-col items-center justify-center gap-2 sm:gap-0 text-center relative"
                    style={{
                      background: 'var(--gradient-brand)',
                    }}
                  >
                    <div className="text-3xl sm:text-4xl font-bold text-white">
                      {new Date(booking.date).getDate()}
                    </div>
                    <div className="text-xs font-semibold text-white/80 uppercase tracking-wider">
                      {new Date(booking.date).toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                    {/* Perforation effect */}
                    <div 
                      className="hidden sm:block absolute right-0 top-0 bottom-0 w-4 ticket-edge"
                      style={{ backgroundPositionX: '8px' }}
                    />
                  </div>

                  {/* Right: Ticket details */}
                  <div className="flex-1 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">
                        {booking.eventName}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--foreground-muted)]">
                        <span className="flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          IMAX Mumbai
                        </span>
                        <span className="flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {new Date(booking.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Seat Badge */}
                      <div 
                        className="px-4 py-2 rounded-lg text-center"
                        style={{
                          background: 'rgba(59, 130, 246, 0.15)',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                        }}
                      >
                        <div className="text-xs text-blue-400 font-medium">SEAT</div>
                        <div className="text-lg font-bold text-white">{booking.seatNumber}</div>
                      </div>

                      {/* Status Badge */}
                      <span 
                        className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide"
                        style={{
                          background: booking.status === 'CONFIRMED' || booking.status === 'confirmed' 
                            ? 'rgba(16, 185, 129, 0.15)' 
                            : 'rgba(245, 158, 11, 0.15)',
                          color: booking.status === 'CONFIRMED' || booking.status === 'confirmed' 
                            ? '#10b981' 
                            : '#f59e0b',
                          border: `1px solid ${booking.status === 'CONFIRMED' || booking.status === 'confirmed' 
                            ? 'rgba(16, 185, 129, 0.3)' 
                            : 'rgba(245, 158, 11, 0.3)'}`,
                        }}
                      >
                        {booking.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* QR Code Placeholder Area */}
                <div 
                  className="px-5 py-3 flex items-center justify-between text-xs"
                  style={{
                    background: 'rgba(0, 0, 0, 0.2)',
                    borderTop: '1px dashed rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <span className="text-[var(--foreground-muted)]">
                    Booking ID: <span className="font-mono text-white">{booking.id.slice(0, 8).toUpperCase()}</span>
                  </span>
                  <span className="text-[var(--foreground-muted)]">
                    Show this ticket at entry
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
