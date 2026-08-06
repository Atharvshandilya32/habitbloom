import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

import { Habit, HabitLog } from '../../../lib/habitTypes';
import { makeLogKey, getCurrentStreak } from '../../../lib/habitUtils';

import { generateSmartInsights } from '../../../lib/insightUtils';
import { Check, Zap, Sun, Trophy } from 'lucide-react';
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
}

const DailyFocusView = React.memo(function DailyFocusView({
  habits,
  logs,
  year,
  month,
  day,
  onToggleCell,
  onNavigateTab,
  onOpenJournal
}: DailyFocusViewProps) {
  const [showCelebration, setShowCelebration] = useState(false);
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    setInsights(generateSmartInsights(habits, logs));
  }, [habits, logs]);

  const activeHabits = habits; // For daily focus, we use all habits.
  
  const completedCount = activeHabits.filter(habit => {
    const key = makeLogKey(habit.id, year, month, day);
    return logs[key];
  }).length;
  
  const totalCount = activeHabits.length;
  const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
  const remainingCount = totalCount - completedCount;

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

  return (
    <MotionPageWrapper className="max-w-3xl mx-auto space-y-6">
      {/* Morning Briefing Banner */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 border border-emerald-400 text-white rounded-3xl p-5 shadow-md flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-sm flex-shrink-0">
            <Sun size={22} className="text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                Morning Briefing
              </span>
              <span className="text-xs font-extrabold text-emerald-100">Streak Shield Active 🛡️</span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-white mt-1">
              {progressPercent === 100 
                ? "All daily focus habits completed! High performance day." 
                : `Focus on your ${remainingCount} top ${remainingCount === 1 ? 'habit' : 'habits'} to keep your momentum strong today.`}
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
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-900 px-3.5 py-2 rounded-xl text-xs font-extrabold border border-indigo-200/80 shadow-xs">
              <Zap size={16} className="text-indigo-600" />
              <span>{insights[0]}</span>
            </div>
          )}
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
          activeHabits.map((habit) => {
            const key = makeLogKey(habit.id, year, month, day);
            const isCompleted = !!logs[key];
            const daysInMonth = new Date(year, month, 0).getDate();
            const streak = getCurrentStreak(habit, logs, year, month, daysInMonth);
            
            return (
              <button 
                key={habit.id}
                type="button"
                className={`w-full text-left group flex items-center p-4 rounded-2xl border transition-all duration-300 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none ${
                  isCompleted 
                    ? 'bg-slate-50 border-slate-200/80 shadow-xs' 
                    : 'bg-white border-slate-200/80 shadow-sm hover:shadow-md hover:border-emerald-300'
                }`}
                onClick={() => onToggleCell(habit.id, day)}
              >
                <div className={`w-12 h-12 flex items-center justify-center text-2xl rounded-2xl mr-4 group-hover:scale-105 transition-transform flex-shrink-0 ${
                  isCompleted ? 'bg-slate-200/70' : 'bg-slate-100'
                }`}>
                  {habit.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-extrabold text-base sm:text-lg truncate ${
                      isCompleted ? 'text-slate-500 line-through decoration-emerald-500 decoration-2' : 'text-slate-900'
                    }`}>
                      {habit.name}
                    </h3>
                    {streak > 0 && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 shadow-xs">
                        🔥 {streak}d
                      </span>
                    )}
                  </div>
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

