'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fireConfetti } from '../../../lib/confetti';
import { Habit, HabitLog } from '../../../lib/habitTypes';
import { generateHabitWrapped } from '../../../lib/wrappedUtils';
import { backdropVariants, SpringConfigs, EasingCurves } from '../../../lib/motion/motionTokens';

interface HabitWrappedModalProps {
  isOpen: boolean;
  onClose: () => void;
  habits: Habit[];
  logs?: HabitLog;
  logsObj?: HabitLog;
  xp?: number;
  year?: number;
  month?: number;
}

const EMPTY_LOGS = {};

export const HabitWrappedModal: React.FC<HabitWrappedModalProps> = ({
  isOpen,
  onClose,
  habits,
  logs,
  logsObj,
  year = new Date().getFullYear(),
  month = new Date().getMonth() + 1,
}) => {
  const activeLogs = logs || logsObj || EMPTY_LOGS;
  const [currentSlideIdx, setCurrentSlideIdx] = useState<number>(0);
  const wrapped = useMemo(() => {
    return generateHabitWrapped(habits, activeLogs, year, month);
  }, [habits, activeLogs, year, month]);
  const slides = wrapped.slides;

  useEffect(() => {
    if (isOpen) {
      setCurrentSlideIdx(0);
      fireConfetti({
        particleCount: 50,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentSlide = slides[currentSlideIdx] || slides[0];

  const handleNext = () => {
    if (currentSlideIdx < slides.length - 1) {
      setCurrentSlideIdx((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentSlideIdx > 0) {
      setCurrentSlideIdx((prev) => prev - 1);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        variants={backdropVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-2xl"
      >
        {/* Main Wrapped Card Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.3, ease: EasingCurves.apple }}
          className={`relative w-full max-w-lg aspect-[9/16] sm:aspect-[3/4] rounded-3xl p-8 bg-gradient-to-br ${currentSlide.gradient} shadow-2xl flex flex-col justify-between overflow-hidden text-white border border-white/20`}
        >
          {/* Top Story Progress Bars */}
          <div className="flex items-center gap-1.5 z-20">
            {slides.map((s, idx) => (
              <div key={s.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-white transition-all duration-300 ${
                    idx <= currentSlideIdx ? 'w-full' : 'w-0'
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Top Header Controls */}
          <div className="flex items-center justify-between z-20 pt-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-white/80">
              {wrapped.periodLabel} Wrapped
            </span>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-md flex items-center justify-center text-sm font-bold text-white transition-all"
            >
              ✕
            </button>
          </div>

          {/* Slide Content Area */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide.id}
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.96 }}
              transition={{ duration: 0.35, ease: EasingCurves.apple }}
              className="my-auto space-y-6 text-center z-10"
            >
              {currentSlide.emoji && (
                <motion.div
                  initial={{ scale: 0.5, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={SpringConfigs.milestone}
                  className="text-7xl filter drop-shadow-xl inline-block"
                >
                  {currentSlide.emoji}
                </motion.div>
              )}

              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {currentSlide.title}
                </h2>
                <p className="text-sm font-medium text-white/80 max-w-xs mx-auto">
                  {currentSlide.subtitle}
                </p>
              </div>

              {currentSlide.statNumber !== undefined && (
                <div className="py-2 space-y-1">
                  <div className="text-4xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">
                    {currentSlide.statNumber}
                  </div>
                  {currentSlide.statLabel && (
                    <div className="text-xs font-semibold text-white/70 uppercase tracking-wider">
                      {currentSlide.statLabel}
                    </div>
                  )}
                </div>
              )}

              {currentSlide.details && currentSlide.details.length > 0 && (
                <div className="pt-2 space-y-1.5 max-w-xs mx-auto text-xs font-medium text-white/90 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                  {currentSlide.details.map((d, idx) => (
                    <div key={idx}>• {d}</div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Bottom Tap Navigation Overlay */}
          <div className="absolute inset-0 flex z-10 pointer-events-auto">
            <div className="w-1/2 h-full cursor-pointer" onClick={handlePrev} />
            <div className="w-1/2 h-full cursor-pointer" onClick={handleNext} />
          </div>

          {/* Bottom Action Footer */}
          <div className="flex items-center justify-between z-20 pt-4">
            <span className="text-xs font-semibold text-white/60">Tap left/right to navigate</span>
            <button
              onClick={handleNext}
              className="px-5 py-2.5 rounded-full bg-white text-slate-950 font-black text-xs hover:bg-white/90 transition-all shadow-xl"
            >
              {currentSlideIdx === slides.length - 1 ? 'Finish Wrapped ✨' : 'Next →'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default HabitWrappedModal;

