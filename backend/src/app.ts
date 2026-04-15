import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import questionRoutes from './routes/questions';
import sessionRoutes from './routes/sessions';
import progressRoutes from './routes/progress';

const app = express();

app.use(cors({
  origin: [env.FRONTEND_URL, 'http://localhost:3001'],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: 'Too many requests' });
app.use('/api', limiter);

const aiLimiter = rateLimit({ windowMs: 60 * 1000, max: 20, message: 'AI rate limit exceeded' });

app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/questions', aiLimiter, questionRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/progress', progressRoutes);

app.use(errorHandler);

export default app;
