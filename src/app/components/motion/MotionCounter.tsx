'use client';

import React, { useEffect } from 'react';
import { useMotionValue, useTransform, animate, motion, useReducedMotion } from 'framer-motion';

interface MotionCounterProps {
  value: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export default function MotionCounter({
  value,
  duration = 0.8,
  suffix = '',
  prefix = '',
  className = '',
}: MotionCounterProps) {
  const shouldReduceMotion = useReducedMotion();
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    if (shouldReduceMotion) {
      count.set(value);
      return;
    }

    const controls = animate(count, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
    });

    return () => controls.stop();
  }, [value, duration, count, shouldReduceMotion]);

  if (shouldReduceMotion) {
    return (
      <span className={className}>
        {prefix}{value}{suffix}
      </span>
    );
  }

  return (
    <span className={className}>
      {prefix}
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}
