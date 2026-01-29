'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

// function ConfettiPiece({ delay, left, color }: { delay: number; left: number; color: string }) {
//   return (
//     <div
//       className="confetti-piece"
//       style={{
//         left: `${left}%`,
//         background: color,
//         animationDelay: `${delay}s`,
//         borderRadius: Math.random() > 0.5 ? '50%' : '2px',
//         transform: `rotate(${Math.random() * 360}deg)`,
//       }}
//     />
//   );
// }

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_BASE}/payments/verify-session?sessionId=${sessionId}`)
      .then((res) => {
        if (res.ok) {
          setStatus('success');
          setShowConfetti(true);
          // Stop confetti after animation
          setTimeout(() => setShowConfetti(false), 4000);
        } else {
          setStatus('error');
        }
      })
      .catch(() => setStatus('error'));
  }, [sessionId]);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center animate-fade-in">
          <div 
            className="h-16 w-16 mx-auto mb-6 rounded-full border-4 border-[var(--brand-secondary)]/30 border-t-[var(--brand-secondary)]"
            style={{ animation: 'spin 1s linear infinite' }}
          />
          <h2 className="text-xl font-semibold text-white mb-2">Finalizing your booking</h2>
          <p className="text-[var(--foreground-muted)]">Please wait while we confirm your seats...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div 
          className="max-w-md w-full p-8 rounded-2xl text-center animate-fade-in-up"
          style={{
            background: 'rgba(15, 10, 60, 0.6)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }}
          >
            <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Something Went Wrong</h1>
          <p className="text-[var(--foreground-muted)] mb-6">
            We couldn't verify your payment. If you were charged, please contact our support team.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105"
              style={{
                background: 'var(--gradient-brand)',
                boxShadow: '0 0 20px rgba(14, 165, 233, 0.3)',
              }}
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const confettiColors = ['#0ea5e9', '#a855f7', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 relative overflow-hidden">
      {/* Confetti
      {showConfetti && (
        <div className="confetti-container">
          {Array.from({ length: 50 }).map((_, i) => (
            <ConfettiPiece
              key={i}
              delay={Math.random() * 0.5}
              left={Math.random() * 100}
              color={confettiColors[Math.floor(Math.random() * confettiColors.length)]}
            />
          ))}
        </div>
      )} */}

      {/* Success Card */}
      <div 
        className="max-w-md w-full p-8 rounded-2xl text-center animate-scale-in relative z-10"
        style={{
          background: 'rgba(15, 10, 60, 0.7)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 60px rgba(16, 185, 129, 0.1)',
        }}
      >
        {/* Success Icon */}
        <div className="relative mb-6">
          <div 
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto"
            style={{
              background: 'linear-gradient(145deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.3) 100%)',
              border: '2px solid rgba(16, 185, 129, 0.4)',
              boxShadow: '0 0 40px rgba(16, 185, 129, 0.3)',
            }}
          >
            <svg className="w-12 h-12 text-emerald-400 animate-fade-in" style={{ animationDelay: '300ms' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">Booking Confirmed!</h1>
        <p className="text-[var(--foreground-muted)] mb-6">
          Your seats have been successfully booked. Get ready for an amazing experience!
        </p>

        {/* Ticket Preview */}
        <div 
          className="p-4 rounded-xl mb-6 text-left"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--gradient-brand)' }}
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">Confirmation ID</p>
              <p className="text-white font-mono text-sm">{sessionId?.slice(0, 20)}...</p>
            </div>
          </div>
          <p className="text-xs text-[var(--foreground-muted)]">
            📧 A confirmation email has been sent to your registered email address.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/me/bookings"
            className="flex-1 px-6 py-3 rounded-xl font-semibold text-white text-center transition-all duration-300 hover:scale-105"
            style={{
              background: 'var(--gradient-brand)',
              boxShadow: '0 0 20px rgba(14, 165, 233, 0.3)',
            }}
          >
            View My Bookings
          </Link>
          <Link
            href="/"
            className="flex-1 px-6 py-3 rounded-xl font-semibold text-[var(--foreground-muted)] text-center border border-[rgba(255,255,255,0.1)] transition-all duration-200 hover:bg-white/5 hover:text-white"
          >
            Browse More Events
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div 
          className="h-12 w-12 rounded-full border-4 border-[var(--brand-secondary)]/30 border-t-[var(--brand-secondary)]"
          style={{ animation: 'spin 1s linear infinite' }}
        />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
