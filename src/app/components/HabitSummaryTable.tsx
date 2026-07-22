'use client';

import React from 'react';
import { Habit, HabitLog } from '../../../lib/habitTypes';
import { getHabitStats } from '../../../lib/habitUtils';

interface HabitSummaryTableProps {
  habits: Habit[];
  logs: HabitLog;
  daysInMonth: number;
  year: number;
  month: number;
}

export default function HabitSummaryTable({ habits, logs, daysInMonth, year, month }: HabitSummaryTableProps) {
  if (habits.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden transition-all">
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60">
        <h2 className="text-sm font-bold text-slate-900 tracking-tight">Habit Summary Breakdown</h2>
        <p className="text-xs text-slate-500">Monthly goal fulfillment per habit</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px]">
          <thead>
            <tr className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/60">
              <th className="text-left px-5 py-2.5">Habit</th>
              <th className="text-center px-4 py-2.5">Completed</th>
              <th className="text-center px-4 py-2.5">Target</th>
              <th className="text-center px-4 py-2.5">% Done</th>
              <th className="px-5 py-2.5 text-left">Progress Bar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {habits.map((habit, idx) => {
              const { done, goal, pct } = getHabitStats(habit, logs, daysInMonth, year, month);
              const rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30';
              const barColor = pct >= 80 ? 'bg-emerald-600' : pct >= 50 ? 'bg-amber-400' : 'bg-rose-500';

              return (
                <tr key={habit.id} className={`${rowBg} hover:bg-slate-50 transition-colors`}>
                  <td className="px-5 py-3 font-semibold text-slate-900">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{habit.emoji}</span>
                      <span className="truncate">{habit.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-emerald-700">{done}</td>
                  <td className="px-4 py-3 text-center font-semibold text-slate-400">{goal}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-bold ${pct >= 80 ? 'text-emerald-700' : pct >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                      {pct}%
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}