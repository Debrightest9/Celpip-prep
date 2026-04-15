import { Router, Response } from 'express';
import { z } from 'zod';
import { requireAuth, AuthRequest } from '../middleware/auth';
import {
  generateListeningQuestion,
  generateReadingQuestion,
  generateWritingTask1,
  generateWritingTask2,
  generateSpeakingTask,
  generateBand9Answer,
  generateReadingSection,
  generateListeningSection,
} from '../services/openai.service';
import { prisma } from '../lib/prisma';

const router = Router();
router.use(requireAuth);

const generateSchema = z.object({
  skill: z.enum(['LISTENING', 'READING', 'WRITING', 'SPEAKING']),
  subType: z.string().optional(),
  difficulty: z.number().min(1).max(10).optional(),
});

router.post('/generate', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { skill, subType, difficulty } = generateSchema.parse(req.body);

    let diff = difficulty;
    if (!diff) {
      const recent = await prisma.progress.findFirst({
        where: { userId: req.userId!, skill },
        orderBy: { date: 'desc' },
      });
      diff = recent ? Math.min(10, Math.max(1, Math.round(recent.clbScore * 0.9))) : 5;
    }

    let question;
    switch (skill) {
      case 'LISTENING': question = await generateListeningQuestion(diff); break;
      case 'READING':   question = await generateReadingQuestion(diff); break;
      case 'WRITING':   question = subType === 'survey' ? await generateWritingTask2(diff) : await generateWritingTask1(diff); break;
      case 'SPEAKING':  question = await generateSpeakingTask(diff, subType); break;
      default: res.status(400).json({ error: 'Invalid skill' }); return;
    }

    res.json({ question });
  } catch (err: unknown) {
    const msg = (err as { message?: string }).message || 'Failed to generate question';
    const isAuthError = msg.includes('401') || msg.includes('Incorrect API key');
    res.status(isAuthError ? 401 : 500).json({
      error: isAuthError ? 'Invalid OpenAI API key — please update OPENAI_API_KEY in backend/.env' : msg,
    });
  }
});

router.post('/generate-section', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const schema = z.object({
      skill: z.enum(['READING', 'LISTENING']),
      difficulty: z.number().min(1).max(10).optional(),
      part: z.number().min(1).max(6).optional(),
    });
    const { skill, difficulty, part } = schema.parse(req.body);

    let diff = difficulty;
    if (!diff) {
      const recent = await prisma.progress.findFirst({
        where: { userId: req.userId!, skill },
        orderBy: { date: 'desc' },
      });
      diff = recent ? Math.min(10, Math.max(1, Math.round(recent.clbScore * 0.9))) : 5;
    }

    const section = skill === 'READING'
      ? await generateReadingSection(diff, part)
      : await generateListeningSection(diff, part);

    res.json({ section });
  } catch (err: unknown) {
    const msg = (err as { message?: string }).message || 'Failed to generate section';
    const isAuthError = msg.includes('401') || msg.includes('Incorrect API key');
    res.status(isAuthError ? 401 : 500).json({
      error: isAuthError ? 'Invalid OpenAI API key — please update OPENAI_API_KEY in backend/.env' : msg,
    });
  }
});

router.post('/band9', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { question } = req.body;
    if (!question) { res.status(400).json({ error: 'Question required' }); return; }
    const answer = await generateBand9Answer(question);
    res.json({ answer });
  } catch (err: unknown) {
    res.status(500).json({ error: (err as { message?: string }).message || 'Failed to generate answer' });
  }
});

export default router;
