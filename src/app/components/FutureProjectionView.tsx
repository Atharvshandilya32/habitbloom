'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Habit, HabitLog } from '../../../lib/habitTypes';
import { calculateFutureProjections, ProjectionTimeframe } from '../../../lib/projectionUtils';
import { SpringConfigs, EasingCurves } from '../../../lib/motion/motionTokens';

interface FutureProjectionViewProps {
  habits: Habit[];
  logs?: HabitLog;
  logsObj?: HabitLog;
  bloomScore?: number;
  year?: number;
  month?: number;
}

export const FutureProjectionView: React.FC<FutureProjectionViewProps> = ({
  habits,
  logs,
  logsObj,
  bloomScore = 500,
  year = new Date().getFullYear(),
  month = new Date().getMonth() + 1,
}) => {
  const activeLogs = logs || logsObj || {};
  const [timeframe, setTimeframe] = useState<ProjectionTimeframe>('90d');
  const [boostScenarioEnabled, setBoostScenarioEnabled] = useState<boolean>(false);

  const projection = calculateFutureProjections(habits, activeLogs, timeframe, bloomScore, year, month);

  const timeframes: { id: ProjectionTimeframe; label: string }[] = [
    { id: '30d', label: '30 Days' },
    { id: '90d', label: '90 Days' },
    { id: '1y', label: '1 Year' },
    { id: '3y', label: '3 Years' },
  ];

  const totalCompletionsCount = boostScenarioEnabled
    ? projection.consistencyBoostScenario.boostedCompletions
    : projection.overallProjectedCompletions;

  return (
    <div className="space-y-4 sm:space-y-6 max-w-6xl mx-auto pb-12 px-1 sm:px-0">
      {/* Top Banner & Time Horizon Selector */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: EasingCurves.apple }}
        className="rounded-3xl p-5 sm:p-8 bg-white border border-slate-200/80 shadow-sm space-y-4 sm:space-y-6"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
              <span>🔮 Forecast Model</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
              <span>🚀 Future Projections</span>
            </h1>
            <p className="text-xs sm:text-base text-slate-700 font-medium max-w-xl leading-relaxed">
              Project your long-term growth and milestone achievements calculated from your 30-day moving consistency momentum.
            </p>
          </div>

          {/* Mobile-Responsive Segmented Control */}
          <div className="w-full sm:w-auto bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1 border border-slate-200 overflow-x-auto">
            {timeframes.map((tf) => (
              <button
                key={tf.id}
                onClick={() => setTimeframe(tf.id)}
                className={`relative flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap ${
                  timeframe === tf.id
                    ? 'text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {timeframe === tf.id && (
                  <motion.div
                    layoutId="pill-active-bg"
                    transition={SpringConfigs.tactile}
                    className="absolute inset-0 rounded-xl bg-white border border-slate-200 shadow-xs"
                  />
                )}
                <span className="relative z-10">{tf.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Milestone Highlight Banner */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center gap-3 text-indigo-900 text-xs sm:text-sm font-bold shadow-xs">
          <span className="text-lg sm:text-xl shrink-0">💡</span>
          <span className="leading-snug">{projection.topMilestoneHighlight}</span>
        </div>
      </motion.div>

      {/* Primary Forecast KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Forecast Check-ins Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05, ease: EasingCurves.apple }}
          className="rounded-3xl p-5 sm:p-6 bg-white border border-slate-200/80 shadow-sm space-y-2"
        >
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
            Forecasted Check-ins ({projection.daysHorizon}d)
          </span>
          <div className="text-3xl sm:text-4xl font-extrabold text-indigo-600 flex items-baseline gap-2 flex-wrap">
            <span>{totalCompletionsCount}</span>
            <span className="text-xs font-bold text-slate-500">total check-ins</span>
          </div>
          <p className="text-xs text-slate-600 font-medium pt-1">
            Based on your active habit set of {habits.length} habits.
          </p>
        </motion.div>

        {/* Bloom Score Growth Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1, ease: EasingCurves.apple }}
          className="rounded-3xl p-5 sm:p-6 bg-white border border-slate-200/80 shadow-sm space-y-2"
        >
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
            Bloom Score Growth Forecast
          </span>
          <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600 flex items-baseline gap-2 flex-wrap">
            <span>+{projection.projectedBloomScoreGain}</span>
            <span className="text-xs font-bold text-slate-500">pts gain</span>
          </div>
          <p className="text-xs text-slate-600 font-medium pt-1">
            Expected growth from consistency & streak momentum.
          </p>
        </motion.div>

        {/* +15% Boost Scenario Toggle Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15, ease: EasingCurves.apple }}
          className="rounded-3xl p-5 sm:p-6 bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between sm:col-span-2 md:col-span-1"
        >
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
              Simulation Scenario
            </span>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900">
              +15% Consistency Boost
            </h4>
          </div>

          <button
            onClick={() => setBoostScenarioEnabled(!boostScenarioEnabled)}
            className={`mt-3 sm:mt-4 w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
              boostScenarioEnabled
                ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
            }`}
          >
            {boostScenarioEnabled ? '✓ Scenario Active (+15%)' : 'Simulate +15% Consistency Boost'}
          </button>
        </motion.div>
      </div>

      {/* Detailed Habit Breakdown Cards */}
      <div className="rounded-3xl p-5 sm:p-6 bg-white border border-slate-200/80 shadow-sm space-y-4 sm:space-y-6">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
          <span>🎯 Per-Habit Trajectory Forecast</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {projection.habitProjections.map((hp) => (
            <div
              key={hp.habitId}
              className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5 sm:gap-3">
                <span className="text-2xl sm:text-3xl p-2 rounded-xl bg-white border border-slate-200 shadow-xs select-none shrink-0">
                  {hp.emoji}
                </span>
                <div className="space-y-0.5">
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
                    {hp.habitName}
                  </h4>
                  <span className="text-[11px] sm:text-xs font-semibold text-slate-600 block">
                    Consistency: {hp.currentConsistencyPct}%
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-bold text-indigo-600 block">
                    {hp.milestoneTitle}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xl sm:text-2xl font-black text-slate-900 block">
                  {hp.projectedCompletions}
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Projected
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FutureProjectionView;

