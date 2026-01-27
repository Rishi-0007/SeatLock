import express from 'express';
import { bookSeats, lockSeats } from '../controllers/seat.controller';

const router = express.Router();

router.post('/lock', lockSeats);
router.post('/book', bookSeats);

export default router;
