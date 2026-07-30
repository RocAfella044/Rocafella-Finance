import { useState } from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { Search, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
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

const transactions = [
  { id: '#TXN-001', description: 'Summer Collection Sale', date: '2026-07-28', amount: '+$3,200', type: 'credit', status: 'Completed' },
  { id: '#TXN-002', description: 'Tailoring Supplies', date: '2026-07-27', amount: '-$840', type: 'debit', status: 'Completed' },
  { id: '#TXN-003', description: 'Client Deposit - M. Lee', date: '2026-07-26', amount: '+$1,500', type: 'credit', status: 'Completed' },
  { id: '#TXN-004', description: 'Studio Rent', date: '2026-07-25', amount: '-$2,400', type: 'debit', status: 'Completed' },
  { id: '#TXN-005', description: 'Online Order Revenue', date: '2026-07-24', amount: '+$890', type: 'credit', status: 'Completed' },
  { id: '#TXN-006', description: 'Fabric Purchase', date: '2026-07-23', amount: '-$1,260', type: 'debit', status: 'Pending' },
  { id: '#TXN-007', description: 'Consultation Fee', date: '2026-07-22', amount: '+$350', type: 'credit', status: 'Completed' },
  { id: '#TXN-008', description: 'Utility Bills', date: '2026-07-21', amount: '-$520', type: 'debit', status: 'Completed' },
];

export default function TransactionsPage() {
  const prefersReducedMotion = useReducedMotion();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'credit' | 'debit'>('all');

  const filtered = transactions.filter((t) => {
    const matchSearch = t.description.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || t.type === filter;
    return matchSearch && matchFilter;
  });

  const rootMotionProps = prefersReducedMotion
    ? {}
    : { initial: 'hidden' as const, animate: 'visible' as const };

  return (
    <DashboardLayout title="Transactions">
      <motion.div {...rootMotionProps} variants={containerVariants} className="max-w-6xl mx-auto">
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/35" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-line bg-sand/30 text-sm text-ink outline-none focus:border-ink transition-colors"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'credit', 'debit'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3.5 py-2 rounded-lg text-sm transition-colors ${
                  filter === f
                    ? 'bg-ink text-canvas'
                    : 'bg-sand/30 text-ink/60 hover:text-ink border border-line'
                }`}
              >
                {f === 'all' ? 'All' : f === 'credit' ? 'Income' : 'Expenses'}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="rounded-xl border border-line bg-canvas overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-ink/40">ID</th>
                  <th className="text-left px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-ink/40">Description</th>
                  <th className="text-left px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-ink/40">Date</th>
                  <th className="text-right px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-ink/40">Amount</th>
                  <th className="text-left px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-ink/40">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((txn, i) => (
                  <motion.tr
                    key={txn.id}
                    initial={prefersReducedMotion ? undefined : { opacity: 0, y: 8 }}
                    animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                    className="border-b border-line/50 last:border-0 hover:bg-sand/20 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-ink font-medium">{txn.id}</td>
                    <td className="px-5 py-3.5 text-ink/70">{txn.description}</td>
                    <td className="px-5 py-3.5 text-ink/50">{txn.date}</td>
                    <td className={`px-5 py-3.5 text-right font-medium ${txn.type === 'credit' ? 'text-moss' : 'text-clay'}`}>
                      <span className="flex items-center justify-end gap-1">
                        {txn.type === 'credit' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownLeft className="w-3.5 h-3.5" />}
                        {txn.amount}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-medium bg-moss/10 text-moss">
                        {txn.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-sm text-ink/40">No transactions found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-line bg-canvas p-5">
            <p className="text-xs font-mono uppercase tracking-wider text-ink/40 mb-1">Total Income</p>
            <p className="font-serif text-2xl text-moss">+$5,940</p>
          </div>
          <div className="rounded-xl border border-line bg-canvas p-5">
            <p className="text-xs font-mono uppercase tracking-wider text-ink/40 mb-1">Total Expenses</p>
            <p className="font-serif text-2xl text-clay">-$5,020</p>
          </div>
          <div className="rounded-xl border border-line bg-canvas p-5">
            <p className="text-xs font-mono uppercase tracking-wider text-ink/40 mb-1">Net Cash Flow</p>
            <p className="font-serif text-2xl text-moss">+$920</p>
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
