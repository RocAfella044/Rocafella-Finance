import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { User, Bell, Shield, Palette, Save } from 'lucide-react';
import DashboardLayout from '../Components/Layout/DashboardLayout';
import { useSettingsStore, type SettingsSection } from '../store/settingsStore';

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09, delayChildren: 0.15 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

const sections: { id: SettingsSection; label: string; icon: typeof User }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Palette },
];

export default function SettingsPage() {
  const prefersReducedMotion = useReducedMotion();
  const activeSection = useSettingsStore((s) => s.activeSection);
  const saved = useSettingsStore((s) => s.saved);
  const profile = useSettingsStore((s) => s.profile);
  const notifications = useSettingsStore((s) => s.notifications);
  const security = useSettingsStore((s) => s.security);
  const theme = useSettingsStore((s) => s.theme);
  const setActiveSection = useSettingsStore((s) => s.setActiveSection);
  const updateProfile = useSettingsStore((s) => s.updateProfile);
  const toggleNotification = useSettingsStore((s) => s.toggleNotification);
  const toggleSecurity = useSettingsStore((s) => s.toggleSecurity);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const setSaved = useSettingsStore((s) => s.setSaved);
  const rootMotionProps = prefersReducedMotion
    ? {}
    : { initial: 'hidden' as const, animate: 'visible' as const };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <DashboardLayout title="Settings">
      <motion.div {...rootMotionProps} variants={containerVariants} className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          <motion.div variants={itemVariants} className="lg:w-52 shrink-0">
            <div className="flex lg:flex-col gap-1">
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm transition-all w-full
                    ${activeSection === s.id
                      ? 'bg-ink text-canvas font-medium'
                      : 'text-ink/50 hover:text-ink hover:bg-sand/30'}`}
                >
                  <s.icon className="w-4 h-4" />
                  {s.label}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="flex-1">
            <div className="rounded-xl border border-line bg-canvas p-6">
              {activeSection === 'profile' && (
                <div className="space-y-5">
                  <h3 className="font-serif text-lg text-ink">Profile Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-mono uppercase tracking-wider text-ink/40 mb-1.5 block">Full Name</label>
                      <input
                        type="text" value={profile.name}
                        onChange={(e) => updateProfile('name', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-line bg-sand/30 text-sm text-ink outline-none focus:border-ink transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono uppercase tracking-wider text-ink/40 mb-1.5 block">Email</label>
                      <input
                        type="email" value={profile.email}
                        onChange={(e) => updateProfile('email', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-line bg-sand/30 text-sm text-ink outline-none focus:border-ink transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono uppercase tracking-wider text-ink/40 mb-1.5 block">Phone</label>
                      <input
                        type="text" value={profile.phone}
                        onChange={(e) => updateProfile('phone', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-line bg-sand/30 text-sm text-ink outline-none focus:border-ink transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono uppercase tracking-wider text-ink/40 mb-1.5 block">Location</label>
                      <input
                        type="text" value={profile.location}
                        onChange={(e) => updateProfile('location', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-line bg-sand/30 text-sm text-ink outline-none focus:border-ink transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'notifications' && (
                <div className="space-y-5">
                  <h3 className="font-serif text-lg text-ink">Notification Preferences</h3>
                  {Object.entries(notifications).map(([item, checked]) => (
                    <label key={item} className="flex items-center justify-between py-2">
                      <span className="text-sm text-ink/70">{item}</span>
                      <input
                        type="checkbox" checked={checked}
                        onChange={() => toggleNotification(item)}
                        className="w-4 h-4 rounded border-line text-ink focus:ring-ink"
                      />
                    </label>
                  ))}
                </div>
              )}

              {activeSection === 'security' && (
                <div className="space-y-5">
                  <h3 className="font-serif text-lg text-ink">Security Settings</h3>
                  {[
                    { label: 'Two-factor authentication', desc: 'Add an extra layer of security' },
                    { label: 'Login alerts', desc: 'Get notified of new sign-ins' },
                    { label: 'Device management', desc: 'Review connected devices' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm text-ink">{item.label}</p>
                        <p className="text-xs text-ink/50">{item.desc}</p>
                      </div>
                      <input
                        type="checkbox" checked={security[item.label] ?? false}
                        onChange={() => toggleSecurity(item.label)}
                        className="w-4 h-4 rounded border-line text-ink focus:ring-ink"
                      />
                    </div>
                  ))}
                </div>
              )}

              {activeSection === 'appearance' && (
                <div className="space-y-5">
                  <h3 className="font-serif text-lg text-ink">Appearance</h3>
                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-ink/40 mb-2 block">Theme</label>
                    <div className="flex gap-3">
                      {(['Light', 'Dark', 'System'] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => setTheme(t)}
                          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                            theme === t
                              ? 'bg-ink text-canvas'
                              : 'bg-sand/30 text-ink/60 hover:text-ink border border-line'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-6">
              <div />
              <motion.button
                onClick={handleSave}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-ink text-canvas text-sm font-medium transition-colors hover:bg-ink/90"
              >
                <Save className="w-4 h-4" />
                {saved ? 'Saved!' : 'Save changes'}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
