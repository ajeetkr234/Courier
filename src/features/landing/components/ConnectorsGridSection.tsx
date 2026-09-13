import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, Store, Code2, FileSpreadsheet, Server, Layers, 
  CheckCircle2, ArrowRight, Zap, Search, Radio, Database,
  X, ArrowUpRight, SearchX, RotateCcw, Clock, RefreshCw, ShieldCheck,
  Plus, Send, Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface ConnectorChannel {
  id: string;
  title: string;
  category: 'E-Commerce' | 'Developer' | 'Enterprise';
  categoryLabel: string;
  desc: string;
  badge: string;
  badgeColor: string;
  iconBg: string;
  iconColor: string;
  icon: React.ReactNode;
  features: string[];
  setupTime: string;
  syncFrequency: string;
  prerequisites: string[];
  setupSteps: { title: string; desc: string }[];
  specs: string;
}

const connectorsData: ConnectorChannel[] = [
  {
    id: 'shopify',
    title: 'Shopify Store Connector',
    category: 'E-Commerce',
    categoryLabel: 'E-Commerce Platform',
    desc: 'Connect your Shopify store in 1-click. Auto-sync orders every 5 mins and push tracking numbers automatically.',
    badge: '1-Click Connect',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    iconBg: 'bg-emerald-500/10 border-emerald-500/20',
    iconColor: 'text-emerald-600',
    icon: <ShoppingBag className="w-5 h-5" />,
    features: ['Automatic order import', 'Real-time tracking push', 'Inventory fulfillment sync'],
    setupTime: '<60 Seconds',
    syncFrequency: 'Instant Webhook / 5 min Polling',
    prerequisites: [
      'Shopify Store Admin Access',
      'Store Domain URL (.myshopify.com)',
      'Default Pickup Warehouse Pincode'
    ],
    setupSteps: [
      { title: 'Install ShipFaster App', desc: 'Click "Connect Shopify" in your dashboard and enter your myshopify.com store handle.' },
      { title: 'Grant Fulfillment Permissions', desc: 'Authorize ShipFaster to read unfulfilled orders and update carrier tracking numbers.' },
      { title: 'Auto-Sync & Carrier Rules', desc: 'Set default courier routing criteria (cheapest/fastest) and start printing labels.' }
    ],
    specs: 'Utilizes Shopify Fulfillment API (REST & GraphQL) with automatic HMAC signature verification and location ID fulfillment mapping.'
  },
  {
    id: 'woocommerce',
    title: 'WooCommerce Connector',
    category: 'E-Commerce',
    categoryLabel: 'WordPress Plugin',
    desc: 'Pair WooCommerce using REST API keys. Auto-fetch orders, generate labels, and send SMS tracking links.',
    badge: 'REST Sync',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200/80',
    iconBg: 'bg-purple-500/10 border-purple-500/20',
    iconColor: 'text-purple-600',
    icon: <Store className="w-5 h-5" />,
    features: ['Consumer key/secret pairing', 'Order status webhook trigger', 'Automated AWB assignment'],
    setupTime: '2 Minutes',
    syncFrequency: 'Instant Webhooks (order.created)',
    prerequisites: [
      'WordPress Administrator Access',
      'WooCommerce 5.0+ installed',
      'Read/Write REST API Consumer Key & Secret'
    ],
    setupSteps: [
      { title: 'Generate REST API Keys', desc: 'In WooCommerce Settings > Advanced > REST API, create keys with Read/Write permissions.' },
      { title: 'Paste Keys in ShipFaster', desc: 'Paste your Consumer Key, Consumer Secret, and Site URL into your ShipFaster integrations panel.' },
      { title: 'Webhook Activation', desc: 'Automatic webhook registration synchronizes orders and marks completed deliveries with SMS tracking.' }
    ],
    specs: 'Direct REST API v3 integration with automated tracking note injection and real-time order status callbacks.'
  },
  {
    id: 'rest_api',
    title: 'Custom Website REST API',
    category: 'Developer',
    categoryLabel: 'Developer API',
    desc: 'For custom websites, ERPs, or WMS. Use high-concurrency JSON REST API to create orders & rate quotes.',
    badge: 'Developer API',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200/80',
    iconBg: 'bg-blue-500/10 border-blue-500/20',
    iconColor: 'text-blue-600',
    icon: <Code2 className="w-5 h-5" />,
    features: ['POST /api/v1/orders endpoint', 'Webhook event subscriptions', 'Idempotent shipment creation'],
    setupTime: '5 Minutes',
    syncFrequency: 'Synchronous REST (<350ms)',
    prerequisites: [
      'Production API Secret Key',
      'Publicly accessible Webhook Callback URL',
      'JSON Payload Handler'
    ],
    setupSteps: [
      { title: 'Obtain API Credentials', desc: 'Generate your production API key and Webhook Signing Secret from Settings > Developers.' },
      { title: 'POST /v1/shipments/create', desc: 'Submit order data including pickup/delivery pincodes, weight, and COD value to get an instant AWB.' },
      { title: 'Subscribe to Webhooks', desc: 'Listen for tracking status updates, NDR triggers, and COD remittances on your server endpoint.' }
    ],
    specs: 'RESTful JSON API with 500+ req/sec throughput, idempotent requests via X-Idempotency-Key, and HMAC-SHA256 signature security.'
  },
  {
    id: 'csv_import',
    title: 'Bulk CSV / Excel Order Import',
    category: 'Enterprise',
    categoryLabel: 'File Upload',
    desc: 'Upload daily CSV or Excel spreadsheets. Column mapping auto-detects recipient address, pincode & SKUs.',
    badge: 'No Code',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200/80',
    iconBg: 'bg-amber-500/10 border-amber-500/20',
    iconColor: 'text-amber-600',
    icon: <FileSpreadsheet className="w-5 h-5" />,
    features: ['Row-level error validation', 'Web Worker parallel parsing', 'Bulk label printing'],
    setupTime: 'Instant (No Code)',
    syncFrequency: 'On-Demand Batch Sync',
    prerequisites: [
      'CSV or XLSX order manifest file',
      'Header columns for address, pincode, phone & COD',
      'Valid SKU items'
    ],
    setupSteps: [
      { title: 'Download Base Template', desc: 'Grab our pre-formatted Excel/CSV template or use your own custom column headers.' },
      { title: 'Smart Column Auto-Mapper', desc: 'Drag-and-drop your spreadsheet; our browser parser automatically maps customer fields and flags pincode issues.' },
      { title: 'Batch Bulk Print Labels', desc: 'Generate up to 1,000 shipping labels in one click with consolidated manifest manifests.' }
    ],
    specs: 'Client-side Web Worker parsing supporting 10,000+ rows in seconds with real-time address and PIN code serviceability validation.'
  },
  {
    id: 'magento',
    title: 'Magento & Adobe Commerce',
    category: 'Enterprise',
    categoryLabel: 'Enterprise ERP',
    desc: 'Native Magento module supporting multi-source inventory routing and automated shipment tracking push.',
    badge: 'Enterprise',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200/80',
    iconBg: 'bg-rose-500/10 border-rose-500/20',
    iconColor: 'text-rose-600',
    icon: <Server className="w-5 h-5" />,
    features: ['Multi-source inventory', 'GraphQL & REST API support', 'High-volume batching'],
    setupTime: '10 Minutes',
    syncFrequency: 'Bi-Directional Event Stream',
    prerequisites: [
      'Magento 2.3+ or Adobe Commerce',
      'Admin integration bearer token',
      'Multi-source inventory enabled'
    ],
    setupSteps: [
      { title: 'Install Magento Extension', desc: 'Run composer require shipfaster/magento2-module or upload through Extension Manager.' },
      { title: 'Add Integration Token', desc: 'Enter your API Secret and enable auto-shipment generation upon invoice capture.' },
      { title: 'Warehouse Source Mapping', desc: 'Map your Magento stock sources to ShipFaster multi-city pickup fulfillment hubs.' }
    ],
    specs: 'Enterprise Adobe Commerce connector supporting multi-warehouse inventory allocation, split-shipments, and automated credit memos.'
  },
  {
    id: 'marketplaces',
    title: 'Amazon & Flipkart Connector',
    category: 'E-Commerce',
    categoryLabel: 'Marketplace Sync',
    desc: 'Consolidate marketplace orders into a single fulfillment workflow. Sync inventory levels & manifests.',
    badge: 'Marketplace',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    iconBg: 'bg-indigo-500/10 border-indigo-500/20',
    iconColor: 'text-indigo-600',
    icon: <Layers className="w-5 h-5" />,
    features: ['Marketplace SKU mapping', 'Unified tracking dashboard', 'Automated COD reconciliation'],
    setupTime: '3 Minutes',
    syncFrequency: 'Every 10 mins & Webhooks',
    prerequisites: [
      'Active Seller Central or Flipkart Seller account',
      'MWS / SP-API or Marketplace Developer authorization',
      'Valid GSTIN'
    ],
    setupSteps: [
      { title: 'Authorize Marketplace', desc: 'Select Amazon or Flipkart in your dashboard and complete seller partner OAuth authorization.' },
      { title: 'Unify Inventory & SKUs', desc: 'Map marketplace SKU listings to your master warehouse inventory catalogue.' },
      { title: 'Single-Panel Dispatch', desc: 'Process marketplace self-ship orders alongside your Shopify orders in one unified queue.' }
    ],
    specs: 'Amazon SP-API and Flipkart Marketplace API integration with unified SLA countdown and automated COD remittance reconciliation.'
  },
  {
    id: 'webhooks_sdk',
    title: 'Webhooks & Event Stream SDK',
    category: 'Developer',
    categoryLabel: 'Developer SDK',
    desc: 'Subscribe to real-time parcel transit events with signed HMAC-SHA256 payloads for Node.js, Python, and PHP.',
    badge: 'Real-Time Bus',
    badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200/80',
    iconBg: 'bg-cyan-500/10 border-cyan-500/20',
    iconColor: 'text-cyan-600',
    icon: <Radio className="w-5 h-5" />,
    features: ['HMAC signed payload security', 'Automatic retry with backoff', 'Custom webhook endpoints'],
    setupTime: '3 Minutes',
    syncFrequency: 'Instant (<100ms Event Bus)',
    prerequisites: [
      'HTTPS endpoint with TLS 1.2+',
      'HMAC-SHA256 signature verification handler',
      'Idempotent event listener'
    ],
    setupSteps: [
      { title: 'Configure Endpoint URL', desc: 'Register your webhook destination URL in Dashboard > Developers > Webhooks.' },
      { title: 'Select Event Subscriptions', desc: 'Choose events: shipment.created, awb.assigned, tracking.delivered, ndr.raised, rto.initiated.' },
      { title: 'Verify Signed Payload', desc: 'Validate the X-ShipFaster-Signature header using your webhook secret to ensure payload integrity.' }
    ],
    specs: 'Enterprise event bus powered by Kafka with guaranteed at-least-once delivery, exponential backoff retries over 72 hours, and dead-letter queues.'
  },
  {
    id: 'erp_wms',
    title: 'Zoho, SAP & Unicommerce ERP',
    category: 'Enterprise',
    categoryLabel: 'Warehouse & ERP',
    desc: 'Bi-directional sync with enterprise warehouse management systems, ERP billing ledgers, and inventory hubs.',
    badge: 'Enterprise ERP',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    iconBg: 'bg-emerald-500/10 border-emerald-500/20',
    iconColor: 'text-emerald-600',
    icon: <Database className="w-5 h-5" />,
    features: ['Unicommerce / Zoho integration', 'Multi-location manifest sync', 'Real-time stock deduction'],
    setupTime: '15 Minutes',
    syncFrequency: 'Continuous Real-Time Sync',
    prerequisites: [
      'Zoho Books, Unicommerce, or SAP account',
      'Enterprise API license or OAuth credentials',
      'Warehouse location mappings'
    ],
    setupSteps: [
      { title: 'Select ERP System', desc: 'Choose your WMS/ERP provider from our enterprise directory or connect via custom middleware.' },
      { title: 'Map Chart of Accounts & Hubs', desc: 'Synchronize financial ledgers, freight invoice postings, and physical warehouse pickup addresses.' },
      { title: 'Automated Manifest Sync', desc: 'Orders packed in your WMS automatically trigger courier dispatch and generate manifest handover sheets.' }
    ],
    specs: 'Bi-directional enterprise pipeline supporting Unicommerce, Zoho Inventory, SAP Business One, and custom ODBC warehouse connectors.'
  }
];

