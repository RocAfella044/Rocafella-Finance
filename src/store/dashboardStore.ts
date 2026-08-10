import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export type Stat = {
  label: string;
  value: string;
  change: string;
};

export type IncomeExpensePoint = { month: string; income: number; expenses: number };
export type CategoryPoint = { name: string; value: number };
export type Transaction = {
  id: string;
  description: string;
  category: string;
  amount: string;
  date: string;
  type: 'income' | 'expense';
};
export type Recipient = { name: string; email: string | null };

type DbTransaction = {
  id: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  date: string;
};

type DbClient = { name: string; email: string | null };

type DashboardState = {
  stats: Stat[];
  incomeExpenseData: IncomeExpensePoint[];
  categoryData: CategoryPoint[];
  recentTransactions: Transaction[];
  recipients: Recipient[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  fetchDashboard: () => Promise<void>;
};

const currency = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

const pct = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`;

function monthLabel(date: string): string {
  const d = new Date(`${date}T00:00:00`);
  return d.toLocaleString('en-US', { month: 'short' });
}

function buildDashboard(txs: DbTransaction[], clients: DbClient[]) {
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

  const balance = totals.income - totals.expenses;
  const lastMonth = allMonths.at(-1);
  const prevMonth = allMonths.at(-2);
  const thisNet = lastMonth ? (incomeByMonth.get(lastMonth) ?? 0) - (expensesByMonth.get(lastMonth) ?? 0) : 0;
  const prevNet = prevMonth ? (incomeByMonth.get(prevMonth) ?? 0) - (expensesByMonth.get(prevMonth) ?? 0) : 0;
  const balanceChange = prevNet !== 0 ? ((thisNet - prevNet) / Math.abs(prevNet)) * 100 : 0;

  const thisIncome = lastMonth ? (incomeByMonth.get(lastMonth) ?? 0) : 0;
  const prevIncome = prevMonth ? (incomeByMonth.get(prevMonth) ?? 0) : 0;
  const thisExpense = lastMonth ? (expensesByMonth.get(lastMonth) ?? 0) : 0;
  const prevExpense = prevMonth ? (expensesByMonth.get(prevMonth) ?? 0) : 0;
  const incomeChange = prevIncome !== 0 ? ((thisIncome - prevIncome) / Math.abs(prevIncome)) * 100 : 0;
  const expenseChange = prevExpense !== 0 ? ((thisExpense - prevExpense) / Math.abs(prevExpense)) * 100 : 0;

  const stats: Stat[] = [
    { label: 'Total Balance', value: currency(balance), change: `${pct(balanceChange)} this month` },
    { label: 'Total Income', value: currency(totals.income), change: `${pct(incomeChange)} this month` },
    { label: 'Total Expenses', value: currency(totals.expenses), change: `${pct(expenseChange)} this month` },
  ];

  const recentTransactions: Transaction[] = [...txs]
    .reverse()
    .slice(0, 8)
    .map((tx) => ({
      id: tx.id,
      description: tx.description || tx.category,
      category: tx.category,
      amount: currency(tx.amount),
      date: new Date(`${tx.date}T00:00:00`).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      type: tx.type,
    }));

  const recipients: Recipient[] = clients.map((c) => ({ name: c.name, email: c.email }));

  return { stats, incomeExpenseData, categoryData, recentTransactions, recipients };
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
      { event: '*', schema: 'public', table: 'clients' },
      () => void fetch(),
    )
    .subscribe();
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  stats: [],
  incomeExpenseData: [],
  categoryData: [],
  recentTransactions: [],
  recipients: [],
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
      const [txRes, clientRes] = await Promise.all([
        supabase
          .from('transactions')
          .select('id, type, category, description, amount, date')
          .order('date', { ascending: true }),
        supabase.from('clients').select('name, email').order('name', { ascending: true }),
      ]);

      const firstError = [txRes, clientRes].find((r) => r.error)?.error;
      if (firstError) throw firstError;

      const data = buildDashboard(txRes.data ?? [], clientRes.data ?? []);

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
