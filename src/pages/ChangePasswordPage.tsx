import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, Loader2, AlertCircle, Check, ArrowLeft, Eye, EyeOff, Info, TriangleAlert } from 'lucide-react';
import DashboardLayout from '../Components/Layout/DashboardLayout';
import { useProfileStore } from '../store/profileStore';
import { StrengthBar } from '../Components/Auth/fields';
import { FadeIn } from '../lib/FadeIn';
import { EASE } from '../lib/motion';

type Errors = Partial<Record<'current' | 'next' | 'confirm', string>>;

const MIN_PASSWORD = 6;

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const saving = useProfileStore((s) => s.saving);
  const error = useProfileStore((s) => s.error);

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [shown, setShown] = useState<Record<string, boolean>>({});
  const [capsLock, setCapsLock] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [saved, setSaved] = useState(false);

  const toggleShow = (id: string) => setShown((prev) => ({ ...prev, [id]: !prev[id] }));

  const validate = (): Errors => {
    const newErrors: Errors = {};
    if (!current) {
      newErrors.current = 'Enter your current password';
    }
    if (!next) {
      newErrors.next = 'Enter a new password';
    } else if (next.length < MIN_PASSWORD) {
      newErrors.next = `Password must be at least ${MIN_PASSWORD} characters`;
    }
    if (!confirm) {
      newErrors.confirm = 'Re-enter your new password';
    } else if (next !== confirm) {
      newErrors.confirm = 'Passwords do not match';
    }
    return newErrors;
  };

  const valid = current.length > 0 && next.length >= MIN_PASSWORD && next === confirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    setSaved(false);
    try {
      if (!valid) return;
      await useProfileStore.getState().changePassword(current, next);
      setCurrent('');
      setNext('');
      setConfirm('');
      setErrors({});
      setSaved(true);
      setTimeout(() => navigate('/profile', { replace: true }), 1500);
    } catch {
      /* error shown via store */
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.getModifierState('CapsLock')) setCapsLock(true);
    else setCapsLock(false);
  };

  return (
    <DashboardLayout title="Change Password">
      <div className="max-w-xl mx-auto">
        <FadeIn>
          <motion.button
            onClick={() => navigate('/profile')}
            whileHover={{ x: -2 }}
            className="mb-6 flex items-center gap-1.5 text-sm text-ink/50 hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to profile
          </motion.button>
        </FadeIn>

        <FadeIn className="rounded-2xl border border-line bg-canvas overflow-hidden">
          <div className="bg-ink px-6 py-6">
            <div className="flex items-center gap-3">
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="w-10 h-10 rounded-xl bg-clay/20 border border-clay/30 flex items-center justify-center"
              >
                <KeyRound className="w-5 h-5 text-clay" />
              </motion.span>
              <div>
                <h2 className="font-serif text-xl text-canvas">Change Password</h2>
                <p className="text-xs text-canvas/60 mt-0.5">
                  Update your account password
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-clay/10 border border-clay/30 px-3.5 py-3 text-sm text-clay mb-5">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {saved && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-lg bg-moss/10 border border-moss/30 px-3.5 py-3 text-sm text-moss mb-5"
              >
                <Check className="w-4 h-4 shrink-0" />
                Password updated. Redirecting to your profile&hellip;
              </motion.div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <Field
                id="current-password"
                label="Current password"
                value={current}
                onChange={setCurrent}
                error={errors.current}
                show={Boolean(shown['current-password'])}
                onToggleShow={() => toggleShow('current-password')}
                autoComplete="current-password"
                onKeyDown={handleKeyDown}
              />

              <div>
                <Field
                  id="new-password"
                  label="New password"
                  value={next}
                  onChange={setNext}
                  error={errors.next}
                  show={Boolean(shown['new-password'])}
                  onToggleShow={() => toggleShow('new-password')}
                  autoComplete="new-password"
                  onKeyDown={handleKeyDown}
                />
                <AnimatePresence>
                  {!errors.next && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-1.5 text-[11px] text-ink/45 mt-2"
                    >
                      <Info className="w-3 h-3 shrink-0" />
                      At least {MIN_PASSWORD} characters
                    </motion.p>
                  )}
                </AnimatePresence>
                {capsLock && !errors.next && next.length > 0 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-1.5 text-[11px] text-sand mt-1.5"
                  >
                    <TriangleAlert className="w-3 h-3 shrink-0" />
                    Caps Lock is on
                  </motion.p>
                )}
                <StrengthBar password={next} error={errors.next} />
              </div>

              <Field
                id="confirm-new-password"
                label="Retype new password"
                value={confirm}
                onChange={setConfirm}
                error={errors.confirm}
                show={Boolean(shown['confirm-new-password'])}
                onToggleShow={() => toggleShow('confirm-new-password')}
                autoComplete="new-password"
                onKeyDown={handleKeyDown}
              />

              <motion.button
                type="submit"
                disabled={saving || saved || !valid}
                whileHover={valid && !saving && !saved ? { scale: 1.01 } : undefined}
                whileTap={valid && !saving && !saved ? { scale: 0.99 } : undefined}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg bg-ink text-canvas text-sm font-medium tracking-wide transition-colors hover:bg-ink/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Changing password
                  </>
                ) : saved ? (
                  <>
                    <Check className="w-4 h-4" />
                    Password updated
                  </>
                ) : !valid ? (
                  'Fill in all fields to continue'
                ) : (
                  'Change password'
                )}
              </motion.button>
            </form>
          </div>
        </FadeIn>
      </div>
    </DashboardLayout>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  onToggleShow,
  show,
  autoComplete,
  onKeyDown,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  onToggleShow: () => void;
  show: boolean;
  autoComplete: string;
  onKeyDown: (e: React.KeyboardEvent) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-mono uppercase tracking-wider text-ink/40 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <KeyRound className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${error ? 'text-clay' : 'text-ink/35'}`} />
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
          }}
          onKeyDown={onKeyDown}
          autoComplete={autoComplete}
          className={`w-full pl-9 pr-11 py-3 rounded-lg border bg-sand/30 text-sm text-ink outline-none transition-colors focus:bg-canvas ${
            error ? 'border-clay' : 'border-line focus:border-ink'
          }`}
        />
        <button
          type="button"
          onClick={onToggleShow}
          tabIndex={-1}
          aria-label={show ? 'Hide password' : 'Show password'}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/35 hover:text-ink/70 transition-colors"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
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
