export type SeatStatus = 'AVAILABLE' | 'LOCKED' | 'BOOKED';

export type Seat = {
  id: string;
  row: string;
  number: number;
  status: SeatStatus;
  lockedByUserId?: string | null;
};
