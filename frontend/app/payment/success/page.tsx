'use client';

import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      return;
    }

    // Call backend to verify and book seats
    fetch(`${process.env.NEXT_PUBLIC_API_BASE}/payments/verify-session?sessionId=${sessionId}`)
      .then((res) => {
        if (res.ok) setStatus('success');
        else setStatus('error');
      })
      .catch(() => setStatus('error'));
  }, [sessionId]);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Finalizing your booking...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
     return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
           <div className="p-8 bg-white rounded-lg shadow-md text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-2">Something went wrong</h1>
              <p className="text-gray-600 mb-4">We couldn't verify your payment. Please contact support.</p>
              <Link href="/" className="inline-block bg-black text-white px-6 py-2 rounded">
                 Back to Home
              </Link>
           </div>
        </div>
     );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-md text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Payment Successful!
        </h1>
        <p className="text-gray-600 mb-6">
          Your seats have been successfully booked.
          <br />
          <span className="text-sm text-gray-400">
            Session ID: {sessionId?.slice(0, 10)}...
          </span>
        </p>
        <Link
          href="/"
          className="inline-block bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors"
        >
          Return to Events
        </Link>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
   return (
      <Suspense fallback={<div>Loading...</div>}>
         <SuccessContent />
      </Suspense>
   );
}
