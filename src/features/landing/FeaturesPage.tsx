import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Truck, Zap, Wallet, BarChart3, Globe, ShieldCheck, Scale, 
  Check, X, ArrowRight, Sparkles, Layers, Clock, Cpu, 
  CheckCircle2, ChevronDown, Box, Printer, HelpCircle, Bot,
  ArrowUpRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { ReadyToShipCTA } from './components/ReadyToShipCTA';

interface FeatureItem {
  id: string;
  title: string;
  category: 'shipping' | 'rto' | 'finance' | 'operations';
  desc: string;
  icon: React.ReactNode;
  badge: string;
  highlights: string[];
  specs: string;
  apiSnippet: string;
  actionLabel: string;
  actionLink: string;
}

interface ShippingZone {
  id: string;
  name: string;
  multiplier: number;
  eta: string;
}

const shippingZones: ShippingZone[] = [
  { id: 'zone_a', name: 'Zone A (Intra-City)', multiplier: 0.75, eta: 'Same / Next Day' },
  { id: 'zone_b', name: 'Zone B (Intra-State)', multiplier: 0.9, eta: '1-2 Days' },
  { id: 'zone_c', name: 'Zone C (Metro to Metro)', multiplier: 1.0, eta: '2-3 Days' },
  { id: 'zone_d', name: 'Zone D (Rest of India)', multiplier: 1.25, eta: '3-4 Days' },
  { id: 'zone_e', name: 'Zone E (Special / North East)', multiplier: 1.5, eta: '4-6 Days' },
];

