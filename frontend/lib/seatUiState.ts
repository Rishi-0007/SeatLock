import { Seat } from '@/types/seat';

export type SeatUIStatus =
  | 'AVAILABLE'
  | 'SELECTED'
  | 'LOCKED'
  | 'BOOKED';

export function getSeatUIStatus(
  seat: Seat,
  selectedSeatIds: string[],
  currentUserId: string
): SeatUIStatus {
  if (seat.status === 'BOOKED') return 'BOOKED';
  if (seat.status === 'LOCKED') return 'LOCKED';
  if (selectedSeatIds.includes(seat.id)) return 'SELECTED';
  return 'AVAILABLE';
}
