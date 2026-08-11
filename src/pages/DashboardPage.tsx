import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { DollarSign, ShoppingCart, PiggyBank, Loader2, AlertCircle, RefreshCw, Send, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import DashboardLayout from '../Components/Layout/DashboardLayout';
import { useDashboardStore } from '../store/dashboardStore';
import { FadeIn } from '../lib/FadeIn';
import { EASE } from '../lib/motion';

const statIcons = [DollarSign, PiggyBank, ShoppingCart];

const COLORS = ['#c27a6f', '#d4a574', '#8aa68a', '#a0aec0', '#718096'];

const quickAmounts = [100, 500, 1000, 5000];

export default function DashboardPage() {
  const stats = useDashboardStore((s) => s.stats);
  const incomeExpenseData = useDashboardStore((s) => s.incomeExpenseData);
  const categoryData = useDashboardStore((s) => s.categoryData);
  const recentTransactions = useDashboardStore((s) => s.recentTransactions);
  const loading = useDashboardStore((s) => s.loading);
  const error = useDashboardStore((s) => s.error);
  const lastUpdated = useDashboardStore((s) => s.lastUpdated);
  const fetchDashboard = useDashboardStore((s) => s.fetchDashboard);

  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [transferSent, setTransferSent] = useState(false);

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  const handleTransfer = () => {
    if (!recipient || !amount || Number(amount) <= 0) return;
    setTransferSent(true);
    setRecipient('');
    setAmount('');
    setTimeout(() => setTransferSent(false), 2500);
  };

  return (
    <DashboardLayout title="Dashboard">
      <div className="max-w-6xl mx-auto">
        <FadeIn className="relative overflow-hidden rounded-2xl bg-ink p-6 sm:p-8 mb-8">
          <div className="relative z-10">
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-canvas/50 mb-2">Welcome back</p>
            <h2 className="font-serif text-2xl sm:text-3xl text-canvas">Your Financial Overview</h2>
            <p className="mt-2 text-sm text-canvas/60 max-w-md">
              Here's an overview of your balance and recent activity.
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
              transition={{ duration: 2, ease: EASE }}
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
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
                <h3 className="font-serif text-lg text-ink mb-4">Quick Transfer</h3>
                <label htmlFor="transfer-to" className="block text-xs font-mono uppercase tracking-wider text-ink/40 mb-1.5">
                  Transfer to mobile number
                </label>
                <input
                  id="transfer-to"
                  type="tel"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="+1234567890"
                  className="w-full px-3 py-2.5 rounded-lg border border-line bg-sand/30 text-sm text-ink outline-none focus:border-ink transition-colors"
                />
                <p className="mt-2 text-xs text-ink/50">Send funds quickly to a verified mobile recipient.</p>

                <label htmlFor="transfer-amount" className="block text-xs font-mono uppercase tracking-wider text-ink/40 mb-1.5 mt-4">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink/40">रु</span>
                  <input
                    id="transfer-amount"
                    type="number"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-3 py-2.5 rounded-lg border border-line bg-sand/30 text-sm text-ink outline-none focus:border-ink transition-colors"
                  />
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {quickAmounts.map((q) => (
                    <button
                      key={q}
                      onClick={() => setAmount(String(q))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        amount === String(q)
                          ? 'border-ink bg-ink text-canvas'
                          : 'border-ink/15 text-ink/60 hover:border-ink/40 hover:text-ink'
                      }`}
                    >
                      ${q.toLocaleString()}
                    </button>
                  ))}
                </div>

                <motion.button
                  onClick={handleTransfer}
                  disabled={!recipient || !amount || Number(amount) <= 0}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="mt-5 flex items-center justify-center gap-2 w-full px-5 py-2.5 rounded-lg bg-ink text-canvas text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors hover:bg-ink/90"
                >
                  <Send className="w-4 h-4" />
                  Transfer
                </motion.button>
                <AnimatePresence>
                  {transferSent && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="mt-3 text-xs text-moss"
                    >
                      Transfer sent successfully.
                    </motion.p>
                  )}
                </AnimatePresence>
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

            <FadeIn delay={0.15} className="rounded-xl border border-line bg-canvas p-5 mb-8">
              <h3 className="font-serif text-lg text-ink mb-4">Net Balance Trend</h3>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart
                  data={incomeExpenseData.map((p) => ({ month: p.month, net: p.income - p.expenses }))}
                >
                  <defs>
                    <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8aa68a" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#8aa68a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e0dc" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#8b8983' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#8b8983' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#1c1917', border: 'none', borderRadius: 8, fontSize: 13, color: '#faf7f2' }}
                    formatter={(value) => [`रु${Number(value).toLocaleString()}`, 'Net balance']}
                  />
                  <Area type="monotone" dataKey="net" stroke="#8aa68a" strokeWidth={2} fill="url(#netGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </FadeIn>

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
                  <h3 className="font-serif text-lg text-ink">Recent Transactions</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-line">
                        <th className="text-left px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-ink/40">Description</th>
                        <th className="text-left px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-ink/40 hidden sm:table-cell">Category</th>
                        <th className="text-left px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-ink/40">Date</th>
                        <th className="text-right px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-ink/40">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTransactions.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-5 py-10 text-center text-sm text-ink/40">
                            No transactions yet. Your transactions will appear here.
                          </td>
                        </tr>
                      ) : (
                        recentTransactions.map((tx, i) => (
                          <motion.tr
                            key={tx.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 + i * 0.04 }}
                            className="border-b border-line/50 last:border-0 hover:bg-sand/20 transition-colors"
                          >
                            <td className="px-5 py-3.5">
                              <span className="flex items-center gap-2 text-ink">
                                {tx.type === 'income' ? (
                                  <ArrowDownLeft className="w-3.5 h-3.5 text-moss shrink-0" />
                                ) : (
                                  <ArrowUpRight className="w-3.5 h-3.5 text-clay shrink-0" />
                                )}
                                {tx.description}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-ink/70 hidden sm:table-cell">{tx.category}</td>
                            <td className="px-5 py-3.5 text-ink/50">{tx.date}</td>
                            <td className={`px-5 py-3.5 text-right font-medium ${tx.type === 'income' ? 'text-moss' : 'text-clay'}`}>
                              {tx.type === 'income' ? '+' : '-'}
                              {tx.amount}
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
