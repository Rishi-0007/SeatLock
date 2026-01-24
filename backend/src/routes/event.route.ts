import { Router } from 'express';
import { getEventById } from '../controllers/event.controller';

const router: Router = Router();

router.get('/:id/seats', getEventById);

export default router;
