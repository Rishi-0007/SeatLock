import { Seat as SeatType } from '@/types/seat';
import { Seat } from './Seat';
import { getSeatUIStatus } from '@/lib/seatUiState';

type SeatMapProps = {
  seats: SeatType[];
  selectedSeatIds: string[];
  isLocking: boolean;
  onToggleSeat: (seatId: string) => void;
  currentUserId: string;
};

export function SeatMap({
  seats,
  selectedSeatIds,
  isLocking,
  onToggleSeat,
  currentUserId,
}: SeatMapProps) {
  const seatsByRow = seats.reduce<Record<string, SeatType[]>>((acc, seat) => {
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
            {rowSeats.map((seat) => {
              const uiStatus = getSeatUIStatus(
                seat,
                selectedSeatIds,
                currentUserId
              );

              return (
                <Seat
                  key={seat.id}
                  label={seat.number}
                  status={uiStatus}
                  isMine={seat.lockedByUserId === currentUserId}
                  onClick={
                    isLocking || uiStatus !== 'AVAILABLE'
                      ? undefined
                      : () => onToggleSeat(seat.id)
                  }
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
