'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cardHoverVariants } from '../../../../lib/motion/motionTokens';

interface MotionCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

export default function MotionCard({
  children,
  className = '',
  onClick,
  hoverEffect = true,
}: MotionCardProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion || !hoverEffect) {
    return (
      <div onClick={onClick} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      variants={cardHoverVariants}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.div>
  );
}
