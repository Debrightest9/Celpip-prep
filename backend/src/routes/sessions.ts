import { Router, Response } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';
import {
  evaluateWriting,
  evaluateReadingListening,
  evaluateSpeaking,
  evaluateSection,
  transcribeAudio,
  generateCoachFeedback,
  GeneratedQuestion,
  GeneratedSection,
} from '../services/openai.service';

const router = Router();
router.use(requireAuth);

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

// SQLite stores JSON as text — helpers to serialize/deserialize
const j = (v: unknown): string => JSON.stringify(v);
const p = <T = unknown>(v: string | null | undefined): T | null => {
  try { return v ? (JSON.parse(v) as T) : null; } catch { return null; }
};

interface RawResponse {
  id: string; sessionId: string; skill: string; subType: string;
  question: string; userAnswer: string; score: number | null;
  clbScore: number | null; feedback: string | null; band9Sample: string | null;
  timeTaken: number | null; createdAt: Date;
}

interface RawSession {
  id: string; userId: string; type: string; skill: string | null;
  status: string; startedAt: Date; completedAt: Date | null;
  totalScore: number | null; clbEstimate: number | null;
  overallFeedback: string | null; responses?: RawResponse[];
}

function deserializeSession(s: RawSession) {
  return {
    ...s,
    overallFeedback: p(s.overallFeedback),
    responses: s.responses?.map(r => ({
      ...r,
      question: p(r.question),
      feedback: p(r.feedback),
    })),
  };
}

// ── Start session ─────────────────────────────────────────────────────────────
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const schema = z.object({
    type: z.enum(['QUICK_PRACTICE', 'FULL_TEST', 'WEAK_AREA']),
    skill: z.enum(['LISTENING', 'READING', 'WRITING', 'SPEAKING']).optional(),
  });
  const { type, skill } = schema.parse(req.body);
  const session = await prisma.session.create({
    data: { userId: req.userId!, type, skill: skill ?? null, status: 'IN_PROGRESS' },
  });
  res.status(201).json({ session });
});

// ── Submit text answer ────────────────────────────────────────────────────────
router.post('/:sessionId/respond', async (req: AuthRequest, res: Response): Promise<void> => {
  const schema = z.object({
    skill: z.enum(['LISTENING', 'READING', 'WRITING', 'SPEAKING']),
    subType: z.string(),
    question: z.record(z.unknown()),
    userAnswer: z.string(),
    timeTaken: z.number().optional(),
  });
  const { skill, subType, question, userAnswer, timeTaken } = schema.parse(req.body);
  const sessionId = req.params['sessionId'] as string;

  const session = await prisma.session.findFirst({
    where: { id: sessionId, userId: req.userId! },
  });
  if (!session) { res.status(404).json({ error: 'Session not found' }); return; }

  let feedback: unknown;
  let clbScore: number;
  let score: number;

  if (skill === 'WRITING') {
    const result = await evaluateWriting(question as unknown as GeneratedQuestion, userAnswer);
    feedback = result; clbScore = result.clbScore; score = result.overallScore;
  } else if (skill === 'READING' || skill === 'LISTENING') {
    const result = await evaluateReadingListening(question as unknown as GeneratedQuestion, userAnswer);
    feedback = result; clbScore = result.clbScore; score = result.overallScore;
  } else {
    res.status(400).json({ error: 'Use /respond-audio for speaking' }); return;
  }

  const response = await prisma.response.create({
    data: {
      sessionId: session.id, skill, subType,
      question: j(question), userAnswer,
      feedback: j(feedback), clbScore, score,
      timeTaken: timeTaken ?? null,
    },
  });

  await prisma.progress.create({
    data: { userId: req.userId!, skill, clbScore, score },
  });

  res.json({ response: { ...response, question, feedback }, feedback });
});

// ── Submit section (reading/listening multi-question) ────────────────────────
router.post('/:sessionId/respond-section', async (req: AuthRequest, res: Response): Promise<void> => {
  const schema = z.object({
    skill: z.enum(['READING', 'LISTENING']),
    section: z.record(z.unknown()),
    answers: z.record(z.string()),   // { q1: "A", q2: "C", ... }
    timeTaken: z.number().optional(),
  });
  try {
    const { skill, section, answers, timeTaken } = schema.parse(req.body);
    const sessionId = req.params['sessionId'] as string;

    const sess = await prisma.session.findFirst({ where: { id: sessionId, userId: req.userId! } });
    if (!sess) { res.status(404).json({ error: 'Session not found' }); return; }

    const sectionData = section as unknown as GeneratedSection;
    const feedback = await evaluateSection(sectionData, answers);
    const { clbScore, overallScore } = feedback;

    const response = await prisma.response.create({
      data: {
        sessionId: sess.id, skill, subType: sectionData.subType,
        question: j(sectionData),
        userAnswer: j(answers),
        feedback: j(feedback),
        clbScore, score: overallScore,
        timeTaken: timeTaken ?? null,
      },
    });

    await prisma.progress.create({
      data: { userId: req.userId!, skill, clbScore, score: overallScore },
    });

    res.json({ response: { ...response, question: sectionData, feedback }, feedback });
  } catch (err: unknown) {
    const msg = (err as { message?: string }).message || 'Evaluation failed';
    res.status(500).json({ error: msg });
  }
});

