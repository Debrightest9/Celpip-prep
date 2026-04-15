'use client';
import { Skill, WritingFeedback, SpeakingFeedback, Question } from '@/types';
import { CheckCircle, XCircle, ChevronDown, ChevronUp, Lightbulb, Trophy, Target } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

interface Props {
  skill: Skill;
  question: Question;
  feedback: WritingFeedback | SpeakingFeedback;
  userAnswer: string;
  band9: string | null;
  timeTaken: number;
}

// ── CLB Grade Banner ──────────────────────────────────────────────────────────
function GradeBanner({ clbScore, clbLabel, overallScore, correct }: {
  clbScore: number; clbLabel?: string; overallScore: number; correct?: boolean;
}) {
  const isPass = clbScore >= 7;
  const bg = clbScore >= 9 ? 'bg-green-50 border-green-300' : clbScore >= 7 ? 'bg-yellow-50 border-yellow-300' : 'bg-red-50 border-red-300';
  const numColor = clbScore >= 9 ? 'text-green-600' : clbScore >= 7 ? 'text-yellow-600' : 'text-red-600';
  const label = clbScore >= 10 ? 'Expert' : clbScore >= 9 ? 'Strong' : clbScore >= 8 ? 'Competent' : clbScore >= 7 ? 'Adequate' : clbScore >= 5 ? 'Developing' : 'Needs Work';

  return (
    <div className={clsx('rounded-2xl border-2 p-5 flex items-center gap-5', bg)}>
      {correct !== undefined ? (
        correct
          ? <CheckCircle className="w-12 h-12 text-green-500 flex-shrink-0" />
          : <XCircle className="w-12 h-12 text-red-500 flex-shrink-0" />
      ) : (
        <div className="flex-shrink-0 text-center">
          <div className={clsx('text-5xl font-black leading-none', numColor)}>{clbScore}</div>
          <div className="text-xs text-gray-500 font-medium mt-0.5">CLB</div>
        </div>
      )}
      <div className="flex-1">
        <div className={clsx('text-xl font-bold', numColor)}>
          {correct !== undefined
            ? (correct ? 'Correct Answer!' : 'Incorrect Answer')
            : `CLB ${clbScore} — ${label}`}
        </div>
        <div className="text-sm text-gray-600 mt-0.5">
          {clbLabel || (correct !== undefined ? (correct ? 'Well done!' : `The correct answer is shown below`) : `Overall score: ${overallScore}%`)}
        </div>
        {correct === undefined && (
          <div className="mt-2 h-2 bg-white/70 rounded-full overflow-hidden w-48">
            <div
              className={clsx('h-full rounded-full transition-all duration-700', clbScore >= 9 ? 'bg-green-500' : clbScore >= 7 ? 'bg-yellow-500' : 'bg-red-500')}
              style={{ width: `${overallScore}%` }}
            />
          </div>
        )}
      </div>
      <div className={clsx('px-3 py-1.5 rounded-full text-sm font-semibold border', isPass ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200')}>
        {isPass ? '✓ Pass' : '✗ Below CLB 7'}
      </div>
    </div>
  );
}

// ── Score Grid ────────────────────────────────────────────────────────────────
function ScoreGrid({ items }: { items: Array<{ label: string; score: number; comment: string; color: string }> }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map(({ label, score, comment, color }) => (
        <button key={label} onClick={() => setExpanded(expanded === label ? null : label)}
          className={clsx('text-left p-4 rounded-xl border-2 transition-all', expanded === label ? `border-${color}-300 bg-${color}-50` : 'border-gray-200 bg-white hover:border-gray-300')}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
            <span className={clsx('text-lg font-black', score >= 80 ? 'text-green-600' : score >= 65 ? 'text-yellow-600' : 'text-red-500')}>{score}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
            <div className={clsx('h-full rounded-full', score >= 80 ? 'bg-green-500' : score >= 65 ? 'bg-yellow-500' : 'bg-red-500')}
              style={{ width: `${score}%` }} />
          </div>
          {expanded === label && (
            <p className="text-xs text-gray-700 mt-2 leading-relaxed">{comment}</p>
          )}
          {expanded !== label && (
            <p className="text-xs text-gray-400 truncate">{comment.slice(0, 60)}...</p>
          )}
        </button>
      ))}
    </div>
  );
}

