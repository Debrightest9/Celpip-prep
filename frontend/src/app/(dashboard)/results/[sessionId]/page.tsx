'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { sessionsApi } from '@/lib/api';
import { Session, Skill, Question, CoachFeedback, WritingFeedback, SpeakingFeedback, ReadingListeningFeedback } from '@/types';
import FeedbackPanel from '@/components/FeedbackPanel';
import { ArrowLeft, Download, Brain, AlertTriangle, Lightbulb, BookOpen, Target, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const SKILL_COLORS: Record<Skill, string> = {
  LISTENING: 'text-blue-600 bg-blue-50',
  READING: 'text-green-600 bg-green-50',
  WRITING: 'text-purple-600 bg-purple-50',
  SPEAKING: 'text-orange-600 bg-orange-50',
};

export default function ResultsPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    sessionsApi.get(sessionId).then(r => setSession(r.data.session)).finally(() => setLoading(false));
  }, [sessionId]);

  const handleDownload = async () => {
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');
      if (!printRef.current) return;
      const canvas = await html2canvas(printRef.current, { scale: 2 });
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const imgW = 210;
      const imgH = (canvas.height * imgW) / canvas.width;
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgW, imgH);
      pdf.save(`celpip-results-${sessionId.slice(0, 8)}.pdf`);
      toast.success('PDF downloaded!');
    } catch {
      toast.error('Failed to generate PDF');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full" />
    </div>
  );

  if (!session) return (
    <div className="p-8 text-center">
      <p className="text-gray-500">Session not found.</p>
      <button onClick={() => router.back()} className="btn-primary mt-4">Go Back</button>
    </div>
  );

  const coach = session.overallFeedback as CoachFeedback | null;

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in space-y-6" ref={printRef}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => router.back()} className="btn-ghost btn-sm">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button onClick={handleDownload} className="btn-secondary btn-sm">
          <Download className="w-4 h-4" /> Download PDF
        </button>
      </div>

      {/* Session summary */}
      <div className="card p-5">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="text-sm text-gray-400 mb-1">
              {session.type === 'FULL_TEST' ? 'Full Test' : session.type === 'QUICK_PRACTICE' ? 'Quick Practice' : 'Weak Area Training'}
              {' · '}{session.completedAt ? new Date(session.completedAt).toLocaleDateString('en', { dateStyle: 'long' }) : ''}
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {session.clbEstimate ? `CLB ${session.clbEstimate}` : 'In Progress'}
            </h2>
          </div>
          <div className="flex gap-3">
            {session.responses.map(r => (
              <div key={r.id} className={clsx('rounded-lg px-3 py-2 text-center', SKILL_COLORS[r.skill])}>
                <div className="text-xs opacity-75 mb-0.5">{r.skill.charAt(0) + r.skill.slice(1).toLowerCase()}</div>
                <div className="text-lg font-bold">{r.clbScore ?? '–'}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Coach Feedback */}
      {coach && (
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5 text-brand-600" />
            <h3 className="font-semibold text-gray-900">AI Coach Analysis</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Weak patterns */}
            {coach.weakPatterns?.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-semibold text-red-700">Patterns to Fix</span>
                </div>
                <ul className="space-y-1.5">
                  {coach.weakPatterns.map((p, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-red-200 text-red-700 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Personalized tips */}
            {coach.personalizedTips?.length > 0 && (
              <div className="bg-brand-50 border border-brand-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-brand-600" />
                  <span className="text-sm font-semibold text-brand-700">Your Tips</span>
                </div>
                <ul className="space-y-1.5">
                  {coach.personalizedTips.slice(0, 5).map((t, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Readiness */}
            {coach.predictedReadiness && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-700">Readiness Assessment</span>
                </div>
                <p className="text-sm text-gray-700">{coach.predictedReadiness}</p>
              </div>
            )}

            {/* Study focus */}
            {coach.studyFocus?.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-semibold text-yellow-700">Focus This Week</span>
                </div>
                <ol className="space-y-1.5">
                  {coach.studyFocus.map((f, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-yellow-200 text-yellow-700 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                      {f}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          {/* Templates */}
          {coach.templates?.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-semibold text-gray-700">Useful Templates</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {coach.templates.map((t, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                    <div className="text-xs font-semibold text-gray-600 mb-2">{t.title}</div>
                    <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono leading-relaxed">{t.template}</pre>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Per-question tabs */}
      {session.responses.length > 0 && (
        <div className="card">
          <div className="border-b border-gray-100 px-4 pt-4">
            <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
              {session.responses.map((r, i) => (
                <button key={i} onClick={() => setActiveTab(i)}
                  className={clsx('flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    activeTab === i ? 'bg-brand-600 text-white' : 'text-gray-600 hover:bg-gray-100')}>
                  {r.skill.charAt(0) + r.skill.slice(1).toLowerCase()}
                  {r.clbScore ? ` · CLB ${r.clbScore}` : ''}
                </button>
              ))}
            </div>
          </div>
          <div className="p-4">
            {session.responses[activeTab] && (
              <FeedbackPanel
                skill={session.responses[activeTab].skill}
                question={session.responses[activeTab].question as Question}
                feedback={session.responses[activeTab].feedback as WritingFeedback | SpeakingFeedback | ReadingListeningFeedback}
                userAnswer={session.responses[activeTab].userAnswer}
                band9={null}
                timeTaken={session.responses[activeTab].timeTaken || 0}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
