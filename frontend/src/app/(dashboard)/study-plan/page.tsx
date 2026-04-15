'use client';
import { useEffect, useState } from 'react';
import { usersApi } from '@/lib/api';
import { Target, Calendar, RefreshCw, Clock, Lightbulb, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface StudyTask { title: string; duration: string; description: string }
interface StudyDay { day: string; focus: string; tasks: StudyTask[]; tip: string }

export default function StudyPlanPage() {
  const [plan, setPlan] = useState<StudyDay[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const loadPlan = async () => {
    try {
      const res = await usersApi.latestStudyPlan();
      const data = res.data.plan;
      setPlan(Array.isArray(data) ? data : data.plan || []);
    } catch {
      // No plan yet
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPlan(); }, []);

  const generatePlan = async () => {
    setGenerating(true);
    try {
      const res = await usersApi.generateStudyPlan();
      const data = res.data.plan;
      setPlan(Array.isArray(data) ? data : data.plan || []);
      toast.success('New study plan generated!');
    } catch {
      toast.error('Failed to generate study plan');
    } finally {
      setGenerating(false);
    }
  };

  const toggleCheck = (key: string) => {
    setChecked(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const FOCUS_COLORS: Record<string, string> = {
    LISTENING: 'bg-blue-100 text-blue-700',
    READING: 'bg-green-100 text-green-700',
    WRITING: 'bg-purple-100 text-purple-700',
    SPEAKING: 'bg-orange-100 text-orange-700',
  };

  const getFocusColor = (focus: string) => {
    const upper = focus.toUpperCase();
    for (const [key, cls] of Object.entries(FOCUS_COLORS)) {
      if (upper.includes(key)) return cls;
    }
    return 'bg-brand-100 text-brand-700';
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">7-Day Study Plan</h1>
          <p className="text-gray-500 mt-1">AI-generated plan tailored to your weak areas</p>
        </div>
        <button onClick={generatePlan} disabled={generating} className="btn-primary">
          <RefreshCw className={clsx('w-4 h-4', generating && 'animate-spin')} />
          {generating ? 'Generating...' : plan ? 'Regenerate' : 'Generate Plan'}
        </button>
      </div>

      {!plan ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-brand-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No study plan yet</h2>
          <p className="text-gray-500 mb-6">Generate your personalized 7-day CELPIP study plan based on your progress and weak areas.</p>
          <button onClick={generatePlan} disabled={generating} className="btn-primary btn-lg mx-auto">
            <Target className="w-4 h-4" />
            {generating ? 'Generating your plan...' : 'Generate My Study Plan'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {plan.map((day, dayIdx) => {
            const dayKey = `day-${dayIdx}`;
            const allDone = day.tasks.every((_, ti) => checked.has(`${dayKey}-${ti}`));
            return (
              <div key={dayIdx} className={clsx('card overflow-hidden', allDone && 'opacity-75')}>
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 text-sm font-bold flex items-center justify-center">
                      {dayIdx + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{day.day}</div>
                      <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', getFocusColor(day.focus))}>
                        {day.focus}
                      </span>
                    </div>
                  </div>
                  {allDone && (
                    <div className="badge-green flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Done
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="space-y-3 mb-4">
                    {day.tasks.map((task, ti) => {
                      const key = `${dayKey}-${ti}`;
                      const done = checked.has(key);
                      return (
                        <div key={ti}
                          className={clsx('flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                            done ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-transparent hover:border-gray-200')}
                          onClick={() => toggleCheck(key)}>
                          <div className={clsx('w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors',
                            done ? 'bg-green-500 border-green-500' : 'border-gray-300')}>
                            {done && <CheckCircle className="w-3 h-3 text-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={clsx('text-sm font-medium', done ? 'line-through text-gray-400' : 'text-gray-900')}>{task.title}</span>
                              <span className="flex items-center gap-1 text-xs text-gray-400">
                                <Clock className="w-3 h-3" /> {task.duration}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {day.tip && (
                    <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <Lightbulb className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-yellow-800">{day.tip}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
