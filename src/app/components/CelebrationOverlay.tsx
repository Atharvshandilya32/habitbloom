'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fireConfetti } from '../../../lib/confetti';
import { SpringConfigs } from '../../../lib/motion/motionTokens';
import { X } from 'lucide-react';

interface CelebrationOverlayProps {
  isOpen: boolean;
  title: string;
  description: string;
  icon: string;
  onClose: () => void;
}

export default function CelebrationOverlay({ isOpen, title, description, icon, onClose }: CelebrationOverlayProps) {
  const [clicks, setClicks] = useState(0);
  const clicksNeeded = 3;
  const isBloomed = clicks >= clicksNeeded;

  useEffect(() => {
    if (isOpen) {
      setClicks(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isBloomed && isOpen) {
      fireConfetti({
        particleCount: 200,
        spread: 120,
        origin: { y: 0.5 },
        colors: ['#f59e0b', '#ec4899', '#8b5cf6', '#10b981', '#3b82f6'],
      });
      setTimeout(() => {
        fireConfetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });
      }, 600);
    }
  }, [isBloomed, isOpen]);

  const handleSeedClick = () => {
    if (clicks < clicksNeeded) {
      setClicks(prev => prev + 1);
    }
  };

  const getSeedScale = () => {
    if (clicks === 0) return 0.6;
    if (clicks === 1) return 1.0;
    if (clicks === 2) return 1.5;
    return 2.5; // bloomed
  };

  const getSeedEmoji = () => {
    if (clicks === 0) return '🌱';
    if (clicks === 1) return '🌿';
    if (clicks === 2) return '🌸';
    return icon;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-xl"
          />

          {!isBloomed ? (
            <div className="relative z-10 flex flex-col items-center">
              <motion.h3 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-white text-2xl font-black mb-12 tracking-tight drop-shadow-md text-center"
              >
                A new milestone is ready to bloom...
              </motion.h3>
              <motion.button
                onClick={handleSeedClick}
                animate={{ scale: getSeedScale() }}
                whileHover={{ scale: getSeedScale() * 1.1 }}
                whileTap={{ scale: getSeedScale() * 0.9 }}
                transition={SpringConfigs.milestone}
                className="text-8xl filter drop-shadow-[0_0_30px_rgba(255,255,255,0.4)] cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400 rounded-full"
              >
                {getSeedEmoji()}
              </motion.button>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-slate-300 mt-16 font-bold text-sm tracking-widest uppercase"
              >
                Click to nurture ({clicks}/{clicksNeeded})
              </motion.p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={SpringConfigs.milestone}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-[0_0_60px_rgba(16,185,129,0.2)] border border-emerald-100 flex flex-col items-center text-center overflow-hidden z-10"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-white opacity-80 pointer-events-none" />
              
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors z-10"
              >
                <X size={20} />
              </button>

              <motion.div 
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, ...SpringConfigs.milestone }}
                className="text-8xl mb-6 relative z-10 drop-shadow-md"
              >
                {icon}
              </motion.div>

              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl sm:text-4xl font-black text-slate-900 mb-4 tracking-tight relative z-10"
              >
                {title}
              </motion.h2>

              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-slate-600 font-medium text-lg leading-relaxed max-w-sm mx-auto relative z-10"
              >
                {description}
              </motion.p>

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                onClick={onClose}
                className="mt-10 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold shadow-xl shadow-emerald-600/30 transition-all hover:scale-105 active:scale-95 relative z-10 text-sm tracking-wide"
              >
                Claim Milestone
              </motion.button>
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
}
