import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  LayoutDashboard, ArrowLeftRight, FileText, CreditCard, PiggyBank,
  BarChart3, Settings, LogOut, Menu, X, Bell,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Transactions', icon: ArrowLeftRight, path: '/transactions' },
  { label: 'Invoices', icon: FileText, path: '/invoices' },
  { label: 'Cards', icon: CreditCard, path: '/cards' },
  { label: 'Saving Plans', icon: PiggyBank, path: '/savings' },
  { label: 'Insights', icon: BarChart3, path: '/insights' },
  { label: 'Settings', icon: Settings, path: '/settings' },
];

export default function DashboardLayout({ children, title }: { children: React.ReactNode; title: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const openSidebar = useUiStore((s) => s.openSidebar);
  const closeSidebar = useUiStore((s) => s.closeSidebar);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex bg-canvas">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => closeSidebar()}
            className="fixed inset-0 z-30 bg-ink/40 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={prefersReducedMotion ? undefined : { x: -280 }}
        animate={prefersReducedMotion ? undefined : { x: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-ink flex flex-col transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex items-center justify-between px-6 pt-8 pb-6">
          <motion.div
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-clay" />
            <span className="font-mono text-xs tracking-[0.3em] uppercase text-canvas/70">Rocafella</span>
          </motion.div>
          <button
            onClick={() => closeSidebar()}
            className="lg:hidden text-canvas/50 hover:text-canvas transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pb-6 border-b border-canvas/10">
          <motion.div
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 10 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center gap-3"
          >
            <span className="w-9 h-9 rounded-full bg-clay/20 flex items-center justify-center text-sm font-medium text-clay">
              {(user.name?.[0] || user.email[0]).toUpperCase()}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-canvas truncate">{user.name || 'User'}</p>
              <p className="text-xs text-canvas/50 truncate">{user.email}</p>
            </div>
          </motion.div>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item, i) => {
            const active = location.pathname === item.path;
            return (
              <motion.button
                key={item.label}
                initial={prefersReducedMotion ? undefined : { opacity: 0, x: -16 }}
                animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => {
                  navigate(item.path);
                  closeSidebar();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition-all
                  ${active
                    ? 'bg-canvas/10 text-canvas font-medium'
                    : 'text-canvas/50 hover:text-canvas hover:bg-canvas/5'}`}
              >
                <item.icon className="w-4.5 h-4.5 shrink-0" />
                {item.label}
              </motion.button>
            );
          })}
        </nav>

        <div className="px-3 pb-6">
          <motion.button
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 10 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            onClick={handleLogout}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-lg text-sm text-clay hover:bg-clay/10 transition-colors"
          >
            <LogOut className="w-4.5 h-4.5 shrink-0" />
            Sign out
          </motion.button>
        </div>

        <div className="px-6 pb-6">
          <div className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.2em] text-canvas/30">
            <span className="w-8 h-px bg-canvas/20" />
            <span>Est. 2026</span>
          </div>
        </div>
      </motion.aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 bg-canvas/80 backdrop-blur-sm border-b border-line">
          <div className="flex items-center justify-between px-4 sm:px-8 h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => openSidebar()}
                className="lg:hidden text-ink/50 hover:text-ink transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <motion.h1
                initial={prefersReducedMotion ? undefined : { opacity: 0, y: -6 }}
                animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="font-serif text-xl text-ink"
              >
                {title}
              </motion.h1>
            </div>
            <motion.button
              initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.9 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2 rounded-lg text-ink/40 hover:text-ink hover:bg-sand/30 transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-clay" />
            </motion.button>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-8 py-6 sm:py-10">
          {children}
        </main>

        <footer className="border-t border-line bg-canvas">
          <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-clay" />
                <span className="font-mono text-[11px] tracking-[0.3em] uppercase text-ink/30">
                  Rocafella Finance
                </span>
              </div>
              <p className="text-xs text-ink/30">
                &copy; {new Date().getFullYear()} Rocafella Finance. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
