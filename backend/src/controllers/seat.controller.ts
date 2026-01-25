import { Request, Response } from 'express';
import { prisma } from '../prisma/client';

export const seatLock = async (req: Request, res: Response) => {
  const { seatId } = req.params;

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Lock the seat row
      const seats = await tx.$queryRaw<{ id: string; status: string }[]>`
        SELECT id, status
        FROM "Seat"
        WHERE id = ${String(seatId)}
        FOR UPDATE
      `;

      console.log('Locked Seats:', seats);

      if (seats.length === 0) {
        throw new Error('SEAT_NOT_FOUND');
      }

      if (seats[0].status !== 'AVAILABLE') {
        throw new Error('SEAT_NOT_AVAILABLE');
      }

      // 2. Update seat to LOCKED
      await tx.seat.update({
        where: { id: String(seatId) },
        data: { status: 'LOCKED' },
      });
    });

    res.status(200).json({
      success: true,
      message: 'Seat locked successfully',
    });
  } catch (err: any) {
    if (err.message === 'SEAT_NOT_FOUND') {
      res.status(404).json({ success: false, message: 'Seat not found' });
      return;
    }

    if (err.message === 'SEAT_NOT_AVAILABLE') {
      res.status(409).json({ success: false, message: 'Seat not available' });
      return;
    }

    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
