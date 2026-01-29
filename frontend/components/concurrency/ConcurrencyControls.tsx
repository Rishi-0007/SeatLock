import React from 'react';
import { ConcurrencyModeState } from '@/types/concurrency';

interface ConcurrencyControlsProps {
  state: ConcurrencyModeState;
  onToggleMode: (enabled: boolean) => void;
  onToggleComparison: (showSeatLock: boolean) => void;
  onRunTest: () => void;
}

export function ConcurrencyControls({ 
    state, 
    onToggleMode, 
    onToggleComparison,
    onRunTest 
}: ConcurrencyControlsProps) {
  
    return (
    <div className="flex items-center gap-4">
        {/* Comparison Toggle (Only visible in Concurrency Mode) */}
        {state.isEnabled && (
             <div className="bg-white/10 rounded-full p-1 flex border border-white/10">
                <button
                    onClick={() => onToggleComparison(false)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${!state.showComparison ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50' : 'text-white/50 hover:text-white'}`}
                >
                    Legacy
                </button>
                <button
                    onClick={() => onToggleComparison(true)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${state.showComparison ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50' : 'text-white/50 hover:text-white'}`}
                >
                    SeatLock™
                </button>
             </div>
        )}

        {/* Mode Toggle */}
        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
            <span className="text-xs text-white/70 font-medium">Concurrency Mode</span>
            <button
                onClick={() => onToggleMode(!state.isEnabled)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${state.isEnabled ? 'bg-indigo-500' : 'bg-gray-600'}`}
            >
                <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${state.isEnabled ? 'translate-x-4.5' : 'translate-x-0.5'}`}
                    style={{ transform: state.isEnabled ? 'translateX(18px)' : 'translateX(2px)' }}
                />
            </button>
        </div>

       {/* Run Test Button */}
       <div className="group relative">
             <button
                disabled={true}
                onClick={onRunTest}
                className="relative px-5 py-1.5 bg-indigo-600/50 text-white/40 text-xs font-bold rounded-lg cursor-not-allowed border border-white/5"
            >
                <div className="flex items-center gap-2">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Simulate 10k Users
                </div>
            </button>
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-48 bg-black/90 p-2 rounded text-[10px] text-white/70 text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-white/10">
                ⚠️ Will simulate thousands of parallel booking attempts (Coming Soon)
            </div>
       </div>
    </div>
  );
}
