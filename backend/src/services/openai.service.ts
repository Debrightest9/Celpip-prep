import OpenAI, { toFile } from 'openai';
import { env } from '../config/env';

let _openai: OpenAI | null = null;
function getClient(): OpenAI {
  if (!_openai) _openai = new OpenAI({
    apiKey: env.OPENAI_API_KEY,
    timeout: 60_000,
    maxRetries: 0,
  });
  return _openai;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GeneratedQuestion {
  skill: string;
  subType: string;
  difficulty: number;
  instructions: string;
  passage?: string;
  audioScript?: string;
  prompt: string;
  options?: string[];
  correctAnswer?: string;
  timeLimit: number;
  prepTime?: number;
  scenario?: string;
  taskContext?: string;
  photoUrl?: string;
}

export interface QuestionItem {
  id: string;
  prompt: string;
  options: string[];
  correctAnswer: string;
}

export interface GeneratedSection {
  skill: string;
  subType: string;
  difficulty: number;
  sectionTitle: string;
  instructions: string;
  passage?: string;
  audioScript?: string;
  scenario?: string;
  questions: QuestionItem[];
  timeLimit: number;
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

export interface StudyPlan {
  day: string;
  focus: string;
  tasks: Array<{ title: string; duration: string; description: string }>;
  tip: string;
}

// ─── System prompt ────────────────────────────────────────────────────────────

const CELPIP_SYSTEM = `You are a certified CELPIP examiner with 10+ years of experience.
You create AUTHENTIC CELPIP exam questions that match the real test format exactly.

CLB SCALE:
- CLB 10-12: Expert/Near-native (very advanced vocabulary, complex grammar, nuanced ideas)
- CLB 9: Strong (varied vocabulary, minor errors only, well-organized, fluent)
- CLB 8: Competent (generally clear, some errors, adequate vocabulary)
- CLB 7: Adequate (meets minimum requirements, noticeable errors, limited range)
- CLB 5-6: Developing (frequent errors, limited vocabulary, ideas unclear at times)

CELPIP EXAM FACTS:
- Listening: 6 parts — everyday conversation, phone message, news item, discussion, presentation, viewpoint
- Reading: 4 parts — correspondence, diagram/form, reading for information, reading for viewpoints
- Writing: Task 1 = email (150-200 words, 27 min), Task 2 = survey response (150-200 words, 26 min)
- Speaking: 8 tasks — Task 1 Giving Advice, Task 2 Personal Experience, Task 3 Describing a Scene, Task 4 Making Predictions, Task 5 Comparing & Persuading, Task 6 Dealing with a Difficult Situation, Task 7 Expressing Opinions, Task 8 Unusual Situation

Always return VALID JSON only. No markdown. No extra text.`;

// ─── Listening ────────────────────────────────────────────────────────────────

export async function generateListeningQuestion(difficulty: number): Promise<GeneratedQuestion> {
  const clb = Math.min(12, Math.round(difficulty * 1.1) + 1);

  const scenarios = [
    'a conversation between two colleagues about a workplace issue',
    'a voicemail message left for a tenant about apartment maintenance',
    'a radio interview about a local community event',
    'two friends discussing plans for the weekend',
    'a customer service call about a billing problem',
    'a conversation between a student and a university advisor',
    'a news report about a city council decision',
    'a manager giving instructions to a new employee',
  ];
  const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];

  const prompt = `Create an authentic CELPIP Listening question (CLB ${clb} level) based on: ${scenario}.

Requirements:
- Audio script must be 90-130 words of natural spoken Canadian English
- Include realistic names (e.g., Sarah, David, Chen, Priya), places (Toronto, Vancouver, Calgary)
- The correct answer must be EXPLICITLY stated or strongly implied in the audio — not a guess
- All 4 options must be plausible (based on content mentioned) — only ONE is clearly correct
- The question must test a specific listening skill: main idea, specific detail, speaker intention, or inference
- Wrong options should be "traps" — things mentioned in the audio but not the correct answer

Return EXACTLY this JSON:
{
  "skill": "LISTENING",
  "subType": "multiple_choice",
  "difficulty": ${difficulty},
  "scenario": "${scenario}",
  "instructions": "Listen to the audio carefully and answer the question.",
  "audioScript": "<90-130 words of natural dialogue or monologue>",
  "prompt": "<specific question testing detail, main idea, or inference>",
  "options": ["A) <plausible option>", "B) <plausible option>", "C) <plausible option>", "D) <plausible option>"],
  "correctAnswer": "<single letter A/B/C/D>",
  "timeLimit": 90
}`;

  const response = await getClient().chat.completions.create({
    model: env.OPENAI_MODEL,
    messages: [{ role: 'system', content: CELPIP_SYSTEM }, { role: 'user', content: prompt }],
    temperature: 0.75,
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content || '{}') as GeneratedQuestion;
}

// ─── Reading ──────────────────────────────────────────────────────────────────

export async function generateReadingQuestion(difficulty: number): Promise<GeneratedQuestion> {
  const clb = Math.min(12, Math.round(difficulty * 1.1) + 1);

  const types = [
    { type: 'workplace email', detail: 'an email from an HR manager to staff about a policy change' },
    { type: 'community notice', detail: 'a notice from a condo board about upcoming renovations' },
    { type: 'news article excerpt', detail: 'a short article about a new transit expansion in a Canadian city' },
    { type: 'advertisement', detail: 'a job posting for an office administrator role' },
    { type: 'instruction manual excerpt', detail: 'instructions for setting up a new employee ID card system' },
    { type: 'letter', detail: 'a formal complaint letter from a tenant to a landlord' },
  ];
  const chosen = types[Math.floor(Math.random() * types.length)];

  const prompt = `Create an authentic CELPIP Reading comprehension question (CLB ${clb} level).
Text type: ${chosen.type} — ${chosen.detail}

Requirements:
- Passage: 140-190 words, formal Canadian English, realistic names and places
- The correct answer must be DIRECTLY supported by text evidence — quote the key phrase in your explanation
- Wrong options must be plausible but clearly contradicted or unsupported by the text
- Question types: main purpose, specific information, writer's opinion, word meaning in context, or inference

Return EXACTLY this JSON:
{
  "skill": "READING",
  "subType": "comprehension",
  "difficulty": ${difficulty},
  "scenario": "${chosen.type}",
  "instructions": "Read the following ${chosen.type} carefully and answer the question.",
  "passage": "<140-190 word realistic passage>",
  "prompt": "<specific comprehension question>",
  "options": ["A) <option>", "B) <option>", "C) <option>", "D) <option>"],
  "correctAnswer": "<single letter A/B/C/D>",
  "timeLimit": 120
}`;

  const response = await getClient().chat.completions.create({
    model: env.OPENAI_MODEL,
    messages: [{ role: 'system', content: CELPIP_SYSTEM }, { role: 'user', content: prompt }],
    temperature: 0.75,
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content || '{}') as GeneratedQuestion;
}

// ─── Writing Task 1 ───────────────────────────────────────────────────────────

export async function generateWritingTask1(difficulty: number): Promise<GeneratedQuestion> {
  const scenarios = [
    { to: 'your building manager', context: 'A water leak in your apartment has been causing damage for two weeks. Despite reporting it, no repairs have been made.' },
    { to: 'your supervisor at work', context: 'You need to request a schedule change due to a family medical situation that requires you to adjust your hours temporarily.' },
    { to: 'the organizer of a community event', context: 'You attended a neighbourhood cleanup event last Saturday and want to give feedback and offer further help.' },
    { to: 'the customer service department of an online store', context: 'You ordered a laptop three weeks ago, it arrived damaged, and two previous complaints have been ignored.' },
    { to: 'your child\'s school principal', context: 'You are concerned about the lack of after-school programs and want to propose a solution.' },
    { to: 'a new neighbour', context: 'You want to welcome a new family to the neighbourhood and invite them to a community gathering.' },
  ];
  const s = scenarios[Math.floor(Math.random() * scenarios.length)];

  const prompt = `Create an authentic CELPIP Writing Task 1 (Email) prompt.

Scenario: Write an email to ${s.to}. Context: ${s.context}

Requirements:
- Provide exactly 3 bullet points of content the writer MUST address
- Each bullet should require a different type of response (e.g., explain situation + make request + suggest next step)
- The task should be completable in 150-200 words
- Tone requirement should match the recipient (formal/semi-formal)

Return EXACTLY this JSON:
{
  "skill": "WRITING",
  "subType": "email",
  "difficulty": ${difficulty},
  "scenario": "Email to ${s.to}",
  "instructions": "You will have 27 minutes to write an email of about 150–200 words. Address ALL THREE points below.",
  "taskContext": "${s.context}",
  "prompt": "Write an email to ${s.to}.\\n\\nIn your email:\\n• <specific point 1 — explain/describe something>\\n• <specific point 2 — make a request or ask a question>\\n• <specific point 3 — propose action or express feeling>",
  "timeLimit": 1620
}`;

  const response = await getClient().chat.completions.create({
    model: env.OPENAI_MODEL,
    messages: [{ role: 'system', content: CELPIP_SYSTEM }, { role: 'user', content: prompt }],
    temperature: 0.85,
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content || '{}') as GeneratedQuestion;
}

// ─── Writing Task 2 ───────────────────────────────────────────────────────────

export async function generateWritingTask2(difficulty: number): Promise<GeneratedQuestion> {
  const topics = [
    'The city is considering removing parking lots downtown to build more bike lanes. Some residents support this; others oppose it.',
    'A local school board is deciding whether to ban smartphones in classrooms entirely. Parents and students have mixed opinions.',
    'Your company is surveying employees about switching to a 4-day work week with longer daily hours.',
    'The city wants to convert an old factory site into either a new shopping mall or a public park and community centre.',
    'A survey is asking whether public transit should be free for all residents, funded by a small increase in property taxes.',
    'Your neighbourhood association is asking whether a new high-rise apartment building should be approved on a currently empty lot.',
  ];
  const topic = topics[Math.floor(Math.random() * topics.length)];

  const prompt = `Create an authentic CELPIP Writing Task 2 (Survey Response) prompt.

Topic: ${topic}

Requirements:
- The survey should present two clear sides of an issue
- The question should ask for the writer's OPINION with reasons and examples
- Must be answerable in 150-200 words
- Should feel like a real city/workplace/community survey

Return EXACTLY this JSON:
{
  "skill": "WRITING",
  "subType": "survey",
  "difficulty": ${difficulty},
  "scenario": "Community/Workplace Survey",
  "instructions": "You will have 26 minutes to respond to the survey question below in about 150–200 words. Support your opinion with reasons and examples.",
  "passage": "<2-3 sentence survey introduction presenting both sides of the issue>",
  "prompt": "<direct survey question asking for opinion — e.g. 'Do you support or oppose...? Give at least TWO reasons for your position.'>",
  "timeLimit": 1560
}`;

  const response = await getClient().chat.completions.create({
    model: env.OPENAI_MODEL,
    messages: [{ role: 'system', content: CELPIP_SYSTEM }, { role: 'user', content: prompt }],
    temperature: 0.85,
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content || '{}') as GeneratedQuestion;
}

// ─── Speaking ─────────────────────────────────────────────────────────────────

// Maps each official CELPIP speaking task subType to its definition
type ScenarioEntry = string | { description: string; photoUrl: string };

const SPEAKING_TASK_DEFS: Record<string, {
  label: string;
  format: string;
  scenarioBank: ScenarioEntry[];
}> = {
  giving_advice: {
    label: 'Task 1 — Giving Advice',
    format: 'Give 3–4 pieces of clear, specific advice to a friend who is facing a personal or work challenge. Explain why each piece of advice would help.',
    scenarioBank: [
      'Your friend just received two job offers — one pays more but requires long commute, the other is local but lower salary. They ask your advice.',
      'A friend is thinking about going back to school part-time while working full-time. They are unsure if they can handle both. They ask for your honest advice.',
      'Your friend is stressed about a conflict with their supervisor at work and is thinking of quitting. They ask what you think they should do.',
      'A close friend wants to move to a new city where they know nobody for a fresh start. They are nervous and want your thoughts.',
      'Your friend is considering starting a small online business while still working full-time. They ask whether this is a good idea.',
    ],
  },
  personal_experience: {
    label: 'Task 2 — Talking About Personal Experience',
    format: 'Describe a specific personal experience from your life. Include what happened, how you felt or reacted, and what you learned from it.',
    scenarioBank: [
      'Describe a time when you had to learn something new very quickly — perhaps a new skill, tool, or language. What did you do and what did you learn?',
      'Talk about a time when you worked as part of a team to achieve a challenging goal. What was your role and what made it memorable?',
      'Describe a situation where you had to make a difficult decision that turned out well. What was the decision and how did you make it?',
      'Talk about a time when you overcame a fear or stepped outside your comfort zone. What happened and how did it change you?',
      'Describe a time when someone\'s help made a big difference in your life. What did they do and how did it affect you?',
    ],
  },
  describing_scene: {
    label: 'Task 3 — Describing a Scene',
    format: 'Describe the scene in detail — who is there, what is happening, where things are located, and any notable details you observe. Speak as if describing a photograph to someone who cannot see it.',
    scenarioBank: [
      {
        description: 'A busy outdoor farmers\' market on a Saturday morning in Vancouver. Vendors are selling fresh produce, flowers, and baked goods under white canopy tents. A family is browsing near a flower stand. A child is eating a sample of fruit. A dog on a leash is sitting next to its owner by a bakery stall.',
        photoUrl: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=900&q=80',
      },
      {
        description: 'A university library on a weekday afternoon in Toronto. Several students are working at wooden desks with laptops and open textbooks. Two people are whispering by tall bookshelves. A librarian is scanning returned books at a cart near the entrance. Sunlight streams through large windows.',
        photoUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=900&q=80',
      },
      {
        description: 'A community park on a sunny afternoon in Ottawa. A group of seniors is doing outdoor yoga on a grass area. Children are playing on a climbing structure nearby. A food truck is parked at the edge of the park with a small lineup. A jogger is running along the paved path.',
        photoUrl: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=900&q=80',
      },
      {
        description: 'A busy coffee shop on a weekday morning in downtown Toronto. People are typing on laptops and talking on phones. A barista is making drinks behind the counter. A couple is sharing a pastry at a window seat overlooking the street. The menu is written on a large chalkboard on the wall.',
        photoUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=900&q=80',
      },
      {
        description: 'A neighbourhood street during a community block party in Calgary. Tables and chairs are set out on the closed road. A small band is performing on a makeshift stage. Children are playing ring toss games in the street. Neighbours are standing in groups chatting and laughing. Colourful banners hang between houses.',
        photoUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&q=80',
      },
      {
        description: 'A busy airport departure terminal in Montreal. Travellers are pulling rolling luggage and checking departure screens. A family with young children is sitting near a gate eating takeaway food. An airline staff member at a desk is helping a passenger. The terminal is bright with natural light from tall glass windows.',
        photoUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=900&q=80',
      },
      {
        description: 'A Saturday morning in a Canadian suburban neighbourhood. A man is mowing his front lawn. Two children are riding bicycles on the sidewalk. A woman is arranging plants on her porch. A postal worker is delivering mail to a house. Several cars are parked along the quiet street.',
        photoUrl: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=900&q=80',
      },
      {
        description: 'A hospital waiting room in Edmonton. Patients and visitors are sitting in rows of chairs. A nurse in scrubs is walking through the room with a clipboard. A child is playing with toys in a corner play area. A television on the wall is showing the news. A reception desk is visible near the entrance.',
        photoUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=900&q=80',
      },
    ],
  },
  making_prediction: {
    label: 'Task 4 — Making Predictions',
    format: 'Predict what you think will happen in the future about the given topic. Discuss at least two changes you expect to see, provide reasons, and describe how people should prepare.',
    scenarioBank: [
      'How do you think remote work and technology will change the way people work in offices over the next 20 years?',
      'What changes do you predict will happen in how people travel — both locally and internationally — in the next 15 years?',
      'How do you think climate change will affect daily life in Canadian cities over the next 25 years?',
      'What do you think will be the biggest changes in how children are educated in schools over the next 15 years?',
      'How do you think artificial intelligence will change the job market and everyday life for ordinary people in the next decade?',
    ],
  },
  comparing_options: {
    label: 'Task 5 — Comparing & Persuading',
    format: 'Compare both options clearly, then recommend one to your listener. Explain the advantages of your preferred choice and acknowledge the disadvantages of the other option. Be persuasive.',
    scenarioBank: [
      'Your city is choosing between building a new light rail transit line OR adding more express bus routes. Your friend needs to choose which option to support. Compare both and persuade them.',
      'Your company is deciding whether to hold the annual staff party at a formal restaurant OR an outdoor barbecue. Compare both and persuade your colleague to support your preferred option.',
      'Your family is choosing between buying a house in the suburbs with a yard OR renting a condo downtown near transit. Compare both and recommend one.',
      'Your friend must choose between taking a well-paying but stressful corporate job OR a lower-paying but relaxed non-profit position. Compare both options and give your recommendation.',
      'Your team must choose between presenting a project as a live in-person presentation OR a pre-recorded video presentation. Compare both and argue for one.',
    ],
  },
  dealing_with_difficulty: {
    label: 'Task 6 — Dealing with a Difficult Situation',
    format: 'You are placed in a specific difficult or awkward situation. Explain the situation clearly, say how you feel, and describe the steps you would take to resolve or manage it.',
    scenarioBank: [
      'You discover the day before a major work presentation that your co-presenter has quit and all the materials are on their locked computer. Explain the situation and your plan.',
      'You are at a job interview and you realize you are 30 minutes late due to a transit delay. You are outside the building and need to handle this professionally.',
      'You receive a notice that your landlord is increasing your rent by 25% starting next month, which you believe exceeds the legal limit. Explain what you would do.',
      'A coworker has been taking credit for your ideas in meetings. Your manager recently praised the coworker for your work. You need to address this situation professionally.',
      'You agreed to host a dinner party for 10 friends this evening, but your oven has just broken down and the stores are closed. Explain what you would do to handle the situation.',
    ],
  },
  expressing_opinion: {
    label: 'Task 7 — Expressing Opinions',
    format: 'State your opinion clearly at the beginning. Support it with at least two specific reasons or examples. Acknowledge the opposing view briefly, then reinforce your position.',
    scenarioBank: [
      'Some people believe that university education should be free for all citizens. Others think students should pay for their own education. What is your opinion?',
      'Some people argue that social media has done more harm than good for society. Others strongly disagree. What do you think?',
      'Many cities are banning single-use plastics like bags and straws. Some support this, while others think it is unnecessary and inconvenient. What is your view?',
      'Some people believe employees should be required to retire at a fixed age like 65. Others think age should not determine when someone stops working. What is your opinion?',
      'Many schools are debating whether smartphones should be completely banned in classrooms. What is your position on this issue?',
    ],
  },
  unusual_situation: {
    label: 'Task 8 — Describing an Unusual Situation',
    format: 'You are in an unexpected, unusual, or stressful situation. Leave a voicemail or explain the situation to someone. Describe what happened, where you are, what you need, and what your next steps are.',
    scenarioBank: [
      'You are stranded at an airport because your connecting flight was cancelled due to a snowstorm. You have no accommodation booked. Leave a voicemail for a friend who lives nearby.',
      'You locked yourself out of your apartment and your phone is almost dead. You are standing outside in the cold. Leave a voicemail for your building superintendent.',
      'You arrived at the wrong city for a job interview because you booked the wrong location by mistake. Leave a voicemail for the hiring manager to explain and reschedule.',
      'Your car broke down on the highway on your way to an important family event. You have roadside assistance on hold. Leave a voicemail for a family member explaining the situation.',
      'You discovered mid-flight that you left your passport at home. You are about to land at an international destination. Leave a voicemail for a travel agent or family member to explain.',
    ],
  },
};

// Official CELPIP speaking timings (prep + response seconds)
const SPEAKING_TIMINGS: Record<string, { prepTime: number; responseTime: number }> = {
  giving_advice:           { prepTime: 30, responseTime: 90 },
  personal_experience:     { prepTime: 30, responseTime: 60 },
  describing_scene:        { prepTime: 30, responseTime: 60 },
  making_prediction:       { prepTime: 30, responseTime: 60 },
  comparing_options:       { prepTime: 40, responseTime: 60 },
  dealing_with_difficulty: { prepTime: 60, responseTime: 60 },
  expressing_opinion:      { prepTime: 30, responseTime: 90 },
  unusual_situation:       { prepTime: 30, responseTime: 60 },
};

export async function generateSpeakingTask(difficulty: number, subType?: string): Promise<GeneratedQuestion> {
  const clb = Math.min(12, Math.round(difficulty * 1.1) + 1);

  const resolvedSubType = (subType && SPEAKING_TASK_DEFS[subType])
    ? subType
    : Object.keys(SPEAKING_TASK_DEFS)[Math.floor(Math.random() * 8)];

  const taskDef = SPEAKING_TASK_DEFS[resolvedSubType];
  const timing = SPEAKING_TIMINGS[resolvedSubType] ?? { prepTime: 30, responseTime: 60 };
  const rawScenario = taskDef.scenarioBank[Math.floor(Math.random() * taskDef.scenarioBank.length)];

  const isPhotoTask = typeof rawScenario === 'object';
  const scenarioText = isPhotoTask ? (rawScenario as { description: string }).description : rawScenario as string;
  const photoUrl = isPhotoTask ? (rawScenario as { photoUrl: string }).photoUrl : undefined;

  const prompt = `Create an authentic CELPIP Speaking task at CLB ${clb} level (difficulty ${difficulty}/10).

TASK TYPE: ${taskDef.label}
TASK FORMAT: ${taskDef.format}
BASE SCENARIO: ${scenarioText}

Requirements:
- Adapt the scenario with specific, realistic Canadian names, places, and details
- Give exactly 3 bullet points the speaker MUST address in their response
- Each bullet should require a different kind of response (e.g., describe, explain, give reason, compare, recommend, give example)
- The full task should be answerable in ${timing.responseTime} seconds of natural speech
- The situation/context must be clearly stated so the speaker knows exactly what to talk about

Return EXACTLY this JSON (no markdown, no extra fields):
{
  "skill": "SPEAKING",
  "subType": "${resolvedSubType}",
  "difficulty": ${difficulty},
  "scenario": "${taskDef.label}",
  "instructions": "You have ${timing.prepTime} seconds to prepare and ${timing.responseTime} seconds to speak. Address ALL three points below.",
  "prompt": "<2–3 sentences setting up the specific situation clearly>\\n\\nIn your response:\\n• <bullet point 1 — specific action/description required>\\n• <bullet point 2 — specific explanation or comparison required>\\n• <bullet point 3 — recommendation, opinion, or reflection required>",
  "prepTime": ${timing.prepTime},
  "timeLimit": ${timing.responseTime}
}`;

  const response = await getClient().chat.completions.create({
    model: env.OPENAI_MODEL,
    messages: [{ role: 'system', content: CELPIP_SYSTEM }, { role: 'user', content: prompt }],
    temperature: 0.85,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error('OpenAI returned empty response for speaking task');
  const result = JSON.parse(content) as GeneratedQuestion;
  // Ensure correct timings are always set regardless of what the model returns
  result.prepTime = timing.prepTime;
  result.timeLimit = timing.responseTime;
  if (photoUrl) result.photoUrl = photoUrl;
  return result;
}

// ─── Writing Evaluation ───────────────────────────────────────────────────────

export async function evaluateWriting(
  question: GeneratedQuestion,
  userAnswer: string
): Promise<WritingFeedback> {
  const wordCount = userAnswer.trim().split(/\s+/).filter(Boolean).length;

  const prompt = `You are a CELPIP Writing examiner. Evaluate this response against CELPIP official scoring criteria.

TASK TYPE: ${question.subType === 'email' ? 'Writing Task 1 — Email (27 min, 150-200 words)' : 'Writing Task 2 — Survey Response (26 min, 150-200 words)'}
TASK PROMPT: ${question.prompt}
${question.taskContext ? `CONTEXT: ${question.taskContext}` : ''}
${question.passage ? `SURVEY INTRO: ${question.passage}` : ''}

STUDENT RESPONSE (${wordCount} words):
"""
${userAnswer}
"""

SCORING CRITERIA (CELPIP official):
- Task Achievement (25%): Did they address ALL required points? Is the purpose clear? Appropriate register/tone?
- Coherence & Cohesion (25%): Is it well-organized? Logical flow? Effective use of linking words?
- Vocabulary (25%): Range and accuracy of vocabulary? Appropriate formality? Any awkward phrasing?
- Grammar (25%): Sentence variety? Accuracy? Correct use of tenses, articles, prepositions?

CLB SCALE:
- CLB 10-12: 90-100% — near-native, sophisticated, virtually error-free
- CLB 9: 80-89% — strong, varied, only minor slips
- CLB 8: 70-79% — competent, some errors but meaning clear
- CLB 7: 60-69% — adequate, noticeable errors, limited range
- CLB 6: 50-59% — developing, frequent errors, some ideas unclear
- CLB 5 or below: under 50%

Return EXACTLY this JSON:
{
  "clbScore": <integer 1-12>,
  "clbLabel": "<e.g. 'CLB 8 — Competent'>",
  "overallScore": <0-100>,
  "taskAchievement": { "score": <0-100>, "comment": "<2-3 specific sentences about how well they addressed the task, referencing their actual content>" },
  "coherence": { "score": <0-100>, "comment": "<2-3 specific sentences about organization and flow, referencing actual transitions used>" },
  "vocabulary": { "score": <0-100>, "comment": "<2-3 sentences noting specific word choices — quote their words and suggest better alternatives>" },
  "grammar": { "score": <0-100>, "comment": "<2-3 sentences noting specific grammar patterns — quote actual errors>" },
  "corrections": [
    { "original": "<exact phrase from their text>", "corrected": "<improved version>", "explanation": "<clear grammar/style rule explanation>" }
  ],
  "improvedVersion": "<Complete rewrite of their response at CLB 9 level — same ideas, better language. Show what excellence looks like.>",
  "band9Sample": "<A completely fresh CLB 9-10 model answer for this task. Show full email/response with subject line if applicable.>",
  "tips": ["<5 specific, actionable tips — each one targeting a real weakness found in their response>"]
}

Be a STRICT but fair examiner. Do not inflate scores. If they missed a bullet point, penalise task achievement heavily.`;

  const response = await getClient().chat.completions.create({
    model: env.OPENAI_MODEL,
    messages: [{ role: 'system', content: CELPIP_SYSTEM }, { role: 'user', content: prompt }],
    temperature: 0.2,
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content || '{}') as WritingFeedback;
}

// ─── Speaking Evaluation ──────────────────────────────────────────────────────

export async function evaluateSpeaking(
  question: GeneratedQuestion,
  transcript: string
): Promise<SpeakingFeedback> {
  const wordCount = transcript.trim().split(/\s+/).filter(Boolean).length;

  const prompt = `You are a CELPIP Speaking examiner. Evaluate this spoken response (transcribed by Whisper).

SPEAKING TASK: ${question.prompt}
TASK TYPE: ${(question.subType || '').replace(/_/g, ' ')}

TRANSCRIPT (${wordCount} words):
"""
${transcript}
"""

Note: This is a transcription — pronunciation cannot be assessed directly. Evaluate based on transcript quality indicators (filler words, incomplete sentences, vocabulary range, grammar, content).

CELPIP SPEAKING CRITERIA:
- Coherence/Fluency: Is the response well-organized? Does it flow naturally? Any signs of hesitation (um, uh, like)?
- Vocabulary: Range and precision of vocabulary used. Variety of expressions.
- Listenability/Pronunciation: Based on transcript — are sentences complete and grammatically formed?
- Task Fulfillment: Did they address ALL bullet points? Is the response relevant and developed?

Return EXACTLY this JSON:
{
  "clbScore": <integer 1-12>,
  "clbLabel": "<e.g. 'CLB 7 — Adequate'>",
  "overallScore": <0-100>,
  "fluency": { "score": <0-100>, "comment": "<specific observations about flow, filler words, sentence completion>" },
  "pronunciation": { "score": <0-100>, "comment": "<assess grammar/sentence structure as proxy for spoken clarity>" },
  "vocabulary": { "score": <0-100>, "comment": "<quote specific words/phrases — what was good and what could be improved>" },
  "contentRelevance": { "score": <0-100>, "comment": "<did they address ALL bullet points? Which ones were missed or underdeveloped?>" },
  "improvedAnswer": "<Show how to say it better — same ideas, CLB 9 phrasing. Write as a spoken transcript.>",
  "band9Sample": "<Complete CLB 9 model answer for this speaking task — natural, fluent, addresses all bullet points fully.>",
  "tips": ["<5 specific, actionable speaking tips based on the actual transcript weaknesses>"]
}`;

  const response = await getClient().chat.completions.create({
    model: env.OPENAI_MODEL,
    messages: [{ role: 'system', content: CELPIP_SYSTEM }, { role: 'user', content: prompt }],
    temperature: 0.2,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error('OpenAI returned empty response for speaking evaluation');
  return JSON.parse(content) as SpeakingFeedback;
}

// ─── Reading/Listening Evaluation ────────────────────────────────────────────

export async function evaluateReadingListening(
  question: GeneratedQuestion,
  userAnswer: string
): Promise<ReadingListeningFeedback> {
  const correct = userAnswer.trim().toUpperCase() === question.correctAnswer?.toUpperCase();

  const prompt = `You are a CELPIP examiner explaining an answer.

SKILL: ${question.skill}
${question.audioScript ? `AUDIO TRANSCRIPT:\n"${question.audioScript}"` : ''}
${question.passage ? `READING PASSAGE:\n"${question.passage}"` : ''}

QUESTION: ${question.prompt}
OPTIONS: ${question.options?.join(' | ')}
CORRECT ANSWER: ${question.correctAnswer}
STUDENT CHOSE: ${userAnswer}
RESULT: ${correct ? 'CORRECT' : 'INCORRECT'}

Return EXACTLY this JSON:
{
  "clbScore": ${correct ? Math.min(12, Math.round(question.difficulty * 1.1) + 1) : Math.max(1, Math.round(question.difficulty * 0.65))},
  "clbLabel": "${correct ? 'Correct answer' : 'Incorrect answer'}",
  "overallScore": ${correct ? 100 : 0},
  "correct": ${correct},
  "userAnswer": "${userAnswer}",
  "correctAnswer": "${question.correctAnswer}",
  "explanation": "<2-3 sentences explaining WHY the correct answer is right — quote the exact words from the audio/passage that prove it>",
  "keyEvidence": "<the exact sentence or phrase from the audio/passage that directly supports the correct answer>",
  "whyOthersWrong": {
    "A": "<why this option is wrong or right — reference the text/audio specifically>",
    "B": "<why this option is wrong or right>",
    "C": "<why this option is wrong or right>",
    "D": "<why this option is wrong or right>"
  }
}`;

  const response = await getClient().chat.completions.create({
    model: env.OPENAI_MODEL,
    messages: [{ role: 'system', content: CELPIP_SYSTEM }, { role: 'user', content: prompt }],
    temperature: 0.1,
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content || '{}') as ReadingListeningFeedback;
}

// ─── Coach Feedback ───────────────────────────────────────────────────────────

export async function generateCoachFeedback(
  responses: Array<{ skill: string; clbScore: number; feedback: Record<string, unknown>; question: Record<string, unknown> }>,
  targetClb: number
): Promise<CoachFeedback> {
  const summary = responses.map(r => ({
    skill: r.skill,
    clbScore: r.clbScore,
    tips: (r.feedback as { tips?: string[] }).tips || [],
    correct: (r.feedback as { correct?: boolean }).correct,
  }));

  const prompt = `You are a CELPIP coach. Analyze this student's session and give a personalized coaching report.

TARGET CLB: ${targetClb}
SESSION RESULTS: ${JSON.stringify(summary, null, 2)}

Return EXACTLY this JSON:
{
  "weakPatterns": ["<3-5 recurring weaknesses identified across their responses — be very specific>"],
  "personalizedTips": ["<5-7 highly actionable tips that directly address their specific mistakes — not generic advice>"],
  "templates": [
    { "title": "CELPIP Email Opening Formulas", "template": "<3-4 ready-to-use email opening sentences for different contexts>" },
    { "title": "Speaking Structure (PEEL)", "template": "Point: State your position\\nEvidence: Give a specific example\\nExplanation: Explain why it matters\\nLink: Connect back to the question" },
    { "title": "Useful Connectors", "template": "<categorized list: Addition / Contrast / Cause-Effect / Sequence / Conclusion>" }
  ],
  "predictedReadiness": "<honest 2-3 sentence assessment of readiness for CLB ${targetClb}>",
  "studyFocus": ["<top 3 priority areas this week, in order of urgency>"]
}`;

  const response = await getClient().chat.completions.create({
    model: env.OPENAI_MODEL,
    messages: [{ role: 'system', content: CELPIP_SYSTEM }, { role: 'user', content: prompt }],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content || '{}') as CoachFeedback;
}

// ─── Study Plan ───────────────────────────────────────────────────────────────

export async function generateStudyPlan(
  weakSkills: string[], currentClb: number, targetClb: number, daysUntilTest: number
): Promise<StudyPlan[]> {
  const prompt = `Generate a focused 7-day CELPIP study plan.

CURRENT CLB: ${currentClb} | TARGET CLB: ${targetClb} | DAYS UNTIL TEST: ${daysUntilTest}
WEAK SKILLS: ${weakSkills.join(', ') || 'all skills'}

Return a JSON object with key "plan" containing an array of 7 day objects:
{
  "plan": [
    {
      "day": "Day 1 — Monday",
      "focus": "<primary skill>",
      "tasks": [
        { "title": "<task>", "duration": "20 min", "description": "<exact what to do>" },
        { "title": "<task>", "duration": "15 min", "description": "<exact what to do>" },
        { "title": "<task>", "duration": "10 min", "description": "<exact what to do>" }
      ],
      "tip": "<one specific tip or key insight for today>"
    }
  ]
}`;

  const response = await getClient().chat.completions.create({
    model: env.OPENAI_MODEL,
    messages: [{ role: 'system', content: CELPIP_SYSTEM }, { role: 'user', content: prompt }],
    temperature: 0.6,
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(response.choices[0].message.content || '{"plan":[]}');
  return (result.plan || result) as StudyPlan[];
}

// ─── Band 9 Answer Generator ──────────────────────────────────────────────────

export async function generateBand9Answer(question: GeneratedQuestion): Promise<string> {
  const prompt = `Write a perfect CLB 9-10 CELPIP answer for this task.

SKILL: ${question.skill} | TASK: ${question.subType}
PROMPT: ${question.prompt}
${question.passage ? `CONTEXT: ${question.passage}` : ''}
${question.taskContext ? `SCENARIO: ${question.taskContext}` : ''}

Write a complete model response that:
- Addresses ALL required points
- Uses sophisticated, varied vocabulary (no repetition)
- Has perfect grammar and sentence variety
- Is well-organized with clear structure
- Hits the target word count (150-200 for writing, 60-90 seconds for speaking)
${question.subType === 'email' ? '- Includes: Subject line, proper salutation, 3 well-developed paragraphs, professional closing' : ''}

Return JSON: { "answer": "<complete model answer>" }`;

  const response = await getClient().chat.completions.create({
    model: env.OPENAI_MODEL,
    messages: [{ role: 'system', content: CELPIP_SYSTEM }, { role: 'user', content: prompt }],
    temperature: 0.4,
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(response.choices[0].message.content || '{"answer":""}');
  return result.answer || '';
}

// ─── CELPIP Part Definitions ──────────────────────────────────────────────────

const READING_PARTS_DEF = [
  {
    number: 1, subType: 'correspondence', title: 'Reading Correspondence',
    desc: 'a workplace email chain OR a formal letter between two parties (tenant/landlord, employee/HR, customer/company)',
    instructions: 'Read the following correspondence and answer the questions.',
    questionFocus: 'Q1: Main purpose  Q2: Specific detail  Q3: Vocabulary in context  Q4: Inference  Q5: Writer intent  Q6: Specific detail',
  },
  {
    number: 2, subType: 'diagram', title: 'Reading to Apply a Diagram',
    desc: 'a document with instructions, a labelled procedure, or a form with explanatory text (e.g. workplace safety checklist, application form instructions, step-by-step guide)',
    instructions: 'Read the following document carefully and answer the questions.',
    questionFocus: 'Q1: Overall purpose  Q2: Specific step/requirement  Q3: Vocabulary in context  Q4: What someone should do based on the document  Q5: Condition/exception stated  Q6: Detail about a specific section',
  },
  {
    number: 3, subType: 'information', title: 'Reading for Information',
    desc: 'an informational article, report, or notice (community newsletter, health bulletin, company policy, government announcement)',
    instructions: 'Read the following passage and answer the questions.',
    questionFocus: 'Q1: Main idea  Q2: Specific fact  Q3: Vocabulary in context  Q4: Inference  Q5: Author\'s purpose  Q6: Specific detail',
  },
  {
    number: 4, subType: 'viewpoints', title: 'Reading for Viewpoints',
    desc: 'an opinion piece or editorial where the writer argues a clear position on a Canadian social issue (housing, transit, environment, education, technology)',
    instructions: 'Read the following opinion piece and answer the questions.',
    questionFocus: 'Q1: Writer\'s main argument  Q2: Supporting evidence cited  Q3: Vocabulary/tone  Q4: Inference about writer\'s position  Q5: Concession or counterpoint  Q6: Writer\'s conclusion/recommendation',
  },
];

const LISTENING_PARTS_DEF = [
  {
    number: 1, subType: 'conversation', title: 'Listening — Everyday Conversation',
    desc: 'a casual conversation between two people about everyday topics (weekend plans, a hobby, a household issue, a mutual friend)',
    instructions: 'Listen to the conversation and answer the questions.',
    words: '150–200',
    questionFocus: 'Q1: Main topic  Q2: Specific detail stated  Q3: Speaker\'s feeling/attitude  Q4: Inference  Q5: Another specific detail  Q6: What is agreed upon / will happen next',
  },
  {
    number: 2, subType: 'phone_message', title: 'Listening — Phone Message',
    desc: 'a recorded voicemail or phone message left by one person for another (appointment confirmation, service follow-up, information request)',
    instructions: 'Listen to the phone message and answer the questions.',
    words: '120–160',
    questionFocus: 'Q1: Main reason for the message  Q2: Specific information given  Q3: Speaker\'s tone/purpose  Q4: What the listener is expected to do  Q5: A specific detail  Q6: Implied next step',
  },
  {
    number: 3, subType: 'news', title: 'Listening — News Item',
    desc: 'a short radio or TV news report on a local Canadian issue (city council, transit, community event, weather advisory, public health)',
    instructions: 'Listen to the news item and answer the questions.',
    words: '150–200',
    questionFocus: 'Q1: Main news topic  Q2: Specific fact reported  Q3: Who said what / source  Q4: Implication of the news  Q5: Another specific detail  Q6: What will happen as a result',
  },
  {
    number: 4, subType: 'discussion', title: 'Listening — Discussion',
    desc: 'a workplace or community meeting discussion between 2–3 people solving a problem or planning something (team meeting, committee, community board)',
    instructions: 'Listen to the discussion and answer the questions.',
    words: '200–260',
    questionFocus: 'Q1: Purpose of the discussion  Q2: A speaker\'s specific point  Q3: How speakers feel about the topic  Q4: Inference about a speaker\'s position  Q5: A decision or fact agreed upon  Q6: What will happen next',
  },
  {
    number: 5, subType: 'presentation', title: 'Listening — Presentation',
    desc: 'a seminar talk, professional briefing, or informational presentation on a single topic (health, environment, technology, community service, workplace policy)',
    instructions: 'Listen to the presentation and answer the questions.',
    words: '220–280',
    questionFocus: 'Q1: Main purpose of the presentation  Q2: A specific fact or statistic  Q3: Speaker\'s attitude toward the topic  Q4: Inference from stated information  Q5: Another specific detail  Q6: Speaker\'s recommendation or conclusion',
  },
  {
    number: 6, subType: 'viewpoint', title: 'Listening — Viewpoint',
    desc: 'a radio interview or broadcast where a guest or commentator shares their opinion on a current Canadian social issue',
    instructions: 'Listen to the viewpoint and answer the questions.',
    words: '200–250',
    questionFocus: 'Q1: Speaker\'s main argument  Q2: Specific evidence or example given  Q3: Speaker\'s tone/attitude  Q4: Inference about speaker\'s position  Q5: A concession the speaker makes  Q6: Speaker\'s final recommendation',
  },
];

// ─── Reading Section ──────────────────────────────────────────────────────────

export async function generateReadingSection(difficulty: number, partNumber?: number): Promise<GeneratedSection> {
  const clb = Math.min(12, Math.round(difficulty * 1.1) + 1);

  const parts = READING_PARTS_DEF;
  const chosen = partNumber
    ? (parts.find(p => p.number === partNumber) ?? parts[Math.floor(Math.random() * parts.length)])
    : parts[Math.floor(Math.random() * parts.length)];

  const prompt = `Create an authentic CELPIP ${chosen.title} section at CLB ${clb} level.

Text type: ${chosen.desc}

REQUIREMENTS:
- Passage: 220–300 words of realistic Canadian English (real names, cities, organizations)
- Generate EXACTLY 6 questions covering: ${chosen.questionFocus}
- Each question: 4 options (A/B/C/D), only ONE correct
- Wrong options must be plausible — draw from details in the passage as distractors
- Every correct answer must be directly supported by quoted evidence in the passage

Return EXACTLY this JSON (no other text):
{
  "skill": "READING",
  "subType": "${chosen.subType}",
  "difficulty": ${difficulty},
  "sectionTitle": "${chosen.title}",
  "instructions": "${chosen.instructions}",
  "scenario": "${chosen.subType}",
  "passage": "<220-300 word passage>",
  "questions": [
    { "id": "q1", "prompt": "<question>", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "correctAnswer": "A" },
    { "id": "q2", "prompt": "<question>", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "correctAnswer": "B" },
    { "id": "q3", "prompt": "<question>", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "correctAnswer": "C" },
    { "id": "q4", "prompt": "<question>", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "correctAnswer": "D" },
    { "id": "q5", "prompt": "<question>", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "correctAnswer": "A" },
    { "id": "q6", "prompt": "<question>", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "correctAnswer": "B" }
  ],
  "timeLimit": 480
}`;

  const response = await getClient().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'system', content: CELPIP_SYSTEM }, { role: 'user', content: prompt }],
    temperature: 0.7,
    response_format: { type: 'json_object' },
    max_tokens: 2000,
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error('OpenAI returned empty response for reading section');
  return JSON.parse(content) as GeneratedSection;
}

// ─── Listening Section ────────────────────────────────────────────────────────

export async function generateListeningSection(difficulty: number, partNumber?: number): Promise<GeneratedSection> {
  const clb = Math.min(12, Math.round(difficulty * 1.1) + 1);

  const parts = LISTENING_PARTS_DEF;
  const chosen = partNumber
    ? (parts.find(p => p.number === partNumber) ?? parts[Math.floor(Math.random() * parts.length)])
    : parts[Math.floor(Math.random() * parts.length)];

  const prompt = `Create an authentic CELPIP ${chosen.title} section at CLB ${clb} level.

Audio type: ${chosen.desc}

REQUIREMENTS:
- Audio script: ${chosen.words} words of natural spoken Canadian English
- Use realistic Canadian names (Emma, David, Chen Wei, Priya, Marcus, Fatima, Liam, Aisha…) and places (Toronto, Vancouver, Calgary, Ottawa, Edmonton, Mississauga)
- Natural speech: contractions, hesitations where appropriate, realistic dialogue flow
- Generate EXACTLY 6 questions covering: ${chosen.questionFocus}
- Each question: 4 options (A/B/C/D), only ONE correct
- Wrong options must use vocabulary/ideas from the script as plausible distractors

Return EXACTLY this JSON (no other text):
{
  "skill": "LISTENING",
  "subType": "${chosen.subType}",
  "difficulty": ${difficulty},
  "sectionTitle": "${chosen.title}",
  "instructions": "${chosen.instructions}",
  "scenario": "${chosen.subType}",
  "audioScript": "<${chosen.words} word realistic spoken script>",
  "questions": [
    { "id": "q1", "prompt": "<question>", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "correctAnswer": "A" },
    { "id": "q2", "prompt": "<question>", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "correctAnswer": "B" },
    { "id": "q3", "prompt": "<question>", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "correctAnswer": "C" },
    { "id": "q4", "prompt": "<question>", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "correctAnswer": "D" },
    { "id": "q5", "prompt": "<question>", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "correctAnswer": "A" },
    { "id": "q6", "prompt": "<question>", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "correctAnswer": "B" }
  ],
  "timeLimit": 480
}`;

  const response = await getClient().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'system', content: CELPIP_SYSTEM }, { role: 'user', content: prompt }],
    temperature: 0.7,
    response_format: { type: 'json_object' },
    max_tokens: 2000,
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error('OpenAI returned empty response for listening section');
  return JSON.parse(content) as GeneratedSection;
}

// ─── Section Evaluator (all questions at once) ────────────────────────────────

export async function evaluateSection(
  section: GeneratedSection,
  userAnswers: Record<string, string>   // { q1: "A", q2: "C", ... }
): Promise<SectionFeedback> {
  const totalQuestions = section.questions.length;
  const totalCorrect = section.questions.filter(q => userAnswers[q.id]?.toUpperCase() === q.correctAnswer.toUpperCase()).length;
  const overallScore = Math.round((totalCorrect / totalQuestions) * 100);
  const clbScore = totalCorrect >= 6 ? Math.min(12, Math.round(section.difficulty * 1.1) + 2)
    : totalCorrect >= 4 ? Math.min(12, Math.round(section.difficulty * 1.1))
    : Math.max(1, Math.round(section.difficulty * 0.7));

  const questionsForPrompt = section.questions.map(q => ({
    id: q.id,
    prompt: q.prompt,
    options: q.options,
    correctAnswer: q.correctAnswer,
    userAnswer: userAnswers[q.id] || 'no answer',
    correct: (userAnswers[q.id] || '').toUpperCase() === q.correctAnswer.toUpperCase(),
  }));

  const prompt = `You are a CELPIP examiner. Explain each answer for this ${section.skill} section.

${section.passage ? `PASSAGE:\n"${section.passage}"` : ''}
${section.audioScript ? `AUDIO SCRIPT:\n"${section.audioScript}"` : ''}

QUESTIONS AND ANSWERS:
${JSON.stringify(questionsForPrompt, null, 2)}

For EACH question, explain why the correct answer is right and why the other 3 options are wrong.
Always quote the specific text/audio evidence for the correct answer.

Return EXACTLY this JSON:
{
  "clbScore": ${clbScore},
  "clbLabel": "${clbScore >= 9 ? `CLB ${clbScore} — Strong` : clbScore >= 7 ? `CLB ${clbScore} — Adequate` : `CLB ${clbScore} — Developing`}",
  "totalCorrect": ${totalCorrect},
  "totalQuestions": ${totalQuestions},
  "overallScore": ${overallScore},
  "items": [
    ${section.questions.map(q => `{
      "questionId": "${q.id}",
      "prompt": ${JSON.stringify(q.prompt)},
      "userAnswer": "${userAnswers[q.id] || '–'}",
      "correctAnswer": "${q.correctAnswer}",
      "correct": ${(userAnswers[q.id] || '').toUpperCase() === q.correctAnswer.toUpperCase()},
      "explanation": "<2 sentences: why the correct answer is right, quoting the text/audio>",
      "keyEvidence": "<the exact phrase from passage/audio that proves the answer>",
      "whyOthersWrong": { "A": "<reason>", "B": "<reason>", "C": "<reason>", "D": "<reason>" }
    }`).join(',\n    ')}
  ],
  "generalTips": ["<3 specific tips based on which questions were missed>"]
}`;

  const response = await getClient().chat.completions.create({
    model: env.OPENAI_MODEL,
    messages: [{ role: 'system', content: CELPIP_SYSTEM }, { role: 'user', content: prompt }],
    temperature: 0.15,
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content || '{}') as SectionFeedback;
}

// ─── Whisper Transcription ────────────────────────────────────────────────────

export async function transcribeAudio(audioBuffer: Buffer, mimeType: string): Promise<string> {
  const ext = mimeType.includes('webm') ? 'webm' : mimeType.includes('mp4') ? 'mp4' : mimeType.includes('ogg') ? 'ogg' : 'wav';
  const file = await toFile(audioBuffer, `recording.${ext}`, { type: mimeType });
  const response = await getClient().audio.transcriptions.create({ model: 'whisper-1', file, language: 'en' });
  return response.text;
}
