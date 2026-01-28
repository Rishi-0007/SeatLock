'use client';

import { Screen } from '@/components/seats/Screen';
import { SeatLegend } from '@/components/seats/SeatLegend';
import { SeatMap } from '../../../components/seats/SeatMap';
import { Seat } from '@/types/seat';
import { LockSeatsBar } from '@/components/seats/LockSeatsBar';
import { SelectionSummary } from '@/components/seats/SelectionSummary';
import { useEffect, useState } from 'react';
import { fetchEventWithSeats, lockSeatsApi } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { useParams } from 'next/navigation';

export default function EventSeatsPage() {
  const [seats, setSeats] = useState<Record<string, Seat>>({});
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [isLocking, setIsLocking] = useState(false);
  const [loading, setLoading] = useState(true);

  const { id: eventId } = useParams();

  useEffect(() => {
    async function loadEvent() {
      try {
        const data = await fetchEventWithSeats(eventId as string);

        const seatMap = Object.fromEntries(
          data.seats.map((seat: Seat) => [seat.id, seat])
        );

        setSeats(seatMap);
        // later: setEvent(data.event)
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [eventId]);

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

    socket.on('seat:locked', ({ seatIds, lockedByUserId }) => {
      setSeats((prev) => {
        const next = { ...prev };
        for (const id of seatIds) {
          if (!next[id]) continue;
          next[id] = {
            ...next[id],
            status: 'LOCKED',
            lockedByUserId,
          };
        }
        return next;
      });

      setIsLocking(false);
      setSelectedSeatIds([]);
    });

    socket.on('seat:unlocked', ({ seatIds }) => {
      setSeats((prev) => {
        const next = { ...prev };
        for (const id of seatIds) {
          if (!next[id]) continue;
          next[id] = {
            ...next[id],
            status: 'AVAILABLE',
            lockedByUserId: null,
          };
        }
        return next;
      });
    });

    socket.on('seat:booked', ({ seatIds }) => {
      setSeats((prev) => {
        const next = { ...prev };
        for (const id of seatIds) {
          if (!next[id]) continue;
          next[id] = {
            ...next[id],
            status: 'BOOKED',
            lockedByUserId: null,
          };
        }
        return next;
      });
    });

    return () => {
      socket.off('seat:locked');
      socket.off('seat:unlocked');
      socket.off('seat:booked');
    };
  }, []);

  if (loading) {
    return <div>Loading seats...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Screen />

      <SeatMap
        seats={Object.values(seats)}
        selectedSeatIds={selectedSeatIds}
        isLocking={isLocking}
        onToggleSeat={toggleSeat}
        currentUserId="user-1"
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
