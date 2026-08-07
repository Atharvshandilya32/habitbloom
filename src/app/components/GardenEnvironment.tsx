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

const FallingLeaves = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`leaf-${i}`}
          className="absolute w-2 h-2 md:w-3 md:h-3 rounded-full opacity-60 bg-amber-500/30"
          style={{
            borderTopRightRadius: 0,
            borderBottomLeftRadius: 0,
          }}
          initial={{ x: `${Math.random() * 100}vw`, y: '-5vh', rotate: 0 }}
          animate={{
            x: `${Math.random() * 100}vw`,
            y: '105vh',
            rotate: 360,
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 5
          }}
        />
      ))}
    </div>
  );
};

const AmbientRays = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none bg-gradient-to-tr from-amber-500/5 to-transparent mix-blend-overlay" />
  );
};

const Butterflies = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(2)].map((_, i) => (
        <motion.div
          key={`butterfly-${i}`}
          className="absolute text-rose-300"
          initial={{ x: `${Math.random() * 100}vw`, y: `${70 + Math.random() * 30}vh` }}
          animate={{ 
            x: [`${Math.random() * 100}vw`, `${Math.random() * 100}vw`, `${Math.random() * 100}vw`], 
            y: [`${70 + Math.random() * 30}vh`, `${30 + Math.random() * 30}vh`, `${70 + Math.random() * 30}vh`] 
          }}
          transition={{
            duration: Math.random() * 10 + 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2c-.6 0-1 .4-1 1v18c0 .6.4 1 1 1s1-.4 1-1V3c0-.6-.4-1-1-1zM4 6c-1.1 0-2 .9-2 2 0 1.1.9 2 2 2 1.1 0 2-.9 2-2 0-1.1-.9-2-2-2zm0 8c-1.1 0-2 .9-2 2 0 1.1.9 2 2 2 1.1 0 2-.9 2-2 0-1.1-.9-2-2-2zm16-8c-1.1 0-2 .9-2 2 0 1.1.9 2 2 2 1.1 0 2-.9 2-2 0-1.1-.9-2-2-2zm0 8c-1.1 0-2 .9-2 2 0 1.1.9 2 2 2 1.1 0 2-.9 2-2 0-1.1-.9-2-2-2z"/>
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
      {timeOfDay === 'morning' && (
        <>
          <AmbientRays />
          <Birds />
          <Butterflies />
        </>
      )}
      {timeOfDay === 'afternoon' && (
        <>
          <FallingLeaves />
          <Butterflies />
        </>
      )}
      {timeOfDay === 'evening' && (
        <>
          <AmbientRays />
          <FallingLeaves />
        </>
      )}
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
        bg: 'bg-gradient-to-br from-amber-50/80 via-emerald-50/80 to-teal-50/80 border-emerald-100',
        text: 'text-emerald-900',
        titleText: 'text-slate-900',
        cardBg: 'bg-white/80 backdrop-blur-sm border-emerald-100',
        plantBg: 'bg-white/90 hover:border-emerald-300',
        plantBorder: 'border-emerald-100',
        textMuted: 'text-slate-600'
      };
    case 'afternoon':
      return {
        bg: 'bg-gradient-to-br from-emerald-50/80 to-teal-50/80 border-emerald-100',
        text: 'text-emerald-900',
        titleText: 'text-slate-900',
        cardBg: 'bg-white/80 backdrop-blur-sm border-emerald-100',
        plantBg: 'bg-white/90 hover:border-emerald-300',
        plantBorder: 'border-emerald-100',
        textMuted: 'text-slate-600'
      };
    case 'evening':
      return {
        bg: 'bg-gradient-to-br from-rose-50/80 via-emerald-50/80 to-teal-50/80 border-emerald-100',
        text: 'text-emerald-900',
        titleText: 'text-slate-900',
        cardBg: 'bg-white/80 backdrop-blur-sm border-emerald-100',
        plantBg: 'bg-white/90 hover:border-emerald-300',
        plantBorder: 'border-emerald-100',
        textMuted: 'text-slate-600'
      };
    case 'night':
      return {
        bg: 'bg-gradient-to-br from-sky-100/80 via-teal-100/80 to-emerald-50/80 border-teal-200',
        text: 'text-teal-900',
        titleText: 'text-slate-900',
        cardBg: 'bg-white/80 backdrop-blur-sm border-teal-100',
        plantBg: 'bg-white/90 hover:border-teal-300',
        plantBorder: 'border-teal-200',
        textMuted: 'text-slate-600'
      };
    default:
      return {
        bg: 'bg-gradient-to-br from-emerald-50/80 to-teal-50/80 border-emerald-100',
        text: 'text-emerald-900',
        titleText: 'text-slate-900',
        cardBg: 'bg-white/80 backdrop-blur-sm border-emerald-100',
        plantBg: 'bg-white/90 hover:border-emerald-300',
        plantBorder: 'border-emerald-100',
        textMuted: 'text-slate-600'
      };
  }
};
