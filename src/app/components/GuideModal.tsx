'use client';

import React, { useEffect, useState } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

const GUIDE_KEY = 'habitbloom_guide_seen';
const REMINDER_KEY = 'habitbloom_guide_reminder_dismissed';

const slides = [
  {
    emoji: '🌱',
    title: 'Welcome to HabitBloom!',
    desc: "You're about to build life-changing habits. HabitBloom makes tracking simple, visual, and motivating. Let's take a 60-second tour!",
    color: 'from-emerald-400 to-teal-500',
  },
  {
    emoji: '➕',
    title: 'Add Your Habits',
    desc: 'Click "Add Habit" in the Daily Habit Grid to create a new habit. Give it a name, an emoji, and a monthly goal (e.g. 20 days out of 31).',
    color: 'from-violet-400 to-purple-500',
  },
  {
    emoji: '✅',
    title: 'Tick Off Each Day',
    desc: 'Click any cell in the grid to mark that habit as done for that day. Ticks are saved instantly to the cloud — switch months freely, data is always preserved.',
    color: 'from-blue-400 to-indigo-500',
  },
  {
    emoji: '📊',
    title: 'Track Your Progress',
    desc: "The Overview Panel shows your streaks, monthly bar chart, donut chart, and 6-month growth journey. Your data builds up over time — the longer you track, the richer the insights.",
    color: 'from-orange-400 to-rose-500',
  },
  {
    emoji: '🚀',
    title: "You're All Set!",
    desc: "Consistency is everything. Come back every day, tick your habits, and watch your 6-month development chart grow. You've got this! 💪",
    color: 'from-pink-400 to-fuchsia-500',
  },
];

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GuideModal({ isOpen, onClose }: GuideModalProps) {
  const [step, setStep] = useState(0);

  // Reset to step 0 whenever modal opens
  useEffect(() => {
    if (isOpen) setStep(0);
  }, [isOpen]);

  const handleClose = (skipped: boolean) => {
    localStorage.setItem(GUIDE_KEY, 'true');
    if (skipped) {
      // Don't dismiss reminder — user only skipped
      localStorage.removeItem(REMINDER_KEY);
    } else {
      // Completed — dismiss reminder too
      localStorage.setItem(REMINDER_KEY, 'true');
    }
    onClose();
  };

  if (!isOpen) return null;

  const slide = slides[step];
  const isLast = step === slides.length - 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(true); }}
    >
      <div
        className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden"
        style={{ animation: 'slideUp 0.25s ease' }}
      >
        {/* Gradient header */}
        <div className={`bg-gradient-to-br ${slide.color} p-8 flex flex-col items-center gap-3`}>
          <span className="text-6xl" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }}>
            {slide.emoji}
          </span>
          <h2 className="text-xl font-bold text-white text-center leading-tight">{slide.title}</h2>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-sm text-slate-600 text-center leading-relaxed">{slide.desc}</p>

          {/* Step dots */}
          <div className="flex items-center justify-center gap-2 mt-5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`rounded-full transition-all duration-200 ${
                  i === step
                    ? 'w-6 h-2.5 bg-emerald-500'
                    : 'w-2.5 h-2.5 bg-slate-200 hover:bg-slate-300'
                }`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 mt-5">
            {step > 0 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 transition-colors"
              >
                <ChevronLeft size={16} /> Back
              </button>
            )}

            <div className="flex-1" />

            {!isLast ? (
              <>
                <button
                  onClick={() => handleClose(true)}
                  className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={() => setStep(s => s + 1)}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-colors"
                >
                  Next <ChevronRight size={16} />
                </button>
              </>
            ) : (
              <button
                onClick={() => handleClose(false)}
                className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold hover:opacity-90 transition-opacity shadow-md"
              >
                <Sparkles size={15} /> Let&apos;s Go!
              </button>
            )}
          </div>
        </div>

        {/* Close X */}
        <button
          onClick={() => handleClose(true)}
          className="absolute top-3 right-3 p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

/** Gentle reminder banner shown if user skipped the guide */
export function GuideReminder({ onOpenGuide }: { onOpenGuide: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(GUIDE_KEY);
    const dismissed = localStorage.getItem(REMINDER_KEY);
    setVisible(!!seen && !dismissed);
  }, []);

  const dismiss = () => {
    localStorage.setItem(REMINDER_KEY, 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-sm">
      <span className="text-base">👋</span>
      <span className="text-emerald-800 flex-1">
        New to HabitBloom?{' '}
        <button
          onClick={onOpenGuide}
          className="font-semibold underline underline-offset-2 hover:text-emerald-600 transition-colors"
        >
          Open the guide
        </button>{' '}
        to get started.
      </span>
      <button
        onClick={dismiss}
        className="text-emerald-500 hover:text-emerald-700 transition-colors"
        aria-label="Dismiss reminder"
      >
        <X size={14} />
      </button>
    </div>
  );
}

/** Returns true if the guide has never been seen */
export function shouldShowGuide(): boolean {
  if (typeof window === 'undefined') return false;
  return !localStorage.getItem(GUIDE_KEY);
}
