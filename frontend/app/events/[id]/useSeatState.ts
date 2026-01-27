import { SeatDTO, SeatStatus } from '@/types/seat';

type SeatMap = Record<string, SeatDTO>;

export function updateSeats(
  prev: SeatMap,
  seatIds: string[],
  status: SeatStatus
): SeatMap {
  const next = { ...prev };

  for (const id of seatIds) {
    if (!next[id]) continue;
    next[id] = { ...next[id], status };
  }

  return next;
}
