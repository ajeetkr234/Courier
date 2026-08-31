import React, { useState } from 'react';
import { PublicNavbar, PublicFooter } from './PublicNav';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, ArrowRight, Sparkles, Calculator, CheckCircle2, Tag, 
  ChevronDown, Scale, Zap, ShieldCheck, TrendingUp, Sliders, 
  HelpCircle, Percent, DollarSign, Wallet
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';

export const PricingPage: React.FC = () => {
  const [monthlyVolume, setMonthlyVolume] = useState<number>(2000);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Freight savings estimation calculation
  const avgFreightRate = 62; // ₹62 average per shipment
  const estimatedSavingsPercent = monthlyVolume >= 5000 ? 0.28 : monthlyVolume >= 2000 ? 0.22 : 0.15;
  const estimatedMonthlySavings = Math.round(monthlyVolume * avgFreightRate * estimatedSavingsPercent);
  const estimatedMonthlySpend = Math.round(monthlyVolume * avgFreightRate * (1 - estimatedSavingsPercent));

  const featureMatrix = [
    { feature: 'Multi-Courier Access (Delhivery, Xpressbees, etc.)', starter: true, growth: true, enterprise: true },
    { feature: 'Live Rate Comparison Engine', starter: true, growth: true, enterprise: true },
    { feature: 'Basic AWB Tracking', starter: true, growth: true, enterprise: true },
    { feature: 'NDR Workflows & Buyer Confirmation', starter: true, growth: true, enterprise: true },
    { feature: 'Advanced AI Rate Optimization', starter: false, growth: true, enterprise: true },
    { feature: 'NDR WhatsApp Automation Bot', starter: false, growth: true, enterprise: true },
    { feature: 'T+2 COD Remittance Payouts', starter: false, growth: true, enterprise: true },
    { feature: '1-Click Store Integrations (Shopify, WooCommerce)', starter: false, growth: true, enterprise: true },
    { feature: 'Developer REST API & Webhooks', starter: false, growth: true, enterprise: true },
    { feature: 'Dedicated Key Account Manager', starter: false, growth: false, enterprise: true },
    { feature: 'Custom Weight Slab Rate Cards', starter: false, growth: false, enterprise: true },
    { feature: 'Weight Dispute Evidence Locker', starter: false, growth: false, enterprise: true }
  ];

  const pricingFaqs = [
    {
      q: 'Are there any hidden monthly subscription charges on the Growth plan?',
      a: 'No! The Growth plan operates on a pay-as-you-ship model. You only pay for the actual freight charges of your booked shipments with discounted carrier rates.'
    },
    {
      q: 'When do I get my Cash on Delivery (COD) payouts?',
      a: 'COD payouts are processed on a T+2 business day schedule directly into your verified bank account following successful delivery.'
    },
    {
      q: 'Can I upgrade to an Enterprise plan later?',
      a: 'Yes! As your monthly shipping volume grows past 2,000 orders/month, our team will automatically offer custom rate slabs and assign a dedicated account manager.'
    },
    {
      q: 'How are shipping rates calculated per parcel?',
      a: 'Rates are based on the greater of actual weight or volumetric weight (Length x Width x Height / 5000) and the pickup/delivery zone distance.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans overflow-x-hidden">
      <PublicNavbar />

      <section className="relative py-10 sm:py-14 px-6 sm:px-8 bg-slate-950 text-white border-b border-slate-800 overflow-hidden">
        <div className="relative max-w-7xl mx-auto space-y-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-extrabold shadow-sm"
          >
            <Tag className="w-4 h-4 text-blue-400" />
            <span>Pay-As-You-Ship Pricing • Zero Monthly Subscription Fees</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-black font-display tracking-tight leading-tight max-w-5xl mx-auto text-white"
          >
            Simple, Predictable Shipping Plans.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed font-medium"
          >
            Choose the plan that fits your order volume and scale your e-commerce shipping with zero upfront subscription cost.
          </motion.p>
        </div>
      </section>

      {/* Main Pricing Cards Grid */}
      <section className="py-10 sm:py-12 px-6 sm:px-8 max-w-7xl mx-auto w-full space-y-8 sm:space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* STARTER PLAN */}
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4 }}
            whileHover={{ y: -8 }}
            className="bg-white p-8 sm:p-9 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-6"
          >
            <div className="space-y-6">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-slate-500 font-display">STARTER</span>
                <h3 className="text-4xl font-black text-slate-900 font-display mt-2">₹0<span className="text-sm font-normal text-slate-500">/month</span></h3>
                <p className="text-xs text-slate-600 mt-2 font-medium">
                  For small stores getting started with multi-courier shipping.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3 font-medium text-xs text-slate-800">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Multi-courier access</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Live rate comparison</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Basic AWB tracking</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Standard NDR workflows</span>
                </div>
              </div>
            </div>

            <Link to="/register">
              <Button variant="outline" className="w-full justify-center font-extrabold text-xs">
                Get Started →
              </Button>
            </Link>
          </motion.div>

          {/* GROWTH PLAN (RECOMMENDED HIGHLIGHTED) */}
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4, delay: 0.1 }}
            whileHover={{ y: -8 }}
            className="bg-slate-900 text-white p-8 sm:p-9 rounded-3xl border-2 border-blue-500 shadow-2xl flex flex-col justify-between space-y-6 relative z-10"
          >
            <div className="absolute -top-3.5 right-6 px-4 py-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg z-20">
              MOST POPULAR
            </div>

            <div className="space-y-6">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-blue-400 font-display">GROWTH</span>
                <h3 className="text-4xl font-black text-white font-display mt-2">Pay as You Ship</h3>
                <p className="text-xs text-slate-300 mt-2 font-medium leading-relaxed">
                  Discounted shipping rates for fast-growing D2C storefronts.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-3 font-medium text-xs text-slate-200">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-bold text-white">Everything in Starter</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Advanced rate optimization</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>WhatsApp NDR buyer bot</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>T+2 early COD remittance</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Shopify & Woo integrations</span>
                </div>
              </div>
            </div>

            <Link to="/register">
              <Button className="w-full justify-center bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-lg shadow-blue-500/30">
                Start Shipping Now →
              </Button>
            </Link>
          </motion.div>

          {/* ENTERPRISE PLAN */}
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4, delay: 0.2 }}
            whileHover={{ y: -8 }}
            className="bg-white p-8 sm:p-9 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-6"
          >
            <div className="space-y-6">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-slate-500 font-display">ENTERPRISE</span>
                <h3 className="text-4xl font-black text-slate-900 font-display mt-2">Custom Slabs</h3>
                <p className="text-xs text-slate-600 mt-2 font-medium">
                  For high-volume brands shipping 5,000+ orders per month.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3 font-medium text-xs text-slate-800">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Dedicated key account manager</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Custom weight slab rate cards</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>REST API & Webhooks</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Weight dispute evidence locker</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Custom SLA guarantees</span>
                </div>
              </div>
            </div>

            <Link to="/contact">
              <Button variant="outline" className="w-full justify-center font-extrabold text-xs">
                Talk to Sales →
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Interactive Volume Savings Calculator */}
        <div className="bg-slate-950 text-white p-8 sm:p-12 rounded-2xl border border-slate-800 shadow-xl space-y-8 relative overflow-hidden">

          <div className="text-center space-y-2 relative z-10">
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-400 font-display flex items-center justify-center gap-2">
              <Calculator className="w-4 h-4 text-blue-400" /> INTERACTIVE VOLUME SAVINGS ESTIMATOR
            </span>
            <h3 className="text-2xl sm:text-4xl font-black font-display text-white">How Much Can Your Store Save?</h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">Adjust the order volume slider or click presets below to compute your potential monthly freight savings.</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-8 relative z-10">
            {/* Presets */}
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {[500, 2000, 5000, 15000, 50000].map((vol) => (
                <button
                  key={vol}
                  onClick={() => setMonthlyVolume(vol)}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                    monthlyVolume === vol ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {vol.toLocaleString()} Orders / Mo
                </button>
              ))}
            </div>

            {/* Range Slider */}
            <div className="space-y-3 bg-slate-900 p-6 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Monthly Volume:</span>
                <span className="text-blue-400 font-black text-sm">{monthlyVolume.toLocaleString()} Shipments</span>
              </div>
              <input 
                type="range" 
                min="100" 
                max="50000" 
                step="500"
                value={monthlyVolume}
                onChange={(e) => setMonthlyVolume(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Results Display Grid */}
            <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center shadow-inner">
              <div className="space-y-1">
                <span className="block text-[10px] text-slate-400 uppercase font-bold">Est. Monthly Freight Spend</span>
                <span className="block text-xl sm:text-2xl font-black text-white font-mono">₹{estimatedMonthlySpend.toLocaleString()}</span>
              </div>
              <div className="space-y-1 sm:border-x sm:border-slate-800 sm:px-4">
                <span className="block text-[10px] text-slate-400 uppercase font-bold">Estimated Monthly Savings</span>
                <span className="block text-2xl sm:text-3xl font-black text-emerald-400 font-mono">₹{estimatedMonthlySavings.toLocaleString()} / mo</span>
              </div>
              <div className="space-y-1">
                <span className="block text-[10px] text-slate-400 uppercase font-bold">Optimization Rate</span>
                <span className="block text-xl sm:text-2xl font-black text-blue-400 font-display">Up to {Math.round(estimatedSavingsPercent * 100)}% Lower</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Comparison Matrix */}
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200/90 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 font-display">PLAN COMPARISON</span>
            <h3 className="text-2xl sm:text-4xl font-black text-slate-900 font-display tracking-tight">Detailed Feature Matrix</h3>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Feature Capability</th>
                  <th className="p-4 text-center">STARTER</th>
                  <th className="p-4 text-center text-blue-600 font-black">GROWTH</th>
                  <th className="p-4 text-center">ENTERPRISE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {featureMatrix.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{r.feature}</td>
                    <td className="p-4 text-center">
                      {r.starter ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <span className="text-slate-300">-</span>}
                    </td>
                    <td className="p-4 text-center bg-blue-50/50">
                      {r.growth ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <span className="text-slate-300">-</span>}
                    </td>
                    <td className="p-4 text-center">
                      {r.enterprise ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <span className="text-slate-300">-</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pricing FAQs */}
        <div className="bg-slate-100/70 p-8 sm:p-12 rounded-3xl border border-slate-200/90 shadow-md space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 font-display">PRICING FAQS</span>
            <h3 className="text-2xl sm:text-4xl font-black text-slate-900 font-display tracking-tight">Frequently Asked Billing Questions</h3>
          </div>

          <div className="space-y-3 max-w-3xl mx-auto">
            {pricingFaqs.map((faq, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between font-bold text-slate-900 text-sm sm:text-base hover:text-blue-600 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${openFaq === idx ? 'rotate-180 text-blue-600' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium border-t border-slate-200 pt-3"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Banner with Fixed Contrast Button */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-8 sm:p-14 rounded-3xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 text-center sm:text-left relative z-10">
            <h3 className="text-2xl sm:text-4xl font-black font-display tracking-tight text-white">Ready to Start Shipping?</h3>
            <p className="text-xs sm:text-sm text-blue-100 font-medium max-w-xl">Create your free account today with zero upfront subscription cost.</p>
          </div>
          <Link to="/register" className="shrink-0 w-full sm:w-auto relative z-10">
            <button className="w-full sm:w-auto bg-white hover:bg-blue-50 text-blue-700 font-black text-sm px-8 py-3.5 rounded-xl shadow-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2">
              <span>Start Shipping</span>
              <ArrowRight className="w-5 h-5 text-blue-700" />
            </button>
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};
