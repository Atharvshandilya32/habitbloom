import React from 'react';

export default function AboutTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">About HabitBloom</h2>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌱</span>
          <span className="text-base font-extrabold text-slate-900">HabitBloom v2.0 Premium</span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed max-w-lg">
          Designed inspired by Linear, Notion, Arc Browser, Todoist, and TickTick. Built to run fast and light on free Vercel + Firebase infrastructure.
        </p>
      </div>
    </div>
  );
}
