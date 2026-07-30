import { useState } from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { FileText, Download, Eye } from 'lucide-react';
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

const invoices = [
  { id: '#INV-001', client: 'Sarah Johnson', amount: '$1,200', issued: '2026-07-15', due: '2026-08-15', status: 'Paid' },
  { id: '#INV-002', client: 'Marcus Lee', amount: '$3,400', issued: '2026-07-18', due: '2026-08-18', status: 'Pending' },
  { id: '#INV-003', client: 'Elena Rodriguez', amount: '$680', issued: '2026-07-20', due: '2026-08-20', status: 'Paid' },
  { id: '#INV-004', client: 'David Kim', amount: '$2,100', issued: '2026-07-22', due: '2026-08-22', status: 'Overdue' },
  { id: '#INV-005', client: 'Amara Okafor', amount: '$1,850', issued: '2026-07-25', due: '2026-08-25', status: 'Pending' },
  { id: '#INV-006', client: 'James Wilson', amount: '$950', issued: '2026-07-27', due: '2026-08-27', status: 'Draft' },
];

const statusColor: Record<string, string> = {
  Paid: 'text-moss bg-moss/10',
  Pending: 'text-sand bg-sand/10',
  Overdue: 'text-clay bg-clay/10',
  Draft: 'text-ink/50 bg-ink/5',
};

export default function InvoicesPage() {
  const prefersReducedMotion = useReducedMotion();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = statusFilter === 'all' ? invoices : invoices.filter((inv) => inv.status === statusFilter);

  const rootMotionProps = prefersReducedMotion
    ? {}
    : { initial: 'hidden' as const, animate: 'visible' as const };

  return (
    <DashboardLayout title="Invoices">
      <motion.div {...rootMotionProps} variants={containerVariants} className="max-w-6xl mx-auto">
        <motion.div variants={itemVariants} className="flex items-center gap-3 mb-6 flex-wrap">
          {['all', 'Paid', 'Pending', 'Overdue', 'Draft'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3.5 py-2 rounded-lg text-sm transition-colors ${
                statusFilter === s
                  ? 'bg-ink text-canvas'
                  : 'bg-sand/30 text-ink/60 hover:text-ink border border-line'
              }`}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </motion.div>

        <motion.div variants={itemVariants} className="rounded-xl border border-line bg-canvas overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-ink/40">Invoice</th>
                  <th className="text-left px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-ink/40">Client</th>
                  <th className="text-left px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-ink/40">Amount</th>
                  <th className="text-left px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-ink/40 hidden sm:table-cell">Issued</th>
                  <th className="text-left px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-ink/40 hidden sm:table-cell">Due</th>
                  <th className="text-left px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-ink/40">Status</th>
                  <th className="text-right px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-ink/40">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv, i) => (
                  <motion.tr
                    key={inv.id}
                    initial={prefersReducedMotion ? undefined : { opacity: 0, y: 8 }}
                    animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                    className="border-b border-line/50 last:border-0 hover:bg-sand/20 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-ink font-medium">{inv.id}</td>
                    <td className="px-5 py-3.5 text-ink/70">{inv.client}</td>
                    <td className="px-5 py-3.5 text-ink">{inv.amount}</td>
                    <td className="px-5 py-3.5 text-ink/50 hidden sm:table-cell">{inv.issued}</td>
                    <td className="px-5 py-3.5 text-ink/50 hidden sm:table-cell">{inv.due}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-medium ${statusColor[inv.status]}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 rounded-lg text-ink/40 hover:text-ink hover:bg-sand/30 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 rounded-lg text-ink/40 hover:text-ink hover:bg-sand/30 transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
