import { create } from 'zustand';
import { supabase, isSupabaseConfigured, SUPABASE_CONFIG_ERROR } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export type NotificationType = 'transaction' | 'order' | 'security' | 'system' | 'deposit';

type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  meta: Record<string, unknown> | null;
  read: boolean;
  createdAt: string;
};

type DbNotification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  meta: Record<string, unknown> | null;
  read: boolean;
  created_at: string;
};

type NotificationFilter = 'all' | 'unread' | NotificationType;

type NotificationState = {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  filter: NotificationFilter;
  search: string;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  setFilter: (filter: NotificationFilter) => void;
  setSearch: (search: string) => void;
  unreadCount: () => number;
  filteredNotifications: () => Notification[];
};

function mapNotification(row: DbNotification): Notification {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    meta: row.meta,
    read: row.read,
    createdAt: row.created_at,
  };
}

let realtimeChannel: RealtimeChannel | null = null;

function attachRealtime(fetch: () => Promise<void>) {
  if (realtimeChannel || !isSupabaseConfigured) return;
  realtimeChannel = supabase
    .channel('notification-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'notifications' },
      () => void fetch(),
    )
    .subscribe();
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  loading: false,
  error: null,
  filter: 'all',
  search: '',

  fetchNotifications: async () => {
    if (!isSupabaseConfigured) {
      set({ error: SUPABASE_CONFIG_ERROR });
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('id, type, title, body, meta, read, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const notifications = (data ?? []).map(mapNotification);
      set({ notifications, loading: false });
      attachRealtime(() => get().fetchNotifications());
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load notifications.',
      });
    }
  },

  markAsRead: async (id) => {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);
    if (!error) {
      set((s) => ({
        notifications: s.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n,
        ),
      }));
    }
  },

  markAllAsRead: async () => {
    if (!isSupabaseConfigured) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);

    if (!error) {
      set((s) => ({
        notifications: s.notifications.map((n) => ({ ...n, read: true })),
      }));
    }
  },

  deleteNotification: async (id) => {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);
    if (!error) {
      set((s) => ({
        notifications: s.notifications.filter((n) => n.id !== id),
      }));
    }
  },

  clearAll: async () => {
    if (!isSupabaseConfigured) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', user.id);

    if (!error) {
      set({ notifications: [] });
    }
  },

  setFilter: (filter) => set({ filter }),
  setSearch: (search) => set({ search }),

  unreadCount: () => get().notifications.filter((n) => !n.read).length,

  filteredNotifications: () => {
    const { notifications, filter, search } = get();
    let result = notifications;

    if (filter === 'unread') {
      result = result.filter((n) => !n.read);
    } else if (filter !== 'all') {
      result = result.filter((n) => n.type === filter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.body.toLowerCase().includes(q),
      );
    }

    return result;
  },
}));
