'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import { ensureUserProfile } from '../../../lib/userProfile';
import { X, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

export default function AuthModal({
  isOpen,
  onClose,
  title = "Build habits. See yourself grow.",
  subtitle = "Create a free account to keep your progress safe and sync across devices."
}: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const provider = useMemo(() => new GoogleAuthProvider(), []);

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
      // On success, we close the modal and let the page handle migration
      onClose();
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
      // On success, close modal
      onClose();
    } catch (e) {
      const err = e as Error;
      setError(err?.message || 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md rounded-[28px] border border-white/20 bg-slate-900/95 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl shadow-emerald-900/20 overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>

          <div className="mb-6 mt-2 text-center">
            <h2 className="text-2xl font-extrabold text-white tracking-tight mb-2">
              {title}
            </h2>
            <p className="text-xs text-slate-300/80 leading-relaxed max-w-[280px] mx-auto">
              {subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 rounded-2xl bg-white hover:bg-slate-100 py-3 px-4 text-sm font-bold text-slate-900 shadow-xl transition-all active:scale-[0.99] disabled:opacity-50 border border-white/40"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continue with Google</span>
          </button>

          <form onSubmit={handleEmail} className="space-y-4 mt-5">
            <div>
              <label htmlFor="auth-email" className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                EMAIL
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-email"
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
              <label htmlFor="auth-password" className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                PASSWORD
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-password"
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
                  aria-label="Toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-rose-500/20 border border-rose-500/30 p-3 text-xs font-medium text-rose-200 flex items-start gap-2">
                <span className="shrink-0 text-base">⚠️</span>
                <span>{error}</span>
              </div>
            )}

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
          
          <div className="mt-4 text-center">
            <button 
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-white font-medium hover:underline transition-colors"
            >
              Maybe later
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
