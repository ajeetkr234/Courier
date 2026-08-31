import React, { useState } from 'react';
import { PublicNavbar, PublicFooter } from './PublicNav';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Truck, Zap, Wallet, BarChart3, Globe, ShieldCheck, Scale, 
  RefreshCw, Check, X, ArrowRight, Sparkles, Layers, Search, 
  FileText, Clock, AlertTriangle, Cpu, CheckCircle2, ChevronDown, 
  Box, MapPin, Printer, Bell, ArrowUpRight, HelpCircle, Bot,
  Sliders, RefreshCcw, BadgeCheck, Building2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export const FeaturesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'aggregation' | 'ndr' | 'cod' | 'disputes'>('aggregation');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [simWeight, setSimWeight] = useState<number>(1.5);
  const [simZone, setSimZone] = useState<string>('Zone C (Metro to Metro)');

  const featureList = [
    { 
      title: 'Multi-Courier Aggregation Engine', 
      desc: 'Book shipments across Delhivery, Xpressbees, Ecom Express & Shadowfax dynamically from one panel without individual API contracts.', 
      icon: <Truck className="w-6 h-6 text-blue-600" />,
      badge: 'Core Engine',
      highlights: ['Single API Integration', 'Auto Carrier Routing', 'Zero Security Deposit']
    },
    { 
      title: 'Concurrent Rate Comparison', 
      desc: 'Real-time price & ETA comparisons tagged dynamically by Cheapest, Fastest, or Recommended based on shipping zone and weight.', 
      icon: <BarChart3 className="w-6 h-6 text-indigo-600" />,
      badge: 'Cost Optimizer',
      highlights: ['Live Freight Rates', 'Zone-based SLAs', 'Chargeable Weight Calculator']
    },
    { 
      title: 'Automated NDR Recovery Hub', 
      desc: 'Real-time non-delivery action center with buyer WhatsApp confirmation and automated reattempt scheduling to lower RTO.', 
      icon: <Zap className="w-6 h-6 text-amber-500" />,
      badge: 'RTO Prevention',
      highlights: ['65% RTO Reduction', 'WhatsApp Buyer Chatbot', 'Instant Courier Escalation']
    },
    { 
      title: 'Early T+2 COD Payouts', 
      desc: 'Accelerate working capital with T+2 day Cash On Delivery bank settlements and atomic wallet ledger tracking.', 
      icon: <Wallet className="w-6 h-6 text-emerald-600" />,
      badge: 'Financial Flow',
      highlights: ['T+2 Bank Settlement', 'Atomic Ledger Log', 'Unmatched Reconciliation']
    },
    { 
      title: 'Shopify & WooCommerce Auto-Sync', 
      desc: 'Instant order import, fulfillment push, tracking status updates, and inventory sync across your storefronts.', 
      icon: <Globe className="w-6 h-6 text-purple-600" />,
      badge: 'Store Connector',
      highlights: ['1-Click OAuth Connect', 'Real-Time Inventory Sync', 'Auto Tracking Push']
    },
    { 
      title: 'Weight Dispute Audit System', 
      desc: 'Compare declared parcel weight against carrier billed weight with scale photo evidence upload to dispute extra freight fees.', 
      icon: <Scale className="w-6 h-6 text-cyan-600" />,
      badge: 'Audit Protection',
      highlights: ['Photo Evidence Locker', 'Automated Dispute Ticket', 'Reconciliation Protection']
    },
    { 
      title: '4x6 Thermal Barcode Label Generator', 
      desc: 'Generate single or bulk 4x6 thermal shipping labels and A4 packing slips with scannable barcodes in under 2 seconds.', 
      icon: <Printer className="w-6 h-6 text-sky-600" />,
      badge: 'Warehouse Utility',
      highlights: ['Bulk Printing (500+ AWB)', 'ZPL/PDF Format', 'Custom Packing Slips']
    },
    { 
      title: 'Unified Real-Time Tracking Engine', 
      desc: 'Normalize courier status events (Picked Up, In Transit, Out for Delivery, Delivered) into one standardized tracking timeline.', 
      icon: <Clock className="w-6 h-6 text-blue-500" />,
      badge: 'Live Status',
      highlights: ['Branded Tracking Pages', 'SMS/Email Alerts', 'Universal AWB Lookup']
    },
    { 
      title: 'Automated Courier Allocation', 
      desc: 'Machine learning routing algorithms that evaluate historical carrier delivery SLAs per pincode to assign the ideal courier.', 
      icon: <Cpu className="w-6 h-6 text-indigo-500" />,
      badge: 'AI Intelligence',
      highlights: ['Pincode SLA Predictions', 'Dynamic Carrier Switch', 'Lowest RTO Rate']
    },
    { 
      title: 'Conversational Buyer WhatsApp Bot', 
      desc: 'Engage buyers directly via automated WhatsApp messages for order verification, pincode confirmation, and delivery updates.', 
      icon: <Bot className="w-6 h-6 text-emerald-500" />,
      badge: 'Buyer Engagement',
      highlights: ['Interactive Address Fix', 'Automated OTP Verification', '2-Way Chatbot']
    },
    { 
      title: 'Multi-Warehouse Order Routing', 
      desc: 'Fulfill orders from the nearest fulfillment center or warehouse based on customer pincode proximity to save freight costs.', 
      icon: <Box className="w-6 h-6 text-rose-500" />,
      badge: 'Fulfillment Strategy',
      highlights: ['Zone Proximity Match', 'Split Inventory Routing', 'Lower Zone Charges']
    },
    { 
      title: 'Atomic Financial Ledger Logs', 
      desc: 'Cryptographically signed financial ledger detailing every freight debit, wallet top-up, GST tax breakdown, and COD payout.', 
      icon: <ShieldCheck className="w-6 h-6 text-amber-600" />,
      badge: 'Audit Trail',
      highlights: ['Zero Ledger Drift', 'GST Tax Reports', 'Instant CSV Export']
    }
  ];

  const featureComparison = [
    { capability: 'Multi-Carrier Live Rate Comparison', shipSmarter: true, traditional: false, directContracts: false },
    { capability: 'Automated NDR WhatsApp Buyer Bot', shipSmarter: true, traditional: false, directContracts: false },
    { capability: 'T+2 Early COD Remittance Payouts', shipSmarter: true, traditional: false, directContracts: false },
    { capability: 'Weight Dispute Evidence Locker', shipSmarter: true, traditional: false, directContracts: false },
    { capability: '1-Click Shopify & Woo Integrations', shipSmarter: true, traditional: true, directContracts: false },
    { capability: 'Zero Minimum Volume Commitments', shipSmarter: true, traditional: true, directContracts: false },
  ];

  const faqs = [
    {
      q: 'How does the Multi-Courier Aggregation engine pick the best courier for my shipment?',
      a: 'ShipSmarter evaluates live carrier rates, estimated delivery days, historical courier performance for your specific delivery PIN code, and your preferred priority (Cheapest, Fastest, or Highest Delivery SLA).'
    },
    {
      q: 'What happens when an NDR (Non-Delivery Report) occurs?',
      a: 'The moment a courier flags a non-delivery attempt (e.g. customer unavailable, address incomplete), ShipSmarter automatically reaches out to the buyer via WhatsApp/SMS to collect updated delivery instructions and triggers a reattempt with the courier.'
    },
    {
      q: 'How do early T+2 COD payouts work?',
      a: 'As soon as the courier marks a Cash-on-Delivery parcel as "Delivered", ShipSmarter initiates payout processing into your verified bank account within 48 business hours (T+2), preventing cash flow bottlenecks.'
    },
    {
      q: 'Can I upload custom weight dispute evidence?',
      a: 'Yes! Our Weight Dispute Audit System lets you upload scale images and dimension logs. We present this evidence directly to carrier billing teams to reverse erroneous weight charges.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans overflow-x-hidden">
      <PublicNavbar />

      {/* Hero Header with Animated Ambient Mesh */}
      <section className="relative py-10 sm:py-14 px-6 sm:px-8 bg-slate-950 text-white border-b border-slate-800 overflow-hidden">
        <div className="relative max-w-7xl mx-auto space-y-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-extrabold shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-blue-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Platform Architecture & 12 Pillars of Automation</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-black font-display tracking-tight leading-tight max-w-5xl mx-auto text-white"
          >
            Everything You Need to Scale Shipping Operations
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed font-medium"
          >
            Explore the complete suite of shipping automation, multi-carrier rate optimization, NDR recovery tools, and financial reconciliation built for modern e-commerce.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4 pt-3"
          >
            <Link to="/register">
              <Button size="lg" className="shadow-xl shadow-blue-500/25 bg-blue-600 hover:bg-blue-500 font-extrabold" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Book a Shipment
              </Button>
            </Link>
            <a href="#simulator">
              <button className="inline-flex items-center justify-center font-extrabold rounded-xl transition-all duration-200 text-sm px-6 py-3 gap-2.5 bg-slate-900/90 border border-slate-700/90 text-slate-100 hover:bg-slate-800 hover:border-blue-500/50 shadow-md cursor-pointer">
                <Cpu className="w-5 h-5 text-blue-400 shrink-0" />
                <span>Explore Interactive Simulator</span>
              </button>
            </a>
          </motion.div>

          {/* Live Metrics Ticker Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-slate-400 max-w-4xl mx-auto"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-white font-bold">29,000+ Pincodes Covered</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-400 font-bold">Real-time</span>
              <span>Rate Calculation</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold">65% RTO</span>
              <span>Average NDR Recovery</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-indigo-400 font-bold">T+2 Days</span>
              <span>COD Payout Cycle</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Grid: 12 Pillar Feature Capability Cards */}
      <section className="py-10 sm:py-12 px-6 sm:px-8 max-w-7xl mx-auto w-full space-y-8 sm:space-y-10">
        <div className="text-center space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 font-display">DEEP-DIVE CAPABILITIES</span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 font-display tracking-tight">12 Pillars of Modern E-Commerce Logistics</h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto font-medium">Designed to eliminate operational friction at every stage of the fulfillment cycle.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {featureList.map((feat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: (idx % 4) * 0.08 }}
              whileHover={{ y: -8, scale: 1.01 }}
              className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 space-y-6 flex flex-col justify-between group cursor-pointer"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center shadow-xs group-hover:scale-110 group-hover:bg-blue-50 group-hover:border-blue-200 transition-all duration-300">
                    {feat.icon}
                  </div>
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-extrabold border border-slate-200/80 font-display group-hover:bg-blue-50 group-hover:text-blue-700 group-hover:border-blue-200 transition-colors">
                    {feat.badge}
                  </span>
                </div>

                <h3 className="text-lg font-black text-slate-900 font-display leading-snug group-hover:text-blue-600 transition-colors">
                  {feat.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium min-h-[48px]">
                  {feat.desc}
                </p>

                <div className="pt-4 border-t border-slate-100 space-y-2.5">
                  {feat.highlights.map((item, hIdx) => (
                    <div key={hIdx} className="flex items-center gap-2 text-xs font-bold text-slate-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Interactive Feature Deep-Dive Simulator (#simulator) */}
        <div id="simulator" className="bg-slate-950 text-white p-8 sm:p-12 rounded-2xl border border-slate-800 shadow-xl space-y-8 relative overflow-hidden">

          <div className="text-center space-y-2 relative z-10">
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-400 font-display">INTERACTIVE PLATFORM SIMULATOR</span>
            <h3 className="text-2xl sm:text-4xl font-black font-display text-white">See ShipSmarter Modules in Action</h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto font-medium">Switch tabs below to see how our core automation modules calculate, recover, and reconcile in real-time.</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 relative z-10">
            <button
              onClick={() => setActiveTab('aggregation')}
              className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'aggregation' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              Multi-Courier Aggregation
            </button>
            <button
              onClick={() => setActiveTab('ndr')}
              className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'ndr' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              NDR Recovery Hub
            </button>
            <button
              onClick={() => setActiveTab('cod')}
              className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'cod' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              T+2 COD Remittance
            </button>
            <button
              onClick={() => setActiveTab('disputes')}
              className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'disputes' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              Weight Dispute Audit
            </button>
          </div>

          <div className="bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-800/90 space-y-6 relative z-10 shadow-inner">
            <AnimatePresence mode="wait">
              {activeTab === 'aggregation' && (
                <motion.div 
                  key="aggregation"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                    <div>
                      <h4 className="font-black text-blue-400 text-base font-display">Multi-Courier Rate Calculation Output</h4>
                      <p className="text-xs text-slate-400 font-medium">Interactive simulation comparing 3 carriers for a {simWeight} kg parcel</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="text-xs font-bold text-slate-300">Test Weight:</label>
                      <select 
                        value={simWeight}
                        onChange={(e) => setSimWeight(parseFloat(e.target.value))}
                        className="bg-slate-950 border border-slate-800 text-xs text-white rounded-lg px-2.5 py-1.5 font-mono cursor-pointer"
                      >
                        <option value={0.5}>0.5 kg</option>
                        <option value={1.5}>1.5 kg</option>
                        <option value={3.0}>3.0 kg</option>
                        <option value={5.0}>5.0 kg</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-medium">
                    <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 hover:border-emerald-500/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Delhivery Surface</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[9px] font-bold">Cheapest</span>
                      </div>
                      <span className="block text-emerald-400 font-mono font-black text-xl">₹{(48 * simWeight).toFixed(2)}</span>
                      <span className="block text-slate-400 text-xs">Estimated Delivery: 2 Days</span>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 hover:border-amber-500/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Xpressbees Air</span>
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[9px] font-bold">Fastest</span>
                      </div>
                      <span className="block text-amber-400 font-mono font-black text-xl">₹{(64 * simWeight).toFixed(2)}</span>
                      <span className="block text-slate-400 text-xs">Estimated Delivery: Next Day</span>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 hover:border-purple-500/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ecom Express COD</span>
                        <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 text-[9px] font-bold">Best SLA</span>
                      </div>
                      <span className="block text-purple-400 font-mono font-black text-xl">₹{(54 * simWeight).toFixed(2)}</span>
                      <span className="block text-slate-400 text-xs">Estimated Delivery: 2 Days</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'ndr' && (
                <motion.div 
                  key="ndr"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h4 className="font-black text-rose-400 text-base font-display">Automated NDR Buyer WhatsApp Bot Simulation</h4>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      ● Active Workflow
                    </span>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 text-xs">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-md">
                        WA
                      </div>
                      <div className="space-y-1">
                        <span className="block font-bold text-white text-sm">Automated WhatsApp Alert Sent to Buyer (+91 98765*****)</span>
                        <div className="p-3.5 rounded-xl bg-slate-900 text-slate-300 font-mono text-xs border border-slate-800 leading-relaxed">
                          "Hi Rahul! Courier delivery for Order #ord-1002 failed due to incorrect landmark. Reply 1 to update address or 2 to select reattempt date."
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs font-mono font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Buyer Replied "1 - Near Sector 14 Metro Station" → Reattempt Scheduled Automatically with Courier API!</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'cod' && (
                <motion.div 
                  key="cod"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h4 className="font-black text-emerald-400 text-base font-display">T+2 COD Settlement Ledger Estimator</h4>
                    <span className="text-[10px] font-mono text-blue-400 font-bold bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
                      T+2 Business Days Cycle
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium">
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="block text-[10px] text-slate-400 uppercase font-bold">Gross COD Collected</span>
                      <span className="block text-lg font-black font-mono text-white">₹1,45,000.00</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="block text-[10px] text-slate-400 uppercase font-bold">Freight Deductions</span>
                      <span className="block text-lg font-black font-mono text-rose-400">-₹12,400.00</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="block text-[10px] text-slate-400 uppercase font-bold">Early Remittance Fee</span>
                      <span className="block text-lg font-black font-mono text-emerald-400">₹0.00 Free</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 space-y-1">
                      <span className="block text-[10px] text-emerald-400 uppercase font-bold">Net Bank Payout</span>
                      <span className="block text-xl font-black font-mono text-emerald-400">₹1,32,600.00</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'disputes' && (
                <motion.div 
                  key="disputes"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h4 className="font-black text-amber-400 text-base font-display">Weight Dispute Digital Evidence Locker</h4>
                    <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                      Dispute Ticket #WD-901
                    </span>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                    <div className="space-y-1.5 text-left">
                      <span className="block font-bold text-white text-sm">AWB: DEL992817261 • Claimed 1.5 kg vs Billed 0.5 kg</span>
                      <span className="block text-xs text-slate-400">Digital warehouse scale image attached (JPEG evidence validated)</span>
                    </div>
                    <span className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 shrink-0">
                      Pending Carrier Credit Note (₹35)
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Feature Comparison Matrix */}
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200/90 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 font-display">WHY SHIPSMARTER</span>
            <h3 className="text-2xl sm:text-4xl font-black text-slate-900 font-display tracking-tight">Platform Capability Comparison</h3>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Platform Capability</th>
                  <th className="p-4 text-center text-blue-600 font-black">ShipSmarter Platform</th>
                  <th className="p-4 text-center text-slate-500">Traditional Aggregators</th>
                  <th className="p-4 text-center text-slate-500">Direct Courier Contracts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {featureComparison.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{row.capability}</td>
                    <td className="p-4 text-center bg-blue-50/50">
                      <Check className="w-5 h-5 text-emerald-600 mx-auto" />
                    </td>
                    <td className="p-4 text-center">
                      {row.traditional ? <Check className="w-4 h-4 text-slate-400 mx-auto" /> : <X className="w-4 h-4 text-rose-400 mx-auto" />}
                    </td>
                    <td className="p-4 text-center">
                      {row.directContracts ? <Check className="w-4 h-4 text-slate-400 mx-auto" /> : <X className="w-4 h-4 text-rose-400 mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Feature FAQs Section with Accordion */}
        <div className="bg-slate-100/70 p-8 sm:p-12 rounded-3xl border border-slate-200/90 shadow-md space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 font-display">FEATURE QUESTIONS</span>
            <h3 className="text-2xl sm:text-4xl font-black text-slate-900 font-display tracking-tight">Frequently Asked Questions</h3>
          </div>

          <div className="space-y-3 max-w-3xl mx-auto">
            {faqs.map((faq, idx) => (
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
                      className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium border-t border-slate-100 pt-3"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA Banner */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-8 sm:p-14 rounded-3xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 text-center sm:text-left relative z-10">
            <h3 className="text-2xl sm:text-4xl font-black font-display tracking-tight text-white">Ready to Manage Your Shipments?</h3>
            <p className="text-xs sm:text-sm text-blue-100 font-medium max-w-xl">Create your free account today and start shipping with automated rate optimization in under 5 minutes.</p>
          </div>
          <Link to="/register" className="shrink-0 w-full sm:w-auto relative z-10">
            <button className="w-full sm:w-auto bg-white hover:bg-blue-50 text-blue-700 font-black text-sm px-8 py-3.5 rounded-xl shadow-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2">
              <span>Start Shipping Free</span>
              <ArrowRight className="w-5 h-5 text-blue-700" />
            </button>
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};
