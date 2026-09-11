import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, Cpu, Sparkles, Truck, ShieldCheck, Store, 
  ArrowRight, CheckCircle2, TrendingUp, DollarSign, PackageCheck, 
  HelpCircle, ChevronDown, Layers, MapPin, Zap, Building2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export const SolutionsPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const solutions = [
    {
      title: 'D2C Apparel & Fashion Brands',
      subtitle: 'Exchange management, address verification, and reverse pickups',
      desc: 'Apparel stores face high exchange requests and address non-deliveries. ShipFaster Logistic automates size exchange reverse pickups, verifies buyer delivery addresses via WhatsApp before dispatch, and handles door-step trial exchanges.',
      stats: 'Lower RTO Rate',
      icon: <ShoppingBag className="w-6 h-6 text-blue-600" />,
      features: ['Automated reverse pickup booking', 'WhatsApp address confirmation', 'Exchanges & return management']
    },
    {
      title: 'High-Value Consumer Electronics',
      subtitle: 'OTP doorstep verification, transit protection, and handover manifests',
      desc: 'Protect high-value gadgets against theft or damaged claims. Require buyer OTP confirmation at doorstep delivery, track package tamper-proof barcodes, and secure shipments with declared value insurance.',
      stats: 'Secure Handover SLA',
      icon: <Cpu className="w-6 h-6 text-purple-600" />,
      features: ['Mandatory buyer OTP at delivery', 'Declared value shipment protection', 'Full barcode handover manifest']
    },
    {
      title: 'Beauty, Personal Care & Cosmetics',
      subtitle: 'Express air routing, temperature-compliant transit, and batch dispatch',
      desc: 'Deliver fragile skincare and cosmetics in prime condition. Prioritize express air couriers with 24-48 hour SLAs, manage multi-warehouse fulfillment, and automate daily COD settlements.',
      stats: '24-48 Hr Air SLA',
      icon: <Sparkles className="w-6 h-6 text-amber-600" />,
      features: ['Temperature-compliant surface routes', 'Express air courier prioritization', 'Automated COD remittance']
    },
    {
      title: 'Enterprise & B2B Wholesale Freight',
      subtitle: 'Volumetric heavy cargo shipping, custom rate cards, and multi-warehouse',
      desc: 'Ship bulk cargo from manufacturing hubs to distributors across 28,000+ pincodes. Benefit from custom volume rate matrices, dedicated key account managers, and enterprise REST API webhooks.',
      stats: 'Custom Freight Cards',
      icon: <Truck className="w-6 h-6 text-emerald-600" />,
      features: ['Dedicated Key Account Manager', 'Custom weight slab rate matrices', 'Multi-warehouse pickup allocation']
    },
    {
      title: 'Healthcare & Pharmaceuticals',
      subtitle: 'Priority express dispatch, secure chain-of-custody, and verification',
      desc: 'Ensure medical supplies and pharma products meet strict delivery timelines. ShipFaster Logistic provides priority express routing, real-time temperature tracking alerts, and doorstep signature verification.',
      stats: 'Priority Express Routing',
      icon: <ShieldCheck className="w-6 h-6 text-rose-600" />,
      features: ['Priority express air dispatch', 'Real-time status alerts', 'Address & phone verification']
    },
    {
      title: 'Home & Lifestyle Goods',
      subtitle: 'Volumetric weight optimization, reverse pickup, and delivery alerts',
      desc: 'Bulky furniture, decor, and cookware require optimized volumetric weight charges. Our calculation engine calculates chargeable weight and picks the most cost-effective ground carrier.',
      stats: 'Volumetric Cost Saver',
      icon: <Store className="w-6 h-6 text-sky-600" />,
      features: ['Volumetric rate optimization', 'Fragile item handling tags', 'Customer delivery tracking SMS']
    }
  ];

  const matrix = [
    { industry: 'D2C Apparel & Fashion', avgRto: '15-25%', mainChallenge: 'Size Exchange & Address Non-Delivery', recommendedMix: 'Delhivery Surface + Shadowfax Reverse' },
    { industry: 'High-Value Electronics', avgRto: '5-10%', mainChallenge: 'Doorstep Theft & Transit Damage', recommendedMix: 'Blue Dart Air + Xpressbees Express' },
    { industry: 'Beauty & Personal Care', avgRto: '8-14%', mainChallenge: 'Shelf-Life & Fragile Transit', recommendedMix: 'Ecom Express Air + Delhivery Air' },
    { industry: 'Enterprise & B2B Freight', avgRto: '<2%', mainChallenge: 'Heavy Volumetric Charges', recommendedMix: 'Custom Cargo Surface Matrix' },
  ];

  const solutionFaqs = [
    {
      q: 'Can ShipFaster Logistic handle reverse pickup for size exchanges in D2C Apparel?',
      a: 'Yes! ShipFaster Logistic automatically generates reverse shipping AWB labels for exchange items, schedules doorstep courier pickup, and updates your inventory system.'
    },
    {
      q: 'How does OTP delivery verification work for high-value electronics?',
      a: 'When the last-mile agent arrives at the buyer location, a 4-digit OTP is sent to the customer mobile number. The package is handed over only after the OTP is validated.'
    },
    {
      q: 'Do you offer custom B2B freight rates for enterprise volumes?',
      a: 'Yes, enterprise merchants shipping over 2,000 orders/month receive tailored weight slab rate cards and a dedicated account manager.'
    }
  ];

  return (
    <div className="text-slate-900 flex flex-col font-sans">

      {/* Hero Header */}
      <section className="py-16 sm:py-20 px-6 sm:px-8 bg-gradient-to-b from-blue-50/80 via-white to-white border-b border-slate-200 overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-6 text-center">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-extrabold border border-blue-200/80 shadow-xs">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
            </span>
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span className="uppercase tracking-wider">Industry Tailored Logistics</span>
          </span>
          <h1 className="text-2xl xs:text-3xl sm:text-5xl md:text-6xl lg:text-[66px] font-black text-slate-950 font-display tracking-tight leading-[1.12] max-w-5xl mx-auto">
            Shipping Workflows Built for <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">Your Industry</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium mt-3 sm:mt-4">
            Configure logistics rules, courier selection, and NDR recovery around the way your specific business actually ships.
          </p>
        </div>
      </section>

      {/* 6 Industry Solution Cards Section */}
      <section className="py-16 sm:py-20 px-6 sm:px-8 max-w-7xl mx-auto w-full space-y-16">
        <div className="text-center space-y-3.5 max-w-5xl mx-auto">
          <div className="inline-block">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-extrabold border border-blue-200/80 shadow-xs">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span className="uppercase tracking-wider">TAILORED SOLUTIONS • INDUSTRY WORKFLOWS</span>
            </div>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-display tracking-tight leading-[1.18] max-w-4xl mx-auto">
            Specialized Workflows Across{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
              6 Industry Verticals
            </span>
          </h2>

          <p className="text-sm sm:text-base md:text-lg text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto">
            Every industry faces distinct logistics challenges. Here is how ShipFaster Logistic solves them.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {solutions.map((sol, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ y: -6 }}
              className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md space-y-6 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center shadow-xs">
                    {sol.icon}
                  </div>
                  <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-800 font-extrabold text-[10px] uppercase tracking-wider border border-blue-200 font-display">
                    {sol.stats}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-black text-slate-900 font-display">{sol.title}</h3>
                  <p className="text-xs font-bold text-blue-600 mt-1">{sol.subtitle}</p>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {sol.desc}
                </p>

                <div className="pt-4 border-t border-slate-100 space-y-2">
                  {sol.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2 text-xs font-bold text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link to="/register">
                <Button variant="outline" className="w-full justify-between" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Configure Workflow →
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Industry Matrix Comparison */}
        <div className="bg-slate-50 p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-md space-y-8">
          <div className="text-center space-y-3.5 max-w-5xl mx-auto">
            <div className="inline-block">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-extrabold border border-blue-200/80 shadow-xs">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span className="uppercase tracking-wider">INDUSTRY COMPARISON MATRIX • CARRIER STACK</span>
              </div>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-display tracking-tight leading-[1.18] max-w-4xl mx-auto">
              Logistics Parameters by{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
                Category Vertical
              </span>
            </h2>

            <p className="text-sm sm:text-base md:text-lg text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto">
              Benchmark average RTO risks, fulfillment bottlenecks, and ideal multi-courier allocations tailored to your sector.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Industry Vertical</th>
                  <th className="p-4">Average RTO Risk</th>
                  <th className="p-4">Primary Challenge</th>
                  <th className="p-4">Recommended Carrier Stack</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {matrix.map((m, idx) => (
                  <tr key={idx} className="hover:bg-white transition-colors">
                    <td className="p-4 font-black text-slate-900 font-display">{m.industry}</td>
                    <td className="p-4 font-mono font-bold text-rose-600">{m.avgRto}</td>
                    <td className="p-4 text-slate-700">{m.mainChallenge}</td>
                    <td className="p-4 font-bold text-blue-600">{m.recommendedMix}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Industry Solutions FAQs */}
        <div className="py-8 border-t border-slate-200/80 space-y-8">
          <div className="text-center space-y-3.5 max-w-5xl mx-auto">
            <div className="inline-block">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-extrabold border border-blue-200/80 shadow-xs">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                <span className="uppercase tracking-wider">SOLUTIONS FAQS • EXPERT GUIDANCE</span>
              </div>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-display tracking-tight leading-[1.18] max-w-4xl mx-auto">
              Industry Workflow{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
                Frequently Asked Questions
              </span>
            </h2>

            <p className="text-sm sm:text-base md:text-lg text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto">
              Have specific logistics requirements for your product vertical? Explore answers to common questions below.
            </p>
          </div>

          <div className="space-y-3 max-w-3xl mx-auto">
            {solutionFaqs.map((faq, idx) => (
              <div key={idx} className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between font-bold text-slate-900 text-sm hover:text-blue-600 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180 text-blue-600' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed font-medium border-t border-slate-200 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
