import { Seat } from '@/types/seat';

type Props = {
  selectedSeatIds: string[];
  seats: Seat[];
};

export function SelectionSummary({ selectedSeatIds, seats }: Props) {
  if (selectedSeatIds.length === 0) return null;

  const selectedSeats = seats.filter((s) => selectedSeatIds.includes(s.id));

  const label = selectedSeats.map((s) => `${s.row}${s.number}`).join(', ');

  const count = selectedSeats.length;
  const pricePerSeat = 300;
  const totalPrice = count * pricePerSeat;

  return (
    <div className="mt-6 p-4 border rounded-md bg-gray-50 flex justify-between items-center">
      <div>
         <div className="text-sm text-gray-600">Selected Seats</div>
         <div className="mt-1 font-semibold">{label}</div>
      </div>
      <div className="text-right">
         <div className="text-sm text-gray-600">Price</div>
         <div className="mt-1 font-bold text-lg">
            ₹{pricePerSeat} × {count} = <span className="text-blue-600">₹{totalPrice}</span>
         </div>
      </div>
    </div>
  );
}
