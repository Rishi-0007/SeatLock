type Props = {
  disabled: boolean;
  onLock: () => void;
  user: { id: string } | null;
};

export function ProceedToPaymentBar({ disabled, onLock, user }: Props) {
  return (
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
              {user ? 'Ready to book?' : 'Login to continue'}
            </p>
            <p className="text-xs text-[var(--foreground-muted)] opacity-60 mt-0.5">
              Seats are held for 5 minutes after booking
            </p>
          </div>
          
          {/* CTA Button */}
          <button
            disabled={disabled}
            onClick={onLock}
            className={`
              relative group flex items-center gap-2 px-8 py-3.5 rounded-xl text-white font-bold text-base
              transition-all duration-300 overflow-hidden
              ${disabled 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:scale-105 hover:shadow-[0_0_30px_rgba(14,165,233,0.4)] active:scale-100'
              }
            `}
            style={{
              background: disabled 
                ? 'rgba(100, 116, 139, 0.5)' 
                : 'var(--gradient-brand)',
              boxShadow: disabled ? 'none' : '0 0 20px rgba(14, 165, 233, 0.3)',
            }}
          >
            {/* Shine effect */}
            {!disabled && (
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            )}
            
            {/* Icon */}
            <span className="relative">
              {user ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              )}
            </span>
            
            {/* Text */}
            <span className="relative">
              {user ? 'Acquire Lock' : 'Login to Lock'}
            </span>
            
            {/* Arrow */}
            <svg className="relative w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
