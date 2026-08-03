'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../lib/firebase';

export default function RequireAuth({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Safety fallback: Never block authentication check for more than 1.5 seconds
    const safetyTimer = setTimeout(() => {
      setChecking(false);
    }, 1500);

    if (!auth) {
      setChecking(false);
      clearTimeout(safetyTimer);
      return;
    }

    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace('/login');
      }
      setChecking(false);
      clearTimeout(safetyTimer);
    });

    return () => {
      unsub();
      clearTimeout(safetyTimer);
    };
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-600 gap-3">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium">Loading HabitBloom...</p>
      </div>
    );
  }

  return <>{children}</>;
}
