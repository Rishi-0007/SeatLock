'use client';

import { useEffect, useState } from 'react';
import { fetchMyBookings } from '@/lib/api';
import Link from 'next/link';

type Booking = {
  id: string;
  eventName: string;
  seatNumber: string;
  date: string;
  status: string;
};

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyBookings()
      .then((data) => setBookings(data.bookings))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading bookings...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Bookings</h1>

      {bookings.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">You haven't booked any tickets yet.</p>
          <Link href="/" className="text-blue-600 hover:underline">
            Browse Events
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {bookings.map((booking) => (
              <li key={booking.id}>
                <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                  <div>
                    <div className="text-lg font-medium text-blue-600 truncate">
                      {booking.eventName}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                       <span className="mr-4">💺 Seat: {booking.seatNumber}</span>
                       <span>🗓 {new Date(booking.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {booking.status}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
