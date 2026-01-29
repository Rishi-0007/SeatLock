import { Request, Response } from 'express';
import { stripe } from '../stripe/stripe';
import { prisma } from '../prisma/client';

export const createCheckoutSession = async (req: Request, res: Response) => {
  const { seatIds, eventId } = req.body;

  if (!seatIds?.length) {
    return res.status(400).json({ message: 'No seats selected' });
  }

  // ⚠️ For demo: flat price
  const PRICE_PER_SEAT = 300;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: 'Movie Ticket',
            },
            unit_amount: PRICE_PER_SEAT * 100,
          },
          quantity: seatIds.length,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
      metadata: {
        seatIds: JSON.stringify(seatIds),
        eventId,
        userId: req.userId!,
      },
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create payment session' });
  }
};

export const verifySession = async (req: Request, res: Response) => {
  const { sessionId } = req.query;

  if (!sessionId) {
    return res.status(400).json({ message: 'Session ID is required' });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId as string);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ message: 'Payment not completed', status: session.payment_status });
    }

    const seatIds = JSON.parse(session.metadata?.seatIds ?? '[]');
    const userId = session.metadata?.userId;
    const eventId = session.metadata?.eventId;

    // Reuse the logic (or extract to a service function) to book seats
    // Here we duplicate for safety/speed but ideally should be shared
    await prisma.$transaction(async (tx) => {
      // 1. Check if ANY seat is already booked (idempotency check)
      const existing = await tx.booking.findFirst({
         where: {
            seatId: { in: seatIds },
            status: 'CONFIRMED'
         }
      });
      
      if (existing) {
         // Already processed by webhook or previous call
         return;
      }

      // 2. Clear old status (LOCKED -> BOOKED)
      await tx.seat.updateMany({
        where: { id: { in: seatIds } },
        data: { status: 'BOOKED', lockedByUserId: null },
      });

      // 3. Create Bookings
      await tx.booking.createMany({
        data: seatIds.map((seatId: string) => ({
          seatId,
          userId,
          status: 'CONFIRMED',
        })),
      });
    });

    // 4. Clear TTL + Emit Socket
    // We do this outside transaction to avoid blocking socket/redis too long
    // Ideally duplicate emits are fine
    const { io } = await import('../socket/socket');
    const { clearSeatTTL } = await import('../redis/seatLock');

    for (const seatId of seatIds) {
      await clearSeatTTL(seatId);
    }

    io.emit('seat:booked', { seatIds, status: 'BOOKED' });

    return res.json({ status: 'paid', message: 'Booking confirmed' });
  } catch (err: any) {
    console.error('Verify session error:', err);
    return res.status(500).json({ message: 'Verification failed' });
  }
};
