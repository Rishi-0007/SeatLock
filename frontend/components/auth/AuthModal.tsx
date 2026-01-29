'use client';

import { useState, useEffect } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

type Props = {
  open: boolean;
  onClose: () => void;
};

export function AuthModal({ open, onClose }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setIsVisible(true);
    } else {
      // Delay hiding for exit animation
      const timer = setTimeout(() => setIsVisible(false), 200);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!isVisible && !open) return null;

  return (
    <div 
      className={`
        fixed inset-0 z-50 flex items-center justify-center p-4
        transition-all duration-300 ease-out
        ${open ? 'opacity-100' : 'opacity-0'}
      `}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'rgba(3, 0, 20, 0.85)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      />

      {/* Modal */}
      <div 
        className={`
          relative w-full max-w-md
          transition-all duration-300 ease-out
          ${open ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}
        `}
      >
        {/* Gradient border glow */}
        <div 
          className="absolute -inset-[1px] rounded-2xl opacity-50"
          style={{
            background: 'var(--gradient-brand)',
            filter: 'blur(8px)',
          }}
        />
        
        {/* Modal content */}
        <div 
          className="relative rounded-2xl p-8 overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, rgba(30, 27, 75, 0.95) 0%, rgba(15, 10, 60, 0.98) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg text-[var(--foreground-muted)] hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <div 
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
              style={{
                background: 'var(--gradient-brand)',
                boxShadow: '0 0 30px rgba(14, 165, 233, 0.3)',
              }}
            >
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mode === 'login' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                )}
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-sm text-[var(--foreground-muted)] mt-1">
              {mode === 'login' 
                ? 'Sign in to continue booking' 
                : 'Join us to start booking seats'}
            </p>
          </div>

          {/* Form */}
          {mode === 'login' ? (
            <LoginForm onSuccess={onClose} />
          ) : (
            <RegisterForm onSuccess={onClose} />
          )}

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 text-[var(--foreground-muted)]" style={{ background: 'rgb(20, 15, 55)' }}>
                {mode === 'login' ? 'New to SeatLock?' : 'Already have an account?'}
              </span>
            </div>
          </div>

          {/* Toggle mode */}
          <button
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="w-full py-3 rounded-xl text-sm font-semibold text-[var(--brand-secondary)] border border-[var(--brand-secondary)]/30 hover:bg-[var(--brand-secondary)]/10 transition-all duration-200"
          >
            {mode === 'login' ? 'Create an account' : 'Sign in instead'}
          </button>
        </div>
      </div>
    </div>
  );
}
