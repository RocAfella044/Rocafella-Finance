import { useReducedMotion } from 'framer-motion';

const EASE = [0.16, 1, 0.3, 1] as const;

export function useReveal(delay = 0, y = 14) {
  const reduced = useReducedMotion();
  if (reduced) return {};
  return {
    initial: { opacity: 0, y },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, delay, ease: EASE },
  };
}
