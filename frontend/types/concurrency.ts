export type LockStatus = 'ACQUIRED' | 'REJECTED' | 'RELEASED' | 'CONTENDED';

export interface LockEvent {
  id: string;
  timestamp: number;
  seatId: string;
  userId: string;
  status: LockStatus;
  message: string;
}

export interface SystemMetric {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
}

export interface SeatConcurrencyState {
  isContended: boolean;
  attemptCount: number;
  lastLockTime?: number;
  currentHolder?: string;
}

export interface ConcurrencyModeState {
  isEnabled: boolean;
  showComparison: boolean; // false = Without SeatLock, true = With SeatLock
  runningTest: boolean;
  activeUsers: number;
  seatsLocked: number;
  conflictsResolved: number;
  avgLockTimeMs: number;
}
