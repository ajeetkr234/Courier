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
import { GlobalThreeBackground } from '../../components/ui/GlobalThreeBackground';

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
    { capability: 'Multi-Carrier Live Rate Comparison', shipFaster: true, traditional: false, directContracts: false },
    { capability: 'Automated NDR WhatsApp Buyer Bot', shipFaster: true, traditional: false, directContracts: false },
    { capability: 'T+2 Early COD Remittance Payouts', shipFaster: true, traditional: false, directContracts: false },
    { capability: 'Weight Dispute Evidence Locker', shipFaster: true, traditional: false, directContracts: false },
    { capability: '1-Click Shopify & Woo Integrations', shipFaster: true, traditional: true, directContracts: false },
    { capability: 'Branded Real-Time Tracking Experience', shipFaster: true, traditional: false, directContracts: false },
    { capability: 'Doorstep QC Reverse Returns & Exchanges', shipFaster: true, traditional: false, directContracts: false },
    { capability: 'Zero Minimum Volume Commitments', shipFaster: true, traditional: true, directContracts: false },
  ];

  const faqs = [
    {
      q: 'How does the Multi-Courier Aggregation engine pick the best courier for my shipment?',
      a: 'ShipFaster Logistic evaluates live carrier rates, estimated delivery days, historical courier performance for your specific delivery PIN code, and your preferred priority (Cheapest, Fastest, or Highest Delivery SLA).'
    },
    {
      q: 'What happens when an NDR (Non-Delivery Report) occurs?',
      a: 'The moment a courier flags a non-delivery attempt (e.g. customer unavailable, address incomplete), ShipFaster Logistic automatically reaches out to the buyer via WhatsApp/SMS to collect updated delivery instructions and triggers a reattempt with the courier.'
    },
    {
      q: 'How do early T+2 COD payouts work?',
      a: 'As soon as the courier marks a Cash-on-Delivery parcel as "Delivered", ShipFaster Logistic initiates payout processing into your verified bank account within 48 business hours (T+2), preventing cash flow bottlenecks.'
    },
    {
      q: 'Can I upload custom weight dispute evidence?',
      a: 'Yes! Our Weight Dispute Audit System lets you upload scale images and dimension logs. We present this evidence directly to carrier billing teams to reverse erroneous weight charges.'
    },
    {
      q: 'Do I need separate accounts or minimum monthly order commitments with couriers?',
      a: 'No. You get instant access to pre-negotiated commercial rates with Delhivery, Blue Dart, Xpressbees, and Shadowfax under a single ShipFaster Logistic account with zero monthly subscription fees and zero minimum volume lock-ins.'
    },
    {
      q: 'How does automated reverse logistics and customer returns work?',
      a: 'You can initiate reverse pickups directly from the dashboard or enable a self-serve return portal for buyers. Our engine books reverse pickups with doorstep quality checks (QC) and tracks return transit milestones automatically.'
    }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans relative overflow-x-hidden">
      <PublicNavbar />

      {/* Hero Header (White Theme, Consistent with Landing Page) */}
      <section className="relative py-12 sm:py-16 px-6 sm:px-8 bg-gradient-to-b from-blue-50/40 via-white to-white border-b border-slate-200/80 overflow-hidden">
        {/* Three.js Dynamic Background Canvas (Exact match to Home Page) */}
        <div className="absolute inset-0 opacity-40 pointer-events-none z-0">
          <GlobalThreeBackground />
        </div>

        <div className="relative max-w-7xl mx-auto space-y-8 text-center z-10">
          {/* Standardized Pill Chip Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-extrabold border border-blue-200/80 shadow-xs"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
            </span>
            <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin" style={{ animationDuration: '8s' }} />
            <span className="uppercase tracking-wider">Platform Architecture • 12 Pillars of Automation</span>
          </motion.div>

          {/* Standardized Heading */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-2xl xs:text-3xl sm:text-5xl md:text-6xl lg:text-[66px] font-black font-display tracking-tight leading-[1.22] sm:leading-[1.24] max-w-5xl mx-auto text-slate-950"
          >
            Everything You Need to{' '}
            <span className="inline-block pb-1 sm:pb-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
              Scale Shipping Operations
            </span>
          </motion.h1>

          {/* Subtitle Paragraph */}
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium"
          >
            Explore the complete suite of shipping automation, multi-carrier rate optimization, NDR recovery tools, and financial reconciliation built for modern e-commerce.
          </motion.p>

          {/* Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4 pt-2"
          >
            <Link to="/register">
              <Button size="lg" className="shadow-lg shadow-blue-500/20 bg-blue-600 hover:bg-blue-700 text-white font-extrabold" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Book a Shipment
              </Button>
            </Link>
            <a href="#simulator">
              <button className="inline-flex items-center justify-center font-extrabold rounded-xl transition-all duration-200 text-sm px-6 py-3 gap-2.5 bg-white border border-slate-200/90 text-slate-800 hover:bg-slate-50 hover:border-blue-300 shadow-xs cursor-pointer">
                <Cpu className="w-5 h-5 text-blue-600 shrink-0" />
                <span>Explore Interactive Simulator</span>
              </button>
            </a>
          </motion.div>

          {/* Live Metrics Ticker Bar (Light Theme) */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="pt-6 border-t border-slate-200/80 flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-xs font-mono text-slate-600 max-w-4xl mx-auto"
          >
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-slate-900 font-bold">29,000+ Pincodes Covered</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-2xs">
              <span className="text-blue-600 font-bold">Real-time</span>
              <span>Rate Calculation</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-2xs">
              <span className="text-emerald-600 font-bold">65% RTO</span>
              <span>Average NDR Recovery</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-2xs">
              <span className="text-indigo-600 font-bold">T+2 Days</span>
              <span>COD Payout Cycle</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Grid: 12 Pillar Feature Capability Cards */}
      <section id="capabilities" className="py-10 sm:py-12 px-6 sm:px-8 max-w-7xl mx-auto w-full space-y-8 sm:space-y-10">
        <div className="text-center space-y-3.5 max-w-5xl mx-auto">
          <div className="inline-block">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-extrabold border border-blue-200/80 shadow-xs">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span className="uppercase tracking-wider">DEEP-DIVE CAPABILITIES • PLATFORM PILLARS</span>
            </div>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-display tracking-tight leading-[1.18] max-w-4xl mx-auto">
            12 Pillars of{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
              Modern E-Commerce Logistics
            </span>
          </h2>

          <p className="text-sm sm:text-base md:text-lg text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto">
            Designed to eliminate operational friction, reduce shipping costs, and automate fulfillment at every stage of your order lifecycle.
          </p>
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
        <div id="simulator" className="space-y-8 relative">

          <div className="text-center space-y-3.5 max-w-5xl mx-auto">
            <div className="inline-block">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-extrabold border border-blue-200/80 shadow-xs">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                <Cpu className="w-3.5 h-3.5 text-blue-600" />
                <span className="uppercase tracking-wider">INTERACTIVE PLATFORM SIMULATOR • LIVE PREVIEW</span>
              </div>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-display tracking-tight leading-[1.18] max-w-4xl mx-auto">
              See ShipFaster Logistic{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
                Modules in Action
              </span>
            </h2>

            <p className="text-sm sm:text-base md:text-lg text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto">
              Switch modules below to test how our real-time algorithms calculate freight rates, automate NDR verification, and reconcile finances.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setActiveTab('aggregation')}
              className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'aggregation' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/90 shadow-2xs'
              }`}
            >
              Multi-Courier Aggregation
            </button>
            <button
              onClick={() => setActiveTab('ndr')}
              className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'ndr' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/90 shadow-2xs'
              }`}
            >
              NDR Recovery Hub
            </button>
            <button
              onClick={() => setActiveTab('cod')}
              className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'cod' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/90 shadow-2xs'
              }`}
            >
              T+2 COD Remittance
            </button>
            <button
              onClick={() => setActiveTab('disputes')}
              className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'disputes' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/90 shadow-2xs'
              }`}
            >
              Weight Dispute Audit
            </button>
          </div>

          <div className="space-y-6 max-w-4xl mx-auto pt-6 border-t border-slate-200/80">
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
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div>
                      <h4 className="font-black text-blue-600 text-base font-display">Multi-Courier Rate Calculation Output</h4>
                      <p className="text-xs text-slate-500 font-medium">Interactive simulation comparing 3 carriers for a {simWeight} kg parcel</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="text-xs font-bold text-slate-700">Test Weight:</label>
                      <select 
                        value={simWeight}
                        onChange={(e) => setSimWeight(parseFloat(e.target.value))}
                        className="bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-lg px-2.5 py-1.5 font-mono cursor-pointer focus:outline-none focus:border-blue-600"
                      >
                        <option value={0.5}>0.5 kg</option>
                        <option value={1.5}>1.5 kg</option>
                        <option value={3.0}>3.0 kg</option>
                        <option value={5.0}>5.0 kg</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-medium">
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 hover:border-emerald-500/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Delhivery Surface</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[9px] font-bold">Cheapest</span>
                      </div>
                      <span className="block text-emerald-600 font-mono font-black text-xl">₹{(48 * simWeight).toFixed(2)}</span>
                      <span className="block text-slate-500 text-xs">Estimated Delivery: 2 Days</span>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 hover:border-amber-500/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Xpressbees Air</span>
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-[9px] font-bold">Fastest</span>
                      </div>
                      <span className="block text-amber-600 font-mono font-black text-xl">₹{(64 * simWeight).toFixed(2)}</span>
                      <span className="block text-slate-500 text-xs">Estimated Delivery: Next Day</span>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 hover:border-purple-500/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Ecom Express COD</span>
                        <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 text-[9px] font-bold">Best SLA</span>
                      </div>
                      <span className="block text-purple-600 font-mono font-black text-xl">₹{(54 * simWeight).toFixed(2)}</span>
                      <span className="block text-slate-500 text-xs">Estimated Delivery: 2 Days</span>
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
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h4 className="font-black text-rose-600 text-base font-display">Automated NDR Buyer WhatsApp Bot Simulation</h4>
                    <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      ● Active Workflow
                    </span>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-xs">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-md">
                        WA
                      </div>
                      <div className="space-y-1">
                        <span className="block font-bold text-slate-900 text-sm">Automated WhatsApp Alert Sent to Buyer (+91 98765*****)</span>
                        <div className="p-3.5 rounded-xl bg-white text-slate-700 font-mono text-xs border border-slate-200 shadow-2xs leading-relaxed">
                          "Hi Rahul! Courier delivery for Order #ord-1002 failed due to incorrect landmark. Reply 1 to update address or 2 to select reattempt date."
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
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
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h4 className="font-black text-emerald-600 text-base font-display">T+2 COD Settlement Ledger Estimator</h4>
                    <span className="text-[10px] font-mono text-blue-700 font-bold bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                      T+2 Business Days Cycle
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="block text-[10px] text-slate-500 uppercase font-bold">Gross COD Collected</span>
                      <span className="block text-lg font-black font-mono text-slate-900">₹1,45,000.00</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="block text-[10px] text-slate-500 uppercase font-bold">Freight Deductions</span>
                      <span className="block text-lg font-black font-mono text-rose-600">-₹12,400.00</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="block text-[10px] text-slate-500 uppercase font-bold">Early Remittance Fee</span>
                      <span className="block text-lg font-black font-mono text-emerald-600">₹0.00 Free</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                      <span className="block text-[10px] text-emerald-700 uppercase font-bold">Net Bank Payout</span>
                      <span className="block text-xl font-black font-mono text-emerald-700">₹1,32,600.00</span>
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
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h4 className="font-black text-amber-600 text-base font-display">Weight Dispute Digital Evidence Locker</h4>
                    <span className="text-[10px] font-mono text-amber-700 font-bold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                      Dispute Ticket #WD-901
                    </span>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                    <div className="space-y-1.5 text-left">
                      <span className="block font-bold text-slate-900 text-sm">AWB: DEL992817261 • Claimed 1.5 kg vs Billed 0.5 kg</span>
                      <span className="block text-xs text-slate-500">Digital warehouse scale image attached (JPEG evidence validated)</span>
                    </div>
                    <span className="px-3.5 py-1.5 rounded-xl bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 shrink-0">
                      Pending Carrier Credit Note (₹35)
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Feature Comparison Matrix — Clean Open Section */}
        <div className="py-12 sm:py-16 border-t border-slate-200/80 space-y-8">
          <div className="text-center space-y-3.5 max-w-5xl mx-auto">
            <div className="inline-block">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-extrabold border border-blue-200/80 shadow-xs">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span className="uppercase tracking-wider">PLATFORM COMPARISON • WHY SHIPFASTER</span>
              </div>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-display tracking-tight leading-[1.18] max-w-4xl mx-auto">
              Platform Capability{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
                Comparison Matrix
              </span>
            </h2>

            <p className="text-sm sm:text-base md:text-lg text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto">
              Compare how ShipFaster Logistic outperforms legacy aggregators and tedious direct courier agreements across every metric.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200/90 shadow-sm bg-white">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-900 text-white border-b border-slate-200 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4 sm:p-5">Platform Capability</th>
                  <th className="p-4 sm:p-5 text-center text-blue-400 font-black">ShipFaster Logistic Platform</th>
                  <th className="p-4 sm:p-5 text-center text-slate-300">Traditional Aggregators</th>
                  <th className="p-4 sm:p-5 text-center text-slate-300">Direct Courier Contracts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {featureComparison.map((row, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-4 sm:p-4.5 font-bold text-slate-900">{row.capability}</td>
                    <td className="p-4 sm:p-4.5 text-center bg-blue-50/50">
                      <Check className="w-5 h-5 text-emerald-600 mx-auto" />
                    </td>
                    <td className="p-4 sm:p-4.5 text-center">
                      {row.traditional ? <Check className="w-4 h-4 text-slate-400 mx-auto" /> : <X className="w-4 h-4 text-rose-400 mx-auto" />}
                    </td>
                    <td className="p-4 sm:p-4.5 text-center">
                      {row.directContracts ? <Check className="w-4 h-4 text-slate-400 mx-auto" /> : <X className="w-4 h-4 text-rose-400 mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Feature FAQs Section with Clean Hairline Accordion (No Boxed Cards) */}
        <div className="py-12 sm:py-16 border-t border-slate-200/80 space-y-8">
          <div className="text-center space-y-3.5 max-w-5xl mx-auto">
            <div className="inline-block">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-extrabold border border-blue-200/80 shadow-xs">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                <span className="uppercase tracking-wider">FEATURE QUESTIONS • EVERYTHING ANSWERED</span>
              </div>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-display tracking-tight leading-[1.18] max-w-4xl mx-auto">
              Frequently Asked{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
                Platform Questions
              </span>
            </h2>

            <p className="text-sm sm:text-base md:text-lg text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto">
              Got questions about our courier engine, NDR workflows, or early payouts? Find detailed answers below.
            </p>
          </div>

          <div className="divide-y divide-slate-200/80 max-w-3xl mx-auto">
            {faqs.map((faq, idx) => (
              <div key={idx} className="py-5 first:pt-0 last:pb-0">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left flex items-center justify-between font-bold text-slate-900 text-base sm:text-lg hover:text-blue-600 transition-colors cursor-pointer group"
                >
                  <span className="pr-4 group-hover:translate-x-0.5 transition-transform">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${openFaq === idx ? 'rotate-180 text-blue-600' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="pt-3 text-sm text-slate-600 leading-relaxed font-medium"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};
