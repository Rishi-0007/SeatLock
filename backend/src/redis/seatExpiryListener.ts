import { redis } from './client';
import { prisma } from '../prisma/client';
import { io } from '../socket/socket';

export function startSeatExpiryListener() {
  // Separate Redis connection for pub/sub
  const subscriber = redis.duplicate();

  subscriber.psubscribe('__keyevent@0__:expired');

  subscriber.on('pmessage', async (_pattern, _channel, key) => {
    // We only care about seat lock keys
    if (!key.startsWith('seat:lock:')) return;

    const seatId = key.replace('seat:lock:', '');

    try {
      const unlocked = await prisma.$transaction(async (tx) => {
        const seat = await tx.seat.findUnique({
          where: { id: seatId },
        });

        if (!seat) return false;

        // Important: idempotency
        if (seat.status !== 'LOCKED') return false;

        await tx.seat.update({
          where: { id: seatId },
          data: {
            status: 'AVAILABLE',
            lockedByUserId: null,
          },
        });

        return true;
      });

      // Emit ONLY if we actually changed state
      if (unlocked) {
        io.emit('seat:unlocked', {
          seatIds: [seatId],
          status: 'AVAILABLE',
        });
      }
    } catch (err) {
      console.error('[seat-expiry-listener] Failed to unlock seat', err);
    }
  });

  subscriber.on('error', (err) => {
    console.error('[seat-expiry-listener] Redis error', err);
  });

  console.log('🪑 Seat expiry listener started');
}
