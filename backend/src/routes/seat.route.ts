import express from 'express';
import {
  bookSeats,
  getSeatLockTTL,
  lockSeats,
} from '../controllers/seat.controller';

const router = express.Router();

router.post('/lock', lockSeats);
router.post('/book', bookSeats);
router.get('/lock/:seatId/ttl', getSeatLockTTL);

export default router;
