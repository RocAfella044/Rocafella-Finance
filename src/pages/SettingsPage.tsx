import { useEffect, useRef, useState } from 'react';
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
  RotateCcw,
  ArrowLeftRight,
  ShieldCheck,
  Sparkles,
  Smartphone,
  User,
  Camera,
  Mail,
  Phone,
  CreditCard,
  Calendar,
} from 'lucide-react';
import DashboardLayout from '../Components/Layout/DashboardLayout';
import {
  usePreferencesStore,
  type NotificationPrefs,
  type DeliveryChannels,
} from '../store/preferencesStore';
import { useProfileStore } from '../store/profileStore';
import { FadeIn } from '../lib/FadeIn';
import { EASE } from '../lib/motion';

// ── Tab config ────────────────────────────────────────────────────────────────

type Tab = 'profile' | 'security' | 'notifications';

const tabs: { id: Tab; label: string; desc: string; icon: React.ReactNode }[] = [
  { id: 'profile', label: 'Profile', desc: 'Name, email, and avatar', icon: <User className="w-4 h-4" /> },
  { id: 'security', label: 'Security', desc: 'Password and sign-in activity', icon: <Shield className="w-4 h-4" /> },
  { id: 'notifications', label: 'Notifications', desc: 'Alerts and delivery methods', icon: <Bell className="w-4 h-4" /> },
];

// ── Avatar helpers ────────────────────────────────────────────────────────────

const AVATAR_KEY = 'rocfin.avatar';

function loadAvatar(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(AVATAR_KEY);
  } catch {
    return null;
  }
}

function saveAvatar(dataUrl: string) {
  window.localStorage.setItem(AVATAR_KEY, dataUrl);
}

function clearAvatar() {
  window.localStorage.removeItem(AVATAR_KEY);
}

// ── Notification config ───────────────────────────────────────────────────────

type NotifyItem = { key: keyof NotificationPrefs; label: string; hint: string };
type NotifyGroup = { title: string; hint: string; accent: string; icon: React.ReactNode; items: NotifyItem[] };

const notificationGroups: NotifyGroup[] = [
  {
    title: 'Account activity',
    hint: 'Stay on top of money moving in and out',
    accent: 'bg-moss/15 text-moss',
    icon: <ArrowLeftRight className="w-4.5 h-4.5" />,
    items: [
      { key: 'deposits', label: 'Deposits & credits', hint: 'When money arrives in your wallet' },
      { key: 'withdrawals', label: 'Withdrawals', hint: 'When you initiate a withdrawal' },
      { key: 'transfers', label: 'Transfers & payments', hint: 'When you send or receive a transfer' },
      { key: 'reminders', label: 'Payment reminders', hint: 'A gentle nudge before a payment is due' },
    ],
  },
  {
    title: 'Security alerts',
    hint: 'Alerts that keep your account safe',
    accent: 'bg-clay/15 text-clay',
    icon: <ShieldCheck className="w-4.5 h-4.5" />,
    items: [
      { key: 'signIn', label: 'New sign-in', hint: 'When your account is accessed from a new device' },
      { key: 'passwordChanged', label: 'Password changes', hint: 'When your password or security settings change' },
      { key: 'unusualActivity', label: 'Unusual activity', hint: 'Suspicious sign-ins or transactions' },
    ],
  },
  {
    title: 'Updates & insights',
    hint: 'Content to keep you in the loop',
    accent: 'bg-sand/15 text-sand',
    icon: <Sparkles className="w-4.5 h-4.5" />,
    items: [
      { key: 'digest', label: 'Weekly summary', hint: 'A recap of your wallet activity, every week' },
      { key: 'offers', label: 'Offers & rewards', hint: 'Promotions, cashback, and personalized deals' },
      { key: 'updates', label: 'Product updates', hint: 'News about new Rocafella features' },
    ],
  },
];

type ChannelItem = { key: keyof DeliveryChannels; label: string; hint: string };

