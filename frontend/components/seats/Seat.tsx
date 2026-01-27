type SeatStatus = 'AVAILABLE' | 'SELECTED' | 'LOCKED' | 'BOOKED';

type SeatProps = {
  label: number;
  status: SeatStatus;
  onClick?: () => void;
};

const COLORS: Record<SeatStatus, string> = {
  AVAILABLE: '#22c55e', // green
  SELECTED: '#3b82f6', // blue
  LOCKED: '#facc15', // yellow
  BOOKED: '#ef4444', // red
};

export function Seat({ label, status, onClick }: SeatProps) {
  const isClickable = status === 'AVAILABLE' || status === 'SELECTED';
  const isDisabled = status === 'LOCKED' || status === 'BOOKED';

  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 36 36"
      onClick={isClickable ? onClick : undefined}
      style={{
        cursor: isClickable ? 'pointer' : 'not-allowed',
        opacity: isDisabled ? 0.6 : 1,
        pointerEvents: isDisabled ? 'none' : 'auto',
      }}
    >
      {/* Backrest */}
      <rect x="4" y="5" width="28" height="18" rx="4" fill={COLORS[status]} />

      {/* Seat base */}
      <rect x="8" y="25" width="20" height="6" rx="3" fill={COLORS[status]} />

      {/* Seat number */}
      <text
        x="18"
        y="18"
        textAnchor="middle"
        fontSize="9"
        fill="black"
        fontWeight="bold"
      >
        {label}
      </text>
    </svg>
  );
}
