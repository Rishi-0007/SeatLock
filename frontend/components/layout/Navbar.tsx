'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { logoutApi } from '@/lib/api';
import { AuthModal } from '../auth/AuthModal';
import { useState } from 'react';

export function Navbar() {
  const { user, setUser } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  async function handleLogout() {
    try {
      await logoutApi();
      setUser(null);
    } catch (err) {
      console.error('Logout failed', err);
    }
  }

  return (
    <>
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            {/* Left: Brand */}
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                SeatLock
              </Link>
            </div>

            {/* Right: Auth Status */}
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                      {user.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm font-medium text-gray-700 hidden sm:block">
                      {user.name}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-gray-500 hover:text-gray-900"
                  >
                    Logout
                  </button>
                  <Link
                    href="/me/bookings"
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                     My Bookings
                  </Link>
                </>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="rounded bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                >
                  Login
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
