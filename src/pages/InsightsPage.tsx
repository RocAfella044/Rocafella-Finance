import { motion, useReducedMotion, type Variants } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
} from 'recharts';
import { TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react';
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

const revenueData = [
  { month: 'Jan', revenue: 12400, expenses: 8200 },
  { month: 'Feb', revenue: 13800, expenses: 9100 },
  { month: 'Mar', revenue: 15200, expenses: 8600 },
  { month: 'Apr', revenue: 14100, expenses: 10300 },
  { month: 'May', revenue: 16800, expenses: 9400 },
  { month: 'Jun', revenue: 18900, expenses: 11200 },
];

const growthData = [
  { month: 'Jan', clients: 240, orders: 18 },
  { month: 'Feb', clients: 258, orders: 22 },
  { month: 'Mar', clients: 275, orders: 27 },
  { month: 'Apr', clients: 290, orders: 24 },
  { month: 'May', clients: 315, orders: 31 },
  { month: 'Jun', clients: 342, orders: 36 },
];

const categoryData = [
  { name: 'Fabric & Materials', value: 32 },
  { name: 'Labor & Tailoring', value: 28 },
  { name: 'Marketing', value: 15 },
  { name: 'Rent & Utilities', value: 18 },
  { name: 'Other', value: 7 },
];

const COLORS = ['#c27a6f', '#d4a574', '#8aa68a', '#a0aec0', '#718096'];

const highlights = [
  { label: 'Revenue Growth', value: '+24.3%', icon: TrendingUp, positive: true },
  { label: 'Cost Reduction', value: '-3.2%', icon: TrendingDown, positive: false },
  { label: 'Client Retention', value: '94.7%', icon: Activity, positive: true },
  { label: 'Avg. Order Value', value: '$2,340', icon: DollarSign, positive: true },
];

export default function InsightsPage() {
  const prefersReducedMotion = useReducedMotion();
  const rootMotionProps = prefersReducedMotion
    ? {}
    : { initial: 'hidden' as const, animate: 'visible' as const };

  return (
    <DashboardLayout title="Insights">
      <motion.div {...rootMotionProps} variants={containerVariants} className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {highlights.map((h) => (
            <motion.div
              key={h.label}
              variants={itemVariants}
              className="rounded-xl border border-line bg-canvas p-5"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-ink/40">{h.label}</span>
                <h.icon className={`w-4 h-4 ${h.positive ? 'text-moss' : 'text-clay'}`} />
              </div>
              <p className={`font-serif text-xl ${h.positive ? 'text-moss' : 'text-clay'}`}>{h.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div variants={itemVariants} className="rounded-xl border border-line bg-canvas p-5">
            <h3 className="font-serif text-lg text-ink mb-4">Revenue vs Expenses</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8aa68a" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#8aa68a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
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
                <Area type="monotone" dataKey="revenue" stroke="#8aa68a" strokeWidth={2} fill="url(#revGrad)" />
                <Area type="monotone" dataKey="expenses" stroke="#c27a6f" strokeWidth={2} fill="url(#expGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div variants={itemVariants} className="rounded-xl border border-line bg-canvas p-5">
            <h3 className="font-serif text-lg text-ink mb-4">Client & Order Growth</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e0dc" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#8b8983' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#8b8983' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1c1917', border: 'none', borderRadius: 8, fontSize: 13, color: '#faf7f2' }}
                />
                <Bar dataKey="clients" fill="#d4a574" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="orders" fill="#c27a6f" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div variants={itemVariants} className="rounded-xl border border-line bg-canvas p-5">
            <h3 className="font-serif text-lg text-ink mb-4">Expense Breakdown</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%" cy="50%" innerRadius={50} outerRadius={90}
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
            <div className="space-y-2 mt-2">
              {categoryData.map((cat, i) => (
                <div key={cat.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-ink/60">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    {cat.name}
                  </span>
                  <span className="text-ink font-medium">{cat.value}%</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="lg:col-span-2 rounded-xl border border-line bg-canvas p-5">
            <h3 className="font-serif text-lg text-ink mb-4">Key Takeaways</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: 'Revenue is up 24.3% YoY', desc: 'Driven by increased client acquisition and higher average order values.' },
                { title: 'Cost efficiency improving', desc: 'Operating expenses grew slower than revenue, improving margins by 4.1%.' },
                { title: 'Client base expanding', desc: '342 active clients, with a 94.7% retention rate this quarter.' },
                { title: 'Peak season approaching', desc: 'Prepare inventory and staffing for the upcoming Q3 demand surge.' },
              ].map((item) => (
                <div key={item.title} className="p-4 rounded-lg bg-sand/20 border border-line">
                  <p className="text-sm font-medium text-ink mb-1">{item.title}</p>
                  <p className="text-xs text-ink/50">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
