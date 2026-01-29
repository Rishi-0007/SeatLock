import express from 'express';
import {
  bookSeats,
  getSeatLockTTL,
  lockSeats,
} from '../controllers/seat.controller';
import { requireAuth } from '../middlewares/auth';

const router = express.Router();

router.post('/lock', requireAuth, lockSeats);
router.post('/book', requireAuth, bookSeats);
router.get('/lock/:seatId/ttl', getSeatLockTTL);

export default router;
