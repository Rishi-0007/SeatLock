'use client';

import { Screen } from '@/components/seats/Screen';
import { SeatLegend } from '@/components/seats/SeatLegend';
import { SeatMap } from '../../../components/seats/SeatMap';
import { SeatDTO } from '@/types/seat';
import { LockSeatsBar } from '@/components/seats/LockSeatsBar';
import { SelectionSummary } from '@/components/seats/SelectionSummary';
import { useEffect, useState } from 'react';
import { lockSeatsApi } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { updateSeats } from './useSeatState';

const mockSeats: SeatDTO[] = [
  { id: '1', row: 'A', number: 1, status: 'AVAILABLE' },
  { id: '2', row: 'A', number: 2, status: 'LOCKED' },
  { id: '3', row: 'A', number: 3, status: 'BOOKED' },
  { id: '4', row: 'B', number: 1, status: 'AVAILABLE' },
  { id: '5', row: 'B', number: 2, status: 'AVAILABLE' },
];

export default function EventSeatsPage() {
  const [seats, setSeats] = useState<Record<string, SeatDTO>>(() =>
    Object.fromEntries(mockSeats.map((seat) => [seat.id, seat]))
  );
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [isLocking, setIsLocking] = useState(false);

  function toggleSeat(seatId: string) {
    setSelectedSeatIds((prev) =>
      prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId]
    );
  }

  async function handleLockSeats() {
    if (selectedSeatIds.length === 0) return;

    // 1️⃣ Disable UI immediately
    setIsLocking(true);

    try {
      // 2️⃣ Call backend
      await lockSeatsApi(selectedSeatIds);

      // 3️⃣ Success
      // ❌ Do NOT change colors
      // ❌ Do NOT unlock UI
      // We wait for socket confirmation next
      console.log('Lock request accepted by backend');
    } catch (error) {
      console.error(error);

      // 4️⃣ Backend rejected → rollback UI
      setIsLocking(false);

      // Seats stay SELECTED (blue)
      alert('Failed to lock seats. Please try again.');
    }
  }

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on('seat:locked', ({ seatIds }) => {
      setSeats((prev) => updateSeats(prev, seatIds, 'LOCKED'));
      setIsLocking(false);
      setSelectedSeatIds([]);
    });

    socket.on('seat:unlocked', ({ seatIds }) => {
      setSeats((prev) => updateSeats(prev, seatIds, 'AVAILABLE'));
    });

    socket.on('seat:booked', ({ seatIds }) => {
      setSeats((prev) => updateSeats(prev, seatIds, 'BOOKED'));
    });

    return () => {
      socket.off('seat:locked');
      socket.off('seat:unlocked');
      socket.off('seat:booked');
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Screen />

      <SeatMap
        seats={Object.values(seats)}
        selectedSeatIds={selectedSeatIds}
        isLocking={isLocking}
        onToggleSeat={toggleSeat}
      />

      <SelectionSummary
        seats={Object.values(seats)}
        selectedSeatIds={selectedSeatIds}
      />

      <LockSeatsBar
        disabled={selectedSeatIds.length === 0 || isLocking}
        onLock={handleLockSeats}
      />

      <SeatLegend />
    </div>
  );
}
