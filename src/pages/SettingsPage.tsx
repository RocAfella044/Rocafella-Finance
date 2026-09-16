import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Save,
  Bell,
  Check,
  Shield,
  KeyRound,
  AtSign,
  Clock,
  ChevronRight,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import DashboardLayout from '../Components/Layout/DashboardLayout';
import { usePreferencesStore, type NotificationPrefs } from '../store/preferencesStore';
import { useProfileStore } from '../store/profileStore';
import { FadeIn } from '../lib/FadeIn';
import { EASE } from '../lib/motion';

const notificationItems: { key: keyof NotificationPrefs; label: string; hint: string }[] = [
  { key: 'transactions', label: 'Transactions', hint: 'Alerts for your transfers and activity' },
  { key: 'security', label: 'Security', hint: 'Sign-ins, password changes, and alerts' },
  { key: 'promotions', label: 'Promotions', hint: 'Offers, tips, and product updates' },
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const notifications = usePreferencesStore((s) => s.notifications);
  const toggleNotification = usePreferencesStore((s) => s.toggleNotification);

  const profile = useProfileStore((s) => s.profile);
  const loading = useProfileStore((s) => s.loading);
  const error = useProfileStore((s) => s.error);
  const fetchProfile = useProfileStore((s) => s.fetchProfile);

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <DashboardLayout title="Settings">
      <div className="max-w-4xl mx-auto">
        <FadeIn className="relative overflow-hidden rounded-2xl bg-ink p-6 sm:p-8 mb-8">
          <div className="relative z-10">
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-canvas/50 mb-2">Preferences</p>
            <h2 className="font-serif text-2xl sm:text-3xl text-canvas">Settings</h2>
            <p className="mt-2 text-sm text-canvas/60 max-w-md">
              Personalize your experience — notifications and account security.
            </p>
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
              transition={{ duration: 2, ease: EASE }}
            />
          </svg>
        </FadeIn>

        <div className="space-y-6">
          <FadeIn delay={0.1} className="rounded-2xl border border-line bg-canvas p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-9 h-9 rounded-lg bg-clay/15 flex items-center justify-center">
                <Shield className="w-4.5 h-4.5 text-clay" />
              </span>
              <div>
                <h3 className="font-serif text-lg text-ink">Security</h3>
                <p className="text-xs text-ink/50">Keep your account safe and secure</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-clay/30 bg-clay/10 p-4 flex items-center justify-between gap-3">
                <p className="text-xs text-clay/90">{error}</p>
                <button
                  onClick={() => void fetchProfile()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-clay/10 text-clay hover:bg-clay/20 transition-colors shrink-0"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Retry
                </button>
              </div>
            )}

            {loading && !profile ? (
              <div className="flex flex-col items-center justify-center py-10 rounded-xl bg-canvas">
                <Loader2 className="w-5 h-5 text-ink/40 animate-spin" />
                <p className="mt-2 text-xs text-ink/50">Loading security details&hellip;</p>
              </div>
            ) : (
              <dl className="divide-y divide-line/60">
                <SecRow label="Last sign in" icon={<Clock className="w-3.5 h-3.5 text-ink/30" />}>
                  {profile?.lastSignInAt ? new Date(profile.lastSignInAt).toLocaleString() : '—'}
                </SecRow>
                <SecRow label="Password" icon={<KeyRound className="w-3.5 h-3.5 text-ink/30" />}>
                  {profile?.passwordChangedAt
                    ? `Updated ${new Date(profile.passwordChangedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}`
                    : 'Not set yet'}
                </SecRow>
                <SecRow label="Email" icon={<AtSign className="w-3.5 h-3.5 text-ink/30" />}>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                    {profile?.emailVerified ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-moss" />
                        <span className="text-moss">Verified</span>
                      </>
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-sand" />
                        <span className="text-sand">Unverified</span>
                      </>
                    )}
                  </span>
                </SecRow>
              </dl>
            )}

            <motion.button
              onClick={() => navigate('/changepassword')}
              whileTap={{ scale: 0.98 }}
              className="mt-5 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-ink text-canvas text-sm font-medium transition-colors hover:bg-ink/90"
            >
              <KeyRound className="w-4 h-4" />
              Change password
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </FadeIn>

          <FadeIn delay={0.15} className="rounded-2xl border border-line bg-canvas p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-9 h-9 rounded-lg bg-sand/15 flex items-center justify-center">
                <Bell className="w-4.5 h-4.5 text-sand" />
              </span>
              <div>
                <h3 className="font-serif text-lg text-ink">Notifications</h3>
                <p className="text-xs text-ink/50">Choose what you want to be notified about</p>
              </div>
            </div>
            <div className="divide-y divide-line/60">
              {notificationItems.map((item) => (
                <div key={item.key} className="py-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-ink">{item.label}</p>
                    <p className="text-xs text-ink/50 mt-0.5">{item.hint}</p>
                  </div>
                  <Toggle checked={notifications[item.key]} onToggle={() => toggleNotification(item.key)} />
                </div>
              ))}
            </div>
          </FadeIn>
        </div>

        <FadeIn delay={0.2} className="mt-8">
          <motion.button
            onClick={handleSave}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-xl bg-ink text-canvas text-sm font-medium transition-colors hover:bg-ink/90"
          >
            {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? 'Preferences saved' : 'Save preferences'}
          </motion.button>
        </FadeIn>
      </div>
    </DashboardLayout>
  );
}

function SecRow({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-line/50 last:border-0">
      <dt className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-ink/40">{icon}{label}</dt>
      <dd className="text-right text-sm text-ink/70">{children}</dd>
    </div>
  );
}

function Toggle({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onToggle}
      className={`relative w-12 h-7 rounded-full transition-colors ${checked ? 'bg-moss' : 'bg-line'}`}
    >
      <motion.span
        layout
        transition={{ duration: 0.2, ease: EASE }}
        className={`absolute top-1 w-5 h-5 rounded-full bg-canvas shadow ${checked ? 'right-1' : 'left-1'}`}
      />
    </button>
  );
}
