import { Seat } from '@/types/seat';

export type SeatUIStatus =
  | 'AVAILABLE'
  | 'SELECTED'
  | 'LOCKED_BY_ME'
  | 'LOCKED_BY_OTHER'
  | 'BOOKED';

export function getSeatUIStatus(
  seat: Seat,
  selectedSeatIds: string[],
  currentUserId: string
): SeatUIStatus {
  if (seat.status === 'BOOKED') return 'BOOKED';

  if (seat.status === 'LOCKED') {
    return seat.lockedByUserId === currentUserId
      ? 'LOCKED_BY_ME'
      : 'LOCKED_BY_OTHER';
  }

  if (selectedSeatIds.includes(seat.id)) return 'SELECTED';

  return 'AVAILABLE';
}
