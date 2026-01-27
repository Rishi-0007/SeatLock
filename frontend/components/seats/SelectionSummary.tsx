import { SeatDTO } from '@/types/seat';

type Props = {
  selectedSeatIds: string[];
  seats: SeatDTO[];
};

export function SelectionSummary({ selectedSeatIds, seats }: Props) {
  if (selectedSeatIds.length === 0) return null;

  const selectedSeats = seats.filter((s) => selectedSeatIds.includes(s.id));

  const label = selectedSeats.map((s) => `${s.row}${s.number}`).join(', ');

  return (
    <div className="mt-6 p-4 border rounded-md bg-gray-50">
      <div className="text-sm text-gray-600">Selected Seats</div>
      <div className="mt-1 font-semibold">{label}</div>
    </div>
  );
}
