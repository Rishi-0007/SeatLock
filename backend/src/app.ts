import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import eventRoutes from './routes/event.route';
import seatRoutes from './routes/seat.route';

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

app.use(express.json());
app.use('/events', eventRoutes);
app.use('/seats', seatRoutes);

export default app;
