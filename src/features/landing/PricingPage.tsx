import React, { useState } from 'react';
import { PublicNavbar, PublicFooter } from './PublicNav';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, ArrowRight, Sparkles, Calculator, CheckCircle2, Tag, 
  ChevronDown, Scale, Zap, ShieldCheck, TrendingUp, HelpCircle, 
  DollarSign, Wallet, Truck, Layers, Globe, Building2, Clock, 
  Headset, ArrowUpRight, BarChart3, PackageCheck
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { GlobalThreeBackground } from '../../components/ui/GlobalThreeBackground';

export const PricingPage: React.FC = () => {
  const [monthlyVolume, setMonthlyVolume] = useState<number>(2000);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [selectedShippingMode, setSelectedShippingMode] = useState<'surface' | 'express'>('surface');

  // Freight savings estimation calculation
  const avgFreightRate = selectedShippingMode === 'surface' ? 58 : 84;
  const estimatedSavingsPercent = monthlyVolume >= 15000 ? 0.32 : monthlyVolume >= 5000 ? 0.28 : monthlyVolume >= 2000 ? 0.22 : 0.15;
  const estimatedMonthlySavings = Math.round(monthlyVolume * avgFreightRate * estimatedSavingsPercent);
  const estimatedMonthlySpend = Math.round(monthlyVolume * avgFreightRate * (1 - estimatedSavingsPercent));
  const standardBaselineSpend = Math.round(monthlyVolume * avgFreightRate);
  const annualSavings = Math.round(estimatedMonthlySavings * 12);
  const sliderPercentage = Math.min(100, Math.max(0, ((monthlyVolume - 100) / (50000 - 100)) * 100));

  // Zone-wise benchmark rate matrix
  const zoneRateCards = [
    { zone: 'Intra-City (Local)', desc: 'Within municipal city boundaries', surfaceStarting: '₹39', expressStarting: '₹49', sla: 'Same / Next Day' },
    { zone: 'Within State (Regional)', desc: 'Across districts in the same state', surfaceStarting: '₹45', expressStarting: '₹59', sla: '1 - 2 Days' },
    { zone: 'Metro to Metro (National)', desc: 'Between Delhi, Mumbai, BLR, HYD, etc.', surfaceStarting: '₹52', expressStarting: '₹74', sla: '2 - 3 Days' },
    { zone: 'Rest of India (Tier 2/3)', desc: 'All standard pincodes nationwide', surfaceStarting: '₹59', expressStarting: '₹89', sla: '3 - 4 Days' },
    { zone: 'Special & North-East (J&K, NE)', desc: 'Hilly and remote pin regions', surfaceStarting: '₹69', expressStarting: '₹115', sla: '4 - 6 Days' },
  ];

  // Comprehensive feature matrix with categories
  const featureCategories = [
    {
      category: 'Core Multi-Courier Engine',
      items: [
        { feature: 'Multi-Courier Access (Delhivery, Xpressbees, etc.)', starter: true, growth: true, enterprise: true, note: 'Instant activation' },
        { feature: 'Real-Time Rate Comparison Engine', starter: true, growth: true, enterprise: true, note: 'Cheapest vs Fastest' },
        { feature: 'Standard AWB Thermal Label Generation (4x6 & A4)', starter: true, growth: true, enterprise: true, note: 'Under 2 seconds' },
        { feature: 'Unified Multi-Courier Tracking Timeline', starter: true, growth: true, enterprise: true, note: 'Live courier telemetry' },
        { feature: 'Pan-India 28,000+ Pincode Serviceability Check', starter: true, growth: true, enterprise: true, note: 'Real-time routing' },
        { feature: 'Automated AI Smart Courier Allocation', starter: false, growth: true, enterprise: true, note: 'Best SLA routing' },
      ]
    },
    {
      category: 'NDR Management & RTO Protection',
      items: [
        { feature: 'Manual NDR Escalation & Reattempt Requests', starter: true, growth: true, enterprise: true, note: 'Single-click' },
        { feature: 'Automated WhatsApp Buyer Confirmation Bot', starter: false, growth: true, enterprise: true, note: 'Interactive prompts' },
        { feature: 'Automated Courier Reattempt Dispatch Trigger', starter: false, growth: true, enterprise: true, note: 'Immediate sync' },
        { feature: 'Predictive RTO High-Risk Customer Scoring', starter: false, growth: false, enterprise: true, note: 'ML risk flagging' },
      ]
    },
    {
      category: 'COD Remittance & Financial Flow',
      items: [
        { feature: 'Standard COD Processing (T+5 Business Days)', starter: true, growth: false, enterprise: false, note: 'Standard cycle' },
        { feature: 'Early T+2 Fast COD Bank Settlement', starter: false, growth: true, enterprise: true, note: 'Direct bank credit' },
        { feature: 'Atomic Prepaid Shipping Wallet Ledger', starter: true, growth: true, enterprise: true, note: 'Cryptographic ledger' },
        { feature: 'Weight Dispute Audit & Evidence Locker', starter: false, growth: true, enterprise: true, note: 'Scale photo upload' },
      ]
    },
    {
      category: 'Store Integrations & Developer APIs',
      items: [
        { feature: 'CSV Bulk Order Import & Manifest Generation', starter: true, growth: true, enterprise: true, note: 'Unlimited uploads' },
        { feature: '1-Click Shopify & WooCommerce Auto-Sync', starter: false, growth: true, enterprise: true, note: 'Real-time order sync' },
        { feature: 'Developer REST API & Webhook Notifications', starter: false, growth: true, enterprise: true, note: 'Full programmatic access' },
        { feature: 'Custom ERP / WMS Multi-Warehouse Allocation', starter: false, growth: false, enterprise: true, note: 'Dedicated endpoints' },
      ]
    },
    {
      category: 'Support SLAs & Account Management',
      items: [
        { feature: 'Standard Email & Ticket Support (24-48h SLA)', starter: true, growth: false, enterprise: false, note: 'Helpdesk portal' },
        { feature: 'Priority Chat & Phone Support (2-4h SLA)', starter: false, growth: true, enterprise: true, note: 'Dedicated queue' },
        { feature: 'Dedicated Key Account Manager (KAM)', starter: false, growth: false, enterprise: true, note: 'Direct contact' },
        { feature: 'Tailored Weight Slab Rate Card Contracts', starter: false, growth: false, enterprise: true, note: 'Volume-negotiated' },
      ]
    }
  ];

  const pricingFaqs = [
    {
      q: 'Are there any recurring monthly subscription fees or signup charges?',
      a: 'Zero! ShipFaster operates completely on a pay-as-you-ship model. There are no monthly maintenance fees, activation fees, or mandatory minimum balances on our Starter and Growth plans. You only pay for the shipments you book.'
    },
    {
      q: 'How are shipping rates calculated for each parcel?',
      a: 'Rates are calculated using the greater of actual dead weight or volumetric weight (Length x Width x Height in cm divided by 5000), combined with the pickup and destination delivery zone.'
    },
    {
      q: 'When do I receive my Cash on Delivery (COD) remittances?',
      a: 'On our Growth and Enterprise plans, COD settlements are deposited into your verified Indian bank account on a T+2 business day schedule once the parcel is marked Delivered by the carrier.'
    },
    {
      q: 'How does the automated multi-courier rate engine save money?',
      a: 'Instead of being locked into a single courier with fixed rates, our platform queries live rates across Delhivery, Xpressbees, Shadowfax, DTDC, and Ecom Express in real-time. You can automatically route each parcel through the lowest cost carrier that meets your delivery SLA.'
    },
    {
      q: 'Can I negotiate custom rate cards if I ship large volumes?',
      a: 'Absolutely! If your business ships over 2,000 parcels per month, our enterprise team will provide custom weight slabs (e.g. 250g micro-slabs or heavy freight discounts) and assign a dedicated Key Account Manager.'
    },
    {
      q: 'What happens in case of courier weight discrepancies or disputes?',
      a: 'Our Weight Dispute Evidence Locker allows you to upload photos of your package on a weight scale and packaging dimensions. Our dispute team immediately files carrier chargeback disputes to protect your margins.'
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col relative selection:bg-blue-500 selection:text-white">
      <PublicNavbar />

      {/* Hero Section (Standardized Height, Breadth, and Dynamic Three.js Background) */}
      <section className="relative py-12 sm:py-16 px-6 sm:px-8 bg-gradient-to-b from-blue-50/40 via-white to-white border-b border-slate-200/80 overflow-hidden">
        {/* Three.js Dynamic Background Canvas */}
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
            <Tag className="w-3.5 h-3.5 text-blue-600" />
            <span className="uppercase tracking-wider">Pay-As-You-Ship Pricing • Zero Monthly Subscription Fees</span>
          </motion.div>

          {/* Redesigned Display Heading (Consistent with Other Landing Pages) */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black font-display tracking-tight leading-[1.22] sm:leading-[1.24] max-w-6xl mx-auto text-slate-950"
          >
            <span className="block pb-1 sm:pb-1.5 text-slate-950">Simple, Transparent Pricing.</span>
            <span className="inline-block mt-1 sm:mt-2 px-2 pb-2 sm:pb-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent sm:whitespace-nowrap">
              No Hidden Fees. Scale as You Ship.
            </span>
          </motion.h1>

          {/* Subtitle Paragraph */}
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium"
          >
            Access Tier-1 carrier commercial discounts with zero upfront subscription cost. Choose the tier that matches your shipment volume and unlock lower per-parcel freight rates.
          </motion.p>

          {/* Standard Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4 pt-2"
          >
            <Link to="/register">
              <Button size="lg" className="shadow-lg shadow-blue-500/20 bg-blue-600 hover:bg-blue-700 text-white font-extrabold" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Start Shipping Free
              </Button>
            </Link>
            <a href="#calculator">
              <button className="inline-flex items-center justify-center font-extrabold rounded-xl transition-all duration-200 text-sm px-6 py-3 gap-2.5 bg-white border border-slate-200/90 text-slate-800 hover:bg-slate-50 hover:border-blue-300 shadow-xs cursor-pointer">
                <Calculator className="w-5 h-5 text-blue-600 shrink-0" />
                <span>Calculate Store Savings</span>
              </button>
            </a>
          </motion.div>

          {/* Live Metrics Ticker Bar (Matching PublicIntegrationsPage, FeaturesPage, ContactPage) */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="pt-6 border-t border-slate-200/80 flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-xs font-mono text-slate-600 max-w-4xl mx-auto"
          >
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-slate-900 font-bold">500K+ Parcels/Mo</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-2xs">
              <span className="text-blue-600 font-bold">₹0</span>
              <span>Platform Subscription Fee</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-2xs">
              <span className="text-emerald-600 font-bold">₹39</span>
              <span>Starting Rate / 500g</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-2xs">
              <span className="text-indigo-600 font-bold">T+2 Days</span>
              <span>Direct Bank COD Payout</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content Section (Standardized Breadth & Vertical Spacing: py-12 sm:py-16 px-6 sm:px-8 max-w-7xl mx-auto w-full space-y-16) */}
      <section className="py-12 sm:py-16 px-6 sm:px-8 max-w-7xl mx-auto w-full space-y-16">
        
        {/* Section 1: Redesigned Compact Equal-Height Pricing Cards */}
        <div className="space-y-6">
          <div className="text-center space-y-3.5 max-w-5xl mx-auto">
            <div className="inline-block">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-extrabold border border-blue-200/80 shadow-xs">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                <Tag className="w-3.5 h-3.5 text-blue-600" />
                <span className="uppercase tracking-wider">Transparent Pricing Plans</span>
              </div>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-display tracking-tight leading-[1.24] max-w-4xl mx-auto">
              Select Your{' '}
              <span className="inline-block pb-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
                Shipping Tier
              </span>
            </h2>

            <p className="text-sm sm:text-base md:text-lg text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto">
              No contracts or security deposits required. Scale seamlessly as your monthly order volumes grow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch pt-2">
            {/* STARTER PLAN */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.35 }}
              whileHover={{ y: -4 }}
              className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4 relative"
            >
              <div className="space-y-3.5">
                {/* Header: Badge & Volume Range */}
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-wider font-mono">
                    STARTER
                  </span>
                  <span className="text-[11px] font-bold font-mono text-slate-500">
                    1 – 250 orders/mo
                  </span>
                </div>

                {/* Price Display */}
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl sm:text-4xl font-black text-slate-950 font-display tracking-tight">₹0</span>
                    <span className="text-xs font-semibold text-slate-500">/ forever free</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">
                    Essential multi-courier tools for new stores and testing brands.
                  </p>
                </div>

                {/* Direct CTA Button */}
                <Link to="/register" className="block w-full pt-0.5">
                  <Button variant="outline" className="w-full justify-center font-extrabold text-xs py-2.5 hover:bg-slate-50 hover:border-blue-300">
                    Get Started Free →
                  </Button>
                </Link>

                {/* Compact 1-Line Features List */}
                <div className="pt-3 border-t border-slate-100 space-y-2 font-medium text-xs text-slate-800">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate">4 Couriers (Delhivery, Xpressbees, etc.)</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate">Live multi-carrier rate comparison</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate">4x6 thermal barcode labels &amp; manifests</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate">Unified AWB tracking timeline</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-400">
                    <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    </div>
                    <span className="truncate">Standard T+5 COD remittance cycle</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 font-mono font-medium">
                  Zero setup fee • Instant sign up
                </span>
              </div>
            </motion.div>

            {/* GROWTH PLAN (FEATURED / MOST POPULAR) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.35, delay: 0.08 }}
              whileHover={{ y: -4 }}
              className="bg-slate-950 text-white p-5 sm:p-6 rounded-2xl border-2 border-blue-500 shadow-xl flex flex-col justify-between space-y-4 relative z-10"
            >
              {/* Floating Popular Pill */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[9px] font-black uppercase tracking-widest shadow-md z-20 flex items-center gap-1 whitespace-nowrap">
                <Sparkles className="w-3 h-3" />
                <span>MOST POPULAR</span>
              </div>

              <div className="space-y-3.5">
                {/* Header: Badge & Volume Range */}
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-[10px] font-black uppercase tracking-wider font-mono border border-blue-400/30">
                    GROWTH
                  </span>
                  <span className="text-[11px] font-bold font-mono text-blue-400">
                    250 – 5,000 orders/mo
                  </span>
                </div>

                {/* Price Display */}
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl sm:text-4xl font-black text-white font-display tracking-tight">₹39</span>
                    <span className="text-xs font-semibold text-blue-400">/ 500g base</span>
                    <span className="text-[10px] text-slate-400 font-mono font-semibold ml-1">Pay-as-you-ship</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 font-medium leading-relaxed">
                    Commercial discounted slabs for scaling D2C storefronts.
                  </p>
                </div>

                {/* Direct CTA Button */}
                <Link to="/register" className="block w-full pt-0.5">
                  <Button className="w-full justify-center bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs py-2.5 shadow-md shadow-blue-500/25">
                    Start Shipping on Growth →
                  </Button>
                </Link>

                {/* Compact 1-Line Features List */}
                <div className="pt-3 border-t border-slate-800 space-y-2 font-medium text-xs text-slate-200">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                    <span className="truncate font-semibold text-white">Commercial freight rates from ₹39/500g</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                    <span className="truncate">WhatsApp NDR buyer auto-reattempt bot</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                    <span className="truncate">Early T+2 Fast COD direct bank remittance</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                    <span className="truncate">1-Click Shopify &amp; WooCommerce sync</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                    <span className="truncate">Weight dispute photo evidence locker</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-mono font-medium">
                  ₹0 subscription fee • Pay only for freight
                </span>
              </div>
            </motion.div>

            {/* ENTERPRISE PLAN */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.35, delay: 0.16 }}
              whileHover={{ y: -4 }}
              className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4 relative"
            >
              <div className="space-y-3.5">
                {/* Header: Badge & Volume Range */}
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-wider font-mono">
                    ENTERPRISE
                  </span>
                  <span className="text-[11px] font-bold font-mono text-slate-500">
                    5,000+ orders/mo
                  </span>
                </div>

                {/* Price Display */}
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl sm:text-4xl font-black text-slate-950 font-display tracking-tight">Custom</span>
                    <span className="text-xs font-semibold text-slate-500">/ volume slabs</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">
                    Custom contracts for high-volume enterprise retailers &amp; 3PLs.
                  </p>
                </div>

                {/* Direct CTA Button */}
                <Link to="/contact" className="block w-full pt-0.5">
                  <Button variant="outline" className="w-full justify-center font-extrabold text-xs py-2.5 hover:bg-slate-50 hover:border-blue-300">
                    Contact Enterprise Sales →
                  </Button>
                </Link>

                {/* Compact 1-Line Features List */}
                <div className="pt-3 border-t border-slate-100 space-y-2 font-medium text-xs text-slate-800">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate font-semibold text-slate-900">Tailored rate cards (from ₹34/500g)</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate">Dedicated Key Account Manager (KAM)</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate">Developer REST APIs &amp; custom webhooks</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate">Multi-warehouse automated pickup allocation</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate">Custom delivery SLAs &amp; credit terms</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 font-mono font-medium">
                  Custom rate negotiation • SLA guarantees
                </span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Section 2: Transparent Zone Rate Cards (Real Practical Benchmark Value) */}
        <div className="space-y-6 pt-8 border-t border-slate-200/80">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3.5 max-w-3xl text-left">
              <div className="inline-block">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-extrabold border border-blue-200/80 shadow-xs">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                  </span>
                  <Truck className="w-3.5 h-3.5 text-blue-600" />
                  <span className="uppercase tracking-wider">Carrier Benchmark Rates</span>
                </div>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-display tracking-tight leading-[1.24]">
                Standard Shipping Rate Cards{' '}
                <span className="inline-block pb-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
                  by Delivery Zone
                </span>
              </h2>

              <p className="text-sm sm:text-base md:text-lg text-slate-600 font-medium leading-relaxed">
                Transparent starting rates per 500g slab across Delhivery, Xpressbees, Shadowfax, and DTDC.
              </p>
            </div>

            {/* Surface vs Express Mode Toggle */}
            <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200/80 shrink-0 self-start md:self-end">
              <button
                onClick={() => setSelectedShippingMode('surface')}
                className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  selectedShippingMode === 'surface'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Surface Logistics
              </button>
              <button
                onClick={() => setSelectedShippingMode('express')}
                className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  selectedShippingMode === 'express'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Express Air Priority
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-200/90 shadow-sm bg-white">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/90 text-slate-900 font-display">
                  <th className="p-4 sm:p-5 font-black uppercase text-xs tracking-wider text-slate-700">Delivery Zone</th>
                  <th className="p-4 sm:p-5 font-black uppercase text-xs tracking-wider text-slate-700">Coverage Description</th>
                  <th className="p-4 sm:p-5 font-black uppercase text-xs tracking-wider text-slate-700">Transit SLA</th>
                  <th className="p-4 sm:p-5 font-black uppercase text-xs tracking-wider text-blue-600 text-right">Starting Rate (per 500g)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {zoneRateCards.map((r, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-4 sm:p-5 font-bold text-slate-950 flex items-center gap-2.5">
                      <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>{r.zone}</span>
                    </td>
                    <td className="p-4 sm:p-5 text-slate-600 text-xs sm:text-sm">{r.desc}</td>
                    <td className="p-4 sm:p-5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold font-mono">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {r.sla}
                      </span>
                    </td>
                    <td className="p-4 sm:p-5 text-right">
                      <span className="text-base sm:text-lg font-black font-display text-blue-600">
                        {selectedShippingMode === 'surface' ? r.surfaceStarting : r.expressStarting}
                      </span>
                      <span className="text-xs text-slate-400 font-normal"> / 0.5 kg</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
              <div className="text-xs text-slate-700">
                <span className="font-bold text-slate-900 block">COD Collection Fee</span>
                1.5% or ₹20 (whichever is higher)
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
              <div className="text-xs text-slate-700">
                <span className="font-bold text-slate-900 block">Pickup &amp; Handover Surcharge</span>
                ₹0 (Free doorstep courier pickup)
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
              <div className="text-xs text-slate-700">
                <span className="font-bold text-slate-900 block">RTO Reverse Charges</span>
                Billed only on non-delivered parcels
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Interactive Volume Savings Calculator (Clean Spacious Studio Layout) */}
        <div id="calculator" className="pt-8 border-t border-slate-200/80 space-y-8 scroll-mt-24">
          <div className="text-center space-y-3.5 max-w-5xl mx-auto">
            <div className="inline-block">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-extrabold border border-blue-200/80 shadow-xs">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                <Calculator className="w-3.5 h-3.5 text-blue-600" />
                <span className="uppercase tracking-wider">AI Multi-Courier Savings Estimator</span>
              </div>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display text-slate-950 tracking-tight leading-[1.24] max-w-4xl mx-auto">
              See How Much Your Store{' '}
              <span className="inline-block pb-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
                Saves Every Month
              </span>
            </h2>

            <p className="text-sm sm:text-base md:text-lg text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto">
              Compare single-carrier standard retail pricing against ShipFaster’s automated multi-carrier aggregation engine.
            </p>
          </div>

          <div className="bg-slate-50/80 border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
              {/* Left Column: Interactive Controls */}
              <div className="lg:col-span-7 space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                      Monthly Order Volume
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-extrabold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/80 shadow-xs">
                      <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                      <span>{Math.round(estimatedSavingsPercent * 100)}% Volume Discount Tier</span>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl sm:text-6xl font-black font-display text-slate-950 tracking-tight">
                      {monthlyVolume.toLocaleString()}
                    </span>
                    <span className="text-base sm:text-lg font-bold text-slate-500 font-mono">
                      parcels / month
                    </span>
                  </div>

                  {/* Preset Volume Buttons */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {[500, 2000, 5000, 15000, 50000].map((vol) => (
                      <button
                        key={vol}
                        onClick={() => setMonthlyVolume(vol)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                          monthlyVolume === vol
                            ? 'bg-slate-900 text-white shadow-xs ring-2 ring-slate-900/10'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {vol.toLocaleString()} / mo
                      </button>
                    ))}
                  </div>
                </div>

                {/* Range Slider */}
                <div className="space-y-3 pt-2">
                  <div className="relative flex items-center">
                    <input
                      type="range"
                      min="100"
                      max="50000"
                      step="250"
                      value={monthlyVolume}
                      onChange={(e) => setMonthlyVolume(parseInt(e.target.value, 10))}
                      style={{
                        background: `linear-gradient(to right, #2563eb 0%, #4f46e5 ${sliderPercentage}%, #e2e8f0 ${sliderPercentage}%, #e2e8f0 100%)`
                      }}
                      className="w-full h-3 rounded-full appearance-none cursor-pointer accent-blue-600 transition-all focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-between items-center text-xs font-mono font-bold text-slate-400 px-1">
                    <span className={monthlyVolume <= 1000 ? 'text-blue-600 font-black' : ''}>100 (Starter)</span>
                    <span className={monthlyVolume >= 2000 && monthlyVolume < 5000 ? 'text-blue-600 font-black' : ''}>2,000 (Growth)</span>
                    <span className={monthlyVolume >= 5000 && monthlyVolume < 15000 ? 'text-blue-600 font-black' : ''}>5,000 (Scale)</span>
                    <span className={monthlyVolume >= 15000 ? 'text-blue-600 font-black' : ''}>50,000+ (Enterprise)</span>
                  </div>
                </div>

                {/* Volume Tier Features Checklist */}
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 font-mono">
                    Features Automatically Activated at this Volume:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold text-slate-800">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Multi-carrier AI rate comparison</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Unified tracking &amp; branded SMS notifications</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className={`w-4 h-4 shrink-0 ${monthlyVolume >= 2000 ? 'text-emerald-600' : 'text-slate-300'}`} />
                      <span className={monthlyVolume >= 2000 ? 'text-slate-900' : 'text-slate-400'}>
                        WhatsApp NDR reattempt bot {monthlyVolume < 2000 && '(Unlocks at 2k)'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className={`w-4 h-4 shrink-0 ${monthlyVolume >= 2000 ? 'text-emerald-600' : 'text-slate-300'}`} />
                      <span className={monthlyVolume >= 2000 ? 'text-slate-900' : 'text-slate-400'}>
                        T+2 Early COD bank remittances {monthlyVolume < 2000 && '(Unlocks at 2k)'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: High-Impact ROI Showcase */}
              <div className="lg:col-span-5 rounded-3xl p-6 sm:p-8 bg-slate-950 text-white shadow-2xl space-y-6 relative overflow-hidden border border-slate-800">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">
                      Estimated Monthly Freight Savings
                    </span>
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-black font-mono text-emerald-400 tracking-tight">
                      ₹{estimatedMonthlySavings.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                      / month saved
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 font-medium">
                    That adds up to <span className="font-bold text-white font-mono text-sm">₹{annualSavings.toLocaleString()}</span> in retained bottom-line profit every year!
                  </p>
                </div>

                {/* Progress Comparison */}
                <div className="relative z-10 space-y-3 pt-4 border-t border-slate-800">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">Single-Carrier Spend</span>
                      <span className="text-slate-300 font-bold line-through">₹{standardBaselineSpend.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-600 rounded-full w-full" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-emerald-400 font-bold">With ShipFaster Aggregation</span>
                      <span className="text-white font-bold">₹{estimatedMonthlySpend.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 rounded-full transition-all duration-300" 
                        style={{ width: `${Math.round((1 - estimatedSavingsPercent) * 100)}%` }} 
                      />
                    </div>
                  </div>
                </div>

                {/* Stat Badges */}
                <div className="relative z-10 grid grid-cols-2 gap-3 pt-2 text-center">
                  <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-0.5">
                    <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">Effective Freight</span>
                    <span className="block text-base font-black text-white font-mono">₹{(avgFreightRate * (1 - estimatedSavingsPercent)).toFixed(1)} / parcel</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-0.5">
                    <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">COD Remittance</span>
                    <span className="block text-base font-black text-emerald-400 font-mono">T+2 Days Direct</span>
                  </div>
                </div>

                <div className="relative z-10 pt-2">
                  <Link to="/register">
                    <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm py-3.5 px-5 rounded-2xl shadow-xl shadow-blue-600/30 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 group">
                      <span>Unlock These Discounted Rates</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Full Categorized Feature Comparison Matrix */}
        <div className="space-y-8 pt-8 border-t border-slate-200/80">
          <div className="text-center space-y-3.5 max-w-5xl mx-auto">
            <div className="inline-block">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-extrabold border border-blue-200/80 shadow-xs">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span className="uppercase tracking-wider">Full Plan Breakdown</span>
              </div>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-display tracking-tight leading-[1.24] max-w-4xl mx-auto">
              Compare Multi-Carrier{' '}
              <span className="inline-block pb-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
                Platform Capabilities
              </span>
            </h2>

            <p className="text-sm sm:text-base md:text-lg text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto">
              Every tool and automation feature itemized so you can pick the exact fit for your store.
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-200/90 shadow-sm bg-white">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-950 text-white font-display">
                  <th className="p-4 sm:p-5 font-black uppercase text-xs tracking-wider text-slate-300 w-2/5">
                    Platform Capability
                  </th>
                  <th className="p-4 sm:p-5 text-center font-black uppercase text-xs tracking-wider text-slate-300 w-1/5">
                    STARTER
                  </th>
                  <th className="p-4 sm:p-5 text-center font-black uppercase text-xs tracking-wider text-blue-400 bg-slate-900 relative w-1/5 border-x border-slate-800">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-600 text-[10px] font-extrabold text-white uppercase tracking-wider mb-1 shadow-xs">
                      RECOMMENDED
                    </span>
                    <span className="block font-black text-sm text-white">GROWTH</span>
                  </th>
                  <th className="p-4 sm:p-5 text-center font-black uppercase text-xs tracking-wider text-slate-300 w-1/5">
                    ENTERPRISE
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {featureCategories.map((cat, catIdx) => (
                  <React.Fragment key={catIdx}>
                    <tr className="bg-slate-50/90 border-t-2 border-slate-200">
                      <td colSpan={4} className="p-3.5 sm:p-4 text-xs font-black uppercase tracking-wider text-blue-700 font-display">
                        {cat.category}
                      </td>
                    </tr>
                    {cat.items.map((r, itemIdx) => (
                      <tr 
                        key={itemIdx} 
                        className={`transition-colors hover:bg-blue-50/30 ${
                          itemIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                        }`}
                      >
                        <td className="p-3.5 sm:p-4 font-bold text-slate-900 leading-snug">
                          <div>{r.feature}</div>
                          {r.note && (
                            <span className="text-[11px] text-slate-400 font-normal block mt-0.5">
                              {r.note}
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 sm:p-4 text-center">
                          {r.starter ? (
                            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300/60 flex items-center justify-center font-bold mx-auto shadow-2xs">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="w-2.5 h-2.5 rounded-full bg-slate-300 mx-auto opacity-50" />
                          )}
                        </td>
                        <td className="p-3.5 sm:p-4 text-center bg-blue-50/40 border-x border-blue-100/80 font-bold">
                          {r.growth ? (
                            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold mx-auto shadow-xs shadow-blue-500/25">
                              <Check className="w-4 h-4 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="w-2.5 h-2.5 rounded-full bg-slate-300 mx-auto opacity-50" />
                          )}
                        </td>
                        <td className="p-3.5 sm:p-4 text-center">
                          {r.enterprise ? (
                            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300/60 flex items-center justify-center font-bold mx-auto shadow-2xs">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="w-2.5 h-2.5 rounded-full bg-slate-300 mx-auto opacity-50" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 5: Pricing FAQs (Matching PublicIntegrationsPage, FeaturesPage) */}
        <div className="py-8 border-t border-slate-200/80 space-y-8">
          <div className="text-center space-y-3.5 max-w-5xl mx-auto">
            <div className="inline-block">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-extrabold border border-blue-200/80 shadow-xs">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                <span className="uppercase tracking-wider">Pricing &amp; Billing FAQs</span>
              </div>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-display tracking-tight leading-[1.24] max-w-4xl mx-auto">
              Frequently Asked{' '}
              <span className="inline-block pb-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
                Billing Questions
              </span>
            </h2>

            <p className="text-sm sm:text-base md:text-lg text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto">
              Everything you need to know about our billing, wallets, and carrier rate calculations.
            </p>
          </div>

          <div className="divide-y divide-slate-200/80 max-w-3xl mx-auto">
            {pricingFaqs.map((faq, idx) => (
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
