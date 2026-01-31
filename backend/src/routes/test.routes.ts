import { Router } from 'express';
import { startTest, getTestStatus, getTestReport } from '../controllers/test.controller';

const router = Router();

// Start a new concurrency test
router.post('/start', startTest);

// Get test status
router.get('/:id/status', getTestStatus);

// Get final test report
router.get('/:id/report', getTestReport);

export default router;
