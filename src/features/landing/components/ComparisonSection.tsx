import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { XCircle, CheckCircle2, HelpCircle } from 'lucide-react';

const withoutItems = [
  'Logging into 5 separate courier portals every morning',
  'Calculating freight rates manually for every order',
  'Lost packages due to uncontacted failed delivery attempts',
  'Delayed COD payouts taking weeks to credit',
  'Overcharged freight fees due to unmanaged weight disputes',
  'Anxious customers calling support asking "Where is my order?"'
];

const withItems = [
  'Manage all couriers from one single dashboard',
  'Instant rate quotes to pick the cheapest or fastest carrier',
  'Automated WhatsApp & SMS buyer address verification',
  'T+2 Cash-on-Delivery remittances directly to your bank account',
  'Dedicated evidence locker to dispute wrong weight charges',
  'Live branded tracking portal with real-time WhatsApp updates'
];

export const ComparisonSection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      id="why-shipsmarter"
      className="pt-12 sm:pt-14 pb-20 px-4 sm:px-8 lg:px-12 bg-slate-50 border-b border-slate-200 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header Block */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-3.5 max-w-5xl mx-auto"
        >
          {/* Badge */}
          <div className="inline-block">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-extrabold border border-blue-200/80 shadow-xs">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
              <span className="uppercase tracking-wider">Why ShipFaster Logistic?</span>
            </div>
          </div>

          {/* Main Heading */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-display tracking-tight leading-[1.18] max-w-4xl mx-auto">
            Shipping Shouldn't Mean Managing{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
              Five Different Systems
            </span>
          </h2>

          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-lg text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto">
            Eliminate courier fragmentation, manual rate calculations, and delayed COD remittances.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Left Card: Without ShipSmarter */}
          <motion.div
            initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{
              boxShadow: '0 12px 30px -5px rgba(225, 29, 72, 0.1)',
              transition: { duration: 0.18 },
            }}
            className="bg-rose-50/50 p-8 rounded-3xl border border-rose-200 shadow-sm space-y-6 flex flex-col justify-between"
          >
            <div className="space-y-6">
              {/* Card Header */}
              <div className="flex items-center gap-3 pb-4 border-b border-rose-200">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 font-display">Without ShipFaster Logistic</h3>
                  <span className="text-xs font-extrabold text-rose-600 uppercase tracking-widest">
                    Traditional Logistics Frustration
                  </span>
                </div>
              </div>

              {/* List Items */}
              <div className="space-y-4">
                {withoutItems.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: 0.3 + idx * 0.07 }}
                    whileHover={{
                      x: shouldReduceMotion ? 0 : 4,
                      boxShadow: '0 4px 12px rgba(225, 29, 72, 0.08)',
                      transition: { duration: 0.18 },
                    }}
                    className="flex items-start gap-3 p-3.5 rounded-xl bg-white/80 border border-rose-100 shadow-xs cursor-default"
                  >
                    <div className="shrink-0 mt-0.5">
                      <XCircle className="w-5 h-5 text-rose-500" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 leading-snug">{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Card: With ShipFaster Logistic */}
          <motion.div
            initial={{ opacity: 0, x: shouldReduceMotion ? 0 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: 0.35 }}
            whileHover={{
              boxShadow: '0 25px 35px -5px rgba(16, 185, 129, 0.18), 0 10px 10px -5px rgba(16, 185, 129, 0.04)',
              transition: { duration: 0.18 },
            }}
            className="bg-white p-8 rounded-3xl border-2 border-emerald-500 shadow-xl space-y-6 flex flex-col justify-between relative"
          >
            {/* Recommended Badge */}
            <div className="absolute -top-3.5 right-6 px-3.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-widest shadow-md z-10">
              Recommended Solution
            </div>

            <div className="space-y-6">
              {/* Card Header */}
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 font-display">With ShipFaster Logistic</h3>
                  <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-widest">
                    Unified Platform Efficiency
                  </span>
                </div>
              </div>

              {/* List Items */}
              <div className="space-y-4">
                {withItems.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: 0.45 + idx * 0.07 }}
                    whileHover={{
                      x: shouldReduceMotion ? 0 : 4,
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.12)',
                      transition: { duration: 0.18 },
                    }}
                    className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100 shadow-xs cursor-default"
                  >
                    <div className="shrink-0 mt-0.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <span className="text-xs font-bold text-slate-900 leading-snug">{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
