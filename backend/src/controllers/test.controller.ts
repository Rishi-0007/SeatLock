import { Request, Response } from 'express';
import { prisma } from '../prisma/client';
import { getIO } from '../socket/socket';
import { TestSeat, VirtualUser } from '@prisma/client';

/**
 * ============================================
 * CONCURRENCY TEST ENGINE — INVARIANTS
 * ============================================
 * 
 * 1. ONE SEAT → MAX ONE LOCK
 *    TestSeatLock.seatId is the PK. Insert fails if lock exists.
 * 
 * 2. ONE VIRTUAL USER → ONE ATTEMPT
 *    Each user picks a random seat and attempts exactly once. No retries.
 * 
 * 3. ONE TEST RUN → ISOLATED DATA
 *    All entities (users, seats, locks, bookings) belong to a single testRunId.
 *    No data bleeds between runs.
 * 
 * 4. EXPIRED TEST → ZERO REMAINING RECORDS
 *    Cleanup worker deletes test runs where expiresAt < now().
 *    CASCADE deletes all related records.
 * 
 * 5. LOCK + BOOKING = ATOMIC
 *    Both operations happen in a single transaction.
 *    If booking fails, lock is rolled back.
 */

// Seat grid configuration
const ROWS = ['A', 'B', 'C', 'D', 'E'];
const SEATS_PER_ROW = 4;
const TEST_EXPIRY_MINUTES = 10;

/**
 * Start a new concurrency test
 * POST /api/test/start
 */
// Rate limits
const MAX_USERS = 500;
const MAX_SEATS = 20;

export async function startTest(req: Request, res: Response) {
  try {
    let { totalUsers = 50, totalSeats = 20 } = req.body;

    // Enforce rate limits
    totalUsers = Math.min(Math.max(1, totalUsers), MAX_USERS);
    totalSeats = Math.min(Math.max(1, totalSeats), MAX_SEATS);

    // Create test run
    const expiresAt = new Date(Date.now() + TEST_EXPIRY_MINUTES * 60 * 1000);
    const testRun = await prisma.testRun.create({
      data: {
        totalUsers,
        totalSeats,
        expiresAt,
      },
    });

    // Create virtual users
    const userPromises = [];
    for (let i = 0; i < totalUsers; i++) {
      userPromises.push(
        prisma.virtualUser.create({
          data: { testRunId: testRun.id },
        })
      );
    }
    await Promise.all(userPromises);

    // Create test seats (grid: ROWS x SEATS_PER_ROW)
    const seatPromises = [];
    let seatCount = 0;
    for (const row of ROWS) {
      for (let num = 1; num <= SEATS_PER_ROW; num++) {
        if (seatCount >= totalSeats) break;
        seatPromises.push(
          prisma.testSeat.create({
            data: {
              testRunId: testRun.id,
              row,
              number: num,
            },
          })
        );
        seatCount++;
      }
      if (seatCount >= totalSeats) break;
    }
    await Promise.all(seatPromises);

    // Start the test in background after a short delay
    // This gives the frontend time to join the socket room
    setTimeout(() => {
      runConcurrencyTest(testRun.id);
    }, 500);

    res.json({
      testRunId: testRun.id,
      status: 'RUNNING',
      totalUsers,
      totalSeats,
      expiresAt,
    });
  } catch (error) {
    console.error('Failed to start test:', error);
    res.status(500).json({ error: 'Failed to start test' });
  }
}

/**
 * Get test status
 * GET /api/test/:id/status
 */
export async function getTestStatus(req: Request, res: Response) {
  try {
    const id = req.params.id as string;

    const testRun = await prisma.testRun.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            testBookings: true,
          },
        },
      },
    });

    if (!testRun) {
      return res.status(404).json({ error: 'Test not found' });
    }

    const locksAcquired = testRun._count.testBookings;
    const locksFailed = testRun.totalUsers - locksAcquired;

    res.json({
      testRunId: testRun.id,
      status: testRun.status,
      totalUsers: testRun.totalUsers,
      totalSeats: testRun.totalSeats,
      locksAcquired,
      locksFailed,
      startedAt: testRun.startedAt,
      expiresAt: testRun.expiresAt,
    });
  } catch (error) {
    console.error('Failed to get test status:', error);
    res.status(500).json({ error: 'Failed to get test status' });
  }
}

/**
 * Get final test report
 * GET /api/test/:id/report
 */
