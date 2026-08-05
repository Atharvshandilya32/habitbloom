import React from 'react';
import { Habit, HabitLog } from '../../../lib/habitTypes';
import { generateInsights } from '../../../lib/insightsEngine';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface InsightsPanelProps {
  habits: Habit[];
  logs: HabitLog;
}

export default function InsightsPanel({ habits, logs }: InsightsPanelProps) {
  const insights = generateInsights(habits, logs);

  if (insights.length === 0) {
    return null; // Don't show if there are no insights yet
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-emerald-100 text-emerald-600 p-2 rounded-xl">
          <Sparkles size={24} />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Smart Insights</h2>
          <p className="text-sm font-medium text-slate-500">AI-driven observations on your habits</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, idx) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`p-5 rounded-2xl border flex gap-4 items-start ${
              insight.type === 'warning' 
                ? 'bg-rose-50 border-rose-200' 
                : insight.type === 'success'
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-indigo-50 border-indigo-200'
            }`}
          >
            <div className="text-2xl mt-1">{insight.icon}</div>
            <div className="flex-1 space-y-1">
              <h3 className={`text-sm font-extrabold ${
                insight.type === 'warning' ? 'text-rose-900' : insight.type === 'success' ? 'text-emerald-900' : 'text-indigo-900'
              }`}>
                {insight.title}
              </h3>
              <p className={`text-xs font-medium ${
                insight.type === 'warning' ? 'text-rose-700' : insight.type === 'success' ? 'text-emerald-700' : 'text-indigo-700'
              }`}>
                {insight.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
