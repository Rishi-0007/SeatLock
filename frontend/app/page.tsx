'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchAllEvents } from '@/lib/api';
import { SkeletonCard } from '@/components/ui/SkeletonCard';

type Event = {
  id: string;
  name: string;
  date: string;
  imageUrl?: string;
};

export default function LandingPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllEvents()
      .then((data) => setEvents(data.events))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        {/* Background Effects */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--brand-secondary)] rounded-full blur-[150px] opacity-20" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[var(--brand-accent)] rounded-full blur-[150px] opacity-15" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] text-sm text-[var(--foreground-muted)] mb-6 animate-fade-in-down">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Live seat availability • Real-time booking
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 animate-fade-in-up">
            Book Your Perfect
            <span className="block mt-2 gradient-text">
              Cinema Experience
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-[var(--foreground-muted)] mb-10 animate-fade-in" style={{ animationDelay: '200ms' }}>
            Real-time seat selection with instant confirmation. 
            No double bookings, no hassle — just seamless entertainment.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 sm:gap-12 animate-fade-in" style={{ animationDelay: '400ms' }}>
            {[
              { value: '50K+', label: 'Tickets Booked' },
              { value: '99.9%', label: 'Uptime' },
              { value: '4.9★', label: 'User Rating' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-[var(--foreground-muted)]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Now Showing</h2>
            <p className="text-[var(--foreground-muted)] mt-1">Book your seats for the latest releases</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Live availability
          </div>
        </div>
        
        {loading ? (
          /* Loading Skeletons */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : events.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎬</div>
            <p className="text-[var(--foreground-muted)] text-lg">No events currently available.</p>
            <p className="text-sm text-[var(--foreground-muted)] mt-2">Check back soon for new releases!</p>
          </div>
        ) : (
          /* Event Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, index) => (
              <Link 
                href={`/events/${event.id}`} 
                key={event.id} 
                className="group block animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div 
                  className="relative h-full rounded-xl overflow-hidden border border-[rgba(255,255,255,0.05)] transition-all duration-500 hover:-translate-y-2 hover:border-[rgba(14,165,233,0.3)]"
                  style={{
                    background: 'var(--card-bg)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                  }}
                >
                  {/* Image Container */}
                  <div className="relative h-56 overflow-hidden">
                    {event.imageUrl ? (
                      <>
                        <img
                          src={event.imageUrl}
                          alt={event.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[var(--brand-primary)] via-transparent to-transparent opacity-80" />
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full bg-[var(--background-secondary)]">
                        <span className="text-6xl opacity-30">🎬</span>
                      </div>
                    )}

                    {/* Date Badge */}
                    <div 
                      className="absolute top-4 right-4 px-3 py-1.5 rounded-lg text-xs font-bold text-white backdrop-blur-md"
                      style={{
                        background: 'rgba(0,0,0,0.5)',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    >
                      {new Date(event.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-[var(--brand-secondary)] opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                  </div>
                  
                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-white group-hover:text-[var(--brand-secondary)] transition-colors duration-300 line-clamp-1">
                      {event.name}
                    </h3>
                    
                    <div className="flex items-center gap-4 mt-3 text-sm text-[var(--foreground-muted)]">
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
                        {new Date(event.date).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    
                    {/* CTA */}
                    <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.05)] flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="text-emerald-400 text-xs font-medium">Available</span>
                      </div>
                      <span 
                        className="flex items-center gap-1 text-sm font-semibold text-[var(--brand-secondary)] group-hover:gap-2 transition-all duration-300"
                      >
                        Book Now
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
