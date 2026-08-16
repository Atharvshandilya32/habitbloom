'use client';

import { useEffect } from 'react';

export default function FirebaseErrorGuard() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Intercept console.error to prevent Next.js 15 dev overlay from popping up on Firebase permission rejections
    const originalConsoleError = console.error;
    console.error = (...args: unknown[]) => {
      const fullText = args
        .map((a) =>
          typeof a === 'object' && a !== null
            ? (a as { message?: string; stack?: string }).message ||
              (a as { stack?: string }).stack ||
              JSON.stringify(a)
            : String(a)
        )
        .join(' ');

      if (
        fullText.includes('PERMISSION_DENIED') ||
        fullText.includes('permission_denied') ||
        fullText.includes("Client doesn't have permission")
      ) {
        console.warn('Firebase permission notice (local fallback active):', ...args);
        return;
      }
      originalConsoleError.apply(console, args);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const msg = event?.reason?.message || String(event?.reason || '');
      if (
        msg.includes('PERMISSION_DENIED') ||
        msg.includes('permission_denied') ||
        msg.includes("Client doesn't have permission")
      ) {
        event.preventDefault();
        console.warn('Firebase permission notice (local fallback active):', msg);
      }
    };

    const handleError = (event: ErrorEvent) => {
      const msg = event?.message || String(event?.error || '');
      if (
        msg.includes('PERMISSION_DENIED') ||
        msg.includes('permission_denied') ||
        msg.includes("Client doesn't have permission")
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
        console.warn('Firebase permission notice (local fallback active):', msg);
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      console.error = originalConsoleError;
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return null;
}
