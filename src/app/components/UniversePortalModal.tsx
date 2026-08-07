'use client';

import React, { useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Lock, Target } from 'lucide-react';
import { UNIVERSE_TIERS } from '../../../lib/xpEngine';
import { EasingCurves } from '../../../lib/motion/motionTokens';

interface UniversePortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLevel: number;
  currentXp: number;
}

export default function UniversePortalModal({
  isOpen,
  onClose,
  currentLevel,
  currentXp,
}: UniversePortalModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate tier status
  const currentTierIndex = useMemo(() => {
    let index = 0;
    for (let i = UNIVERSE_TIERS.length - 1; i >= 0; i--) {
      if (currentLevel >= UNIVERSE_TIERS[i].level) {
        index = i;
        break;
      }
    }
    return index;
  }, [currentLevel]);

  // Scroll to current tier on open
  useEffect(() => {
    if (isOpen && containerRef.current) {
      setTimeout(() => {
        const activeEl = document.getElementById('active-tier-card');
        if (activeEl && containerRef.current) {
          activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentTier = UNIVERSE_TIERS[currentTierIndex];
  const nextTier = currentTierIndex < UNIVERSE_TIERS.length - 1 ? UNIVERSE_TIERS[currentTierIndex + 1] : null;

  const getXpRequiredForLevel = (level: number) => {
    let xp = 0;
    for (let i = 1; i < level; i++) {
      xp += i * (i + 1) * 50;
    }
    return xp;
  };

  const nextTierXp = nextTier ? getXpRequiredForLevel(nextTier.level) : currentXp;
  const currentTierXp = getXpRequiredForLevel(currentTier.level);
  
  const xpProgress = nextTier ? Math.min(100, Math.max(0, ((currentXp - currentTierXp) / (nextTierXp - currentTierXp)) * 100)) : 100;
  const xpRemaining = nextTier ? Math.max(0, nextTierXp - currentXp) : 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl"
      >
        {/* Ambient background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                opacity: 0.1 + Math.random() * 0.3,
                y: Math.random() * 1000,
                x: Math.random() * window.innerWidth
              }}
              animate={{ 
                y: [null, Math.random() * -500],
                opacity: [null, 0.5, 0.1]
              }}
              transition={{
                duration: 10 + Math.random() * 20,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute w-1 h-1 bg-white rounded-full blur-[1px]"
            />
          ))}
        </div>

        <div 
          ref={containerRef}
          className="relative w-full h-full max-w-2xl overflow-y-auto hide-scrollbar flex flex-col pt-32 pb-64 px-4 sm:px-8"
        >
          <button
            onClick={onClose}
            className="fixed top-8 right-8 z-50 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-colors"
          >
            <X size={24} />
          </button>

          <div className="text-center mb-24 relative z-10">
            <motion.h2 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4"
            >
              Your Cosmic Journey
            </motion.h2>
            <motion.p 
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-slate-400 font-medium text-lg max-w-md mx-auto"
            >
              Every habit logged builds the universe of your future self.
            </motion.p>
          </div>

          <div className="relative flex flex-col items-center">
            {/* The Timeline Connector */}
            <div className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-slate-800 via-indigo-900 to-slate-800 left-1/2 -translate-x-1/2 z-0 rounded-full" />

            {UNIVERSE_TIERS.map((tier, index) => {
              const isUnlocked = index <= currentTierIndex;
              const isCurrent = index === currentTierIndex;
              
              return (
                <motion.div
                  key={tier.level}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, ease: EasingCurves.apple }}
                  id={isCurrent ? 'active-tier-card' : undefined}
                  className={`relative z-10 w-full mb-16 flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'} sm:px-8`}
                >
                  {/* Timeline Node */}
                  <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-4 border-slate-950 flex items-center justify-center z-20 ${
                    isCurrent ? 'bg-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.8)]' : 
                    isUnlocked ? 'bg-emerald-500' : 'bg-slate-800'
                  }`}>
                    {isUnlocked && !isCurrent && <div className="w-2 h-2 bg-slate-950 rounded-full" />}
                    {isCurrent && <div className="w-3 h-3 bg-white rounded-full animate-pulse" />}
                  </div>

                  {/* Tier Card */}
                  <div className={`w-[85%] sm:w-[45%] relative ${
                    isCurrent ? '' : isUnlocked ? 'opacity-70 hover:opacity-100 transition-opacity' : 'opacity-40'
                  }`}>
                    
                    {isCurrent && (
                      <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur opacity-30 animate-pulse" />
                    )}

                    <div className={`relative p-6 sm:p-8 rounded-3xl border backdrop-blur-md shadow-2xl ${
                      isUnlocked 
                        ? 'bg-slate-900/80 border-slate-700/50' 
                        : 'bg-slate-950/80 border-slate-800 border-dashed'
                    }`}>
                      
                      <div className="text-5xl sm:text-6xl mb-4 filter drop-shadow-lg">
                        {isUnlocked ? tier.icon : '❓'}
                      </div>
                      
                      <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">
                        Level {tier.level}
                      </h4>
                      
                      <h3 className={`text-2xl font-black mb-2 ${
                        isUnlocked ? 'text-white' : 'text-slate-600'
                      }`}>
                        {isUnlocked ? tier.title : '???'}
                      </h3>
                      
                      <p className={`text-sm font-medium leading-relaxed mb-4 ${
                        isUnlocked ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        {isUnlocked ? tier.subtitle : 'Something extraordinary awaits...'}
                      </p>

                      {isUnlocked && (
                        <div className="p-3 bg-slate-950/50 rounded-xl border border-white/5 flex gap-3 items-start">
                          <Sparkles className="text-amber-400 mt-0.5 shrink-0" size={16} />
                          <p className="text-xs font-medium text-slate-400 italic">
                            &quot;{tier.motivation}&quot;
                          </p>
                        </div>
                      )}

                      {/* Current Tier Progress UI */}
                      {isCurrent && nextTier && (
                        <div className="mt-6 pt-6 border-t border-slate-800">
                          <div className="flex justify-between items-end mb-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Journey to {nextTier.title}</span>
                            <span className="text-xs font-black text-indigo-400">{Math.round(xpProgress)}%</span>
                          </div>
                          
                          <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800 relative">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${xpProgress}%` }}
                              transition={{ duration: 1.5, ease: EasingCurves.apple }}
                              className={`absolute top-0 left-0 bottom-0 bg-gradient-to-r ${tier.color}`}
                            />
                          </div>
                          
                          <div className="mt-3 flex items-center justify-center gap-2 text-xs font-bold text-slate-400 bg-slate-950/50 py-2 px-3 rounded-lg">
                            <Target size={14} className="text-emerald-400" />
                            Only {xpRemaining.toLocaleString()} XP until your next evolution.
                          </div>
                        </div>
                      )}
                      
                      {!isUnlocked && (
                        <div className="absolute top-4 right-4">
                          <Lock size={16} className="text-slate-700" />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
