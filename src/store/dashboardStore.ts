import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export type Stat = {
  label: string;
  value: string;
  change: string;
};

export type PortfolioPoint = { month: string; value: number };
export type IncomeExpensePoint = { month: string; income: number; expenses: number };
export type CategoryPoint = { name: string; value: number };
export type Order = {
  id: string;
  client: string;
  item: string;
  amount: string;
  status: 'Completed' | 'In Progress' | 'Pending';
};

type DbTransaction = {
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string;
};

type DbSnapshot = { period: string; value: number };
type DbOrder = {
  id: string;
  client: string;
  item: string;
  amount: number;
  status: 'Completed' | 'In Progress' | 'Pending';
  created_at?: string;
};

type DashboardState = {
  stats: Stat[];
  portfolioData: PortfolioPoint[];
  incomeExpenseData: IncomeExpensePoint[];
  categoryData: CategoryPoint[];
  recentOrders: Order[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  fetchDashboard: () => Promise<void>;
};

const currency = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

const pct = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`;

function monthLabel(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(`${date}T00:00:00`) : date;
  return d.toLocaleString('en-US', { month: 'short' });
}

function buildDashboard(txs: DbTransaction[], snapshots: DbSnapshot[], orders: DbOrder[], clientCount: number) {
  const totals = { income: 0, expenses: 0 };
  const incomeByMonth = new Map<string, number>();
  const expensesByMonth = new Map<string, number>();
  const expensesByCategory = new Map<string, number>();

  for (const tx of txs) {
    const label = monthLabel(tx.date);
    if (tx.type === 'income') {
      totals.income += tx.amount;
      incomeByMonth.set(label, (incomeByMonth.get(label) ?? 0) + tx.amount);
    } else {
      totals.expenses += tx.amount;
      expensesByMonth.set(label, (expensesByMonth.get(label) ?? 0) + tx.amount);
      expensesByCategory.set(tx.category, (expensesByCategory.get(tx.category) ?? 0) + tx.amount);
    }
  }

  const allMonths = Array.from(new Set([...incomeByMonth.keys(), ...expensesByMonth.keys()]));
  const incomeExpenseData: IncomeExpensePoint[] = allMonths.map((month) => ({
    month,
    income: Math.round(incomeByMonth.get(month) ?? 0),
    expenses: Math.round(expensesByMonth.get(month) ?? 0),
  }));

  const categoryData: CategoryPoint[] = Array.from(expensesByCategory.entries())
    .map(([name, value]) => ({ name, value: Math.round(value) }))
    .sort((a, b) => b.value - a.value);

  const orderedSnapshots = [...snapshots].sort(
    (a, b) => new Date(a.period).getTime() - new Date(b.period).getTime(),
  );
  const portfolioData: PortfolioPoint[] = orderedSnapshots.map((s) => ({
    month: monthLabel(s.period),
    value: Math.round(s.value),
  }));

  const balance = totals.income - totals.expenses;
  const lastMonth = allMonths.at(-1);
  const prevMonth = allMonths.at(-2);
  const thisNet = lastMonth ? (incomeByMonth.get(lastMonth) ?? 0) - (expensesByMonth.get(lastMonth) ?? 0) : 0;
  const prevNet = prevMonth ? (incomeByMonth.get(prevMonth) ?? 0) - (expensesByMonth.get(prevMonth) ?? 0) : 0;
  const balanceChange = prevNet !== 0 ? ((thisNet - prevNet) / Math.abs(prevNet)) * 100 : 0;

  const activeOrders = orders.filter((o) => o.status !== 'Completed').length;
  const now = new Date();
  const thisMonthOrders = orders.filter(
    (o) => new Date(o.created_at ?? now).getMonth() === now.getMonth(),
  ).length;
  const lastMonthOrders = orders.filter((o) => new Date(o.created_at ?? now).getMonth() === now.getMonth() - 1).length;

  const growth =
    portfolioData.length >= 2
      ? ((portfolioData.at(-1)!.value - portfolioData[0].value) / portfolioData[0].value) * 100
      : 0;
  const lastGrowth =
    portfolioData.length >= 3
      ? ((portfolioData.at(-1)!.value - portfolioData.at(-2)!.value) / portfolioData.at(-2)!.value) * 100
      : growth;

  const stats: Stat[] = [
    { label: 'Total Balance', value: currency(balance), change: `${pct(balanceChange)} this month` },
    { label: 'Active Orders', value: String(activeOrders), change: `${thisMonthOrders - lastMonthOrders >= 0 ? '+' : ''}${thisMonthOrders - lastMonthOrders} this month` },
    { label: 'Portfolio Growth', value: pct(growth), change: `${pct(lastGrowth)} this month` },
    { label: 'Clients', value: String(clientCount), change: '' },
  ];

  const recentOrders: Order[] = orders.slice(0, 8).map((o) => ({
    id: `#${o.id.slice(0, 6).toUpperCase()}`,
    client: o.client,
    item: o.item,
    amount: currency(o.amount),
    status: o.status,
  }));

  return { stats, portfolioData, incomeExpenseData, categoryData, recentOrders };
}

let realtimeChannel: RealtimeChannel | null = null;

function attachRealtime(fetch: () => Promise<void>) {
  if (realtimeChannel || !isSupabaseConfigured) return;
  realtimeChannel = supabase
    .channel('dashboard-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'transactions' },
      () => void fetch(),
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'orders' },
      () => void fetch(),
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'portfolio_snapshots' },
      () => void fetch(),
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'clients' },
      () => void fetch(),
    )
    .subscribe();
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  stats: [],
  portfolioData: [],
  incomeExpenseData: [],
  categoryData: [],
  recentOrders: [],
  loading: false,
  error: null,
  lastUpdated: null,

  fetchDashboard: async () => {
    if (!isSupabaseConfigured) {
      set({ error: 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.' });
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    set({ loading: true, error: null });

    try {
      const [txRes, snapRes, orderRes, clientRes] = await Promise.all([
        supabase.from('transactions').select('type, category, amount, date').order('date', { ascending: true }),
        supabase.from('portfolio_snapshots').select('period, value').order('period', { ascending: true }),
        supabase.from('orders').select('id, client, item, amount, status, created_at').order('created_at', { ascending: false }).limit(20),
        supabase.from('clients').select('id', { count: 'exact', head: true }),
      ]);

      const firstError = [txRes, snapRes, orderRes, clientRes].find((r) => r.error)?.error;
      if (firstError) throw firstError;

      const data = buildDashboard(
        txRes.data ?? [],
        snapRes.data ?? [],
        orderRes.data ?? [],
        clientRes.count ?? 0,
      );

      set({ ...data, loading: false, lastUpdated: new Date().toISOString() });
      attachRealtime(() => get().fetchDashboard());
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load dashboard data.',
      });
    }
  },
}));
