import { Request, Response } from 'express';
import { prisma } from '../prisma/client';
import { seatTTLExists, setSeatTTL } from '../redis/seatLock';

export const seatLock = async (req: Request, res: Response) => {
  const seatId = req.params.seatId as string;
  const userId = 'user-1'; // mocked for now

  try {
    await prisma.$transaction(async (tx) => {
      const seats = await tx.$queryRaw<{ id: string; status: string }[]>`
        SELECT id, status
        FROM "Seat"
        WHERE id = ${seatId}
        FOR UPDATE
      `;

      if (seats.length === 0) {
        throw new Error('SEAT_NOT_FOUND');
      }

      const seat = seats[0];

      // 🔁 Lazy cleanup
      if (seat.status === 'LOCKED') {
        const exists = await seatTTLExists(seatId);
        if (!exists) {
          await tx.seat.update({
            where: { id: seatId },
            data: { status: 'AVAILABLE' },
          });
          // fall through
        }
      }

      // re-check after cleanup
      const current = await tx.seat.findUnique({
        where: { id: seatId },
        select: { status: true },
      });

      if (!current || current.status !== 'AVAILABLE') {
        throw new Error('SEAT_NOT_AVAILABLE');
      }

      await tx.seat.update({
        where: { id: seatId },
        data: { status: 'LOCKED' },
      });
    });

    // ✅ Redis AFTER commit
    await setSeatTTL(seatId, userId);

    res.status(200).json({
      success: true,
      message: 'Seat locked successfully',
    });
  } catch (err: any) {
    if (err.message === 'SEAT_NOT_FOUND') {
      return res
        .status(404)
        .json({ success: false, message: 'Seat not found' });
    }
    if (err.message === 'SEAT_NOT_AVAILABLE') {
      return res
        .status(409)
        .json({ success: false, message: 'Seat not available' });
    }
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
