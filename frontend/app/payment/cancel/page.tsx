import Link from 'next/link';

export default function PaymentCancelPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div 
        className="max-w-md w-full p-8 rounded-2xl text-center animate-fade-in-up"
        style={{
          background: 'rgba(15, 10, 60, 0.6)',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* Icon */}
        <div 
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
          }}
        >
          <svg className="w-10 h-10 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-white mb-3">Payment Cancelled</h1>
        <p className="text-[var(--foreground-muted)] mb-6">
          No worries! Your payment was cancelled and you haven't been charged. 
          Your selected seats are still reserved for a few more minutes.
        </p>

        {/* Timer hint */}
        <div 
          className="flex items-center justify-center gap-2 p-3 rounded-lg mb-6 text-sm"
          style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.2)',
          }}
        >
          <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-amber-300">Your seats will be released in a few minutes</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="flex-1 px-6 py-3 rounded-xl font-semibold text-white text-center transition-all duration-300 hover:scale-105"
            style={{
              background: 'var(--gradient-brand)',
              boxShadow: '0 0 20px rgba(14, 165, 233, 0.3)',
            }}
          >
            Try Again
          </Link>
          <Link
            href="/"
            className="flex-1 px-6 py-3 rounded-xl font-semibold text-[var(--foreground-muted)] text-center border border-[rgba(255,255,255,0.1)] transition-all duration-200 hover:bg-white/5 hover:text-white"
          >
            Browse Events
          </Link>
        </div>

        {/* Help text */}
        <p className="text-xs text-[var(--foreground-muted)] mt-6">
          Having trouble? <a href="mailto:support@seatlock.com" className="text-[var(--brand-secondary)] hover:underline">Contact Support</a>
        </p>
      </div>
    </div>
  );
}
