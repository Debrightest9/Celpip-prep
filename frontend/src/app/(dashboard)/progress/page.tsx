'use client';
import { useEffect, useState } from 'react';
import { progressApi, sessionsApi } from '@/lib/api';
import { Skill } from '@/types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BarChart3, Trophy, Zap, Target, TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

const COLORS: Record<Skill, string> = {
  LISTENING: '#3b82f6', READING: '#22c55e', WRITING: '#a855f7', SPEAKING: '#f97316',
};

export default function ProgressPage() {
  const [progress, setProgress] = useState<Record<string, Array<{ date: string; clbScore: number }>> | null>(null);
  const [trends, setTrends] = useState<Record<string, { current: number | null; change: number | null; direction: string }> | null>(null);
  const [stats, setStats] = useState<{ totalSessions: number; completedSessions: number; totalResponses: number; xp: number; streak: number; bestScores: Record<string, number> } | null>(null);
  const [sessions, setSessions] = useState<Array<{ id: string; type: string; clbEstimate: number | null; completedAt: string; responses: Array<{ skill: string }> }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      progressApi.get(undefined, 60),
      progressApi.stats(),
      sessionsApi.list(1, 20),
    ]).then(([p, s, sess]) => {
      setProgress(p.data.bySkill);
      setTrends(p.data.trends);
      setStats(s.data);
      setSessions(sess.data.sessions);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full" />
    </div>
  );

  // Build chart data — merge all skill data points by date
  const allDates = new Set<string>();
  if (progress) {
    Object.values(progress).forEach(pts => pts.forEach(p => allDates.add(p.date.slice(0, 10))));
  }
  const chartData = Array.from(allDates).sort().map(date => {
    const row: Record<string, string | number> = { date: new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' }) };
    if (progress) {
      for (const [skill, pts] of Object.entries(progress)) {
        const match = pts.find(p => p.date.slice(0, 10) === date);
        if (match) row[skill] = match.clbScore;
      }
    }
    return row;
  });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900">My Progress</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Tests Done', value: stats?.completedSessions || 0, icon: BarChart3, color: 'text-brand-600', bg: 'bg-brand-50' },
          { label: 'Questions', value: stats?.totalResponses || 0, icon: Zap, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Total XP', value: (stats?.xp || 0).toLocaleString(), icon: Trophy, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Day Streak', value: `${stats?.streak || 0} days`, icon: Target, color: 'text-green-600', bg: 'bg-green-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-4 flex items-center gap-3">
            <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center', bg)}>
              <Icon className={clsx('w-5 h-5', color)} />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{value}</div>
              <div className="text-xs text-gray-500">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Skills current scores */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {trends && (Object.entries(trends) as [Skill, { current: number | null; change: number | null; direction: string }][]).map(([skill, t]) => (
          <div key={skill} className="card p-4">
            <div className="text-xs text-gray-400 mb-1">{skill.charAt(0) + skill.slice(1).toLowerCase()}</div>
            <div className="flex items-end gap-1.5">
              <span className="text-3xl font-bold" style={{ color: COLORS[skill] }}>{t.current ?? '–'}</span>
              {t.current && <span className="text-sm text-gray-400 mb-1">CLB</span>}
            </div>
            {t.change !== null && (
              <div className={clsx('flex items-center gap-1 text-xs mt-1',
                t.direction === 'up' ? 'text-green-600' : t.direction === 'down' ? 'text-red-500' : 'text-gray-400')}>
                {t.direction === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> :
                  t.direction === 'down' ? <TrendingDown className="w-3.5 h-3.5" /> :
                    <Minus className="w-3.5 h-3.5" />}
                {t.change > 0 ? '+' : ''}{t.change} since start
              </div>
            )}
            {stats?.bestScores?.[skill] && (
              <div className="text-xs text-gray-400 mt-0.5">Best: CLB {stats.bestScores[skill]}</div>
            )}
          </div>
        ))}
      </div>

      {/* Progress chart */}
      <div className="card p-6">
        <h3 className="font-semibold text-gray-900 mb-4">CLB Scores Over Time (60 days)</h3>
        {chartData.length > 1 ? (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis domain={[1, 12]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Legend />
              {(['LISTENING', 'READING', 'WRITING', 'SPEAKING'] as Skill[]).map(skill => (
                <Line key={skill} type="monotone" dataKey={skill}
                  stroke={COLORS[skill]} strokeWidth={2}
                  dot={{ r: 3, fill: COLORS[skill] }} connectNulls />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[180px] flex flex-col items-center justify-center text-gray-400 gap-2">
            <BarChart3 className="w-8 h-8 opacity-30" />
            <p className="text-sm">Complete practice sessions to see your progress chart.</p>
            <Link href="/practice" className="btn-primary btn-sm mt-2">Start Practicing</Link>
          </div>
        )}
      </div>

      {/* Session history */}
      <div className="card">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Session History</h3>
        </div>
        {sessions.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No sessions yet. Start practicing!</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {sessions.map(s => (
              <Link key={s.id} href={`/results/${s.id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {s.type === 'FULL_TEST' ? 'Full Test' : s.type === 'QUICK_PRACTICE' ? 'Quick Practice' : 'Weak Area Training'}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {s.completedAt ? new Date(s.completedAt).toLocaleDateString('en', { dateStyle: 'medium' }) : 'In progress'}
                    {' · '}{s.responses.length} question{s.responses.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {s.clbEstimate && <span className="badge-blue">CLB {s.clbEstimate}</span>}
                  <ArrowRight className="w-4 h-4 text-gray-300" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
