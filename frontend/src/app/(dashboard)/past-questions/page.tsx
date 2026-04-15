'use client';
import { useState } from 'react';
import {
  BookOpen, Headphones, PenLine, Mic, ChevronRight, ChevronDown,
  CheckCircle, XCircle, Eye, EyeOff, ArrowLeft, Clock, FileText,
  Volume2, MessageSquare,
} from 'lucide-react';
import clsx from 'clsx';
import {
  Skill,
  ReadingListeningSet,
  WritingSet,
  SpeakingSet,
  PastQuestionSet,
  MCQQuestion,
  READING_SETS,
  LISTENING_SETS,
  WRITING_SETS,
  SPEAKING_SETS,
  getSets,
} from '@/lib/past-questions-data';

// ─── Types ───────────────────────────────────────────────────────────────────

type Stage = 'skill' | 'set-list' | 'view';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const SKILLS: { skill: Skill; label: string; icon: typeof BookOpen; color: string; bg: string; border: string; sets: PastQuestionSet[] }[] = [
  { skill: 'READING',   label: 'Reading',   icon: BookOpen,   color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200',  sets: READING_SETS },
  { skill: 'LISTENING', label: 'Listening', icon: Headphones, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', sets: LISTENING_SETS },
  { skill: 'WRITING',   label: 'Writing',   icon: PenLine,    color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-200',  sets: WRITING_SETS },
  { skill: 'SPEAKING',  label: 'Speaking',  icon: Mic,        color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', sets: SPEAKING_SETS },
];

function skillMeta(skill: Skill) {
  return SKILLS.find((s) => s.skill === skill)!;
}

// ─── MCQ Practice Component ───────────────────────────────────────────────────

function MCQPractice({ questions }: { questions: MCQQuestion[] }) {
  const [selected, setSelected] = useState<Record<number, string>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [showAll, setShowAll] = useState(false);

  const score = questions.filter((q) => selected[q.num] === q.answer).length;
  const allAnswered = questions.every((q) => selected[q.num]);

  return (
    <div className="space-y-6">
      {/* Score bar */}
      {allAnswered && (
        <div className={clsx(
          'flex items-center gap-3 p-4 rounded-xl border',
          score === questions.length ? 'bg-green-50 border-green-200' :
          score >= questions.length * 0.7 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'
        )}>
          {score === questions.length
            ? <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            : <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />}
          <div>
            <div className="font-semibold text-gray-900">
              {score}/{questions.length} correct
            </div>
            <div className="text-sm text-gray-500">
              {score === questions.length ? 'Perfect score!' :
               score >= questions.length * 0.7 ? 'Good — review the ones you missed.' :
               'Keep practising — try again!'}
            </div>
          </div>
          <button
            onClick={() => setShowAll(!showAll)}
            className="ml-auto text-sm text-brand-600 hover:underline"
          >
            {showAll ? 'Hide' : 'Show'} all explanations
          </button>
        </div>
      )}

      {questions.map((q) => {
        const userAns = selected[q.num];
        const isCorrect = userAns === q.answer;
        const showExplanation = revealed[q.num] || (showAll && allAnswered);

        return (
          <div key={q.num} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex gap-3 mb-4">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center">
                {q.num}
              </span>
              <p className="text-gray-800 font-medium leading-snug">{q.question}</p>
            </div>

            <div className="space-y-2 mb-3">
              {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                const isSelected = userAns === opt;
                const isAnswer = q.answer === opt;
                const hasAnswered = !!userAns;

                return (
                  <button
                    key={opt}
                    disabled={!!userAns}
                    onClick={() => setSelected((prev) => ({ ...prev, [q.num]: opt }))}
                    className={clsx(
                      'w-full text-left flex gap-3 items-start px-4 py-3 rounded-lg border text-sm transition-colors',
                      !hasAnswered && 'hover:bg-gray-50 border-gray-200',
                      hasAnswered && isAnswer && 'bg-green-50 border-green-300 text-green-800',
                      hasAnswered && isSelected && !isAnswer && 'bg-red-50 border-red-300 text-red-700',
                      hasAnswered && !isSelected && !isAnswer && 'border-gray-100 text-gray-400',
                      !hasAnswered && 'border-gray-200 text-gray-700'
                    )}
                  >
                    <span className={clsx(
                      'flex-shrink-0 w-5 h-5 rounded-full border text-xs font-bold flex items-center justify-center',
                      !hasAnswered && 'border-gray-300 text-gray-500',
                      hasAnswered && isAnswer && 'border-green-500 bg-green-500 text-white',
                      hasAnswered && isSelected && !isAnswer && 'border-red-400 bg-red-400 text-white',
                      hasAnswered && !isSelected && !isAnswer && 'border-gray-200 text-gray-300'
                    )}>
                      {opt}
                    </span>
                    {q.options[opt]}
                  </button>
                );
              })}
            </div>

            {userAns && (
              <div>
                <button
                  onClick={() => setRevealed((p) => ({ ...p, [q.num]: !p[q.num] }))}
                  className="flex items-center gap-1.5 text-xs text-brand-600 hover:underline"
                >
                  {showExplanation ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {showExplanation ? 'Hide' : 'Show'} explanation
                </button>
                {showExplanation && (
                  <div className={clsx(
                    'mt-2 p-3 rounded-lg text-sm',
                    isCorrect ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-800'
                  )}>
                    <span className="font-semibold">Correct answer: {q.answer}. </span>
                    {q.explanation}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {allAnswered && (
        <button
          onClick={() => { setSelected({}); setRevealed({}); setShowAll(false); }}
          className="w-full py-3 rounded-xl border-2 border-brand-200 text-brand-700 font-medium hover:bg-brand-50 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

// ─── Reading/Listening Set View ───────────────────────────────────────────────

function ReadingListeningView({ set }: { set: ReadingListeningSet }) {
  const [tab, setTab] = useState<'read' | 'practice'>('read');
  const meta = skillMeta(set.skill);

  return (
    <div>
      {/* Passage / Script header */}
      <div className={clsx('flex gap-2 mb-4 p-1 bg-gray-100 rounded-xl w-fit')}>
        <button
          onClick={() => setTab('read')}
          className={clsx(
            'px-4 py-1.5 rounded-lg text-sm font-medium transition-colors',
            tab === 'read' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
          )}
        >
          {set.skill === 'READING' ? 'Passage' : 'Audio Script'}
        </button>
        <button
          onClick={() => setTab('practice')}
          className={clsx(
            'px-4 py-1.5 rounded-lg text-sm font-medium transition-colors',
            tab === 'practice' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
          )}
        >
          Practice ({set.questions.length} Qs)
        </button>
      </div>

      {tab === 'read' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {set.skill === 'LISTENING' && (
            <div className={clsx('flex items-center gap-2 mb-4 p-3 rounded-lg text-sm', meta.bg, meta.color)}>
              <Volume2 className="w-4 h-4 flex-shrink-0" />
              <span>In the real CELPIP test, you would listen to this audio. Read the script below to prepare, then test yourself on the Questions tab.</span>
            </div>
          )}
          <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed text-[0.9rem]">
            {set.passage}
          </pre>
        </div>
      )}

      {tab === 'practice' && (
        <MCQPractice questions={set.questions} />
      )}
    </div>
  );
}

// ─── Writing Set View ─────────────────────────────────────────────────────────

function WritingView({ set }: { set: WritingSet }) {
  const [showSample, setShowSample] = useState(false);
  const [showTips, setShowTips] = useState(false);

  return (
    <div className="space-y-4">
      {/* Task info bar */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium">
          <Clock className="w-3.5 h-3.5" />
          {set.timeAllowed}
        </div>
        <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium">
          <FileText className="w-3.5 h-3.5" />
          {set.wordCount}
        </div>
      </div>

      {/* Task prompt */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-3">Task Prompt</h3>
        <div className="text-gray-700 leading-relaxed whitespace-pre-line text-[0.9rem]">
          {set.task}
        </div>
      </div>

      {/* Sample response */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <button
          onClick={() => setShowSample(!showSample)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2 font-medium text-gray-900">
            <Eye className="w-4 h-4 text-green-600" />
            Sample Band 10–12 Response
          </div>
          <ChevronDown className={clsx('w-4 h-4 text-gray-500 transition-transform', showSample && 'rotate-180')} />
        </button>
        {showSample && (
          <div className="px-5 pb-5 border-t border-gray-100">
            <div className="mt-4 p-4 bg-green-50 rounded-lg text-gray-800 text-sm leading-relaxed whitespace-pre-line">
              {set.sampleResponse}
            </div>
          </div>
        )}
      </div>

      {/* Scoring tips */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <button
          onClick={() => setShowTips(!showTips)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2 font-medium text-gray-900">
            <CheckCircle className="w-4 h-4 text-brand-600" />
            Scoring Tips
          </div>
          <ChevronDown className={clsx('w-4 h-4 text-gray-500 transition-transform', showTips && 'rotate-180')} />
        </button>
        {showTips && (
          <div className="px-5 pb-5 border-t border-gray-100">
            <ul className="mt-4 space-y-2">
              {set.scoringTips.map((tip, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-700">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Speaking Set View ────────────────────────────────────────────────────────

function SpeakingView({ set }: { set: SpeakingSet }) {
  const [showSample, setShowSample] = useState(false);
  const [showTips, setShowTips] = useState(false);

  return (
    <div className="space-y-4">
      {/* Timer info */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-1.5 bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full text-sm font-medium">
          <Clock className="w-3.5 h-3.5" />
          Prep: {set.preparationTime}
        </div>
        <div className="flex items-center gap-1.5 bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full text-sm font-medium">
          <Mic className="w-3.5 h-3.5" />
          Response: {set.responseTime}
        </div>
      </div>

      {/* Situation + prompt */}
      {set.situation && (
        <div className="bg-orange-50 rounded-xl border border-orange-200 p-4">
          <div className="flex gap-2 text-sm">
            <MessageSquare className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-orange-800">Situation: </span>
              <span className="text-orange-700">{set.situation}</span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-2">Task</h3>
        <p className="text-gray-700 leading-relaxed text-[0.9rem] whitespace-pre-line">{set.prompt}</p>
      </div>

      {/* Sample response */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <button
          onClick={() => setShowSample(!showSample)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2 font-medium text-gray-900">
            <Eye className="w-4 h-4 text-orange-600" />
            Sample Band 10–12 Response
          </div>
          <ChevronDown className={clsx('w-4 h-4 text-gray-500 transition-transform', showSample && 'rotate-180')} />
        </button>
        {showSample && (
          <div className="px-5 pb-5 border-t border-gray-100">
            <div className="mt-4 p-4 bg-orange-50 rounded-lg text-gray-800 text-sm leading-relaxed whitespace-pre-line">
              {set.sampleResponse}
            </div>
          </div>
        )}
      </div>

      {/* Scoring tips */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <button
          onClick={() => setShowTips(!showTips)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2 font-medium text-gray-900">
            <CheckCircle className="w-4 h-4 text-brand-600" />
            Scoring Tips
          </div>
          <ChevronDown className={clsx('w-4 h-4 text-gray-500 transition-transform', showTips && 'rotate-180')} />
        </button>
        {showTips && (
          <div className="px-5 pb-5 border-t border-gray-100">
            <ul className="mt-4 space-y-2">
              {set.scoringTips.map((tip, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-700">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Set List ─────────────────────────────────────────────────────────────────

function SetList({
  skill,
  onSelect,
}: {
  skill: Skill;
  onSelect: (set: PastQuestionSet) => void;
}) {
  const sets = getSets(skill);
  const meta = skillMeta(skill);
  const Icon = meta.icon;

  return (
    <div className="space-y-3">
      {sets.map((set) => {
        const isRorL = set.skill === 'READING' || set.skill === 'LISTENING';
        const rl = set as ReadingListeningSet;
        const writ = set as WritingSet;
        const speak = set as SpeakingSet;

        return (
          <button
            key={set.id}
            onClick={() => onSelect(set)}
            className={clsx(
              'w-full text-left p-4 rounded-xl border bg-white hover:shadow-sm transition-all group',
              meta.border
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center', meta.bg)}>
                  <Icon className={clsx('w-5 h-5', meta.color)} />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">
                    Part {set.part}: {set.partName}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{set.source}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isRorL && (
                  <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', meta.bg, meta.color)}>
                    {rl.questions.length} questions
                  </span>
                )}
                {set.skill === 'WRITING' && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-medium">
                    {writ.timeAllowed}
                  </span>
                )}
                {set.skill === 'SPEAKING' && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 font-medium">
                    {speak.responseTime}
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PastQuestionsPage() {
  const [stage, setStage] = useState<Stage>('skill');
  const [activeSkill, setActiveSkill] = useState<Skill | null>(null);
  const [activeSet, setActiveSet] = useState<PastQuestionSet | null>(null);

  const selectSkill = (skill: Skill) => {
    setActiveSkill(skill);
    setStage('set-list');
  };

  const selectSet = (set: PastQuestionSet) => {
    setActiveSet(set);
    setStage('view');
  };

  const back = () => {
    if (stage === 'view') { setStage('set-list'); setActiveSet(null); }
    else if (stage === 'set-list') { setStage('skill'); setActiveSkill(null); }
  };

  const meta = activeSkill ? skillMeta(activeSkill) : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        {stage !== 'skill' && (
          <button
            onClick={back}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        )}

        {stage === 'skill' && (
          <>
            <h1 className="text-2xl font-bold text-gray-900">Past Questions</h1>
            <p className="text-gray-500 mt-1 text-sm">
              CELPIP-style practice sets with sample answers and scoring tips. Select a skill to begin.
            </p>
          </>
        )}

        {stage === 'set-list' && meta && (
          <>
            <div className="flex items-center gap-2 mb-1">
              <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center', meta.bg)}>
                <meta.icon className={clsx('w-4 h-4', meta.color)} />
              </div>
              <h1 className="text-xl font-bold text-gray-900">{meta.label}</h1>
            </div>
            <p className="text-gray-500 text-sm">Select a part or task to study.</p>
          </>
        )}

        {stage === 'view' && activeSet && meta && (
          <div className="flex items-center gap-2 mb-1">
            <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center', meta.bg)}>
              <meta.icon className={clsx('w-4 h-4', meta.color)} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Part {activeSet.part}: {activeSet.partName}
              </h1>
              <p className="text-xs text-gray-400">{activeSet.source}</p>
            </div>
          </div>
        )}
      </div>

      {/* Skill selection grid */}
      {stage === 'skill' && (
        <div className="grid grid-cols-2 gap-4">
          {SKILLS.map(({ skill, label, icon: Icon, color, bg, border, sets }) => (
            <button
              key={skill}
              onClick={() => selectSkill(skill)}
              className={clsx(
                'p-5 rounded-2xl border-2 bg-white hover:shadow-md transition-all text-left group',
                border
              )}
            >
              <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center mb-3', bg)}>
                <Icon className={clsx('w-6 h-6', color)} />
              </div>
              <div className="font-bold text-gray-900 text-base">{label}</div>
              <div className="text-xs text-gray-400 mt-0.5">{sets.length} practice sets</div>

              {/* Part pills */}
              <div className="mt-3 flex flex-wrap gap-1">
                {sets.slice(0, 4).map((s) => (
                  <span key={s.id} className={clsx('text-[10px] px-2 py-0.5 rounded-full font-medium', bg, color)}>
                    Part {s.part}
                  </span>
                ))}
                {sets.length > 4 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                    +{sets.length - 4} more
                  </span>
                )}
              </div>

              <div className="mt-3 flex items-center gap-1 text-xs font-medium group-hover:gap-2 transition-all">
                <span className={color}>Browse sets</span>
                <ChevronRight className={clsx('w-3.5 h-3.5', color)} />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Set list */}
      {stage === 'set-list' && activeSkill && (
        <SetList skill={activeSkill} onSelect={selectSet} />
      )}

      {/* Set view */}
      {stage === 'view' && activeSet && (
        <>
          {(activeSet.skill === 'READING' || activeSet.skill === 'LISTENING') && (
            <ReadingListeningView set={activeSet as ReadingListeningSet} />
          )}
          {activeSet.skill === 'WRITING' && (
            <WritingView set={activeSet as WritingSet} />
          )}
          {activeSet.skill === 'SPEAKING' && (
            <SpeakingView set={activeSet as SpeakingSet} />
          )}
        </>
      )}
    </div>
  );
}
