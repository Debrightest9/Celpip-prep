'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi, saveAuth } from '@/lib/api';

const CLB_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', email: '', password: '', targetScore: 9, testDate: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password || undefined,
        targetScore: form.targetScore,
        testDate: form.testDate || undefined,
      };
      const { data } = await authApi.register(payload);
      saveAuth(data.token, data.user);
      toast.success(`Welcome, ${data.user.name}! Your User ID: ${data.user.userId}`);
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">CELPIP Prep AI</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Start your prep journey</h1>
          <p className="text-gray-500 mt-1 text-sm">Free account — no credit card needed</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input
                type="text"
                className="input"
                placeholder="Your name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                className="input"
                placeholder="you@email.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password <span className="text-gray-400 font-normal">(optional)</span></label>
              <input
                type="password"
                className="input"
                placeholder="Optional — leave blank to login with email only"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Target CLB Score</label>
                <select
                  className="input"
                  value={form.targetScore}
                  onChange={e => setForm(f => ({ ...f, targetScore: parseInt(e.target.value) }))}
                >
                  {CLB_OPTIONS.map(n => (
                    <option key={n} value={n}>CLB {n}{n === 9 ? ' (recommended)' : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Test Date <span className="text-gray-400 font-normal">(optional)</span></label>
                <input
                  type="date"
                  className="input"
                  value={form.testDate}
                  onChange={e => setForm(f => ({ ...f, testDate: e.target.value }))}
                />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full btn-lg mt-2">
              {loading ? 'Creating account...' : 'Create Free Account'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-600 font-medium hover:underline">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
