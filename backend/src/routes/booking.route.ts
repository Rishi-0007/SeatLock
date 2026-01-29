import { Router } from 'express';
import { getMyBookings } from '../controllers/booking.controller';
import { requireAuth } from '../middlewares/auth';

const router = Router();

router.get('/me', requireAuth, getMyBookings);

export default router;
