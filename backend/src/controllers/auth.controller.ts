import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../prisma/client';
import { signToken } from '../utils/jwt';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Email already in use' });
    }

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

    // Frontend expects { user: { ... } }
    res.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err: any) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
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

    // Frontend expects { user: ... }
    res.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

export const logout = async (_: Request, res: Response) => {
  try {
    res.clearCookie('token');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Logout failed' });
  }
};
