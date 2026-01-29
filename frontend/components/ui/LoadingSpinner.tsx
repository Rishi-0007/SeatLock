type LoadingSpinnerProps = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const sizes = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  return (
    <div className={`relative ${sizes[size]} ${className}`}>
      {/* Outer ring */}
      <div 
        className="absolute inset-0 rounded-full border-2 border-transparent"
        style={{
          borderTopColor: 'var(--brand-secondary)',
          borderRightColor: 'rgba(14, 165, 233, 0.3)',
          animation: 'spin 1s linear infinite',
        }}
      />
      {/* Inner glow */}
      <div 
        className="absolute inset-1 rounded-full opacity-30"
        style={{
          background: 'radial-gradient(circle, var(--brand-secondary) 0%, transparent 70%)',
        }}
      />
    </div>
  );
}

export function LoadingScreen({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-foreground-muted text-sm animate-pulse">{message}</p>
    </div>
  );
}
