import { Router, Response } from 'express';
import { login, logout, register } from '../controllers/auth.controller';
import { AuthRequest, requireAuth } from '../middlewares/auth';
import { prisma } from '../prisma/client';

const router: Router = Router();

router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/register', register);
router.post('/login', login);
router.post('/logout', requireAuth, logout);

export default router;
