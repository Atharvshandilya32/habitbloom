'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Habit, HabitLog } from '../../../lib/habitTypes';
import { calculateHabitDna } from '../../../lib/habitDnaUtils';
import { SpringConfigs, EasingCurves } from '../../../lib/motion/motionTokens';

interface HabitDnaViewProps {
  habits: Habit[];
  logs?: HabitLog;
  logsObj?: HabitLog;
  year?: number;
  month?: number;
}

export const HabitDnaView: React.FC<HabitDnaViewProps> = ({
  habits,
  logs,
  logsObj,
  year = new Date().getFullYear(),
  month = new Date().getMonth() + 1,
}) => {
  const activeLogs = logs || logsObj || {};
  const dna = calculateHabitDna(habits, activeLogs, year, month);
  const { persona, overallConsistency, categoryBalances, peakDays, strengths, growthAreas, diversityScore, dnaRecommendations, elapsedDaysUsed } = dna;

  return (
    <div className="space-y-4 sm:space-y-6 max-w-6xl mx-auto pb-12 px-1 sm:px-0">
      {/* Top Hero Banner - Behavioral Persona */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: EasingCurves.apple }}
        className="rounded-3xl p-5 sm:p-8 bg-gradient-to-br from-indigo-50/80 via-purple-50/60 to-white border border-indigo-100 shadow-sm relative overflow-hidden"
      >
        <div className="flex flex-col md:flex-row items-center md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 w-full md:max-w-2xl text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-200/80">
              <span>🧬 Behavioral Persona</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2 sm:gap-3 flex-wrap">
              <span>{persona.emoji}</span>
              <span>{persona.title}</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-700 font-medium leading-relaxed">
              {persona.description}
            </p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2">
              <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-xs">
                ⚡ Consistency: <span className="text-indigo-600 font-extrabold">{overallConsistency}%</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-xs">
                🎯 Diversity: <span className="text-emerald-600 font-extrabold">{diversityScore}%</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-indigo-50/50 border border-indigo-200 text-xs font-bold text-indigo-700">
                📅 Days Evaluated: {elapsedDaysUsed}d
              </div>
            </div>
          </div>

          {/* Persona Badge Ring - Centered cleanly on mobile */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            transition={SpringConfigs.tactile}
            className="w-28 h-28 sm:w-40 sm:h-40 rounded-3xl p-4 sm:p-6 flex flex-col items-center justify-center text-center bg-white border border-indigo-100 shadow-md shrink-0 self-center md:self-auto"
          >
            <span className="text-4xl sm:text-6xl mb-1 sm:mb-2 filter drop-shadow-xs select-none">{persona.emoji}</span>
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-indigo-700">
              {persona.title}
            </span>
          </motion.div>
        </div>
      </motion.div>

      {/* Grid Layout: Category Breakdown & Peak Velocity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Category Portfolio Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05, ease: EasingCurves.apple }}
          className="rounded-3xl p-5 sm:p-6 bg-white border border-slate-200/80 shadow-sm space-y-4 sm:space-y-6"
        >
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>📊 Category Portfolio</span>
            </h2>
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
              {categoryBalances.length} Active Categories
            </span>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {categoryBalances.length === 0 ? (
              <p className="text-xs sm:text-sm text-slate-500 font-medium">No habit category logs found.</p>
            ) : (
              categoryBalances.map((cat) => (
                <div key={cat.category} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold flex-wrap gap-1">
                    <span className="text-slate-800 flex items-center gap-1.5">
                      <span>{cat.emoji}</span>
                      <span>{cat.label}</span>
                    </span>
                    <span className="text-slate-600 text-[11px] sm:text-xs">
                      {cat.completionRate}% ({cat.habitCount} habit{cat.habitCount > 1 ? 's' : ''})
                    </span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.completionRate}%` }}
                      transition={{ duration: 0.5, ease: EasingCurves.apple }}
                      className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Peak Execution Days - Mobile-Optimized Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1, ease: EasingCurves.apple }}
          className="rounded-3xl p-5 sm:p-6 bg-white border border-slate-200/80 shadow-sm space-y-4 sm:space-y-6"
        >
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>📅 Day Velocity</span>
            </h2>
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
              % Completion by Day
            </span>
          </div>

          <div className="overflow-x-auto pb-1">
            <div className="grid grid-cols-7 gap-1 sm:gap-2 pt-2 min-w-[280px]">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dName) => {
                const day = peakDays.find((p) => p.dayName === dName) || { dayName: dName, count: 0, velocityPct: 0 };
                const maxVelocity = Math.max(1, ...peakDays.map((d) => d.velocityPct));
                const relativeHeight = Math.round((day.velocityPct / maxVelocity) * 100);

                return (
                  <div key={dName} className="flex flex-col items-center gap-1.5">
                    <div className="h-28 sm:h-36 w-full bg-slate-100 rounded-xl sm:rounded-2xl flex flex-col justify-end p-0.5 sm:p-1 overflow-hidden border border-slate-200/60 relative">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(16, relativeHeight)}%` }}
                        transition={{ duration: 0.5, ease: EasingCurves.apple }}
                        className="w-full bg-gradient-to-t from-indigo-600 to-indigo-500 rounded-lg sm:rounded-xl flex items-center justify-center text-[9px] sm:text-[10px] font-black text-white shadow-xs"
                      >
                        {day.velocityPct}%
                      </motion.div>
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold text-slate-700">
                      {day.dayName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Trait Insights: Strengths & Growth Areas */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15, ease: EasingCurves.apple }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
      >
        {/* Strengths Card */}
        <div className="rounded-3xl p-5 sm:p-6 bg-emerald-50/70 border border-emerald-200/80 shadow-sm space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm sm:text-base">
            <span>✨ Core Execution Strengths</span>
          </div>
          <ul className="space-y-2">
            {strengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-800 font-semibold leading-snug">
                <span className="text-emerald-600 font-black shrink-0">✓</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Growth Areas Card */}
        <div className="rounded-3xl p-5 sm:p-6 bg-amber-50/70 border border-amber-200/80 shadow-sm space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm sm:text-base">
            <span>🚀 High-Yield Growth Opportunities</span>
          </div>
          <ul className="space-y-2">
            {growthAreas.map((area, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-800 font-semibold leading-snug">
                <span className="text-amber-600 font-black shrink-0">→</span>
                <span>{area}</span>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>

      {/* DNA-Tailored Recommendations */}
      {dnaRecommendations && dnaRecommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2, ease: EasingCurves.apple }}
          className="rounded-3xl p-5 sm:p-6 bg-white border border-slate-200/80 shadow-sm space-y-4"
        >
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>💡 DNA-Tailored Recommendations</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {dnaRecommendations.map((rec, idx) => (
              <div key={idx} className="p-3.5 sm:p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-1.5 sm:space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xl sm:text-2xl">{rec.emoji}</span>
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700">
                    {rec.categoryTag}
                  </span>
                </div>
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">{rec.title}</h3>
                <p className="text-[11px] sm:text-xs font-semibold text-slate-600 leading-relaxed">{rec.subtitle}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default HabitDnaView;

