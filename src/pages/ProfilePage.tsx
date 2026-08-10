import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BadgeCheck,
  Calendar,
  Check,
  Copy,
  CreditCard,
  KeyRound, Loader2, Shield, AlertCircle, RefreshCw, Clock,
} from 'lucide-react';
import DashboardLayout from '../Components/Layout/DashboardLayout';
import { useProfileStore } from '../store/profileStore';
import { FadeIn } from '../lib/FadeIn';
import { EASE } from '../lib/motion';

const roleColor: Record<string, string> = {
  admin: 'text-clay bg-clay/10',
  client: 'text-moss bg-moss/10',
};

const PASSWORD_LOCK_MS = 7 * 24 * 60 * 60 * 1000;

export default function ProfilePage() {
  const profile = useProfileStore((s) => s.profile);
  const counts = useProfileStore((s) => s.counts);
  const loading = useProfileStore((s) => s.loading);
  const saving = useProfileStore((s) => s.saving);
  const error = useProfileStore((s) => s.error);
  const fetchProfile = useProfileStore((s) => s.fetchProfile);

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);

  const initials = useMemo(() => {
    if (!profile) return 'U';
    return (profile.fullName || profile.email)
      .split(/\s+/)
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }, [profile]);

  const memberSince = profile
    ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '';

  const changedAt = profile?.passwordChangedAt ? new Date(profile.passwordChangedAt).getTime() : null;
  const passwordLock = changedAt !== null && changedAt + PASSWORD_LOCK_MS > now ? { availableAt: changedAt + PASSWORD_LOCK_MS } : null;

  const handleCopy = () => {
    if (!profile?.accountNumber) return;
    void navigator.clipboard.writeText(profile.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSaved(false);
    if (!password) {
      setPasswordError('New password is required');
      return;
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirm) {
      setPasswordError('Passwords do not match');
      return;
    }
    try {
      await useProfileStore.getState().changePassword(password);
      setPassword('');
      setConfirm('');
      setPasswordSaved(true);
      setTimeout(() => setPasswordSaved(false), 2000);
    } catch {
      /* error shown via store */
    }
  };

  return (
    <DashboardLayout title="Profile">
      <div className="max-w-6xl mx-auto">
        <FadeIn className="relative overflow-hidden rounded-2xl bg-ink p-6 sm:p-8 mb-8">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-5">
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="w-16 h-16 rounded-2xl bg-clay/20 border border-clay/30 flex items-center justify-center font-serif text-2xl text-clay shrink-0"
            >
              {initials}
            </motion.span>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="font-serif text-2xl sm:text-3xl text-canvas truncate">
                  {profile?.fullName || 'Your Account'}
                </h2>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium capitalize ${
                    roleColor[profile?.role ?? ''] ?? 'bg-canvas/10 text-canvas/70'
                  }`}
                >
                  <Shield className="w-3 h-3" />
                  {profile?.role ?? 'client'}
                </span>
              </div>
              <p className="mt-1.5 text-sm text-canvas/60 truncate">{profile?.email}</p>
              {profile?.accountNumber && (
                <p className="mt-2 inline-flex items-center gap-2 font-mono text-xs tracking-[0.25em] text-moss">
                  <CreditCard className="w-3.5 h-3.5" />
                  ACCT {profile.accountNumber}
                </p>
              )}
            </div>
            <div className="shrink-0">
              {profile?.emailVerified ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-moss/15 text-moss text-xs font-medium">
                  <BadgeCheck className="w-4 h-4" />
                  Email verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sand/15 text-sand text-xs font-medium">
                  <Clock className="w-4 h-4" />
                  Email unverified
                </span>
              )}
            </div>
          </div>
          <svg className="absolute -right-12 -top-12 w-64 h-64 opacity-10" viewBox="0 0 200 200" aria-hidden="true">
            <motion.path
              d="M 50 150 Q 100 50 150 150 T 250 150"
              stroke="currentColor"
              className="text-canvas"
              strokeWidth="2"
              strokeDasharray="8 6"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
            />
          </svg>
        </FadeIn>

        {error && (
          <div className="mb-8 rounded-xl border border-clay/30 bg-clay/10 p-5 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-clay mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-clay">Profile error</p>
              <p className="text-sm text-clay/80 mt-1">{error}</p>
            </div>
            <button
              onClick={() => void fetchProfile()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-clay/10 text-clay hover:bg-clay/20 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        )}

        {loading && !profile ? (
          <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-line bg-canvas">
            <Loader2 className="w-6 h-6 text-ink/40 animate-spin" />
            <p className="mt-3 text-sm text-ink/50">Loading your profile&hellip;</p>
          </div>
        ) : profile ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {[
                { label: 'Transactions', value: counts?.transactions ?? 0 },
                { label: 'Orders', value: counts?.orders ?? 0 },
                { label: 'Clients', value: counts?.clients ?? 0 },
              ].map((stat, i) => (
                <FadeIn key={stat.label} delay={0.05 * i}>
                  <div className="rounded-xl border border-line bg-canvas p-5 text-center hover:border-ink/20 transition-all">
                    <p className="font-serif text-2xl text-ink">{stat.value}</p>
                    <p className="mt-1 text-xs font-mono uppercase tracking-wider text-ink/40">{stat.label}</p>
                  </div>
                </FadeIn>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <FadeIn delay={0.1} className="rounded-xl border border-line bg-canvas p-5">
                <h3 className="font-serif text-lg text-ink mb-4">Account Details</h3>
                <dl className="space-y-4">
                  <DetailRow label="Account number">
                    <span className="font-mono tracking-[0.2em] text-ink">{profile.accountNumber}</span>
                    <motion.button
                      onClick={handleCopy}
                      whileTap={{ scale: 0.9 }}
                      aria-label="Copy account number"
                      className={`ml-2 p-1.5 rounded-md transition-colors ${
                        copied ? 'text-moss' : 'text-ink/30 hover:text-ink/70'
                      }`}
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.span
                          key={copied ? 'check' : 'copy'}
                          initial={{ opacity: 0, scale: 0.6 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.6 }}
                          transition={{ duration: 0.12 }}
                          className="flex"
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </motion.span>
                      </AnimatePresence>
                    </motion.button>
                  </DetailRow>
                  <DetailRow label="Full name">
                    <span className="text-ink">{profile.fullName || '—'}</span>
                  </DetailRow>
                  <DetailRow label="Email address">
                    <span className="text-ink/70">{profile.email}</span>
                  </DetailRow>
                   <DetailRow label="Role">
                    <span className="capitalize text-ink/70">{profile.role}</span>
                  </DetailRow>
                </dl>
              </FadeIn>

              <FadeIn delay={0.15} className="rounded-xl border border-line bg-canvas p-5 flex flex-col h-full">
                <div className="flex-1">
                  <h3 className="font-serif text-lg text-ink mb-1">Security</h3>
                  <p className="text-xs text-ink/50 mb-5">
                    Last sign in: {profile.lastSignInAt ? new Date(profile.lastSignInAt).toLocaleString() : '—'}
                  </p>
                {passwordLock ? (
                  <div className="rounded-lg bg-sand/20 border border-line p-4">
                    <p className="flex items-center gap-1.5 text-sm font-medium text-ink">
                      <Clock className="w-4 h-4 text-clay" />
                      Password change locked
                    </p>
                    <p className="mt-1 text-xs text-ink/50">
                      For your security, you can change your password again on{' '}
                      <span className="font-medium text-ink">
                        {new Date(passwordLock.availableAt).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      , 1 week after your last change.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="new-password" className="block text-xs font-mono uppercase tracking-wider text-ink/40 mb-1.5">
                          New password
                        </label>
                        <div className="relative">
                          <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/35" />
                          <input
                            id="new-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-line bg-sand/30 text-sm text-ink outline-none focus:border-ink transition-colors"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="confirm-password" className="block text-xs font-mono uppercase tracking-wider text-ink/40 mb-1.5">
                          Confirm password
                        </label>
                        <div className="relative">
                          <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/35" />
                          <input
                            id="confirm-password"
                            type="password"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-line bg-sand/30 text-sm text-ink outline-none focus:border-ink transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                    <AnimatePresence>
                      {(passwordError || passwordSaved) && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className={`mt-3 text-xs ${passwordError ? 'text-clay' : 'text-moss'}`}
                        >
                          {passwordError || 'Password updated'}
                        </motion.p>
                      )}
                    </AnimatePresence>
                    <motion.button
                      onClick={() => void handleChangePassword()}
                      disabled={saving}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-lg bg-ink text-canvas text-sm font-medium disabled:opacity-50 transition-colors hover:bg-ink/90"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                      Change password
                    </motion.button>
                  </>
                )}
                </div>
                <dl className="mt-auto pt-5 border-t border-line/50 space-y-4">
                 
                  <DetailRow label="Member since">
                    <span className="flex items-center gap-1.5 text-ink/70">
                      <Calendar className="w-3.5 h-3.5 text-ink/30" />
                      {memberSince}
                    </span>
                  </DetailRow>
                  <DetailRow label="Status">
                    <span className="inline-flex items-center gap-1.5 text-xs text-moss">
                      <span className="w-1.5 h-1.5 rounded-full bg-moss animate-pulse" />
                      Active
                    </span>
                  </DetailRow>
                </dl>
              </FadeIn>
            </div>
          </>
        ) : null}
      </div>
    </DashboardLayout>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 border-b border-line/50 last:border-0">
      <dt className="text-xs font-mono uppercase tracking-wider text-ink/40">{label}</dt>
      <dd className="flex items-center text-sm">{children}</dd>
    </div>
  );
}
