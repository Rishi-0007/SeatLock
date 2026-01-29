import React, { useEffect, useRef } from 'react';
import { LockEvent, ConcurrencyModeState } from '@/types/concurrency';

interface SystemPanelProps {
  events: LockEvent[];
  modeState: ConcurrencyModeState;
}

export function SystemPanel({ events, modeState }: SystemPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to top when new events arrive
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = 0;
    }
  }, [events]);

  if (!modeState.isEnabled) return null;

  return (
    <div className="fixed right-6 top-32 bottom-24 w-80 bg-[#0f0a28]/95 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl overflow-hidden flex flex-col z-40 animate-slide-in-right">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-white/5">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Real-time Lock Engine Events
        </h3>
        <p className="text-[10px] text-white/50 mt-1 pl-6">Live stream of concurrency resolutions</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 gap-2 p-3 bg-white/5 border-b border-white/10">
        <div className="bg-[#1e1b4b] p-2 rounded-lg border border-indigo-500/20 group hover:border-indigo-500/40 transition-colors">
          <div className="flex justify-between items-start mb-1">
             <div className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">Lock Success Rate</div>
             <div className="text-[10px] text-white/20">ⓘ</div>
          </div>
          <div className="text-xl font-bold text-white font-mono">99.98%</div>
          <div className="text-[8px] text-white/40 mt-1">Requests granted safely</div>
        </div>
        <div className="bg-[#1e1b4b] p-2 rounded-lg border border-indigo-500/20 group hover:border-indigo-500/40 transition-colors">
           <div className="flex justify-between items-start mb-1">
             <div className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">Queue Depth</div>
             <div className="text-[10px] text-white/20">ⓘ</div>
          </div>
          <div className="text-xl font-bold text-white font-mono">0</div>
           <div className="text-[8px] text-white/40 mt-1">Pending lock requests</div>
        </div>
      </div>

      {/* Log Feed */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent space-y-2"
      >
        {events.length === 0 && (
            <div className="text-center text-white/30 text-xs py-8">No active events...</div>
        )}
        {events.map((event) => (
          <div key={event.id} className="text-xs p-2.5 rounded bg-white/5 border border-white/5 animate-fade-in-left hover:bg-white/10 transition-colors">
            <div className="flex justify-between items-center mb-1.5">
               <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                   event.status === 'ACQUIRED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                   event.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                   event.status === 'CONTENDED' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                   'bg-slate-500/20 text-slate-400 border border-slate-500/30'
               }`}>
                   {event.status}
               </span>
               <span className="text-white/20 font-mono text-[9px]">
                   {new Date(event.timestamp).toLocaleTimeString().split(' ')[0]}
               </span>
            </div>
            <div className="text-white/90 font-medium">{event.message}</div>
            <div className="text-white/40 text-[9px] mt-1 font-mono flex items-center gap-2">
                <span>SEAT {event.seatId}</span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span>{event.userId}</span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Footer Status */}
      <div className="p-2 border-t border-white/10 bg-black/20 text-[10px] text-center text-white/40">
          ● Live connection established
      </div>
    </div>
  );
}
