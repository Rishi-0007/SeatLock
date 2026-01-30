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

  // Sort rows alphabetically
  const sortedRows = Object.entries(seatsByRow).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="relative py-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
      {/* Seat grid container */}
      <div 
        className="flex flex-col items-center gap-3 p-6 rounded-2xl"
        style={{
          background: 'rgba(15, 10, 60, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        {sortedRows.map(([row, rowSeats]) => (
          <div key={row} className="flex items-center gap-4">
            {/* Row label - Left */}
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-[var(--foreground-muted)]"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              {row}
            </div>

            {/* Seats */}
            <div className="flex gap-2">
              {rowSeats.map((seat, index) => {
                const uiStatus = getSeatUIStatus(
                  seat,
                  selectedSeatIds,
                  currentUserId
                );
                
                // Add aisle spacing after seat 4 (middle aisle)
                const hasAisle = index === Math.floor(rowSeats.length / 2) - 1;

                return (
                  <div 
                    key={seat.id} 
                    className={hasAisle ? 'mr-6' : ''}
                  >
                    <Seat
                      label={seat.number}
                      status={uiStatus}
                      isMine={seat.lockedByUserId === currentUserId}
                      onClick={
                        isLocking
                          ? undefined
                          : () => onToggleSeat(seat.id)
                      }
                    />
                  </div>
                );
              })}
            </div>

            {/* Row label - Right */}
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-[var(--foreground-muted)]"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              {row}
            </div>
          </div>
        ))}
      </div>
      
      {/* Aisle indicators */}
      <div className="flex justify-center gap-8 mt-4 text-xs text-[var(--foreground-muted)] opacity-50">
        <span>← Left Aisle</span>
        <span>Right Aisle →</span>
      </div>
    </div>
  );
}
