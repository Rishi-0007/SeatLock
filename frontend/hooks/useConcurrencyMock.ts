import { useState, useEffect, useRef } from 'react';
import { ConcurrencyModeState, LockEvent, SeatConcurrencyState } from '@/types/concurrency';

export function useConcurrencyMock(seatIds: string[]) {
  const [modeState, setModeState] = useState<ConcurrencyModeState>({
    isEnabled: false,
    showComparison: true, // Default to "With SeatLock"
    runningTest: false,
    activeUsers: 142, // Start with a realistic mock number
    seatsLocked: 45,
    conflictsResolved: 12,
    avgLockTimeMs: 45, // ms
  });

  const [events, setEvents] = useState<LockEvent[]>([]);
  const [seatStates, setSeatStates] = useState<Record<string, SeatConcurrencyState>>({});

  const eventsRef = useRef(events);
  
  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  // Simulate random activity when enabled
  useEffect(() => {
    if (!modeState.isEnabled) return;

    const interval = setInterval(() => {
      // 1. Randomly fluctuate active users
      setModeState(prev => ({
        ...prev,
        activeUsers: Math.max(50, prev.activeUsers + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 5)),
        seatsLocked: Math.max(10, prev.seatsLocked + (Math.random() > 0.5 ? 1 : -1)),
        avgLockTimeMs: 40 + Math.floor(Math.random() * 15),
      }));

      // 2. Generate a random event
      if (Math.random() > 0.3) {
        const randomSeatId = seatIds[Math.floor(Math.random() * seatIds.length)];
        if (!randomSeatId) return;

        const eventTypes: Array<'ACQUIRED' | 'REJECTED' | 'RELEASED' | 'CONTENDED'> = ['ACQUIRED', 'REJECTED', 'RELEASED', 'CONTENDED'];
        // Bias towards showing conflicts if comparison is OFF (to show chaos) or Resolved if ON
        // Actually, "Without SeatLock" -> Show Conflicts visually as bad things?
        // Let's just keep it simple: "With SeatLock" shows "Conflict Rejected" (System working), "Without" might show "Double Booking" (System failing) - but we only have UI Mock.
        
        // For now, let's just generate standard system events
        const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        const userId = `User-${Math.floor(Math.random() * 1000)}`;

        const newEvent: LockEvent = {
          id: Math.random().toString(36).substr(2, 9),
          timestamp: Date.now(),
          seatId: randomSeatId,
          userId,
          status: type,
          message: type === 'ACQUIRED' ? `Lock acquired by ${userId}` :
                   type === 'REJECTED' ? `Conflict resolved for ${userId}` :
                   type === 'CONTENDED' ? `High contention on seat` :
                   `Lock released by ${userId}`
        };

        setEvents(prev => [newEvent, ...prev].slice(0, 50)); // Keep last 50

        // Update seat specific state
        setSeatStates(prev => ({
            ...prev,
            [randomSeatId]: {
                isContended: type === 'CONTENDED' || type === 'REJECTED',
                attemptCount: (prev[randomSeatId]?.attemptCount || 0) + 1,
                lastLockTime: type === 'ACQUIRED' ? Date.now() : prev[randomSeatId]?.lastLockTime,
            }
        }));
        
        if (type === 'REJECTED') {
            setModeState(prev => ({ ...prev, conflictsResolved: prev.conflictsResolved + 1 }));
        }
      }

    }, 800); // Update every 800ms

    return () => clearInterval(interval);
  }, [modeState.isEnabled, seatIds]);

  return {
    modeState,
    setModeState,
    events,
    seatStates,
  };
}
