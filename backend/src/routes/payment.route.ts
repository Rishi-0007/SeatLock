import { Router } from 'express';
import { createCheckoutSession, verifySession } from '../controllers/payments.controller';
import { requireAuth } from '../middlewares/auth';

const router = Router();

router.post('/create-session', requireAuth, createCheckoutSession);
router.get('/verify-session', verifySession);

export default router;
