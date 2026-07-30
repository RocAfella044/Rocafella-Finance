import { useState } from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { CreditCard, Plus, Lock, Globe, Zap } from 'lucide-react';
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

const cards = [
  { id: 1, name: 'Rocafella Black', holder: 'Alex Mercer', number: '**** 4821', expiry: '09/28', balance: '$12,400', type: 'black' },
  { id: 2, name: 'Rocafella Gold', holder: 'Alex Mercer', number: '**** 9376', expiry: '03/29', balance: '$8,200', type: 'gold' },
  { id: 3, name: 'Business Pro', holder: 'Rocafella Finance', number: '**** 2045', expiry: '11/27', balance: '$24,890', type: 'platinum' },
];

const cardStyles: Record<string, string> = {
  black: 'bg-gradient-to-br from-[#1c1917] to-[#292524] text-canvas',
  gold: 'bg-gradient-to-br from-[#d4a574] to-[#c27a6f] text-canvas',
  platinum: 'bg-gradient-to-br from-[#475569] to-[#334155] text-canvas',
};

export default function CardsPage() {
  const prefersReducedMotion = useReducedMotion();

  const rootMotionProps = prefersReducedMotion
    ? {}
    : { initial: 'hidden' as const, animate: 'visible' as const };

  return (
    <DashboardLayout title="Cards">
      <motion.div {...rootMotionProps} variants={containerVariants} className="max-w-6xl mx-auto">
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {cards.map((card, i) => (
            <motion.div
              key={card.id}
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20, scale: 0.95 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4 }}
              className={`relative rounded-2xl p-6 overflow-hidden ${cardStyles[card.type]}`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 translate-x-8 -translate-y-8">
                <div className="w-full h-full rounded-full bg-canvas/5" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <CreditCard className="w-6 h-6 text-canvas/70" />
                  <span className="font-mono text-[10px] uppercase tracking-wider text-canvas/50">{card.name}</span>
                </div>
                <p className="font-mono text-lg tracking-wider mb-4">{card.number}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-mono uppercase text-canvas/50">Holder</p>
                    <p className="text-sm font-medium">{card.holder}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-mono uppercase text-canvas/50">Expiry</p>
                    <p className="text-sm font-medium">{card.expiry}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-2xl border-2 border-dashed border-line bg-canvas flex items-center justify-center gap-2 p-6 hover:border-ink/30 transition-colors"
          >
            <Plus className="w-5 h-5 text-ink/40" />
            <span className="text-sm text-ink/50">Add new card</span>
          </motion.button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Lock, label: 'Secure Payments', desc: 'End-to-end encryption for all transactions' },
            { icon: Globe, label: 'Global Spending', desc: 'Accepted in 190+ countries worldwide' },
            { icon: Zap, label: 'Instant Notifications', desc: 'Real-time alerts for every transaction' },
          ].map((feature) => (
            <motion.div
              key={feature.label}
              variants={itemVariants}
              className="rounded-xl border border-line bg-canvas p-5 flex items-start gap-4"
            >
              <span className="p-2.5 rounded-lg bg-sand/30 text-ink/60">
                <feature.icon className="w-5 h-5" />
              </span>
              <div>
                <p className="text-sm font-medium text-ink">{feature.label}</p>
                <p className="text-xs text-ink/50 mt-0.5">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
