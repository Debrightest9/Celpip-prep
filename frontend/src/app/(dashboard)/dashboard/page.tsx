'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usersApi } from '@/lib/api';
import { DashboardData, Skill } from '@/types';
import { Headphones, BookOpen, PenLine, Mic, Zap, TestTube, Target, ArrowRight, Trophy, Flame, Star, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import clsx from 'clsx';

const SKILL_META: Record<Skill, { icon: typeof Headphones; label: string; color: string; bg: string; border: string }> = {
  LISTENING: { icon: Headphones, label: 'Listening', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  READING: { icon: BookOpen, label: 'Reading', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  WRITING: { icon: PenLine, label: 'Writing', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  SPEAKING: { icon: Mic, label: 'Speaking', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
};

function clbColor(score: number | null, target: number) {
  if (!score) return 'text-gray-400';
  if (score >= target) return 'text-green-600';
  if (score >= target - 1) return 'text-yellow-600';
  return 'text-red-500';
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    usersApi.dashboard()
      .then(r => setData(r.data))
      .catch(err => {
        const msg = err?.response?.data?.error || err?.message || 'Unknown error';
        const status = err?.response?.status;
        setError(status ? `${status}: ${msg}` : msg);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full" />
    </div>
  );

  if (!data) return (
    <div className="p-8 text-center space-y-3">
      <p className="text-gray-700 font-medium">Failed to load dashboard.</p>
      {error && <p className="text-sm text-red-500 font-mono bg-red-50 px-4 py-2 rounded-lg inline-block">{error}</p>}
      <p className="text-xs text-gray-400">API: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}</p>
      <button onClick={() => { setLoading(true); setError(null); usersApi.dashboard().then(r => setData(r.data)).catch(e => setError(e?.response?.data?.error || e?.message || 'Unknown error')).finally(() => setLoading(false)); }}
        className="btn-primary text-sm">Retry</button>
    </div>
  );

  const { user, overallClb, skillScores, weakAreas, recentSessions, progressHistory } = data;
  const chartData = progressHistory.slice(-15).map(p => ({ date: new Date(p.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }), CLB: p.clbScore }));

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.name.split(' ')[0]} 👋</h1>
          <p className="text-gray-500 mt-1">
            {user.testDate
              ? `${Math.max(0, Math.ceil((new Date(user.testDate).getTime() - Date.now()) / 86400000))} days until your test`
              : 'Keep practicing to reach your goal'}
          </p>
        </div>
        <div className="flex gap-3">
          <div className="card px-4 py-3 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <div>
              <div className="text-xs text-gray-400">Streak</div>
              <div className="font-bold text-gray-900">{user.streak} days</div>
            </div>
          </div>
          <div className="card px-4 py-3 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <div>
              <div className="text-xs text-gray-400">XP</div>
              <div className="font-bold text-gray-900">{user.xp.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Overall CLB + Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Overall */}
        <div className="card p-6 flex flex-col items-center justify-center text-center">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Estimated CLB Level</div>
          <div className={clsx('text-7xl font-extrabold mb-2', clbColor(overallClb, user.targetScore))}>
            {overallClb ?? '–'}
          </div>
          <div className="text-sm text-gray-500">Target: CLB {user.targetScore}</div>
          {overallClb && (
            <div className={clsx('mt-3 badge', overallClb >= user.targetScore ? 'badge-green' : 'badge-yellow')}>
              {overallClb >= user.targetScore ? '✓ Target reached!' : `${user.targetScore - overallClb} more to go`}
            </div>
          )}
        </div>

        {/* Skill scores */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-3">
          {(Object.keys(SKILL_META) as Skill[]).map(skill => {
            const meta = SKILL_META[skill];
            const score = skillScores[skill];
            const isWeak = weakAreas.includes(skill);
            return (
              <div key={skill} className={clsx('card p-4', isWeak && 'border-red-200')}>
                <div className="flex items-center justify-between mb-3">
                  <div className={clsx('flex items-center gap-2 text-sm font-medium', meta.color)}>
                    <meta.icon className="w-4 h-4" />
                    {meta.label}
                  </div>
                  {isWeak && <span className="badge-red text-xs">Needs work</span>}
                </div>
                <div className="flex items-end gap-2">
                  <span className={clsx('text-3xl font-bold', clbColor(score, user.targetScore))}>
                    {score ?? '–'}
                  </span>
                  {score && <span className="text-sm text-gray-400 mb-1">/ 12 CLB</span>}
                </div>
                {score && (
                  <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={clsx('h-full rounded-full', meta.bg.replace('bg-', 'bg-'))} style={{ width: `${(score / 12) * 100}%`, backgroundColor: meta.color.includes('blue') ? '#3b82f6' : meta.color.includes('green') ? '#22c55e' : meta.color.includes('purple') ? '#a855f7' : '#f97316' }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart + Weak areas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Progress chart */}
        <div className="card p-6 lg:col-span-2">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand-600" /> CLB Progress Over Time
          </h3>
          {chartData.length > 1 ? (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis domain={[1, 12]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
                <Line type="monotone" dataKey="CLB" stroke="#6473f1" strokeWidth={2} dot={{ r: 3, fill: '#6473f1' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-gray-400 text-sm">
              Complete some practice sessions to see your progress chart
            </div>
          )}
        </div>

        {/* Weak areas + recommendations */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Today&apos;s Focus</h3>
          {weakAreas.length > 0 ? (
            <div className="space-y-3">
              {weakAreas.slice(0, 3).map(skill => {
                const meta = SKILL_META[skill];
                return (
                  <Link key={skill} href={`/practice?skill=${skill}`}
                    className={clsx('flex items-center justify-between p-3 rounded-lg border transition-colors hover:shadow-sm', meta.border, meta.bg)}>
                    <div className="flex items-center gap-2">
                      <meta.icon className={clsx('w-4 h-4', meta.color)} />
                      <span className="text-sm font-medium text-gray-700">{meta.label}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Practice first to get personalized recommendations.</p>
          )}
          <Link href="/practice" className="btn-primary w-full mt-4 text-sm">
            <Zap className="w-4 h-4" /> Start Practicing
          </Link>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/practice" className="card-hover p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
            <Zap className="w-5 h-5 text-brand-600" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">Quick Practice</div>
            <div className="text-xs text-gray-500">Single question, instant feedback</div>
          </div>
        </Link>
        <Link href="/test" className="card-hover p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
            <TestTube className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">Full Test Simulation</div>
            <div className="text-xs text-gray-500">All 4 skills, timed, real exam feel</div>
          </div>
        </Link>
        <Link href="/study-plan" className="card-hover p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
            <Target className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">Study Plan</div>
            <div className="text-xs text-gray-500">AI-generated 7-day plan</div>
          </div>
        </Link>
      </div>

      {/* Recent sessions */}
      {recentSessions.length > 0 && (
        <div className="card">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Recent Sessions</h3>
            <Link href="/progress" className="text-sm text-brand-600 hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentSessions.map(s => (
              <Link key={s.id} href={`/results/${s.id}`} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={clsx('w-2 h-2 rounded-full', s.clbEstimate && s.clbEstimate >= (data.user.targetScore) ? 'bg-green-500' : 'bg-orange-400')} />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {s.type === 'FULL_TEST' ? 'Full Test' : s.type === 'QUICK_PRACTICE' ? 'Quick Practice' : 'Weak Area Training'}
                      {s.skill && ` — ${SKILL_META[s.skill]?.label}`}
                    </div>
                    <div className="text-xs text-gray-400">{new Date(s.completedAt!).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {s.clbEstimate && <span className="badge-blue">CLB {s.clbEstimate}</span>}
                  <ArrowRight className="w-4 h-4 text-gray-300" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
