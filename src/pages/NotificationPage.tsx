import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Search,
  ArrowRight,
  CreditCard,
  ShoppingCart,
  Shield,
  Info,
  Landmark,
  X,
  Loader2,
  AlertCircle,
  RefreshCw,
  Filter,
} from 'lucide-react';
import DashboardLayout from '../Components/Layout/DashboardLayout';
import { useNotificationStore, type NotificationType } from '../store/notificationStore';
import { FadeIn } from '../lib/FadeIn';
import { EASE } from '../lib/motion';

const typeConfig: Record<
  NotificationType,
  { icon: typeof Bell; color: string; bg: string; label: string }
> = {
  transaction: {
    icon: CreditCard,
    color: 'text-moss',
    bg: 'bg-moss/10',
    label: 'Transaction',
  },
  order: {
    icon: ShoppingCart,
    color: 'text-sand',
    bg: 'bg-sand/10',
    label: 'Order',
  },
  security: {
    icon: Shield,
    color: 'text-clay',
    bg: 'bg-clay/10',
    label: 'Security',
  },
  system: {
    icon: Info,
    color: 'text-ink/60',
    bg: 'bg-ink/5',
    label: 'System',
  },
  deposit: {
    icon: Landmark,
    color: 'text-moss',
    bg: 'bg-moss/10',
    label: 'Deposit',
  },
};

