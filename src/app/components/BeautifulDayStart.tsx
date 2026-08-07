'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SpringConfigs, EasingCurves } from '../../../lib/motion/motionTokens';

interface BeautifulDayStartProps {
  userName: string;
  storySentence: string;
  bloomScore: number;
  level: number;
  xpRemaining: number;
  longestStreak: number;
  onEnter: () => void;
}

export const BeautifulDayStart: React.FC<BeautifulDayStartProps> = ({
  userName,
  storySentence,
  bloomScore,
  level,
  xpRemaining,
  longestStreak,
  onEnter
}) => {
  const [greeting, setGreeting] = useState('Good Morning');
  
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        key="beautiful-day-start"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.8, ease: EasingCurves.apple } }}
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-50/90 backdrop-blur-md"
      >
        <div className="max-w-2xl w-full px-6 flex flex-col items-center text-center space-y-12">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: EasingCurves.apple }}
            className="space-y-4"
          >
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              {greeting}{userName ? `, ${userName}` : ''}.
            </h1>
            <p className="text-xl md:text-2xl font-medium text-slate-600 max-w-lg mx-auto leading-relaxed">
              {storySentence}
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9, ...SpringConfigs.gentle }}
            className="flex items-center gap-8 py-6 px-10 rounded-3xl bg-white border border-slate-200/60 shadow-sm"
          >
            <div className="flex flex-col items-center">
              <span className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Level {level}</span>
              <span className="text-2xl font-black text-emerald-600">{xpRemaining} XP to go</span>
            </div>
            <div className="h-12 w-px bg-slate-200" />
            <div className="flex flex-col items-center">
              <span className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Bloom Score</span>
              <span className="text-2xl font-black text-blue-600">{bloomScore}</span>
            </div>
             <div className="h-12 w-px bg-slate-200" />
            <div className="flex flex-col items-center">
              <span className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Top Streak</span>
              <span className="text-2xl font-black text-amber-600">{longestStreak} d</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
          >
            <button
              onClick={onEnter}
              className="group relative px-8 py-4 rounded-full bg-slate-900 text-white font-bold tracking-wide hover:bg-slate-800 transition-colors focus:outline-none focus:ring-4 focus:ring-slate-900/20"
            >
              Enter My Garden
              <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">
                →
              </span>
            </button>
          </motion.div>
          
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BeautifulDayStart;
