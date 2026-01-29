import { Request, Response } from 'express';
import { prisma } from '../prisma/client';

export const getEventById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate event
    const event = await prisma.event.findUnique({
      where: { id: String(id) },
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Fetch seats (ordered, deterministic)
    const seats = await prisma.seat.findMany({
      where: { eventId: String(id) },
      orderBy: [{ row: 'asc' }, { number: 'asc' }],
      select: {
        id: true,
        row: true,
        number: true,
        status: true,
      },
    });

    // Return snapshot
    return res.status(200).json({
      success: true,
      event: {
        id: event.id,
        name: event.name,
        date: event.date,
      },
      seats,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const getAllEvents = async (req: Request, res: Response) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { date: 'asc' },
    });

    return res.json({
      success: true,
      events,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch events',
    });
  }
};
