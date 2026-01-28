import { Router } from 'express';
import bodyParser from 'body-parser';
import { stripeWebhookHandler } from '../controllers/stripeWebhook.controller';

const router = Router();

// IMPORTANT: raw body
router.post(
  '/stripe',
  bodyParser.raw({ type: 'application/json' }),
  stripeWebhookHandler
);

export default router;
