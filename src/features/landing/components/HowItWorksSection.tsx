import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  ShoppingBag, 
  Calculator, 
  CheckCircle2, 
  Package, 
  Truck, 
  Check, 
  Sparkles
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface StepItem {
  id: string;
  stepNumber: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  activeBadgeColor: string;
  badgeText: string;
}

const steps: StepItem[] = [
  {
    id: 'order',
    stepNumber: '01',
    title: 'ORDER',
    subtitle: 'Automated Order Sync',
    description: 'Orders automatically sync in real-time from Shopify, WooCommerce, or custom REST APIs.',
    icon: <ShoppingBag className="w-5 h-5 text-blue-600" />,
    activeBadgeColor: 'border-blue-200 bg-blue-50 text-blue-700',
    badgeText: 'Store Sync'
  },
  {
    id: 'compare',
    stepNumber: '02',
    title: 'COMPARE',
    subtitle: 'Real-Time Rate Engine',
    description: 'Instantly calculate volumetric weights and compare freight quotes across 7+ carrier networks.',
    icon: <Calculator className="w-5 h-5 text-purple-600" />,
    activeBadgeColor: 'border-purple-200 bg-purple-50 text-purple-700',
    badgeText: 'Live Freight Quotes'
  },
  {
    id: 'choose',
    stepNumber: '03',
    title: 'CHOOSE',
    subtitle: 'Smart Carrier Allocation',
    description: 'Automated rules select the fastest delivery SLA & lowest shipping cost for every destination pincode.',
    icon: <CheckCircle2 className="w-5 h-5 text-amber-600" />,
    activeBadgeColor: 'border-amber-200 bg-amber-50 text-amber-700',
    badgeText: 'Carrier Selection'
  },
  {
    id: 'ship',
    stepNumber: '04',
    title: 'SHIP',
    subtitle: 'AWB & Label Printing',
    description: 'Generate AWB shipping manifests, print bulk shipping labels, and schedule carrier pickups in one click.',
    icon: <Package className="w-5 h-5 text-sky-600" />,
    activeBadgeColor: 'border-sky-200 bg-sky-50 text-sky-700',
    badgeText: 'Manifest & Labels'
  },
  {
    id: 'track',
    stepNumber: '05',
    title: 'TRACK',
    subtitle: 'Branded Tracking & Alerts',
    description: 'Automatic WhatsApp & SMS notifications keep buyers informed with a custom branded tracking portal.',
    icon: <Truck className="w-5 h-5 text-indigo-600" />,
    activeBadgeColor: 'border-indigo-200 bg-indigo-50 text-indigo-700',
    badgeText: 'WhatsApp / SMS'
  },
  {
    id: 'deliver',
    stepNumber: '06',
    title: 'DELIVER',
    subtitle: 'Delivery & COD Remittance',
    description: 'OTP-verified doorstep delivery confirmation with rapid T+2 COD remittance to your bank account.',
    icon: <Check className="w-5 h-5 text-emerald-600" />,
    activeBadgeColor: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    badgeText: 'COD Remittance'
  }
];

