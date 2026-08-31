import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { 
  Search, MapPin, Truck, CheckCircle2, Package, Clock, ShieldCheck, 
  ArrowRight, Phone, AlertTriangle, Download, MessageSquare, RefreshCw,
  ChevronDown, ExternalLink, UserCheck, Sparkles, Navigation
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { PublicNavbar, PublicFooter } from '../landing/PublicNav';
import { MockCourierAdapter } from '../../services/couriers/mock.adapter';
import { TrackingResult } from '../../services/couriers/adapter.interface';
import { toast } from 'sonner';

const routeStages = [
  { id: 'pickup', title: 'PICKUP', subtitle: 'Package Picked Up', icon: <Package className="w-4 h-4 text-blue-600" /> },
  { id: 'hub', title: 'HUB', subtitle: 'Arrived at Hub', icon: <MapPin className="w-4 h-4 text-purple-600" /> },
  { id: 'in_transit', title: 'IN TRANSIT', subtitle: 'On the Way', icon: <Truck className="w-4 h-4 text-amber-600" /> },
  { id: 'out_for_delivery', title: 'OUT FOR DELIVERY', subtitle: 'Delivery Executive Assigned', icon: <Clock className="w-4 h-4 text-sky-600" /> },
  { id: 'delivered', title: 'DELIVERED', subtitle: 'Doorstep Delivered', icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" /> }
];

const sampleAwbs = [
  { label: 'Delhivery Express', awb: 'DEL1928374650', status: 'Out for Delivery', color: 'border-blue-500/40 text-blue-400' },
  { label: 'Xpressbees Air', awb: 'XPB9928172610', status: 'In Transit', color: 'border-purple-500/40 text-purple-400' },
  { label: 'Shadowfax Hyperlocal', awb: 'SFX8817263540', status: 'Delivered', color: 'border-emerald-500/40 text-emerald-400' },
];

export const PublicTrackingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const awbQuery = searchParams.get('awb') || 'DEL1928374650';

  const [inputAwb, setInputAwb] = useState(awbQuery);
  const [trackingData, setTrackingData] = useState<TrackingResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [waOptIn, setWaOptIn] = useState(true);

  const routeLineRef = useRef<HTMLDivElement>(null);
  const truckIconRef = useRef<HTMLDivElement>(null);
  const stageNodesRef = useRef<(HTMLDivElement | null)[]>([]);

  const activeStageIndex = 3; // Out for Delivery stage in demo

  const fetchTracking = async (awb: string) => {
    setIsLoading(true);
    try {
      const adapter = new MockCourierAdapter('delhivery', 'Delhivery Express', 'c-delhivery');
      const result = await adapter.trackShipment(awb);
      setTrackingData(result);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (awbQuery) {
      fetchTracking(awbQuery);
    }
  }, [awbQuery]);

  // GSAP Route Line & Indicator Motion Setup
  useEffect(() => {
    if (!trackingData) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const targetProgress = activeStageIndex / (routeStages.length - 1); // e.g. 3/4 = 75%

    // Animate Route Fill Line (Width: 0% -> 75%)
    if (routeLineRef.current) {
      gsap.fromTo(routeLineRef.current,
        { width: '0%' },
        { width: `${targetProgress * 100}%`, duration: 1.2, ease: 'power2.out' }
      );
    }

    // Animate Truck Indicator Position
    if (truckIconRef.current) {
      gsap.fromTo(truckIconRef.current,
        { left: '0%' },
        { left: `${targetProgress * 100}%`, duration: 1.2, ease: 'power2.out' }
      );
    }

    // Stage Nodes Illumination Stagger
    stageNodesRef.current.forEach((nodeEl, idx) => {
      if (!nodeEl) return;
      if (idx <= activeStageIndex) {
        gsap.fromTo(nodeEl,
          { scale: 0.8, opacity: 0.6 },
          { scale: idx === activeStageIndex ? 1.15 : 1, opacity: 1, duration: 0.4, delay: (idx / (routeStages.length - 1)) * 1.0, ease: 'back.out(1.7)' }
        );
      }
    });
  }, [trackingData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputAwb.trim()) {
      fetchTracking(inputAwb.trim());
    }
  };

  const handleSampleClick = (awb: string) => {
    setInputAwb(awb);
    fetchTracking(awb);
  };

  const trackingFaqs = [
    {
      q: 'How frequently is AWB tracking status updated?',
      a: 'Tracking statuses update in real-time via direct courier webhooks. Scanning events at hubs and delivery scans are reflected instantly.'
    },
    {
      q: 'What if my shipment shows "Attempt Failed"?',
      a: 'If a delivery attempt fails due to customer unreachability or address issues, our automated WhatsApp Bot sends a verification link to update delivery preferences.'
    },
    {
      q: 'Where can I download Proof of Delivery (POD)?',
      a: 'Once a parcel is marked "DELIVERED", the digital POD signature receipt becomes available for download directly in the tracking portal.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans overflow-x-hidden">
      <PublicNavbar />

      <section className="relative py-10 sm:py-12 px-6 sm:px-8 bg-slate-950 text-white border-b border-slate-800 overflow-hidden">
        <div className="relative max-w-4xl mx-auto space-y-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-extrabold shadow-sm"
          >
            <Navigation className="w-4 h-4 text-blue-400 animate-spin" style={{ animationDuration: '8s' }} />
            <span>Live Courier Tracking • Delhivery, Xpressbees, Shadowfax & DTDC</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-black font-display tracking-tight leading-tight max-w-3xl mx-auto text-white"
          >
            Track Any Courier Shipment in Real-Time.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto leading-relaxed font-medium"
          >
            Enter your AWB tracking number or Order ID to inspect live courier progress, estimated delivery times, and milestone history.
          </motion.p>

          {/* Tracking Search Card */}
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-slate-900/90 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-4 text-left backdrop-blur-md"
          >
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Enter tracking number (e.g. DEL1928374650)..."
                value={inputAwb}
                onChange={(e) => setInputAwb(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3.5 text-sm font-mono font-bold text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                required
              />
              <Button 
                type="submit" 
                isLoading={isLoading} 
                leftIcon={<Search className="w-4 h-4" />} 
                className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold px-8 py-3.5 rounded-2xl shadow-xl shadow-blue-500/25"
              >
                Track Shipment
              </Button>
            </form>

            {/* Demo Sample AWBs */}
            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
              <span className="text-slate-400 font-bold text-[11px] uppercase tracking-wider">Try Demo AWBs:</span>
              {sampleAwbs.map((sample) => (
                <button
                  key={sample.awb}
                  onClick={() => handleSampleClick(sample.awb)}
                  className={`px-3 py-1 rounded-lg bg-slate-950 border ${sample.color} font-mono text-[11px] font-bold hover:bg-slate-800 transition-colors cursor-pointer`}
                >
                  {sample.awb} ({sample.label})
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Tracking Results Section */}
      <section className="py-10 sm:py-12 px-4 sm:px-8 max-w-5xl mx-auto w-full space-y-6 sm:space-y-8">
        {trackingData && (
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/90 shadow-xl space-y-10"
          >
            {/* Header Info Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 font-mono">AIR WAYBILL (AWB) TRACKING</span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">{trackingData.awbNumber}</h2>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium font-mono">
                  <span>Carrier: <strong>Delhivery Express</strong></span>
                  <span>•</span>
                  <span>Order: #ORD-9920</span>
                </div>
              </div>

              <div className="flex flex-col items-start sm:items-end gap-2">
                <StatusBadge status={trackingData.normalizedStatus} />
                {trackingData.estimatedDeliveryDate && (
                  <span className="text-xs text-slate-600 font-medium">
                    Est. Delivery: <strong className="text-emerald-600 font-display">Tomorrow by 5:00 PM</strong>
                  </span>
                )}
              </div>
            </div>

            {/* Courier Delivery Executive Card */}
            <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-md">
                  <UserCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="block font-black text-slate-900 text-sm">Delivery Agent: Rajesh Kumar (+91 98765*****)</span>
                  <span className="block text-slate-600 font-medium">Assigned Hub: Delhivery Bandra West Hub (PIN 400001)</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button 
                  onClick={() => toast.success('Delivery executive notified of your status check!')}
                  className="px-4 py-2 rounded-xl bg-white border border-blue-200 text-blue-700 font-extrabold hover:bg-blue-50 transition-colors shadow-xs cursor-pointer"
                >
                  Call Driver
                </button>
              </div>
            </div>

            {/* GSAP + SVG ROUTE STAGE ANIMATION CONTAINER */}
            <div className="space-y-6 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 font-display">
                  Shipment Route Progress
                </h3>
                <span className="text-xs font-bold text-blue-600 font-mono">Stage 4 of 5 • Out For Delivery</span>
              </div>

              {/* Desktop Stepper Bar with Animated Route Fill */}
              <div className="hidden md:block relative bg-slate-900 p-8 rounded-3xl border border-slate-800 overflow-hidden text-white shadow-xl">
                {/* Track Line */}
                <div className="absolute left-12 right-12 top-1/2 -translate-y-1/2 h-2 bg-slate-800 rounded-full z-0">
                  <div
                    ref={routeLineRef}
                    className="h-full bg-gradient-to-r from-blue-500 via-indigo-400 to-emerald-400 rounded-full origin-left shadow-lg shadow-blue-500/50"
                    style={{ width: '0%' }}
                  />
                </div>

                {/* Animated Shipment Indicator Icon (Truck) */}
                <div
                  ref={truckIconRef}
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 transition-transform duration-300"
                  style={{ left: '0%' }}
                >
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xl shadow-blue-500/50 ring-4 ring-blue-500/30">
                    <Truck className="w-5 h-5 text-white" />
                  </div>
                </div>

                {/* Stage Nodes */}
                <div className="relative z-10 flex items-center justify-between">
                  {routeStages.map((stage, idx) => {
                    const isActive = idx <= activeStageIndex;
                    const isCurrent = idx === activeStageIndex;

                    return (
                      <div
                        key={stage.id}
                        ref={(el) => { stageNodesRef.current[idx] = el; }}
                        className="flex flex-col items-center gap-2.5 text-center"
                      >
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border text-xs transition-all duration-300 ${
                          isCurrent
                            ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/30 ring-4 ring-blue-500/20 scale-110'
                            : isActive
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                            : 'bg-slate-950 border-slate-800 text-slate-600'
                        }`}>
                          {isActive && !isCurrent ? '✓' : stage.icon}
                        </div>
                        <div className="space-y-0.5">
                          <span className={`block text-[10px] font-mono font-extrabold uppercase ${
                            isCurrent ? 'text-blue-400' : isActive ? 'text-white' : 'text-slate-500'
                          }`}>
                            {stage.title}
                          </span>
                          <span className="block text-[9px] text-slate-400 font-medium max-w-[95px]">
                            {stage.subtitle}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Vertical Timeline Fallback */}
              <div className="block md:hidden space-y-4 pl-4 border-l-2 border-blue-500 relative">
                {routeStages.map((stage, idx) => (
                  <div key={stage.id} className="relative flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      idx <= activeStageIndex ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {idx <= activeStageIndex ? '✓' : idx + 1}
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-slate-900">{stage.title}</span>
                      <span className="block text-[10px] text-slate-500">{stage.subtitle}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Notification Preferences & Actions Bar */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="wa-opt"
                  checked={waOptIn}
                  onChange={(e) => setWaOptIn(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
                />
                <label htmlFor="wa-opt" className="font-bold text-slate-700 cursor-pointer">
                  Send real-time WhatsApp status alerts for AWB {trackingData.awbNumber}
                </label>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => toast.success('Proof of Delivery (POD) requested!')}
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                  className="font-bold text-xs"
                >
                  Download POD
                </Button>
              </div>
            </div>

            {/* Detailed Activity Log */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 font-display">
                  Full Tracking Scan History
                </h3>
                <span className="text-xs font-bold text-slate-400 font-mono">{trackingData.events.length} Events Logged</span>
              </div>

              <div className="space-y-3">
                {trackingData.events.map((evt, idx) => (
                  <motion.div 
                    key={evt.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.08 }}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs hover:border-blue-300 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                        <span className="font-extrabold text-slate-900 block">{evt.message}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium pl-3.5">{evt.location}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 font-bold bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-2xs">
                      {new Date(evt.event_time).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Tracking FAQs Accordion */}
        <div className="bg-slate-100/70 p-8 sm:p-12 rounded-3xl border border-slate-200/90 shadow-md space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 font-display">TRACKING HELP</span>
            <h3 className="text-2xl sm:text-4xl font-black text-slate-900 font-display tracking-tight">Frequently Asked Tracking Questions</h3>
          </div>

          <div className="space-y-3 max-w-3xl mx-auto">
            {trackingFaqs.map((faq, idx) => (
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
      </section>

      <PublicFooter />
    </div>
  );
};
