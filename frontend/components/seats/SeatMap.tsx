import { Seat } from './Seat';
import { SeatDTO } from '@/types/seat';

type SeatMapProps = {
  seats: SeatDTO[];
  selectedSeatIds: string[];
  isLocking: boolean;
  onToggleSeat: (seatId: string) => void;
};

export function SeatMap({
  seats,
  selectedSeatIds,
  isLocking,
  onToggleSeat,
}: SeatMapProps) {
  const seatsByRow = seats.reduce<Record<string, SeatDTO[]>>((acc, seat) => {
    acc[seat.row] = acc[seat.row] || [];
    acc[seat.row].push(seat);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-3">
      {Object.entries(seatsByRow).map(([row, rowSeats]) => (
        <div key={row} className="flex items-center gap-3">
          <div className="w-6 font-semibold">{row}</div>

          <div className="flex gap-2">
            {rowSeats.map((seat) => (
              <Seat
                key={seat.id}
                label={seat.number}
                status={
                  selectedSeatIds.includes(seat.id) ? 'SELECTED' : seat.status
                }
                onClick={isLocking ? undefined : () => onToggleSeat(seat.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
