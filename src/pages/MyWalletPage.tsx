import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Area, AreaChart } from 'recharts';
import { PiggyBank, TrendingUp, Wallet, Loader2, AlertCircle, RefreshCw, CalendarClock, Landmark } from 'lucide-react';
import DashboardLayout from '../Components/Layout/DashboardLayout';
import { useDashboardStore } from '../store/dashboardStore';
import { FadeIn } from '../lib/FadeIn';
import { EASE } from '../lib/motion';

const currency = (n: number) =>
  n.toLocaleString('en-NP', { style: 'currency', currency: 'NPR' });

export default function MyWalletPage() {
  const deposits = useDashboardStore((s) => s.deposits);
  const incomeExpenseData = useDashboardStore((s) => s.incomeExpenseData);
  const loading = useDashboardStore((s) => s.loading);
  const error = useDashboardStore((s) => s.error);
  const lastUpdated = useDashboardStore((s) => s.lastUpdated);
  const fetchDashboard = useDashboardStore((s) => s.fetchDashboard);

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  const totalDeposited = deposits.reduce((s, d) => s + d.amount, 0);
  const totalInterest = deposits.reduce((s, d) => s + (d.amount * d.rate) / 100, 0);
  const netIncome = incomeExpenseData.reduce((s, p) => s + p.income, 0);
  const netExpenses = incomeExpenseData.reduce((s, p) => s + p.expenses, 0);
  const netCashFlow = netIncome - netExpenses;

  const maturityValue = (d: { amount: number; rate: number }) =>
    d.amount + (d.amount * d.rate) / 100;

  const totalBlocked = deposits.filter((d) => d.maturity_date && new Date(d.maturity_date) > new Date())
    .length;

  return (
    <DashboardLayout title="My Wallet">
      <div className="max-w-6xl mx-auto">
        <FadeIn className="relative overflow-hidden rounded-2xl bg-ink p-6 sm:p-8 mb-8">
          <div className="relative z-10">
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-canvas/50 mb-2">Wallet</p>
            <h2 className="font-serif text-2xl sm:text-3xl text-canvas">Deposits &amp; Cash Flow</h2>
            <p className="mt-2 text-sm text-canvas/60 max-w-md">
              Track your fixed deposits and how money moves in and out.
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
              <p className="text-sm font-medium text-clay">Couldn't load wallet data</p>
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
            <p className="mt-3 text-sm text-ink/50">Loading your wallet&hellip;</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <FadeIn delay={0.05}>
                <div className="rounded-xl border border-line bg-canvas p-5 hover:border-ink/20 hover:-translate-y-0.5 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono uppercase tracking-wider text-ink/40">Total Deposited</span>
                    <Landmark className="w-4 h-4 text-ink/30" />
                  </div>
                  <p className="font-serif text-2xl text-ink">{currency(totalDeposited)}</p>
                  {totalBlocked > 0 && (
                    <p className="text-xs mt-1 text-ink/50">{totalBlocked} deposit{totalBlocked === 1 ? '' : 's'} active</p>
                  )}
                </div>
              </FadeIn>
              <FadeIn delay={0.1}>
                <div className="rounded-xl border border-line bg-canvas p-5 hover:border-ink/20 hover:-translate-y-0.5 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono uppercase tracking-wider text-ink/40">Accrued Interest</span>
                    <PiggyBank className="w-4 h-4 text-ink/30" />
                  </div>
                  <p className="font-serif text-2xl text-ink text-moss">{currency(totalInterest)}</p>
                  <p className="text-xs mt-1 text-ink/50">Across {deposits.length} deposit{deposits.length === 1 ? '' : 's'}</p>
                </div>
              </FadeIn>
              <FadeIn delay={0.15}>
                <div className="rounded-xl border border-line bg-canvas p-5 hover:border-ink/20 hover:-translate-y-0.5 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono uppercase tracking-wider text-ink/40">Net Cash Flow</span>
                    <TrendingUp className="w-4 h-4 text-ink/30" />
                  </div>
                  <p className={`font-serif text-2xl ${netCashFlow >= 0 ? 'text-ink text-moss' : 'text-ink text-clay'}`}>
                    {netCashFlow >= 0 ? '+' : ''}{currency(netCashFlow)}
                  </p>
                  <p className="text-xs mt-1 text-ink/50">
                    {currency(netIncome)} in &middot; {currency(netExpenses)} out
                  </p>
                </div>
              </FadeIn>
            </div>

            <FadeIn delay={0.1} className="rounded-xl border border-line bg-canvas overflow-hidden mb-8">
              <div className="flex items-center justify-between px-5 py-4 border-b border-line">
                <div>
                  <h3 className="font-serif text-lg text-ink">Fixed Deposits</h3>
                  <p className="text-xs text-ink/50 mt-0.5">Interest at {deposits.length ? deposits[0].rate : 0}% p.a. simple</p>
                </div>
                <Landmark className="w-5 h-5 text-ink/30" />
              </div>
              {deposits.length === 0 ? (
                <div className="px-5 py-14 flex flex-col items-center justify-center text-center">
                  <PiggyBank className="w-8 h-8 text-ink/20 mb-3" />
                  <p className="text-sm text-ink/50">No deposits yet. Add a fixed deposit to start earning interest.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-line">
                        <th className="text-left px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-ink/40">Deposit</th>
                        <th className="text-left px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-ink/40">Principal</th>
                        <th className="text-left px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-ink/40">Rate</th>
                        <th className="text-left px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-ink/40 hidden md:table-cell">Maturity</th>
                        <th className="text-right px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-ink/40">Projected Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deposits.map((d, i) => (
                        <motion.tr
                          key={d.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.1 + i * 0.04 }}
                          className="border-b border-line/50 last:border-0 hover:bg-sand/20 transition-colors"
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2 text-ink">
                              <PiggyBank className="w-3.5 h-3.5 text-clay shrink-0" />
                              {d.label}
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-ink/70">{currency(d.amount)}</td>
                          <td className="px-5 py-3.5 text-ink/70">{d.rate}%</td>
                          <td className="px-5 py-3.5 hidden md:table-cell">
                            {d.maturity_date ? (
                              <span className="inline-flex items-center gap-1.5 text-ink/70">
                                <CalendarClock className="w-3.5 h-3.5 text-ink/40" />
                                {new Date(`${d.maturity_date}T00:00:00`).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                            ) : (
                              <span className="text-ink/40">Open-ended</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <span className="text-moss font-medium">{currency(maturityValue(d))}</span>
                            <p className="text-[11px] text-ink/40 mt-0.5">+{currency(d.amount * d.rate / 100)} interest</p>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </FadeIn>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <FadeIn delay={0.1} className="rounded-xl border border-line bg-canvas p-5">
                <h3 className="font-serif text-lg text-ink mb-4">Income vs Expenses</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={incomeExpenseData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e0dc" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#8b8983' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#8b8983' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#1c1917', border: 'none', borderRadius: 8, fontSize: 13, color: '#faf7f2' }}
                    />
                    <Bar dataKey="income" name="Income" fill="#8aa68a" radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar dataKey="expenses" name="Expenses" fill="#c27a6f" radius={[4, 4, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </FadeIn>

              <FadeIn delay={0.15} className="rounded-xl border border-line bg-canvas p-5">
                <h3 className="font-serif text-lg text-ink mb-4">Cash Flow Trend</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart
                    data={incomeExpenseData.map((p) => ({ month: p.month, net: p.income - p.expenses }))}
                  >
                    <defs>
                      <linearGradient id="walletNetGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8aa68a" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#8aa68a" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e0dc" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#8b8983' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#8b8983' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#1c1917', border: 'none', borderRadius: 8, fontSize: 13, color: '#faf7f2' }}
                      formatter={(value) => [`रु${Number(value).toLocaleString()}`, 'Net']}
                    />
                    <Area type="monotone" dataKey="net" stroke="#8aa68a" strokeWidth={2} fill="url(#walletNetGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </FadeIn>
            </div>

            <FadeIn delay={0.2} className="rounded-xl border border-line bg-canvas p-5 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Wallet className="w-4.5 h-4.5 text-clay" />
                <h3 className="font-serif text-lg text-ink">Cash Flow Summary</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-lg border border-line bg-sand/30 p-4">
                  <p className="text-xs font-mono uppercase tracking-wider text-ink/40 mb-1">Total Income</p>
                  <p className="font-serif text-xl text-moss">+{currency(netIncome)}</p>
                </div>
                <div className="rounded-lg border border-line bg-sand/30 p-4">
                  <p className="text-xs font-mono uppercase tracking-wider text-ink/40 mb-1">Total Expenses</p>
                  <p className="font-serif text-xl text-clay">-{currency(netExpenses)}</p>
                </div>
                <div className="rounded-lg border border-line bg-sand/30 p-4">
                  <p className="text-xs font-mono uppercase tracking-wider text-ink/40 mb-1">Net Position</p>
                  <p className={`font-serif text-xl ${netCashFlow >= 0 ? 'text-moss' : 'text-clay'}`}>
                    {netCashFlow >= 0 ? '+' : '-'}{currency(Math.abs(netCashFlow))}
                  </p>
                </div>
              </div>
            </FadeIn>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}