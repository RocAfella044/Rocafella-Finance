import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SettingsSection = 'profile' | 'notifications' | 'security' | 'appearance';
export type Theme = 'Light' | 'Dark' | 'System';

type SettingsState = {
  activeSection: SettingsSection;
  saved: boolean;
  profile: { name: string; email: string; phone: string; location: string };
  notifications: Record<string, boolean>;
  security: Record<string, boolean>;
  theme: Theme;
  setActiveSection: (section: SettingsSection) => void;
  updateProfile: (field: keyof SettingsState['profile'], value: string) => void;
  toggleNotification: (key: string) => void;
  toggleSecurity: (key: string) => void;
  setTheme: (theme: Theme) => void;
  setSaved: (saved: boolean) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      activeSection: 'profile',
      saved: false,
      profile: { name: 'Alex Mercer', email: 'alex@example.com', phone: '+1 (555) 123-4567', location: 'New York, USA' },
      notifications: {
        'Email notifications': true,
        'Push notifications': true,
        'Monthly report': true,
        'Marketing emails': false,
      },
      security: {
        'Two-factor authentication': false,
        'Login alerts': false,
        'Device management': false,
      },
      theme: 'Light',
      setActiveSection: (activeSection) => set({ activeSection }),
      updateProfile: (field, value) => set((s) => ({ profile: { ...s.profile, [field]: value } })),
      toggleNotification: (key) =>
        set((s) => ({ notifications: { ...s.notifications, [key]: !s.notifications[key] } })),
      toggleSecurity: (key) => set((s) => ({ security: { ...s.security, [key]: !s.security[key] } })),
      setTheme: (theme) => set({ theme }),
      setSaved: (saved) => set({ saved }),
    }),
    { name: '_settings' },
  ),
);
