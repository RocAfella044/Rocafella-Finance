import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useReveal } from './useReveal';

export function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div className={className} {...useReveal(delay)}>
      {children}
    </motion.div>
  );
}
