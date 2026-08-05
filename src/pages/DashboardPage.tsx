import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { DollarSign, ShoppingCart, TrendingUp, Users, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import DashboardLayout from '../Components/Layout/DashboardLayout';
import { useDashboardStore } from '../store/dashboardStore';
import { FadeIn } from '../lib/FadeIn';

const statIcons = [DollarSign, ShoppingCart, TrendingUp, Users];

const COLORS = ['#c27a6f', '#d4a574', '#8aa68a', '#a0aec0', '#718096'];
const statusColor: Record<string, string> = {
  Completed: 'text-moss bg-moss/10',
  'In Progress': 'text-sand bg-sand/10',
  Pending: 'text-ink/50 bg-ink/5',
};

export default function DashboardPage() {
  const stats = useDashboardStore((s) => s.stats);
  const portfolioData = useDashboardStore((s) => s.portfolioData);
  const incomeExpenseData = useDashboardStore((s) => s.incomeExpenseData);
  const categoryData = useDashboardStore((s) => s.categoryData);
  const recentOrders = useDashboardStore((s) => s.recentOrders);
  const loading = useDashboardStore((s) => s.loading);
  const error = useDashboardStore((s) => s.error);
  const lastUpdated = useDashboardStore((s) => s.lastUpdated);
  const fetchDashboard = useDashboardStore((s) => s.fetchDashboard);

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  return (
    <DashboardLayout title="Dashboard">
      <div className="max-w-6xl mx-auto">
        <FadeIn className="relative overflow-hidden rounded-2xl bg-ink p-6 sm:p-8 mb-8">
          <div className="relative z-10">
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-canvas/50 mb-2">Welcome back</p>
            <h2 className="font-serif text-2xl sm:text-3xl text-canvas">Your Financial Overview</h2>
            <p className="mt-2 text-sm text-canvas/60 max-w-md">
              Here's an overview of your portfolio and recent activity.
            </p>
            {lastUpdated && !loading && (
              <p className="mt-3 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-moss">
                <span className="w-1.5 h-1.5 rounded-full bg-moss animate-pulse" />
                Live &middot; updated {new Date(lastUpdated).toLocaleTimeString()}
              </p>
            )}
          </div>
          <svg className="absolute -right-12 -top-12 w-64 h-64 opacity-10" viewBox="0 0 200 200" aria-hidden="true">
            <motion.path
              d="M 50 150 Q 100 50 150 150 T 250 150"
              stroke="currentColor" className="text-canvas" strokeWidth="2"
              strokeDasharray="8 6" fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
            />
          </svg>
        </FadeIn>

        {error ? (
          <div className="mb-8 rounded-xl border border-clay/30 bg-clay/10 p-5 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-clay mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-clay">Couldn't load your dashboard</p>
              <p className="text-sm text-clay/80 mt-1">{error}</p>
            </div>
            <button
              onClick={() => void fetchDashboard()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-clay/10 text-clay hover:bg-clay/20 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        ) : loading ? (
          <div className="mb-8 flex flex-col items-center justify-center py-16 rounded-xl border border-line bg-canvas">
            <Loader2 className="w-6 h-6 text-ink/40 animate-spin" />
            <p className="mt-3 text-sm text-ink/50">Loading your financial data&hellip;</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map((stat, i) => {
                const Icon = statIcons[i] ?? statIcons[0];
                return (
                  <FadeIn key={stat.label} delay={0.05 * i}>
                    <div className="rounded-xl border border-line bg-canvas p-5 hover:border-ink/20 hover:-translate-y-0.5 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-mono uppercase tracking-wider text-ink/40">{stat.label}</span>
                        <Icon className="w-4 h-4 text-ink/30" />
                      </div>
                      <p className="font-serif text-2xl text-ink">{stat.value}</p>
                      {stat.change && <p className="text-xs mt-1 text-moss">{stat.change}</p>}
                    </div>
                  </FadeIn>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <FadeIn delay={0.1} className="rounded-xl border border-line bg-canvas p-5">
                <h3 className="font-serif text-lg text-ink mb-4">Portfolio Growth</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={portfolioData}>
                    <defs>
                      <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#c27a6f" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#c27a6f" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e0dc" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#8b8983' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#8b8983' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#1c1917', border: 'none', borderRadius: 8, fontSize: 13, color: '#faf7f2' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#c27a6f" strokeWidth={2} fill="url(#portfolioGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </FadeIn>

              <FadeIn delay={0.15} className="rounded-xl border border-line bg-canvas p-5">
                <h3 className="font-serif text-lg text-ink mb-4">Income vs Expenses</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={incomeExpenseData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e0dc" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#8b8983' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#8b8983' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#1c1917', border: 'none', borderRadius: 8, fontSize: 13, color: '#faf7f2' }}
                    />
                    <Bar dataKey="income" fill="#8aa68a" radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar dataKey="expenses" fill="#c27a6f" radius={[4, 4, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </FadeIn>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <FadeIn delay={0.1} className="rounded-xl border border-line bg-canvas p-5">
                <h3 className="font-serif text-lg text-ink mb-4">Spending by Category</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                      dataKey="value" stroke="none"
                    >
                      {categoryData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#1c1917', border: 'none', borderRadius: 8, fontSize: 13, color: '#faf7f2' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-3 mt-2">
                  {categoryData.map((cat, i) => (
                    <span key={cat.name} className="flex items-center gap-1.5 text-xs text-ink/60">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                      {cat.name}
                    </span>
                  ))}
                </div>
              </FadeIn>

              <FadeIn delay={0.2} className="lg:col-span-2 rounded-xl border border-line bg-canvas overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-line">
                  <h3 className="font-serif text-lg text-ink">Recent Orders</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-line">
                        <th className="text-left px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-ink/40">Order</th>
                        <th className="text-left px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-ink/40">Client</th>
                        <th className="text-left px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-ink/40 hidden sm:table-cell">Item</th>
                        <th className="text-left px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-ink/40">Amount</th>
                        <th className="text-left px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-ink/40">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-5 py-10 text-center text-sm text-ink/40">
                            No orders yet. Your orders will appear here.
                          </td>
                        </tr>
                      ) : (
                        recentOrders.map((order, i) => (
                          <motion.tr
                            key={order.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 + i * 0.04 }}
                            className="border-b border-line/50 last:border-0 hover:bg-sand/20 transition-colors"
                          >
                            <td className="px-5 py-3.5 text-ink font-medium">{order.id}</td>
                            <td className="px-5 py-3.5 text-ink/70">{order.client}</td>
                            <td className="px-5 py-3.5 text-ink/70 hidden sm:table-cell">{order.item}</td>
                            <td className="px-5 py-3.5 text-ink">{order.amount}</td>
                            <td className="px-5 py-3.5">
                              <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-medium ${statusColor[order.status]}`}>
                                {order.status}
                              </span>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </FadeIn>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
