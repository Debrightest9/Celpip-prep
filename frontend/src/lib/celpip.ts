// Official CELPIP exam structure — used by Quick Practice and Full Test

export interface CelpipPart {
  number: number;        // part number within the skill (1-based)
  subType: string;       // sent to the API
  name: string;          // short display name
  description: string;   // shown on the selection card
  questionCount: number; // approximate questions per part (in real exam)
  timeMinutes: number;   // approximate minutes
}

export const LISTENING_PARTS: CelpipPart[] = [
  {
    number: 1, subType: 'conversation',
    name: 'Everyday Conversation',
    description: 'Two people having a casual conversation about daily life topics.',
    questionCount: 5, timeMinutes: 8,
  },
  {
    number: 2, subType: 'phone_message',
    name: 'Phone Message',
    description: 'A recorded voicemail or phone message left for someone.',
    questionCount: 5, timeMinutes: 7,
  },
  {
    number: 3, subType: 'news',
    name: 'News Item',
    description: 'A short radio or TV news report about a Canadian issue.',
    questionCount: 5, timeMinutes: 8,
  },
  {
    number: 4, subType: 'discussion',
    name: 'Discussion',
    description: 'A workplace or community meeting with 2–3 speakers.',
    questionCount: 8, timeMinutes: 12,
  },
  {
    number: 5, subType: 'presentation',
    name: 'Presentation',
    description: 'A seminar, lecture, or professional briefing on an informational topic.',
    questionCount: 8, timeMinutes: 12,
  },
  {
    number: 6, subType: 'viewpoint',
    name: 'Viewpoint',
    description: 'A radio interview or broadcast opinion piece on a social issue.',
    questionCount: 8, timeMinutes: 12,
  },
];

export const READING_PARTS: CelpipPart[] = [
  {
    number: 1, subType: 'correspondence',
    name: 'Correspondence',
    description: 'An email chain or formal letter between two parties.',
    questionCount: 11, timeMinutes: 11,
  },
  {
    number: 2, subType: 'diagram',
    name: 'Diagram / Form',
    description: 'A document with instructions, a form, or a step-by-step procedure.',
    questionCount: 8, timeMinutes: 8,
  },
  {
    number: 3, subType: 'information',
    name: 'Reading for Information',
    description: 'An article, report, or notice conveying factual information.',
    questionCount: 9, timeMinutes: 9,
  },
  {
    number: 4, subType: 'viewpoints',
    name: 'Reading for Viewpoints',
    description: 'An opinion piece or editorial where the writer argues a position.',
    questionCount: 9, timeMinutes: 9,
  },
];

export interface CelpipTask {
  number: number;
  subType: string;
  name: string;
  description: string;
  timeMinutes: number;
  prepSeconds?: number;
  responseSeconds?: number;
}

export const WRITING_TASKS: CelpipTask[] = [
  {
    number: 1, subType: 'email',
    name: 'Task 1 — Email',
    description: 'Write an email of 150–200 words addressing three bullet points.',
    timeMinutes: 27,
  },
  {
    number: 2, subType: 'survey',
    name: 'Task 2 — Survey Response',
    description: 'Write a 150–200 word opinion response to a community or workplace survey.',
    timeMinutes: 26,
  },
];

export const SPEAKING_TASKS: CelpipTask[] = [
  { number: 1, subType: 'giving_advice',           name: 'Task 1 — Giving Advice',                    description: 'Give advice to a friend who is facing a difficult personal or work situation.',            timeMinutes: 2, prepSeconds: 30, responseSeconds: 90 },
  { number: 2, subType: 'personal_experience',     name: 'Task 2 — Personal Experience',              description: 'Describe a memorable experience from your own life and what you learned from it.',        timeMinutes: 2, prepSeconds: 30, responseSeconds: 60 },
  { number: 3, subType: 'describing_scene',        name: 'Task 3 — Describing a Scene',               description: 'Describe what is happening in a scene or picture in as much detail as possible.',          timeMinutes: 2, prepSeconds: 30, responseSeconds: 60 },
  { number: 4, subType: 'making_prediction',       name: 'Task 4 — Making Predictions',               description: 'Talk about what you think will happen in the future regarding a given topic.',             timeMinutes: 2, prepSeconds: 30, responseSeconds: 60 },
  { number: 5, subType: 'comparing_options',       name: 'Task 5 — Comparing & Persuading',           description: 'Compare two options and persuade a friend or colleague to choose one of them.',            timeMinutes: 2, prepSeconds: 40, responseSeconds: 60 },
  { number: 6, subType: 'dealing_with_difficulty', name: 'Task 6 — Dealing with a Difficult Situation', description: 'Explain a challenging situation you are in and describe how you would handle it.',      timeMinutes: 2, prepSeconds: 60, responseSeconds: 60 },
  { number: 7, subType: 'expressing_opinion',      name: 'Task 7 — Expressing Opinions',              description: 'Share and clearly defend your personal opinion on a social or community issue.',           timeMinutes: 2, prepSeconds: 30, responseSeconds: 90 },
  { number: 8, subType: 'unusual_situation',       name: 'Task 8 — Describing an Unusual Situation',  description: 'Describe an unexpected situation that has happened and explain what you would do.',        timeMinutes: 2, prepSeconds: 30, responseSeconds: 60 },
];

// Full test structure — 20 steps in real CELPIP order
export interface FullTestStep {
  skill: 'LISTENING' | 'READING' | 'WRITING' | 'SPEAKING';
  partNumber: number;
  partName: string;
  type: 'section' | 'single';  // section = R/L multi-question, single = W/S
  subType?: string;             // for W/S tasks
  questionCount: number;
}

export const FULL_TEST_STEPS: FullTestStep[] = [
  ...LISTENING_PARTS.map(p => ({
    skill: 'LISTENING' as const, partNumber: p.number, partName: p.name,
    type: 'section' as const, questionCount: 6,
  })),
  ...READING_PARTS.map(p => ({
    skill: 'READING' as const, partNumber: p.number, partName: p.name,
    type: 'section' as const, questionCount: 6,
  })),
  ...WRITING_TASKS.map(t => ({
    skill: 'WRITING' as const, partNumber: t.number, partName: t.name,
    type: 'single' as const, subType: t.subType, questionCount: 1,
  })),
  ...SPEAKING_TASKS.map(t => ({
    skill: 'SPEAKING' as const, partNumber: t.number, partName: t.name,
    type: 'single' as const, subType: t.subType, questionCount: 1,
  })),
];
