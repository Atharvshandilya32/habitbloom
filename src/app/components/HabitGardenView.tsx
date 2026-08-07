'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fireConfetti } from '../../../lib/confetti';
import { Habit, HabitLog } from '../../../lib/habitTypes';
import { getHabitStats, getCurrentStreak, makeLogKey } from '../../../lib/habitUtils';
import { SpringConfigs, EasingCurves } from '../../../lib/motion/motionTokens';
import { GardenEnvironment, getEnvironmentClasses, getTimeOfDay, TimeOfDay } from './GardenEnvironment';

interface HabitGardenViewProps {
  habits: Habit[];
  logs?: HabitLog;
  logsObj?: HabitLog;
  onToggleHabit?: (habitId: string, day: number) => void;
  year?: number;
  month?: number;
}

const EMPTY_LOGS = {};

export const HabitGardenView: React.FC<HabitGardenViewProps> = React.memo(({
  habits,
  logs,
  logsObj,
  onToggleHabit,
  year = new Date().getFullYear(),
  month = new Date().getMonth() + 1,
}) => {
  const activeLogs = logs || logsObj || EMPTY_LOGS;
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('afternoon');
  const [isToggling, setIsToggling] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setTimeOfDay(getTimeOfDay());
  }, []);

  const envClasses = getEnvironmentClasses(timeOfDay);

  const daysInMonth = new Date(year, month, 0).getDate();
  const todayDate = new Date().getDate();

  const handleWaterPlant = (habitId: string, isDoneToday: boolean) => {
    if (isToggling[habitId]) return;
    
    setIsToggling(prev => ({ ...prev, [habitId]: true }));
    
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
    
    setTimeout(() => {
      setIsToggling(prev => ({ ...prev, [habitId]: false }));
    }, 500);
  };

  const gardenPlants = React.useMemo(() => {
    return habits.map((habit) => {
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
  }, [habits, activeLogs, daysInMonth, year, month, todayDate]);

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
        className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-emerald-50/80 to-teal-50/80 border border-emerald-100 shadow-sm relative overflow-hidden bg-white/50 backdrop-blur-sm"
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
          <div className="flex items-center gap-4 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-emerald-100 shadow-sm hover:shadow-md transition-all">
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
      <div className={`rounded-3xl p-6 sm:p-8 min-h-[400px] flex flex-col justify-between shadow-sm relative overflow-hidden transition-colors duration-1000 border ${envClasses.bg}`}>
        <GardenEnvironment timeOfDay={timeOfDay} />
        {gardenPlants.length === 0 ? (
          <div className="flex flex-col items-center justify-center my-auto py-16 text-center space-y-3 relative z-10">
            <span className="text-6xl select-none">🪴</span>
            <h3 className={`text-lg font-bold ${envClasses.titleText}`}>Your Garden is Empty</h3>
            <p className={`text-xs max-w-sm font-medium ${envClasses.textMuted}`}>
              Add habits to plant seeds in your personal Habit Sanctuary and watch them flourish.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 relative z-10 my-auto">
            {gardenPlants.map((plant) => {
              const isSelected = selectedPlantId === plant.habit.id;

              return (
                <motion.button
                  key={plant.habit.id}
                  layout
                  whileHover={{ y: -5, scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  transition={SpringConfigs.tactile}
                  onClick={() => setSelectedPlantId(plant.habit.id)}
                  type="button"
                  className={`relative cursor-pointer rounded-2xl p-5 flex flex-col items-center justify-between text-center transition-all border w-full focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none ${envClasses.plantBg} ${envClasses.plantBorder} ${
                    isSelected
                      ? 'border-2 border-emerald-500 shadow-md ring-4 ring-emerald-50'
                      : 'shadow-sm'
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
                    <h4 className={`text-sm font-extrabold truncate ${envClasses.titleText}`}>
                      {plant.habit.name}
                    </h4>
                    <div className={`text-[11px] font-bold ${envClasses.textMuted}`}>
                      {plant.stats.pct}% Health
                    </div>
                  </div>

                  {/* Water / Check-in Quick Button */}
                  <motion.div
                    role="button"
                    tabIndex={0}
                    whileTap={{ scale: 0.92 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWaterPlant(plant.habit.id, plant.isDoneToday);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        e.stopPropagation();
                        handleWaterPlant(plant.habit.id, plant.isDoneToday);
                      }
                    }}
                    className={`mt-4 w-full py-2 px-3 rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 transition-all duration-300 hover:scale-105 ${
                      plant.isDoneToday
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold shadow-emerald-200'
                        : 'bg-emerald-400 hover:bg-emerald-500 text-white font-bold shadow-emerald-100'
                    }`}
                  >
                    <span>{plant.isDoneToday ? '✓ Watered Today' : '💧 Water Plant'}</span>
                  </motion.div>
                </motion.button>
              );
            })}
          </div>
        )}

        {/* Footer Ground Strip */}
        <div className={`mt-8 pt-4 border-t flex flex-wrap items-center justify-between text-xs font-semibold relative z-10 ${envClasses.plantBorder} ${envClasses.textMuted}`}>
          <span>🌱 Seedling (0-24%) → 🌿 Budding (25-49%) → 🌸 Blooming (50-79%) → 🌺 Full Bloom (80%+)</span>
          <span>Click any plant to highlight</span>
        </div>
      </div>
    </div>
  );
});

HabitGardenView.displayName = 'HabitGardenView';

export default HabitGardenView;

