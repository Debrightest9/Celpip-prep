import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { env } from '../config/env';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6).optional(),
  targetScore: z.number().min(1).max(12).default(9),
  testDate: z.string().optional(),
});

const loginSchema = z.object({
  emailOrId: z.string(),
  password: z.string().optional(),
});

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const data = registerSchema.parse(req.body);

    const exists = await prisma.user.findUnique({ where: { email: data.email } });
    if (exists) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    const userId = `CP${Date.now().toString(36).toUpperCase()}`;
    const hashedPassword = data.password ? await bcrypt.hash(data.password, 10) : null;

    const user = await prisma.user.create({
      data: {
        email: data.email,
        userId,
        name: data.name,
        password: hashedPassword,
        targetScore: data.targetScore,
        testDate: data.testDate ? new Date(data.testDate) : null,
      },
      select: { id: true, email: true, userId: true, name: true, targetScore: true, testDate: true, xp: true, streak: true },
    });

    const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as unknown as number });
    res.status(201).json({ user, token });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: err.errors });
      return;
    }
    throw err;
  }
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { emailOrId, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: emailOrId }, { userId: emailOrId }],
      },
    });

    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    if (user.password && password) {
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        res.status(401).json({ error: 'Invalid password' });
        return;
      }
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastActive: new Date() },
    });

    const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as unknown as number });
    const { password: _, ...safeUser } = user;
    res.json({ user: safeUser, token });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: err.errors });
      return;
    }
    throw err;
  }
});

export default router;
