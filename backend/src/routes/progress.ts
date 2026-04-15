import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const skill = req.query.skill as string | undefined;
  const days = parseInt(req.query.days as string) || 30;

  const since = new Date();
  since.setDate(since.getDate() - days);

  const progress = await prisma.progress.findMany({
    where: {
      userId: req.userId!,
      ...(skill ? { skill: skill as 'LISTENING' | 'READING' | 'WRITING' | 'SPEAKING' } : {}),
      date: { gte: since },
    },
    orderBy: { date: 'asc' },
  });

  // Group by skill
  const bySkill: Record<string, Array<{ date: string; clbScore: number; score: number | null }>> = {
    LISTENING: [], READING: [], WRITING: [], SPEAKING: [],
  };

  for (const p of progress) {
    bySkill[p.skill]?.push({ date: p.date.toISOString(), clbScore: p.clbScore, score: p.score });
  }

  // Compute trend per skill
  const trends: Record<string, { current: number | null; change: number | null; direction: string }> = {};
  for (const [sk, entries] of Object.entries(bySkill)) {
    if (entries.length === 0) {
      trends[sk] = { current: null, change: null, direction: 'neutral' };
    } else {
      const current = entries[entries.length - 1].clbScore;
      const earlier = entries.length > 1 ? entries[0].clbScore : current;
      const change = current - earlier;
      trends[sk] = { current, change, direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral' };
    }
  }

  res.json({ bySkill, trends });
});

router.get('/stats', async (req: AuthRequest, res: Response): Promise<void> => {
  const [totalSessions, completedSessions, totalResponses] = await Promise.all([
    prisma.session.count({ where: { userId: req.userId! } }),
    prisma.session.count({ where: { userId: req.userId!, status: 'COMPLETED' } }),
    prisma.response.count({ where: { session: { userId: req.userId! } } }),
  ]);

  const user = await prisma.user.findUnique({
    where: { id: req.userId! },
    select: { xp: true, streak: true, createdAt: true },
  });

  const bestScores = await prisma.progress.groupBy({
    by: ['skill'],
    where: { userId: req.userId! },
    _max: { clbScore: true },
  });

  res.json({
    totalSessions,
    completedSessions,
    totalResponses,
    xp: user?.xp || 0,
    streak: user?.streak || 0,
    memberSince: user?.createdAt,
    bestScores: bestScores.reduce((acc, s) => ({ ...acc, [s.skill]: s._max.clbScore }), {}),
  });
});

export default router;
