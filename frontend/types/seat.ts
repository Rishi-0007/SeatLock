export type SeatStatus = 'AVAILABLE' | 'SELECTED' | 'LOCKED' | 'BOOKED';

export type SeatDTO = {
  id: string;
  row: string;
  number: number;
  status: SeatStatus;
};
