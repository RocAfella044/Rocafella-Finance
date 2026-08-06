import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { FadeIn } from '../../lib/FadeIn';

export function FloatingField({
  id,
  type,
  label,
  value,
  onChange,
  icon,
  trailing,
  error,
  autoComplete,
}: {
  id: string;
  type: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  icon: ReactNode;
  trailing?: ReactNode;
  error?: string;
  autoComplete?: string;
}) {
  const [focused, setFocused] = useState(false);
  const floated = focused || value.length > 0;

  return (
    <div>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35">{icon}</span>
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete={autoComplete}
          className={`peer w-full pl-11 pr-11 pt-4 pb-2 rounded-lg border bg-sand/30 text-sm text-ink outline-none transition-colors
            ${error ? 'border-clay' : focused ? 'border-ink' : 'border-line'}`}
        />
        <label
          htmlFor={id}
          className={`absolute left-11 transition-all duration-200 pointer-events-none text-ink/40
            ${floated ? 'top-2 text-[11px]' : 'top-1/2 -translate-y-1/2 text-sm'}`}
        >
          {label}
        </label>
        {trailing && <span className="absolute right-3.5 top-1/2 -translate-y-1/2">{trailing}</span>}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-1.5 text-xs text-clay"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export function IconSwap({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="text-ink/35 hover:text-ink/70 transition-colors"
      tabIndex={-1}
      aria-label={show ? 'Hide password' : 'Show password'}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={show ? 'on' : 'off'}
          initial={{ opacity: 0, rotate: -8 }}
          animate={{ opacity: 1, rotate: 0 }}
          exit={{ opacity: 0, rotate: 8 }}
          transition={{ duration: 0.15 }}
          className="flex"
        >
          {show ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

export function SubmitError({ message }: { message?: string }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="flex items-start gap-2 rounded-lg bg-clay/10 border border-clay/30 px-3.5 py-3 text-sm text-clay mt-5"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function SubmitButton({ loading, label, loadingLabel }: { loading: boolean; label: string; loadingLabel: string }) {
  return (
    <motion.button
      type="submit"
      disabled={loading}
      whileHover={loading ? undefined : { scale: 1.01 }}
      whileTap={loading ? undefined : { scale: 0.99 }}
      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg bg-ink text-canvas text-sm font-medium tracking-wide transition-colors hover:bg-ink/90 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <AnimatePresence mode="wait" initial={false}>
        {loading ? (
          <motion.span
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            {loadingLabel}
          </motion.span>
        ) : (
          <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

function passwordStrength(password: string): { score: number; label: string } {
  if (!password) return { score: 0, label: '' };
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];
  return { score, label: labels[Math.max(0, score - 1)] ?? 'Weak' };
}

export function StrengthBar({ password, error }: { password: string; error?: string }) {
  if (!password || error) return null;
  const strength = passwordStrength(password);
  const color = strength.score <= 1 ? 'bg-clay' : strength.score === 2 ? 'bg-sand' : 'bg-moss';
  return (
    <div className="flex items-center gap-2 mt-2">
      <div className="flex-1 h-1 rounded-full bg-line overflow-hidden">
        <motion.div
          className={`h-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${(strength.score / 4) * 100}%` }}
          transition={{ duration: 0.25 }}
        />
      </div>
      <span className="text-[11px] text-ink/40 w-10 text-right">{strength.label}</span>
    </div>
  );
}

export function SocialButtons({ delay = 0 }: { delay?: number }) {
  return (
    <FadeIn delay={delay} className="mt-6 grid grid-cols-2 gap-3">
      <SocialButton label="Google" icon={<GoogleMark />} />
      <SocialButton label="GitHub" icon={<GithubMark />} />
    </FadeIn>
  );
}

function SocialButton({ label, icon }: { label: string; icon: ReactNode }) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-line bg-canvas text-sm text-ink/70 hover:border-ink/30 transition-colors"
    >
      {icon}
      {label}
    </motion.button>
  );
}

function GoogleMark() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function GithubMark() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}
