import express from 'express';
import { seatLock } from '../controllers/seat.controller';

const router = express.Router();

router.post('/:seatId/lock', seatLock);

export default router;
