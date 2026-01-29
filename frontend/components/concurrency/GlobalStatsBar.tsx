import React from 'react';
import { ConcurrencyModeState } from '@/types/concurrency';

interface GlobalStatsBarProps {
  state: ConcurrencyModeState;
}

export function GlobalStatsBar({ state }: GlobalStatsBarProps) {
  if (!state.isEnabled) return null;

  return (
    <div className="w-full bg-[#0f172a] border-b border-indigo-500/20 text-white p-3 flex justify-center items-center gap-8 shadow-lg animate-fade-in-down z-50 relative overflow-hidden">
      {/* Background Pulse Effect */}
      <div className="absolute inset-0 bg-indigo-500/5 animate-pulse" style={{ animationDuration: '4s' }} />

      <div className="flex flex-col items-end gap-0.5 z-10 mr-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
          <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">System Stable</span>
        </div>
        <span className="text-[8px] text-white/30 font-mono tracking-tight">UPTIME 99.99%</span>
      </div>
      
      <div className="h-8 w-[1px] bg-white/10" />

      <StatItem label="Active Users" value={state.activeUsers.toLocaleString()} subLabel="competing right now" />
      <StatItem label="Seats Locked" value={state.seatsLocked.toLocaleString()} subLabel="currently held by locks" />
      <StatItem label="Conflicts Resolved" value={state.conflictsResolved.toLocaleString()} color="text-amber-400" subLabel="double bookings prevented" />
      <StatItem label="Avg Lock Time" value={`${state.avgLockTimeMs}ms`} subLabel="average lock acquisition" />
    </div>
  );
}

function StatItem({ label, value, color = "text-white", subLabel }: { label: string; value: string; color?: string; subLabel: string }) {
  return (
    <div className="flex flex-col items-start min-w-[120px] z-10">
      <span className={`text-xl font-mono font-bold leading-none mb-1 ${color}`}>{value}</span>
      <span className="text-[9px] text-white/60 uppercase tracking-wider font-semibold">{label}</span>
      <span className="text-[8px] text-white/30 font-medium italic">{subLabel}</span>
    </div>
  );
}
