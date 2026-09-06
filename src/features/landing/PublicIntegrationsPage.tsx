import React, { useState } from 'react';
import { PublicNavbar, PublicFooter } from './PublicNav';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, ChevronDown, Layers, HelpCircle, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { ConnectorsGridSection } from './components/ConnectorsGridSection';
import { GlobalThreeBackground } from '../../components/ui/GlobalThreeBackground';

export const PublicIntegrationsPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const integrationFaqs = [
    {
      q: 'How long does it take to connect a Shopify store?',
      a: 'Connecting Shopify takes under 60 seconds. Log in to your ShipFaster Logistic dashboard, click "Connect Shopify", authorize the app, and your orders will start syncing automatically.'
    },
    {
      q: 'Are developer REST APIs included in all plans?',
      a: 'Developer API keys and Webhook subscriptions are available on Growth and Enterprise plans with comprehensive documentation and sample code.'
    },
    {
      q: 'Can I upload CSV files if I operate on multiple custom marketplaces?',
      a: 'Yes! Our CSV reader maps seller custom columns for customer address, PIN code, item names, and COD amounts automatically with row-level validation.'
    },
    {
      q: 'How do real-time webhooks work when an order is packed or dispatched?',
      a: 'Our Webhook Event Bus emits signed JSON payloads for events like order.created, awb.assigned, tracking.updated, and ndr.raised directly to your server URL with automatic retry and exponential backoff.'
    },
    {
      q: 'Can I integrate enterprise ERPs or warehouse systems like Zoho, Unicommerce, or SAP?',
      a: 'Yes! Our Enterprise integration tier supports bi-directional sync with ERP ledgers, WMS warehouse manifests, and multi-channel inventory management hubs.'
    },
    {
      q: 'What are the API rate limits and concurrency support for high-volume sales?',
      a: 'Our production REST API supports up to 500+ requests per second with idempotent endpoints, automated load balancing, and dedicated bandwidth during festive flash sales.'
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col relative selection:bg-blue-500 selection:text-white">
      <PublicNavbar />

      {/* Hero Section (White Theme, Consistent with Landing Page) */}
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
            <Globe className="w-3.5 h-3.5 text-blue-600 animate-spin" style={{ animationDuration: '10s' }} />
            <span className="uppercase tracking-wider">Store Connectors • Developer REST API Engine</span>
          </motion.div>

          {/* Redesigned Premium Display Heading */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-2xl xs:text-3xl sm:text-5xl md:text-6xl font-black font-display tracking-tight leading-[1.22] sm:leading-[1.24] max-w-6xl mx-auto text-slate-950"
          >
            <span className="block pb-1 sm:pb-1.5 text-slate-950">Connect Any Storefront.</span>
            <span className="inline-block mt-1 sm:mt-2 px-2 pb-2 sm:pb-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent sm:whitespace-nowrap">
              Automate Multi-Carrier Shipping in 60s.
            </span>
          </motion.h1>

          {/* Subtitle Paragraph */}
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium"
          >
            1-click integrations for Shopify, WooCommerce, Amazon &amp; custom REST APIs. Auto-sync orders, generate carrier AWBs, and push live tracking links without writing code.
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
                Start Integration Free
              </Button>
            </Link>
            <a href="#connectors">
              <button className="inline-flex items-center justify-center font-extrabold rounded-xl transition-all duration-200 text-sm px-6 py-3 gap-2.5 bg-white border border-slate-200/90 text-slate-800 hover:bg-slate-50 hover:border-blue-300 shadow-xs cursor-pointer">
                <Layers className="w-5 h-5 text-blue-600 shrink-0" />
                <span>Explore Connectors</span>
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
              <span className="text-slate-900 font-bold">50+ Pre-built Connectors</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-2xs">
              <span className="text-blue-600 font-bold">&lt;60s</span>
              <span>1-Click Pairing</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-2xs">
              <span className="text-emerald-600 font-bold">99.99%</span>
              <span>Webhook Uptime SLA</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-2xs">
              <span className="text-indigo-600 font-bold">Zero</span>
              <span>Code Setup Needed</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Grid: Supported Integration Cards */}
      <ConnectorsGridSection />

      {/* Integration FAQs & CTA Section */}
      <section className="py-12 sm:py-16 px-6 sm:px-8 max-w-7xl mx-auto w-full space-y-12">
        {/* Integration FAQs — Hairline Accordion (No Boxed Cards) */}
        <div className="py-8 border-t border-slate-200/80 space-y-8">
          <div className="text-center space-y-3.5 max-w-5xl mx-auto">
            <div className="inline-block">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-extrabold border border-blue-200/80 shadow-xs">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                <span className="uppercase tracking-wider">INTEGRATION FAQS • DEVELOPER HELP</span>
              </div>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-display tracking-tight leading-[1.18] max-w-4xl mx-auto">
              Integration &amp; API{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
                Frequently Asked Questions
              </span>
            </h2>

            <p className="text-sm sm:text-base md:text-lg text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto">
              Everything you need to know about connecting storefronts, webhook lifecycles, and REST API authentication.
            </p>
          </div>

          <div className="divide-y divide-slate-200/80 max-w-3xl mx-auto">
            {integrationFaqs.map((faq, idx) => (
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
