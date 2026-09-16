import { create } from 'zustand';

export type NotificationPrefs = {
  deposits: boolean;
  withdrawals: boolean;
  transfers: boolean;
  reminders: boolean;
  signIn: boolean;
  passwordChanged: boolean;
  unusualActivity: boolean;
  digest: boolean;
  offers: boolean;
  updates: boolean;
};

export type DeliveryChannels = {
  email: boolean;
  sms: boolean;
  push: boolean;
};

export type LocalePrefs = {
  language: string;
  region: string;
};

type PreferencesState = {
  notifications: NotificationPrefs;
  channels: DeliveryChannels;
  locale: LocalePrefs;
  submitNotifications: (notifications: NotificationPrefs, channels: DeliveryChannels) => void;
  submitLocale: (locale: LocalePrefs) => void;
  toggleNotification: (key: keyof NotificationPrefs) => void;
  toggleChannel: (key: keyof DeliveryChannels) => void;
};

const STORAGE_KEY = 'rocfin.preferences';

type Persisted = {
  notifications: NotificationPrefs;
  channels: DeliveryChannels;
  locale: LocalePrefs;
};

const defaults: Persisted = {
  notifications: {
    deposits: true,
    withdrawals: true,
    transfers: true,
    reminders: true,
    signIn: true,
    passwordChanged: true,
    unusualActivity: true,
    digest: false,
    offers: false,
    updates: false,
  },
  channels: {
    email: true,
    sms: false,
    push: true,
  },
  locale: {
    language: 'en',
    region: 'us',
  },
};

function mergeDefaults<T extends object>(defs: T, override: Partial<T> | undefined): T {
  return { ...defs, ...(override ?? {}) };
}

function load(): Persisted {
  if (typeof window === 'undefined') return defaults;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<Persisted>;
    return {
      notifications: mergeDefaults(defaults.notifications, parsed.notifications),
      channels: mergeDefaults(defaults.channels, parsed.channels),
      locale: mergeDefaults(defaults.locale, parsed.locale),
    };
  } catch {
    return defaults;
  }
}

function persist(state: Persisted) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function snapshot(state: PreferencesState): Persisted {
  return {
    notifications: state.notifications,
    channels: state.channels,
    locale: state.locale,
  };
}

const initial = load();

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  notifications: initial.notifications,
  channels: initial.channels,
  locale: initial.locale,

  submitNotifications: (notifications, channels) => {
    const next = { ...snapshot(get()), notifications, channels };
    set({ notifications, channels });
    persist(next);
  },

  submitLocale: (locale) => {
    const next = { ...snapshot(get()), locale };
    set({ locale });
    persist(next);
  },

  toggleNotification: (key) => {
    const notifications = { ...get().notifications, [key]: !get().notifications[key] };
    set({ notifications });
    persist({ ...snapshot(get()), notifications });
  },

  toggleChannel: (key) => {
    const channels = { ...get().channels, [key]: !get().channels[key] };
    set({ channels });
    persist({ ...snapshot(get()), channels });
  },
}));