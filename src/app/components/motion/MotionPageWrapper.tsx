'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { pageVariants } from '../../../../lib/motion/motionTokens';

interface MotionPageWrapperProps {
  children: React.ReactNode;
  className?: string;
  keyId?: string;
}

export default function MotionPageWrapper({ children, className = '', keyId }: MotionPageWrapperProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      key={keyId}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
}
