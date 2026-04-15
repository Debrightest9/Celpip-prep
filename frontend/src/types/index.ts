export type Skill = 'LISTENING' | 'READING' | 'WRITING' | 'SPEAKING';
export type SessionType = 'QUICK_PRACTICE' | 'FULL_TEST' | 'WEAK_AREA';
export type SessionStatus = 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';

export interface User {
  id: string;
  email: string;
  userId: string;
  name: string;
  targetScore: number;
  testDate: string | null;
  xp: number;
  streak: number;
  createdAt: string;
  lastActive: string;
}

// Single MCQ item within a section
export interface QuestionItem {
  id: string;           // e.g. "q1", "q2"
  prompt: string;
  options: string[];    // ["A) ...", "B) ...", "C) ...", "D) ..."]
  correctAnswer: string; // "A" | "B" | "C" | "D"
}

// A full reading/listening section (passage + multiple questions)
export interface QuestionSet {
  skill: Skill;
  subType: string;        // 'correspondence' | 'information' | 'viewpoints' | 'conversation' | etc.
  difficulty: number;
  sectionTitle: string;   // e.g. "Reading Correspondence", "Listening — Workplace Discussion"
  instructions: string;
  passage?: string;       // reading text
  audioScript?: string;   // listening transcript
  scenario?: string;
  questions: QuestionItem[];
  timeLimit: number;      // total seconds for the whole section
}

// Single writing/speaking task (unchanged)
export interface Question {
  skill: Skill;
  subType: string;
  difficulty: number;
  instructions: string;
  passage?: string;
  audioScript?: string;
  prompt: string;
  options?: string[];
  correctAnswer?: string;
  timeLimit: number;
  scenario?: string;
  taskContext?: string;
  photoUrl?: string;
}

export interface QuestionItemFeedback {
  questionId: string;
  prompt: string;
  userAnswer: string;
  correctAnswer: string;
  correct: boolean;
  explanation: string;
  keyEvidence: string;
  whyOthersWrong: Record<string, string>;
}

export interface SectionFeedback {
  clbScore: number;
  clbLabel: string;
  totalCorrect: number;
  totalQuestions: number;
  overallScore: number;
  items: QuestionItemFeedback[];
  generalTips: string[];
}

export interface Response {
  id: string;
  sessionId: string;
  skill: Skill;
  subType: string;
  question: Question | QuestionSet;
  userAnswer: string;
  score: number | null;
  clbScore: number | null;
  feedback: WritingFeedback | SpeakingFeedback | SectionFeedback | null;
  timeTaken: number | null;
  createdAt: string;
}

export interface WritingFeedback {
  clbScore: number;
  clbLabel: string;
  overallScore: number;
  taskAchievement: { score: number; comment: string };
  coherence: { score: number; comment: string };
  vocabulary: { score: number; comment: string };
  grammar: { score: number; comment: string };
  corrections: Array<{ original: string; corrected: string; explanation: string }>;
  improvedVersion: string;
  band9Sample: string;
  tips: string[];
}

export interface SpeakingFeedback {
  clbScore: number;
  clbLabel: string;
  overallScore: number;
  fluency: { score: number; comment: string };
  pronunciation: { score: number; comment: string };
  vocabulary: { score: number; comment: string };
  contentRelevance: { score: number; comment: string };
  improvedAnswer: string;
  band9Sample: string;
  tips: string[];
}

// Legacy single-question feedback (kept for existing data)
export interface ReadingListeningFeedback {
  clbScore: number;
  clbLabel: string;
  overallScore: number;
  correct: boolean;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  keyEvidence: string;
  whyOthersWrong: Record<string, string>;
}

export interface CoachFeedback {
  weakPatterns: string[];
  personalizedTips: string[];
  templates: Array<{ title: string; template: string }>;
  predictedReadiness: string;
  studyFocus: string[];
}

export interface Session {
  id: string;
  userId: string;
  type: SessionType;
  skill: Skill | null;
  status: SessionStatus;
  startedAt: string;
  completedAt: string | null;
  totalScore: number | null;
  clbEstimate: number | null;
  overallFeedback: CoachFeedback | null;
  responses: Response[];
}

export interface ProgressEntry {
  date: string;
  clbScore: number;
  score: number | null;
}

export interface DashboardData {
  user: {
    name: string;
    targetScore: number;
    testDate: string | null;
    xp: number;
    streak: number;
  };
  overallClb: number | null;
  skillScores: Record<Skill, number | null>;
  weakAreas: Skill[];
  recentSessions: Array<{
    id: string;
    type: SessionType;
    skill: Skill | null;
    clbEstimate: number | null;
    completedAt: string | null;
    responseCount: number;
  }>;
  progressHistory: ProgressEntry[];
}
