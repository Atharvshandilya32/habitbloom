'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Habit, HabitLog, JournalEntry } from '../../../lib/habitTypes';
import { generateUserIdentity } from '../../../lib/identityEngine';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { SpringConfigs } from '../../../lib/motion/motionTokens';
import { fireConfetti } from '../../../lib/confetti';
import { getHabitStats } from '../../../lib/habitUtils';
import { IntelligenceEngine } from '../../../lib/intelligence/intelligenceEngine';

interface WrappedViewProps {
  isOpen: boolean;
  onClose: () => void;
  habits: Habit[];
  logs: HabitLog;
  journals: JournalEntry[];
  year: number;
  month: number;
}

export default function WrappedView({ isOpen, onClose, habits, logs, journals, year, month }: WrappedViewProps) {
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    if (isOpen) setSlideIndex(0);
  }, [isOpen]);

  const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });
  const daysInMonth = new Date(year, month, 0).getDate();

  // Compute stats for slides
  const currentMonthCheckins = Object.keys(logs).filter(k => k.includes(`_${year}_${month}_`) && logs[k]).length;
  
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const prevMonthCheckins = Object.keys(logs).filter(k => k.includes(`_${prevYear}_${prevMonth}_`) && logs[k]).length;

  const diffCheckins = currentMonthCheckins - prevMonthCheckins;

  const monthJournals = journals.filter(j => {
    const d = new Date(j.date);
    return d.getFullYear() === year && d.getMonth() === month - 1;
  });

  let bestHabit: Habit | null = null;
  let bestPct = -1;
  habits.forEach(h => {
    const s = getHabitStats(h, logs, daysInMonth, year, month);
    if (s.pct > bestPct) {
      bestPct = s.pct;
      bestHabit = h;
    }
  });

  const identity = generateUserIdentity(habits, logs);

  const { topInsight, topRec } = React.useMemo(() => {
    const endOfMonth = new Date(year, month - 1, daysInMonth);
    const insights = IntelligenceEngine.generateInsights(habits, logs, endOfMonth);
    const recs = IntelligenceEngine.generateRecommendations(habits, logs, endOfMonth);
    return {
      topInsight: insights.length > 0 ? insights[0] : null,
      topRec: recs.length > 0 ? recs[0] : null
    };
  }, [habits, logs, year, month, daysInMonth]);

  const slides = [
    {
      id: 'welcome',
      bg: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white',
      content: (
        <div className="flex flex-col items-center text-center space-y-6">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={SpringConfigs.milestone} className="text-7xl mb-4">📈</motion.div>
          <motion.h4 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-indigo-300 font-bold tracking-widest uppercase">Monthly Growth Review</motion.h4>
          <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl sm:text-6xl font-black">{monthName}</motion.h2>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-xl text-indigo-100/80 max-w-sm">Let&apos;s see how your personal growth compounded this month compared to the last.</motion.p>
        </div>
      )
    },
    {
      id: 'stats',
      bg: 'bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 text-white',
      content: (
        <div className="flex flex-col items-center text-center space-y-8 w-full max-w-md">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
            <h4 className="text-emerald-200 font-bold tracking-widest uppercase text-sm">Dedication</h4>
            <div className="text-7xl font-black tracking-tighter">{currentMonthCheckins}</div>
            <p className="text-lg text-emerald-100 mb-2">Total Check-ins this month</p>
            {prevMonthCheckins > 0 && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/40 text-emerald-100 text-sm font-bold border border-emerald-500/30">
                {diffCheckins > 0 ? (
                  <><span>📈</span> {diffCheckins} more than last month!</>
                ) : diffCheckins < 0 ? (
                  <><span>📉</span> {Math.abs(diffCheckins)} fewer than last month.</>
                ) : (
                  <><span>🤝</span> Exactly the same as last month!</>
                )}
              </div>
            )}
          </motion.div>
          
          {bestHabit && bestPct > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/10 backdrop-blur-md rounded-3xl p-6 w-full border border-white/20">
              <h4 className="text-emerald-200 font-bold text-sm mb-2 uppercase">Most Nurtured Seed</h4>
              <div className="text-5xl mb-3">{bestHabit.emoji}</div>
              <h3 className="text-2xl font-bold">{bestHabit.name}</h3>
              <p className="text-emerald-100 font-medium">{bestPct}% Completion</p>
            </motion.div>
          )}
        </div>
      )
    },
    {
      id: 'reflection',
      bg: 'bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-800 text-white',
      content: (
        <div className="flex flex-col items-center text-center space-y-6">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={SpringConfigs.milestone} className="text-7xl mb-4">📖</motion.div>
          <motion.h4 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-blue-200 font-bold tracking-widest uppercase">Moments of Reflection</motion.h4>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-6xl font-black">{monthJournals.length}</motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-xl text-blue-100 max-w-sm">
            {monthJournals.length > 0 ? "Thoughts and memories preserved for your future self." : "Next month, try writing down a few thoughts!"}
          </motion.p>
        </div>
      )
    },
    {
      id: 'intelligence',
      bg: 'bg-gradient-to-br from-indigo-800 to-slate-900 text-white',
      content: (
        <div className="flex flex-col items-center text-center space-y-6">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={SpringConfigs.milestone} className="text-7xl mb-4">🧠</motion.div>
          <motion.h4 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-indigo-300 font-bold tracking-widest uppercase">Growth Intelligence</motion.h4>
          
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/10 backdrop-blur-md rounded-3xl p-6 w-full max-w-sm border border-white/20">
            <h4 className="text-indigo-200 font-bold text-sm mb-1 uppercase">Biggest Discovery</h4>
            <p className="text-lg font-bold text-white mb-2">{topInsight ? topInsight.description : "You are steadily building history."}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/10 backdrop-blur-md rounded-3xl p-6 w-full max-w-sm border border-white/20">
            <h4 className="text-indigo-200 font-bold text-sm mb-1 uppercase">Next Focus</h4>
            <p className="text-lg font-bold text-white mb-2">{topRec ? topRec.title + ' - ' + topRec.description : "Keep focusing on consistency across your active habits."}</p>
          </motion.div>
        </div>
      )
    },
    {
      id: 'identity',
      bg: 'bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 text-white',
      onEnter: () => {
        setTimeout(() => {
          fireConfetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }, 300);
      },
      content: (
        <div className="flex flex-col items-center text-center space-y-6">
          <motion.h4 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-amber-100 font-bold tracking-widest uppercase">Your True Nature</motion.h4>
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={SpringConfigs.milestone} className="bg-white/10 backdrop-blur-xl border border-white/30 rounded-[2rem] p-8 shadow-2xl flex flex-col items-center w-full max-w-sm">
            <div className="text-7xl mb-4 filter drop-shadow-md">{identity.icon}</div>
            <h2 className="text-3xl font-black tracking-tight mb-2">{identity.title}</h2>
            <p className="text-amber-50 font-medium leading-relaxed">{identity.description}</p>
          </motion.div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (slideIndex < slides.length - 1) {
      setSlideIndex(prev => prev + 1);
      const nextSlide = slides[slideIndex + 1];
      if (nextSlide.onEnter) nextSlide.onEnter();
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (slideIndex > 0) {
      setSlideIndex(prev => prev - 1);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex flex-col"
        >
          {/* Active Background */}
          <div className={`absolute inset-0 transition-colors duration-1000 ${slides[slideIndex].bg}`} />

          {/* Close button */}
          <button onClick={onClose} className="absolute top-6 right-6 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-sm">
            <X size={24} />
          </button>

          {/* Progress Indicators */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-50">
            {slides.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === slideIndex ? 'w-8 bg-white' : 'w-2 bg-white/30'}`} />
            ))}
          </div>

          {/* Slide Content Container */}
          <div className="relative z-10 flex-1 flex items-center justify-center p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={slideIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={SpringConfigs.gentle}
                className="w-full flex justify-center"
              >
                {slides[slideIndex].content}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Controls */}
          <div className="relative z-10 p-8 flex justify-between items-center">
            <button 
              onClick={handlePrev} 
              className={`p-4 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all ${slideIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            >
              <ChevronLeft className="text-white" size={28} />
            </button>
            <button 
              onClick={handleNext}
              className="px-8 py-4 rounded-full bg-white text-slate-900 font-black tracking-wide shadow-xl shadow-white/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              {slideIndex === slides.length - 1 ? 'Finish' : 'Continue'}
              {slideIndex !== slides.length - 1 && <ChevronRight size={20} />}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