// ── Submit audio (speaking) ───────────────────────────────────────────────────
router.post('/:sessionId/respond-audio', upload.single('audio'), async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.file) { res.status(400).json({ error: 'Audio file required' }); return; }
  const { subType, question, timeTaken } = req.body as { subType?: string; question?: string; timeTaken?: string };
  if (!question) { res.status(400).json({ error: 'Question data required' }); return; }
  const sessionId = req.params['sessionId'] as string;

  const session = await prisma.session.findFirst({
    where: { id: sessionId, userId: req.userId! },
  });
  if (!session) { res.status(404).json({ error: 'Session not found' }); return; }

  const questionData: GeneratedQuestion = typeof question === 'string' ? JSON.parse(question) : question;
  const transcript = await transcribeAudio(req.file.buffer, req.file.mimetype);
  const feedback = await evaluateSpeaking(questionData, transcript);
  const clbScore = feedback.clbScore;
  const score = feedback.overallScore;

  const response = await prisma.response.create({
    data: {
      sessionId: session.id, skill: 'SPEAKING',
      subType: subType || 'speaking', question: j(questionData),
      userAnswer: transcript, feedback: j(feedback),
      clbScore, score,
      timeTaken: timeTaken ? parseInt(timeTaken) : null,
    },
  });

  await prisma.progress.create({
    data: { userId: req.userId!, skill: 'SPEAKING', clbScore, score },
  });

  res.json({ transcript, response: { ...response, question: questionData, feedback }, feedback });
});

// ── Complete session + coach feedback ─────────────────────────────────────────
router.post('/:sessionId/complete', async (req: AuthRequest, res: Response): Promise<void> => {
  const sessionId = req.params['sessionId'] as string;

  const session = await prisma.session.findFirst({
    where: { id: sessionId, userId: req.userId! },
    include: { responses: true },
  }) as (RawSession & { responses: RawResponse[] }) | null;

  if (!session) { res.status(404).json({ error: 'Session not found' }); return; }

  const user = await prisma.user.findUnique({
    where: { id: req.userId! }, select: { targetScore: true },
  });

  const responses = session.responses.map(r => ({
    skill: r.skill,
    clbScore: r.clbScore ?? 5,
    feedback: p<Record<string, unknown>>(r.feedback) ?? {},
    question: p<Record<string, unknown>>(r.question) ?? {},
  }));

  const avgClb = responses.length > 0
    ? Math.round(responses.reduce((a, b) => a + b.clbScore, 0) / responses.length)
    : null;

  const totalScore = responses.length > 0
    ? Math.round(responses.reduce((a, b) => a + ((b.feedback['overallScore'] as number) || b.clbScore * 8), 0) / responses.length)
    : null;

  let overallFeedback = null;
  if (responses.length > 0) {
    overallFeedback = await generateCoachFeedback(responses, user?.targetScore ?? 9);
  }

  const updatedSession = await prisma.session.update({
    where: { id: session.id },
    data: {
      status: 'COMPLETED', completedAt: new Date(),
      clbEstimate: avgClb, totalScore,
      overallFeedback: j(overallFeedback),
    },
    include: { responses: true },
  }) as RawSession & { responses: RawResponse[] };

  const xpGained = (responses.length * 10) + (avgClb ? avgClb * 5 : 0);
  await prisma.user.update({
    where: { id: req.userId! },
    data: { xp: { increment: xpGained }, lastActive: new Date() },
  });

  res.json({ session: deserializeSession(updatedSession), overallFeedback, xpGained });
});

// ── Get session ───────────────────────────────────────────────────────────────
router.get('/:sessionId', async (req: AuthRequest, res: Response): Promise<void> => {
  const sessionId = req.params['sessionId'] as string;
  const session = await prisma.session.findFirst({
    where: { id: sessionId, userId: req.userId! },
    include: { responses: true },
  }) as (RawSession & { responses: RawResponse[] }) | null;

  if (!session) { res.status(404).json({ error: 'Session not found' }); return; }
  res.json({ session: deserializeSession(session) });
});

// ── List sessions ─────────────────────────────────────────────────────────────
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const page = parseInt(req.query['page'] as string) || 1;
  const limit = Math.min(parseInt(req.query['limit'] as string) || 10, 50);
  const skip = (page - 1) * limit;

  const [sessions, total] = await Promise.all([
    prisma.session.findMany({
      where: { userId: req.userId! },
      orderBy: { startedAt: 'desc' },
      skip, take: limit,
      include: { responses: { select: { skill: true, clbScore: true, score: true } } },
    }),
    prisma.session.count({ where: { userId: req.userId! } }),
  ]);

  res.json({ sessions, total, page, pages: Math.ceil(total / limit) });
});

export default router;
