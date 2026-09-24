import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  AlertCircle,
  RefreshCw,
  Percent,
  ArrowDownLeft,
  ArrowUpRight,
  PiggyBank,
  Trophy,
  Flame,
  Info,
} from 'lucide-react';
import DashboardLayout from '../Components/Layout/DashboardLayout';
import { useDashboardStore } from '../store/dashboardStore';
import { FadeIn } from '../lib/FadeIn';
import { EASE } from '../lib/motion';

const currency = (n: number) =>
  n.toLocaleString('en-NP', { style: 'currency', currency: 'NPR' });

const barColors = ['#c27a6f', '#d4a574', '#8aa68a', '#a0aec0', '#718096', '#b091c2'];

export default function AnalyticsPage() {
  const incomeExpenseData = useDashboardStore((s) => s.incomeExpenseData);
  const categoryData = useDashboardStore((s) => s.categoryData);
  const deposits = useDashboardStore((s) => s.deposits);
  const loading = useDashboardStore((s) => s.loading);
  const error = useDashboardStore((s) => s.error);
  const lastUpdated = useDashboardStore((s) => s.lastUpdated);
  const fetchDashboard = useDashboardStore((s) => s.fetchDashboard);

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  const months = incomeExpenseData;
  const totalIncome = months.reduce((s, m) => s + m.income, 0);
  const totalExpenses = months.reduce((s, m) => s + m.expenses, 0);
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;
  const avgDailySpend = months.length ? totalExpenses / (months.length * 30) : 0;

  const rows = months.map((m) => {
    const net = m.income - m.expenses;
    return {
      ...m,
      net,
      rate: m.income > 0 ? (net / m.income) * 100 : 0,
    };
  });

  const kpis = [
    {
      label: 'Total Income',
      value: currency(totalIncome),
      hint: `${currency(avgIncome(months))} avg / month`,
      Icon: ArrowDownLeft,
      toneClass: 'text-moss',
    },
    {
      label: 'Total Expenses',
      value: currency(totalExpenses),
      hint: `${currency(avgExpenses(months))} avg / month`,
      Icon: ArrowUpRight,
      toneClass: 'text-clay',
    },
    {
      label: 'Net Savings',
      value: `${netSavings >= 0 ? '+' : '-'}${currency(Math.abs(netSavings))}`,
      hint: `${currency(avgDailySpend)} estimated daily spend`,
      Icon: PiggyBank,
      toneClass: 'text-moss',
    },
    {
      label: 'Savings Rate',
      value: `${savingsRate.toFixed(1)}%`,
      hint: 'of income retained',
      Icon: Percent,
      toneClass: 'text-moss',
    },
  ];

  const delta = (key: 'income' | 'expenses') => {
    if (rows.length < 2) return null;
    const cur = rows[rows.length - 1][key];
    const prev = rows[rows.length - 2][key];
    if (prev === 0) return null;
    return ((cur - prev) / prev) * 100;
  };
  const incomeDelta = delta('income');
  const expenseDelta = delta('expenses');
  const rateDelta =
    rows.length >= 2 && rows[rows.length - 2].income > 0
      ? rows[rows.length - 1].rate - rows[rows.length - 2].rate
      : null;

  const deltas = [
    incomeDelta,
    expenseDelta,
    incomeDelta !== null && expenseDelta !== null ? incomeDelta - expenseDelta : null,
    rateDelta,
  ];

  const topCategory = categoryData[0];
  const bestMonth = [...rows].sort((a, b) => b.net - a.net)[0];
  const worstMonth = [...rows].sort((a, b) => a.net - b.net)[0];

  const savingsData = rows.map((r) => ({
    month: r.month,
    rate: Math.round(r.rate * 10) / 10,
  }));

  const depositProjection = deposits.map((d) => {
    const interest = (d.amount * d.rate) / 100;
    return { name: d.label, principal: d.amount, projected: d.amount + interest };
  });

  return (
    <DashboardLayout title="Analytics">
      <div className="max-w-6xl mx-auto">
        <FadeIn className="relative overflow-hidden rounded-2xl bg-ink p-6 sm:p-8 mb-8">
          <div className="relative z-10">
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-canvas/50 mb-2">Insight engine</p>
            <h2 className="font-serif text-2xl sm:text-3xl text-canvas">Your Financial Patterns</h2>
            <p className="mt-2 text-sm text-canvas/60 max-w-md">
              Deep-dive into monthly behaviour, spending habits and deposit growth.
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
              <p className="text-sm font-medium text-clay">Couldn't load analytics data</p>
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
            <p className="mt-3 text-sm text-ink/50">Crunching your numbers&hellip;</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {kpis.map((kpi, i) => {
                const d = deltas[i];
                return (
                  <FadeIn key={kpi.label} delay={0.05 * i}>
                    <div className="rounded-xl border border-line bg-canvas p-5 hover:border-ink/20 hover:-translate-y-0.5 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-mono uppercase tracking-wider text-ink/40">{kpi.label}</span>
                        <kpi.Icon className={`w-4 h-4 ${kpi.toneClass}`} />
                      </div>
                      <p className={`font-serif text-2xl ${kpi.toneClass}`}>{kpi.value}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        {d !== null && d !== undefined ? (
                          <DeltaBadge value={d} positiveIsGood={kpi.label !== 'Total Expenses'} />
                        ) : null}
                        <p className="text-xs text-ink/50 truncate">{kpi.hint}</p>
                      </div>
                    </div>
                  </FadeIn>
                );
              })}
            </div>

            <FadeIn delay={0.1} className="rounded-xl border border-line bg-canvas overflow-hidden mb-8">
              <div className="flex items-center justify-between px-5 py-4 border-b border-line">
                <div>
                  <h3 className="font-serif text-lg text-ink">Monthly Breakdown</h3>
                  <p className="text-xs text-ink/50 mt-0.5">Income, expenses, net and savings rate per month</p>
                </div>
                <Info className="w-5 h-5 text-ink/30" />
              </div>
              {rows.length === 0 ? (
                <div className="px-5 py-14 flex flex-col items-center justify-center text-center">
                  <PiggyBank className="w-8 h-8 text-ink/20 mb-3" />
                  <p className="text-sm text-ink/50">No transaction history yet. Monthly trends will appear here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-line">
                        <th className="text-left px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-ink/40">Month</th>
                        <th className="text-right px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-ink/40">Income</th>
                        <th className="text-right px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-ink/40">Expenses</th>
                        <th className="text-right px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-ink/40">Net</th>
                        <th className="text-right px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-ink/40 hidden sm:table-cell">Savings Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r, i) => (
                        <motion.tr
                          key={r.month}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.1 + i * 0.03 }}
                          className={`border-b border-line/50 last:border-0 hover:bg-sand/20 transition-colors ${
                            r.rate < 0 ? 'bg-clay/[0.04]' : r.rate >= 30 ? 'bg-moss/[0.05]' : ''
                          }`}
                        >
                          <td className="px-5 py-3.5 font-medium text-ink">{r.month}</td>
                          <td className="px-5 py-3.5 text-right text-ink/70">{currency(r.income)}</td>
                          <td className="px-5 py-3.5 text-right text-ink/70">{currency(r.expenses)}</td>
                          <td className={`px-5 py-3.5 text-right font-medium ${r.net >= 0 ? 'text-moss' : 'text-clay'}`}>
                            {r.net >= 0 ? '+' : '-'}{currency(Math.abs(r.net))}
                          </td>
                          <td className="px-5 py-3.5 text-right hidden sm:table-cell">
                            {r.income === 0 ? (
                              <span className="text-ink/30">—</span>
                            ) : (
                              <span className={`inline-flex items-center gap-1.5 font-medium ${r.rate >= 0 ? 'text-moss' : 'text-clay'}`}>
                                {r.rate.toFixed(1)}%
                                <RateDot rate={r.rate} />
                              </span>
                            )}
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
                <h3 className="font-serif text-lg text-ink mb-4">Savings Rate Trend</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={savingsData}>
                    <defs>
                      <linearGradient id="rateGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#d4a574" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#d4a574" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e0dc" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#8b8983' }} axisLine={false} tickLine={false} />
                    <YAxis unit="%" tick={{ fontSize: 12, fill: '#8b8983' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#1c1917', border: 'none', borderRadius: 8, fontSize: 13, color: '#faf7f2' }}
                      formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Savings rate']}
                    />
                    <Area type="monotone" dataKey="rate" stroke="#d4a574" strokeWidth={2} fill="url(#rateGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </FadeIn>

              <FadeIn delay={0.15} className="rounded-xl border border-line bg-canvas p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif text-lg text-ink">Spending Rank</h3>
                  <Info className="w-5 h-5 text-ink/30" />
                </div>
                {categoryData.length === 0 ? (
                  <div className="py-14 flex flex-col items-center justify-center text-center">
                    <Flame className="w-8 h-8 text-ink/20 mb-3" />
                    <p className="text-sm text-ink/50">No expense categories yet. Your top spenders will rank here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {categoryData.map((cat, i) => {
                      const share = totalExpenses > 0 ? (cat.value / totalExpenses) * 100 : 0;
                      return (
                        <div key={cat.name}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-ink flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: barColors[i % barColors.length] }}
                              />
                              {cat.name}
                            </span>
                            <span className="text-xs font-mono text-ink/50">{share.toFixed(1)}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-sand/50 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.max(share, 3)}%` }}
                              transition={{ duration: 0.8, delay: 0.1 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                              className="h-full rounded-full"
                              style={{ backgroundColor: barColors[i % barColors.length] }}
                            />
                          </div>
                          <p className="mt-1 text-[11px] text-ink/40 text-right">{currency(cat.value)}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </FadeIn>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <FadeIn delay={0.05}>
                <div className="h-full rounded-xl border border-line bg-canvas p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy className="w-4.5 h-4.5 text-moss" />
                    <h3 className="font-serif text-lg text-ink">Best Month</h3>
                  </div>
                  <p className="font-serif text-2xl text-moss">{bestMonth?.month ?? '—'}</p>
                  {bestMonth && (
                    <p className="mt-1 text-xs text-ink/50">
                      +{currency(bestMonth.net)} net at {bestMonth.rate.toFixed(1)}% savings rate
                    </p>
                  )}
                </div>
              </FadeIn>
              <FadeIn delay={0.1}>
                <div className="h-full rounded-xl border border-line bg-canvas p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingDown className="w-4.5 h-4.5 text-clay" />
                    <h3 className="font-serif text-lg text-ink">Toughest Month</h3>
                  </div>
                  <p className="font-serif text-2xl text-clay">{worstMonth?.month ?? '—'}</p>
                  {worstMonth && (
                    <p className="mt-1 text-xs text-ink/50">
                      {worstMonth.net >= 0 ? '+' : '-'}{currency(Math.abs(worstMonth.net))} net at {worstMonth.rate.toFixed(1)}%
                    </p>
                  )}
                </div>
              </FadeIn>
              <FadeIn delay={0.15}>
                <div className="h-full rounded-xl border border-line bg-canvas p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Flame className="w-4.5 h-4.5 text-clay" />
                    <h3 className="font-serif text-lg text-ink">Top Spender</h3>
                  </div>
                  {topCategory ? (
                    <>
                      <p className="font-serif text-2xl text-ink">{topCategory.name}</p>
                      <p className="mt-1 text-xs text-ink/50">
                        {currency(topCategory.value)} — {totalExpenses > 0 ? ((topCategory.value / totalExpenses) * 100).toFixed(1) : 0}% of all spending
                      </p>
                    </>
                  ) : (
                    <p className="font-serif text-2xl text-ink/30">—</p>
                  )}
                </div>
              </FadeIn>
            </div>

            <FadeIn delay={0.15} className="rounded-xl border border-line bg-canvas p-5 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <PiggyBank className="w-4.5 h-4.5 text-clay" />
                <h3 className="font-serif text-lg text-ink">Deposit Growth Projection</h3>
              </div>
              {depositProjection.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <TrendingDown className="w-8 h-8 text-ink/20 mb-3" />
                  <p className="text-sm text-ink/50">No deposits yet. Your fixed deposits will be projected here.</p>
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={depositProjection}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e0dc" />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#8b8983' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: '#8b8983' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: '#1c1917', border: 'none', borderRadius: 8, fontSize: 13, color: '#faf7f2' }}
                        formatter={(value) => [currency(Number(value)), undefined]}
                      />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: '#57534e' }} />
                      <Bar dataKey="principal" name="Principal" fill="#718096" radius={[4, 4, 0, 0]} barSize={20} />
                      <Bar dataKey="projected" name="Projected value" fill="#8aa68a" radius={[4, 4, 0, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-ink/50 mt-3">
                    Projected totals assume simple interest at each deposit's stated rate.
                  </p>
                </>
              )}
            </FadeIn>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

function avgIncome(months: { income: number }[]) {
  return months.length ? months.reduce((s, m) => s + m.income, 0) / months.length : 0;
}

function avgExpenses(months: { expenses: number }[]) {
  return months.length ? months.reduce((s, m) => s + m.expenses, 0) / months.length : 0;
}

function DeltaBadge({ value, positiveIsGood }: { value: number; positiveIsGood: boolean }) {
  const positive = value >= 0;
  const good = positiveIsGood ? positive : !positive;
  const Icon = value === 0 ? Minus : positive ? TrendingUp : TrendingDown;
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-medium ${
        good ? 'bg-moss/10 text-moss' : 'bg-clay/10 text-clay'
      }`}
    >
      <Icon className="w-3 h-3" />
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

function RateDot({ rate }: { rate: number }) {
  return (
    <span
      className={`w-1.5 h-1.5 rounded-full inline-block ${
        rate >= 30 ? 'bg-moss' : rate >= 0 ? 'bg-ink/40' : 'bg-clay'
      }`}
    />
  );
}