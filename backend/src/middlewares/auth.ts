import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export interface AuthRequest extends Request {
  userId?: string;
}

export const requireAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  console.log('[AuthMiddleware] Cookies:', req.cookies);
  const token = req.cookies?.token;
  
  if (!token) {
    console.log('[AuthMiddleware] Token missing');
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const payload = verifyToken(token);
    console.log('[AuthMiddleware] Token verified:', payload);
    req.userId = payload.userId;
    next();
  } catch (err) {
    console.log('[AuthMiddleware] Token verification failed:', err);
    return res.status(401).json({ message: 'Invalid token' });
  }
};
