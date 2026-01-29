import { Router } from 'express';
import { login, logout, register } from '../controllers/auth.controller';
import { requireAuth } from '../middlewares/auth';

const router: Router = Router();

router.get('/me', requireAuth, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.userId,
    },
  });
});

router.post('/register', register);
router.post('/login', login);
router.post('/logout', requireAuth, logout);

export default router;
