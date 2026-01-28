import { Router } from 'express';
import { createCheckoutSession } from '../controllers/payments.controller';

const router = Router();

router.post('/create-session', createCheckoutSession);

export default router;
