import express from 'express';
import dotenv from 'dotenv';

import eventRoutes from './routes/event.route';

dotenv.config();
const app = express();

app.use(express.json());
app.use('/events', eventRoutes);

export default app;