export const ConnectorsGridSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'All' | 'E-Commerce' | 'Developer' | 'Enterprise'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConnector, setSelectedConnector] = useState<ConnectorChannel | null>(null);

  // Request Integration Modal State
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestPlatform, setRequestPlatform] = useState('');
  const [requestUrl, setRequestUrl] = useState('');
  const [requestEmail, setRequestEmail] = useState('');
  const [requestVolume, setRequestVolume] = useState('1,000 – 5,000 orders/mo');
  const [isRequestSubmitted, setIsRequestSubmitted] = useState(false);

  const filteredConnectors = connectorsData.filter((item) => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="connectors" className="py-8 sm:py-14 px-3 xs:px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto w-full space-y-6 sm:space-y-8">
      {/* Standardized Header Block */}
      <div className="text-center space-y-3 sm:space-y-3.5 max-w-5xl mx-auto">
        <div className="inline-block">
          <div className="inline-flex items-center gap-1.5 xs:gap-2 px-3 py-1 xs:px-3.5 xs:py-1.5 rounded-full bg-blue-50 text-blue-700 text-[10px] xs:text-xs font-extrabold border border-blue-200/80 shadow-xs max-w-full">
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            <Zap className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="uppercase tracking-wider truncate">SUPPORTED CONNECTORS • 50+ PRE-BUILT INTEGRATIONS</span>
          </div>
        </div>

        <h2 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-display tracking-tight leading-[1.18] max-w-4xl mx-auto px-1 xs:px-2">
          Plug &amp; Play{' '}
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
            E-Commerce Connectors
          </span>
        </h2>

        <p className="text-xs xs:text-sm sm:text-base md:text-lg text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto px-1 xs:px-2">
          Connect your storefront, ERP, or custom software stack in minutes with zero coding required. Click any connector for setup instructions.
        </p>
      </div>

      {/* Filter and Search Controls Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 pb-4 border-b border-slate-200/80">
        <div className="text-[11px] xs:text-xs text-slate-500 font-bold uppercase tracking-wider font-mono">
          Showing {filteredConnectors.length} Channels
        </div>

        {/* Search Input & Category Pills */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 xs:gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs overflow-x-auto max-w-full">
            {(['All', 'E-Commerce', 'Developer', 'Enterprise'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-2.5 xs:px-3 py-1 xs:py-1.5 rounded-lg text-[11px] xs:text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {cat === 'All' ? 'All' : cat}
              </button>
            ))}
          </div>

          {/* Search Field */}
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* Empty Search State with Request Integration CTA */}
      {filteredConnectors.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-6 sm:p-12 text-center max-w-lg mx-auto shadow-2xs space-y-4"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto text-blue-600">
            <SearchX className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base sm:text-lg font-black text-slate-900 font-display">
              No Connectors Found for &quot;{searchQuery}&quot;
            </h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              We haven&apos;t published a 1-click connector for &quot;{searchQuery}&quot; yet, but our engineering team builds custom integrations in 48-72 hours!
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setRequestPlatform(searchQuery);
                setIsRequestSubmitted(false);
                setIsRequestModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-3.5 xs:px-4 py-2 xs:py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Request &quot;{searchQuery}&quot; Connector</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('All');
              }}
              className="inline-flex items-center gap-2 px-3.5 xs:px-4 py-2 xs:py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Search</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Grid of Cards */}
      {filteredConnectors.length > 0 && (
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredConnectors.map((channel, idx) => (
              <motion.div
                layout
                key={channel.id}
                initial={{ opacity: 0, scale: 0.96, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -15 }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
                whileHover={{ y: -4, scale: 1.01 }}
                onClick={() => setSelectedConnector(channel)}
                className="group bg-white p-4 xs:p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-lg hover:border-blue-300 transition-all duration-300 flex flex-col justify-between relative overflow-hidden cursor-pointer"
              >
                {/* Top Accent Line on Hover */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="space-y-3.5 xs:space-y-4">
                  {/* Header: Brand Icon & Badge */}
                  <div className="flex items-center justify-between">
                    <div className={`w-9 h-9 xs:w-10 xs:h-10 rounded-xl ${channel.iconBg} border ${channel.iconColor} flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}>
                      {channel.icon}
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border font-display ${channel.badgeColor}`}>
                      {channel.badge}
                    </span>
                  </div>

                  {/* Title & Category */}
                  <div>
                    <h3 className="text-sm xs:text-base font-black text-slate-900 font-display group-hover:text-blue-600 transition-colors leading-tight">
                      {channel.title}
                    </h3>
                    <span className="text-[10px] xs:text-[11px] font-bold text-slate-400 block mt-0.5">
                      {channel.categoryLabel}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed font-medium line-clamp-2">
                    {channel.desc}
                  </p>

                  {/* Feature Bullet Points */}
                  <div className="pt-3 border-t border-slate-100 space-y-1.5">
                    {channel.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2 text-[11px] font-bold text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-3.5 sm:pt-4 border-t border-slate-100 flex flex-col xs:flex-row items-stretch xs:items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedConnector(channel);
                    }}
                    className="w-full xs:flex-1 py-2 px-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200/80 hover:border-blue-200 text-slate-700 hover:text-blue-700 font-extrabold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Setup Guide</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </button>
                  <Link 
                    to="/register"
                    onClick={(e) => e.stopPropagation()}
                    className="w-full xs:w-auto py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Connect</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            ))}

            {/* Custom Request Connector Card */}
            <motion.div
              layout
              whileHover={{ y: -4, scale: 1.01 }}
              onClick={() => {
                setRequestPlatform('');
                setIsRequestSubmitted(false);
                setIsRequestModalOpen(true);
              }}
              className="group bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-white p-4 xs:p-5 sm:p-6 rounded-2xl border-2 border-dashed border-blue-300 shadow-2xs hover:shadow-lg hover:border-blue-500 transition-all duration-300 flex flex-col justify-between relative overflow-hidden cursor-pointer"
            >
              <div className="space-y-3.5 xs:space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 xs:w-10 xs:h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
                    Custom Channel
                  </span>
                </div>

                <div>
                  <h3 className="text-sm xs:text-base font-black text-slate-900 font-display group-hover:text-blue-600 transition-colors leading-tight">
                    Don&apos;t See Your Platform?
                  </h3>
                  <span className="text-[10px] xs:text-[11px] font-bold text-slate-500 block mt-0.5">
                    Wix, Dukaan, Salesforce, PrestaShop, Custom ERP
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Our integration architects build tailored bi-directional connectors and webhook listeners in 48 to 72 hours for scaling merchants.
                </p>

                <div className="pt-3 border-t border-blue-100 space-y-1.5">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Free custom connector development</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Dedicated onboarding engineer</span>
                  </div>
                </div>
              </div>

              <div className="pt-3.5 sm:pt-4 border-t border-blue-100">
                <button
                  type="button"
                  className="w-full py-2.5 px-3.5 rounded-xl bg-blue-600 group-hover:bg-blue-700 text-white font-extrabold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Request Custom Connector</span>
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}

      {/* Interactive Connector Setup Guide Modal */}
      <AnimatePresence>
        {selectedConnector && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-2.5 xs:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
            onClick={() => setSelectedConnector(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl sm:rounded-3xl p-4 xs:p-6 sm:p-8 max-w-2xl w-full border border-slate-200 shadow-2xl space-y-4 sm:space-y-6 relative my-4 sm:my-8 max-h-[92vh] overflow-y-auto text-left"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedConnector(null)}
                className="absolute top-3.5 right-3.5 xs:top-5 xs:right-5 p-1.5 xs:p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors z-10 cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-2.5 xs:gap-3.5 pr-8 xs:pr-9">
                <div className={`w-10 h-10 xs:w-12 xs:h-12 rounded-xl xs:rounded-2xl ${selectedConnector.iconBg} border ${selectedConnector.iconColor} flex items-center justify-center shrink-0`}>
                  {selectedConnector.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border font-display ${selectedConnector.badgeColor}`}>
                      {selectedConnector.badge}
                    </span>
                    <span className="text-[11px] xs:text-xs font-mono text-slate-400">
                      {selectedConnector.categoryLabel}
                    </span>
                  </div>
                  <h3 className="text-base xs:text-lg sm:text-xl font-black text-slate-900 font-display mt-0.5">
                    {selectedConnector.title}
                  </h3>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                {selectedConnector.desc}
              </p>

              {/* Key Specs Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 xs:gap-3 p-3 xs:p-3.5 rounded-xl xs:rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
                <div className="space-y-1">
                  <span className="text-[9px] xs:text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-blue-500" /> Setup Time
                  </span>
                  <p className="font-extrabold text-slate-900 text-xs xs:text-sm">{selectedConnector.setupTime}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] xs:text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 text-emerald-500" /> Sync Speed
                  </span>
                  <p className="font-extrabold text-slate-900 truncate text-xs xs:text-sm">{selectedConnector.syncFrequency}</p>
                </div>
                <div className="col-span-2 sm:col-span-1 space-y-1">
                  <span className="text-[9px] xs:text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-indigo-500" /> Security
                  </span>
                  <p className="font-extrabold text-slate-900 text-xs xs:text-sm">OAuth / Signed HMAC</p>
                </div>
              </div>

              {/* Setup Prerequisites */}
              <div className="space-y-2 xs:space-y-2.5">
                <h4 className="text-[11px] xs:text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                  Prerequisites Checklist
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedConnector.prerequisites.map((req, rIdx) => (
                    <div key={rIdx} className="flex items-center gap-2 p-2 xs:p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100 text-[11px] xs:text-xs font-bold text-slate-800">
                      <CheckCircle2 className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-emerald-600 shrink-0" />
                      <span>{req}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3-Step Setup Walkthrough */}
              <div className="space-y-2.5 xs:space-y-3">
                <h4 className="text-[11px] xs:text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                  3-Step Quick Setup Guide
                </h4>
                <div className="space-y-2 xs:space-y-2.5">
                  {selectedConnector.setupSteps.map((step, sIdx) => (
                    <div key={sIdx} className="flex gap-2.5 xs:gap-3 p-2.5 xs:p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="w-5 h-5 xs:w-6 xs:h-6 rounded-full bg-blue-600 text-white font-extrabold text-[10px] xs:text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {sIdx + 1}
                      </div>
                      <div className="space-y-0.5 text-xs">
                        <p className="font-extrabold text-slate-900 text-[11px] xs:text-xs">{step.title}</p>
                        <p className="text-slate-600 font-medium leading-relaxed text-[10px] xs:text-[11px]">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono">
                <span className="text-[9px] xs:text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Architecture Note</span>
                <p className="text-[10px] xs:text-[11px] leading-relaxed text-slate-300 font-normal">
                  {selectedConnector.specs}
                </p>
              </div>

              {/* Modal Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 xs:gap-3">
                <Link to="/register" className="w-full sm:flex-1">
                  <button className="w-full py-2.5 xs:py-3 px-4 xs:px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs xs:text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer">
                    <span>Connect In Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <button
                  type="button"
                  onClick={() => setSelectedConnector(null)}
                  className="w-full sm:w-auto py-2.5 xs:py-3 px-4 xs:px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs xs:text-sm transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Request Custom Integration Modal */}
      <AnimatePresence>
        {isRequestModalOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-2.5 xs:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
            onClick={() => setIsRequestModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl sm:rounded-3xl p-4 xs:p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4 sm:space-y-5 relative my-4 sm:my-8 text-left"
            >
              <button
                type="button"
                onClick={() => setIsRequestModalOpen(false)}
                className="absolute top-3.5 right-3.5 xs:top-5 xs:right-5 p-1.5 xs:p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors z-10 cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2.5 xs:gap-3 pr-8 xs:pr-9">
                <div className="w-9 h-9 xs:w-10 xs:h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base xs:text-lg font-black text-slate-900 font-display">
                    Request a Custom Connector
                  </h3>
                  <p className="text-[11px] xs:text-xs text-slate-500 font-medium">
                    Tell us what software stack or storefront you need connected.
                  </p>
                </div>
              </div>

              {isRequestSubmitted ? (
                <div className="p-4 xs:p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                  <div className="w-10 h-10 xs:w-12 xs:h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto font-black text-base xs:text-lg">
                    ✓
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm xs:text-base font-extrabold text-slate-900 font-display">
                      Request Received!
                    </h4>
                    <p className="text-xs text-slate-600 font-medium">
                      Our integrations engineering team will reach out at <strong className="text-slate-900">{requestEmail}</strong> within 24 hours to schedule connector setup.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsRequestModalOpen(false)}
                    className="mt-2 px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-all cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!requestEmail) return;
                    setIsRequestSubmitted(true);
                  }}
                  className="space-y-3 xs:space-y-3.5"
                >
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Platform or System Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Wix, Dukaan, Salesforce, SAP, Odoo"
                      value={requestPlatform}
                      onChange={(e) => setRequestPlatform(e.target.value)}
                      className="w-full px-3 xs:px-3.5 py-2 xs:py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 shadow-2xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Store / Website URL</label>
                    <input
                      type="url"
                      placeholder="https://yourstore.com"
                      value={requestUrl}
                      onChange={(e) => setRequestUrl(e.target.value)}
                      className="w-full px-3 xs:px-3.5 py-2 xs:py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 shadow-2xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Monthly Order Volume</label>
                    <select
                      value={requestVolume}
                      onChange={(e) => setRequestVolume(e.target.value)}
                      className="w-full px-3 xs:px-3.5 py-2 xs:py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 shadow-2xs"
                    >
                      <option>100 – 1,000 orders/mo</option>
                      <option>1,000 – 5,000 orders/mo</option>
                      <option>5,000 – 20,000 orders/mo</option>
                      <option>20,000+ orders/mo (Enterprise)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Business Email</label>
                    <input
                      type="email"
                      required
                      placeholder="founder@yourbrand.com"
                      value={requestEmail}
                      onChange={(e) => setRequestEmail(e.target.value)}
                      className="w-full px-3 xs:px-3.5 py-2 xs:py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 shadow-2xs"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 xs:py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Integration Request</span>
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
