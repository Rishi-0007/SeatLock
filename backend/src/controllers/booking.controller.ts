import { Request, Response } from 'express';
import { prisma } from '../prisma/client';

export const getMyBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        userId: req.userId!,
        status: 'CONFIRMED',
      },
      include: {
        seat: {
          include: {
             event: true
          }
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formatted = bookings.map((b) => ({
      id: b.id,
      eventName: b.seat.event.name,
      seatNumber: `${b.seat.row}${b.seat.number}`,
      date: b.seat.event.date,
      status: b.status,
    }));

    res.json({ bookings: formatted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
};
