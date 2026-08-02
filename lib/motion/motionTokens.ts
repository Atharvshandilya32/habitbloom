import { Variants } from 'framer-motion';

/**
 * World-Class Motion Tokens for HabitBloom
 * Inspired by Apple, Linear, and Raycast HIG.
 */

// Timing Constants (in seconds)
export class MotionDurations {
  static readonly FAST = 0.15;
  static readonly NORMAL = 0.22;
  static readonly PAGE = 0.28;
  static readonly MODAL = 0.25;
  static readonly SLOW = 0.35;
}


// Easing Constants
export const EasingCurves = {
  // Apple / Linear standard smooth ease out curve
  apple: [0.16, 1, 0.3, 1] as const,
  easeOut: [0, 0, 0.2, 1] as const,
  easeInOut: [0.4, 0, 0.2, 1] as const,
  bounceMilestone: [0.34, 1.56, 0.64, 1] as const,
};

// Spring Animations Config
export const SpringConfigs = {
  subtle: { type: 'spring', stiffness: 400, damping: 30 },
  tactile: { type: 'spring', stiffness: 500, damping: 25 },
  milestone: { type: 'spring', stiffness: 320, damping: 18 },
  gentle: { type: 'spring', stiffness: 250, damping: 25 },
} as const;

// Motion Variants
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 6,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: MotionDurations.PAGE,
      ease: EasingCurves.apple,
    },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: {
      duration: MotionDurations.FAST,
      ease: EasingCurves.easeOut,
    },
  },
};

export const modalVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.97,
    y: 8,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: MotionDurations.MODAL,
      ease: EasingCurves.apple,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 6,
    transition: {
      duration: MotionDurations.FAST,
      ease: EasingCurves.easeOut,
    },
  },
};

export const backdropVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: MotionDurations.NORMAL } },
  exit: { opacity: 0, transition: { duration: MotionDurations.FAST } },
};

export const cardHoverVariants: Variants = {
  rest: {
    scale: 1,
    y: 0,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
  },
  hover: {
    scale: 1.008,
    y: -2,
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
    transition: {
      duration: MotionDurations.NORMAL,
      ease: EasingCurves.apple,
    },
  },
  tap: {
    scale: 0.985,
    y: 0,
    transition: SpringConfigs.tactile,
  },
};

export const buttonPressVariants: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.97 },
};

export const listContainerVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02,
    },
  },
};

export const listItemVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: MotionDurations.NORMAL,
      ease: EasingCurves.apple,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: MotionDurations.FAST,
    },
  },
};