export const FeaturesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'aggregation' | 'ndr' | 'cod' | 'disputes'>('aggregation');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [simWeight, setSimWeight] = useState<number>(1.5);
  const [simZoneId, setSimZoneId] = useState<string>('zone_c');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'shipping' | 'rto' | 'finance' | 'operations'>('all');
  const [selectedFeature, setSelectedFeature] = useState<FeatureItem | null>(null);
  
  // Interactive COD Simulator State
  const [codMonthlyVolume, setCodMonthlyVolume] = useState<number>(150000);

  // Interactive NDR Simulator State
  const [ndrSimulationStatus, setNdrSimulationStatus] = useState<'waiting' | 'address_updated' | 'rescheduled' | 'prepaid_converted'>('address_updated');

  const currentZone = shippingZones.find(z => z.id === simZoneId) || shippingZones[2];

  const featureList: FeatureItem[] = [
    { 
      id: 'multi-courier',
      title: 'Multi-Courier Aggregation Engine', 
      category: 'shipping',
      desc: 'Book shipments across Delhivery, Xpressbees, Ecom Express & Shadowfax dynamically from one panel without individual API contracts.', 
      icon: <Truck className="w-6 h-6 text-blue-600" />,
      badge: 'Core Engine',
      highlights: ['Single API Integration', 'Auto Carrier Routing', 'Zero Security Deposit'],
      specs: 'Unified REST endpoint supporting synchronous AWB generation and multi-carrier label streaming in under 400ms.',
      apiSnippet: `{
  "action": "shipment.create",
  "carrier_allocation": "cheapest_fastest",
  "pickup_pincode": "110020",
  "delivery_pincode": "400001",
  "declared_weight_kg": 1.5,
  "assigned_courier": "Delhivery Surface",
  "awb_assigned": "DEL-9842104"
}`,
      actionLabel: 'Calculate Rates',
      actionLink: '/app/tools/rate-calculator'
    },
    { 
      id: 'rate-comparison',
      title: 'Concurrent Rate Comparison', 
      category: 'shipping',
      desc: 'Real-time price & ETA comparisons tagged dynamically by Cheapest, Fastest, or Recommended based on shipping zone and weight.', 
      icon: <BarChart3 className="w-6 h-6 text-indigo-600" />,
      badge: 'Cost Optimizer',
      highlights: ['Live Freight Rates', 'Zone-based SLAs', 'Chargeable Weight Calculator'],
      specs: 'Computes volumetric weight (L*W*H/5000) and aggregates real-time quotes across 7+ commercial rate cards simultaneously.',
      apiSnippet: `{
  "route": "DEL_BOM",
  "chargeable_weight": 1.5,
  "quotes": [
    { "courier": "Delhivery", "rate": 63.0, "eta": "2 Days", "tag": "Cheapest" },
    { "courier": "Xpressbees Air", "rate": 84.0, "eta": "1 Day", "tag": "Fastest" },
    { "courier": "Ecom Express", "rate": 72.0, "eta": "2 Days", "tag": "Best SLA" }
  ]
}`,
      actionLabel: 'Try Rate Calculator',
      actionLink: '/app/tools/rate-calculator'
    },
    { 
      id: 'ndr-recovery',
      title: 'Automated NDR Recovery Hub', 
      category: 'rto',
      desc: 'Real-time non-delivery action center with buyer WhatsApp confirmation and automated reattempt scheduling to lower RTO.', 
      icon: <Zap className="w-6 h-6 text-amber-500" />,
      badge: 'RTO Prevention',
      highlights: ['65% RTO Reduction', 'WhatsApp Buyer Chatbot', 'Instant Courier Escalation'],
      specs: 'Webhooks trigger instant 2-way WhatsApp bots upon failed delivery attempts, passing rider instructions automatically.',
      apiSnippet: `{
  "event": "ndr.failed_attempt",
  "awb": "DEL9928172",
  "reason": "Customer Unavailable / Door Closed",
  "action_triggered": "whatsapp_interactive_bot",
  "buyer_confirmation": "Rescheduled for Tomorrow 4 PM",
  "carrier_reattempt_status": "Scheduled"
}`,
      actionLabel: 'Explore NDR Portal',
      actionLink: '/app/ndr'
    },
    { 
      id: 'cod-payouts',
      title: 'Early T+2 COD Payouts', 
      category: 'finance',
      desc: 'Accelerate working capital with T+2 day Cash On Delivery bank settlements and atomic wallet ledger tracking.', 
      icon: <Wallet className="w-6 h-6 text-emerald-600" />,
      badge: 'Financial Flow',
      highlights: ['T+2 Bank Settlement', 'Atomic Ledger Log', 'Unmatched Reconciliation'],
      specs: 'RBI-compliant automated reconciliation settling cash collections into seller accounts within 48 business hours.',
      apiSnippet: `{
  "settlement_id": "SET-89104",
  "cycle": "T+2 Business Days",
  "gross_cod": 150000.00,
  "freight_deducted": 12000.00,
  "early_fee": 0.00,
  "net_bank_transfer": 138000.00,
  "status": "PROCESSED_TO_BANK"
}`,
      actionLabel: 'View COD Settlements',
      actionLink: '/app/cod'
    },
    { 
      id: 'store-sync',
      title: 'Shopify & WooCommerce Auto-Sync', 
      category: 'operations',
      desc: 'Instant order import, fulfillment push, tracking status updates, and inventory sync across your storefronts.', 
      icon: <Globe className="w-6 h-6 text-purple-600" />,
      badge: 'Store Connector',
      highlights: ['1-Click OAuth Connect', 'Real-Time Inventory Sync', 'Auto Tracking Push'],
      specs: 'Bi-directional webhooks sync unfulfilled orders every 5 minutes and immediately write back tracking URLs upon label generation.',
      apiSnippet: `{
  "connector": "shopify_plus",
  "sync_interval": "real_time_webhooks",
  "order_id": "#SH-89410",
  "line_items_count": 2,
  "fulfillment_status": "fulfilled",
  "tracking_pushed": "https://shipfasterlogistic.com/track?awb=SF-9104"
}`,
      actionLabel: 'Connect Storefront',
      actionLink: '/app/integrations'
    },
    { 
      id: 'weight-disputes',
      title: 'Weight Dispute Audit System', 
      category: 'finance',
      desc: 'Compare declared parcel weight against carrier billed weight with scale photo evidence upload to dispute extra freight fees.', 
      icon: <Scale className="w-6 h-6 text-cyan-600" />,
      badge: 'Audit Protection',
      highlights: ['Photo Evidence Locker', 'Automated Dispute Ticket', 'Reconciliation Protection'],
      specs: 'Automated 7-day dispute window that freezes penalty deductions until photographic scale evidence is carrier-arbitrated.',
      apiSnippet: `{
  "dispute_id": "WD-9012",
  "awb": "DEL992817261",
  "declared_weight_kg": 0.5,
  "carrier_billed_kg": 1.5,
  "evidence_image_hash": "sha256_scale_box_4910.jpg",
  "arbitration_status": "CREDIT_NOTE_APPROVED",
  "refund_amount": 35.00
}`,
      actionLabel: 'Dispute Manager',
      actionLink: '/app/weight-disputes'
    },
    { 
      id: 'thermal-labels',
      title: '4x6 Thermal Barcode Label Generator', 
      category: 'operations',
      desc: 'Generate single or bulk 4x6 thermal shipping labels and A4 packing slips with scannable barcodes in under 2 seconds.', 
      icon: <Printer className="w-6 h-6 text-sky-600" />,
      badge: 'Warehouse Utility',
      highlights: ['Bulk Printing (500+ AWB)', 'ZPL/PDF Format', 'Custom Packing Slips'],
      specs: 'Client-side PDF and ZPL generation supporting high-speed Zebra, TSC, and standard laser barcode printers.',
      apiSnippet: `{
  "batch_id": "LBL-BATCH-209",
  "label_format": "4x6_thermal_zpl_pdf",
  "parcels_count": 250,
  "generation_time_ms": 680,
  "barcode_symbology": "Code128_Auto"
}`,
      actionLabel: 'Create Order & Label',
      actionLink: '/app/orders/new'
    },
    { 
      id: 'unified-tracking',
      title: 'Unified Real-Time Tracking Engine', 
      category: 'shipping',
      desc: 'Normalize courier status events (Picked Up, In Transit, Out for Delivery, Delivered) into one standardized tracking timeline.', 
      icon: <Clock className="w-6 h-6 text-blue-500" />,
      badge: 'Live Status',
      highlights: ['Branded Tracking Pages', 'SMS/Email Alerts', 'Universal AWB Lookup'],
      specs: 'Standardizes disparate carrier event codes into 6 human-friendly milestones with custom merchant branding.',
      apiSnippet: `{
  "universal_awb": "DL1928374650",
  "carrier_raw_status": "OFD_LAST_MILE",
  "normalized_status": "OUT_FOR_DELIVERY",
  "destination_city": "Mumbai",
  "estimated_delivery": "Today, 5:00 PM"
}`,
      actionLabel: 'Test Public Tracking',
      actionLink: '/track'
    },
    { 
      id: 'ai-allocation',
      title: 'Automated Courier Allocation', 
      category: 'shipping',
      desc: 'Machine learning routing algorithms that evaluate historical carrier delivery SLAs per pincode to assign the ideal courier.', 
      icon: <Cpu className="w-6 h-6 text-indigo-500" />,
      badge: 'AI Intelligence',
      highlights: ['Pincode SLA Predictions', 'Dynamic Carrier Switch', 'Lowest RTO Rate'],
      specs: 'Evaluates 90-day rolling courier reliability metrics across 28,000+ pincodes to maximize first-attempt deliveries.',
      apiSnippet: `{
  "algorithm": "smart_carrier_allocation_v3",
  "pincode_score_delhivery": 94.2,
  "pincode_score_xpressbees": 88.5,
  "pincode_score_shadowfax": 96.1,
  "recommended_winner": "Shadowfax Hyperlocal"
}`,
      actionLabel: 'Book Shipment',
      actionLink: '/app/orders/new'
    },
    { 
      id: 'whatsapp-bot',
      title: 'Conversational Buyer WhatsApp Bot', 
      category: 'rto',
      desc: 'Engage buyers directly via automated WhatsApp messages for order verification, pincode confirmation, and delivery updates.', 
      icon: <Bot className="w-6 h-6 text-emerald-500" />,
      badge: 'Buyer Engagement',
      highlights: ['Interactive Address Fix', 'Automated OTP Verification', '2-Way Chatbot'],
      specs: 'Official Meta WhatsApp Cloud API integration with automated quick-reply buttons and address correction validation.',
      apiSnippet: `{
  "recipient_phone": "+919876543210",
  "template": "delivery_landmark_fix",
  "buyer_reply": "Sector 14 near metro station",
  "address_updated": true,
  "rider_app_notified": true
}`,
      actionLabel: 'Manage NDR Engine',
      actionLink: '/app/ndr'
    },
    { 
      id: 'multi-warehouse',
      title: 'Multi-Warehouse Order Routing', 
      category: 'operations',
      desc: 'Fulfill orders from the nearest fulfillment center or warehouse based on customer pincode proximity to save freight costs.', 
      icon: <Box className="w-6 h-6 text-rose-500" />,
      badge: 'Fulfillment Strategy',
      highlights: ['Zone Proximity Match', 'Split Inventory Routing', 'Lower Zone Charges'],
      specs: 'Calculates geographical pin-distance between order delivery address and registered seller hubs to assign lowest freight zone.',
      apiSnippet: `{
  "delivery_pin": "560001",
  "warehouses_available": ["BOM_HUB_01", "BLR_HUB_02"],
  "assigned_hub": "BLR_HUB_02",
  "computed_zone": "ZONE_A_LOCAL",
  "freight_saved_inr": 28.50
}`,
      actionLabel: 'Warehouse Settings',
      actionLink: '/app/settings'
    },
    { 
      id: 'atomic-ledger',
      title: 'Atomic Financial Ledger Logs', 
      category: 'finance',
      desc: 'Cryptographically signed financial ledger detailing every freight debit, wallet top-up, GST tax breakdown, and COD payout.', 
      icon: <ShieldCheck className="w-6 h-6 text-amber-600" />,
      badge: 'Audit Trail',
      highlights: ['Zero Ledger Drift', 'GST Tax Reports', 'Instant CSV Export'],
      specs: 'Double-entry bookkeeping architecture with immutable transaction timestamps, GST breakdown, and dispute holds.',
      apiSnippet: `{
  "ledger_tx_id": "TX-990142",
  "type": "FREIGHT_DEBIT_AND_COD_HOLD",
  "amount_debited": 58.40,
  "gst_18pct": 10.51,
  "opening_balance": 12480.00,
  "closing_balance": 12411.09,
  "status": "COMMITTED"
}`,
      actionLabel: 'Open Wallet Ledger',
      actionLink: '/app/wallet'
    }
  ];

  const filteredFeatures = selectedCategory === 'all' 
    ? featureList 
    : featureList.filter(f => f.category === selectedCategory);

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
    <div className="text-slate-900 flex flex-col font-sans relative overflow-x-hidden">
      {/* Hero Header */}
      <section className="relative py-12 sm:py-16 px-6 sm:px-8 bg-gradient-to-b from-blue-50/40 via-white to-white border-b border-slate-200/80 overflow-hidden">

        <div className="relative max-w-7xl mx-auto space-y-8 text-center z-10">
          {/* Badge */}
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
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span className="uppercase tracking-wider">Platform Architecture • 12 Pillars of Automation</span>
          </motion.div>

          {/* Heading */}
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

          {/* Subtitle */}
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

          {/* Live Metrics Ticker Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="pt-6 border-t border-slate-200/80 flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-xs font-mono text-slate-600 max-w-4xl mx-auto"
          >
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-slate-900 font-bold">28,000+ Pincodes Covered</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-2xs">
              <span className="text-blue-600 font-bold">Sub-Second</span>
              <span>Rate Aggregation</span>
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

      {/* Ecosystem Ribbon Strip */}
      <section className="py-6 px-4 sm:px-8 border-b border-slate-200/80 bg-slate-50/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-500 font-bold font-mono uppercase tracking-wider">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>Integrated Network:</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 font-bold text-slate-700">
            <span className="px-3 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs">Delhivery</span>
            <span className="px-3 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs">Blue Dart</span>
            <span className="px-3 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs">Xpressbees</span>
            <span className="px-3 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs">Shadowfax</span>
            <span className="px-3 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs">DTDC</span>
            <span className="px-3 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs text-emerald-700 border-emerald-200">Shopify</span>
            <span className="px-3 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs text-purple-700 border-purple-200">WooCommerce</span>
            <span className="px-3 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs text-blue-700 border-blue-200">REST API</span>
          </div>
        </div>
      </section>

      {/* Main Grid: 12 Pillar Feature Capability Cards with Category Filter */}
      <section id="capabilities" className="py-8 sm:py-10 px-4 sm:px-8 max-w-7xl mx-auto w-full space-y-8">
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
            Designed to eliminate operational friction, reduce shipping costs, and automate fulfillment at every stage of your order lifecycle. Click any pillar to view technical specifications.
          </p>
        </div>

        {/* Category Filter Chips Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Pillars ({featureList.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('shipping')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === 'shipping'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Shipping &amp; Rates (4)
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('rto')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === 'rto'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            RTO &amp; NDR Recovery (2)
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('finance')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === 'finance'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Finance &amp; COD (3)
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('operations')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === 'operations'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Integrations &amp; Warehouse (3)
          </button>
        </div>

        {/* 12 Cards Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          <AnimatePresence>
            {filteredFeatures.map((feat, featIdx) => (
              <motion.div 
                key={feat.id}
                layout
                initial={{ opacity: 0, y: 14, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.32, delay: (featIdx % 4) * 0.04, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -4, scale: 1.012 }}
                whileTap={{ scale: 0.985 }}
                onClick={() => setSelectedFeature(feat)}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-[0_12px_28px_-6px_rgba(37,99,235,0.12)] hover:border-blue-300 transition-all duration-300 space-y-3.5 flex flex-col justify-between group cursor-pointer relative overflow-hidden"
              >
                {/* Subtle top accent gradient line on hover */}
                <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-blue-500/0 via-blue-500/80 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center shadow-xs group-hover:scale-105 group-hover:rotate-3 group-hover:bg-blue-50 group-hover:border-blue-200 transition-all duration-300 [&>svg]:w-5 [&>svg]:h-5 group-hover:[&>svg]:scale-110 [&>svg]:transition-transform">
                      {feat.icon}
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-extrabold border border-slate-200/80 font-display group-hover:bg-blue-50 group-hover:text-blue-700 group-hover:border-blue-200 group-hover:scale-105 transition-all duration-200">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-[15px] font-black text-slate-900 font-display leading-snug group-hover:text-blue-600 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-snug font-medium line-clamp-2">
                    {feat.desc}
                  </p>

                  <div className="pt-2.5 border-t border-slate-100/90 space-y-1.5">
                    {feat.highlights.map((item, hIdx) => (
                      <div key={hIdx} className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0 group-hover:scale-110 transition-transform duration-200" />
                        <span className="truncate">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100/90 flex items-center justify-between text-[11px] font-extrabold text-blue-600 group-hover:text-blue-700 transition-colors">
                  <span>View Technical Specs</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Feature Deep-Dive Interactive Modal */}
        <AnimatePresence>
          {selectedFeature && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-slate-200 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto"
              >
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setSelectedFeature(null)}
                  className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="flex items-center gap-3.5 pr-8">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                    {selectedFeature.icon}
                  </div>
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-mono font-bold uppercase">
                      {selectedFeature.badge}
                    </span>
                    <h3 className="text-xl font-black text-slate-900 font-display mt-0.5">
                      {selectedFeature.title}
                    </h3>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  {selectedFeature.desc}
                </p>

                {/* Specs Box */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1.5">
                  <span className="block font-bold text-slate-900 uppercase text-[10px] tracking-wider">Architecture Overview</span>
                  <p className="leading-relaxed">{selectedFeature.specs}</p>
                </div>

                {/* JSON Webhook / API Snippet */}
                <div className="space-y-1.5">
                  <span className="block font-mono text-[10px] font-bold text-slate-500 uppercase">
                    Sample JSON Webhook Payload / Schema
                  </span>
                  <div className="bg-slate-950 p-4 rounded-2xl text-[11px] font-mono text-emerald-400 overflow-x-auto border border-slate-800 shadow-inner">
                    <pre>{selectedFeature.apiSnippet}</pre>
                  </div>
                </div>

                {/* Highlights List */}
                <div className="space-y-2">
                  <span className="block font-bold text-slate-900 uppercase text-[10px] tracking-wider">Key Capabilities Included</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {selectedFeature.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-bold text-slate-800 p-2 rounded-xl bg-slate-50 border border-slate-200/60">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Modal Footer CTAs */}
                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedFeature(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Close
                  </button>

                  <Link to={selectedFeature.actionLink}>
                    <Button size="sm" className="font-extrabold shadow-sm">
                      {selectedFeature.actionLabel} &rarr;
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Interactive Feature Deep-Dive Simulator (#simulator) */}
        <div id="simulator" className="space-y-8 pt-8 border-t border-slate-200/80 relative">
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
              {/* TAB 1: Multi-Courier Rate Simulator */}
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
                      <p className="text-xs text-slate-500 font-medium">Interactive simulation for a {simWeight} kg parcel routed via {currentZone.name}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-slate-500 block">Shipping Zone:</label>
                        <select 
                          value={simZoneId}
                          onChange={(e) => setSimZoneId(e.target.value)}
                          className="bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-lg px-2.5 py-1.5 font-bold cursor-pointer focus:outline-none focus:border-blue-600"
                        >
                          {shippingZones.map((z) => (
                            <option key={z.id} value={z.id}>{z.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-slate-500 block">Weight:</label>
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
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-medium">
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 hover:border-emerald-500/50 transition-colors shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Delhivery Surface</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[9px] font-bold">Cheapest</span>
                      </div>
                      <span className="block text-emerald-600 font-mono font-black text-xl">
                        ₹{(42 * simWeight * currentZone.multiplier).toFixed(2)}
                      </span>
                      <span className="block text-slate-500 text-xs">Estimated Delivery: {currentZone.eta}</span>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 hover:border-amber-500/50 transition-colors shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Xpressbees Air</span>
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-[9px] font-bold">Fastest</span>
                      </div>
                      <span className="block text-amber-600 font-mono font-black text-xl">
                        ₹{(58 * simWeight * currentZone.multiplier).toFixed(2)}
                      </span>
                      <span className="block text-slate-500 text-xs">Estimated Delivery: Next Day Air</span>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 hover:border-purple-500/50 transition-colors shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Ecom Express COD</span>
                        <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 text-[9px] font-bold">Best SLA</span>
                      </div>
                      <span className="block text-purple-600 font-mono font-black text-xl">
                        ₹{(48 * simWeight * currentZone.multiplier).toFixed(2)}
                      </span>
                      <span className="block text-slate-500 text-xs">Estimated Delivery: {currentZone.eta}</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 2: Interactive NDR WhatsApp Bot Simulator */}
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
                      ● Live Simulation
                    </span>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-xs">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-md">
                        WA
                      </div>
                      <div className="space-y-1 w-full">
                        <span className="block font-bold text-slate-900 text-sm">Automated WhatsApp Alert Sent to Buyer (+91 98765 43210)</span>
                        <div className="p-3.5 rounded-xl bg-white text-slate-700 font-mono text-xs border border-slate-200 shadow-2xs leading-relaxed">
                          "Hi Rahul! Courier delivery for Order #ORD-1002 failed due to incorrect landmark. Please choose an option below to update the courier rider."
                        </div>
                      </div>
                    </div>

                    {/* Interactive Customer Reply Simulator Buttons */}
                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      <span className="text-[11px] font-bold text-slate-600 block">Simulate Buyer Action:</span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setNdrSimulationStatus('address_updated')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            ndrSimulationStatus === 'address_updated'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          1. Add Landmark Address
                        </button>
                        <button
                          type="button"
                          onClick={() => setNdrSimulationStatus('rescheduled')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            ndrSimulationStatus === 'rescheduled'
                              ? 'bg-blue-600 text-white'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          2. Reschedule to Saturday
                        </button>
                        <button
                          type="button"
                          onClick={() => setNdrSimulationStatus('prepaid_converted')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            ndrSimulationStatus === 'prepaid_converted'
                              ? 'bg-purple-600 text-white'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          3. Pay Online (UPI Link)
                        </button>
                      </div>
                    </div>

                    {/* Outcome Alert */}
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      {ndrSimulationStatus === 'address_updated' && (
                        <span>Buyer Replied: "Sector 14 near metro station" &rarr; Rider Landmark Updated in Real-Time via Courier API!</span>
                      )}
                      {ndrSimulationStatus === 'rescheduled' && (
                        <span>Buyer Replied: "Reschedule for Saturday 11 AM" &rarr; Next reattempt locked with Delhivery dispatch!</span>
                      )}
                      {ndrSimulationStatus === 'prepaid_converted' && (
                        <span>Buyer Paid via UPI Payment Link &rarr; Converted from COD to Prepaid to guarantee doorstep acceptance!</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 3: Interactive T+2 COD Remittance Cash Flow Simulator */}
              {activeTab === 'cod' && (
                <motion.div 
                  key="cod"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <h4 className="font-black text-emerald-600 text-base font-display">Interactive T+2 COD Cash Flow Calculator</h4>
                      <p className="text-xs text-slate-500 font-medium">Slide your monthly COD volume to see net bank payout &amp; working capital impact</p>
                    </div>
                    <span className="text-[10px] font-mono text-blue-700 font-bold bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 shrink-0">
                      T+2 Business Days
                    </span>
                  </div>

                  {/* Volume Slider */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700">Monthly Cash on Delivery Orders Volume:</span>
                      <span className="font-mono font-black text-blue-600 text-sm">
                        ₹{codMonthlyVolume.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <input 
                      type="range" 
                      min={25000} 
                      max={1000000} 
                      step={25000}
                      value={codMonthlyVolume}
                      onChange={(e) => setCodMonthlyVolume(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>₹25,000 / mo</span>
                      <span>₹5,00,000 / mo</span>
                      <span>₹10,00,000 / mo</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="block text-[10px] text-slate-500 uppercase font-bold">Gross COD Collected</span>
                      <span className="block text-lg font-black font-mono text-slate-900">
                        ₹{codMonthlyVolume.toLocaleString('en-IN')}.00
                      </span>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="block text-[10px] text-slate-500 uppercase font-bold">Est. Freight (8%)</span>
                      <span className="block text-lg font-black font-mono text-rose-600">
                        -₹{(codMonthlyVolume * 0.08).toLocaleString('en-IN')}.00
                      </span>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="block text-[10px] text-slate-500 uppercase font-bold">Remittance Fee</span>
                      <span className="block text-lg font-black font-mono text-emerald-600">₹0.00 Free</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                      <span className="block text-[10px] text-emerald-700 uppercase font-bold">Net Bank Payout</span>
                      <span className="block text-xl font-black font-mono text-emerald-700">
                        ₹{(codMonthlyVolume * 0.92).toLocaleString('en-IN')}.00
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 4: Weight Dispute Digital Evidence Locker */}
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
                      <span className="block text-xs text-slate-500">Digital warehouse scale image attached (JPEG evidence validated with tamper-check)</span>
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

        {/* Feature Comparison Matrix */}
        <div className="py-6 sm:py-8 border-t border-slate-200/80 space-y-6">
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

        {/* Feature FAQs Section */}
        <div className="pt-6 pb-6 sm:pt-8 sm:pb-8 border-t border-slate-200/80 space-y-6">
          <div className="text-center space-y-2 max-w-5xl mx-auto">
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

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 font-display tracking-tight leading-tight max-w-4xl mx-auto">
              Frequently Asked{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
                Platform Questions
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
              Got questions about our courier engine, NDR workflows, or early payouts? Find detailed answers below.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 max-w-5xl mx-auto w-full">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 h-fit ${
                    isOpen 
                      ? 'bg-blue-50/40 border-blue-300 shadow-xs' 
                      : 'bg-slate-50/60 hover:bg-slate-50 border-slate-200/80'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left flex items-start justify-between gap-3 font-bold text-slate-900 text-sm sm:text-base hover:text-blue-600 transition-colors cursor-pointer group"
                  >
                    <span className="leading-snug pr-2">{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 mt-0.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="pt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium border-t border-slate-200/60 mt-3"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pre-Footer High-Impact Conversion CTA Banner */}
      <ReadyToShipCTA />
    </div>
  );
};
