import { Router } from 'express';
import { createCheckoutSession } from '../controllers/payments.controller';
import { requireAuth } from '../middlewares/auth';

const router = Router();

router.post('/create-session', requireAuth, createCheckoutSession);

export default router;