export async function getTestReport(req: Request, res: Response) {
  try {
    const id = req.params.id as string;

    const testRun = await prisma.testRun.findUnique({
      where: { id },
      include: {
        testBookings: {
          orderBy: { bookedAt: 'asc' },
        },
      },
    });

    if (!testRun) {
      return res.status(404).json({ error: 'Test not found' });
    }

    const successfulBookings = testRun.testBookings.length;
    const failedAttempts = testRun.totalUsers - successfulBookings;
    const collisionRate = ((failedAttempts / testRun.totalUsers) * 100).toFixed(1);

    res.json({
      testRunId: testRun.id,
      status: testRun.status,
      totalUsers: testRun.totalUsers,
      totalSeats: testRun.totalSeats,
      successfulBookings,
      failedAttempts,
      collisionRate: `${collisionRate}%`,
      bookings: testRun.testBookings.map((b: { virtualUserId: string; seatRow: string; seatNumber: number; bookedAt: Date }) => ({
        odvisualUserId: b.virtualUserId,
        seat: `${b.seatRow}-${b.seatNumber}`,
        bookedAt: b.bookedAt,
      })),
      startedAt: testRun.startedAt,
      expiresAt: testRun.expiresAt,
    });
  } catch (error) {
    console.error('Failed to get test report:', error);
    res.status(500).json({ error: 'Failed to get test report' });
  }
}

/**
 * Core concurrency test runner
 * Spawns all virtual users to attempt locks concurrently
 */
async function runConcurrencyTest(testRunId: string) {
  const io = getIO();

  try {
    const users = await prisma.virtualUser.findMany({
      where: { testRunId },
    });

    const seats = await prisma.testSeat.findMany({
      where: { testRunId },
    });

    if (seats.length === 0) {
      console.error('No seats found for test run');
      return;
    }

    // All users attempt locks concurrently
    const results = await Promise.allSettled(
      users.map((user: VirtualUser) => attemptLock(user.id, seats, testRunId, io))
    );

    // Count results
    const succeeded = results.filter((r): r is PromiseFulfilledResult<boolean> => r.status === 'fulfilled' && r.value === true).length;
    const failed = results.length - succeeded;
    const collisionRate = ((failed / users.length) * 100).toFixed(1);

    console.log(`Test ${testRunId} completed: ${succeeded} locks, ${failed} failures`);

    // Mark test as completed
    await prisma.testRun.update({
      where: { id: testRunId },
      data: { status: 'COMPLETED' },
    });

    // Emit completion event with FULL authoritative stats
    io.to(testRunId).emit('TEST_COMPLETED', {
      testRunId,
      totalUsers: users.length,
      totalSeats: seats.length,
      successfulBookings: succeeded,
      failedAttempts: failed,
      collisionRate: `${collisionRate}%`,
    });
  } catch (error) {
    console.error('Test run failed:', error);
  }
}

/**
 * Single user lock attempt
 * Returns true if lock acquired, false otherwise
 */
async function attemptLock(
  virtualUserId: string,
  seats: { id: string; row: string; number: number }[],
  testRunId: string,
  io: ReturnType<typeof getIO>
): Promise<boolean> {
  // Pick a random seat
  const targetSeat = seats[Math.floor(Math.random() * seats.length)];
  const seatLabel = `${targetSeat.row}-${targetSeat.number}`;

  // Emit attempt event (always include testRunId for isolation)
  io.to(testRunId).emit('USER_ATTEMPT', {
    testRunId,
    userId: virtualUserId,
    seat: seatLabel,
    timestamp: new Date().toISOString(),
  });

  try {
    // ATOMIC: Lock + Booking in a single transaction
    // If booking fails, lock is rolled back automatically
    await prisma.$transaction(async (tx) => {
      // Try to acquire lock (unique constraint will reject duplicates)
      await tx.testSeatLock.create({
        data: {
          seatId: targetSeat.id,
          virtualUserId,
        },
      });

      // Create booking record (same transaction)
      await tx.testBooking.create({
        data: {
          testRunId,
          virtualUserId,
          seatRow: targetSeat.row,
          seatNumber: targetSeat.number,
        },
      });
    });

    // Lock + Booking succeeded! Emit success events
    io.to(testRunId).emit('LOCK_ACQUIRED', {
      testRunId,
      userId: virtualUserId,
      seat: seatLabel,
      timestamp: new Date().toISOString(),
    });

    io.to(testRunId).emit('BOOKING_CONFIRMED', {
      testRunId,
      userId: virtualUserId,
      seat: seatLabel,
      timestamp: new Date().toISOString(),
    });

    return true;
  } catch (error) {
    // Lock failed (seat already locked by another user)
    // Transaction automatically rolled back
    io.to(testRunId).emit('LOCK_REJECTED', {
      testRunId,
      userId: virtualUserId,
      seat: seatLabel,
      reason: 'Seat already locked',
      timestamp: new Date().toISOString(),
    });

    return false;
  }
}

/**
 * Cleanup expired test runs
 * Called by cron worker
 */
export async function cleanupExpiredTests() {
  try {
    const result = await prisma.testRun.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });

    if (result.count > 0) {
      console.log(`Cleaned up ${result.count} expired test runs`);
    }

    return result.count;
  } catch (error) {
    console.error('Cleanup failed:', error);
    return 0;
  }
}
