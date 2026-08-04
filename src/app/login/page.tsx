'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import { ensureUserProfile } from '../../../lib/userProfile';
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, ShieldCheck, Bell, BarChart3, CheckCircle2 } from 'lucide-react';
import CinematicCanvas from './CinematicCanvas';
import CinematicLoader from './CinematicLoader';

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Asset preloader states
  const [loadProgress, setLoadProgress] = useState(0);
  const [isAssetsReady, setIsAssetsReady] = useState(false);

  const provider = useMemo(() => new GoogleAuthProvider(), []);

  useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) router.replace('/');
    });
    return () => unsub();
  }, [router]);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!auth) throw new Error('Firebase auth is not configured.');
      if (!email || !password) throw new Error('Please enter both email and password.');

      let userCred;
      if (mode === 'login') {
        userCred = await signInWithEmailAndPassword(auth, email, password);
      } else {
        userCred = await createUserWithEmailAndPassword(auth, email, password);
      }
      if (userCred.user) {
        await ensureUserProfile(userCred.user);
      }
      router.replace('/');
    } catch (e) {
      const err = e as Error;
      let msg = err.message || 'Authentication failed.';
      if (msg.includes('auth/invalid-credential') || msg.includes('auth/user-not-found') || msg.includes('auth/wrong-password')) {
        msg = 'Invalid email or password.';
      } else if (msg.includes('auth/email-already-in-use')) {
        msg = 'An account with this email already exists. Please sign in instead.';
      } else if (msg.includes('auth/weak-password')) {
        msg = 'Password should be at least 6 characters.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      if (!auth) throw new Error('Firebase auth is not configured.');
      const res = await signInWithPopup(auth, provider);
      if (res.user) {
        await ensureUserProfile(res.user);
      }
      router.replace('/');
    } catch (e) {
      const err = e as Error;
      setError(err?.message || 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-y-auto lg:overflow-hidden bg-slate-950 flex items-center justify-center font-sans antialiased select-none p-3 sm:p-6 lg:p-8 py-8 lg:py-0">
      {/* Premium Cinematic Asset Preloader */}
      <CinematicLoader
        progress={loadProgress}
        isReady={isAssetsReady}
      />

      {/* Dynamic 60fps Frame Canvas Background (Fixed behind scroll view) */}
      <div className="fixed inset-0 z-0">
        <CinematicCanvas
          onProgress={(pct) => setLoadProgress(pct)}
          onReady={() => setIsAssetsReady(true)}
        />
      </div>

      {/* Main Glassmorphic Form Overlay */}
      <main className="relative z-20 w-full max-w-5xl my-auto">
        <div className="w-full rounded-3xl border border-white/20 bg-slate-950/40 backdrop-blur-2xl shadow-2xl shadow-emerald-950/50 overflow-hidden grid lg:grid-cols-12 min-h-0 lg:min-h-[620px] transition-all duration-700">
          
          {/* Left Side: Brand Hero & Feature Pills */}
          <div className="lg:col-span-5 bg-gradient-to-br from-emerald-900/40 via-slate-900/60 to-emerald-950/80 p-6 sm:p-8 lg:p-10 text-white flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10 relative overflow-hidden">
            {/* Ambient inner glow */}
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

            {/* Logo & Header */}
            <div className="relative z-10">
              <Link href="/" className="inline-flex items-center gap-3 group">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 backdrop-blur-md flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  <span className="text-2xl">🌱</span>
                </div>
                <div>
                  <span className="text-2xl font-black tracking-tight text-white block leading-none">
                    Habit<span className="text-emerald-400">Bloom</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-300/80">AAA V2.0 Experience</span>
                </div>
              </Link>
            </div>

            {/* Tagline & Feature Showcase */}
            <div className="my-8 relative z-10 space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-emerald-200 border border-white/15 mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  Elevate Daily Consistency
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                  Link the smart habits and elevate your goals.
                </h1>
                <p className="mt-2 text-xs text-slate-300/90 leading-relaxed">
                  Track habits, set smart reminders, build streaks, and monitor your personal growth with real-time cloud sync.
                </p>
              </div>

              {/* Feature Pills */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 hover:border-emerald-400/30 hover:bg-white/10 transition-all">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Streak Counters</h4>
                    <p className="text-[11px] text-slate-300/80">Stay motivated with automatic daily streak tracking</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 hover:border-teal-400/30 hover:bg-white/10 transition-all">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center shrink-0">
                    <Bell className="w-4 h-4 text-teal-300" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Smart Reminders</h4>
                    <p className="text-[11px] text-slate-300/80">Customized alerts scheduled for your routine</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 hover:border-cyan-400/30 hover:bg-white/10 transition-all">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0">
                    <BarChart3 className="w-4 h-4 text-cyan-300" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Visual Analytics</h4>
                    <p className="text-[11px] text-slate-300/80">Detailed graphical breakdown of long-term progress</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Badge */}
            <div className="relative z-10 flex items-center gap-2 text-xs text-slate-400 pt-4 border-t border-white/10">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Offline-Ready Production Assets</span>
            </div>
          </div>

          {/* Right Side: Authentication Form */}
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-slate-900/40 backdrop-blur-xl">
            <div className="max-w-md mx-auto w-full">

              {/* Mode Switcher Tabs */}
              <div className="flex rounded-2xl bg-white/5 p-1 border border-white/10 mb-8">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); }}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                    mode === 'login'
                      ? 'bg-emerald-500/20 text-white border border-emerald-400/30 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError(''); }}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                    mode === 'signup'
                      ? 'bg-emerald-500/20 text-white border border-emerald-400/30 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Form Title */}
              <div className="mb-6">
                <h2 className="text-2xl font-black text-white tracking-tight">
                  {mode === 'login' ? 'Welcome back! 👋' : 'Start your journey 🌱'}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {mode === 'login'
                    ? 'Sign in to access your habits and progress.'
                    : 'Create a free account to sync your habits across devices.'}
                </p>
              </div>

              {/* Google Quick Auth */}
              <button
                type="button"
                onClick={handleGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/10 py-3 px-4 text-sm font-semibold text-white hover:bg-white/15 hover:border-white/25 transition-all active:scale-[0.99] shadow-lg disabled:opacity-50"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Divider */}
              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <span className="relative bg-slate-900/80 px-3 text-[11px] font-semibold uppercase text-slate-400 rounded-full border border-white/5">
                  Or with email
                </span>
              </div>

              {/* Email / Password Form */}
              <form onSubmit={handleEmail} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    EMAIL
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      autoComplete="email"
                      required
                      className="w-full rounded-xl border border-white/15 pl-10 pr-4 py-2.5 text-base sm:text-sm text-white bg-slate-950/60 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-all placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    PASSWORD
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      required
                      className="w-full rounded-xl border border-white/15 pl-10 pr-10 py-2.5 text-base sm:text-sm text-white bg-slate-950/60 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-all placeholder:text-slate-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Error Alert */}
                {error && (
                  <div className="rounded-xl bg-rose-500/15 border border-rose-500/30 p-3 text-xs font-medium text-rose-300 flex items-start gap-2">
                    <span className="shrink-0 text-base">⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 px-4 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.99] transition-all disabled:opacity-50 mt-2 border border-emerald-400/30"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>{mode === 'login' ? 'Sign in to Dashboard' : 'Create Free Account'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Form Mode Toggle Footer */}
              <p className="text-center text-xs text-slate-400 mt-6">
                {mode === 'login' ? "Don't have an account yet?" : 'Already have an account?'}{' '}
                <button
                  type="button"
                  onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
                  className="font-bold text-emerald-400 hover:underline"
                >
                  {mode === 'login' ? 'Create account for HabitBloom' : 'Sign in here'}
                </button>
              </p>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
