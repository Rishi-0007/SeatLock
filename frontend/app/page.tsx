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

// SVG Icons for each step
const StepIcons = {
  select: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
    </svg>
  ),
  lock: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  broadcast: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
    </svg>
  ),
  pay: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  webhook: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  timeout: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

// Helper to get "tomorrow at 12:00 PM" for demo purposes
function getTomorrowNoon() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(12, 0, 0, 0);
  return tomorrow;
}

export default function LandingPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const demoDate = getTomorrowNoon();

  useEffect(() => {
    fetchAllEvents()
      .then((data) => setEvents(data.events))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const flowSteps = [
    { icon: 'select', label: 'Select Seat', tech: 'Next.js', step: 1 },
    { icon: 'lock', label: 'Lock in DB + Redis TTL', tech: 'PostgreSQL + Redis', step: 2 },
    { icon: 'broadcast', label: 'Broadcast Lock', tech: 'Socket.io', step: 3 },
    { icon: 'pay', label: 'Pay', tech: 'Stripe Checkout', step: 4 },
    { icon: 'webhook', label: 'Confirm via Webhook', tech: 'Stripe Webhook', step: 5 },
    { icon: 'timeout', label: 'Timeout = Auto-Unlock', tech: 'Background Worker', step: 6 },
  ];

  const techStack = [
    { name: 'Next.js', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg' },
    { name: 'TypeScript', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg' },
    { name: 'PostgreSQL', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg' },
    { name: 'Redis', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg' },
    { name: 'Socket.io', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/socketio/socketio-original.svg' },
    { name: 'Prisma', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/prisma/prisma-original.svg' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-16 sm:py-20 border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-5">
            SeatLock
          </h1>
          <p className="text-lg sm:text-xl text-[var(--foreground-muted)] max-w-2xl mx-auto leading-relaxed mb-8">
            A distributed seat reservation engine with TTL-based locking, 
            real-time updates, and webhook-driven payment confirmation.
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/test"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Run Concurrency Test
            </Link>
            <a
              href="https://github.com/Rishi-0007/SeatLock"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/20 text-white font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              View Code
            </a>
          </div>
        </div>
      </section>

      {/* Architecture Flow */}
      <section className="py-12 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-8 text-center">
            How It Works
          </h2>
          
          <div className="flex flex-wrap justify-center items-start gap-5">
            {flowSteps.map((item, i, arr) => (
              <div key={item.step} className="flex items-center gap-5">
                <div className="flex flex-col items-center text-center w-28">
                  <div className="w-14 h-14 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white mb-2">
                    {StepIcons[item.icon as keyof typeof StepIcons]}
                  </div>
                  <div className="text-xs text-white font-medium leading-tight">
                    <span className="text-white/40 mr-1">{item.step}.</span>
                    {item.label}
                  </div>
                  <div className="text-[11px] text-white/40 mt-1">{item.tech}</div>
                </div>
                {i < arr.length - 1 && (
                  <div className="text-white/20 text-xl hidden sm:block">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack with Logos */}
      <section className="py-10 border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-6 text-center">
            Tech Stack
          </h2>
          <div className="flex flex-wrap justify-center gap-6">
            {techStack.map((tech) => (
              <div key={tech.name} className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center p-2.5">
                  <img 
                    src={tech.logo} 
                    alt={tech.name} 
                    className="w-8 h-8 object-contain"
                    style={{ filter: tech.name === 'Next.js' || tech.name === 'Socket.io' || tech.name === 'Prisma' ? 'invert(1)' : 'none' }}
                  />
                </div>
                <span className="text-xs text-white/50">{tech.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Events */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-lg font-bold text-white mb-2">Try the Demo</h2>
        <p className="text-sm text-[var(--foreground-muted)] mb-6">
          Select an event below to test the booking flow.
        </p>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 text-[var(--foreground-muted)]">
            No events available.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {events.map((event) => (
              <Link 
                href={`/events/${event.id}`} 
                key={event.id} 
                className="group block"
              >
                <div 
                  className="relative rounded-lg overflow-hidden border border-white/10 hover:border-white/20 transition-colors"
                  style={{ background: 'var(--card-bg)' }}
                >
                  {/* Image */}
                  <div className="h-44 overflow-hidden">
                    {event.imageUrl ? (
                      <img
                        src={event.imageUrl}
                        alt={event.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-white/5">
                        <span className="text-4xl opacity-30">🎬</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-white text-base">{event.name}</h3>
                    <div className="text-sm text-white/50 mt-1">
                      {demoDate.toLocaleDateString('en-US', { 
                        weekday: 'short',
                        month: 'short', 
                        day: 'numeric',
                      })}, {demoDate.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </div>
                    <div className="mt-3 text-sm text-white/60 group-hover:text-white/80 transition-colors">
                      Select Seats →
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Footer Note */}
      <section className="py-8 text-center border-t border-white/5">
        <p className="text-sm text-white/30 mb-2">
          Built to demonstrate distributed locking, real-time sync, and webhook handling.
        </p>
        <p className="text-sm text-white/40">
          Built by{' '}
          <a 
            href="https://www.linkedin.com/in/rishi-nayak-51b1a821a" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white/60 hover:text-white underline underline-offset-2 transition-colors"
          >
            Rishi Nayak
          </a>
        </p>
      </section>
    </div>
  );
}
