import { Request, Response } from 'express';
import { prisma } from '../prisma/client';
import { clearSeatTTL, seatTTLExists, setSeatTTL } from '../redis/seatLock';
import { Prisma } from '@prisma/client';
import { io } from '../socket';

const MOCK_USER_ID = 'user-1';

type SeatEventPayload = {
  seatIds: string[];
  status: 'LOCKED' | 'AVAILABLE' | 'BOOKED';
};

export const lockSeats = async (req: Request, res: Response) => {
  const seatIds = req.body.seatIds as string[];
  const userId = MOCK_USER_ID;

  try {
    await prisma.$transaction(async (tx) => {
      const seats = await tx.$queryRaw<
        { id: string; status: string; lockedByUserId: string | null }[]
      >(
        Prisma.sql`
          SELECT id, status, "lockedByUserId"
          FROM "Seat"
          WHERE id IN (${Prisma.join(seatIds)})
          FOR UPDATE
        `
      );

      if (seats.length !== seatIds.length) {
        throw new Error('SEATS_NOT_FOUND');
      }

      for (const seat of seats) {
        if (seat.status === 'LOCKED') {
          const exists = await seatTTLExists(seat.id);
          if (!exists) {
            await tx.seat.update({
              where: { id: seat.id },
              data: { status: 'AVAILABLE', lockedByUserId: null },
            });
            seat.status = 'AVAILABLE';
          } else {
            throw new Error('SEAT_NOT_AVAILABLE');
          }
        }

        if (seat.status !== 'AVAILABLE') {
          throw new Error('SEAT_NOT_AVAILABLE');
        }
      }

      await tx.seat.updateMany({
        where: { id: { in: seatIds } },
        data: {
          status: 'LOCKED',
          lockedByUserId: userId,
        },
      });
    });

    // Redis AFTER commit
    for (const seatId of seatIds) {
      await setSeatTTL(seatId, userId);
    }

    // Notify via Socket.IO
    io.emit('seat:locked', {
      seatIds,
      status: 'LOCKED',
    } as SeatEventPayload);

    res.status(200).json({
      success: true,
      message: 'Seats locked successfully',
    });
  } catch (err: any) {
    if (err.message === 'SEATS_NOT_FOUND') {
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

// below is the old single seat booking function kept for reference
// export const bookSeat = async (req: Request, res: Response) => {
//   const seatId = req.params.seatId as string;
//   const currentUser = 'user-1'; // mocked for now

//   try {
//     await prisma.$transaction(async (tx) => {
//       const seats = await tx.$queryRaw<
//         { id: string; status: string; lockedByUserId: string | null }[]
//       >`
//         SELECT id, status, lockedByUserId
//         FROM "Seat"
//         WHERE id = ${seatId}
//         FOR UPDATE;
//       `;

//       if (seats.length === 0) {
//         throw new Error('NOT_FOUND');
//       }

//       const seat = seats[0];

//       if (seat.status !== 'LOCKED') {
//         throw new Error('NOT_LOCKED');
//       }

//       if (seat.lockedByUserId !== currentUser) {
//         throw new Error('NOT_OWNER');
//       }

//       await tx.seat.update({
//         where: { id: seatId },
//         data: {
//           status: 'BOOKED',
//           lockedByUserId: null,
//         },
//       });

//       await tx.booking.create({
//         data: {
//           seatId,
//           userId: currentUser,
//           status: 'CONFIRMED',
//           expiresAt: null,
//         },
//       });
//     });

//     try {
//       await clearSeatTTL(seatId);
//     } catch (e) {
//       console.warn('Redis cleanup failed', e);
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Seat booked successfully',
//     });
//   } catch (err: any) {
//     if (err.message === 'NOT_FOUND') {
//       return res
//         .status(404)
//         .json({ success: false, message: 'Seat not found' });
//     }
//     if (err.message === 'NOT_LOCKED') {
//       return res
//         .status(409)
//         .json({ success: false, message: 'Seat not locked' });
//     }
//     if (err.message === 'NOT_OWNER') {
//       return res
//         .status(403)
//         .json({ success: false, message: 'Not lock owner' });
//     }

//     console.error(err);
//     res.status(500).json({ success: false, message: 'Internal server error' });
//   }
// };

export const bookSeats = async (req: Request, res: Response) => {
  const seatIds = req.body.seatIds as string[];
  const currentUser = MOCK_USER_ID;

  if (!seatIds || seatIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'seatIds must be a non-empty array',
    });
  }

  try {
    await prisma.$transaction(async (tx) => {
      const seats = await tx.$queryRaw<
        { id: string; status: string; lockedByUserId: string | null }[]
      >(Prisma.sql`
        SELECT id, status, "lockedByUserId"
        FROM "Seat"
        WHERE id IN (${Prisma.join(seatIds)})
        FOR UPDATE
      `);

      if (seats.length !== seatIds.length) {
        throw new Error('NOT_FOUND');
      }

      for (const seat of seats) {
        if (seat.status !== 'LOCKED') {
          throw new Error('NOT_LOCKED');
        }

        if (seat.lockedByUserId !== currentUser) {
          throw new Error('NOT_OWNER');
        }
      }

      await tx.seat.updateMany({
        where: { id: { in: seatIds } },
        data: {
          status: 'BOOKED',
          lockedByUserId: null,
        },
      });

      await tx.booking.createMany({
        data: seatIds.map((seatId) => ({
          seatId,
          userId: currentUser,
          status: 'CONFIRMED',
        })),
      });
    });

    // Redis AFTER commit
    try {
      for (const seatId of seatIds) {
        await clearSeatTTL(seatId);
      }
    } catch (err) {
      console.warn('Redis cleanup failed', err);
    }

    // Notify via Socket.IO
    io.emit('seat:booked', {
      seatIds,
      status: 'BOOKED',
    } as SeatEventPayload);

    return res.status(200).json({
      success: true,
      message: 'Seats booked successfully',
    });
  } catch (error: any) {
    if (error.message === 'NOT_FOUND') {
      return res.status(404).json({
        success: false,
        message: 'One or more seats not found',
      });
    }
    if (error.message === 'NOT_LOCKED') {
      return res.status(409).json({
        success: false,
        message: 'One or more seats not locked',
      });
    }
    if (error.message === 'NOT_OWNER') {
      return res.status(403).json({
        success: false,
        message: 'Not lock owner for one or more seats',
      });
    }

    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
