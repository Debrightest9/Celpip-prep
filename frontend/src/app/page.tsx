'use client';
import Link from 'next/link';
import { BookOpen, Headphones, Mic, PenLine, Zap, BarChart3, Brain, Trophy, ArrowRight, CheckCircle } from 'lucide-react';
import { isLoggedIn } from '@/lib/api';
import { useEffect, useState } from 'react';

const SKILLS = [
  { icon: Headphones, label: 'Listening', color: 'text-blue-600', bg: 'bg-blue-50', desc: 'Audio scenarios with MCQ' },
  { icon: BookOpen, label: 'Reading', color: 'text-green-600', bg: 'bg-green-50', desc: 'Passages + comprehension' },
  { icon: PenLine, label: 'Writing', color: 'text-purple-600', bg: 'bg-purple-50', desc: 'Email & survey response' },
  { icon: Mic, label: 'Speaking', color: 'text-orange-600', bg: 'bg-orange-50', desc: 'Timed voice tasks' },
];

const FEATURES = [
  { icon: Brain, title: 'AI Question Generation', desc: 'Authentic CELPIP-style questions generated fresh every session, adapted to your current level.' },
  { icon: Zap, title: 'Instant Detailed Feedback', desc: 'Get CLB scores, grammar corrections, improved versions, and Band 9 samples immediately after each answer.' },
  { icon: BarChart3, title: 'Progress Tracking', desc: 'Watch your CLB scores climb across all 4 skills with charts and trend analysis.' },
  { icon: Trophy, title: 'Adaptive Difficulty', desc: 'Questions automatically adjust to challenge you just beyond your current level.' },
];

export default function LandingPage() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(isLoggedIn());
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="container-wide mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">CELPIP Prep AI</span>
          </div>
          <div className="flex items-center gap-3">
            {loggedIn ? (
              <Link href="/dashboard" className="btn-primary">Go to Dashboard <ArrowRight className="w-4 h-4" /></Link>
            ) : (
              <>
                <Link href="/login" className="btn-secondary">Sign In</Link>
                <Link href="/register" className="btn-primary">Start Free</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 pb-16 px-4 text-center bg-gradient-to-b from-brand-50 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="badge-blue mb-4 mx-auto w-fit">AI-Powered CELPIP Preparation</div>
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 mb-6 text-balance">
            Achieve <span className="text-brand-600">CLB 9+</span> with{' '}
            <span className="text-brand-600">AI-Driven</span> Practice
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto text-balance">
            Practice all 4 CELPIP skills with real exam-style questions. Get instant AI feedback that feels like a real examiner — detailed, specific, and actionable.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/register" className="btn-primary btn-lg">
              Start Practicing Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/login" className="btn-secondary btn-lg">Sign In</Link>
          </div>
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-500">
            {['No credit card required', 'All 4 CELPIP skills', 'CLB-accurate scoring'].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-green-500" /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="py-16 px-4">
        <div className="container-wide mx-auto">
          <h2 className="text-center text-3xl font-bold mb-4">All 4 CELPIP Skills Covered</h2>
          <p className="text-center text-gray-500 mb-10">Practice every section with authentic, AI-generated content</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SKILLS.map(({ icon: Icon, label, color, bg, desc }) => (
              <div key={label} className="card p-6 text-center">
                <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mx-auto mb-4`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{label}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container-wide mx-auto">
          <h2 className="text-center text-3xl font-bold mb-4">Why CELPIP Prep AI Works</h2>
          <p className="text-center text-gray-500 mb-10">Powered by GPT-4 and designed around how CELPIP examiners actually score</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-6 flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <Icon className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                  <p className="text-sm text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feedback preview */}
      <section className="py-16 px-4">
        <div className="container-narrow mx-auto">
          <h2 className="text-center text-3xl font-bold mb-4">Feedback Like a Real Examiner</h2>
          <p className="text-center text-gray-500 mb-10">Every submission gets a full breakdown — not just a score</p>
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between pb-4 border-b">
              <div>
                <div className="text-xs text-gray-500 mb-1">WRITING TASK 1 — Email</div>
                <div className="font-semibold">CLB Score: <span className="text-brand-600">8</span> / 12</div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                {['Task', 'Coherence', 'Vocabulary', 'Grammar'].map((c, i) => (
                  <div key={c} className="bg-brand-50 rounded-lg p-2">
                    <div className="text-lg font-bold text-brand-700">{[78, 82, 74, 80][i]}%</div>
                    <div className="text-xs text-gray-500">{c}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-red-600 mb-1">CORRECTION EXAMPLE</div>
              <div className="bg-red-50 rounded-lg p-3 text-sm">
                <span className="line-through text-red-500">"I am writing this mail to inform you..."</span>
                <span className="ml-2 text-green-700 font-medium">→ "I am writing to inform you..."</span>
                <p className="text-gray-500 text-xs mt-1">💡 "this mail" is redundant — use "writing to" directly in formal emails.</p>
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-brand-600 mb-1">BAND 9 VOCABULARY SUGGESTION</div>
              <div className="bg-brand-50 rounded-lg p-3 text-sm text-gray-700">
                Instead of "very happy" → try <strong>"delighted"</strong> or <strong>"thrilled"</strong><br />
                Instead of "bad problem" → try <strong>"significant concern"</strong> or <strong>"pressing issue"</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-brand-600 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Ace Your CELPIP?</h2>
        <p className="text-brand-200 mb-8 text-lg">Join thousands preparing smarter with AI coaching</p>
        <Link href="/register" className="inline-flex items-center gap-2 bg-white text-brand-700 font-semibold px-8 py-3 rounded-xl hover:bg-brand-50 transition-colors text-lg">
          Create Free Account <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-100 text-center text-sm text-gray-400">
        <p>CELPIP Prep AI — AI-powered preparation platform. Not affiliated with Paragon Testing Enterprises.</p>
      </footer>
    </div>
  );
}
