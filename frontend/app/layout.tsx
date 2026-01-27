'use client';

import { useEffect } from 'react';
import { getSocket } from '../lib/socket';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const socket = getSocket();

    socket.on('connect', () => {
      console.log('🟢 Socket connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('🔴 Socket disconnected');
    });

    socket.on('seat:locked', (payload) => {
      console.log('🔒 Seats locked:', payload);
    });

    socket.on('seat:booked', (payload) => {
      console.log('✅ Seats booked:', payload);
    });

    socket.on('seat:unlocked', (payload) => {
      console.log('🔓 Seats unlocked:', payload);
    });

    socket.onAny((event, payload) => {
      console.log('📡 Socket event:', event, payload);
    });

    return () => {
      socket.off();
    };
  }, []);

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
