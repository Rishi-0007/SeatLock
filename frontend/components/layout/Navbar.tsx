'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { logoutApi } from '@/lib/api';
import { AuthModal } from '../auth/AuthModal';
import { useState } from 'react';

export function Navbar() {
  const { user, setUser } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logoutApi();
      setUser(null);
    } catch (err) {
      console.error('Logout failed', err);
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-[rgba(255,255,255,0.05)] backdrop-blur-xl bg-[rgba(3,0,20,0.8)]">
        {/* Gradient accent line at top */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--brand-secondary)] to-transparent opacity-50" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            {/* Left: Brand */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3 group">
                {/* Logo with glow effect */}
                <div className="relative">
                  <div className="absolute inset-0 bg-[var(--brand-secondary)] rounded-lg blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
                  <img 
                    src="/seatlock-logo.png" 
                    alt="SeatLock Logo" 
                    className="relative h-12 w-12 object-contain transition-transform duration-300 group-hover:scale-110" 
                  />
                </div>
                
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-white tracking-tight group-hover:text-[var(--brand-secondary)] transition-colors duration-300">
                    SeatLock
                  </span>
                  <span className="text-[10px] text-[var(--foreground-muted)] tracking-widest uppercase -mt-1">
                    Premium Booking
                  </span>
                </div>
              </Link>
            </div>

            {/* Right: Auth Status */}
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  {/* My Bookings Link */}
                  <Link
                    href="/me/bookings"
                    className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-[var(--foreground-muted)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                    My Bookings
                  </Link>

                  {/* User Avatar & Menu */}
                  <div className="flex items-center gap-3 pl-3 border-l border-[rgba(255,255,255,0.1)]">
                    <div className="flex items-center gap-2">
                      {/* Avatar */}
                      <div 
                        className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
                        style={{
                          background: 'var(--gradient-brand)',
                        }}
                      >
                        {user.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      
                      <div className="hidden sm:block">
                        <div className="text-sm font-medium text-white leading-tight">
                          {user.name}
                        </div>
                        <div className="text-xs text-[var(--foreground-muted)]">
                          {user.email?.split('@')[0]}
                        </div>
                      </div>
                    </div>
                    
                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--foreground-muted)] hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 disabled:opacity-50"
                    >
                      {isLoggingOut ? (
                        <div className="h-3 w-3 border border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                      )}
                      <span className="hidden sm:inline">Logout</span>
                    </button>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="relative group px-6 py-2.5 rounded-lg text-sm font-bold text-white overflow-hidden transition-all duration-300 hover:scale-105 active:scale-100"
                  style={{
                    background: 'var(--gradient-brand)',
                    boxShadow: '0 0 20px rgba(14, 165, 233, 0.3)',
                  }}
                >
                  {/* Shine effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  <span className="relative">Get Started</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
