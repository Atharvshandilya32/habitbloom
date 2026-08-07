'use client';
import React from 'react';
import { motion } from 'framer-motion';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export const getTimeOfDay = (): TimeOfDay => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 20) return 'evening';
  return 'night';
};

const Fireflies = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-yellow-100 rounded-full shadow-[0_0_6px_2px_rgba(253,224,71,0.4)]"
          initial={{ 
            opacity: 0, 
            x: `${Math.random() * 100}%`, 
            y: `${30 + Math.random() * 70}%` // mostly in the lower garden area
          }}
          animate={{
            opacity: [0, 0.6, 0],
            x: `${Math.random() * 100}%`,
            y: `${30 + Math.random() * 70}%`,
          }}
          transition={{
            duration: Math.random() * 8 + 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 4
          }}
        />
      ))}
    </div>
  );
};

const Stars = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(25)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute bg-indigo-100 rounded-full"
          style={{
            width: Math.random() * 2 + 0.5 + 'px',
            height: Math.random() * 2 + 0.5 + 'px',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 60}%`, // stars mostly in upper sky
          }}
          animate={{
            opacity: [0.1, 0.7, 0.1]
          }}
          transition={{
            duration: Math.random() * 4 + 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 3
          }}
        />
      ))}
    </div>
  );
};

const Birds = () => {
   return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-slate-700/20"
          initial={{ x: '-10vw', y: `${5 + Math.random() * 20}vh` }}
          animate={{ x: '110vw', y: `${Math.random() * 30}vh` }}
          transition={{
            duration: Math.random() * 20 + 20,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 15
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12h0c2-3 5-3 7 0h0c2-3 5-3 7 0" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
};

interface GardenEnvironmentProps {
  timeOfDay: TimeOfDay;
}

export const GardenEnvironment: React.FC<GardenEnvironmentProps> = ({ timeOfDay }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-3xl"
    >
      {timeOfDay === 'morning' && <Birds />}
      {timeOfDay === 'night' && (
        <>
          <Stars />
          <Fireflies />
        </>
      )}
    </motion.div>
  );
};

export const getEnvironmentClasses = (timeOfDay: TimeOfDay): { bg: string; text: string; cardBg: string; titleText: string; plantBg: string; textMuted: string; plantBorder: string; } => {
  switch (timeOfDay) {
    case 'morning':
      return {
        bg: 'bg-gradient-to-br from-amber-50 via-sky-50 to-emerald-50 border-amber-100',
        text: 'text-amber-900',
        titleText: 'text-slate-900',
        cardBg: 'bg-white/80 backdrop-blur-sm border-white/50',
        plantBg: 'bg-white hover:border-amber-300',
        plantBorder: 'border-slate-200',
        textMuted: 'text-slate-600'
      };
    case 'afternoon':
      return {
        bg: 'bg-gradient-to-br from-sky-50 via-teal-50 to-emerald-50 border-emerald-100',
        text: 'text-teal-900',
        titleText: 'text-slate-900',
        cardBg: 'bg-white/90 backdrop-blur-sm border-white/60',
        plantBg: 'bg-white hover:border-emerald-300',
        plantBorder: 'border-slate-200',
        textMuted: 'text-slate-600'
      };
    case 'evening':
      return {
        bg: 'bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 border-orange-100',
        text: 'text-orange-900',
        titleText: 'text-slate-900',
        cardBg: 'bg-white/80 backdrop-blur-sm border-white/50',
        plantBg: 'bg-white hover:border-orange-300',
        plantBorder: 'border-slate-200',
        textMuted: 'text-slate-600'
      };
    case 'night':
      return {
        bg: 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border-indigo-900',
        text: 'text-indigo-200',
        titleText: 'text-slate-100',
        cardBg: 'bg-slate-800/60 backdrop-blur-md border-indigo-500/20',
        plantBg: 'bg-slate-800/80 hover:border-indigo-400',
        plantBorder: 'border-indigo-500/30',
        textMuted: 'text-slate-400'
      };
    default:
      return {
        bg: 'bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white border-emerald-100',
        text: 'text-slate-700',
        titleText: 'text-slate-900',
        cardBg: 'bg-white',
        plantBg: 'bg-white hover:border-emerald-300',
        plantBorder: 'border-slate-200',
        textMuted: 'text-slate-600'
      };
  }
};
