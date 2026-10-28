'use client';

/**
 * Hook personnalisé qui combine :
 * - prefers-reduced-motion (OS/navigateur)
 * - La préférence utilisateur stockée en DB (profiles.reduce_motion)
 *
 * Usage :
 *   const shouldReduce = useAppReducedMotion();
 *   const variants = shouldReduce ? reducedVariants : fadeSlideUp;
 */
import { useReducedMotion } from 'framer-motion';
import { useReduceMotionPreference } from './ReduceMotionContext';

export function useAppReducedMotion(): boolean {
  const systemReduced = useReducedMotion(); // OS/browser preference
  const userReduced = useReduceMotionPreference(); // DB preference
  return (systemReduced ?? false) || userReduced;
}
