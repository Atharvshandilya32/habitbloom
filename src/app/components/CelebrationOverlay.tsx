'use client';

import React, { useEffect } from 'react';
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
  useEffect(() => {
    if (isOpen) {
      fireConfetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#ec4899', '#8b5cf6', '#10b981', '#3b82f6'],
      });
      // A gentle follow-up burst
      setTimeout(() => {
        fireConfetti({
          particleCount: 50,
          spread: 80,
          origin: { y: 0.6 },
        });
      }, 400);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={SpringConfigs.milestone}
            className="relative w-full max-w-lg bg-white rounded-[2rem] p-8 sm:p-12 shadow-2xl border border-slate-100 flex flex-col items-center text-center overflow-hidden"
          >
            {/* Background radiant gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-rose-50 to-indigo-50 opacity-50 pointer-events-none" />
            
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors z-10"
            >
              <X size={20} />
            </button>

            <motion.div 
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, ...SpringConfigs.milestone }}
              className="text-8xl mb-6 relative z-10 drop-shadow-sm"
            >
              {icon}
            </motion.div>

            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl sm:text-4xl font-black text-slate-900 mb-4 tracking-tight relative z-10"
            >
              {title}
            </motion.h2>

            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-slate-600 font-medium text-lg leading-relaxed max-w-sm mx-auto relative z-10"
            >
              {description}
            </motion.p>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              onClick={onClose}
              className="mt-10 px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-bold shadow-xl shadow-slate-900/20 transition-all hover:scale-105 active:scale-95 relative z-10"
            >
              Continue Journey
            </motion.button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
