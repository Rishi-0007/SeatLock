type LegendItem = {
  label: string;
  color: string;
  gradient: string;
};

const LEGEND: LegendItem[] = [
  { 
    label: 'Available', 
    color: '#64748b',
    gradient: 'linear-gradient(145deg, #64748b 0%, #475569 100%)',
  },
  { 
    label: 'Selected', 
    color: '#3b82f6',
    gradient: 'linear-gradient(145deg, #60a5fa 0%, #3b82f6 100%)',
  },
  { 
    label: 'Held', 
    color: '#f59e0b',
    gradient: 'linear-gradient(145deg, #fbbf24 0%, #f59e0b 100%)',
  },
  { 
    label: 'Booked', 
    color: '#be123c',
    gradient: 'linear-gradient(145deg, #e11d48 0%, #be123c 100%)',
  },
];

export function SeatLegend() {
  return (
    <div 
      className="flex flex-wrap justify-center gap-6 mt-8 p-4 rounded-xl animate-fade-in"
      style={{
        background: 'rgba(15, 10, 60, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        animationDelay: '400ms',
      }}
    >
      {LEGEND.map((item) => (
        <div key={item.label} className="flex items-center gap-2.5">
          {/* Mini seat icon */}
          <div className="relative">
            <svg width="24" height="24" viewBox="0 0 24 24">
              <defs>
                <linearGradient id={`legend-${item.label}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: item.color }} stopOpacity="1" />
                  <stop offset="100%" style={{ stopColor: item.color }} stopOpacity="0.7" />
                </linearGradient>
              </defs>
              {/* Seat back */}
              <rect 
                x="3" y="3" width="18" height="11" rx="3" 
                fill={`url(#legend-${item.label})`}
              />
              {/* Seat base */}
              <rect 
                x="5" y="15" width="14" height="5" rx="2" 
                fill={`url(#legend-${item.label})`}
              />
            </svg>
          </div>
          <span className="text-sm font-medium text-[var(--foreground-muted)]">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
