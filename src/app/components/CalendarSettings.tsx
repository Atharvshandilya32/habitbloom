'use client';

import React, { useState } from 'react';
import { CalendarDays, ChevronDown, RotateCcw, AlertTriangle } from 'lucide-react';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

interface CalendarSettingsProps {
  year: number;
  month: number;
  onYearChange: (y: number) => void;
  onMonthChange: (m: number) => void;
  onResetMonth: () => void;
}

export default function CalendarSettings({ year, month, onYearChange, onMonthChange, onResetMonth }: CalendarSettingsProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleReset = () => {
    setShowConfirm(false);
    onResetMonth();
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
      {/* Title */}
      <div className="flex items-center gap-2 text-slate-900 font-extrabold">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
          <CalendarDays size={18} />
        </div>
        <span className="text-sm tracking-tight font-black">Calendar Controls</span>
      </div>

      {/* Controls Container */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Year */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs">
          <label className="text-xs font-black text-slate-600 uppercase tracking-wider">Year</label>
          <input
            type="number"
            value={year}
            min={2020}
            max={2035}
            onChange={e => {
              const v = parseInt(e.target.value, 10);
              if (!isNaN(v) && v >= 2020 && v <= 2035) onYearChange(v);
            }}
            className="w-16 bg-transparent text-sm font-black text-slate-900 focus:outline-none"
          />
        </div>

        {/* Month */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs relative">
          <label className="text-xs font-black text-slate-600 uppercase tracking-wider">Month</label>
          <select
            value={month}
            onChange={e => onMonthChange(parseInt(e.target.value, 10))}
            className="appearance-none bg-transparent pr-5 text-sm font-black text-slate-900 cursor-pointer focus:outline-none"
          >
            {MONTHS.map((m, i) => (
              <option key={`month-${i + 1}`} value={i + 1} className="bg-white text-slate-900 font-bold">{m}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" />
        </div>


        {/* Current month badge */}
        <div className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-extrabold shadow-sm">
          {MONTHS[month - 1]} {year}
        </div>

        {/* Reset Month button */}
        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-rose-200 text-rose-600 bg-white hover:bg-rose-50 transition-colors shadow-sm"
            title={`Reset all ticks for ${MONTHS[month - 1]} ${year}`}
          >
            <RotateCcw size={13} />
            Reset Month
          </button>
        ) : (
          <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-xl px-3 py-1.5 shadow-sm">
            <AlertTriangle size={13} className="text-rose-500 shrink-0" />
            <span className="text-xs text-rose-700 font-bold">Clear {MONTHS[month - 1]}?</span>
            <button
              onClick={handleReset}
              className="text-xs font-extrabold text-rose-600 hover:text-rose-800 underline transition-colors"
            >
              Yes
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="text-xs text-slate-500 hover:text-slate-700 transition-colors font-semibold"
            >
              No
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
