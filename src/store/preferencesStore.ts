import { create } from 'zustand';

export type NotificationPrefs = {
  transactions: boolean;
  security: boolean;
  promotions: boolean;
};

type PreferencesState = {
  notifications: NotificationPrefs;
  toggleNotification: (key: keyof NotificationPrefs) => void;
};

const STORAGE_KEY = 'rocfin.preferences';

type Persisted = {
  notifications: NotificationPrefs;
};

const defaults: Persisted = {
  notifications: {
    transactions: true,
    security: true,
    promotions: false,
  },
};

function load(): Persisted {
  if (typeof window === 'undefined') return defaults;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<Persisted>;
    return {
      notifications: { ...defaults.notifications, ...(parsed.notifications ?? {}) },
    };
  } catch {
    return defaults;
  }
}

function persist(state: Persisted) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const initial = load();

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  notifications: initial.notifications,

  toggleNotification: (key) => {
    set((s) => ({
      notifications: { ...s.notifications, [key]: !s.notifications[key] },
    }));
    persist(get());
  },
}));
