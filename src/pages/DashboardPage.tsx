import { motion, useReducedMotion, type Variants } from 'framer-motion';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
} from 'recharts';
import { DollarSign, ShoppingCart, TrendingUp, Users } from 'lucide-react';
import DashboardLayout from '../Components/Layout/DashboardLayout';

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09, delayChildren: 0.15 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

const stats = [
  { label: 'Total Balance', value: '$24,890.00', change: '+12.5%', icon: DollarSign },
  { label: 'Active Orders', value: '14', change: '+3', icon: ShoppingCart },
  { label: 'Portfolio Growth', value: '18.2%', change: '+4.1%', icon: TrendingUp },
  { label: 'Clients', value: '342', change: '+28', icon: Users },
];

const portfolioData = [
  { month: 'Jan', value: 18400 },
  { month: 'Feb', value: 19200 },
  { month: 'Mar', value: 20800 },
  { month: 'Apr', value: 21500 },
  { month: 'May', value: 23200 },
  { month: 'Jun', value: 24890 },
];

const incomeExpenseData = [
  { month: 'Jan', income: 4200, expenses: 2800 },
  { month: 'Feb', income: 3800, expenses: 3100 },
  { month: 'Mar', income: 5100, expenses: 2600 },
  { month: 'Apr', income: 4600, expenses: 3300 },
  { month: 'May', income: 5400, expenses: 2900 },
  { month: 'Jun', income: 6200, expenses: 3500 },
];

const categoryData = [
  { name: 'Shopping', value: 35 },
  { name: 'Bills', value: 25 },
  { name: 'Food', value: 20 },
  { name: 'Transport', value: 12 },
  { name: 'Other', value: 8 },
];

const COLORS = ['#c27a6f', '#d4a574', '#8aa68a', '#a0aec0', '#718096'];

const recentOrders = [
  { id: '#ORD-001', client: 'Sarah Johnson', item: 'Summer Collection', amount: '$1,200', status: 'Completed' },
  { id: '#ORD-002', client: 'Marcus Lee', item: 'Tailored Suit', amount: '$3,400', status: 'In Progress' },
  { id: '#ORD-003', client: 'Elena Rodriguez', item: 'Accessories Set', amount: '$680', status: 'Completed' },
  { id: '#ORD-004', client: 'David Kim', item: 'Winter Coat', amount: '$2,100', status: 'Pending' },
  { id: '#ORD-005', client: 'Amara Okafor', item: 'Custom Dress', amount: '$1,850', status: 'In Progress' },
];

const statusColor: Record<string, string> = {
  Completed: 'text-moss bg-moss/10',
  'In Progress': 'text-sand bg-sand/10',
  Pending: 'text-ink/50 bg-ink/5',
};

export default function DashboardPage() {
  const prefersReducedMotion = useReducedMotion();
  const rootMotionProps = prefersReducedMotion
    ? {}
    : { initial: 'hidden' as const, animate: 'visible' as const };

  return (
    <DashboardLayout title="Dashboard">
      <motion.div {...rootMotionProps} variants={containerVariants} className="max-w-6xl mx-auto">
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl bg-ink p-6 sm:p-8 mb-8">
          <div className="relative z-10">
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-canvas/50 mb-2">Welcome back</p>
            <h2 className="font-serif text-2xl sm:text-3xl text-canvas">Your Financial Overview</h2>
            <p className="mt-2 text-sm text-canvas/60 max-w-md">
              Here's an overview of your portfolio and recent activity.
            </p>
          </div>
          <svg className="absolute -right-12 -top-12 w-64 h-64 opacity-10" viewBox="0 0 200 200" aria-hidden="true">
            <motion.path
              d="M 50 150 Q 100 50 150 150 T 250 150"
              stroke="currentColor" className="text-canvas" strokeWidth="2"
              strokeDasharray="8 6" fill="none"
              initial={prefersReducedMotion ? undefined : { pathLength: 0 }}
              animate={prefersReducedMotion ? undefined : { pathLength: 1 }}
              transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
            />
          </svg>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              className="rounded-xl border border-line bg-canvas p-5 hover:border-ink/20 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono uppercase tracking-wider text-ink/40">{stat.label}</span>
                <stat.icon className="w-4 h-4 text-ink/30" />
              </div>
              <p className="font-serif text-2xl text-ink">{stat.value}</p>
              <p className="text-xs mt-1 text-moss">{stat.change} this month</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div variants={itemVariants} className="rounded-xl border border-line bg-canvas p-5">
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
          </motion.div>

          <motion.div variants={itemVariants} className="rounded-xl border border-line bg-canvas p-5">
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
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <motion.div variants={itemVariants} className="rounded-xl border border-line bg-canvas p-5">
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
          </motion.div>

          <motion.div variants={itemVariants} className="lg:col-span-2 rounded-xl border border-line bg-canvas overflow-hidden">
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
                  {recentOrders.map((order, i) => (
                    <motion.tr
                      key={order.id}
                      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 8 }}
                      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
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
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
