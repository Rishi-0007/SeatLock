import { Request, Response } from 'express';
import Stripe from 'stripe';
import { stripe } from '../stripe/stripe';
import { prisma } from '../prisma/client';
import { clearSeatTTL } from '../redis/seatLock';
import { io } from '../socket/socket';
import { Prisma } from '@prisma/client';

export const stripeWebhookHandler = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig as string,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('❌ Webhook signature failed', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type !== 'checkout.session.completed') {
    return res.status(200).json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  const seatIds = JSON.parse(session.metadata?.seatIds ?? '[]');
  const userId = session.metadata?.userId;

  try {
    await prisma.$transaction(async (tx) => {
      const seats = await tx.$queryRaw<
        { id: string; status: string; lockedByUserId: string | null }[]
      >`
        SELECT id, status, "lockedByUserId"
        FROM "Seat"
        WHERE id IN (${Prisma.join(seatIds)})
        FOR UPDATE
      `;

      if (seats.length !== seatIds.length) {
        throw new Error('SEAT_NOT_FOUND');
      }

      for (const seat of seats) {
        if (seat.status !== 'LOCKED') throw new Error('NOT_LOCKED');
        if (seat.lockedByUserId !== userId) throw new Error('NOT_OWNER');
      }

      await tx.seat.updateMany({
        where: { id: { in: seatIds } },
        data: { status: 'BOOKED', lockedByUserId: null },
      });

      await tx.booking.createMany({
        data: seatIds.map((seatId: string) => ({
          seatId,
          userId,
          status: 'CONFIRMED',
        })),
      });
    });

    for (const seatId of seatIds) {
      await clearSeatTTL(seatId);
    }

    io.emit('seat:booked', { seatIds, status: 'BOOKED' });

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('❌ Booking failed', err);
    return res.status(200).json({ received: true }); // prevent retry storm
  }
};
