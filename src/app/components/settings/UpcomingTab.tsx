import React from 'react';
import { useFeatureFlags } from '../../../../lib/FeatureFlagContext';
import { Sparkles as SparklesIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function UpcomingTab() {
  const { flags, togglePremium } = useFeatureFlags();

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Upcoming Features</h2>
      <p className="text-xs text-slate-500">
        Unlock advanced AI heuristics, Team Challenges, and personalized Habit Insights.
      </p>

      <div className="p-5 rounded-2xl border border-indigo-200 bg-indigo-50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-extrabold text-indigo-900">HabitBloom Premium</h3>
          <p className="text-xs font-medium text-indigo-700 mt-1">
            {flags.isPremium ? "You are currently enjoying Premium features!" : "Upgrade to unlock Smart Insights and Team Challenges."}
          </p>
        </div>
        <button
          onClick={() => {
            togglePremium();
            toast.success(flags.isPremium ? "Premium features disabled." : "Premium features unlocked!");
          }}
          className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm overflow-hidden ${
            flags.isPremium
              ? 'bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          <AnimatePresence>
            {!flags.isPremium && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              />
            )}
          </AnimatePresence>
          <span className="relative z-10 flex items-center gap-1.5">
            {flags.isPremium ? 'Disable Premium' : <><SparklesIcon size={14}/> Unlock Premium (Demo)</>}
          </span>
        </button>
      </div>
    </div>
  );
}
