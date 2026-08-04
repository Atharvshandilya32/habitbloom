'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';

interface CinematicLoaderProps {
  progress: number;
  isReady: boolean;
  onFadeComplete?: () => void;
}

export default function CinematicLoader({ progress, isReady, onFadeComplete }: CinematicLoaderProps) {
  const [shouldRender, setShouldRender] = useState(true);
  const [fadeState, setFadeState] = useState<'visible' | 'fading' | 'hidden'>('visible');

  useEffect(() => {
    if (isReady && fadeState === 'visible') {
      setFadeState('fading');
      const timer = setTimeout(() => {
        setFadeState('hidden');
        setShouldRender(false);
        if (onFadeComplete) onFadeComplete();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isReady, fadeState, onFadeComplete]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white transition-opacity duration-800 ease-out ${
        fadeState === 'fading' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />

      {/* Main Content Card */}
      <div className="relative z-10 flex flex-col items-center max-w-sm px-6 text-center">
        {/* Brand Icon */}
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-600 p-0.5 shadow-2xl shadow-emerald-500/30 mb-6 animate-bounce">
          <div className="w-full h-full bg-slate-900 rounded-[22px] flex items-center justify-center backdrop-blur-md">
            <span className="text-3xl">🌱</span>
          </div>
        </div>

        {/* Title */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          HabitBloom V2.0 AAA Experience
        </div>

        <h1 className="text-2xl font-black tracking-tight text-white mb-2">
          Initializing Cinematic World
        </h1>
        <p className="text-xs text-slate-400 mb-8 leading-relaxed">
          Loading self-hosted photorealistic 3D frame assets into high-performance canvas engine...
        </p>

        {/* Progress Bar Container */}
        <div className="w-full bg-slate-800/80 rounded-full h-2.5 p-0.5 border border-slate-700/50 shadow-inner overflow-hidden mb-3">
          <div
            className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 h-full rounded-full transition-all duration-150 ease-out shadow-lg shadow-emerald-500/50"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>

        {/* Percentage & Status readout */}
        <div className="w-full flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>{progress < 100 ? 'PREBUFFERING' : 'ASSETS READY'}</span>
          <span className="text-emerald-400 font-bold">{Math.round(progress)}%</span>
        </div>

        {/* Local Security Badge */}
        <div className="mt-8 flex items-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Local Production Asset Pipeline (Offline-Ready)</span>
        </div>
      </div>
    </div>
  );
}
