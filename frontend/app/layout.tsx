'use client';

import { useEffect } from 'react';
import { getSocket } from '../lib/socket';
import { AuthProvider } from '@/context/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Toaster } from 'sonner';
import './globals.css';

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body>
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
          <Toaster richColors position="top-center" />
        </AuthProvider>
      </body>
    </html>
  );
}
