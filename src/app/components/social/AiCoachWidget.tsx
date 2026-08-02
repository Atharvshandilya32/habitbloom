'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { AiChallengeRecommendation } from '../../../../lib/socialTypes';

interface AiCoachWidgetProps {
  recommendations: AiChallengeRecommendation[];
  onAcceptRecommendation: (rec: AiChallengeRecommendation) => void;
}

export default function AiCoachWidget({
  recommendations,
  onAcceptRecommendation,
}: AiCoachWidgetProps) {
  if (recommendations.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 border border-teal-500/30 shadow-xl relative overflow-hidden space-y-4">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl" />

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
            <Bot size={22} />
          </div>
          <div>
            <h3 className="text-base font-extrabold flex items-center gap-2">
              HabitBloom AI Accountability Coach <Sparkles size={16} className="text-amber-400 animate-pulse" />
            </h3>
            <p className="text-xs text-teal-200/80">
              Personalized challenge suggestions generated based on your past habits & friend activity
            </p>
          </div>
        </div>

        <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 hidden sm:inline-block">
          AI Active ⚡
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative z-10">
        {recommendations.map((rec) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 hover:border-teal-400/50 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xl">{rec.emoji}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-400/20 text-teal-200">
                  {rec.targetDays}-Day Challenge
                </span>
              </div>
              <h4 className="text-sm font-bold text-white mb-1">{rec.title}</h4>
              <p className="text-xs text-slate-300 mb-2">{rec.description}</p>
              <div className="p-2 rounded-xl bg-black/20 text-[11px] text-teal-200/90 flex items-start gap-1.5 border border-white/5">
                <ShieldCheck size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <span>{rec.reason}</span>
              </div>
            </div>

            <button
              onClick={() => onAcceptRecommendation(rec)}
              className="mt-3 w-full py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              Start Challenge <ArrowRight size={14} />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
