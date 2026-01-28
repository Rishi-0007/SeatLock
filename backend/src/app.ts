import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import eventRoutes from './routes/event.route';
import seatRoutes from './routes/seat.route';
import paymentRoutes from './routes/payment.route';
import webhookRoutes from './routes/webhook.route';

dotenv.config();
const app = express();

app.use(
  cors(
    process.env.NODE_ENV === 'production'
      ? {
          origin: process.env.FRONTEND_URL,
        }
      : {}
  )
);

// Webhook route should be before express.json middleware
app.use('/webhooks', webhookRoutes);

app.use(express.json());
app.use('/events', eventRoutes);
app.use('/seats', seatRoutes);
app.use('/payments', paymentRoutes);

export default app;