// ── Collapsible ───────────────────────────────────────────────────────────────
function Collapsible({ title, children, defaultOpen = false, icon, badge }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean; icon?: React.ReactNode; badge?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3.5 bg-gray-50 hover:bg-gray-100 transition-colors text-left">
        <div className="flex items-center gap-2 font-semibold text-gray-900 text-sm">
          {icon}{title}
          {badge && <span className="ml-1 badge-red">{badge}</span>}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && <div className="p-4 bg-white">{children}</div>}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function FeedbackPanel({ skill, feedback, userAnswer, band9, timeTaken }: Props) {

  // ── Writing ──────────────────────────────────────────────────────────────
  if (skill === 'WRITING') {
    const fb = feedback as WritingFeedback;
    const wordCount = userAnswer.trim().split(/\s+/).filter(Boolean).length;

    return (
      <div className="space-y-4 animate-slide-up">

        {/* Grade Banner */}
        <GradeBanner clbScore={fb.clbScore} clbLabel={fb.clbLabel} overallScore={fb.overallScore} />

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Word Count', value: `${wordCount}`, note: wordCount < 150 ? 'Too short' : wordCount > 200 ? 'Too long' : 'Good length', ok: wordCount >= 150 && wordCount <= 200 },
            { label: 'Time Taken', value: `${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s`, note: '', ok: true },
            { label: 'Overall', value: `${fb.overallScore}%`, note: fb.clbLabel, ok: fb.overallScore >= 60 },
          ].map(({ label, value, note, ok }) => (
            <div key={label} className={clsx('card p-3 text-center border', ok ? 'border-gray-200' : 'border-orange-300 bg-orange-50')}>
              <div className="text-xl font-bold text-gray-900">{value}</div>
              <div className="text-xs text-gray-400">{label}</div>
              {note && <div className={clsx('text-xs mt-0.5', ok ? 'text-gray-400' : 'text-orange-600 font-medium')}>{note}</div>}
            </div>
          ))}
        </div>

        {/* Score breakdown */}
        <div className="card p-5">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Score Breakdown — Click each to see feedback</div>
          <ScoreGrid items={[
            { label: 'Task Achievement', score: fb.taskAchievement.score, comment: fb.taskAchievement.comment, color: 'blue' },
            { label: 'Coherence', score: fb.coherence.score, comment: fb.coherence.comment, color: 'green' },
            { label: 'Vocabulary', score: fb.vocabulary.score, comment: fb.vocabulary.comment, color: 'purple' },
            { label: 'Grammar', score: fb.grammar.score, comment: fb.grammar.comment, color: 'orange' },
          ]} />
        </div>

        {/* Corrections */}
        {fb.corrections?.length > 0 && (
          <Collapsible
            title={`${fb.corrections.length} Correction${fb.corrections.length > 1 ? 's' : ''} Found`}
            defaultOpen
            badge={`${fb.corrections.length}`}
            icon={<XCircle className="w-4 h-4 text-red-500" />}
          >
            <div className="space-y-3">
              {fb.corrections.map((c, i) => (
                <div key={i} className="rounded-lg overflow-hidden border border-red-200">
                  <div className="bg-red-50 px-3 py-2 flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-red-700 line-through">&ldquo;{c.original}&rdquo;</span>
                  </div>
                  <div className="bg-green-50 px-3 py-2 flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-green-700 font-medium">&ldquo;{c.corrected}&rdquo;</span>
                  </div>
                  <div className="bg-blue-50 px-3 py-2">
                    <span className="text-xs text-blue-700">💡 {c.explanation}</span>
                  </div>
                </div>
              ))}
            </div>
          </Collapsible>
        )}

        {/* Improved version */}
        {fb.improvedVersion && (
          <Collapsible title="Your Answer — Improved to CLB 9" defaultOpen icon={<Target className="w-4 h-4 text-brand-600" />}>
            <div className="bg-brand-50 border border-brand-200 rounded-lg p-4 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
              {fb.improvedVersion}
            </div>
            <p className="text-xs text-gray-400 mt-2">↑ Same ideas as your answer, rewritten at CLB 9 level</p>
          </Collapsible>
        )}

        {/* Tips */}
        {fb.tips?.length > 0 && (
          <Collapsible title="5 Tips to Improve Your Score" defaultOpen icon={<Lightbulb className="w-4 h-4 text-yellow-500" />}>
            <ol className="space-y-2.5">
              {fb.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">{i + 1}</span>
                  {tip}
                </li>
              ))}
            </ol>
          </Collapsible>
        )}

        {/* Band 9 sample */}
        {(fb.band9Sample || band9) && (
          <Collapsible title="CLB 9-10 Model Answer" icon={<Trophy className="w-4 h-4 text-yellow-500" />}>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
              {band9 || fb.band9Sample}
            </div>
          </Collapsible>
        )}
      </div>
    );
  }

  // ── Speaking ─────────────────────────────────────────────────────────────
  const fb = feedback as SpeakingFeedback;

  return (
    <div className="space-y-4 animate-slide-up">

      {/* Grade Banner */}
      <GradeBanner clbScore={fb.clbScore} clbLabel={fb.clbLabel} overallScore={fb.overallScore} />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card p-3 text-center">
          <div className="text-xl font-bold text-gray-900">{timeTaken}s</div>
          <div className="text-xs text-gray-400">Speaking time</div>
          <div className={clsx('text-xs mt-0.5', timeTaken >= 45 ? 'text-green-600' : 'text-orange-500')}>
            {timeTaken < 30 ? 'Too brief — aim for 60+ sec' : timeTaken < 60 ? 'Good — try to reach 90 sec' : 'Excellent length'}
          </div>
        </div>
        <div className="card p-3 text-center">
          <div className="text-xl font-bold text-gray-900">{fb.overallScore}%</div>
          <div className="text-xs text-gray-400">Overall score</div>
          <div className="text-xs text-gray-400 mt-0.5">{fb.clbLabel}</div>
        </div>
      </div>

      {/* Score breakdown */}
      <div className="card p-5">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Score Breakdown — Click each to expand</div>
        <ScoreGrid items={[
          { label: 'Fluency', score: fb.fluency.score, comment: fb.fluency.comment, color: 'blue' },
          { label: 'Pronunciation', score: fb.pronunciation.score, comment: fb.pronunciation.comment, color: 'green' },
          { label: 'Vocabulary', score: fb.vocabulary.score, comment: fb.vocabulary.comment, color: 'purple' },
          { label: 'Content', score: fb.contentRelevance.score, comment: fb.contentRelevance.comment, color: 'orange' },
        ]} />
      </div>

      {/* How to say it better */}
      {fb.improvedAnswer && (
        <Collapsible title="How to Say It Better (CLB 9 Version)" defaultOpen icon={<Target className="w-4 h-4 text-brand-600" />}>
          <div className="bg-brand-50 border border-brand-200 rounded-lg p-4 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
            {fb.improvedAnswer}
          </div>
        </Collapsible>
      )}

      {/* Tips */}
      {fb.tips?.length > 0 && (
        <Collapsible title="5 Speaking Tips" defaultOpen icon={<Lightbulb className="w-4 h-4 text-yellow-500" />}>
          <ol className="space-y-2.5">
            {fb.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">{i + 1}</span>
                {tip}
              </li>
            ))}
          </ol>
        </Collapsible>
      )}

      {/* Band 9 model */}
      {(fb.band9Sample || band9) && (
        <Collapsible title="CLB 9 Model Answer" icon={<Trophy className="w-4 h-4 text-yellow-500" />}>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
            {band9 || fb.band9Sample}
          </div>
        </Collapsible>
      )}
    </div>
  );
}