// ── Main page ─────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('profile');
  const fileRef = useRef<HTMLInputElement>(null);

  // Profile
  const profile = useProfileStore((s) => s.profile);
  const profileLoading = useProfileStore((s) => s.loading);
  const profileSaving = useProfileStore((s) => s.saving);
  const profileError = useProfileStore((s) => s.error);
  const fetchProfile = useProfileStore((s) => s.fetchProfile);
  const updateFullName = useProfileStore((s) => s.updateFullName);
  const updatePhone = useProfileStore((s) => s.updatePhone);

  const [avatar, setAvatar] = useState<string | null>(loadAvatar);
  const [draftName, setDraftName] = useState('');
  const [draftPhone, setDraftPhone] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);
  const [syncedProfileId, setSyncedProfileId] = useState<string | null>(null);

  // Notifications
  const storedNotifs = usePreferencesStore((s) => s.notifications);
  const storedChannels = usePreferencesStore((s) => s.channels);
  const submitNotifications = usePreferencesStore((s) => s.submitNotifications);
  const [draftNotifs, setDraftNotifs] = useState<NotificationPrefs>(storedNotifs);
  const [draftChannels, setDraftChannels] = useState<DeliveryChannels>(storedChannels);
  const [notifSaved, setNotifSaved] = useState(false);

  // ── Effects ───────────────────────────────────────────────────────────────

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  // Sync form drafts once the profile finishes loading (adjust state during render).
  if (profile && profile.id !== syncedProfileId) {
    setSyncedProfileId(profile.id);
    setDraftName(profile.fullName);
    setDraftPhone(profile.phone);
  }

  // ── Profile handlers ──────────────────────────────────────────────────────

  const profileDirty = profile
    ? draftName !== profile.fullName || draftPhone !== profile.phone || (avatar !== loadAvatar())
    : false;

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setAvatar(dataUrl);
      saveAvatar(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleClearAvatar = () => {
    setAvatar(null);
    clearAvatar();
  };

  const handleProfileSave = async () => {
    try {
      const promises: Promise<void>[] = [];
      if (profile && draftName !== profile.fullName) promises.push(updateFullName(draftName));
      if (profile && draftPhone !== profile.phone) promises.push(updatePhone(draftPhone));
      await Promise.all(promises);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 1800);
    } catch {
      /* error shown via store */
    }
  };

  // ── Notification handlers ─────────────────────────────────────────────────

  const notifDirty =
    JSON.stringify(draftNotifs) !== JSON.stringify(storedNotifs) ||
    JSON.stringify(draftChannels) !== JSON.stringify(storedChannels);

  const toggleNotif = (key: keyof NotificationPrefs) =>
    setDraftNotifs((prev) => ({ ...prev, [key]: !prev[key] }));

  const toggleChannel = (key: keyof DeliveryChannels) =>
    setDraftChannels((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleNotifSave = () => {
    submitNotifications(draftNotifs, draftChannels);
    setNotifSaved(true);
    setTimeout(() => setNotifSaved(false), 1800);
  };

  const handleNotifReset = () => {
    setDraftNotifs(storedNotifs);
    setDraftChannels(storedChannels);
  };

  // ── Shared data ───────────────────────────────────────────────────────────

  const channelItems: ChannelItem[] = [
    { key: 'email', label: 'Email', hint: profile?.email ? `Alerts to ${profile.email}` : 'Alerts delivered to your email' },
    { key: 'sms', label: 'SMS', hint: profile?.phone ? `Texts to ${profile.phone}` : 'Alerts via text message' },
    { key: 'push', label: 'Push', hint: 'Real-time alerts in the app and browser' },
  ];

  const initials = profile
    ? (profile.fullName || profile.email)
        .split(/\s+/)
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout title="Settings">
      <div className="max-w-6xl mx-auto">
        <FadeIn className="relative overflow-hidden rounded-2xl bg-ink p-6 sm:p-8 mb-8">
          <div className="relative z-10">
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-canvas/50 mb-2">Preferences</p>
            <h2 className="font-serif text-2xl sm:text-3xl text-canvas">Settings</h2>
            <p className="mt-2 text-sm text-canvas/60 max-w-md">
              Manage your profile, security, and notifications.
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

        <div className="flex flex-col lg:flex-row gap-6">
          {/* ── Tab sidebar ──────────────────────────────────────────────── */}
          <FadeIn delay={0.05} className="lg:w-56 shrink-0">
            <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-1 lg:pb-0">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors whitespace-nowrap w-full text-left ${
                    tab === t.id
                      ? 'bg-ink text-canvas shadow-sm'
                      : 'text-ink/60 hover:text-ink hover:bg-ink/5'
                  }`}
                >
                  {t.icon}
                  <span className="hidden sm:block">
                    <span className="block leading-tight">{t.label}</span>
                    <span className={`block text-[11px] font-normal ${tab === t.id ? 'text-canvas/60' : 'text-ink/40'}`}>
                      {t.desc}
                    </span>
                  </span>
                </button>
              ))}
            </nav>
          </FadeIn>

          {/* ── Tab content ──────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* ═══════════════ PROFILE ═══════════════ */}
            {tab === 'profile' && (
              <FadeIn delay={0.1} className="rounded-2xl border border-line bg-canvas p-5 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-9 h-9 rounded-lg bg-clay/15 flex items-center justify-center">
                    <User className="w-4.5 h-4.5 text-clay" />
                  </span>
                  <div>
                    <h3 className="font-serif text-lg text-ink">Profile</h3>
                    <p className="text-xs text-ink/50">Update your personal information and public identity</p>
                  </div>
                </div>

                {/* Avatar */}
                <div className="flex items-center gap-5 mb-8 pb-6 border-b border-line/60">
                  <div className="relative group shrink-0">
                    <div className="w-20 h-20 rounded-2xl bg-ink/10 border border-line flex items-center justify-center overflow-hidden">
                      {avatar ? (
                        <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-serif text-2xl text-ink/40">{initials}</span>
                      )}
                    </div>
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="absolute inset-0 rounded-2xl bg-ink/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      <Camera className="w-5 h-5 text-canvas" />
                    </button>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink">Profile photo</p>
                    <p className="text-xs text-ink/50 mt-0.5">JPG, PNG or GIF. Square recommended.</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => fileRef.current?.click()}
                        className="text-xs font-medium text-ink/70 hover:text-ink transition-colors"
                      >
                        Upload
                      </button>
                      {avatar && (
                        <button
                          onClick={handleClearAvatar}
                          className="text-xs font-medium text-clay hover:text-clay/80 transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {profileError && (
                  <div className="mb-5 rounded-xl border border-clay/30 bg-clay/10 p-4 flex items-center justify-between gap-3">
                    <p className="text-xs text-clay/90">{profileError}</p>
                    <button
                      onClick={() => void fetchProfile()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-clay/10 text-clay hover:bg-clay/20 transition-colors shrink-0"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Retry
                    </button>
                  </div>
                )}

                {/* Fields */}
                <div className="space-y-5">
                  <Field label="Full name" icon={<User className="w-3.5 h-3.5 text-ink/30" />}>
                    <input
                      type="text"
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      className="w-full bg-transparent text-sm text-ink placeholder:text-ink/30 focus:outline-none"
                      placeholder="Enter your full name"
                    />
                  </Field>

                  <Field label="Email address" icon={<Mail className="w-3.5 h-3.5 text-ink/30" />} read-only>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-ink/70">{profile?.email}</span>
                      {profile?.emailVerified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-moss/15 text-moss text-[10px] font-medium">
                          <Check className="w-2.5 h-2.5" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sand/15 text-sand text-[10px] font-medium">
                          Unverified
                        </span>
                      )}
                    </div>
                  </Field>

                  <Field label="Phone number" icon={<Phone className="w-3.5 h-3.5 text-ink/30" />}>
                    <input
                      type="tel"
                      value={draftPhone}
                      onChange={(e) => setDraftPhone(e.target.value)}
                      className="w-full bg-transparent text-sm text-ink placeholder:text-ink/30 focus:outline-none"
                      placeholder="Enter your phone number"
                    />
                  </Field>

                  <Field label="Account number" icon={<CreditCard className="w-3.5 h-3.5 text-ink/30" />} read-only>
                    <span className="font-mono text-sm tracking-[0.15em] text-ink/70">{profile?.accountNumber}</span>
                  </Field>

                  <Field label="Role" icon={<Shield className="w-3.5 h-3.5 text-ink/30" />} read-only>
                    <span className="capitalize text-sm text-ink/70">{profile?.role ?? 'client'}</span>
                  </Field>

                  <Field label="Member since" icon={<Calendar className="w-3.5 h-3.5 text-ink/30" />} read-only>
                    <span className="text-sm text-ink/70">
                      {profile?.createdAt
                        ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                        : '—'}
                    </span>
                  </Field>
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <p className="text-xs text-ink/40">
                    {profileSaved ? (
                      <span className="text-moss">Profile updated successfully.</span>
                    ) : profileDirty ? (
                      'You have unsaved changes.'
                    ) : (
                      'No changes to save.'
                    )}
                  </p>
                  <motion.button
                    onClick={() => void handleProfileSave()}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    disabled={!profileDirty || profileSaving}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-ink text-canvas text-sm font-medium transition-colors hover:bg-ink/90 disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {profileSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : profileSaved ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {profileSaved ? 'Saved' : 'Save profile'}
                  </motion.button>
                </div>
              </FadeIn>
            )}

            {/* ═══════════════ SECURITY ═══════════════ */}
            {tab === 'security' && (
              <FadeIn delay={0.1} className="rounded-2xl border border-line bg-canvas p-5 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-9 h-9 rounded-lg bg-clay/15 flex items-center justify-center">
                    <Shield className="w-4.5 h-4.5 text-clay" />
                  </span>
                  <div>
                    <h3 className="font-serif text-lg text-ink">Security</h3>
                    <p className="text-xs text-ink/50">Keep your account safe and secure</p>
                  </div>
                </div>

                {profileLoading && !profile ? (
                  <div className="flex flex-col items-center justify-center py-12 rounded-xl border border-line/50 bg-canvas">
                    <Loader2 className="w-5 h-5 text-ink/40 animate-spin" />
                    <p className="mt-3 text-xs text-ink/50">Loading security details&hellip;</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="rounded-xl border border-line/50 bg-ink/[0.02] p-5">
                      <h4 className="text-xs font-mono uppercase tracking-wider text-ink/40 mb-4">Sign-in activity</h4>
                      <dl className="divide-y divide-line/50">
                        <SecRow label="Last sign in" icon={<Clock className="w-3.5 h-3.5 text-ink/30" />}>
                          {profile?.lastSignInAt ? new Date(profile.lastSignInAt).toLocaleString() : '—'}
                        </SecRow>
                        <SecRow label="Email status" icon={<AtSign className="w-3.5 h-3.5 text-ink/30" />}>
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
                    </div>

                    <div className="rounded-xl border border-line/50 bg-ink/[0.02] p-5">
                      <h4 className="text-xs font-mono uppercase tracking-wider text-ink/40 mb-4">Password</h4>
                      <dl className="divide-y divide-line/50">
                        <SecRow label="Password status" icon={<KeyRound className="w-3.5 h-3.5 text-ink/30" />}>
                          {profile?.passwordChangedAt
                            ? `Updated ${new Date(profile.passwordChangedAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}`
                            : 'Not set yet'}
                        </SecRow>
                      </dl>
                      <motion.button
                        onClick={() => navigate('/changepassword')}
                        whileTap={{ scale: 0.98 }}
                        className="mt-5 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-ink text-canvas text-sm font-medium transition-colors hover:bg-ink/90"
                      >
                        <KeyRound className="w-4 h-4" />
                        Change password
                        <ChevronRight className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                )}
              </FadeIn>
            )}

            {/* ═══════════════ NOTIFICATIONS ═══════════════ */}
            {tab === 'notifications' && (
              <FadeIn delay={0.1} className="rounded-2xl border border-line bg-canvas p-5 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-9 h-9 rounded-lg bg-sand/15 flex items-center justify-center">
                    <Bell className="w-4.5 h-4.5 text-sand" />
                  </span>
                  <div>
                    <h3 className="font-serif text-lg text-ink">Notifications</h3>
                    <p className="text-xs text-ink/50">Choose what you want to be notified about and how</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {notificationGroups.map((group) => (
                    <section key={group.title}>
                      <div className="flex items-center gap-2.5 mb-3">
                        <span className={`w-7 h-7 rounded-md flex items-center justify-center ${group.accent}`}>
                          {group.icon}
                        </span>
                        <div>
                          <h4 className="text-sm font-medium text-ink">{group.title}</h4>
                          <p className="text-[11px] text-ink/50">{group.hint}</p>
                        </div>
                      </div>
                      <div className="divide-y divide-line/60">
                        {group.items.map((item) => (
                          <div key={item.key} className="py-3.5 flex items-center justify-between gap-4">
                            <div>
                              <p className="text-sm text-ink/90">{item.label}</p>
                              <p className="text-xs text-ink/50 mt-0.5">{item.hint}</p>
                            </div>
                            <Toggle checked={draftNotifs[item.key]} onToggle={() => toggleNotif(item.key)} />
                          </div>
                        ))}
                      </div>
                    </section>
                  ))}

                  <section>
                    <div className="flex items-center gap-2.5 mb-3">
                      <span className="w-7 h-7 rounded-md bg-ink/10 text-ink/60 flex items-center justify-center">
                        <Smartphone className="w-4 h-4" />
                      </span>
                      <div>
                        <h4 className="text-sm font-medium text-ink">Delivery methods</h4>
                        <p className="text-[11px] text-ink/50">Where your alerts should be sent</p>
                      </div>
                    </div>
                    <div className="divide-y divide-line/60">
                      {channelItems.map((item) => (
                        <div key={item.key} className="py-3.5 flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm text-ink/90">{item.label}</p>
                            <p className="text-xs text-ink/50 mt-0.5 truncate max-w-[26rem]">{item.hint}</p>
                          </div>
                          <Toggle checked={draftChannels[item.key]} onToggle={() => toggleChannel(item.key)} />
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <p className="text-xs text-ink/40">
                    {notifSaved ? (
                      <span className="text-moss">Notification preferences saved.</span>
                    ) : notifDirty ? (
                      'You have unsaved changes.'
                    ) : (
                      'No changes to save.'
                    )}
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleNotifReset}
                      disabled={!notifDirty}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-line text-ink/70 hover:text-ink hover:border-ink/30 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reset
                    </button>
                    <motion.button
                      onClick={handleNotifSave}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      disabled={!notifDirty}
                      className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-ink text-canvas text-sm font-medium transition-colors hover:bg-ink/90 disabled:opacity-40 disabled:pointer-events-none"
                    >
                      {notifSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                      {notifSaved ? 'Saved' : 'Save changes'}
                    </motion.button>
                  </div>
                </div>
              </FadeIn>
            )}

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ── Shared components ─────────────────────────────────────────────────────────

function Field({
  label,
  icon,
  children,
  'read-only': readOnly,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  'read-only'?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 py-3 border-b border-line/50 last:border-0 ${readOnly ? 'opacity-70' : ''}`}>
      <dt className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-ink/40 shrink-0 w-32">
        {icon}
        {label}
      </dt>
      <dd className="flex-1 min-w-0">{children}</dd>
    </div>
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
      className={`relative w-12 h-7 rounded-full transition-colors shrink-0 ${checked ? 'bg-moss' : 'bg-line'}`}
    >
      <motion.span
        layout
        transition={{ duration: 0.2, ease: EASE }}
        className={`absolute top-1 w-5 h-5 rounded-full bg-canvas shadow ${checked ? 'right-1' : 'left-1'}`}
      />
    </button>
  );
}