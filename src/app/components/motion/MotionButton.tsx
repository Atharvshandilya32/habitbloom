'use client';

import React from 'react';

import { motion, useReducedMotion } from 'framer-motion';
import { buttonPressVariants } from '../../../../lib/motion/motionTokens';

type HTMLButtonProps = Omit<React.ComponentPropsWithoutRef<'button'>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'>;

export interface MotionButtonProps extends HTMLButtonProps {
  children: React.ReactNode;
}



export default function MotionButton({
  children,
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  ...props
}: MotionButtonProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <button
        type={type}
        disabled={disabled}
        onClick={onClick}
        className={className}
      >
        {children}
      </button>
    );
  }

  return (
    <motion.button
      type={type}
      variants={buttonPressVariants}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      disabled={disabled}
      onClick={onClick}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
}

