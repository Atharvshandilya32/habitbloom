'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../../../lib/firebase';

const styles: Record<string, string> = {
  page: 'min-h-screen bg-slate-50 flex items-center justify-center p-6',
  card: 'w-full max-w-md rounded-2xl bg-white border border-border shadow-sm p-6',
  title: 'text-2xl font-bold text-slate-900',
  field: 'mt-4',
  label: 'block text-sm font-medium text-slate-700',
  input:
    'mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-indigo-200',
  btn: 'mt-4 w-full rounded-xl bg-indigo-600 text-white py-2.5 font-semibold hover:bg-indigo-700 disabled:opacity-50',
  btnSecondary:
    'mt-4 w-full rounded-xl border border-slate-200 bg-white text-slate-900 py-2.5 font-semibold hover:bg-slate-50 disabled:opacity-50',
  error: 'mt-4 rounded-xl bg-rose-50 border border-rose-200 px-3 py-2 text-rose-700 text-sm',
  linkBtn: 'mt-3 text-center text-sm text-indigo-700 hover:underline cursor-pointer',
  small: 'text-xs text-slate-500 mt-3',
};

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const provider = useMemo(() => {
    return new GoogleAuthProvider();
  }, []);

  useEffect(() => {
    if (!auth) return;

    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) router.replace('/');
    });

    return () => unsub();
  }, [router]);

  const handleEmail = async () => {
    setError('');
    setLoading(true);
    try {
      if (!auth) throw new Error('Firebase auth is not configured yet.');
      if (!email || !password) throw new Error('Email and password are required.');

      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      router.replace('/');
    } catch (e) {
      const err = e as Error;
      setError(err?.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      if (!auth) throw new Error('Firebase auth is not configured yet.');
      await signInWithPopup(auth, provider);
      router.replace('/');
    } catch (e) {
      const err = e as Error;
      setError(err?.message || 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setError('');
    try {
      if (!auth) return;
      await signOut(auth);
    } catch (e) {
      const err = e as Error;
      setError(err?.message || 'Logout failed.');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.title}>Login</div>

        <div className={styles.linkBtn} onClick={() => setMode((m) => (m === 'login' ? 'signup' : 'login'))}>
          Switch to {mode === 'login' ? 'Create account' : 'Login'}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Email</label>
          <input
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            type="email"
            autoComplete="email"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Password</label>
          <input
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
        </div>

        <button className={styles.btn} onClick={handleEmail} disabled={loading}>
          {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>

        <button className={styles.btnSecondary} onClick={handleGoogle} disabled={loading}>
          Continue with Google
        </button>

        {error ? <div className={styles.error}>{error}</div> : null}

        <div className={styles.small}>Tip: enable Email/Password + Google sign-in in Firebase Console.</div>

        <div className={styles.linkBtn} onClick={handleLogout}>
          Logout
        </div>
      </div>
    </div>
  );
}

