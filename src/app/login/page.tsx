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
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Bell,
  BarChart3,
  CheckCircle2,
  Clock,
  Menu,
} from 'lucide-react';
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

  // Asset preloader & frame states
  const [loadProgress, setLoadProgress] = useState(0);
  const [isAssetsReady, setIsAssetsReady] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);

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
      if (
        msg.includes('auth/invalid-credential') ||
        msg.includes('auth/user-not-found') ||
        msg.includes('auth/wrong-password')
      ) {
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

  const [showNotifications, setShowNotifications] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);

  // Close popovers on click outside or escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowNotifications(false);
        setShowNavMenu(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  // Synchronized overlay reveal factor based on 220-frame canvas progress:
  // Hidden during early seed/growth phase (frames 0-100), smoothly fades in during crystallization (frames 100-215)
  const uiOpacity = isAssetsReady
    ? currentFrame >= 215
      ? 1
      : Math.min(1, Math.max(0, (currentFrame - 100) / 115))
    : 0;

  return (
    <div className="relative min-h-screen w-full bg-slate-950 flex items-center justify-center font-sans antialiased select-none p-4 sm:p-6 lg:p-10 overflow-x-hidden overflow-y-auto">
      {/* Premium Asset Preloader */}
      <CinematicLoader
        progress={loadProgress}
        isReady={isAssetsReady}
      />

      {/* 60fps Dynamic Canvas Background (Holding at Frame 220) */}
      <div className="fixed inset-0 z-0">
        <CinematicCanvas
          onProgress={(pct) => setLoadProgress(pct)}
          onReady={() => setIsAssetsReady(true)}
          onFrame={(idx) => setCurrentFrame(idx)}
        />
      </div>

      {/* Main SaaS Interface Overlay matching Frame 220 Pristine Scene */}
      <main
        className="relative z-20 w-full max-w-7xl my-auto transition-opacity duration-700 ease-out"
        style={{ opacity: uiOpacity }}
      >
        <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-14 py-6">
          
          {/* LEFT SIDE: Brand Identity & Feature Pills */}
          <div className="w-full lg:w-[350px] xl:w-[380px] shrink-0 flex flex-col justify-center space-y-6 text-white z-30">
            {/* Logo & Headline */}
            <div>
              <Link href="/" className="inline-flex items-center gap-2 group mb-3">
                <span className="text-4xl sm:text-5xl font-black tracking-tight text-white drop-shadow-md">
                  Habit<span className="text-emerald-400">Bloom</span>
                </span>
              </Link>

              <p className="text-sm sm:text-base font-medium text-slate-200/90 leading-snug max-w-sm drop-shadow">
                Link the smart habits and elevate your goals.
              </p>
            </div>

            {/* Feature Cards matching image layout */}
            <div className="space-y-3.5 pt-1">
              <div className="flex items-center gap-3.5 bg-black/55 backdrop-blur-2xl p-3.5 px-4 rounded-2xl border border-white/15 hover:border-emerald-400/50 hover:bg-black/70 transition-all shadow-2xl">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-sm font-bold text-white tracking-wide">Streak Counters</span>
              </div>

              <div className="flex items-center gap-3.5 bg-black/55 backdrop-blur-2xl p-3.5 px-4 rounded-2xl border border-white/15 hover:border-teal-400/50 hover:bg-black/70 transition-all shadow-2xl">
                <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-teal-300" />
                </div>
                <span className="text-sm font-bold text-white tracking-wide">Smart Reminders</span>
              </div>

              <div className="flex items-center gap-3.5 bg-black/55 backdrop-blur-2xl p-3.5 px-4 rounded-2xl border border-white/15 hover:border-cyan-400/50 hover:bg-black/70 transition-all shadow-2xl">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center shrink-0">
                  <BarChart3 className="w-5 h-5 text-cyan-300" />
                </div>
                <span className="text-sm font-bold text-white tracking-wide">Visual Analytics</span>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Floating Glassmorphism Authentication Card */}
          <div className="w-full lg:max-w-[430px] shrink-0 z-30 relative">
            <div className="w-full rounded-[28px] border border-white/20 bg-slate-950/75 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl shadow-black/80 relative">
              
              {/* Top Bar: Brand Pill & Header Icons */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6 relative z-40">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-white font-bold text-xs hover:bg-emerald-500/25 transition-all"
                >
                  <span className="text-base">🌱</span>
                  <span>HabitBloom</span>
                </Link>

                <div className="flex items-center gap-2.5 text-slate-300 relative">
                  {/* Bell Icon with Notification Badge */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      setShowNavMenu(false);
                    }}
                    className={`relative p-2 rounded-xl transition-all ${
                      showNotifications
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                        : 'hover:bg-white/10 text-slate-300 hover:text-white'
                    }`}
                    title="Notifications"
                  >
                    <Bell className="w-4.5 h-4.5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse ring-2 ring-slate-950" />
                  </button>

                  {/* Hamburger Menu Icon */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowNavMenu(!showNavMenu);
                      setShowNotifications(false);
                    }}
                    className={`p-2 rounded-xl transition-all ${
                      showNavMenu
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                        : 'hover:bg-white/10 text-slate-300 hover:text-white'
                    }`}
                    title="Navigation Menu"
                  >
                    <Menu className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

              {/* Interactive Notifications Popover */}
              {showNotifications && (
                <div className="absolute top-16 right-6 left-6 z-50 rounded-2xl border border-white/20 bg-slate-900/95 backdrop-blur-2xl p-4 shadow-2xl shadow-emerald-950/80 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Notifications</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                      3 Active
                    </span>
                  </div>

                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 text-xs">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                      <div className="flex items-center gap-1.5 text-emerald-300 font-bold mb-1">
                        <span>🌱 Identity Nudge</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Consistency over intensity. Your daily habit routine is ready.
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                      <div className="flex items-center gap-1.5 text-teal-300 font-bold mb-1">
                        <span>⏱️ Smart Reminders</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Reminders scheduled for peak focus hours.
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                      <div className="flex items-center gap-1.5 text-cyan-300 font-bold mb-1">
                        <span>📊 Cloud Sync</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Offline storage ready & synced with Firebase.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowNotifications(false)}
                    className="w-full mt-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-[11px] font-bold text-slate-300 transition-all text-center"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Interactive Navigation Menu Popover */}
              {showNavMenu && (
                <div className="absolute top-16 right-6 left-6 z-50 rounded-2xl border border-white/20 bg-slate-900/95 backdrop-blur-2xl p-3 shadow-2xl shadow-emerald-950/80 animate-in fade-in zoom-in-95 duration-200">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5 border-b border-white/10 mb-2">
                    Quick Navigation
                  </div>

                  <div className="space-y-1">
                    <Link
                      href="/"
                      onClick={() => setShowNavMenu(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-emerald-500/20 hover:border-emerald-500/30 border border-transparent transition-all"
                    >
                      <span>🏠</span>
                      <span>Dashboard Home</span>
                    </Link>

                    <Link
                      href="/about"
                      onClick={() => setShowNavMenu(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-emerald-500/20 hover:border-emerald-500/30 border border-transparent transition-all"
                    >
                      <span>🌿</span>
                      <span>About Philosophy</span>
                    </Link>

                    <Link
                      href="/privacy"
                      onClick={() => setShowNavMenu(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-emerald-500/20 hover:border-emerald-500/30 border border-transparent transition-all"
                    >
                      <span>🔒</span>
                      <span>Privacy Policy</span>
                    </Link>

                    <Link
                      href="/terms"
                      onClick={() => setShowNavMenu(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-emerald-500/20 hover:border-emerald-500/30 border border-transparent transition-all"
                    >
                      <span>📜</span>
                      <span>Terms of Service</span>
                    </Link>
                  </div>
                </div>
              )}

              {/* Title & Description */}
              <div className="mb-6">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {mode === 'login' ? 'Welcome back!' : 'Create your account'}
                </h2>
                <p className="text-xs text-slate-300/80 mt-1">
                  {mode === 'login'
                    ? 'Sign in to access your habits, and goals.'
                    : 'Join HabitBloom to cultivate long-term personal growth.'}
                </p>
              </div>

              {/* Google Sign In Button */}
              <button
                type="button"
                onClick={handleGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 rounded-2xl bg-white hover:bg-slate-100 py-3 px-4 text-sm font-bold text-slate-900 shadow-xl transition-all active:scale-[0.99] disabled:opacity-50 border border-white/40"
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

              {/* Email / Password Form */}
              <form onSubmit={handleEmail} className="space-y-4 mt-5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1">
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
                      className="w-full rounded-xl border border-emerald-500/30 pl-10 pr-4 py-2.5 text-sm text-white bg-slate-950/80 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-all placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                    PASSWORD
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      required
                      className="w-full rounded-xl border border-emerald-500/30 pl-10 pr-10 py-2.5 text-sm text-white bg-slate-950/80 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-all placeholder:text-slate-500"
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
                  <div className="rounded-xl bg-rose-500/20 border border-rose-500/30 p-3 text-xs font-medium text-rose-200 flex items-start gap-2">
                    <span className="shrink-0 text-base">⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit Action Button matching image green button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#054e3b] hover:bg-[#043f30] text-white font-bold py-3.5 px-4 shadow-xl border border-emerald-500/40 active:scale-[0.99] transition-all disabled:opacity-50 text-sm mt-3"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>{mode === 'login' ? 'Sign In to Dashboard' : 'Create Free Account'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Sign up / Login Toggle Footer */}
              <div className="text-center mt-5 pt-3 border-t border-white/10 text-xs text-slate-400">
                <span>{mode === 'login' ? "Don't have an account?" : 'Already have an account?'}</span>{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === 'login' ? 'signup' : 'login');
                    setError('');
                  }}
                  className="font-bold text-emerald-400 hover:underline ml-1"
                >
                  {mode === 'login' ? 'Sign up here' : 'Sign in here'}
                </button>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

