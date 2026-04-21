'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { questionsApi, sessionsApi } from '@/lib/api';
import { Question, QuestionSet, Skill, WritingFeedback, SpeakingFeedback, SectionFeedback } from '@/types';
import { FULL_TEST_STEPS, FullTestStep } from '@/lib/celpip';
import {
  Clock, ChevronRight, TestTube, Headphones, BookOpen, PenLine, Mic,
  CheckCircle, AlertCircle, Square, Send,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import AudioPlayer from '@/components/AudioPlayer';

// Skill colours / icons
const SKILL_META: Record<Skill, { icon: typeof Headphones; color: string; bg: string; label: string }> = {
  LISTENING: { icon: Headphones, color: 'text-blue-600',   bg: 'bg-blue-50',   label: 'Listening' },
  READING:   { icon: BookOpen,   color: 'text-green-600',  bg: 'bg-green-50',  label: 'Reading'   },
  WRITING:   { icon: PenLine,    color: 'text-purple-600', bg: 'bg-purple-50', label: 'Writing'   },
  SPEAKING:  { icon: Mic,        color: 'text-orange-600', bg: 'bg-orange-50', label: 'Speaking'  },
};

// Group steps by skill for summary display
const SKILL_ORDER: Skill[] = ['LISTENING', 'READING', 'WRITING', 'SPEAKING'];

type Stage = 'intro' | 'loading' | 'question' | 'evaluating' | 'break' | 'results';

interface StepResult {
  stepIndex: number;
  skill: Skill;
  partName: string;
  clbScore: number;
  correct?: number;
  total?: number;
}

// ── Section Question Navigator (inline in Full Test) ──────────────────────────
function FullTestSectionView({
  section, answers, onAnswerChange, onSubmit, timeLeft,
}: {
  section: QuestionSet;
  answers: Record<string, string>;
  onAnswerChange: (id: string, v: string) => void;
  onSubmit: () => void;
  timeLeft: number;
}) {
  const [activeQ, setActiveQ] = useState(0);
  const q = section.questions[activeQ];
  const allAnswered = Object.keys(answers).length === section.questions.length;
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="space-y-4">
      {/* Timer + section instructions */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-blue-800 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 flex-1 mr-4">
          {section.instructions}
        </p>
        <div className={clsx('flex items-center gap-1.5 font-mono text-sm font-semibold px-3 py-1 rounded-full flex-shrink-0',
          timeLeft < 60 ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-700')}>
          <Clock className="w-4 h-4" />{fmt(timeLeft)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: passage or audio */}
        <div>
          {section.skill === 'LISTENING' && section.audioScript && <AudioPlayer script={section.audioScript} />}
          {section.skill === 'READING' && section.passage && (
            <div className="card p-4 max-h-[480px] overflow-y-auto">
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Reading Passage</div>
              <p className="text-gray-800 leading-relaxed text-sm whitespace-pre-wrap">{section.passage}</p>
            </div>
          )}
        </div>

        {/* Right: Q navigator + current question */}
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2 items-center">
            {section.questions.map((qs, i) => (
              <button key={qs.id} onClick={() => setActiveQ(i)}
                className={clsx('w-8 h-8 rounded-full text-xs font-bold border-2 transition-all',
                  i === activeQ ? 'border-brand-600 bg-brand-600 text-white' :
                  answers[qs.id] ? 'border-green-400 bg-green-50 text-green-700' :
                  'border-gray-300 bg-white text-gray-600 hover:border-gray-400')}>
                {i + 1}
              </button>
            ))}
            <span className="text-xs text-gray-400 ml-1">
              {Object.keys(answers).length}/{section.questions.length}
            </span>
          </div>

          <div className="card p-4 space-y-3">
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">Q{activeQ + 1} of {section.questions.length}</div>
            <p className="text-gray-900 font-medium leading-relaxed text-sm">{q.prompt}</p>
            <div className="space-y-2">
              {q.options.map(opt => {
                const letter = opt.charAt(0);
                return (
                  <button key={letter} onClick={() => onAnswerChange(q.id, letter)}
                    className={clsx('w-full text-left p-3 rounded-lg border text-sm transition-all',
                      answers[q.id] === letter
                        ? 'border-brand-500 bg-brand-50 text-brand-700 font-semibold'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700')}>
                    {opt}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2 pt-1">
              {activeQ < section.questions.length - 1 ? (
                <button onClick={() => setActiveQ(activeQ + 1)} disabled={!answers[q.id]}
                  className="btn-primary btn-sm flex-1">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={onSubmit} disabled={!allAnswered}
                  className={clsx('btn-primary btn-sm flex-1', !allAnswered && 'opacity-50 cursor-not-allowed')}>
                  <Send className="w-4 h-4" />
                  {allAnswered ? 'Submit Section' : `${Object.keys(answers).length}/${section.questions.length} answered`}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type PrefetchEntry = { data?: Question | QuestionSet; error?: string; pending: Promise<void> };

// ── Main Full Test Page ────────────────────────────────────────────────────────
export default function FullTestPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>('intro');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Current content
  const [question, setQuestion] = useState<Question | null>(null);
  const [section, setSection] = useState<QuestionSet | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [sectionAnswers, setSectionAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);

  // Speaking
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [speakingPhase, setSpeakingPhase] = useState<'prep' | 'recording' | 'done'>('prep');
  const [prepTimeLeft, setPrepTimeLeft] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Results
  const [results, setResults] = useState<StepResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const startTimeRef = useRef<number>(0);

  // Prefetch cache: idx → { data, error, pending }
  const prefetchCache = useRef<Map<number, PrefetchEntry>>(new Map());

  const step: FullTestStep = FULL_TEST_STEPS[currentIdx];
  const isSection = step?.type === 'section';

  // Prep countdown for speaking
  useEffect(() => {
    if (stage !== 'question' || step?.skill !== 'SPEAKING' || speakingPhase !== 'prep') return;
    if (prepTimeLeft <= 0) { setSpeakingPhase('recording'); return; }
    const t = setTimeout(() => setPrepTimeLeft(p => p - 1), 1000);
    return () => clearTimeout(t);
  });

  // Response timer for speaking (auto-stops recording at 0)
  useEffect(() => {
    if (stage !== 'question' || step?.skill !== 'SPEAKING' || speakingPhase !== 'recording') return;
    if (timeLeft <= 0) {
      if (isRecording) { mediaRecorderRef.current?.stop(); setIsRecording(false); }
      setSpeakingPhase('done');
      return;
    }
    const t = setTimeout(() => setTimeLeft(p => p - 1), 1000);
    return () => clearTimeout(t);
  });

  // Timer countdown for non-speaking, non-writing tasks
  useEffect(() => {
    if (stage !== 'question' || timeLeft <= 0 || step?.skill === 'WRITING' || step?.skill === 'SPEAKING') return;
    if (timeLeft === 1) { handleSubmit(); return; }
    const t = setTimeout(() => setTimeLeft(p => p - 1), 1000);
    return () => clearTimeout(t);
  });

  const prefetchStep = (idx: number) => {
    if (idx >= FULL_TEST_STEPS.length) return;
    if (prefetchCache.current.has(idx)) return;

    const entry: PrefetchEntry = { pending: Promise.resolve() };
    entry.pending = (async () => {
      const s = FULL_TEST_STEPS[idx];
      try {
        if (s.type === 'section') {
          const res = await questionsApi.generateSection({ skill: s.skill as 'READING' | 'LISTENING', part: s.partNumber });
          const sec: QuestionSet = res.data.section;
          if (sec?.questions?.length) entry.data = sec;
          else entry.error = 'Invalid section data';
        } else {
          const res = await questionsApi.generate({ skill: s.skill, subType: s.subType });
          const q: Question = res.data.question;
          if (q?.prompt) entry.data = q;
          else entry.error = 'Invalid question data';
        }
      } catch (err: unknown) {
        entry.error = (err as { message?: string }).message || 'Failed to prefetch';
      }
    })();
    prefetchCache.current.set(idx, entry);
  };

  const startTest = async () => {
    setLoading(true);
    try {
      const res = await sessionsApi.create({ type: 'FULL_TEST' });
      setSessionId(res.data.session.id);
      // Prefetch step 1 in parallel while step 0 is loading
      prefetchStep(1);
      await loadStep(0);
    } catch {
      toast.error('Failed to start test');
      setLoading(false);
    }
  };

  const loadStep = async (idx: number) => {
    setLoading(true);
    setLoadError(null);
    setStage('loading');
    setQuestion(null); setSection(null);
    setUserAnswer(''); setSectionAnswers({}); setAudioBlob(null);
    setSpeakingPhase('prep'); setPrepTimeLeft(0);

    // Kick off prefetch for the step after this one immediately
    prefetchStep(idx + 1);

    const s = FULL_TEST_STEPS[idx];
    try {
      let data: Question | QuestionSet | undefined;

      const cached = prefetchCache.current.get(idx);
      if (cached) {
        // Wait for the in-flight prefetch (may already be done)
        await cached.pending;
        if (cached.data) {
          data = cached.data;
        } else if (cached.error) {
          throw new Error(cached.error);
        }
        prefetchCache.current.delete(idx);
      }

      if (!data) {
        // No prefetch — generate now
        if (s.type === 'section') {
          const res = await questionsApi.generateSection({ skill: s.skill as 'READING' | 'LISTENING', part: s.partNumber });
          data = res.data.section as QuestionSet;
        } else {
          const res = await questionsApi.generate({ skill: s.skill, subType: s.subType });
          data = res.data.question as Question;
        }
      }

      if (s.type === 'section') {
        const sec = data as QuestionSet;
        if (!sec?.questions?.length) throw new Error('Invalid section data received');
        setSection(sec);
        setTimeLeft(sec.timeLimit ?? 480);
      } else {
        const q = data as Question;
        if (!q?.prompt) throw new Error('Invalid question data received');
        setQuestion(q);
        setTimeLeft(q.timeLimit ?? 120);
        if (s.skill === 'SPEAKING') {
          setSpeakingPhase('prep');
          setPrepTimeLeft(q.prepTime ?? 30);
        }
      }

      startTimeRef.current = Date.now();
      setStage('question');
    } catch (err: unknown) {
      const msg = (err as { code?: string }).code === 'ECONNABORTED'
        ? 'Request timed out — the server took too long to respond.'
        : ((err as { response?: { data?: { error?: string } } }).response?.data?.error) ||
          (err as { message?: string }).message ||
          'Failed to load step.';
      setLoadError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
      const mimeType = types.find(t => MediaRecorder.isTypeSupported(t)) || '';
      const mr = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      chunksRef.current = [];
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        setAudioBlob(new Blob(chunksRef.current, { type: mimeType || 'audio/webm' }));
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start(100);
      mediaRecorderRef.current = mr;
      setIsRecording(true);
    } catch {
      toast.error('Microphone access denied.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleSubmit = async () => {
    if (!sessionId) return;
    const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
    setStage('evaluating');

    try {
      let clbScore = 5;
      let correct: number | undefined;
      let total: number | undefined;

      if (isSection && section) {
        const res = await sessionsApi.respondSection(sessionId, {
          skill: step.skill as 'READING' | 'LISTENING',
          section, answers: sectionAnswers, timeTaken: elapsed,
        });
        const fb: SectionFeedback = res.data.feedback;
        clbScore = fb.clbScore;
        correct = fb.totalCorrect;
        total = fb.totalQuestions;
      } else if (step.skill === 'SPEAKING' && audioBlob && question) {
        const res = await sessionsApi.respondAudio(sessionId, audioBlob, question, question.subType, elapsed);
        clbScore = res.data.feedback?.clbScore ?? 5;
      } else if (question) {
        const res = await sessionsApi.respond(sessionId, {
          skill: step.skill, subType: question.subType,
          question, userAnswer, timeTaken: elapsed,
        });
        const fb: WritingFeedback | SpeakingFeedback = res.data.feedback;
        clbScore = fb?.clbScore ?? 5;
      }

      setResults(prev => [...prev, {
        stepIndex: currentIdx, skill: step.skill,
        partName: step.partName, clbScore, correct, total,
      }]);

      await advanceOrFinish(currentIdx);
    } catch {
      toast.error('Evaluation error — moving to next part.');
      await advanceOrFinish(currentIdx);
    }
  };

  const advanceOrFinish = async (idx: number) => {
    const nextIdx = idx + 1;
    if (nextIdx >= FULL_TEST_STEPS.length) {
      if (sessionId) await sessionsApi.complete(sessionId).catch(() => {});
      setStage('results');
    } else {
      // Start prefetching next step immediately while user reads the break screen
      prefetchStep(nextIdx);
      setCurrentIdx(nextIdx);
      setStage('break');
    }
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const totalSteps = FULL_TEST_STEPS.length;

  // ── Intro ──────────────────────────────────────────────────────────────────
  if (stage === 'intro') return (
    <div className="p-6 max-w-2xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto mb-4">
          <TestTube className="w-8 h-8 text-purple-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Full Test Simulation</h1>
        <p className="text-gray-500">Complete all 4 CELPIP skills in the official order and structure.</p>
      </div>

      {/* Structure overview */}
      <div className="card p-5 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Exam Structure — {totalSteps} Parts</h3>
        <div className="space-y-3">
          {SKILL_ORDER.map(skill => {
            const steps = FULL_TEST_STEPS.filter(s => s.skill === skill);
            const meta = SKILL_META[skill];
            const Icon = meta.icon;
            return (
              <div key={skill} className={clsx('rounded-xl p-3 border', meta.bg)}>
                <div className={clsx('flex items-center gap-2 font-semibold text-sm mb-2', meta.color)}>
                  <Icon className="w-4 h-4" /> {meta.label}
                  <span className="ml-auto text-xs font-normal text-gray-500">{steps.length} {skill === 'LISTENING' || skill === 'READING' ? 'parts × 6 questions' : 'tasks'}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {steps.map(s => (
                    <span key={s.partNumber} className="text-xs bg-white border border-gray-200 rounded-full px-2 py-0.5 text-gray-600">
                      {skill === 'LISTENING' || skill === 'READING' ? `Part ${s.partNumber}` : `Task ${s.partNumber}`}: {s.partName}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-yellow-800">
            <strong>Before you start:</strong> Find a quiet place, have your microphone ready for Speaking, and allow 90–120 minutes to complete all sections.
          </p>
        </div>
      </div>

      <button onClick={startTest} disabled={loading} className="btn-primary btn-lg w-full">
        {loading ? 'Starting...' : 'Begin Full Test'} <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );

  // ── Loading step ───────────────────────────────────────────────────────────
  if (stage === 'loading' || (stage === 'question' && (isSection ? !section : !question))) {
    if (loadError) return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 p-6">
        <AlertCircle className="w-10 h-10 text-red-500" />
        <p className="text-gray-700 font-medium text-center max-w-sm">{loadError}</p>
        <p className="text-sm text-gray-400">Step {currentIdx + 1} of {totalSteps}: {step?.partName}</p>
        <div className="flex gap-3">
          <button onClick={() => loadStep(currentIdx)} className="btn-primary btn-sm flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
          <button onClick={() => advanceOrFinish(currentIdx)} className="btn-secondary btn-sm">
            Skip this step
          </button>
        </div>
      </div>
    );
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="animate-spin w-10 h-10 border-2 border-brand-600 border-t-transparent rounded-full" />
        <p className="text-gray-600 font-medium">
          {step ? `${step.skill === 'LISTENING' || step.skill === 'READING' ? 'Generating section' : 'Generating task'}: ${step.partName}` : 'Loading...'}
        </p>
        <p className="text-sm text-gray-400">Step {currentIdx + 1} of {totalSteps}</p>
        <p className="text-xs text-gray-300">This may take up to 30 seconds…</p>
      </div>
    );
  }

  // ── Break between sections ─────────────────────────────────────────────────
  if (stage === 'break') {
    const prevResult = results[results.length - 1];
    const nextStep = FULL_TEST_STEPS[currentIdx];
    const nextMeta = SKILL_META[nextStep.skill];
    const NextIcon = nextMeta.icon;
    const prevStepInfo = FULL_TEST_STEPS[currentIdx - 1];
    const prevMeta = SKILL_META[prevStepInfo.skill];

    const completedThisSkill = currentIdx > 0 &&
      FULL_TEST_STEPS[currentIdx - 1].skill !== nextStep.skill;

    return (
      <div className="p-6 max-w-xl mx-auto animate-fade-in text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mx-auto">
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900">{prevStepInfo.partName} Done!</h2>
          {prevResult && (
            <p className={clsx('text-lg font-semibold mt-1',
              prevResult.clbScore >= 9 ? 'text-green-600' : prevResult.clbScore >= 7 ? 'text-yellow-600' : 'text-red-500')}>
              CLB {prevResult.clbScore}
              {prevResult.correct !== undefined && ` — ${prevResult.correct}/${prevResult.total} correct`}
            </p>
          )}
        </div>

        {/* Show skill transition notice */}
        {completedThisSkill && (
          <div className={clsx('rounded-xl p-4 border text-sm', prevMeta.bg)}>
            <p className={clsx('font-semibold', prevMeta.color)}>✓ {prevMeta.label} complete!</p>
            <p className="text-gray-600 mt-0.5">
              {results.filter(r => r.skill === prevStepInfo.skill).length} parts done
            </p>
          </div>
        )}

        {/* Overall progress */}
        <div className="card p-4">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>Overall progress</span>
            <span>{currentIdx} / {totalSteps} parts</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-brand-500 rounded-full transition-all"
              style={{ width: `${(currentIdx / totalSteps) * 100}%` }} />
          </div>
        </div>

        <div className="card p-4 text-left">
          <p className="text-xs text-gray-400 mb-1.5">Up next</p>
          <div className={clsx('flex items-center gap-2 font-semibold', nextMeta.color)}>
            <NextIcon className="w-5 h-5" />
            {nextStep.partName}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {nextStep.skill} — {nextStep.type === 'section' ? `6 questions` : 'speaking/writing task'}
          </p>
        </div>

        <button onClick={() => loadStep(currentIdx)} className="btn-primary btn-lg w-full">
          Continue <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // ── Evaluating ─────────────────────────────────────────────────────────────
  if (stage === 'evaluating') return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="animate-spin w-10 h-10 border-2 border-brand-600 border-t-transparent rounded-full" />
      <p className="text-gray-500 font-medium">Evaluating {step?.partName}...</p>
      <p className="text-sm text-gray-400">Part {currentIdx + 1} of {totalSteps}</p>
    </div>
  );

  // ── Results ────────────────────────────────────────────────────────────────
  if (stage === 'results') {
    const skillScores: Partial<Record<Skill, number[]>> = {};
    results.forEach(r => {
      if (!skillScores[r.skill]) skillScores[r.skill] = [];
      skillScores[r.skill]!.push(r.clbScore);
    });
    const skillAvg = (skill: Skill) => {
      const scores = skillScores[skill];
      if (!scores || scores.length === 0) return null;
      return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    };
    const allScores = results.map(r => r.clbScore);
    const overall = allScores.length > 0
      ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0;

    return (
      <div className="p-6 max-w-2xl mx-auto animate-fade-in">
        {/* Overall CLB */}
        <div className="text-center mb-8">
          <div className={clsx('text-7xl font-extrabold mb-2',
            overall >= 9 ? 'text-green-600' : overall >= 7 ? 'text-yellow-600' : 'text-red-500')}>
            {overall}
          </div>
          <div className="text-gray-500 font-medium">Overall CLB Estimate</div>
          <div className={clsx('inline-block mt-2 px-4 py-1.5 rounded-full text-sm font-semibold',
            overall >= 9 ? 'bg-green-100 text-green-700' :
            overall >= 7 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700')}>
            {overall >= 9 ? '🎯 Target reached!' : overall >= 7 ? '📈 Good — keep improving' : '💪 Needs work — keep practising'}
          </div>
        </div>

        {/* Per-skill breakdown */}
        <div className="card p-5 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Score by Skill</h3>
          <div className="grid grid-cols-2 gap-3">
            {SKILL_ORDER.map(skill => {
              const avg = skillAvg(skill);
              const meta = SKILL_META[skill];
              const Icon = meta.icon;
              return (
                <div key={skill} className={clsx('rounded-xl p-4 border', meta.bg)}>
                  <div className={clsx('flex items-center gap-2 text-sm font-semibold mb-1', meta.color)}>
                    <Icon className="w-4 h-4" />{meta.label}
                  </div>
                  <div className={clsx('text-3xl font-black',
                    avg === null ? 'text-gray-400' :
                    avg >= 9 ? 'text-green-600' : avg >= 7 ? 'text-yellow-600' : 'text-red-500')}>
                    {avg ?? '—'}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">CLB average</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Part-by-part results */}
        <div className="card p-5 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Part by Part</h3>
          <div className="space-y-2">
            {results.map((r, i) => {
              const meta = SKILL_META[r.skill];
              const Icon = meta.icon;
              return (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{r.partName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {r.correct !== undefined && (
                      <span className="text-xs text-gray-400">{r.correct}/{r.total}</span>
                    )}
                    <span className={clsx('font-bold',
                      r.clbScore >= 9 ? 'text-green-600' : r.clbScore >= 7 ? 'text-yellow-600' : 'text-red-500')}>
                      CLB {r.clbScore}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => router.push('/dashboard')} className="btn-secondary btn-lg">Back to Dashboard</button>
          <button onClick={() => router.push('/progress')} className="btn-primary btn-lg">View Progress</button>
        </div>
      </div>
    );
  }

  // ── Question / Section View ────────────────────────────────────────────────
  const meta = SKILL_META[step.skill];
  const Icon = meta.icon;

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in space-y-4">
      {/* Header: skill + part + overall progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={clsx('flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border', meta.bg, meta.color)}>
            <Icon className="w-4 h-4" />
            {step.skill === 'LISTENING' || step.skill === 'READING'
              ? `${meta.label} — Part ${step.partNumber}`
              : `${meta.label} — Task ${step.partNumber}`}
          </div>
          <span className="text-sm text-gray-400 font-medium">{step.partName}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">{currentIdx + 1}/{totalSteps}</span>
          {step.skill !== 'WRITING' && !isSection && timeLeft > 0 && (
            <div className={clsx('flex items-center gap-1.5 font-mono text-sm font-semibold px-3 py-1 rounded-full',
              timeLeft < 30 ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-700')}>
              <Clock className="w-4 h-4" />{fmt(timeLeft)}
            </div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-brand-500 rounded-full transition-all"
          style={{ width: `${(currentIdx / totalSteps) * 100}%` }} />
      </div>

      {/* Section view */}
      {isSection && section && (
        <FullTestSectionView
          section={section} answers={sectionAnswers}
          onAnswerChange={(id, v) => setSectionAnswers(prev => ({ ...prev, [id]: v }))}
          onSubmit={handleSubmit} timeLeft={timeLeft}
        />
      )}

      {/* Writing */}
      {step.skill === 'WRITING' && question && (
        <div className="space-y-4">
          <div className="card p-4 bg-blue-50 border-blue-200">
            <p className="text-sm text-blue-800">{question.instructions}</p>
          </div>
          <div className="card p-5">
            <p className="text-gray-900 font-medium leading-relaxed">{question.prompt}</p>
          </div>
          <div className="card p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">Your Response</div>
              <div className="text-xs text-gray-400">{userAnswer.split(/\s+/).filter(Boolean).length} / 200 words</div>
            </div>
            <textarea className="textarea w-full min-h-[200px] text-sm" placeholder="Write your response..."
              value={userAnswer} onChange={e => setUserAnswer(e.target.value)} />
          </div>
          <button onClick={handleSubmit} disabled={userAnswer.trim().length < 20} className="btn-primary btn-lg w-full">
            Submit & Continue <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Speaking */}
      {step.skill === 'SPEAKING' && question && (
        <div className="space-y-4">
          {question.photoUrl && (
            <div className="card overflow-hidden">
              <img src={question.photoUrl} alt="Scene to describe" className="w-full max-h-64 object-cover" />
            </div>
          )}
          <div className="card p-5">
            <p className="text-gray-900 font-medium leading-relaxed whitespace-pre-wrap">{question.prompt}</p>
          </div>

          {/* Prep phase */}
          {speakingPhase === 'prep' && (
            <div className="card p-5 border-2 border-yellow-300 bg-yellow-50">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-yellow-800">Preparation Time — read the task carefully</p>
                <div className={clsx('font-mono text-xl font-bold px-3 py-1 rounded-full',
                  prepTimeLeft <= 10 ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-700')}>
                  {fmt(prepTimeLeft)}
                </div>
              </div>
              <p className="text-xs text-yellow-700">Recording will start automatically when the timer ends, or click below to start early.</p>
              <button onClick={() => setSpeakingPhase('recording')}
                className="mt-3 flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl font-medium text-sm hover:bg-red-600">
                <Mic className="w-4 h-4" /> Start Recording Early
              </button>
            </div>
          )}

          {/* Recording phase */}
          {speakingPhase === 'recording' && (
            <div className="card p-5 border-2 border-red-300 bg-red-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-red-700 font-semibold">
                  <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                  {isRecording ? 'Recording…' : 'Recording phase — press Start'}
                </div>
                <div className={clsx('font-mono text-xl font-bold px-3 py-1 rounded-full',
                  timeLeft <= 15 ? 'bg-red-200 text-red-700' : 'bg-red-100 text-red-600')}>
                  {fmt(timeLeft)}
                </div>
              </div>
              {!isRecording ? (
                <button onClick={() => { startRecording(); }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600">
                  <Mic className="w-5 h-5" /> Start Recording
                </button>
              ) : (
                <button onClick={() => { stopRecording(); setSpeakingPhase('done'); }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 text-white rounded-xl font-medium hover:bg-gray-900">
                  <Square className="w-5 h-5" /> Stop Early
                </button>
              )}
            </div>
          )}

          {/* Done phase */}
          {speakingPhase === 'done' && audioBlob && (
            <div className="card p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm text-green-700 font-medium">
                <CheckCircle className="w-4 h-4" /> Recording ready
              </div>
              <audio controls src={URL.createObjectURL(audioBlob)} className="w-full h-8" />
              <button onClick={() => { setAudioBlob(null); setSpeakingPhase('recording'); setTimeLeft(question.timeLimit); }}
                className="btn-secondary btn-sm">
                <RefreshCw className="w-3.5 h-3.5" /> Re-record
              </button>
            </div>
          )}

          <button onClick={handleSubmit} disabled={!audioBlob || speakingPhase !== 'done'}
            className={clsx('btn-primary btn-lg w-full', (!audioBlob || speakingPhase !== 'done') && 'opacity-50 cursor-not-allowed')}>
            Submit & Continue <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
