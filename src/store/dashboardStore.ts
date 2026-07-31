import { create } from 'zustand';

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

type DashboardState = {
  stats: Stat[];
  portfolioData: PortfolioPoint[];
  incomeExpenseData: IncomeExpensePoint[];
  categoryData: CategoryPoint[];
  recentOrders: Order[];
  updateStats: (stats: Stat[]) => void;
  updateRecentOrders: (orders: Order[]) => void;
};

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: [
    { label: 'Total Balance', value: '$24,890.00', change: '+12.5%' },
    { label: 'Active Orders', value: '14', change: '+3' },
    { label: 'Portfolio Growth', value: '18.2%', change: '+4.1%' },
    { label: 'Clients', value: '342', change: '+28' },
  ],
  portfolioData: [
    { month: 'Jan', value: 18400 },
    { month: 'Feb', value: 19200 },
    { month: 'Mar', value: 20800 },
    { month: 'Apr', value: 21500 },
    { month: 'May', value: 23200 },
    { month: 'Jun', value: 24890 },
  ],
  incomeExpenseData: [
    { month: 'Jan', income: 4200, expenses: 2800 },
    { month: 'Feb', income: 3800, expenses: 3100 },
    { month: 'Mar', income: 5100, expenses: 2600 },
    { month: 'Apr', income: 4600, expenses: 3300 },
    { month: 'May', income: 5400, expenses: 2900 },
    { month: 'Jun', income: 6200, expenses: 3500 },
  ],
  categoryData: [
    { name: 'Shopping', value: 35 },
    { name: 'Bills', value: 25 },
    { name: 'Food', value: 20 },
    { name: 'Transport', value: 12 },
    { name: 'Other', value: 8 },
  ],
  recentOrders: [
    { id: '#ORD-001', client: 'Sarah Johnson', item: 'Summer Collection', amount: '$1,200', status: 'Completed' },
    { id: '#ORD-002', client: 'Marcus Lee', item: 'Tailored Suit', amount: '$3,400', status: 'In Progress' },
    { id: '#ORD-003', client: 'Elena Rodriguez', item: 'Accessories Set', amount: '$680', status: 'Completed' },
    { id: '#ORD-004', client: 'David Kim', item: 'Winter Coat', amount: '$2,100', status: 'Pending' },
    { id: '#ORD-005', client: 'Amara Okafor', item: 'Custom Dress', amount: '$1,850', status: 'In Progress' },
  ],
  updateStats: (stats) => set({ stats }),
  updateRecentOrders: (recentOrders) => set({ recentOrders }),
}));
