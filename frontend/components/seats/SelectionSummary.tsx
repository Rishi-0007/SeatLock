import { Seat } from '@/types/seat';

type Props = {
  selectedSeatIds: string[];
  seats: Seat[];
};

export function SelectionSummary({ selectedSeatIds, seats }: Props) {
  if (selectedSeatIds.length === 0) return null;

  const selectedSeats = seats.filter((s) => selectedSeatIds.includes(s.id));
  const count = selectedSeats.length;
  const pricePerSeat = 300;
  const totalPrice = count * pricePerSeat;

  return (
    <div 
      className="mt-6 rounded-xl overflow-hidden animate-fade-in-up"
      style={{
        background: 'rgba(15, 10, 60, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      }}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[var(--foreground-muted)] uppercase tracking-wider">
            Your Selection
          </h3>
          <span className="text-xs text-[var(--brand-secondary)] font-medium">
            {count} {count === 1 ? 'seat' : 'seats'}
          </span>
        </div>

        {/* Selected Seats Chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedSeats.map((seat) => (
            <div 
              key={seat.id}
              className="px-3 py-1.5 rounded-lg text-sm font-bold text-white flex items-center gap-1.5"
              style={{
                background: 'linear-gradient(145deg, #60a5fa 0%, #3b82f6 100%)',
                boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)',
              }}
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
              </svg>
              {seat.row}{seat.number}
            </div>
          ))}
        </div>

        {/* Price Breakdown */}
        <div 
          className="pt-4 border-t"
          style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}
        >
          <div className="flex justify-between items-center text-sm text-[var(--foreground-muted)]">
            <span>Price per seat</span>
            <span>₹{pricePerSeat}</span>
          </div>
          <div className="flex justify-between items-center text-sm text-[var(--foreground-muted)] mt-1">
            <span>Quantity</span>
            <span>× {count}</span>
          </div>
          
          {/* Total */}
          <div 
            className="flex justify-between items-center mt-3 pt-3 border-t"
            style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}
          >
            <span className="text-white font-semibold">Total</span>
            <span 
              className="text-xl font-bold"
              style={{
                background: 'var(--gradient-brand)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              ₹{totalPrice.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
