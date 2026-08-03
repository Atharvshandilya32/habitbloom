'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { fireConfetti } from '../../../lib/confetti';
import { Habit, HabitLog } from '../../../lib/habitTypes';
import { getHabitStats, getCurrentStreak, makeLogKey } from '../../../lib/habitUtils';
import { SpringConfigs, EasingCurves } from '../../../lib/motion/motionTokens';

interface HabitGardenViewProps {
  habits: Habit[];
  logs?: HabitLog;
  logsObj?: HabitLog;
  onToggleHabit?: (habitId: string, day: number) => void;
  year?: number;
  month?: number;
}

export const HabitGardenView: React.FC<HabitGardenViewProps> = ({
  habits,
  logs,
  logsObj,
  onToggleHabit,
  year = new Date().getFullYear(),
  month = new Date().getMonth() + 1,
}) => {
  const activeLogs = logs || logsObj || {};
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const daysInMonth = new Date(year, month, 0).getDate();
  const todayDate = new Date().getDate();

  const handleWaterPlant = (habitId: string, isDoneToday: boolean) => {
    if (onToggleHabit) {
      onToggleHabit(habitId, todayDate);
      if (!isDoneToday) {
        fireConfetti({
          particleCount: 45,
          spread: 65,
          origin: { y: 0.7 },
          colors: ['#10b981', '#3b82f6', '#ec4899', '#f59e0b'],
        });
      }
    }
  };

  const gardenPlants = habits.map((habit) => {
    const stats = getHabitStats(habit, activeLogs, daysInMonth, year, month);
    const streak = getCurrentStreak(habit, activeLogs, year, month, daysInMonth);
    const todayLogKey = makeLogKey(habit.id, year, month, todayDate);
    const isDoneToday = !!activeLogs[todayLogKey];

    let stageLabel = 'Seedling';
    let floraEmoji = '🌱';
    let growthScale = 0.85;

    if (stats.pct >= 80 || streak >= 14) {
      stageLabel = 'Full Bloom';
      floraEmoji = '🌺';
      growthScale = 1.3;
    } else if (stats.pct >= 50 || streak >= 7) {
      stageLabel = 'Blooming';
      floraEmoji = '🌸';
      growthScale = 1.15;
    } else if (stats.pct >= 25 || streak >= 3) {
      stageLabel = 'Budding';
      floraEmoji = '🌿';
      growthScale = 1.0;
    }

    return {
      habit,
      stats,
      streak,
      isDoneToday,
      stageLabel,
      floraEmoji,
      growthScale,
    };
  });

  const totalPlants = gardenPlants.length;
  const bloomingCount = gardenPlants.filter((p) => p.stageLabel !== 'Seedling' || p.stats.done > 0).length;
  const gardenHealthScore = totalPlants > 0
    ? Math.round(gardenPlants.reduce((acc, p) => acc + p.stats.pct, 0) / totalPlants)
    : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Garden Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: EasingCurves.apple }}
        className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white border border-emerald-100 shadow-sm relative overflow-hidden"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
              <span>🏡 Interactive Habit Sanctuary</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
              <span>🌻 Habit Garden</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-700 font-medium max-w-xl">
              Each habit is a living plant in your ecosystem. Water them by logging daily completions to nurture full blooms.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-center px-3">
              <span className="block text-2xl font-black text-emerald-600">{gardenHealthScore}%</span>
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Garden Health</span>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-center px-3">
              <span className="block text-2xl font-black text-rose-500">{bloomingCount}/{totalPlants}</span>
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Growing</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Garden Grid Plot */}
      <div className="rounded-3xl p-6 sm:p-8 bg-slate-50 border border-slate-200/80 min-h-[400px] flex flex-col justify-between shadow-sm relative overflow-hidden">
        {gardenPlants.length === 0 ? (
          <div className="flex flex-col items-center justify-center my-auto py-16 text-center space-y-3">
            <span className="text-6xl select-none">🪴</span>
            <h3 className="text-lg font-bold text-slate-800">Your Garden is Empty</h3>
            <p className="text-xs text-slate-600 max-w-sm font-medium">
              Add habits to plant seeds in your personal Habit Sanctuary and watch them flourish.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 relative z-10 my-auto">
            {gardenPlants.map((plant) => {
              const isSelected = selectedPlantId === plant.habit.id;

              return (
                <motion.div
                  key={plant.habit.id}
                  layout
                  whileHover={{ y: -5, scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  transition={SpringConfigs.tactile}
                  onClick={() => setSelectedPlantId(plant.habit.id)}
                  className={`relative cursor-pointer rounded-2xl p-5 flex flex-col items-center justify-between text-center transition-all bg-white border ${
                    isSelected
                      ? 'border-2 border-emerald-500 shadow-md ring-4 ring-emerald-50'
                      : 'border-slate-200 hover:border-emerald-300 shadow-sm'
                  }`}
                >
                  {/* Status Indicator */}
                  <div className="w-full flex items-center justify-between text-[10px] font-bold">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {plant.stageLabel}
                    </span>
                    <span className="text-amber-600 font-extrabold flex items-center gap-0.5">
                      ⚡ {plant.streak}d
                    </span>
                  </div>

                  {/* Visual Plant Flower Icon */}
                  <motion.div
                    animate={{ scale: plant.growthScale }}
                    transition={SpringConfigs.milestone}
                    className="my-5 relative"
                  >
                    <span className="text-5xl sm:text-6xl filter drop-shadow-sm select-none block">
                      {plant.floraEmoji}
                    </span>
                  </motion.div>

                  {/* Habit Title */}
                  <div className="w-full space-y-1">
                    <h4 className="text-sm font-extrabold text-slate-900 truncate">
                      {plant.habit.name}
                    </h4>
                    <div className="text-[11px] font-bold text-slate-600">
                      {plant.stats.pct}% Health
                    </div>
                  </div>

                  {/* Water / Check-in Quick Button */}
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWaterPlant(plant.habit.id, plant.isDoneToday);
                    }}
                    className={`mt-4 w-full py-2 px-3 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 ${
                      plant.isDoneToday
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold shadow-emerald-200'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    <span>{plant.isDoneToday ? '✓ Watered Today' : '💧 Water Plant'}</span>
                  </motion.button>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Footer Ground Strip */}
        <div className="mt-8 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 font-semibold relative z-10">
          <span>🌱 Seedling (0-24%) → 🌿 Budding (25-49%) → 🌸 Blooming (50-79%) → 🌺 Full Bloom (80%+)</span>
          <span>Click any plant to highlight</span>
        </div>
      </div>
    </div>
  );
};

export default HabitGardenView;

