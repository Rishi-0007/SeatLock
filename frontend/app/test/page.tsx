'use client';

import { useEffect, useState, useRef } from 'react';
import { getSocket } from '@/lib/socket';

type TestEvent = {
  type: string;
  userId?: string;
  seat?: string;
  reason?: string;
  timestamp: string;
};

type TestReport = {
  testRunId: string;
  status: string;
  totalUsers: number;
  totalSeats: number;
  successfulBookings: number;
  failedAttempts: number;
  collisionRate: string;
  startedAt: string;
  expiresAt: string;
};

type LiveCounts = {
  attempts: number;
  acquired: number;
  rejected: number;
  confirmed: number;
};

export default function ConcurrencyTestPage() {
  const [testRunId, setTestRunId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [events, setEvents] = useState<TestEvent[]>([]);
  const [report, setReport] = useState<TestReport | null>(null);
  const [totalUsers, setTotalUsers] = useState(50);
  const [totalSeats, setTotalSeats] = useState(10);
  const [liveCounts, setLiveCounts] = useState<LiveCounts>({ attempts: 0, acquired: 0, rejected: 0, confirmed: 0 });
  
  const eventsRef = useRef<HTMLDivElement>(null);

  // Auto-scroll events
  useEffect(() => {
    if (eventsRef.current) {
      eventsRef.current.scrollTop = eventsRef.current.scrollHeight;
    }
  }, [events]);

  // Socket listeners
  useEffect(() => {
    if (!testRunId) return;

    const socket = getSocket();
    if (!socket) return;

    // Join test room
    socket.emit('join:test', testRunId);

    // Track counts
    socket.on('USER_ATTEMPT', (data: Omit<TestEvent, 'type'>) => {
      setLiveCounts(prev => ({ ...prev, attempts: prev.attempts + 1 }));
      setEvents((prev) => [...prev, { type: 'USER_ATTEMPT', ...data }]);
    });

    socket.on('LOCK_ACQUIRED', (data: Omit<TestEvent, 'type'>) => {
      setLiveCounts(prev => ({ ...prev, acquired: prev.acquired + 1 }));
      setEvents((prev) => [...prev, { type: 'LOCK_ACQUIRED', ...data }]);
    });

    socket.on('LOCK_REJECTED', (data: Omit<TestEvent, 'type'>) => {
      setLiveCounts(prev => ({ ...prev, rejected: prev.rejected + 1 }));
      setEvents((prev) => [...prev, { type: 'LOCK_REJECTED', ...data }]);
    });

    socket.on('BOOKING_CONFIRMED', (data: Omit<TestEvent, 'type'>) => {
      setLiveCounts(prev => ({ ...prev, confirmed: prev.confirmed + 1 }));
      setEvents((prev) => [...prev, { type: 'BOOKING_CONFIRMED', ...data }]);
    });

    socket.on('TEST_COMPLETED', (data: { 
      testRunId: string;
      totalUsers: number;
      totalSeats: number;
      successfulBookings: number;
      failedAttempts: number;
      collisionRate: string;
    }) => {
      setIsRunning(false);
      setEvents((prev) => [...prev, { 
        type: 'TEST_COMPLETED', 
        timestamp: new Date().toISOString(),
      }]);
      
      // Use socket data immediately for fast UI update
      setReport({
        testRunId: data.testRunId,
        status: 'COMPLETED',
        totalUsers: data.totalUsers,
        totalSeats: data.totalSeats,
        successfulBookings: data.successfulBookings,
        failedAttempts: data.failedAttempts,
        collisionRate: data.collisionRate,
        startedAt: '',
        expiresAt: '',
      });
    });

    return () => {
      socket.emit('leave:test', testRunId);
      socket.off('USER_ATTEMPT');
      socket.off('LOCK_ACQUIRED');
      socket.off('LOCK_REJECTED');
      socket.off('BOOKING_CONFIRMED');
      socket.off('TEST_COMPLETED');
    };
  }, [testRunId]);

  async function startTest() {
    setIsStarting(true);
    setEvents([]);
    setReport(null);
    setLiveCounts({ attempts: 0, acquired: 0, rejected: 0, confirmed: 0 });

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/test/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ totalUsers, totalSeats }),
      });

      const data = await res.json();
      setTestRunId(data.testRunId);
      setIsRunning(true);
    } catch (err) {
      console.error('Failed to start test:', err);
      alert('Failed to start test');
    } finally {
      setIsStarting(false);
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'LOCK_ACQUIRED': return 'text-emerald-400';
      case 'LOCK_REJECTED': return 'text-red-400';
      case 'BOOKING_CONFIRMED': return 'text-blue-400';
      case 'TEST_COMPLETED': return 'text-amber-400 font-bold';
      default: return 'text-white/60';
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Concurrency Stress Test</h1>
          <p className="text-white/60">
            Spawn virtual users racing for limited seats. Real locks, real conflicts, real proof.
          </p>
        </div>

        {/* Config & Start */}
        <div className="mb-6 p-4 rounded-lg bg-white/5 border border-white/10">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-xs text-white/50 mb-1">Virtual Users</label>
              <input
                type="number"
                value={totalUsers}
                onChange={(e) => setTotalUsers(parseInt(e.target.value) || 10)}
                disabled={isRunning}
                className="w-24 px-3 py-2 rounded bg-white/10 border border-white/20 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">Available Seats</label>
              <input
                type="number"
                value={totalSeats}
                onChange={(e) => setTotalSeats(parseInt(e.target.value) || 5)}
                disabled={isRunning}
                className="w-24 px-3 py-2 rounded bg-white/10 border border-white/20 text-white text-sm"
              />
            </div>
            <button
              onClick={startTest}
              disabled={isStarting || isRunning}
              className="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isStarting ? 'Starting...' : isRunning ? 'Running...' : 'Start Test'}
            </button>
          </div>
          
          {/* Validation warnings */}
          <div className="mt-3 space-y-1">
            {totalUsers > 500 && (
              <p className="text-xs text-red-400">
                ⛔ Max 500 users allowed. Will be capped to 500.
              </p>
            )}
            {totalSeats > 20 && (
              <p className="text-xs text-red-400">
                ⛔ Max 20 seats allowed. Will be capped to 20.
              </p>
            )}
            {totalUsers > totalSeats && totalUsers <= 500 && totalSeats <= 20 && (
              <p className="text-xs text-amber-400">
                ⚠️ More users ({totalUsers}) than seats ({Math.min(totalSeats, 20)}) = guaranteed conflicts
              </p>
            )}
          </div>

          {/* Console tip */}
          <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
            <span className="text-purple-400 text-lg">🔍</span>
            <div>
              <p className="text-sm text-purple-300 font-medium">
                Pro Tip: Open DevTools to see raw socket events
              </p>
              <p className="text-xs text-purple-400/70">
                Press <kbd className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">F12</kbd> → Console tab to watch every lock attempt in real-time
              </p>
            </div>
          </div>
        </div>

        {/* Live Counters */}
        {(isRunning || liveCounts.attempts > 0) && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-white/50 uppercase tracking-wider">Live Progress</h2>
              {isRunning && (
                <span className="flex items-center gap-2 text-xs text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Processing...
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="text-center p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="text-2xl font-bold text-white/60 tabular-nums">{liveCounts.attempts}</div>
                <div className="text-xs text-white/40">Attempts</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <div className="text-2xl font-bold text-emerald-400 tabular-nums">{liveCounts.acquired}</div>
                <div className="text-xs text-white/40">Locks Acquired</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                <div className="text-2xl font-bold text-red-400 tabular-nums">{liveCounts.rejected}</div>
                <div className="text-xs text-white/40">Rejected</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <div className="text-2xl font-bold text-blue-400 tabular-nums">{liveCounts.confirmed}</div>
                <div className="text-xs text-white/40">Booked</div>
              </div>
            </div>

            {/* Complete Event Log */}
            <div className="mt-4">
              <div className="text-xs text-white/50 mb-2">
                Complete Log ({events.length} events)
              </div>
              <div 
                ref={eventsRef}
                className="h-64 overflow-y-auto rounded-lg bg-black/50 border border-white/10 p-3 font-mono text-[11px] leading-relaxed"
              >
                {events.map((event, i) => (
                  <div key={i} className={getEventColor(event.type)}>
                    <span className="text-white/30">{new Date(event.timestamp).toLocaleTimeString()}</span>
                    {' '}
                    <span className="font-bold">{event.type}</span>
                    {event.seat && <span> — {event.seat}</span>}
                    {event.reason && <span className="text-white/40"> ({event.reason})</span>}
                  </div>
                ))}
                {events.length === 0 && (
                  <div className="text-white/30">Waiting for events...</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Final Report */}
        {report && (
          <div className="p-6 rounded-lg bg-white/5 border border-white/10">
            <h2 className="text-lg font-bold text-white mb-4">Test Report</h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-3 rounded bg-white/5">
                <div className="text-2xl font-bold text-white">{report.totalUsers}</div>
                <div className="text-xs text-white/50">Virtual Users</div>
              </div>
              <div className="text-center p-3 rounded bg-white/5">
                <div className="text-2xl font-bold text-white">{report.totalSeats}</div>
                <div className="text-xs text-white/50">Available Seats</div>
              </div>
              <div className="text-center p-3 rounded bg-emerald-500/20">
                <div className="text-2xl font-bold text-emerald-400">{report.successfulBookings}</div>
                <div className="text-xs text-white/50">Locks Acquired</div>
              </div>
              <div className="text-center p-3 rounded bg-red-500/20">
                <div className="text-2xl font-bold text-red-400">{report.failedAttempts}</div>
                <div className="text-xs text-white/50">Conflicts Rejected</div>
              </div>
            </div>

            <div className="text-center p-4 rounded bg-amber-500/10 border border-amber-500/30">
              <div className="text-3xl font-bold text-amber-400">{report.collisionRate}</div>
              <div className="text-sm text-white/60 mt-1">Collision Rate</div>
              <p className="text-xs text-white/40 mt-2">
                {report.successfulBookings} users won seats. {report.failedAttempts} were rejected.
              </p>
            </div>

            <p className="mt-4 text-xs text-white/30 text-center">
              Test ID: {report.testRunId}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
