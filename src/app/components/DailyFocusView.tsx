import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

import { Habit, HabitLog, JournalEntry } from '../../../lib/habitTypes';
import { makeLogKey, getCurrentStreak } from '../../../lib/habitUtils';
import { calculateBloomScore } from '../../../lib/bloomScoreUtils';
import { XP_CONSTANTS } from '../../../lib/xpEngine';

import { IntelligenceEngine } from '../../../lib/intelligence/intelligenceEngine';
import { Check, Sun, Trophy } from 'lucide-react';
import { NavTab } from './charts/TitleBanner';
import MotionPageWrapper from './motion/MotionPageWrapper';
import MotionCounter from './motion/MotionCounter';


interface DailyFocusViewProps {
  habits: Habit[];
  logs: HabitLog;
  year: number;
  month: number;
  day: number;
  onToggleCell: (habitId: string, day: number) => void;
  onNavigateTab: (tab: NavTab) => void;
  onOpenJournal?: (habitId: string) => void;
  journals?: JournalEntry[];
}

const DailyFocusView = React.memo(function DailyFocusView({
  habits,
  logs,
  year,
  month,
  day,
  onToggleCell,
  onNavigateTab,
  onOpenJournal,
  journals = []
}: DailyFocusViewProps) {
  const [showCelebration, setShowCelebration] = useState(false);
  const [insights, setInsights] = useState<{ text: string; icon: string }[]>([]);
  const [nextAction, setNextAction] = useState<string | null>(null);
  const [isToggling, setIsToggling] = useState<Record<string, boolean>>({});
  const [completedAnim, setCompletedAnim] = useState<{ id: string, xp: number } | null>(null);

  useEffect(() => {
    const today = new Date(year, month - 1, day);
    const engineInsights = IntelligenceEngine.generateInsights(habits, logs, today);
    const engineRecs = IntelligenceEngine.generateRecommendations(habits, logs, today);

    setInsights(
      engineInsights.length > 0 
        ? engineInsights.slice(0, 3).map(i => ({ text: i.description, icon: i.icon }))
        : [{ text: "Keep building your routine. More history will unlock deeper insights.", icon: "🌱" }]
    );

    if (engineRecs.length > 0) {
      setNextAction(engineRecs[0].title);
    } else {
      setNextAction(null);
    }
  }, [habits, logs, year, month, day]);

  const activeHabits = habits; // For daily focus, we use all habits.
  
  const { completedCount, totalCount, progressPercent, remainingCount, nextIncompleteHabit, xpEarnedToday } = React.useMemo(() => {
    let completed = 0;
    let xp = 0;
    let nextHabit: Habit | undefined = undefined;
    const daysInMonth = new Date(year, month, 0).getDate();

    activeHabits.forEach(habit => {
      const key = makeLogKey(habit.id, year, month, day);
      if (logs[key]) {
        completed++;
        xp += XP_CONSTANTS.HABIT_COMPLETION;
        const streak = getCurrentStreak(habit, logs, year, month, daysInMonth);
        if (streak > 2) xp += XP_CONSTANTS.STREAK_BONUS;
      } else if (!nextHabit) {
        nextHabit = habit;
      }
    });

    const total = activeHabits.length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    return {
      completedCount: completed,
      totalCount: total,
      progressPercent: percent,
      remainingCount: total - completed,
      nextIncompleteHabit: nextHabit,
      xpEarnedToday: xp
    };
  }, [activeHabits, logs, year, month, day]);

  // Use Intelligence Engine recommendation if available, otherwise fallback
  const nextActionText = nextAction || (nextIncompleteHabit ? `Next: ${nextIncompleteHabit.name}` : "You&apos;ve completed today&apos;s habits.");

  const bloomBreakdown = React.useMemo(() => calculateBloomScore(habits, logs, year, month), [habits, logs, year, month]);

  // Trigger celebration once when hitting 100%
  useEffect(() => {
    if (progressPercent === 100 && totalCount > 0) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [progressPercent, totalCount]);

  // SVG parameters for progress ring
  const sqSize = 160;
  const strokeWidth = 12;
  const radius = (sqSize - strokeWidth) / 2;
  const viewBox = `0 0 ${sqSize} ${sqSize}`;
  const dashArray = radius * Math.PI * 2;
  const dashOffset = dashArray - (dashArray * progressPercent) / 100;

  const handleToggle = (habitId: string, day: number) => {
    if (isToggling[habitId]) return;
    
    const key = makeLogKey(habitId, year, month, day);
    const wasCompleted = !!logs[key];
    
    setIsToggling(prev => ({ ...prev, [habitId]: true }));
    
    // Micro-interaction: Haptic Feedback
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(wasCompleted ? 20 : [30, 50, 30]);
    }

    onToggleCell(habitId, day);
    
    if (!wasCompleted) {
      const daysInMonth = new Date(year, month, 0).getDate();
      const habit = habits.find(h => h.id === habitId);
      let xpGained = XP_CONSTANTS.HABIT_COMPLETION;
      if (habit) {
        const fakeLogs = { ...logs, [key]: true };
        const newStreak = getCurrentStreak(habit, fakeLogs, year, month, daysInMonth);
        if (newStreak > 2) xpGained += XP_CONSTANTS.STREAK_BONUS;
      }
      setCompletedAnim({ id: habitId, xp: xpGained });
      setTimeout(() => setCompletedAnim(null), 2500);
    }
    
    setTimeout(() => {
      setIsToggling(prev => ({ ...prev, [habitId]: false }));
    }, 500); // 500ms debounce to prevent rapid clicking issues
  };

  const latestFocus = [...journals]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .find(j => j.weeklyFocus)?.weeklyFocus;

  if (activeHabits.length === 0) {
    return (
      <MotionPageWrapper className="max-w-3xl mx-auto space-y-6">
        <div className="bg-gradient-to-br from-emerald-50/50 to-teal-50/50 border border-emerald-100 rounded-3xl p-10 text-center flex flex-col items-center justify-center space-y-4 shadow-sm bg-white/80 backdrop-blur-md">
          <div className="w-16 h-16 bg-white/60 rounded-full flex items-center justify-center shadow-sm">
            <span className="text-3xl">🌱</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900">Your garden is waiting</h2>
          <p className="text-slate-600 font-medium max-w-sm">
            Start by planting your first habit. Small, consistent actions will help your garden bloom.
          </p>
          <button
            onClick={() => onNavigateTab('dashboard')}
            className="mt-4 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-extrabold rounded-xl shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            Go to Dashboard to Add Habits
          </button>
        </div>
      </MotionPageWrapper>
    );
  }

  return (
    <MotionPageWrapper className="max-w-3xl mx-auto space-y-6">
      {/* Top Banner Context - 3 States */}
      {completedCount === 0 && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 border border-emerald-400 text-white rounded-3xl p-5 shadow-md flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <Sun size={22} className="text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                  Morning State
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-white mt-1">
                Good morning. You have {remainingCount} habits planned today.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('goals')}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-emerald-50 text-slate-900 text-xs font-black rounded-xl shadow-sm transition-all flex-shrink-0"
          >
            <Trophy size={14} className="text-amber-500" />
            <span>View Goals</span>
          </button>
        </div>
      )}

      {completedCount > 0 && completedCount < totalCount && (
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 border border-blue-400 text-white rounded-3xl p-5 shadow-md flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-sm flex-shrink-0 text-xl font-black">
              {completedCount}/{totalCount}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                  Active Day
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-white mt-1">
                {completedCount} habits complete, {remainingCount} remaining. Keep it up!
              </p>
            </div>
          </div>
        </div>
      )}

      {progressPercent === 100 && totalCount > 0 && (
        <div className="bg-gradient-to-r from-purple-500 to-fuchsia-600 border border-purple-400 text-white rounded-3xl p-5 shadow-md flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <Check size={22} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                  Completion
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-white mt-1">
                Today&apos;s garden is cared for. All scheduled habits are complete.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('reflection')}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-purple-50 text-slate-900 text-xs font-black rounded-xl shadow-sm transition-all flex-shrink-0"
          >
            <span>Reflection</span>
          </button>
        </div>
      )}

      {/* Header section with Progress Ring */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 flex flex-col md:flex-row items-center gap-8 justify-between relative overflow-hidden">
        {showCelebration && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-[200%] bg-[url('/confetti.svg')] bg-cover opacity-50 animate-pulse"></div>
            <div className="absolute inset-0 bg-emerald-500/10 animate-ping"></div>
          </div>
        )}
        
        <div className="flex-1 space-y-3 text-center md:text-left z-10">
          <h2 className="text-3xl font-black tracking-tight text-slate-900">
            {progressPercent === 100 ? "You&apos;re all done! 🎉" : "Today&apos;s Focus"}
          </h2>
          <p className="text-slate-600 font-bold text-sm">
            {progressPercent === 100 
              ? "Great job completing all your habits today. Take some time to relax!" 
              : `You have ${remainingCount} ${remainingCount === 1 ? 'habit' : 'habits'} left to complete today.`}
          </p>
          
          {insights.length > 0 && (
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-900 px-3.5 py-2 rounded-xl text-xs font-extrabold border border-indigo-200/80 shadow-xs max-w-full">
              <span className="text-sm">{insights[0].icon}</span>
              <span className="truncate">{insights[0].text}</span>
            </div>
          )}
          
          {latestFocus && (
            <div className="mt-2 inline-flex items-center gap-2 bg-amber-50 text-amber-900 px-3.5 py-2 rounded-xl text-xs font-extrabold border border-amber-200/80 shadow-xs max-w-full">
              <span className="text-sm">🎯</span>
              <span className="truncate">This Week&apos;s Focus: {latestFocus}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-3">
            <div className="bg-emerald-50/80 text-emerald-700 px-2.5 py-1.5 rounded-lg text-xs font-bold border border-emerald-200/60 shadow-sm flex items-center gap-1.5">
              <span>+{xpEarnedToday} XP Today</span>
            </div>
            <div className="bg-teal-50/80 text-teal-700 px-2.5 py-1.5 rounded-lg text-xs font-bold border border-teal-200/60 shadow-sm flex items-center gap-1.5">
              <span>{bloomBreakdown.tier.emoji} Bloom: {bloomBreakdown.totalBloomScore}</span>
            </div>
            <div className="bg-slate-50/80 text-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-bold border border-slate-200/60 shadow-sm flex items-center gap-1.5">
              <span>{nextActionText}</span>
            </div>
          </div>
        </div>

        <div className="relative flex-shrink-0 z-10">
          <svg width={sqSize} height={sqSize} viewBox={viewBox} className="transform -rotate-90">
            <circle
              className="text-slate-200"
              strokeWidth={strokeWidth}
              stroke="currentColor"
              fill="none"
              cx={sqSize / 2}
              cy={sqSize / 2}
              r={radius}
            />
            <motion.circle
              className="text-emerald-500"
              strokeWidth={strokeWidth}
              strokeDasharray={dashArray}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              cx={sqSize / 2}
              cy={sqSize / 2}
              r={radius}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <MotionCounter value={progressPercent} suffix="%" className="text-3xl font-black text-slate-900" />
          </div>
        </div>
      </div>

      {/* Habits List */}
      <div className="space-y-4">
        {activeHabits.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200/80 border-dashed">
            <p className="text-slate-500 font-medium mb-4">You don&apos;t have any active habits yet.</p>
            <button 
              onClick={() => onNavigateTab('dashboard')}
              className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-sm"
            >
              + Create Your First Habit
            </button>
          </div>
        ) : (
          activeHabits.map((habit, idx) => {
            const key = makeLogKey(habit.id, year, month, day);
            const isCompleted = !!logs[key];
            const daysInMonth = new Date(year, month, 0).getDate();
            const streak = getCurrentStreak(habit, logs, year, month, daysInMonth);
            
            return (
              <button 
                key={`${habit.id}-${idx}`}
                type="button"
                className={`w-full text-left group flex items-center p-4 rounded-2xl border transition-all duration-300 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none ${
                  isCompleted 
                    ? 'bg-slate-50 border-slate-200/80 shadow-xs' 
                    : 'bg-white border-slate-200/80 shadow-sm hover:shadow-md hover:border-emerald-300'
                } ${isToggling[habit.id] ? 'opacity-80 pointer-events-none cursor-wait' : ''}`}
                onClick={() => handleToggle(habit.id, day)}
                disabled={isToggling[habit.id]}
              >
                <div className={`w-12 h-12 flex items-center justify-center text-2xl rounded-2xl mr-4 group-hover:scale-105 transition-transform flex-shrink-0 relative ${
                  isCompleted ? 'bg-slate-200/70' : 'bg-slate-100'
                }`}>
                  <motion.div animate={{ scale: isCompleted ? 0 : 1 }} transition={{ duration: 0.2 }}>
                    {habit.emoji}
                  </motion.div>
                  {isCompleted && (
                    <motion.div 
                      initial={{ scale: 0 }} 
                      animate={{ scale: 1 }} 
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="absolute inset-0 flex items-center justify-center text-emerald-500"
                    >
                      <Check size={26} strokeWidth={3.5} />
                    </motion.div>
                  )}
                </div>
                <div className="flex-1 min-w-0 relative">
                  {completedAnim?.id === habit.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: -25, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute right-0 top-0 text-emerald-500 font-black text-sm pointer-events-none drop-shadow-sm"
                    >
                      +{completedAnim.xp} XP
                    </motion.div>
                  )}
                  <div className="flex items-center gap-2">
                    <h3 className={`font-extrabold text-base sm:text-lg truncate ${
                      isCompleted ? 'text-slate-500 line-through decoration-emerald-500 decoration-2' : 'text-slate-900'
                    }`}>
                      {habit.name}
                    </h3>
                    {streak > 2 && (
                      <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
                        {streak} 🔥
                      </span>
                    )}
                  </div>
                  {streak === 0 && !isCompleted && (
                    <p className="text-xs text-slate-500 mt-1 font-medium">A new day is another opportunity 🌱</p>
                  )}
                  {habit.category && (
                    <span className="text-xs font-bold text-slate-500 mt-0.5 block">{habit.category}</span>
                  )}
                </div>
                
                <div className="flex items-center gap-3">
                  {isCompleted && (
                    <div 
                      role="button"
                      tabIndex={0}
                      className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-700 hover:text-emerald-700 font-extrabold px-3 py-1 rounded-xl bg-slate-200/80 hover:bg-emerald-100 transition-colors shadow-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenJournal) {
                          onOpenJournal(habit.id);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          e.stopPropagation();
                          if (onOpenJournal) onOpenJournal(habit.id);
                        }
                      }}
                    >
                      <span>Reflection</span> ✍️
                    </div>
                  )}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                    isCompleted 
                      ? 'bg-emerald-500 text-white scale-100 shadow-sm' 
                      : 'bg-slate-100 text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600 scale-95 group-hover:scale-100'
                  }`}>
                    <Check strokeWidth={isCompleted ? 3 : 2} size={20} />
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </MotionPageWrapper>
  );
});

export default DailyFocusView;

