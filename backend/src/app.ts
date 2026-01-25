import express from 'express';
import dotenv from 'dotenv';

import eventRoutes from './routes/event.route';
import seatRoutes from './routes/seat.route';

dotenv.config();
const app = express();

app.use(express.json());
app.use('/events', eventRoutes);
app.use('/seats', seatRoutes);

export default app;
