import express from 'express';
import { bookSeat, lockSeat } from '../controllers/seat.controller';

const router = express.Router();

router.post('/:seatId/lock', lockSeat);
router.post('/:seatId/book', bookSeat);

export default router;
