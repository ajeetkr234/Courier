import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { Truck, MapPin, Package, CheckCircle2, ShieldCheck, Zap, Clock, ArrowRight, Building2, FileCheck, Navigation } from 'lucide-react';

export const HeroCourierAnimation: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const truckRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(3); // Default In Transit

  useEffect(() => {
    // GSAP truck timeline loop
    const ctx = gsap.context(() => {
      if (truckRef.current) {
        gsap.to(truckRef.current, {
          x: '82%',
          duration: 10,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut',
          onUpdate: function () {
            const progress = this.progress();
            if (progress < 0.15) setActiveStep(0);
            else if (progress < 0.35) setActiveStep(1);
            else if (progress < 0.55) setActiveStep(2);
            else if (progress < 0.75) setActiveStep(3);
            else if (progress < 0.90) setActiveStep(4);
            else setActiveStep(5);
          }
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const stages = [
    { title: 'Pickup Warehouse', subtitle: 'Delhi NCR Hub', icon: <Building2 className="w-4 h-4" /> },
    { title: 'Manifest Generated', subtitle: 'AWB #DEL1928374', icon: <FileCheck className="w-4 h-4" /> },
    { title: 'Picked Up', subtitle: 'Driver Handover', icon: <Package className="w-4 h-4" /> },
    { title: 'In Transit', subtitle: 'Express Air SLA', icon: <Truck className="w-4 h-4" /> },
    { title: 'Out for Delivery', subtitle: 'Last Mile Agent', icon: <Navigation className="w-4 h-4" /> },
    { title: 'Delivered', subtitle: 'OTP Verified', icon: <CheckCircle2 className="w-4 h-4" /> }
  ];

  return (
    <div ref={containerRef} className="mt-6 mb-2 sm:mt-8 sm:mb-3 max-w-5xl mx-auto px-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-lg relative overflow-hidden">
        {/* Top Header Badge */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 border-b border-slate-100 pb-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
            <span className="text-xs font-black text-slate-900 font-display">Live Shipment Journey Simulation</span>
          </div>
          <div className="text-[10px] sm:text-[11px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 font-mono">
            AWB: DEL1928374650 • SLA: 24-48 Hours
          </div>
        </div>

        {/* Animated Progress Track */}
        <div className="relative py-2 sm:py-6">
          {/* Background Connecting Line (Desktop / Tablet Single Row Only) */}
          <div className="hidden sm:block absolute top-1/2 left-4 right-4 h-1.5 bg-slate-100 -translate-y-1/2 rounded-full z-0"></div>

          {/* Animated Active Progress Line */}
          <div 
            className="hidden sm:block absolute top-1/2 left-4 h-1.5 bg-blue-600 -translate-y-1/2 rounded-full z-0 transition-all duration-300"
            style={{ width: `${(activeStep / (stages.length - 1)) * 92}%` }}
          ></div>

          {/* Moving Animated Truck Icon */}
          <div 
            ref={truckRef} 
            className="hidden sm:block absolute top-1/2 -translate-y-1/2 z-20 pointer-events-none transition-transform"
            style={{ left: '3%' }}
          >
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg border-2 border-white font-bold">
              <Truck className="w-5 h-5 animate-bounce" />
            </div>
          </div>

          {/* 6 Stage Milestone Nodes */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 relative z-10">
            {stages.map((stage, idx) => {
              const isPassed = idx <= activeStep;
              const isCurrent = idx === activeStep;

              return (
                <div key={idx} className="flex flex-col items-center text-center space-y-2">
                  <div 
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      isCurrent ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-md scale-110' :
                      isPassed ? 'bg-emerald-500 text-white shadow-xs' : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    {stage.icon}
                  </div>
                  <div>
                    <span className={`block text-xs font-black font-display leading-tight ${isCurrent ? 'text-blue-600' : isPassed ? 'text-slate-900' : 'text-slate-400'}`}>
                      {stage.title}
                    </span>
                    <span className="block text-[10px] text-slate-500 font-medium mt-0.5">
                      {stage.subtitle}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export const FloatingCourierBadges: React.FC = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto my-6">
      <motion.div 
        whileHover={{ y: -4 }}
        className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <Truck className="w-5 h-5" />
        </div>
        <div>
          <span className="block text-xs font-black text-slate-900 font-display">Delhivery Air</span>
          <span className="block text-[10px] text-slate-500 font-medium">98.4% On-Time SLA</span>
        </div>
      </motion.div>

      <motion.div 
        whileHover={{ y: -4 }}
        className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
          <Zap className="w-5 h-5" />
        </div>
        <div>
          <span className="block text-xs font-black text-slate-900 font-display">Xpressbees Surface</span>
          <span className="block text-[10px] text-slate-500 font-medium">Cheapest Freight</span>
        </div>
      </motion.div>

      <motion.div 
        whileHover={{ y: -4 }}
        className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <span className="block text-xs font-black text-slate-900 font-display">Ecom Express COD</span>
          <span className="block text-[10px] text-slate-500 font-medium">T+2 Direct Payouts</span>
        </div>
      </motion.div>

      <motion.div 
        whileHover={{ y: -4 }}
        className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <span className="block text-xs font-black text-slate-900 font-display">Shadowfax Hyperlocal</span>
          <span className="block text-[10px] text-slate-500 font-medium">Same-Day City Delivery</span>
        </div>
      </motion.div>
    </div>
  );
};
