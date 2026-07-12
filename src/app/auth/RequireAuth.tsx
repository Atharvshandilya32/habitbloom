'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../lib/firebase';

export default function RequireAuth({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!auth) {
      // If firebase isn’t configured yet, allow app to load but don’t block.
      setChecking(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) router.replace('/login');
      setChecking(false);
    });

    return () => unsub();
  }, [router]);

  if (checking) {
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  }

  return <>{children}</>;
}

