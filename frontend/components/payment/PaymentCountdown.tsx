'use client';

import { useState, useEffect } from 'react';

type Props = {
  initialSeconds: number;
};

export function PaymentCountdown({ initialSeconds }: Props) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  // Internal countdown timer
  useEffect(() => {
    if (secondsLeft <= 0) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  
  // Determine urgency level
  const isUrgent = secondsLeft <= 60;
  const isCritical = secondsLeft <= 30;

  // Calculate progress (assuming 5 min = 300 sec max)
  const maxTime = initialSeconds;
  const progress = (secondsLeft / maxTime) * 126;

  return (
    <div 
      className={`
        flex items-center gap-4 p-4 rounded-xl transition-all duration-500
        ${isCritical ? 'countdown-urgent' : ''}
      `}
      style={{
        background: isCritical 
          ? 'rgba(239, 68, 68, 0.15)' 
          : isUrgent 
            ? 'rgba(245, 158, 11, 0.15)' 
            : 'rgba(14, 165, 233, 0.1)',
        border: `1px solid ${
          isCritical 
            ? 'rgba(239, 68, 68, 0.3)' 
            : isUrgent 
              ? 'rgba(245, 158, 11, 0.3)' 
              : 'rgba(14, 165, 233, 0.2)'
        }`,
      }}
    >
      {/* Timer Icon with ring */}
      <div className="relative">
        <svg className="w-14 h-14" viewBox="0 0 56 56">
          {/* Background circle */}
          <circle
            cx="28"
            cy="28"
            r="24"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="4"
          />
          {/* Progress circle */}
          <circle
            cx="28"
            cy="28"
            r="24"
            fill="none"
            stroke={isCritical ? '#ef4444' : isUrgent ? '#f59e0b' : '#0ea5e9'}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${progress} 151`}
            transform="rotate(-90 28 28)"
            className="transition-all duration-1000"
          />
          {/* Timer icon in center */}
          <g transform="translate(18, 18)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isCritical ? '#ef4444' : isUrgent ? '#f59e0b' : '#0ea5e9'} strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </g>
        </svg>
      </div>
      
      {/* Timer Text */}
      <div>
        <div 
          className="text-3xl font-bold font-mono tracking-wide"
          style={{
            color: isCritical ? '#ef4444' : isUrgent ? '#f59e0b' : '#0ea5e9',
          }}
        >
          {minutes}:{seconds.toString().padStart(2, '0')}
        </div>
        <div className="text-sm text-[var(--foreground-muted)]">
          {secondsLeft === 0
            ? 'Time expired! Seats released.'
            : isCritical 
              ? 'Hurry! Seats will be released soon' 
              : isUrgent 
                ? 'Complete payment before time runs out' 
                : 'Time remaining to complete payment'}
        </div>
      </div>
    </div>
  );
}
