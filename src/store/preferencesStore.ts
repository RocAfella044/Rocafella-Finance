import { create } from 'zustand';

export type Language = 'en' | 'ne' | 'hi';

export type NotificationPrefs = {
  transactions: boolean;
  security: boolean;
  promotions: boolean;
};

type PreferencesState = {
  language: Language;
  notifications: NotificationPrefs;
  setLanguage: (language: Language) => void;
  toggleNotification: (key: keyof NotificationPrefs) => void;
};

const STORAGE_KEY = 'rocfin.preferences';

type Persisted = {
  language: Language;
  notifications: NotificationPrefs;
};

const defaults: Persisted = {
  language: 'en',
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
      language: parsed.language ?? defaults.language,
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
  language: initial.language,
  notifications: initial.notifications,

  setLanguage: (language) => {
    set({ language });
    persist(get());
  },

  toggleNotification: (key) => {
    set((s) => ({
      notifications: { ...s.notifications, [key]: !s.notifications[key] },
    }));
    persist(get());
  },
}));
