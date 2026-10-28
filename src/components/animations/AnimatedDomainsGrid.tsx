'use client';

/**
 * Grid animé des cartes de domaines avec stagger.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { useAppReducedMotion } from '@/components/animations/useAppReducedMotion';
import { staggerContainer, staggerItem, reducedVariants } from '@/components/animations/variants';

interface AnimatedDomainsGridProps {
  children: React.ReactNode;
}

export function AnimatedDomainsGrid({ children }: AnimatedDomainsGridProps) {
  const shouldReduce = useAppReducedMotion();

  if (shouldReduce) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={reducedVariants}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8"
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8"
    >
      {children}
    </motion.div>
  );
}

interface AnimatedDomainCardProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedDomainCard({ children, className = '' }: AnimatedDomainCardProps) {
  const shouldReduce = useAppReducedMotion();
  const variants = shouldReduce ? reducedVariants : staggerItem;

  return (
    <motion.div variants={variants} className={className}>
      {children}
    </motion.div>
  );
}
