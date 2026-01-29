export function Screen() {
  return (
    <div className="flex flex-col items-center mb-10 animate-fade-in">
      {/* Screen container with perspective */}
      <div className="relative w-[85%] max-w-2xl">
        {/* Light rays effect */}
        <div 
          className="absolute -top-6 left-1/2 -translate-x-1/2 w-full h-20 opacity-30"
          style={{
            background: 'linear-gradient(180deg, transparent 0%, rgba(14, 165, 233, 0.2) 50%, transparent 100%)',
            clipPath: 'polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)',
          }}
        />
        
        {/* Main screen */}
        <div 
          className="relative h-12 rounded-b-[100%] screen-glow"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(200,220,255,0.6) 60%, rgba(14,165,233,0.4) 100%)',
            boxShadow: `
              0 0 40px rgba(255, 255, 255, 0.15),
              0 0 80px rgba(14, 165, 233, 0.1),
              inset 0 -5px 20px rgba(14, 165, 233, 0.2)
            `,
            transform: 'perspective(500px) rotateX(-5deg)',
          }}
        >
          {/* Screen reflection */}
          <div 
            className="absolute inset-0 rounded-b-[100%] opacity-50"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)',
            }}
          />
        </div>
        
        {/* Screen base/stand */}
        <div 
          className="mx-auto mt-1 w-20 h-1 rounded-full"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
          }}
        />
      </div>
      
      {/* Label */}
      <div className="mt-4 flex items-center gap-2 text-[var(--foreground-muted)]">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <span className="text-xs font-medium tracking-widest uppercase">All Eyes This Way</span>
      </div>
    </div>
  );
}
