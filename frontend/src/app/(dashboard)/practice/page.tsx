'use client';
import { useEffect, useState, useRef, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { questionsApi, sessionsApi } from '@/lib/api';
import { Question, QuestionSet, Skill, WritingFeedback, SpeakingFeedback, SectionFeedback, QuestionItemFeedback } from '@/types';
import {
  LISTENING_PARTS, READING_PARTS, WRITING_TASKS, SPEAKING_TASKS,
  CelpipPart, CelpipTask,
} from '@/lib/celpip';
import {
  Headphones, BookOpen, PenLine, Mic, Clock, Send, RefreshCw, ChevronRight,
  Square, Sparkles, CheckCircle, XCircle, Quote, Lightbulb, ChevronDown, ChevronUp,
  ArrowLeft,
} from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import FeedbackPanel from '@/components/FeedbackPanel';
import AudioPlayer from '@/components/AudioPlayer';

const SKILLS = [
  { id: 'LISTENING' as Skill, label: 'Listening', icon: Headphones, color: 'text-blue-600', bg: 'bg-blue-50', parts: 6, questions: '38–39', desc: '6 parts — pick one to practise' },
  { id: 'READING'   as Skill, label: 'Reading',   icon: BookOpen,   color: 'text-green-600',  bg: 'bg-green-50',  parts: 4, questions: '38–39', desc: '4 parts — pick one to practise' },
  { id: 'WRITING'   as Skill, label: 'Writing',   icon: PenLine,    color: 'text-purple-600', bg: 'bg-purple-50', parts: 2, questions: 'Tasks', desc: '2 tasks — email or survey response' },
  { id: 'SPEAKING'  as Skill, label: 'Speaking',  icon: Mic,        color: 'text-orange-600', bg: 'bg-orange-50', parts: 8, questions: 'Tasks', desc: '8 task types — pick one to practise' },
];

type Stage = 'select' | 'select-part' | 'question' | 'evaluating' | 'feedback';

// ── Speaking Recorder ─────────────────────────────────────────────────────────
function SpeakingRecorder({
  onRecordingComplete, audioBlob, onReset, prepTime,
}: {
  onRecordingComplete: (blob: Blob) => void;
  audioBlob: Blob | null; onReset: () => void; prepTime: number | null;
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const getSupportedMimeType = () => {
    const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
    return types.find(t => MediaRecorder.isTypeSupported(t)) || '';
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedMimeType();
      const mr = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      chunksRef.current = [];
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        onRecordingComplete(new Blob(chunksRef.current, { type: mimeType || 'audio/webm' }));
        stream.getTracks().forEach(t => t.stop());
        if (timerRef.current) clearInterval(timerRef.current);
      };
      mr.start(100);
      mediaRecorderRef.current = mr;
      setIsRecording(true); setSeconds(0);
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } catch (err: unknown) {
      if ((err as { name?: string }).name === 'NotAllowedError') {
        setPermissionDenied(true);
        toast.error('Microphone access denied.');
      } else {
        toast.error('Could not access microphone.');
      }
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
    mediaRecorderRef.current?.state === 'recording' && mediaRecorderRef.current.stop();
  }, []);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  if (permissionDenied) return (
    <div className="card p-5 bg-red-50 border-red-200">
      <div className="flex items-center gap-2 mb-2">
        <Mic className="w-5 h-5 text-red-500" />
        <div className="font-medium text-red-700">Microphone Access Denied</div>
      </div>
      <p className="text-sm text-red-600 mb-3">Click 🔒 in your browser address bar → Site settings → Allow Microphone.</p>
      <button onClick={() => setPermissionDenied(false)} className="btn-secondary btn-sm">Try Again</button>
    </div>
  );

  if (audioBlob) return (
    <div className="card p-5 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="w-5 h-5 text-green-600" />
        </div>
        <div><div className="font-medium text-gray-900">Recording ready</div><div className="text-xs text-gray-400">Duration: {fmt(seconds || 1)}</div></div>
        <button onClick={onReset} className="btn-secondary btn-sm ml-auto"><RefreshCw className="w-3.5 h-3.5" /> Re-record</button>
      </div>
      <audio controls src={URL.createObjectURL(audioBlob)} className="w-full h-8" />
    </div>
  );

  return (
    <div className="card p-5 space-y-4">
      {prepTime !== null && prepTime > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-yellow-600 flex-shrink-0" />
          <span className="text-sm text-yellow-800">Preparation time: <strong>{fmt(prepTime)}</strong></span>
        </div>
      )}
      <div className="flex items-center gap-4">
        {!isRecording ? (
          <button onClick={startRecording} className="flex items-center gap-2.5 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors">
            <div className="w-3 h-3 bg-white rounded-full" /> Start Recording
          </button>
        ) : (
          <button onClick={stopRecording} className="flex items-center gap-2.5 px-6 py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-xl font-semibold transition-colors">
            <Square className="w-4 h-4" /> Stop Recording
          </button>
        )}
        {isRecording && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-1.5 bg-red-500 rounded-full animate-pulse"
                  style={{ height: `${12 + Math.random() * 12}px`, animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
            <span className="text-sm font-mono font-semibold text-red-600">
              <span className="w-2 h-2 bg-red-500 rounded-full inline-block animate-pulse mr-1" />
              {fmt(seconds)}
            </span>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-400">🎙️ Speak clearly and address all bullet points. Aim for 60–90 seconds.</p>
    </div>
  );
}

// ── Section Feedback Panel ────────────────────────────────────────────────────
function SectionFeedbackPanel({ section, feedback, onNewQuestion }: {
  section: QuestionSet; feedback: SectionFeedback; onNewQuestion: () => void;
}) {
  const [expandedQ, setExpandedQ] = useState<string | null>(null);

  return (
    <div className="p-6 max-w-3xl mx-auto animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Section Results</h2>
        <button onClick={onNewQuestion} className="btn-primary btn-sm"><RefreshCw className="w-3.5 h-3.5" /> Practice Again</button>
      </div>

      {/* Score card */}
      <div className={clsx('rounded-2xl border-2 p-6 flex items-center gap-5',
        feedback.clbScore >= 9 ? 'bg-green-50 border-green-300' :
        feedback.clbScore >= 7 ? 'bg-yellow-50 border-yellow-300' : 'bg-red-50 border-red-300')}>
        <div className="flex-shrink-0 text-center">
          <div className={clsx('text-5xl font-black leading-none',
            feedback.clbScore >= 9 ? 'text-green-600' : feedback.clbScore >= 7 ? 'text-yellow-600' : 'text-red-600')}>
            {feedback.clbScore}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">CLB</div>
        </div>
        <div className="flex-1">
          <div className={clsx('text-xl font-bold',
            feedback.clbScore >= 9 ? 'text-green-700' : feedback.clbScore >= 7 ? 'text-yellow-700' : 'text-red-700')}>
            {feedback.clbLabel}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {feedback.totalCorrect} / {feedback.totalQuestions} correct — {feedback.overallScore}%
          </div>
          <div className="mt-2 h-2 bg-white/70 rounded-full overflow-hidden w-48">
            <div className={clsx('h-full rounded-full transition-all duration-700',
              feedback.clbScore >= 9 ? 'bg-green-500' : feedback.clbScore >= 7 ? 'bg-yellow-500' : 'bg-red-500')}
              style={{ width: `${feedback.overallScore}%` }} />
          </div>
        </div>
        <div className={clsx('px-3 py-1.5 rounded-full text-sm font-semibold border',
          feedback.clbScore >= 7 ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200')}>
          {feedback.clbScore >= 7 ? '✓ Pass' : '✗ Below CLB 7'}
        </div>
      </div>

      {/* Per-question */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1">Question by Question</div>
        {feedback.items.map((item: QuestionItemFeedback, idx: number) => {
          const isOpen = expandedQ === item.questionId;
          return (
            <div key={item.questionId} className={clsx('border rounded-xl overflow-hidden',
              item.correct ? 'border-green-200' : 'border-red-200')}>
              <button onClick={() => setExpandedQ(isOpen ? null : item.questionId)}
                className={clsx('w-full flex items-center gap-3 px-4 py-3.5 text-left',
                  item.correct ? 'bg-green-50 hover:bg-green-100' : 'bg-red-50 hover:bg-red-100')}>
                <div className={clsx('w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white',
                  item.correct ? 'bg-green-500' : 'bg-red-500')}>{idx + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 truncate">{item.prompt}</div>
                  <div className="text-xs mt-0.5 flex items-center gap-1">
                    {item.correct
                      ? <span className="text-green-700 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Correct — {item.correctAnswer}</span>
                      : <span className="text-red-700 flex items-center gap-1"><XCircle className="w-3 h-3" /> You: {item.userAnswer || '–'} → Correct: {item.correctAnswer}</span>}
                  </div>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
              </button>
              {isOpen && (
                <div className="p-4 bg-white space-y-3 border-t border-gray-100">
                  {item.keyEvidence && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Quote className="w-3.5 h-3.5 text-blue-600" />
                        <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Key Evidence</span>
                      </div>
                      <p className="text-sm text-blue-900 italic">&ldquo;{item.keyEvidence}&rdquo;</p>
                    </div>
                  )}
                  <p className="text-sm text-gray-700 leading-relaxed">{item.explanation}</p>
                  {item.whyOthersWrong && (
                    <div className="space-y-1.5">
                      {Object.entries(item.whyOthersWrong).map(([letter, reason]) => {
                        const isCorrect = letter === item.correctAnswer;
                        const isChosen = letter === item.userAnswer;
                        return (
                          <div key={letter} className={clsx('p-2.5 rounded-lg border text-xs',
                            isCorrect ? 'bg-green-50 border-green-200' : isChosen ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200')}>
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className={clsx('w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white',
                                isCorrect ? 'bg-green-500' : isChosen ? 'bg-red-500' : 'bg-gray-400')}>{letter}</span>
                              {isCorrect && <span className="text-green-700 font-semibold ml-auto">✓ Correct</span>}
                              {isChosen && !isCorrect && <span className="text-red-700 font-semibold ml-auto">✗ Your choice</span>}
                            </div>
                            <p className="text-gray-600 pl-7">{reason as string}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {feedback.generalTips?.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-yellow-500" /><span className="font-semibold text-sm text-gray-900">Tips to Improve</span></div>
          <ol className="space-y-2">
            {feedback.generalTips.map((tip, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                <span className="w-5 h-5 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">{i + 1}</span>
                {tip}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

// ── Section Question View ─────────────────────────────────────────────────────
function SectionQuestionView({ section, answers, onAnswerChange, onSubmit, timeLeft }: {
  section: QuestionSet;
  answers: Record<string, string>;
  onAnswerChange: (qId: string, answer: string) => void;
  onSubmit: () => void;
  timeLeft: number | null;
}) {
  const [activeQ, setActiveQ] = useState(0);
  const q = section.questions[activeQ];
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === section.questions.length;
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{section.sectionTitle}</h2>
          <p className="text-sm text-gray-500">{answeredCount}/{section.questions.length} answered</p>
        </div>
        {timeLeft !== null && (
          <div className={clsx('flex items-center gap-1.5 font-mono text-sm font-semibold px-3 py-1 rounded-full',
            timeLeft < 60 ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-700')}>
            <Clock className="w-4 h-4" />{fmt(timeLeft)}
          </div>
        )}
      </div>

      <div className="card p-3 bg-blue-50 border-blue-200 mb-4">
        <p className="text-sm text-blue-800">{section.instructions}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          {section.skill === 'LISTENING' && section.audioScript && <AudioPlayer script={section.audioScript} />}
          {section.skill === 'READING' && section.passage && (
            <div className="card p-5 max-h-[520px] overflow-y-auto">
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Reading Passage</div>
              <p className="text-gray-800 leading-relaxed text-sm whitespace-pre-wrap">{section.passage}</p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {/* Q navigator */}
          <div className="flex flex-wrap gap-2 items-center">
            {section.questions.map((qs, i) => (
              <button key={qs.id} onClick={() => setActiveQ(i)}
                className={clsx('w-9 h-9 rounded-full text-sm font-bold border-2 transition-all',
                  i === activeQ ? 'border-brand-600 bg-brand-600 text-white' :
                  answers[qs.id] ? 'border-green-400 bg-green-50 text-green-700' :
                  'border-gray-300 bg-white text-gray-600 hover:border-gray-400')}>
                {i + 1}
              </button>
            ))}
          </div>

          {/* Question */}
          <div className="card p-5 space-y-3">
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">Q{activeQ + 1} of {section.questions.length}</div>
            <p className="text-gray-900 font-medium leading-relaxed text-sm">{q.prompt}</p>
            <div className="space-y-2">
              {q.options.map((opt) => {
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
                <button onClick={() => setActiveQ(activeQ + 1)} disabled={!answers[q.id]} className="btn-primary btn-sm flex-1">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={onSubmit} disabled={!allAnswered}
                  className={clsx('btn-primary btn-sm flex-1', !allAnswered && 'opacity-50 cursor-not-allowed')}>
                  <Send className="w-4 h-4" />
                  {allAnswered ? `Submit All ${section.questions.length} Answers` : `Answer all (${answeredCount}/${section.questions.length})`}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Practice Page ────────────────────────────────────────────────────────
function PracticePage() {
  const searchParams = useSearchParams();
  const preselected = searchParams.get('skill') as Skill | null;

  const [stage, setStage] = useState<Stage>('select');
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  const [question, setQuestion] = useState<Question | null>(null);
  const [section, setSection] = useState<QuestionSet | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [sectionAnswers, setSectionAnswers] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<WritingFeedback | SpeakingFeedback | null>(null);
  const [sectionFeedback, setSectionFeedback] = useState<SectionFeedback | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcript, setTranscript] = useState('');
  const [prepTime, setPrepTime] = useState<number | null>(null);
  const [band9, setBand9] = useState<string | null>(null);
  const [loadingBand9, setLoadingBand9] = useState(false);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timeTaken, setTimeTaken] = useState(0);
  const [loading, setLoading] = useState(false);
  const startTimeRef = useRef<number>(0);

  const isSection = selectedSkill === 'READING' || selectedSkill === 'LISTENING';

  const resetState = () => {
    setQuestion(null); setSection(null); setFeedback(null); setSectionFeedback(null);
    setUserAnswer(''); setSectionAnswers({}); setAudioBlob(null);
    setTranscript(''); setBand9(null); setPrepTime(null);
  };

  const loadQuestion = useCallback(async (skill: Skill, part: number | null, subType: string | null) => {
    setLoading(true);
    resetState();
    try {
      const [sessionRes, qRes] = await Promise.all([
        sessionsApi.create({ type: 'QUICK_PRACTICE', skill }),
        skill === 'READING' || skill === 'LISTENING'
          ? questionsApi.generateSection({ skill, part: part ?? undefined })
          : questionsApi.generate({ skill, subType: subType ?? undefined }),
      ]);
      setSessionId(sessionRes.data.session.id);
      if (skill === 'READING' || skill === 'LISTENING') {
        const s: QuestionSet = qRes.data.section;
        setSection(s); setTimeLeft(s.timeLimit);
      } else {
        const q: Question = qRes.data.question;
        setQuestion(q); setTimeLeft(q.timeLimit);
        if (skill === 'SPEAKING') setPrepTime(60);
      }
      startTimeRef.current = Date.now();
      setStage('question');
    } catch (err: unknown) {
      const e = err as { response?: { status?: number; data?: { error?: string } }; message?: string };
      const status = e?.response?.status;
      const msg = e?.response?.data?.error || e?.message || 'Unknown error';
      if (status === 401) {
        toast.error('Session expired — please log in again.');
      } else if (!e?.response) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        toast.error(`Cannot reach backend at ${apiUrl} — is it running?`, { duration: 6000 });
      } else {
        toast.error(`Error ${status}: ${msg}`, { duration: 6000 });
      }
      setStage('select-part');
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line

  // Auto-select if preselected skill in URL
  useEffect(() => {
    if (preselected) {
      setSelectedSkill(preselected);
      setStage('select-part');
    }
  }, []); // eslint-disable-line

  // Timer countdown
  useEffect(() => {
    if (stage !== 'question' || timeLeft === null || selectedSkill === 'WRITING') return;
    if (timeLeft <= 0) { handleSubmit(); return; }
    const t = setTimeout(() => setTimeLeft(p => (p ?? 0) - 1), 1000);
    return () => clearTimeout(t);
  });

  useEffect(() => {
    if (prepTime === null || prepTime <= 0) return;
    const t = setTimeout(() => setPrepTime(p => (p ?? 0) - 1), 1000);
    return () => clearTimeout(t);
  });

  const handleSubmit = async () => {
    if (!sessionId) return;
    const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
    setTimeTaken(elapsed);
    setStage('evaluating');
    try {
      if (isSection && section) {
        const res = await sessionsApi.respondSection(sessionId, {
          skill: selectedSkill as 'READING' | 'LISTENING', section, answers: sectionAnswers, timeTaken: elapsed,
        });
        await sessionsApi.complete(sessionId);
        setSectionFeedback(res.data.feedback);
      } else if (selectedSkill === 'SPEAKING' && audioBlob && question) {
        const res = await sessionsApi.respondAudio(sessionId, audioBlob, question, question.subType, elapsed);
        await sessionsApi.complete(sessionId);
        setTranscript(res.data.transcript || '');
        setFeedback(res.data.feedback);
      } else if (question) {
        const res = await sessionsApi.respond(sessionId, { skill: selectedSkill!, subType: question.subType, question, userAnswer, timeTaken: elapsed });
        await sessionsApi.complete(sessionId);
        setFeedback(res.data.feedback);
      }
      setStage('feedback');
    } catch (err) {
      console.error(err);
      toast.error('Evaluation failed. Please try again.');
      setStage('question');
    }
  };

  const fetchBand9 = async () => {
    if (!question) return;
    setLoadingBand9(true);
    try { setBand9((await questionsApi.band9(question)).data.answer); }
    catch { toast.error('Failed to generate Band 9 answer'); }
    finally { setLoadingBand9(false); }
  };

  const goBack = () => {
    resetState();
    setStage(selectedSkill ? 'select-part' : 'select');
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  // ── 1. Select skill ──────────────────────────────────────────────────────
  if (stage === 'select') return (
    <div className="p-6 max-w-3xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Quick Practice</h1>
      <p className="text-gray-500 mb-8">Choose a skill to practise. Then pick the specific CELPIP part or task you want to work on.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SKILLS.map(({ id, label, icon: Icon, color, bg, parts, questions, desc }) => (
          <button key={id} onClick={() => { setSelectedSkill(id); setStage('select-part'); }}
            className="card-hover p-6 text-left flex items-start gap-4">
            <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', bg)}>
              <Icon className={clsx('w-6 h-6', color)} />
            </div>
            <div>
              <div className="font-semibold text-gray-900">{label}</div>
              <div className="text-sm text-gray-500 mt-0.5">{desc}</div>
              <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                <span className="bg-gray-100 px-2 py-0.5 rounded-full">{parts} {id === 'WRITING' || id === 'SPEAKING' ? 'tasks' : 'parts'}</span>
                <span className="bg-gray-100 px-2 py-0.5 rounded-full">{questions} questions</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  // ── 2. Select part / task ────────────────────────────────────────────────
  if (stage === 'select-part' && selectedSkill) {
    const skillMeta = SKILLS.find(s => s.id === selectedSkill)!;
    const Icon = skillMeta.icon;

    const parts: (CelpipPart | CelpipTask)[] =
      selectedSkill === 'LISTENING' ? LISTENING_PARTS :
      selectedSkill === 'READING'   ? READING_PARTS :
      selectedSkill === 'WRITING'   ? WRITING_TASKS :
      SPEAKING_TASKS;

    return (
      <div className="p-6 max-w-3xl mx-auto animate-fade-in">
        <button onClick={() => setStage('select')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to skill selection
        </button>
        <div className={clsx('flex items-center gap-3 mb-2')}>
          <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center', skillMeta.bg)}>
            <Icon className={clsx('w-5 h-5', skillMeta.color)} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{skillMeta.label}</h2>
            <p className="text-sm text-gray-500">Select a {selectedSkill === 'WRITING' || selectedSkill === 'SPEAKING' ? 'task' : 'part'} to practise</p>
          </div>
        </div>

        {/* CELPIP structure note */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 text-sm text-amber-800">
          <strong>Real CELPIP:</strong>&nbsp;
          {selectedSkill === 'LISTENING' && '6 parts, ~38 questions total. Each part tests different listening skills.'}
          {selectedSkill === 'READING' && '4 parts, ~38 questions total. Each part uses a different text type.'}
          {selectedSkill === 'WRITING' && '2 tasks (27 min + 26 min). Both require 150–200 words.'}
          {selectedSkill === 'SPEAKING' && '8 tasks, ~2 minutes each. Each task type tests different speaking skills.'}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {parts.map((p) => {
            const num = p.number;
            const isLR = selectedSkill === 'LISTENING' || selectedSkill === 'READING';
            const qCount = 'questionCount' in p ? p.questionCount : 1;
            const mins = p.timeMinutes;
            return (
              <button key={num}
                onClick={() => {
                  loadQuestion(selectedSkill, isLR ? num : null, !isLR ? p.subType : null);
                }}
                className="card-hover p-5 text-left space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                      {isLR ? `Part ${num}` : `Task ${num}`}
                    </div>
                    <div className="font-semibold text-gray-900 text-sm">{p.name}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" />
                </div>
                <p className="text-xs text-gray-500">{p.description}</p>
                <div className="flex gap-2 text-xs text-gray-400">
                  {isLR && <span className="bg-gray-100 px-2 py-0.5 rounded-full">~{qCount} questions</span>}
                  <span className="bg-gray-100 px-2 py-0.5 rounded-full">~{mins} min</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading || (isSection ? !section : !question)) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="animate-spin w-10 h-10 border-2 border-brand-600 border-t-transparent rounded-full" />
      <p className="text-gray-500 text-center max-w-xs">
        {isSection
          ? 'Generating your section with AI — this takes ~20 seconds...'
          : 'Generating your question...'}
      </p>
    </div>
  );

  // ── Evaluating ───────────────────────────────────────────────────────────
  if (stage === 'evaluating') return (
    <div className="flex flex-col items-center justify-center h-64 gap-4 animate-fade-in">
      <div className="animate-spin w-10 h-10 border-2 border-brand-600 border-t-transparent rounded-full" />
      <p className="text-gray-500 font-medium">Evaluating your answers...</p>
      <p className="text-sm text-gray-400">This may take 15–20 seconds</p>
    </div>
  );

  // ── Section Feedback ─────────────────────────────────────────────────────
  if (stage === 'feedback' && isSection && sectionFeedback && section) {
    return (
      <SectionFeedbackPanel
        section={section}
        feedback={sectionFeedback}
        onNewQuestion={() => { setStage('select-part'); resetState(); }}
      />
    );
  }

  // ── Single Feedback ──────────────────────────────────────────────────────
  if (stage === 'feedback' && !isSection && feedback && question) return (
    <div className="p-6 max-w-3xl mx-auto animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Your Results</h2>
        <div className="flex gap-2">
          <button onClick={fetchBand9} disabled={loadingBand9} className="btn-secondary btn-sm flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
            {loadingBand9 ? 'Loading...' : 'Band 9 Answer'}
          </button>
          <button onClick={() => { setStage('select-part'); resetState(); }} className="btn-primary btn-sm">
            <RefreshCw className="w-3.5 h-3.5" /> Practice Again
          </button>
        </div>
      </div>
      <FeedbackPanel
        skill={selectedSkill!} question={question} feedback={feedback}
        userAnswer={selectedSkill === 'SPEAKING' ? transcript : userAnswer}
        band9={band9} timeTaken={timeTaken}
      />
      {selectedSkill === 'SPEAKING' && transcript && (
        <div className="card p-4">
          <h3 className="font-medium text-gray-900 mb-2 text-sm">Your Transcript</h3>
          <p className="text-gray-600 text-sm leading-relaxed italic">&ldquo;{transcript}&rdquo;</p>
        </div>
      )}
    </div>
  );

  // ── Section Question View ────────────────────────────────────────────────
  if (isSection && section) {
    return (
      <>
        <div className="px-6 pt-4 max-w-4xl mx-auto">
          <button onClick={goBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
        <SectionQuestionView
          section={section} answers={sectionAnswers}
          onAnswerChange={(qId, ans) => setSectionAnswers(prev => ({ ...prev, [qId]: ans }))}
          onSubmit={handleSubmit} timeLeft={timeLeft}
        />
      </>
    );
  }

  // ── Single Question View ─────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-3xl mx-auto animate-fade-in space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {(() => {
            const meta = SKILLS.find(s => s.id === selectedSkill)!;
            return <div className={clsx('flex items-center gap-2 badge', meta.bg, meta.color)}><meta.icon className="w-3.5 h-3.5" />{meta.label}</div>;
          })()}
          <span className="text-sm text-gray-400">Difficulty {question!.difficulty}/10</span>
        </div>
        {timeLeft !== null && selectedSkill !== 'WRITING' && (
          <div className={clsx('flex items-center gap-1.5 font-mono text-sm font-semibold px-3 py-1 rounded-full',
            timeLeft < 20 ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-700')}>
            <Clock className="w-4 h-4" />{fmt(timeLeft)}
          </div>
        )}
      </div>

      <div className="card p-4 bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-800">{question!.instructions}</p>
      </div>

      {/* Scene photo for Task 3 — Describing a Scene */}
      {selectedSkill === 'SPEAKING' && question!.subType === 'describing_scene' && question!.photoUrl && (
        <div className="card overflow-hidden">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wide px-5 pt-4 pb-2">
            Scene to Describe
          </div>
          <img
            src={question!.photoUrl}
            alt="Scene to describe"
            className="w-full object-cover max-h-72"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div className="px-5 py-2 bg-amber-50 border-t border-amber-100">
            <p className="text-xs text-amber-700">Study this image carefully during your preparation time. Describe what you see in detail.</p>
          </div>
        </div>
      )}

      <div className="card p-5">
        <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
          {selectedSkill === 'SPEAKING' ? 'Speaking Task' : 'Question'}
        </div>
        <p className="text-gray-900 font-medium leading-relaxed">{question!.prompt}</p>
      </div>

      {selectedSkill === 'WRITING' && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">Your Response</div>
            <div className="text-xs text-gray-400">{userAnswer.split(/\s+/).filter(Boolean).length} words</div>
          </div>
          <textarea className="textarea w-full min-h-[220px] text-sm" placeholder="Write your response here..."
            value={userAnswer} onChange={e => setUserAnswer(e.target.value)} />
          {timeLeft !== null && (
            <div className={clsx('mt-2 flex items-center gap-1.5 text-xs font-mono font-medium',
              timeLeft < 60 ? 'text-red-500' : 'text-gray-400')}>
              <Clock className="w-3.5 h-3.5" /> {fmt(timeLeft)} remaining
            </div>
          )}
        </div>
      )}

      {selectedSkill === 'SPEAKING' && (
        <SpeakingRecorder
          onRecordingComplete={setAudioBlob} audioBlob={audioBlob}
          onReset={() => setAudioBlob(null)} prepTime={prepTime}
        />
      )}

      <button onClick={handleSubmit}
        disabled={
          (selectedSkill === 'WRITING' && userAnswer.trim().length < 20) ||
          (selectedSkill === 'SPEAKING' && !audioBlob)
        }
        className="btn-primary btn-lg w-full">
        <Send className="w-4 h-4" /> Submit Answer <ChevronRight className="w-4 h-4" />
      </button>

      <button onClick={goBack} className="btn-ghost w-full text-sm">← Back</button>
    </div>
  );
}

export default function PracticePageWrapper() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full" /></div>}>
      <PracticePage />
    </Suspense>
  );
}
