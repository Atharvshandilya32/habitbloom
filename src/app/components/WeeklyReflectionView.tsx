'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Habit, HabitLog, JournalEntry, MoodType } from '../../../lib/habitTypes';
import { getWeeklyStats } from '../../../lib/habitUtils';
import { EasingCurves } from '../../../lib/motion/motionTokens';

interface WeeklyReflectionViewProps {
  habits: Habit[];
  logs?: HabitLog;
  logsObj?: HabitLog;
  journals?: JournalEntry[];
  onSaveJournal?: (entry: JournalEntry) => void;
  year?: number;
  month?: number;
}

const MOOD_OPTIONS: { label: MoodType; emoji: string; color: string }[] = [
  { label: '😁 Excellent', emoji: '🚀', color: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
  { label: '😊 Good', emoji: '🔥', color: 'bg-amber-50 text-amber-700 border-amber-300' },
  { label: '😐 Okay', emoji: '😐', color: 'bg-slate-50 text-slate-700 border-slate-300' },
  { label: '😔 Bad', emoji: '😓', color: 'bg-rose-50 text-rose-700 border-rose-300' },
  { label: '😴 Tired', emoji: '😴', color: 'bg-purple-50 text-purple-700 border-purple-300' },
];

export const WeeklyReflectionView: React.FC<WeeklyReflectionViewProps> = ({
  habits,
  logs,
  logsObj,
  journals = [],
  onSaveJournal,
  year = new Date().getFullYear(),
  month = new Date().getMonth() + 1,
}) => {
  const activeLogs = logs || logsObj || {};
  const daysInMonth = new Date(year, month, 0).getDate();
  const weeklyStats = getWeeklyStats(habits, activeLogs, year, month, daysInMonth);

  // Smart current week index lookup based on today's day of month
  const now = new Date();
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() + 1 === month;
  const todayDate = isCurrentMonth ? now.getDate() : daysInMonth;

  let activeWeekIdx = weeklyStats.findIndex((w) => {
    const parts = w.label.split('-').map(Number);
    return todayDate >= parts[0] && todayDate <= parts[1];
  });

  if (activeWeekIdx === -1) {
    activeWeekIdx = Math.max(0, weeklyStats.length - 1);
  }

  const currentWeek = weeklyStats[activeWeekIdx] || { label: 'Week 1', pct: 0, done: 0, possible: 0 };
  const prevWeek = activeWeekIdx > 0 ? weeklyStats[activeWeekIdx - 1] : { pct: 0 };
  const improvementDelta = currentWeek.pct - prevWeek.pct;

  // Reflection Form State
  const [winNote, setWinNote] = useState<string>('');
  const [challengeNote, setChallengeNote] = useState<string>('');
  const [nextWeekGoal, setNextWeekGoal] = useState<string>('');
  const [mood, setMood] = useState<MoodType>('😊 Good');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const handleSaveReflection = () => {
    if (!winNote && !challengeNote && !nextWeekGoal) return;

    const formattedNotes = [
      winNote ? `Win: ${winNote}` : '',
      challengeNote ? `Challenge: ${challengeNote}` : '',
      nextWeekGoal ? `Next Week Commitment: ${nextWeekGoal}` : '',
    ].filter(Boolean).join(' | ');

    const entry: JournalEntry = {
      id: `reflection-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      notes: formattedNotes,
      wins: winNote,
      challenges: challengeNote,
      mood: mood,
    };

    if (onSaveJournal) {
      onSaveJournal(entry);
    }

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
    setWinNote('');
    setChallengeNote('');
    setNextWeekGoal('');
  };

  // Filter reflection journals
  const reflectionJournals = journals.filter(
    (j) => j.wins || j.challenges || j.id.startsWith('reflection-')
  ).slice(0, 5);

  return (
    <div className="space-y-4 sm:space-y-6 max-w-6xl mx-auto pb-12 px-1 sm:px-0">
      {/* Top Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: EasingCurves.apple }}
        className="rounded-3xl p-5 sm:p-8 bg-white border border-slate-200/80 shadow-sm space-y-4 sm:space-y-6"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
              <span>📝 Weekly Digest</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
              <span>🕯️ Weekly Reflection</span>
            </h1>
            <p className="text-xs sm:text-base text-slate-700 font-medium max-w-xl leading-relaxed">
              Synthesize your performance from Week {activeWeekIdx + 1} ({currentWeek.label}), celebrate wins, and calibrate your habits for the week ahead.
            </p>
          </div>

          <div className="w-full md:w-auto p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1 shadow-xs min-w-[140px] shrink-0">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Week {activeWeekIdx + 1} Completion</span>
            <div className="text-2xl sm:text-3xl font-black text-blue-600">{currentWeek.pct}%</div>
            <span className="text-[11px] font-bold text-emerald-600 block">
              {improvementDelta >= 0 ? `+${improvementDelta}% vs last week` : `${improvementDelta}% vs last week`}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Weekly Completion Trend */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05, ease: EasingCurves.apple }}
          className="rounded-3xl p-5 sm:p-6 bg-white border border-slate-200/80 shadow-sm space-y-4 sm:space-y-6"
        >
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            📊 Month Weekly Breakdown
          </h3>

          <div className="space-y-3 sm:space-y-4">
            {weeklyStats.map((w, idx) => {
              const isCurrent = idx === activeWeekIdx;
              return (
                <div key={w.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold flex-wrap gap-1">
                    <span className={`flex items-center flex-wrap gap-1.5 ${isCurrent ? 'text-blue-700 font-black' : 'text-slate-800'}`}>
                      <span>Week {idx + 1} ({w.label})</span>
                      {isCurrent && <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-extrabold uppercase shrink-0">Active</span>}
                    </span>
                    <span className="text-indigo-600 font-extrabold text-[11px] sm:text-xs">{w.pct}% ({w.done}/{w.possible})</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${w.pct}%` }}
                      transition={{ duration: 0.5, ease: EasingCurves.apple }}
                      className={`h-full rounded-full ${isCurrent ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-slate-400/80'}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Guided Micro-Journal Entry */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1, ease: EasingCurves.apple }}
          className="rounded-3xl p-5 sm:p-6 bg-white border border-slate-200/80 shadow-sm space-y-4"
        >
          <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>✍️ Micro-Reflection Journal</span>
          </h3>

          <div className="space-y-3">
            {/* Mood Selector - 2 Column Grid on Mobile */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Weekly Energy & Mood:
              </label>
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                {MOOD_OPTIONS.map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setMood(opt.label)}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center sm:justify-start gap-1.5 transition-all border focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
                      mood === opt.label ? opt.color + ' ring-2 ring-blue-500' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{opt.emoji}</span>
                    <span className="truncate">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Biggest Win This Week:
              </label>
              <input
                type="text"
                value={winNote}
                onChange={(e) => setWinNote(e.target.value)}
                placeholder="e.g. Completed morning meditation 5 days in a row!"
                className="w-full px-3.5 sm:px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Challenge or Area to Improve:
              </label>
              <input
                type="text"
                value={challengeNote}
                onChange={(e) => setChallengeNote(e.target.value)}
                placeholder="e.g. Sleep schedule was irregular on Thursday."
                className="w-full px-3.5 sm:px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Next Week Key Commitment:
              </label>
              <input
                type="text"
                value={nextWeekGoal}
                onChange={(e) => setNextWeekGoal(e.target.value)}
                placeholder="e.g. Prepare gym clothes the night before."
                className="w-full px-3.5 sm:px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
              />
            </div>

            <div className="pt-2">
              <button
                onClick={handleSaveReflection}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs transition-all shadow-xs focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                {isSaved ? '✓ Reflection Saved to Journal!' : 'Save Weekly Reflection'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Past Reflection Archive Feed */}
      {reflectionJournals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15, ease: EasingCurves.apple }}
          className="rounded-3xl p-5 sm:p-6 bg-white border border-slate-200/80 shadow-sm space-y-4"
        >
          <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>📜 Recent Reflection Archive</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {reflectionJournals.map((j) => (
              <div key={j.id} className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>📅 {j.date}</span>
                  {j.mood && <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">{j.mood}</span>}
                </div>
                {j.wins && (
                  <p className="text-xs font-bold text-emerald-800">
                    🏆 <span className="font-semibold text-slate-800">{j.wins}</span>
                  </p>
                )}
                {j.challenges && (
                  <p className="text-xs font-bold text-amber-800">
                    ⚡ <span className="font-semibold text-slate-800">{j.challenges}</span>
                  </p>
                )}
                {!j.wins && !j.challenges && j.notes && (
                  <p className="text-xs font-medium text-slate-700">{j.notes}</p>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default WeeklyReflectionView;
