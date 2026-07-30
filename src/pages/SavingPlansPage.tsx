import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { PiggyBank, Target, TrendingUp, Clock, Plus } from 'lucide-react';
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

const plans = [
  {
    id: 1, name: 'Emergency Fund', target: 15000, saved: 10200,
    deadline: 'Dec 2026', color: 'bg-clay',
  },
  {
    id: 2, name: 'New Studio Space', target: 50000, saved: 18500,
    deadline: 'Jun 2027', color: 'bg-sand',
  },
  {
    id: 3, name: 'Vacation Fund', target: 8000, saved: 6200,
    deadline: 'Mar 2027', color: 'bg-moss',
  },
  {
    id: 4, name: 'Equipment Upgrade', target: 12000, saved: 3400,
    deadline: 'Sep 2027', color: 'bg-ink',
  },
];

export default function SavingPlansPage() {
  const prefersReducedMotion = useReducedMotion();
  const rootMotionProps = prefersReducedMotion
    ? {}
    : { initial: 'hidden' as const, animate: 'visible' as const };

  return (
    <DashboardLayout title="Saving Plans">
      <motion.div {...rootMotionProps} variants={containerVariants} className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {plans.map((plan) => {
            const pct = Math.round((plan.saved / plan.target) * 100);
            return (
              <motion.div
                key={plan.id}
                variants={itemVariants}
                className="rounded-xl border border-line bg-canvas p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="p-2.5 rounded-lg bg-sand/30 text-ink/60">
                      <PiggyBank className="w-5 h-5" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-ink">{plan.name}</p>
                      <p className="text-xs text-ink/40 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" /> {plan.deadline}
                      </p>
                    </div>
                  </div>
                  <Target className="w-5 h-5 text-ink/30" />
                </div>

                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-ink/70">${plan.saved.toLocaleString()}</span>
                    <span className="text-ink/40">${plan.target.toLocaleString()}</span>
                  </div>
                  <div className="h-2 rounded-full bg-line overflow-hidden">
                    <motion.div
                      initial={prefersReducedMotion ? undefined : { width: 0 }}
                      animate={prefersReducedMotion ? undefined : { width: `${pct}%` }}
                      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                      className={`h-full rounded-full ${plan.color}`}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-ink/50">{pct}% complete</span>
                  <span className="text-moss flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" /> On track
                  </span>
                </div>
              </motion.div>
            );
          })}

          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-xl border-2 border-dashed border-line bg-canvas flex items-center justify-center gap-2 p-6 hover:border-ink/30 transition-colors md:col-span-2"
          >
            <Plus className="w-5 h-5 text-ink/40" />
            <span className="text-sm text-ink/50">Create new saving plan</span>
          </motion.button>
        </div>

        <motion.div variants={itemVariants} className="rounded-xl border border-line bg-canvas p-5">
          <h3 className="font-serif text-lg text-ink mb-4">Saving Tips</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { title: 'Set Auto-Save', desc: 'Automatically transfer 10% of each payment to your savings.' },
              { title: 'Track Progress', desc: 'Review your saving goals weekly to stay motivated.' },
              { title: 'Reduce Waste', desc: 'Identify non-essential spending and redirect to savings.' },
            ].map((tip) => (
              <div key={tip.title} className="p-4 rounded-lg bg-sand/20">
                <p className="text-sm font-medium text-ink mb-1">{tip.title}</p>
                <p className="text-xs text-ink/50">{tip.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
