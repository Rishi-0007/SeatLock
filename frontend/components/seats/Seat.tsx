const COLORS = {
  AVAILABLE: '#22c55e',
  SELECTED: '#3b82f6',
  LOCKED: '#9ca3af', // Default locked (grey)
  BOOKED: '#ef4444',
};

type SeatProps = {
  label: number;
  status: 'AVAILABLE' | 'SELECTED' | 'LOCKED' | 'BOOKED';
  isMine?: boolean;
  onClick?: () => void;
};

export function Seat({ label, status, isMine, onClick }: SeatProps) {
  const isClickable = status === 'AVAILABLE' || status === 'SELECTED';
  // Disabled if locked by someone else OR booked
  const isDisabled = (status === 'LOCKED' && !isMine) || status === 'BOOKED';
  
  // Logic for fill color:
  // - If LOCKED and MINE -> Yellow (#facc15)
  // - Else use standard map
  const fillColor = status === 'LOCKED' && isMine ? '#facc15' : COLORS[status] || COLORS.AVAILABLE;

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
        // Optional: Add glow if locked by me
        filter: status === 'LOCKED' && isMine ? 'drop-shadow(0 0 4px #facc15)' : 'none',
        transition: 'all 0.2s ease'
      }}
    >
      {/* Backrest */}
      <rect 
         x="4" y="5" width="28" height="18" rx="4" 
         fill={fillColor} 
         stroke={isMine ? '#000' : 'none'} 
         strokeWidth={isMine ? 2 : 0} 
      />

      {/* Seat base */}
      <rect 
         x="8" y="25" width="20" height="6" rx="3" 
         fill={fillColor} 
         stroke={isMine ? '#000' : 'none'} 
         strokeWidth={isMine ? 2 : 0}
      />

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
