import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { generateStudyPlan } from '../services/openai.service';

const router = Router();

router.use(requireAuth);

router.get('/me', async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: {
      id: true, email: true, userId: true, name: true,
      targetScore: true, testDate: true, xp: true, streak: true,
      createdAt: true, lastActive: true,
    },
  });
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }
  res.json(user);
});

router.patch('/me', async (req: AuthRequest, res: Response): Promise<void> => {
  const schema = z.object({
    name: z.string().min(2).optional(),
    targetScore: z.number().min(1).max(12).optional(),
    testDate: z.string().optional().nullable(),
  });

  const data = schema.parse(req.body);
  const user = await prisma.user.update({
    where: { id: req.userId },
    data: {
      ...data,
      testDate: data.testDate ? new Date(data.testDate) : data.testDate === null ? null : undefined,
    },
    select: {
      id: true, email: true, userId: true, name: true,
      targetScore: true, testDate: true, xp: true, streak: true,
    },
  });
  res.json(user);
});

router.get('/me/dashboard', async (req: AuthRequest, res: Response): Promise<void> => {
  const [user, recentSessions, progressHistory] = await Promise.all([
    prisma.user.findUnique({
      where: { id: req.userId },
      select: { name: true, targetScore: true, testDate: true, xp: true, streak: true },
    }),
    prisma.session.findMany({
      where: { userId: req.userId!, status: 'COMPLETED' },
      orderBy: { completedAt: 'desc' },
      take: 5,
      include: { responses: { select: { skill: true, clbScore: true } } },
    }),
    prisma.progress.findMany({
      where: { userId: req.userId! },
      orderBy: { date: 'desc' },
      take: 40,
    }),
  ]);

  if (!user) { res.status(404).json({ error: 'Not found' }); return; }

  // Compute per-skill CLB averages
  const skillMap: Record<string, number[]> = { LISTENING: [], READING: [], WRITING: [], SPEAKING: [] };
  for (const prog of progressHistory) {
    skillMap[prog.skill]?.push(prog.clbScore);
  }

  const skillScores: Record<string, number | null> = {};
  for (const [skill, scores] of Object.entries(skillMap)) {
    skillScores[skill] = scores.length > 0 ? Math.round(scores.slice(0, 5).reduce((a, b) => a + b, 0) / scores.slice(0, 5).length) : null;
  }

  const allScores = Object.values(skillScores).filter((s): s is number => s !== null);
  const overallClb = allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : null;

  // Detect weak areas
  const weakAreas = Object.entries(skillScores)
    .filter(([, score]) => score !== null && score < (user.targetScore || 9))
    .sort(([, a], [, b]) => (a as number) - (b as number))
    .map(([skill]) => skill);

  res.json({
    user,
    overallClb,
    skillScores,
    weakAreas,
    recentSessions: recentSessions.map(s => ({
      id: s.id,
      type: s.type,
      skill: s.skill,
      clbEstimate: s.clbEstimate,
      completedAt: s.completedAt,
      responseCount: s.responses.length,
    })),
    progressHistory: progressHistory.slice(0, 20),
  });
});

router.post('/me/study-plan', async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { targetScore: true, testDate: true },
  });
  if (!user) { res.status(404).json({ error: 'Not found' }); return; }

  const progressHistory = await prisma.progress.findMany({
    where: { userId: req.userId! },
    orderBy: { date: 'desc' },
    take: 20,
  });

  const skillMap: Record<string, number[]> = { LISTENING: [], READING: [], WRITING: [], SPEAKING: [] };
  for (const p of progressHistory) skillMap[p.skill]?.push(p.clbScore);

  const weakSkills = Object.entries(skillMap)
    .filter(([, scores]) => scores.length === 0 || scores[0] < (user.targetScore || 9))
    .map(([skill]) => skill);

  const currentClb = progressHistory.length > 0
    ? Math.round(progressHistory.slice(0, 5).reduce((a, b) => a + b.clbScore, 0) / Math.min(5, progressHistory.length))
    : 5;

  const daysUntilTest = user.testDate
    ? Math.max(1, Math.ceil((user.testDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 30;

  const plan = await generateStudyPlan(weakSkills, currentClb, user.targetScore || 9, daysUntilTest);

  await prisma.studyPlan.create({
    data: { userId: req.userId!, plan: JSON.stringify(plan) },
  });

  res.json({ plan });
});

router.get('/me/study-plan/latest', async (req: AuthRequest, res: Response): Promise<void> => {
  const studyPlan = await prisma.studyPlan.findFirst({
    where: { userId: req.userId! },
    orderBy: { date: 'desc' },
  });
  if (!studyPlan) { res.status(404).json({ error: 'No study plan yet' }); return; }
  try {
    res.json({ ...studyPlan, plan: JSON.parse(studyPlan.plan as string) });
  } catch {
    res.json(studyPlan);
  }
});

export default router;
