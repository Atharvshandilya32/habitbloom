'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../lib/firebase';

type AuthState = 'INITIALIZING' | 'AUTHENTICATED' | 'UNAUTHENTICATED' | 'AUTH_ERROR';

export default function RequireAuth({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>('INITIALIZING');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    // Safety fallback: If Firebase hangs for 10s, show an error. Do NOT bypass auth.
    const safetyTimer = setTimeout(() => {
      if (authState === 'INITIALIZING') {
        setAuthState('AUTH_ERROR');
        setErrorMsg('Authentication is taking too long. Please check your network connection.');
      }
    }, 10000);

    if (!auth) {
      setAuthState('AUTH_ERROR');
      setErrorMsg('Authentication service is unavailable.');
      clearTimeout(safetyTimer);
      return;
    }

    const unsub = onAuthStateChanged(
      auth,
      (user) => {
        clearTimeout(safetyTimer);
        if (!user) {
          setAuthState('UNAUTHENTICATED');
          router.replace('/login');
        } else {
          setAuthState('AUTHENTICATED');
        }
      },
      (error) => {
        clearTimeout(safetyTimer);
        console.error("Auth observer error:", error);
        setAuthState('AUTH_ERROR');
        setErrorMsg('Authentication encountered an unexpected error.');
      }
    );

    return () => {
      unsub();
      clearTimeout(safetyTimer);
    };
  }, [router, authState]);

  if (authState === 'INITIALIZING') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-600 gap-3">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium">Authenticating HabitBloom...</p>
      </div>
    );
  }

  if (authState === 'AUTH_ERROR') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-600 gap-4 p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 text-xl font-black">!</div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">Authentication Error</h2>
          <p className="text-sm text-slate-500 mt-1 max-w-sm">{errorMsg}</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-emerald-700 transition-all"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  // If unauthenticated, we render nothing (or a loader) while the router.replace('/login') takes effect
  if (authState === 'UNAUTHENTICATED') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-400 gap-3">
        <div className="w-8 h-8 border-4 border-slate-300 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium">Redirecting to Login...</p>
      </div>
    );
  }

  return <>{children}</>;
}
