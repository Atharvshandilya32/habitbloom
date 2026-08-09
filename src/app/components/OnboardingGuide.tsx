'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EasingCurves } from '../../../lib/motion/motionTokens';

interface OnboardingStep {
  title: string;
  description: string;
  emoji: string;
}

const STEPS: OnboardingStep[] = [
  {
    title: 'Welcome to HabitBloom ✨',
    description: 'Your enterprise personal growth ecosystem designed with Apple HIG precision and real-time habit intelligence.',
    emoji: '🌸',
  },
  {
    title: 'Discover Your Habit DNA 🧬',
    description: 'Explore your dynamic behavioral persona, category balance, and peak execution day velocity.',
    emoji: '⚡',
  },
  {
    title: 'Nurture Your Habit Garden 🌻',
    description: 'Watch your habits blossom into flowers as you maintain check-in momentum and earn XP.',
    emoji: '🏡',
  },
  {
    title: 'Track Your Bloom Score 👑',
    description: 'Your unified 0-1000 personal growth score combining consistency, streaks, and category diversity.',
    emoji: '🌺',
  },
];

export const OnboardingGuide: React.FC = () => {
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [showTour, setShowTour] = useState<boolean>(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('habitbloom_onboarding_seen');
    if (!hasSeenOnboarding) {
      setIsVisible(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStepIdx < STEPS.length - 1) {
      setCurrentStepIdx((prev) => prev + 1);
    } else {
      handleDismiss();
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('habitbloom_onboarding_seen', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const step = STEPS[currentStepIdx];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.94, y: 12 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.94, y: 12 }}
          transition={{ duration: 0.3, ease: EasingCurves.apple }}
          className="relative w-full max-w-md rounded-3xl p-6 bg-white/90 dark:bg-slate-900/90 border border-white/20 dark:border-white/10 shadow-2xl backdrop-blur-2xl space-y-6 text-center"
        >
          {!showTour ? (
            <div className="space-y-6 text-center">
              <div className="text-7xl mb-4">🌱</div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">Welcome to HabitBloom</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed px-4">
                Your living personal growth ecosystem. Start by creating your first habit, complete it today, and watch your garden grow.
              </p>
              <div className="flex flex-col gap-3 pt-4">
                <button
                  onClick={handleDismiss}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm transition-all shadow-lg shadow-emerald-500/30"
                >
                  Create My First Habit
                </button>
                <button
                  onClick={() => setShowTour(true)}
                  className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all"
                >
                  Take a Quick Tour
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Progress Indicator */}
              <div className="flex items-center justify-center gap-1.5">
                {STEPS.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentStepIdx
                        ? 'w-6 bg-indigo-500'
                        : 'w-1.5 bg-slate-300 dark:bg-slate-700'
                    }`}
                  />
                ))}
              </div>

              {/* Emoji Badge */}
              <div className="text-6xl filter drop-shadow-md py-2 inline-block">
                {step.emoji}
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                  {step.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleDismiss}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  End Tour
                </button>
                <button
                  onClick={handleNext}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-md shadow-indigo-500/25"
                >
                  {currentStepIdx === STEPS.length - 1 ? 'Get Started 🚀' : 'Continue →'}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OnboardingGuide;

