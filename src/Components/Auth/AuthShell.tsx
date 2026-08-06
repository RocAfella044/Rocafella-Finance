import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { FadeIn } from '../../lib/FadeIn';
import { EASE } from '../../lib/motion';

export function Brand({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="w-2 h-2 rounded-full bg-clay" />
      <span className="font-mono text-xs tracking-[0.3em] uppercase">Rocafella Finance</span>
    </div>
  );
}

export function AuthShell({
  title,
  subtitle,
  headline,
  blurb,
  children,
}: {
  title: string;
  subtitle: string;
  headline: ReactNode;
  blurb: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-canvas">
      <div className="hidden lg:flex lg:w-[44%] relative bg-ink overflow-hidden">
        <StitchLine />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <FadeIn delay={0.1}>
            <Brand className="text-canvas/70" />
          </FadeIn>

          <FadeIn delay={0.15}>
            <h1 className="font-serif text-4xl xl:text-5xl leading-[1.1] text-canvas">{headline}</h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: EASE }}
              className="mt-5 text-canvas/60 text-sm max-w-xs leading-relaxed"
            >
              {blurb}
            </motion.p>
          </FadeIn>

          <FadeIn delay={0.45} className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.2em] text-canvas/40">
            <span className="w-8 h-px bg-canvas/20" />
            <span>Est. 2026</span>
          </FadeIn>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <FadeIn className="mb-6 lg:hidden">
            <Brand className="text-ink/50" />
          </FadeIn>

          <FadeIn>
            <h2 className="font-serif text-3xl text-ink">{title}</h2>
            <p className="mt-2 text-sm text-ink/50">{subtitle}</p>
          </FadeIn>

          {children}
        </div>
      </div>
    </div>
  );
}

function StitchLine() {
  return (
    <svg
      className="absolute right-0 top-0 h-full w-24 opacity-40"
      viewBox="0 0 100 800"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <motion.path
        d="M 50 0 L 50 800"
        stroke="currentColor"
        className="text-canvas"
        strokeWidth="1.5"
        strokeDasharray="10 8"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: EASE }}
      />
    </svg>
  );
}
