import { Router } from 'express';
import { getEventById, getAllEvents } from '../controllers/event.controller';

const router: Router = Router();

router.get('/', getAllEvents);
router.get('/:id/seats', getEventById);

export default router;
