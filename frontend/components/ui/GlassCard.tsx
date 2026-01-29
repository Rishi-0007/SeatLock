import { ReactNode } from 'react';

type GlassCardProps = {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
};

const paddingSizes = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function GlassCard({ 
  children, 
  className = '', 
  hover = false,
  gradient = false,
  padding = 'md',
}: GlassCardProps) {
  const baseClasses = `
    rounded-xl 
    backdrop-blur-xl 
    border 
    transition-all 
    duration-300
    ${paddingSizes[padding]}
  `;
  
  const glassClasses = `
    bg-[rgba(15,10,60,0.6)]
    border-[rgba(255,255,255,0.08)]
    shadow-[0_8px_32px_rgba(0,0,0,0.4)]
  `;
  
  const hoverClasses = hover ? `
    hover:-translate-y-1
    hover:border-[rgba(14,165,233,0.3)]
    hover:shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_30px_rgba(14,165,233,0.1)]
    cursor-pointer
  ` : '';
  
  const gradientBorderClasses = gradient ? 'gradient-border' : '';

  return (
    <div className={`${baseClasses} ${glassClasses} ${hoverClasses} ${gradientBorderClasses} ${className}`}>
      {children}
    </div>
  );
}
