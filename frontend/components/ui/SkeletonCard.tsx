type SkeletonCardProps = {
  className?: string;
};

export function SkeletonCard({ className = '' }: SkeletonCardProps) {
  return (
    <div className={`rounded-xl overflow-hidden ${className}`} style={{ background: 'var(--card-bg)' }}>
      {/* Image placeholder */}
      <div className="h-48 skeleton" />
      
      {/* Content placeholder */}
      <div className="p-5 space-y-3">
        {/* Title */}
        <div className="h-6 w-3/4 skeleton rounded" />
        
        {/* Subtitle */}
        <div className="h-4 w-1/2 skeleton rounded" />
        
        {/* Footer */}
        <div className="flex justify-between items-center pt-3">
          <div className="h-4 w-20 skeleton rounded" />
          <div className="h-8 w-24 skeleton rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonText({ width = 'w-full', height = 'h-4' }: { width?: string; height?: string }) {
  return <div className={`${width} ${height} skeleton rounded`} />;
}
