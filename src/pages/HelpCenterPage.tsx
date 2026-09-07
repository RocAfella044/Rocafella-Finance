import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LifeBuoy,
  MessageCircle,
  Mail,
  BookOpen,
  HelpCircle,
  Phone,
  ExternalLink,
  ChevronDown,
  Search,
} from 'lucide-react';
import DashboardLayout from '../Components/Layout/DashboardLayout';
import { FadeIn } from '../lib/FadeIn';
import { EASE } from '../lib/motion';

const faqs = [
  {
    q: 'How do I send a transfer?',
    a: 'From the Dashboard, go to the Quick Transfer card, enter the recipient\u2019s 10-digit Nepali mobile number and the amount, then tap Transfer.',
  },
  {
    q: 'Why is my email still unverified?',
    a: 'Check your inbox (and spam folder) for the confirmation link. You can resend it from the verification page or your Profile.',
  },
  {
    q: 'How do I change my password?',
    a: 'Open Profile, select Change password, and enter your current password along with a new one.',
  },
  {
    q: 'What is the minimum transfer amount?',
    a: 'Transfers must be more than NPR 50. Always double-check the recipient number before confirming.',
  },
  {
    q: 'How do I update my preferences?',
    a: 'Open Settings from the sidebar to manage your language, appearance, and notification preferences.',
  },
];

const contactOptions = [
  {
    icon: MessageCircle,
    title: 'Live chat',
    hint: 'Chat with support in real time',
    action: 'Start chat',
  },
  {
    icon: Mail,
    title: 'Email us',
    hint: 'support@rocafellafinance.com',
    action: 'Send email',
  },
  {
    icon: Phone,
    title: 'Call support',
    hint: 'Mon\u2013Fri, 9am\u20136pm',
    action: 'Call now',
  },
];

export default function HelpCenterPage() {
  const [query, setQuery] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filtered = faqs.filter(
    (f) =>
      !query.trim() ||
      f.q.toLowerCase().includes(query.trim().toLowerCase()) ||
      f.a.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <DashboardLayout title="Help Center">
      <div className="max-w-4xl mx-auto">
        <FadeIn className="relative overflow-hidden rounded-2xl bg-ink p-6 sm:p-8 mb-8">
          <div className="relative z-10">
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-canvas/50 mb-2">Support</p>
            <h2 className="font-serif text-2xl sm:text-3xl text-canvas">How can we help?</h2>
            <p className="mt-2 text-sm text-canvas/60 max-w-md">
              Browse the FAQs or reach out to our support team.
            </p>
            <div className="relative mt-6 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-canvas/40" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for help..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-canvas/10 border border-canvas/15 text-sm text-canvas placeholder:text-canvas/40 focus:outline-none focus:ring-2 focus:ring-canvas/20 transition-all"
              />
            </div>
          </div>
          <svg className="absolute -right-12 -top-12 w-64 h-64 opacity-10" viewBox="0 0 200 200" aria-hidden="true">
            <motion.path
              d="M 50 150 Q 100 50 150 150 T 250 150"
              stroke="currentColor"
              className="text-canvas"
              strokeWidth="2"
              strokeDasharray="8 6"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: EASE }}
            />
          </svg>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <FadeIn delay={0.05} className="rounded-xl border border-line bg-canvas p-5 flex items-start gap-3 cursor-pointer hover:border-ink/20 transition-all">
            <span className="w-9 h-9 rounded-lg bg-clay/10 flex items-center justify-center shrink-0">
              <BookOpen className="w-4.5 h-4.5 text-clay" />
            </span>
            <div>
              <p className="text-sm font-medium text-ink">User guide</p>
              <p className="mt-1 text-xs text-ink/50">Everything about getting started</p>
            </div>
          </FadeIn>
          <FadeIn delay={0.1} className="rounded-xl border border-line bg-canvas p-5 flex items-start gap-3 cursor-pointer hover:border-ink/20 transition-all">
            <span className="w-9 h-9 rounded-lg bg-moss/10 flex items-center justify-center shrink-0">
              <HelpCircle className="w-4.5 h-4.5 text-moss" />
            </span>
            <div>
              <p className="text-sm font-medium text-ink">Frequently asked</p>
              <p className="mt-1 text-xs text-ink/50">Quick answers to common questions</p>
            </div>
          </FadeIn>
          <FadeIn delay={0.15} className="rounded-xl border border-line bg-canvas p-5 flex items-start gap-3 cursor-pointer hover:border-ink/20 transition-all">
            <span className="w-9 h-9 rounded-lg bg-sand/15 flex items-center justify-center shrink-0">
              <LifeBuoy className="w-4.5 h-4.5 text-sand" />
            </span>
            <div>
              <p className="text-sm font-medium text-ink">Contact support</p>
              <p className="mt-1 text-xs text-ink/50">We\u2019re here to help 24/7</p>
            </div>
          </FadeIn>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 items-start">
          <FadeIn delay={0.1} className="rounded-xl border border-line bg-canvas p-5">
            <h3 className="font-serif text-lg text-ink mb-4">Frequently asked questions</h3>
            <div className="divide-y divide-line/60">
              {filtered.length === 0 && (
                <p className="py-6 text-sm text-ink/50 text-center">No results for &ldquo;{query}&rdquo;</p>
              )}
              {filtered.map((faq, i) => {
                const active = openIndex === i;
                return (
                  <div key={faq.q} className="py-3">
                    <button
                      onClick={() => setOpenIndex(active ? null : i)}
                      className="w-full flex items-center justify-between gap-3 text-left"
                    >
                      <span className="text-sm font-medium text-ink">{faq.q}</span>
                      <motion.span
                        animate={{ rotate: active ? 180 : 0 }}
                        transition={{ duration: 0.2, ease: EASE }}
                        className="shrink-0"
                      >
                        <ChevronDown className="w-4 h-4 text-ink/40" />
                      </motion.span>
                    </button>
                    <AnimatePresence initial={false}>
                      {active && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: EASE }}
                          className="overflow-hidden"
                        >
                          <p className="pt-2 text-sm text-ink/60 leading-relaxed">{faq.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </FadeIn>

          <FadeIn delay={0.15} className="rounded-xl border border-line bg-canvas p-5">
            <h3 className="font-serif text-lg text-ink mb-4">Get in touch</h3>
            <div className="space-y-3">
              {contactOptions.map((opt) => {
                const Icon = opt.icon;
                return (
                  <div
                    key={opt.title}
                    className="flex items-center justify-between gap-3 rounded-lg border border-line p-4 hover:border-ink/20 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-lg bg-ink/5 flex items-center justify-center shrink-0">
                        <Icon className="w-4.5 h-4.5 text-ink/60" />
                      </span>
                      <div>
                        <p className="text-sm font-medium text-ink">{opt.title}</p>
                        <p className="text-xs text-ink/50 mt-0.5">{opt.hint}</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-clay flex items-center gap-1 shrink-0">
                      {opt.action}
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-xs text-ink/40 leading-relaxed">
              Our support team typically responds within one business day. For urgent matters, please call the number
              above.
            </p>
          </FadeIn>
        </div>
      </div>
    </DashboardLayout>
  );
}
