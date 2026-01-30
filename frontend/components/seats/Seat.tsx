const COLORS = {
  AVAILABLE: {
    base: '#475569',       /* Slate 600 */
    hover: '#64748b',      /* Slate 500 */
    gradient: 'linear-gradient(145deg, #64748b 0%, #475569 100%)',
  },
  SELECTED: {
    base: '#3b82f6',       /* Blue 500 */
    glow: 'rgba(59, 130, 246, 0.5)',
    gradient: 'linear-gradient(145deg, #60a5fa 0%, #3b82f6 100%)',
  },
  LOCKED: {
    base: '#f59e0b',       /* Amber 500 */
    glow: 'rgba(245, 158, 11, 0.4)',
    gradient: 'linear-gradient(145deg, #fbbf24 0%, #f59e0b 100%)',
  },
  BOOKED: {
    base: '#be123c',       /* Rose 700 */
    gradient: 'linear-gradient(145deg, #e11d48 0%, #be123c 100%)',
  },
};

type SeatProps = {
  label: number;
  status: 'AVAILABLE' | 'SELECTED' | 'LOCKED' | 'BOOKED';
  isMine?: boolean;
  onClick?: () => void;
};

export function Seat({ label, status, isMine, onClick }: SeatProps) {
  const isClickable = status === 'AVAILABLE' || status === 'SELECTED';
  const isDisabled = (status === 'LOCKED' && !isMine) || status === 'BOOKED';
  
  const colorSet = COLORS[status] || COLORS.AVAILABLE;
  const fillColor = status === 'LOCKED' && isMine ? COLORS.LOCKED.base : colorSet.base;

  // Glow effect for selected or my locked seats
  const hasGlow = status === 'SELECTED' || (status === 'LOCKED' && isMine);
  const glowColor = status === 'SELECTED' ? COLORS.SELECTED.glow : COLORS.LOCKED.glow;

  return (
    <div
      onClick={isClickable ? onClick : undefined}
      className={`
        relative group
        transition-all duration-300 ease-out
        ${isClickable ? 'cursor-pointer hover:-translate-y-1' : ''}
        ${isDisabled ? 'cursor-not-allowed opacity-50' : ''}
      `}
      style={{
        pointerEvents: isDisabled ? 'none' : 'auto',
      }}
    >
      {/* Glow effect layer */}
      {hasGlow && (
        <div
          className="absolute inset-0 rounded-lg blur-md -z-10 animate-pulse"
          style={{
            background: glowColor,
            opacity: 0.6,
          }}
        />
      )}
      
      <svg
        width="42"
        height="42"
        viewBox="0 0 42 42"
        className="drop-shadow-lg"
      >
        <defs>
          <linearGradient id={`seat-grad-${label}-${status}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: status === 'AVAILABLE' ? '#64748b' : status === 'SELECTED' ? '#60a5fa' : status === 'LOCKED' ? '#fbbf24' : '#e11d48' }} />
            <stop offset="100%" style={{ stopColor: fillColor }} />
          </linearGradient>
          
          {/* Inner shadow for 3D effect */}
          <filter id={`inner-shadow-${label}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
            <feOffset dx="0" dy="2" in="blur" result="offsetBlur" />
            <feComposite in="SourceGraphic" in2="offsetBlur" operator="over" />
          </filter>
        </defs>
        
        {/* Seat Back */}
        <rect
          x="5"
          y="4"
          width="32"
          height="20"
          rx="5"
          fill={`url(#seat-grad-${label}-${status})`}
          className="transition-all duration-300"
          style={{
            filter: isClickable ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' : 'none',
          }}
        />
        
        {/* Seat Back Highlight */}
        <rect
          x="7"
          y="6"
          width="28"
          height="6"
          rx="3"
          fill="rgba(255,255,255,0.15)"
        />
        
        {/* Seat Base */}
        <rect
          x="8"
          y="26"
          width="26"
          height="8"
          rx="4"
          fill={`url(#seat-grad-${label}-${status})`}
          className="transition-all duration-300"
        />
        
        {/* Seat Base Highlight */}
        <rect
          x="10"
          y="27"
          width="22"
          height="3"
          rx="1.5"
          fill="rgba(255,255,255,0.1)"
        />
        
        {/* Left Armrest */}
        <rect
          x="2"
          y="16"
          width="4"
          height="18"
          rx="2"
          fill={fillColor}
          opacity="0.8"
        />
        
        {/* Right Armrest */}
        <rect
          x="36"
          y="16"
          width="4"
          height="18"
          rx="2"
          fill={fillColor}
          opacity="0.8"
        />
        
        {/* Seat Number */}
        <text
          x="21"
          y="18"
          textAnchor="middle"
          fontSize="11"
          fill="white"
          fontWeight="700"
          fontFamily="var(--font-sans)"
          className="select-none pointer-events-none"
          style={{
            textShadow: '0 1px 3px rgba(0,0,0,0.5)',
          }}
        >
          {label}
        </text>
        
        {/* Mine indicator - subtle border */}
        {isMine && status === 'LOCKED' && (
          <rect
            x="4"
            y="3"
            width="34"
            height="32"
            rx="6"
            fill="none"
            stroke="white"
            strokeWidth="1.5"
            strokeDasharray="4 2"
            opacity="0.6"
          />
        )}
      </svg>
    </div>
  );
}
