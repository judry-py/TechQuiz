'use client';

/**
 * Enveloppe de transition de page.
 * Anime l'entrée avec un fade + slide depuis le bas.
 * Se réduit automatiquement si reduce_motion est actif.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { useAppReducedMotion } from './useAppReducedMotion';
import { fadeSlideUp, reducedVariants } from './variants';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className = '' }: PageTransitionProps) {
  const shouldReduce = useAppReducedMotion();
  const variants = shouldReduce ? reducedVariants : fadeSlideUp;

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
}
