import React, { useState } from 'react';
import { PublicNavbar, PublicFooter } from './PublicNav';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, ShoppingBag, Store, Code2, Upload, CheckCircle2, 
  ArrowRight, Sparkles, RefreshCw, Zap, ShieldCheck, FileSpreadsheet,
  Terminal, Lock, Key, Copy, Check, ChevronDown, Layers, Server, Box,
  Cpu, Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { IntegrationsNetworkVisualizer } from './components/IntegrationsNetworkVisualizer';

export const PublicIntegrationsPage: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState<'curl' | 'node' | 'python'>('curl');
  const [activeWebhookTab, setActiveWebhookTab] = useState<'order_created' | 'dispatched' | 'tracking_updated' | 'ndr_raised' | 'cod_settled'>('order_created');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const integrationChannels = [
    {
      title: 'Shopify Store Connector',
      category: 'E-Commerce Platform',
      desc: 'Connect your Shopify store in 1-click. Auto-sync new orders every 5 minutes, push AWB tracking numbers to buyers, and update fulfillment statuses automatically.',
      badge: '1-Click Connect',
      icon: <ShoppingBag className="w-6 h-6 text-emerald-600" />,
      features: ['Automatic order import', 'Real-time tracking status push', 'Inventory fulfillment sync']
    },
    {
      title: 'WooCommerce Connector',
      category: 'WordPress Plugin',
      desc: 'Pair your WooCommerce store using REST API keys. Automatically fetch orders, auto-generate shipping labels, and send SMS tracking links to customers.',
      badge: 'REST Sync',
      icon: <Store className="w-6 h-6 text-purple-600" />,
      features: ['Consumer key/secret pairing', 'Order status webhook trigger', 'Automated AWB assignment']
    },
    {
      title: 'Custom Website REST API',
      category: 'Developer API',
      desc: 'For custom-built websites, ERPs, or WMS systems. Use our high-concurrency JSON REST API to create orders, fetch live courier rates, and subscribe to webhooks.',
      badge: 'Developer API',
      icon: <Code2 className="w-6 h-6 text-blue-600" />,
      features: ['POST /api/v1/orders endpoint', 'Webhook event subscriptions', 'Idempotent shipment creation']
    },
    {
      title: 'Bulk CSV / Excel Order Import',
      category: 'File Upload',
      desc: 'No store integration? Simply upload your daily order CSV or Excel spreadsheets. Intelligent column mapping detects recipient address, pincode, and product SKUs.',
      badge: 'No Code',
      icon: <FileSpreadsheet className="w-6 h-6 text-amber-600" />,
      features: ['Row-level error validation', 'Web Worker parallel parsing', 'Bulk label printing']
    },
    {
      title: 'Magento & Adobe Commerce',
      category: 'Enterprise ERP',
      desc: 'Native Magento 2 module supporting multi-source inventory routing, store credit sync, and automated shipment tracking push.',
      badge: 'Enterprise',
      icon: <Server className="w-6 h-6 text-rose-600" />,
      features: ['Multi-source inventory', 'GraphQL & REST API support', 'High-volume batching']
    },
    {
      title: 'Amazon & Flipkart Connector',
      category: 'Marketplace Sync',
      desc: 'Consolidate marketplace orders into a single fulfillment workflow. Sync inventory levels and generate shipping manifests directly.',
      badge: 'Marketplace',
      icon: <Layers className="w-6 h-6 text-indigo-600" />,
      features: ['Marketplace SKU mapping', 'Unified tracking dashboard', 'Automated COD reconciliation']
    }
  ];

  const webhooks = [
    { event: 'order.created', desc: 'Triggered when a new order is synced from Shopify or WooCommerce.' },
    { event: 'shipment.dispatched', desc: 'Triggered when the courier picks up the parcel and assigns AWB.' },
    { event: 'tracking.updated', desc: 'Triggered when courier status changes (In Transit, Out for Delivery).' },
    { event: 'ndr.raised', desc: 'Triggered when delivery attempt fails and requires buyer confirmation.' },
    { event: 'cod.settled', desc: 'Triggered when Cash-on-Delivery funds are transferred to your bank account.' },
  ];

  const codeSnippets = {
    curl: `curl -X POST https://api.shipsmarter.com/v1/shipments \\
  -H "Authorization: Bearer ss_live_987654321" \\
  -H "Content-Type: application/json" \\
  -d '{
    "order_number": "ORD-9920",
    "pickup_pincode": "110020",
    "delivery_pincode": "400001",
    "weight_kg": 0.5,
    "payment_mode": "COD",
    "amount": 1500
  }'`,
    node: `const axios = require('axios');

const response = await axios.post('https://api.shipsmarter.com/v1/shipments', {
  order_number: 'ORD-9920',
  pickup_pincode: '110020',
  delivery_pincode: '400001',
  weight_kg: 0.5,
  payment_mode: 'COD',
  amount: 1500
}, {
  headers: { Authorization: 'Bearer ss_live_987654321' }
});

console.log(response.data.awb_number);`,
    python: `import requests

url = "https://api.shipsmarter.com/v1/shipments"
headers = {"Authorization": "Bearer ss_live_987654321"}
payload = {
    "order_number": "ORD-9920",
    "pickup_pincode": "110020",
    "delivery_pincode": "400001",
    "weight_kg": 0.5,
    "payment_mode": "COD",
    "amount": 1500
}

response = requests.post(url, json=payload, headers=headers)
print(response.json()["awb_number"])`
  };

  const webhookPayloads = {
    order_created: `{
  "event": "order.created",
  "timestamp": "2026-08-29T10:40:00Z",
  "data": {
    "order_id": "ORD-9920",
    "source": "SHOPIFY",
    "customer": { "name": "Rahul Sharma", "phone": "+91 9876543210" },
    "pincode": "400001",
    "amount": 1500
  }
}`,
    dispatched: `{
  "event": "shipment.dispatched",
  "timestamp": "2026-08-29T11:15:00Z",
  "data": {
    "order_id": "ORD-9920",
    "awb_number": "DEL992817261",
    "courier_name": "Delhivery Direct",
    "status": "DISPATCHED"
  }
}`,
    tracking_updated: `{
  "event": "tracking.updated",
  "timestamp": "2026-08-29T14:30:00Z",
  "data": {
    "awb_number": "DEL992817261",
    "current_location": "Hub Mumbai_Bandra_GW",
    "status": "OUT_FOR_DELIVERY"
  }
}`,
    ndr_raised: `{
  "event": "ndr.raised",
  "timestamp": "2026-08-29T16:45:00Z",
  "data": {
    "awb_number": "DEL992817261",
    "reason": "Address incomplete / Incorrect Landmark",
    "bot_whatsapp_sent": true
  }
}`,
    cod_settled: `{
  "event": "cod.settled",
  "timestamp": "2026-08-31T09:00:00Z",
  "data": {
    "utr_number": "UTR99281726100",
    "net_amount": 1450.00,
    "payout_status": "CREDITED"
  }
}`
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippets[activeCodeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const integrationFaqs = [
    {
      q: 'How long does it take to connect a Shopify store?',
      a: 'Connecting Shopify takes under 60 seconds. Log in to your ShipSmarter dashboard, click "Connect Shopify", authorize the app, and your orders will start syncing automatically.'
    },
    {
      q: 'Are developer REST APIs included in all plans?',
      a: 'Developer API keys and Webhook subscriptions are available on Growth and Enterprise plans.'
    },
    {
      q: 'Can I upload CSV files if I operate on multiple custom marketplaces?',
      a: 'Yes! Our CSV reader maps seller custom columns for customer address, PIN code, item names, and COD amounts automatically.',
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
            <Globe className="w-4 h-4 text-blue-400 animate-spin" style={{ animationDuration: '8s' }} />
            <span>Store Connectors & Developer REST API Engine</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-black font-display tracking-tight leading-tight max-w-5xl mx-auto text-white"
          >
            Connect Your Store. Automate Shipping.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed font-medium"
          >
            Import orders automatically, generate AWB labels, push live tracking links, and manage fulfillment from your existing commerce stack.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4 pt-3"
          >
            <Link to="/register">
              <Button size="lg" className="shadow-xl shadow-blue-500/25 bg-blue-600 hover:bg-blue-500 font-extrabold" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Start Integration Free →
              </Button>
            </Link>
            <a href="#sandbox">
              <button className="inline-flex items-center justify-center font-extrabold rounded-xl transition-all duration-200 text-sm px-6 py-3 gap-2.5 bg-slate-900/90 border border-slate-700/90 text-slate-100 hover:bg-slate-800 hover:border-blue-500/50 shadow-md cursor-pointer">
                <Terminal className="w-5 h-5 text-blue-400 shrink-0" />
                <span>Explore API Sandbox</span>
              </button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* 2.5D Interactive Three.js Animated Network Visualizer Section */}
      <IntegrationsNetworkVisualizer />

      {/* Main Grid: 6 Supported Integration Cards */}
      <section className="py-10 sm:py-12 px-6 sm:px-8 max-w-7xl mx-auto w-full space-y-8 sm:space-y-10">
        <div className="text-center space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 font-display">SUPPORTED CONNECTORS</span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 font-display tracking-tight">Plug & Play E-Commerce Connectors</h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto font-medium">Connect your storefront, ERP, or custom software stack in minutes.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {integrationChannels.map((channel, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: (idx % 3) * 0.1 }}
              whileHover={{ y: -8, scale: 1.01 }}
              className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 space-y-6 flex flex-col justify-between group cursor-pointer"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center shadow-xs group-hover:scale-110 group-hover:bg-blue-50 group-hover:border-blue-200 transition-all duration-300">
                    {channel.icon}
                  </div>
                  <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-800 font-extrabold text-[10px] uppercase tracking-wider border border-blue-200 font-display">
                    {channel.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-black text-slate-900 font-display group-hover:text-blue-600 transition-colors">{channel.title}</h3>
                  <span className="text-xs font-bold text-slate-500">{channel.category}</span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-medium min-h-[48px]">
                  {channel.desc}
                </p>

                <div className="pt-4 border-t border-slate-100 space-y-2.5">
                  {channel.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2 text-xs font-bold text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link to="/register">
                <Button className="w-full justify-between font-bold text-xs" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Connect Channel
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Developer Sandbox API Code Snippets (#sandbox) */}
        <div id="sandbox" className="bg-slate-950 text-white p-8 sm:p-12 rounded-3xl border border-slate-800 shadow-2xl space-y-8 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/90 pb-6">
            <div className="space-y-1">
              <span className="text-xs font-extrabold uppercase tracking-widest text-blue-400 font-display flex items-center gap-2">
                <Terminal className="w-4 h-4 text-blue-400" /> REST API SANDBOX & CODE GENERATOR
              </span>
              <h3 className="text-2xl sm:text-3xl font-black font-display text-white">Create Shipment via REST API</h3>
            </div>

            <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveCodeTab('curl')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeCodeTab === 'curl' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                cURL
              </button>
              <button
                onClick={() => setActiveCodeTab('node')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeCodeTab === 'node' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Node.js
              </button>
              <button
                onClick={() => setActiveCodeTab('python')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeCodeTab === 'python' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Python
              </button>
            </div>
          </div>

          <div className="relative bg-slate-900/90 p-6 rounded-2xl border border-slate-800 font-mono text-xs text-blue-200 overflow-x-auto shadow-inner">
            <button
              onClick={handleCopy}
              className="absolute top-4 right-4 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer border border-slate-700"
              aria-label="Copy Code"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <pre className="pr-12 leading-relaxed">{codeSnippets[activeCodeTab]}</pre>
          </div>
        </div>

        {/* Live Webhook Payload Simulator & Event Topics */}
        <div className="bg-slate-900 text-white p-8 sm:p-12 rounded-3xl border border-slate-800 shadow-2xl space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 font-display">LIVE WEBHOOK SIMULATOR</span>
            <h3 className="text-2xl sm:text-3xl font-black font-display text-white">Subscribe to Real-Time Webhook Topics</h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">Click any topic below to view the live JSON event payload emitted to your endpoint.</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {[
              { id: 'order_created', label: 'order.created' },
              { id: 'dispatched', label: 'shipment.dispatched' },
              { id: 'tracking_updated', label: 'tracking.updated' },
              { id: 'ndr_raised', label: 'ndr.raised' },
              { id: 'cod_settled', label: 'cod.settled' }
            ].map((topic) => (
              <button
                key={topic.id}
                onClick={() => setActiveWebhookTab(topic.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeWebhookTab === topic.id ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {topic.label}
              </button>
            ))}
          </div>

          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto shadow-inner">
            <AnimatePresence mode="wait">
              <motion.pre
                key={activeWebhookTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="leading-relaxed"
              >
                {webhookPayloads[activeWebhookTab]}
              </motion.pre>
            </AnimatePresence>
          </div>
        </div>

        {/* Integration FAQs */}
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200/90 shadow-md space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 font-display">INTEGRATION FAQS</span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">Integration & API FAQs</h3>
          </div>

          <div className="space-y-3 max-w-3xl mx-auto">
            {integrationFaqs.map((faq, idx) => (
              <div key={idx} className="bg-slate-50 rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
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
            <h3 className="text-2xl sm:text-4xl font-black font-display tracking-tight text-white">Ready to Connect Your Store?</h3>
            <p className="text-xs sm:text-sm text-blue-100 font-medium max-w-xl">Pair your storefront or generate production API keys in under 60 seconds.</p>
          </div>
          <Link to="/register" className="shrink-0 w-full sm:w-auto relative z-10">
            <button className="w-full sm:w-auto bg-white hover:bg-blue-50 text-blue-700 font-black text-sm px-8 py-3.5 rounded-xl shadow-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2">
              <span>Start Integration Free</span>
              <ArrowRight className="w-5 h-5 text-blue-700" />
            </button>
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};
