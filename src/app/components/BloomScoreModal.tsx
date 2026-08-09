import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, Flame, Zap, Layers } from 'lucide-react';
import { BloomScoreBreakdown } from '../../../lib/bloomScoreUtils';

interface BloomScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  breakdown: BloomScoreBreakdown;
}

export default function BloomScoreModal({ isOpen, onClose, breakdown }: BloomScoreModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        >
          <div className={`h-24 bg-gradient-to-r ${breakdown.tier.gradient} relative overflow-hidden`}>
            <div className="absolute inset-0 bg-black/10"></div>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors z-10"
            >
              <X size={16} />
            </button>
            <div className="absolute -bottom-6 left-6 p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800">
              <span className="text-3xl filter drop-shadow-sm">{breakdown.tier.emoji}</span>
            </div>
          </div>
          
          <div className="p-6 pt-10 space-y-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Bloom Score</h2>
              <p className="text-sm text-slate-500 font-medium mt-1 leading-relaxed">
                Your Bloom Score represents your overall progress, consistency, and dedication to your habits. It is not a measure of personal worth, but a reflection of your active journey.
              </p>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Score Breakdown</h3>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-xl"><Target size={16} /></div>
                  <div>
                    <div className="text-sm font-bold text-slate-700 dark:text-slate-200">Consistency</div>
                    <div className="text-[10px] text-slate-500">Completing scheduled habits</div>
                  </div>
                </div>
                <div className="text-sm font-black text-slate-700 dark:text-slate-200">{breakdown.consistencyScore} <span className="text-xs font-medium text-slate-400">/ 400</span></div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 text-orange-600 rounded-xl"><Flame size={16} /></div>
                  <div>
                    <div className="text-sm font-bold text-slate-700 dark:text-slate-200">Streak Bonus</div>
                    <div className="text-[10px] text-slate-500">Maintaining consecutive days</div>
                  </div>
                </div>
                <div className="text-sm font-black text-slate-700 dark:text-slate-200">{breakdown.streakScore} <span className="text-xs font-medium text-slate-400">/ 200</span></div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 text-purple-600 rounded-xl"><Layers size={16} /></div>
                  <div>
                    <div className="text-sm font-bold text-slate-700 dark:text-slate-200">Diversity</div>
                    <div className="text-[10px] text-slate-500">Balancing different habit types</div>
                  </div>
                </div>
                <div className="text-sm font-black text-slate-700 dark:text-slate-200">{breakdown.diversityScore} <span className="text-xs font-medium text-slate-400">/ 200</span></div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl"><Zap size={16} /></div>
                  <div>
                    <div className="text-sm font-bold text-slate-700 dark:text-slate-200">XP Bonus</div>
                    <div className="text-[10px] text-slate-500">Overall level progression</div>
                  </div>
                </div>
                <div className="text-sm font-black text-slate-700 dark:text-slate-200">{breakdown.xpBonusScore} <span className="text-xs font-medium text-slate-400">/ 200</span></div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
              <div className="text-sm font-bold text-emerald-800 dark:text-emerald-400">Total Score</div>
              <div className="text-2xl font-black text-emerald-600">{breakdown.totalBloomScore}</div>
            </div>
            
            <div className="text-center pt-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">How to improve</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Show up daily, build strong streaks, balance your routine, and keep leveling up. Consistency is the most important factor.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
