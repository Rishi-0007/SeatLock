import { SeatConcurrencyState } from '@/types/concurrency';
import { toast } from 'sonner';

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
  CONTENDED: {
     base: '#ef4444',      /* Red 500 */
     glow: 'rgba(239, 68, 68, 0.6)',
     gradient: 'linear-gradient(145deg, #f87171 0%, #ef4444 100%)',
  }
};

type SeatProps = {
  label: number;
  status: 'AVAILABLE' | 'SELECTED' | 'LOCKED' | 'BOOKED';
  isMine?: boolean;
  onClick?: () => void;
  // Concurrency Mock Props
  concurrencyData?: SeatConcurrencyState;
  showComparison?: boolean; // If true (SeatLock enabled), we handle conflicts gracefully. If false (Legacy), show chaos.
};

export function Seat({ label, status, isMine, onClick, concurrencyData, showComparison = true }: SeatProps) {
  // Override status if contended
  let displayStatus: 'AVAILABLE' | 'SELECTED' | 'LOCKED' | 'BOOKED' | 'CONTENDED' = status;
  if (concurrencyData?.isContended) {
      // In "Legacy" mode, contention looks like a double-booking or error (Red). 
      // In "SeatLock" mode, contention is handled, maybe just show Locked or a specific "High Demand" color.
      // For visual storytelling: 
      // Legacy -> CONTENDED (Red/Chaos)
      // SeatLock -> LOCKED (Amber/Safe) but maybe pulsing faster? 
      // Let's make "With SeatLock" show it as LOCKED but with extra info in tooltip.
      // "Without SeatLock" shows it as CONTENDED panic mode.
      
      if (!showComparison) { // Legacy Mode
          displayStatus = 'CONTENDED';
      } else {
        // With SeatLock, it just stays LOCKED or whatever it is, but we might add a subtle pulse
      }
  }

  const isClickable = status === 'AVAILABLE' || status === 'SELECTED';
  const isDisabled = (status === 'LOCKED' && !isMine) || status === 'BOOKED';
  
  const colorSet = COLORS[displayStatus as keyof typeof COLORS] || COLORS.AVAILABLE;
  const fillColor = status === 'LOCKED' && isMine ? COLORS.LOCKED.base : colorSet.base;
  const gradient = status === 'LOCKED' && isMine ? COLORS.LOCKED.gradient : colorSet.gradient;

  // Glow effect for selected or my locked seats OR contended legacy
  const hasGlow = status === 'SELECTED' || (status === 'LOCKED' && isMine) || displayStatus === 'CONTENDED';
  const glowColor = status === 'SELECTED' ? COLORS.SELECTED.glow : 
                    displayStatus === 'CONTENDED' ? COLORS.CONTENDED.glow : 
                    COLORS.LOCKED.glow;

  const handleClick = () => {
      if (isDisabled) {
         if (status === 'LOCKED') {
             toast.error('Seat temporarily locked by another user');
         } else if (status === 'BOOKED') {
             toast.error('Seat already booked');
         }
         return;
      }
      onClick?.();
  };

  return (
    <div
      onClick={handleClick}
      className={`
        relative group flex-shrink-0
        transition-all duration-300 ease-out
        ${isClickable ? 'cursor-pointer hover:-translate-y-0.5' : ''}
        ${status === 'AVAILABLE' ? 'opacity-60 hover:opacity-100 scale-95 hover:scale-100' : 'scale-100'}
        ${isDisabled ? 'cursor-not-allowed opacity-80' : ''}
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
            opacity: displayStatus === 'CONTENDED' ? 0.8 : 0.6,
            animationDuration: displayStatus === 'CONTENDED' ? '0.5s' : '2s'
          }}
        />
      )}

      {/* Contention Ripple Effect */}
      {displayStatus === 'CONTENDED' && (
         <span className="absolute inline-flex h-full w-full rounded-lg bg-rose-500 opacity-20 animate-ping" />
      )}
      
      {/* Tooltip for Concurrency Stats */}
      {concurrencyData && (concurrencyData.attemptCount > 0 || concurrencyData.isContended) && (
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur text-white text-[10px] p-2 rounded pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 border border-white/20">
              <div className="font-bold mb-0.5">Seat {label}</div>
              <div>Attempts: <span className="text-amber-400">{concurrencyData.attemptCount}</span></div>
              {concurrencyData.isContended && (
                  <div className="text-rose-400 font-bold uppercase tracking-wider mt-1">{!showComparison ? 'Race Condition!' : 'Conflict Reserved'}</div>
              )}
          </div>
      )}
      
      <svg
        width="38"
        height="38"
        viewBox="0 0 42 42"
        className="drop-shadow-lg"
      >
        <defs>
          <linearGradient id={`seat-grad-${label}-${displayStatus}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: displayStatus === 'AVAILABLE' ? '#64748b' : displayStatus === 'SELECTED' ? '#60a5fa' : displayStatus === 'LOCKED' ? '#fbbf24' : displayStatus === 'BOOKED' ? '#e11d48' : '#ef4444' }} />
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
          fill={`url(#seat-grad-${label}-${displayStatus})`}
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
          fill={`url(#seat-grad-${label}-${displayStatus})`}
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
