import { motion } from 'framer-motion';
import { EASE } from './motion';

export function Divider({ label, delay = 0, className }: { label: string; delay?: number; className?: string }) {
  return (
    <div className={`relative ${className ?? ''}`}>
      <motion.div
        className="absolute inset-0 flex items-center"
        style={{ transformOrigin: 'left' }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay, ease: EASE }}
      >
        <div className="w-full border-t border-line" />
      </motion.div>
      <div className="relative flex justify-center">
        <motion.span
          className="px-3 bg-canvas text-xs uppercase tracking-widest text-ink/35"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: delay + 0.15 }}
        >
          {label}
        </motion.span>
      </div>
    </div>
  );
}
