'use client';

import { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

type Props = {
  open: boolean;
  onClose: () => void;
};

export function AuthModal({ open, onClose }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg bg-white p-6">
        <h2 className="text-xl font-semibold mb-4">
          {mode === 'login' ? 'Login to continue' : 'Create an account'}
        </h2>

        {mode === 'login' ? (
          <LoginForm onSuccess={onClose} />
        ) : (
          <RegisterForm onSuccess={onClose} />
        )}

        <div className="mt-4 text-sm text-center">
          {mode === 'login' ? (
            <>
              Don’t have an account?{' '}
              <button
                className="text-blue-600 underline"
                onClick={() => setMode('register')}
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                className="text-blue-600 underline"
                onClick={() => setMode('login')}
              >
                Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
