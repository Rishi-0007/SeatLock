import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../prisma/client';
import { signToken } from '../utils/jwt';

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
    },
  });

  const token = signToken(user.id);

  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false, // true in prod
  });

  res.json({ success: true });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

  const token = signToken(user.id);

  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
  });

  res.json({ success: true });
};

export const logout = async (_: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ success: true });
};
