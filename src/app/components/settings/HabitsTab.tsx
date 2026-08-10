import React from 'react';
import { Habit } from '../../../../lib/habitTypes';

interface HabitsTabProps {
  habits: Habit[];
}

export default function HabitsTab({ habits }: HabitsTabProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Habit Management</h2>
      <p className="text-xs text-slate-500">You currently have {habits.length} active habits configured.</p>

      <div className="divide-y divide-emerald-50 border border-emerald-100 rounded-xl overflow-hidden">
        {habits.map(h => (
          <div key={h.id} className="flex items-center justify-between p-3.5 hover:bg-emerald-50/50 transition-colors">
            <div className="flex items-center gap-2.5">
              <span className="text-base">{h.emoji}</span>
              <div>
                <div className="text-xs font-bold text-slate-800">{h.name}</div>
                <div className="text-[11px] text-slate-500">{h.category || 'General'} • Goal: {h.goal} days/mo</div>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
              Active
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
