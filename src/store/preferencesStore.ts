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

type PreferencesState = {
  notifications: NotificationPrefs;
  channels: DeliveryChannels;
  submitNotifications: (notifications: NotificationPrefs, channels: DeliveryChannels) => void;
  toggleNotification: (key: keyof NotificationPrefs) => void;
  toggleChannel: (key: keyof DeliveryChannels) => void;
};

const STORAGE_KEY = 'rocfin.preferences';

type Persisted = {
  notifications: NotificationPrefs;
  channels: DeliveryChannels;
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
  };
}

const initial = load();

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  notifications: initial.notifications,
  channels: initial.channels,

  submitNotifications: (notifications, channels) => {
    set({ notifications, channels });
    persist({ ...snapshot(get()), notifications, channels });
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