import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, Store, Code2, FileSpreadsheet, Server, Layers, 
  CheckCircle2, ArrowRight, Zap, Search, Radio, Database
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
    features: ['Automatic order import', 'Real-time tracking push', 'Inventory fulfillment sync']
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
    features: ['Consumer key/secret pairing', 'Order status webhook trigger', 'Automated AWB assignment']
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
    features: ['POST /api/v1/orders endpoint', 'Webhook event subscriptions', 'Idempotent shipment creation']
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
    features: ['Row-level error validation', 'Web Worker parallel parsing', 'Bulk label printing']
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
    features: ['Multi-source inventory', 'GraphQL & REST API support', 'High-volume batching']
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
    features: ['Marketplace SKU mapping', 'Unified tracking dashboard', 'Automated COD reconciliation']
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
    features: ['HMAC signed payload security', 'Automatic retry with backoff', 'Custom webhook endpoints']
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
    features: ['Unicommerce / Zoho integration', 'Multi-location manifest sync', 'Real-time stock deduction']
  }
];

export const ConnectorsGridSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'All' | 'E-Commerce' | 'Developer' | 'Enterprise'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConnectors = connectorsData.filter((item) => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="connectors" className="py-10 sm:py-14 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto w-full space-y-6 sm:space-y-8">
      {/* Standardized Header Block */}
      <div className="text-center space-y-3.5 max-w-5xl mx-auto">
        <div className="inline-block">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-extrabold border border-blue-200/80 shadow-xs">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            <Zap className="w-3.5 h-3.5 text-blue-600" />
            <span className="uppercase tracking-wider">SUPPORTED CONNECTORS • 50+ PRE-BUILT INTEGRATIONS</span>
          </div>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-display tracking-tight leading-[1.18] max-w-4xl mx-auto">
          Plug &amp; Play{' '}
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
            E-Commerce Connectors
          </span>
        </h2>

        <p className="text-sm sm:text-base md:text-lg text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto">
          Connect your storefront, ERP, or custom software stack in minutes with zero coding required.
        </p>
      </div>

      {/* Filter and Search Controls Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="text-xs text-slate-500 font-bold uppercase tracking-wider font-mono">
          Showing {filteredConnectors.length} Channels
        </div>

        {/* Search Input & Category Pills */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs overflow-x-auto">
            {(['All', 'E-Commerce', 'Developer', 'Enterprise'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
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
              placeholder="Filter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* Compact Grid of Cards */}
      <motion.div 
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
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
              className="group bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-lg hover:border-blue-300 transition-all duration-300 flex flex-col justify-between relative overflow-hidden cursor-pointer"
            >
              {/* Top Accent Line on Hover */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="space-y-4">
                {/* Header: Brand Icon & Badge */}
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl ${channel.iconBg} border ${channel.iconColor} flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}>
                    {channel.icon}
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border font-display ${channel.badgeColor}`}>
                    {channel.badge}
                  </span>
                </div>

                {/* Title & Category */}
                <div>
                  <h3 className="text-base font-black text-slate-900 font-display group-hover:text-blue-600 transition-colors leading-tight">
                    {channel.title}
                  </h3>
                  <span className="text-[11px] font-bold text-slate-400 block mt-0.5">
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

              {/* Action Button */}
              <div className="pt-4">
                <Link to="/register">
                  <button className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-xs group-hover:shadow-md group-hover:shadow-blue-500/20 transition-all duration-300 flex items-center justify-between cursor-pointer">
                    <span>Connect Channel</span>
                    <ArrowRight className="w-3.5 h-3.5 text-white group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                </Link>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
};