const filterTabs: { value: 'all' | 'unread' | NotificationType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'transaction', label: 'Transactions' },
  { value: 'order', label: 'Orders' },
  { value: 'security', label: 'Security' },
  { value: 'system', label: 'System' },
  { value: 'deposit', label: 'Deposits' },
];

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export default function NotificationPage() {
  const notifications = useNotificationStore((s) => s.notifications);
  const loading = useNotificationStore((s) => s.loading);
  const error = useNotificationStore((s) => s.error);
  const filter = useNotificationStore((s) => s.filter);
  const search = useNotificationStore((s) => s.search);
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);
  const deleteNotification = useNotificationStore((s) => s.deleteNotification);
  const clearAll = useNotificationStore((s) => s.clearAll);
  const setFilter = useNotificationStore((s) => s.setFilter);
  const setSearch = useNotificationStore((s) => s.setSearch);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const filteredNotifications = useNotificationStore((s) => s.filteredNotifications);

  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  const displayed = useMemo(() => filteredNotifications(), [notifications, filter, search]);
  const count = useMemo(() => unreadCount(), [notifications]);

  const stats = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter((n) => !n.read).length;
    const byType = notifications.reduce(
      (acc, n) => {
        acc[n.type] = (acc[n.type] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
    return { total, unread, byType };
  }, [notifications]);

  return (
    <DashboardLayout title="Notifications">
      <div className="max-w-6xl mx-auto">
        <FadeIn className="relative overflow-hidden rounded-2xl bg-ink p-6 sm:p-8 mb-8">
          <div className="relative z-10">
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-canvas/50 mb-2">
              Stay informed
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl text-canvas">Notifications</h2>
            <p className="mt-2 text-sm text-canvas/60 max-w-md">
              Track transactions, security alerts, and account updates in real time.
            </p>
            <div className="flex flex-wrap gap-4 mt-5">
              <div className="rounded-lg bg-canvas/10 px-4 py-2.5">
                <p className="font-serif text-xl text-canvas">{stats.total}</p>
                <p className="text-[11px] font-mono uppercase tracking-wider text-canvas/40">Total</p>
              </div>
              <div className="rounded-lg bg-clay/15 px-4 py-2.5">
                <p className="font-serif text-xl text-clay">{stats.unread}</p>
                <p className="text-[11px] font-mono uppercase tracking-wider text-clay/60">Unread</p>
              </div>
              <div className="rounded-lg bg-moss/10 px-4 py-2.5">
                <p className="font-serif text-xl text-moss">{stats.byType['transaction'] ?? 0}</p>
                <p className="text-[11px] font-mono uppercase tracking-wider text-moss/60">Transactions</p>
              </div>
              <div className="rounded-lg bg-sand/10 px-4 py-2.5">
                <p className="font-serif text-xl text-sand">{stats.byType['security'] ?? 0}</p>
                <p className="text-[11px] font-mono uppercase tracking-wider text-sand/60">Security</p>
              </div>
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
              <p className="text-sm font-medium text-clay">Notification error</p>
              <p className="text-sm text-clay/80 mt-1">{error}</p>
            </div>
            <button
              onClick={() => void fetchNotifications()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-clay/10 text-clay hover:bg-clay/20 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        )}

        {loading && !notifications.length ? (
          <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-line bg-canvas">
            <Loader2 className="w-6 h-6 text-ink/40 animate-spin" />
            <p className="mt-3 text-sm text-ink/50">Loading notifications&hellip;</p>
          </div>
        ) : (
          <>
            <FadeIn delay={0.05} className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/30" />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-line bg-canvas text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-ink/10 focus:border-ink/20 transition-all"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/30 hover:text-ink/60 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {count > 0 && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => void markAllAsRead()}
                      className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-line bg-canvas text-xs font-medium text-ink/70 hover:text-ink hover:border-ink/20 transition-all"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Mark all read
                    </motion.button>
                  )}
                  {notifications.length > 0 && (
                    <div className="relative">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setConfirmClear(true)}
                        className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-line bg-canvas text-xs font-medium text-ink/70 hover:text-clay hover:border-clay/30 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Clear all
                      </motion.button>
                      <AnimatePresence>
                        {confirmClear && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -4 }}
                            transition={{ duration: 0.15, ease: EASE }}
                            className="absolute right-0 top-full mt-2 z-10 rounded-xl border border-line bg-canvas shadow-lg p-4 w-56"
                          >
                            <p className="text-sm text-ink font-medium mb-1">Clear all notifications?</p>
                            <p className="text-xs text-ink/50 mb-3">This cannot be undone.</p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  void clearAll();
                                  setConfirmClear(false);
                                }}
                                className="flex-1 px-3 py-1.5 rounded-lg bg-clay text-canvas text-xs font-medium hover:bg-clay/90 transition-colors"
                              >
                                Clear
                              </button>
                              <button
                                onClick={() => setConfirmClear(false)}
                                className="flex-1 px-3 py-1.5 rounded-lg border border-line text-xs font-medium text-ink/70 hover:bg-ink/5 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.1} className="mb-6">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <Filter className="w-3.5 h-3.5 text-ink/30 shrink-0" />
                {filterTabs.map((tab) => {
                  const active = filter === tab.value;
                  const tabCount =
                    tab.value === 'all'
                      ? notifications.length
                      : tab.value === 'unread'
                        ? count
                        : stats.byType[tab.value] ?? 0;
                  return (
                    <button
                      key={tab.value}
                      onClick={() => setFilter(tab.value)}
                      className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        active
                          ? 'bg-ink text-canvas shadow-sm'
                          : 'text-ink/50 hover:text-ink hover:bg-ink/5'
                      }`}
                    >
                      {tab.label}
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                          active ? 'bg-canvas/20 text-canvas' : 'bg-ink/5 text-ink/40'
                        }`}
                      >
                        {tabCount}
                      </span>
                    </button>
                  );
                })}
              </div>
            </FadeIn>

            {displayed.length === 0 ? (
              <FadeIn delay={0.15}>
                <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-line bg-canvas">
                  <Bell className="w-10 h-10 text-ink/15" />
                  <p className="mt-4 text-sm font-medium text-ink/50">
                    {search
                      ? 'No notifications match your search'
                      : filter === 'unread'
                        ? 'All caught up! No unread notifications'
                        : filter !== 'all'
                          ? `No ${filter} notifications yet`
                          : 'No notifications yet'}
                  </p>
                  <p className="mt-1 text-xs text-ink/30">
                    {search
                      ? 'Try a different search term'
                      : 'Notifications will appear here when there is activity on your account'}
                  </p>
                </div>
              </FadeIn>
            ) : (
              <div className="space-y-2">
                {displayed.map((notification, i) => {
                  const config = typeConfig[notification.type];
                  const Icon = config.icon;
                  return (
                    <FadeIn key={notification.id} delay={0.02 * Math.min(i, 15)}>
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.25, ease: EASE }}
                        className={`group relative rounded-xl border bg-canvas p-4 sm:p-5 transition-all ${
                          notification.read
                            ? 'border-line hover:border-ink/15'
                            : 'border-ink/10 shadow-sm hover:border-ink/20'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`shrink-0 w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center`}
                          >
                            <Icon className={`w-5 h-5 ${config.color}`} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-2 min-w-0">
                                {!notification.read && (
                                  <span className="w-2 h-2 rounded-full bg-clay shrink-0" />
                                )}
                                <h4
                                  className={`text-sm truncate ${
                                    notification.read ? 'font-medium text-ink/70' : 'font-semibold text-ink'
                                  }`}
                                >
                                  {notification.title}
                                </h4>
                                <span
                                  className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium ${config.bg} ${config.color}`}
                                >
                                  {config.label}
                                </span>
                              </div>
                              <span className="text-[11px] text-ink/30 shrink-0 font-mono">
                                {timeAgo(notification.createdAt)}
                              </span>
                            </div>

                            <p
                              className={`mt-1 text-sm leading-relaxed ${
                                notification.read ? 'text-ink/40' : 'text-ink/60'
                              }`}
                            >
                              {notification.body}
                            </p>

                            {notification.meta && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {Object.entries(notification.meta).map(([key, val]) => (
                                  <span
                                    key={key}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-ink/5 text-[11px] font-mono text-ink/40"
                                  >
                                    {key}: {String(val)}
                                  </span>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center gap-2 mt-3">
                              {!notification.read && (
                                <motion.button
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => void markAsRead(notification.id)}
                                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium text-ink/40 hover:text-moss hover:bg-moss/10 transition-all"
                                >
                                  <Check className="w-3 h-3" />
                                  Mark read
                                </motion.button>
                              )}
                              <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => void deleteNotification(notification.id)}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium text-ink/40 hover:text-clay hover:bg-clay/10 transition-all"
                              >
                                <Trash2 className="w-3 h-3" />
                                Delete
                              </motion.button>
                            </div>
                          </div>
                        </div>

                        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowRight className="w-4 h-4 text-ink/20" />
                        </div>
                      </motion.div>
                    </FadeIn>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
