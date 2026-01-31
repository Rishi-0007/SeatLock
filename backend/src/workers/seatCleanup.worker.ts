import { prisma } from '../prisma/client';
import { seatTTLExists } from '../redis/seatLock';
import { io, SeatEventPayload } from '../socket/socket';

/**
 * Periodic reconciliation worker.
 *
 * Rule:
 * - DB is the source of truth
 * - Redis TTL is advisory (payment window)
 * - Worker restores consistency, never enforces strict invariants
 */
export async function cleanupExpiredSeatLocks() {
  try {
    console.log('[worker] Running seat lock cleanup');

    // 1️⃣ Find all seats that are currently LOCKED in DB
    const lockedSeats = await prisma.seat.findMany({
      where: {
        status: 'LOCKED',
        lockedByUserId: { not: null },
      },
      select: {
        id: true,
      },
    });

    if (lockedSeats.length === 0) return;

    // 2️⃣ Reconcile each seat independently (best-effort)
    for (const { id: seatId } of lockedSeats) {
      const ttlExists = await seatTTLExists(seatId);

      // Payment window still valid → skip
      if (ttlExists) continue;

      let unlocked = false;

      // 3️⃣ Safe DB reconciliation (idempotent)
      await prisma.$transaction(async (tx) => {
        const freshSeat = await tx.seat.findUnique({
          where: { id: seatId },
        });

        // Seat removed / already changed → skip
        if (!freshSeat) return;

        // Seat already booked or unlocked → skip
        if (freshSeat.status !== 'LOCKED') return;

        await tx.seat.update({
          where: { id: seatId },
          data: {
            status: 'AVAILABLE',
            lockedByUserId: null,
          },
        });

        unlocked = true;
      });

      // 4️⃣ Emit socket event ONLY if DB was changed
      if (unlocked) {
        io.emit('seat:unlocked', {
          seatIds: [seatId],
          status: 'AVAILABLE',
        } as SeatEventPayload);
      }
    }
  } catch (err) {
    console.error('[worker] Seat lock cleanup failed', err);
  }
}

/**
 * Cleanup expired concurrency test runs
 * Deletes test runs where expiresAt < now()
 * CASCADE deletes all related data (virtualUsers, testSeats, testBookings, testSeatLocks)
 */
export async function cleanupExpiredTestRuns() {
  try {
    const result = await prisma.testRun.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });

    if (result.count > 0) {
      console.log(`[worker] Cleaned up ${result.count} expired test runs`);
    }

    return result.count;
  } catch (err) {
    console.error('[worker] Test run cleanup failed', err);
    return 0;
  }
}