export const HowItWorksSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const desktopProgressLineRef = useRef<HTMLDivElement>(null);
  const mobileProgressLineRef = useRef<HTMLDivElement>(null);
  const stepCardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const stepNodesRef = useRef<(HTMLDivElement | null)[]>([]);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Main ScrollTrigger timeline driving sequential progression (ORDER -> DELIVER on scroll down, DELIVER -> ORDER on scroll up)
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 60%',
          end: 'bottom 80%',
          scrub: 0.5,
          onUpdate: (self) => {
            const index = Math.min(
              steps.length - 1,
              Math.floor(self.progress * steps.length)
            );
            setActiveStepIndex(index);
          }
        }
      });

      // Animate Desktop Progress Line (Width: 0% -> 100%)
      if (desktopProgressLineRef.current) {
        tl.to(desktopProgressLineRef.current, {
          width: '100%',
          ease: 'none'
        }, 0);
      }

      // Animate Mobile Progress Line (Height: 0% -> 100%)
      if (mobileProgressLineRef.current) {
        tl.to(mobileProgressLineRef.current, {
          height: '100%',
          ease: 'none'
        }, 0);
      }

      // Step cards entrance & active highlights
      stepCardsRef.current.forEach((cardEl, idx) => {
        if (!cardEl) return;
        const progressPos = idx / (steps.length - 1);
        
        tl.to(cardEl, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.25,
          ease: 'power1.out'
        }, progressPos * 0.8);
      });

      // Step nodes activation on stepper bar
      stepNodesRef.current.forEach((nodeEl, idx) => {
        if (!nodeEl) return;
        const progressPos = idx / (steps.length - 1);

        tl.to(nodeEl, {
          scale: 1.12,
          duration: 0.2,
          ease: 'back.out(1.7)'
        }, progressPos * 0.8);
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="py-16 sm:py-20 px-4 sm:px-8 lg:px-12 bg-slate-50 border-b border-slate-200 overflow-hidden relative"
    >

      <div className="relative max-w-7xl mx-auto space-y-12">
        {/* Header Block */}
        <div className="text-center space-y-3.5 max-w-5xl mx-auto">
          <div className="inline-block">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-extrabold border border-blue-200/80 shadow-xs">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span className="uppercase tracking-wider">How It Works • Automated Journey</span>
            </div>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-display tracking-tight leading-[1.18]">
            From Order Placement to{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
              Doorstep Delivery
            </span>
          </h2>

          <p className="text-sm sm:text-base md:text-lg text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto">
            See how ShipFaster Logistic manages every stage of your multi-courier shipping lifecycle.
          </p>
        </div>

        {/* DESKTOP TIMELINE STEPPER BAR (Horizontal Scroll-Linked Progress) */}
        <div className="hidden lg:block bg-white p-4 rounded-2xl border border-slate-200/90 shadow-md relative overflow-hidden">
          {/* Progress Track Line */}
          <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-slate-100 rounded-full z-0">
            <div
              ref={desktopProgressLineRef}
              className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 rounded-full origin-left"
              style={{ width: '0%' }}
            />
          </div>

          {/* Stepper Nodes Row */}
          <div className="relative z-10 flex items-center justify-between">
            {steps.map((step, idx) => {
              const isActive = idx <= activeStepIndex;
              const isCurrent = idx === activeStepIndex;

              return (
                <div
                  key={step.id}
                  ref={(el) => { stepNodesRef.current[idx] = el; }}
                  onClick={() => setActiveStepIndex(idx)}
                  className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-300 cursor-pointer ${
                    isCurrent
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 scale-105'
                      : isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                      : 'bg-white text-slate-500 border border-slate-200/80 hover:bg-slate-50'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-black transition-colors ${
                    isCurrent ? 'bg-white text-blue-600' : isActive ? 'bg-blue-200 text-blue-800' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {step.stepNumber}
                  </span>
                  <span>{step.title}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3x2 DESKTOP STEP CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {steps.map((step, idx) => {
            const isActive = idx <= activeStepIndex;
            const isCurrent = idx === activeStepIndex;

            return (
              <div
                key={step.id}
                ref={(el) => { stepCardsRef.current[idx] = el; }}
                onClick={() => setActiveStepIndex(idx)}
                className={`bg-white p-6 rounded-3xl border transition-all duration-300 space-y-4 flex flex-col justify-between relative overflow-hidden group cursor-pointer ${
                  isCurrent
                    ? 'border-blue-400 shadow-xl shadow-blue-500/10 ring-2 ring-blue-500/20 -translate-y-1'
                    : isActive
                    ? 'border-slate-300 shadow-md opacity-100'
                    : 'border-slate-200/80 shadow-xs opacity-75 hover:opacity-100'
                }`}
                style={{ opacity: 0, transform: 'translateY(25px)' }}
              >
                {/* Active Indicator Top Accent Line */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 transition-opacity duration-300 ${
                    isActive ? 'opacity-100' : 'opacity-0'
                  }`}
                />

                <div className="space-y-3.5">
                  {/* Card Header: Icon + Stage Badges */}
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-colors ${
                      isCurrent
                        ? 'bg-blue-50 border-blue-200 shadow-xs'
                        : 'bg-slate-50 border-slate-200/80'
                    }`}>
                      {step.icon}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                        STAGE {step.stepNumber}
                      </span>
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${step.activeBadgeColor}`}>
                        {step.badgeText}
                      </span>
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <div>
                    <h3 className="text-lg font-black text-slate-900 font-display group-hover:text-blue-600 transition-colors">
                      {step.title} <span className="text-slate-400 font-semibold text-xs">/ {step.subtitle}</span>
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 font-medium leading-relaxed min-h-[36px]">
                    {step.description}
                  </p>
                </div>

                {/* Footer Step Indicator Bar */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      isCurrent ? 'bg-blue-500 animate-ping' : isActive ? 'bg-emerald-500' : 'bg-slate-300'
                    }`} />
                    <span>Stage {step.stepNumber} of 06</span>
                  </span>
                  <span className={`font-mono text-[10px] transition-colors ${
                    isCurrent ? 'text-blue-600 font-extrabold' : 'text-slate-400'
                  }`}>
                    {step.id.toUpperCase()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
