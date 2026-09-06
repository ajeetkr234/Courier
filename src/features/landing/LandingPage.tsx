import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { gsap } from 'gsap';

// Phase 2: Hero Entrance Animation Variants
const heroContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const heroBadgeVariants: Variants = {
  hidden: { opacity: 0, y: -15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

const heroHeadingWordContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.1,
    },
  },
};

const heroHeadingWordVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.92 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  },
};

const heroDescriptionVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

const heroCtaVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

const heroTrackingVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

const heroProductVisualVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};
import {
  Truck, Search, CheckCircle2, ShieldCheck, Zap, ArrowRight,
  ChevronRight, BarChart3, Wallet, MapPin, Calculator, Sparkles,
  Building2, Award, Users, RefreshCw, Package, ArrowUpRight,
  HelpCircle, ChevronDown, Star, Check, Layers, DollarSign,
  ShoppingBag, Store, Globe, Code2, FileSpreadsheet, Headset,
  Send, Mail, Phone, Scale, FileText, Clock, Navigation, Plane,
  XCircle, AlertTriangle, Filter, ArrowUpDown, Cpu, Printer, Bell, CheckSquare,
  MessageSquare, Smartphone, Calendar, PackageCheck, FileCheck, Receipt, Loader2, Box, Tag, Quote, Lock, X, Eye, TrendingUp
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { PublicNavbar, PublicFooter } from './PublicNav';
import { ComparisonSection } from './components/ComparisonSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { IndustryOrbitVisualizer } from './components/IndustryOrbitVisualizer';
import { AnimatedCounter } from '../../components/ui/AnimatedCounter';
import { GlobalThreeBackground } from '../../components/ui/GlobalThreeBackground';
import { rateEngine } from '../../services/couriers/rateEngine';
import { RateQuote } from '../../types';
import { MOCK_COURIERS } from '../../lib/mockData';
import { toast } from 'sonner';
import { useAuth } from '../../app/providers/AuthProvider';
import { ServiceabilityCheckForm } from '../../components/shipping/ServiceabilityCheckForm';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [trackInput, setTrackInput] = useState('');
  const [selectedIndustryIdx, setSelectedIndustryIdx] = useState(0);
  const ratesTableRef = useRef<HTMLDivElement>(null);

  // Ensure page always starts at top (0, 0) on refresh / load
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const scrollToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    const hash = window.location.hash;
    if (hash) {
      const targetElement = document.querySelector(hash);
      if (targetElement) {
        setTimeout(() => {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        return;
      }
    }

    scrollToTop();
    requestAnimationFrame(scrollToTop);
    setTimeout(scrollToTop, 0);
    setTimeout(scrollToTop, 50);
  }, []);

  // Freight Calculator Inputs State
  const [calcPickup, setCalcPickup] = useState('110020');
  const [calcDelivery, setCalcDelivery] = useState('400001');
  const [shipmentType, setShipmentType] = useState<'FORWARD' | 'REVERSE'>('FORWARD');
  const [actualWeight, setActualWeight] = useState('0.5');
  const [lengthCm, setLengthCm] = useState('15');
  const [widthCm, setWidthCm] = useState('10');
  const [heightCm, setHeightCm] = useState('10');
  const [paymentMode, setPaymentMode] = useState<'PREPAID' | 'COD'>('PREPAID');
  const [productValue, setProductValue] = useState('1500');

  // Calculation Results State
  const [isCalcLoading, setIsCalcLoading] = useState(false);
  const [calcErrorMsg, setCalcErrorMsg] = useState('');
  const [calculatedQuotes, setCalculatedQuotes] = useState<RateQuote[]>([]);
  const [calculatedVolumetric, setCalculatedVolumetric] = useState(0.3);
  const [calculatedChargeable, setCalculatedChargeable] = useState(0.5);

  // Initial Weight Calculation
  useEffect(() => {
    const weight = parseFloat(actualWeight) || 0.5;
    const l = parseFloat(lengthCm) || 15;
    const w = parseFloat(widthCm) || 10;
    const h = parseFloat(heightCm) || 10;
    const volWeight = parseFloat(((l * w * h) / 5000).toFixed(2));
    setCalculatedVolumetric(volWeight);
    setCalculatedChargeable(Math.max(weight, volWeight));

    if (user) {
      runFreightCalculation();
    }
  }, [user]);

  const runFreightCalculation = async () => {
    setCalcErrorMsg('');

    const pinRegex = /^\d{6}$/;
    if (!pinRegex.test(calcPickup.trim())) {
      setCalcErrorMsg('Please enter a valid 6-digit Pickup Pincode.');
      return;
    }
    if (!pinRegex.test(calcDelivery.trim())) {
      setCalcErrorMsg('Please enter a valid 6-digit Delivery Pincode.');
      return;
    }

    const weight = parseFloat(actualWeight) || 0.5;
    const l = parseFloat(lengthCm) || 10;
    const w = parseFloat(widthCm) || 10;
    const h = parseFloat(heightCm) || 10;

    const volWeight = parseFloat(((l * w * h) / 5000).toFixed(2));
    const chgWeight = Math.max(weight, volWeight);

    setCalculatedVolumetric(volWeight);
    setCalculatedChargeable(chgWeight);

    setIsCalcLoading(true);
    try {
      const results = await rateEngine.fetchComparisonQuotes({
        sellerId: 'demo-seller',
        pickupPincode: calcPickup,
        deliveryPincode: calcDelivery,
        weightKg: chgWeight,
        paymentType: paymentMode,
        orderValue: parseFloat(productValue) || 1500
      });

      const augmentedResults = results.map(q => {
        const baseFreight = q.base_rate;
        const codFee = paymentMode === 'COD' ? Math.max(20, (parseFloat(productValue) || 1500) * 0.015) : 0;
        const gst = parseFloat(((baseFreight + codFee) * 0.18).toFixed(2));
        const total = parseFloat((baseFreight + codFee + gst).toFixed(2));
        return {
          ...q,
          cod_charge: codFee,
          total_rate: total
        };
      });

      setCalculatedQuotes(augmentedResults);
    } finally {
      setIsCalcLoading(false);
    }
  };

  const handleCalculatorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCalcErrorMsg('');

    const pinRegex = /^\d{6}$/;
    if (!pinRegex.test(calcPickup.trim())) {
      setCalcErrorMsg('Please enter a valid 6-digit Pickup Pincode.');
      return;
    }
    if (!pinRegex.test(calcDelivery.trim())) {
      setCalcErrorMsg('Please enter a valid 6-digit Delivery Pincode.');
      return;
    }

    const weight = parseFloat(actualWeight) || 0.5;
    const l = parseFloat(lengthCm) || 10;
    const w = parseFloat(widthCm) || 10;
    const h = parseFloat(heightCm) || 10;

    const volWeight = parseFloat(((l * w * h) / 5000).toFixed(2));
    const chgWeight = Math.max(weight, volWeight);

    setCalculatedVolumetric(volWeight);
    setCalculatedChargeable(chgWeight);

    if (!user) {
      toast.info('Please sign in or create an account to compare live courier rates.');
      navigate('/login');
      return;
    }

    runFreightCalculation().then(() => {
      toast.success('Shipping rate calculations updated!');
      setTimeout(() => {
        ratesTableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    });
  };

  // Pincode Serviceability Checker State
  const [pincodePickup, setPincodePickup] = useState('110020');
  const [pincodeDelivery, setPincodeDelivery] = useState('400001');
  const [pincodeStatus, setPincodeStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('SUCCESS');
  const [pincodeErrorMsg, setPincodeErrorMsg] = useState('');

  // Book a Demo / Contact Form State & Validation
  const [demoFullName, setDemoFullName] = useState('');
  const [demoWorkEmail, setDemoWorkEmail] = useState('');
  const [demoMobileNumber, setDemoMobileNumber] = useState('');
  const [demoCompanyName, setDemoCompanyName] = useState('');
  const [demoVolume, setDemoVolume] = useState('500–2,000');
  const [demoWebsite, setDemoWebsite] = useState('');
  const [demoRequirement, setDemoRequirement] = useState('');
  const [demoFormError, setDemoFormError] = useState('');

  const heroHeadingRef = useRef<HTMLHeadingElement>(null);

  // Phase 3: GSAP Courier Marquee Refs & Animation
  const marqueeTrackRef = useRef<HTMLDivElement>(null);
  const marqueeTweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !marqueeTrackRef.current) return;

    const ctx = gsap.context(() => {
      marqueeTweenRef.current = gsap.to(marqueeTrackRef.current, {
        xPercent: -33.333333,
        duration: 32,
        ease: 'none',
        repeat: -1,
      });
    }, marqueeTrackRef);

    return () => ctx.revert();
  }, []);

  const handleMarqueeMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!marqueeTweenRef.current || marqueeTweenRef.current.paused()) return;
    const movementX = e.movementX;
    if (Math.abs(movementX) > 0.5) {
      const targetTimeScale = movementX < 0 ? 1.45 : 0.55;
      gsap.to(marqueeTweenRef.current, {
        timeScale: targetTimeScale,
        duration: 0.3,
        overwrite: true,
        onComplete: () => {
          if (marqueeTweenRef.current) {
            gsap.to(marqueeTweenRef.current, { timeScale: 1, duration: 0.6 });
          }
        }
      });
    }
  };

  const handleMarqueeCardMouseEnter = () => {
    if (marqueeTweenRef.current) {
      marqueeTweenRef.current.pause();
    }
  };

  const handleMarqueeCardMouseLeave = () => {
    if (marqueeTweenRef.current) {
      marqueeTweenRef.current.play();
    }
  };

  // Phase 6: GSAP Tracking Timeline ScrollTrigger
  const trackingSectionRef = useRef<HTMLElement>(null);
  const trackingLineProgressRef = useRef<HTMLDivElement>(null);
  const trackingNodesRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !trackingSectionRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: trackingSectionRef.current,
          start: 'top 70%',
          end: 'bottom 70%',
          scrub: 0.5,
        },
      });

      if (trackingLineProgressRef.current) {
        tl.to(trackingLineProgressRef.current, {
          height: '100%',
          ease: 'none',
        }, 0);
      }

      trackingNodesRef.current.forEach((nodeEl, idx) => {
        if (!nodeEl) return;
        const targetIcon = nodeEl.querySelector('.tracking-node-icon');
        const targetText = nodeEl.querySelector('.tracking-node-text');

        tl.to(nodeEl, {
          opacity: 1,
          duration: 0.25,
        }, idx * 0.12);

        if (targetIcon) {
          tl.to(targetIcon, {
            scale: idx === 4 ? 1.18 : 1.05,
            duration: 0.2,
            ease: 'back.out(1.7)',
          }, idx * 0.12);
        }

        if (targetText) {
          tl.to(targetText, {
            color: idx === 4 ? '#60a5fa' : idx < 4 ? '#f8fafc' : '#64748b',
            duration: 0.2,
          }, idx * 0.12);
        }
      });
    }, trackingSectionRef);

    return () => ctx.revert();
  }, []);

  // Phase 7: Dashboard Counters & Sequential Metric Reveal
  const dashboardMetricsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !dashboardMetricsContainerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(dashboardMetricsContainerRef.current ? dashboardMetricsContainerRef.current.children : [], {
        opacity: 0,
        y: 25,
        scale: 0.95,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: dashboardMetricsContainerRef.current,
          start: 'top 85%',
          once: true,
        },
      });
    }, dashboardMetricsContainerRef);

    return () => ctx.revert();
  }, []);

  // Section 6: Financial Lifecycle GSAP ScrollTrigger
  const financeLifecycleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !financeLifecycleRef.current) return;

    const ctx = gsap.context(() => {
      const stepEls = financeLifecycleRef.current ? Array.from(financeLifecycleRef.current.querySelectorAll('.finance-lifecycle-step')) : [];
      if (stepEls.length > 0) {
        gsap.fromTo(stepEls,
          { opacity: 0, y: 20, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            stagger: 0.09,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: financeLifecycleRef.current,
              start: 'top 80%',
              once: true,
            }
          }
        );
      }
    }, financeLifecycleRef);

    return () => ctx.revert();
  }, []);

  // Phase 8: Industry Solutions GSAP ScrollTrigger
  const solutionsSectionRef = useRef<HTMLElement>(null);
  const solutionsCardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [hoveredSolutionId, setHoveredSolutionId] = useState<number | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !solutionsSectionRef.current) return;

    const ctx = gsap.context(() => {
      const cards = solutionsCardsRef.current.filter(Boolean);
      if (cards.length > 0) {
        gsap.fromTo(cards,
          { opacity: 0, y: 35, scale: 0.98 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: solutionsSectionRef.current,
              start: 'top 75%',
              once: true,
            },
          }
        );
      }
    }, solutionsSectionRef);

    return () => ctx.revert();
  }, []);



  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackInput.trim()) {
      navigate(`/track?awb=${encodeURIComponent(trackInput.trim())}`);
    }
  };

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    setPincodeErrorMsg('');

    const pinRegex = /^\d{6}$/;

    if (!pinRegex.test(pincodePickup.trim())) {
      setPincodeStatus('ERROR');
      setPincodeErrorMsg('Please enter a valid 6-digit Pickup PIN code.');
      return;
    }

    if (!pinRegex.test(pincodeDelivery.trim())) {
      setPincodeStatus('ERROR');
      setPincodeErrorMsg('Please enter a valid 6-digit Delivery PIN code.');
      return;
    }

    setPincodeStatus('LOADING');
    setTimeout(() => {
      setPincodeStatus('SUCCESS');
      toast.success(`Serviceability verified for PIN route ${pincodePickup} → ${pincodeDelivery}!`);
    }, 600);
  };

  const handleDemoFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDemoFormError('');

    if (!demoFullName.trim()) {
      setDemoFormError('Please enter your full name.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(demoWorkEmail.trim())) {
      setDemoFormError('Please enter a valid work email address.');
      return;
    }

    const mobileClean = demoMobileNumber.replace(/\D/g, '');
    if (mobileClean.length < 10 || mobileClean.length > 12) {
      setDemoFormError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    if (!demoCompanyName.trim()) {
      setDemoFormError('Please enter your company name.');
      return;
    }

    if (!demoRequirement.trim()) {
      setDemoFormError('Please detail your shipping requirement or message.');
      return;
    }

    toast.success('Thank you! Your demo request has been received. A logistics expert will reach out within 24 hours.');
    setDemoFullName('');
    setDemoWorkEmail('');
    setDemoMobileNumber('');
    setDemoCompanyName('');
    setDemoWebsite('');
    setDemoRequirement('');
  };

  const courierNetworkCards = [
    {
      name: 'Delhivery',
      logoSvg: (
        <svg viewBox="0 0 140 40" className="h-8 sm:h-9 w-auto">
          <rect width="140" height="40" rx="8" fill="#E11D48" />
          <text x="70" y="26" textAnchor="middle" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="17" letterSpacing="1">DELHIVERY</text>
        </svg>
      ),
      borderGlow: 'hover:border-red-500/80 hover:shadow-[0_0_30px_rgba(225,29,72,0.35)]'
    },
    {
      name: 'Blue Dart',
      logoSvg: (
        <svg viewBox="0 0 140 40" className="h-8 sm:h-9 w-auto">
          <rect width="140" height="40" rx="8" fill="#1D4ED8" />
          <path d="M12 20 L22 12 L22 28 Z" fill="#FACC15" />
          <text x="76" y="26" textAnchor="middle" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="15" letterSpacing="0.5">BLUE DART</text>
        </svg>
      ),
      borderGlow: 'hover:border-blue-500/80 hover:shadow-[0_0_30px_rgba(29,78,216,0.35)]'
    },
    {
      name: 'DHL Express',
      logoSvg: (
        <svg viewBox="0 0 110 40" className="h-8 sm:h-9 w-auto">
          <rect width="110" height="40" rx="8" fill="#FFCC00" />
          <line x1="8" y1="12" x2="30" y2="12" stroke="#D0021B" strokeWidth="3" />
          <line x1="8" y1="20" x2="25" y2="20" stroke="#D0021B" strokeWidth="3" />
          <line x1="8" y1="28" x2="20" y2="28" stroke="#D0021B" strokeWidth="3" />
          <text x="68" y="28" textAnchor="middle" fill="#D0021B" fontFamily="Impact, Arial Black, sans-serif" fontWeight="900" fontSize="24" letterSpacing="1">DHL</text>
        </svg>
      ),
      borderGlow: 'hover:border-amber-400/80 hover:shadow-[0_0_30px_rgba(255,204,0,0.35)]'
    },
    {
      name: 'Xpressbees',
      logoSvg: (
        <svg viewBox="0 0 145 40" className="h-8 sm:h-9 w-auto">
          <rect width="145" height="40" rx="8" fill="#F59E0B" />
          <path d="M14 10 L22 20 L16 20 L24 30 L16 22 L22 22 Z" fill="#090D16" />
          <text x="82" y="26" textAnchor="middle" fill="#090D16" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="14" letterSpacing="0.5">XPRESSBEES</text>
        </svg>
      ),
      borderGlow: 'hover:border-amber-500/80 hover:shadow-[0_0_30px_rgba(245,158,11,0.35)]'
    },
    {
      name: 'Shadowfax',
      logoSvg: (
        <svg viewBox="0 0 140 40" className="h-8 sm:h-9 w-auto">
          <rect width="140" height="40" rx="8" fill="#7C3AED" />
          <polygon points="14,20 26,12 22,20 26,28" fill="#FFFFFF" />
          <text x="80" y="26" textAnchor="middle" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontWeight="800" fontSize="15">shadowfax</text>
        </svg>
      ),
      borderGlow: 'hover:border-purple-500/80 hover:shadow-[0_0_30px_rgba(124,58,237,0.35)]'
    },
    {
      name: 'DTDC',
      logoSvg: (
        <svg viewBox="0 0 120 40" className="h-8 sm:h-9 w-auto">
          <rect width="120" height="40" rx="8" fill="#0284C7" />
          <circle cx="18" cy="20" r="9" fill="#EF4444" />
          <text x="68" y="27" textAnchor="middle" fill="#FFFFFF" fontFamily="Impact, Arial Black, sans-serif" fontWeight="900" fontSize="21" letterSpacing="1.5">DTDC</text>
        </svg>
      ),
      borderGlow: 'hover:border-sky-400/80 hover:shadow-[0_0_30px_rgba(2,132,199,0.35)]'
    },
    {
      name: 'Ecom Express',
      logoSvg: (
        <svg viewBox="0 0 145 40" className="h-8 sm:h-9 w-auto">
          <rect width="145" height="40" rx="8" fill="#059669" />
          <rect x="12" y="13" width="14" height="14" rx="3" fill="#FFFFFF" />
          <text x="82" y="26" textAnchor="middle" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontWeight="800" fontSize="14">ecom express</text>
        </svg>
      ),
      borderGlow: 'hover:border-emerald-500/80 hover:shadow-[0_0_30px_rgba(5,150,105,0.35)]'
    },
    {
      name: 'Amazon Shipping',
      logoSvg: (
        <svg viewBox="0 0 155 40" className="h-8 sm:h-9 w-auto">
          <rect width="155" height="40" rx="8" fill="#1F2937" />
          <text x="77" y="23" textAnchor="middle" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontWeight="800" fontSize="13">amazon<tspan fill="#FF9900"> shipping</tspan></text>
          <path d="M 40 28 Q 77 35 115 28" stroke="#FF9900" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>
      ),
      borderGlow: 'hover:border-orange-400/80 hover:shadow-[0_0_30px_rgba(255,153,0,0.35)]'
    },
    {
      name: 'FedEx',
      logoSvg: (
        <svg viewBox="0 0 120 40" className="h-8 sm:h-9 w-auto">
          <rect width="120" height="40" rx="8" fill="#1E1B4B" />
          <text x="60" y="28" textAnchor="middle" fontFamily="Impact, Arial Black, sans-serif" fontWeight="900" fontSize="24">
            <tspan fill="#6366F1">Fed</tspan><tspan fill="#F97316">Ex</tspan>
          </text>
        </svg>
      ),
      borderGlow: 'hover:border-indigo-400/80 hover:shadow-[0_0_30px_rgba(99,102,241,0.35)]'
    },
    {
      name: 'Aramex',
      logoSvg: (
        <svg viewBox="0 0 130 40" className="h-8 sm:h-9 w-auto">
          <rect width="130" height="40" rx="8" fill="#DC2626" />
          <text x="65" y="26" textAnchor="middle" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="17" letterSpacing="0.5">aramex</text>
        </svg>
      ),
      borderGlow: 'hover:border-rose-500/80 hover:shadow-[0_0_30px_rgba(220,38,38,0.35)]'
    }
  ];

  const trustBenefits = [
    { label: 'Multi-Courier Access', icon: <Truck className="w-3.5 h-3.5 text-cyan-400" /> },
    { label: 'Pan-India Serviceability', icon: <MapPin className="w-3.5 h-3.5 text-blue-400" /> },
    { label: 'Multiple Shipping Modes', icon: <Layers className="w-3.5 h-3.5 text-indigo-400" /> }
  ];

  const withoutItems = [
    'Multiple courier dashboards',
    'Manual rate comparison',
    'Fragmented tracking',
    'Delayed NDR action',
    'Difficult COD reconciliation',
    'Weight and billing disputes'
  ];

  const withItems = [
    'One shipping dashboard',
    'Automated courier selection',
    'Unified tracking',
    'NDR recovery workflows',
    'COD settlement visibility',
    'Weight dispute management'
  ];

  const ndrWorkflowSteps = [
    { label: 'NDR Detected', icon: <AlertTriangle className="w-4 h-4 text-rose-500" /> },
    { label: 'Customer Contacted', icon: <MessageSquare className="w-4 h-4 text-blue-500" /> },
    { label: 'WhatsApp / SMS / IVR', icon: <Smartphone className="w-4 h-4 text-purple-500" /> },
    { label: 'Customer Confirms', icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" /> },
    { label: 'Reattempt Scheduled', icon: <Calendar className="w-4 h-4 text-amber-500" /> },
    { label: 'Delivered', icon: <PackageCheck className="w-4 h-4 text-emerald-600" /> }
  ];

  const financialWorkflowSteps = [
    { label: 'COD Order', icon: <ShoppingBag className="w-4 h-4 text-blue-600" /> },
    { label: 'Delivered', icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" /> },
    { label: 'COD Collected', icon: <DollarSign className="w-4 h-4 text-amber-600" /> },
    { label: 'Settlement Processing', icon: <RefreshCw className="w-4 h-4 text-purple-600" /> },
    { label: 'Merchant Account', icon: <Building2 className="w-4 h-4 text-emerald-600" /> }
  ];

  const trackingTimeline = [
    { status: 'Order Confirmed', time: 'Aug 24, 09:30 AM', completed: true },
    { status: 'Picked Up', time: 'Aug 24, 02:15 PM', completed: true },
    { status: 'In Transit', time: 'Aug 25, 04:00 AM', completed: true },
    { status: 'Arrived at Hub', time: 'Aug 25, 11:20 AM', completed: true },
    { status: 'Out for Delivery', time: 'Aug 25, 01:45 PM', completed: false, active: true },
    { status: 'Delivered', time: 'Expected Today', completed: false, pending: true }
  ];

  const financeSuiteFeatures = [
    { title: 'COD reconciliation', desc: 'Automated COD reconciliation across all shipments' },
    { title: 'Settlement tracking', desc: 'Real-time settlement status and timelines' },
    { title: 'Transaction history', desc: 'Detailed COD transaction audit trail' },
    { title: 'Wallet visibility', desc: 'Live wallet balance and ledger updates' },
    { title: 'Invoice / report access', desc: 'Download invoices, reports & statements' },
    { title: 'Weight dispute tracking', desc: 'Track and manage weight disputes efficiently' }
  ];

  const ndrHighlights = [
    'Automated NDR workflows',
    'Customer address confirmation',
    'Reattempt scheduling',
    'RTO risk monitoring',
    'Reverse pickup support'
  ];

  const industrySolutions = [
    {
      id: 'apparel',
      shortName: 'D2C Apparel',
      title: 'D2C Apparel & Fashion',
      icon: <ShoppingBag className="w-5 h-5 text-blue-600" />,
      challenge: 'High return rates from sizing disputes and buyer address non-deliveries.',
      recommendedMix: 'Delhivery Surface + Shadowfax Reverse Pickup',
      rtoRate: '15-22% RTO Benchmark',
      capabilities: [
        'Automated size exchange & doorstep reverse pickup',
        'Buyer WhatsApp address confirmation prior to dispatch',
        'Instant NDR recovery workflows for non-contact orders'
      ],
      ctaText: 'Configure Apparel Rules'
    },
    {
      id: 'electronics',
      shortName: 'High-Value Electronics',
      title: 'High-Value Electronics',
      icon: <Cpu className="w-5 h-5 text-purple-600" />,
      challenge: 'Doorstep transit damage risk, high item value, and delivery disputes.',
      recommendedMix: 'DTDC Express Air + OTP Delivery Verification',
      rtoRate: '5-8% Low RTO',
      capabilities: [
        'Doorstep OTP verification & tamper-proof bag tracking',
        'Full transit insurance coverage up to ₹50,000 per shipment',
        'Real-time courier handover & GPS driver tracking'
      ],
      ctaText: 'Configure Electronics Rules'
    },
    {
      id: 'beauty',
      shortName: 'Beauty & Skincare',
      title: 'Beauty & Personal Care',
      icon: <Sparkles className="w-5 h-5 text-amber-600" />,
      challenge: 'Urgent express delivery for temperature and shelf-life sensitive items.',
      recommendedMix: 'Xpressbees Express + Daily COD Payouts',
      rtoRate: '12-18% Moderate RTO',
      capabilities: [
        'Priority air routing for 24-48 hour metro delivery',
        'Automated batch order processing & label printing',
        'Daily T+2 Cash-on-Delivery remittance to your bank'
      ],
      ctaText: 'Configure Beauty Rules'
    },
    {
      id: 'b2b',
      shortName: 'Enterprise B2B',
      title: 'Enterprise & B2B Freight',
      icon: <Truck className="w-5 h-5 text-emerald-600" />,
      challenge: 'Bulk volumetric dispatches across regional distributors with custom SLAs.',
      recommendedMix: 'Delhivery Surface Heavy + Custom B2B Rate Card',
      rtoRate: '<3% Minimal RTO',
      capabilities: [
        'Negotiated contract rates & volumetric weight optimization',
        'Multi-warehouse pickup scheduling & split-shipment manifests',
        'Dedicated key account manager & priority phone support'
      ],
      ctaText: 'Configure B2B Rules'
    },
    {
      id: 'healthcare',
      shortName: 'Pharma & Healthcare',
      title: 'Healthcare & Pharma Logistics',
      icon: <ShieldCheck className="w-5 h-5 text-rose-600" />,
      challenge: 'Strict chain-of-custody, urgent delivery SLA, and tamper compliance.',
      recommendedMix: 'Delhivery Air Priority + Secure Pod Handover',
      rtoRate: '<2% Critical SLA',
      capabilities: [
        'Priority cold-chain & temperature control routing',
        'Verified recipient ID check upon doorstep handover',
        'Compliance documentation & instant POD upload'
      ],
      ctaText: 'Configure Healthcare Rules'
    },
    {
      id: 'home',
      shortName: 'Home & Goods',
      title: 'Home & Lifestyle Goods',
      icon: <Store className="w-5 h-5 text-sky-600" />,
      challenge: 'Bulky volumetric weight surcharges and fragile item transit protection.',
      recommendedMix: 'Ecom Express Ground + Heavy Package Support',
      rtoRate: '10-15% Moderate RTO',
      capabilities: [
        'Smart volumetric calculation & box size recommendations',
        'Fragile handling tags & automated courier routing',
        'Real-time SMS & WhatsApp delivery appointment alerts'
      ],
      ctaText: 'Configure Home Goods Rules'
    }
  ];

  const availableCouriersList = [
    { name: 'Delhivery', type: 'Air & Surface', badge: 'Active' },
    { name: 'Xpressbees', type: 'Express Ground', badge: 'Active' },
    { name: 'Ecom Express', type: 'Prepaid & COD', badge: 'Active' },
    { name: 'Shadowfax', type: 'Hyperlocal & Surface', badge: 'Active' }
  ];

  const aboutCapabilities = [
    {
      title: 'Multi-Courier Platform',
      icon: <Truck className="w-6 h-6 text-blue-600" />,
      desc: 'Access multiple courier networks from a single dashboard to compare rates and automate carrier selection.'
    },
    {
      title: 'Pan-India Serviceability',
      icon: <MapPin className="w-6 h-6 text-emerald-600" />,
      desc: 'Check serviceability across 28,000+ pincodes for both prepaid and cash-on-delivery orders.'
    },
    {
      title: 'API-First Architecture',
      icon: <Code2 className="w-6 h-6 text-purple-600" />,
      desc: 'Connect Shopify, WooCommerce, or custom ERP systems via robust REST APIs and webhooks.'
    },
    {
      title: 'D2C & Enterprise Ready',
      icon: <Building2 className="w-6 h-6 text-amber-600" />,
      desc: 'Built to support fast-growing D2C storefronts and high-volume enterprise logistics workflows.'
    }
  ];

  const testimonialTemplates = [
    {
      role: 'Founder, D2C Apparel Brand',
      category: 'Apparel Logistics Case Study',
      quote: 'Configurable merchant feedback template. Connect your CMS or customer review API to display verified shipping feedback.',
      author: '[ Merchant Name ]',
      company: 'D2C Apparel Brand'
    },
    {
      role: 'Logistics Lead, Consumer Electronics',
      category: 'Electronics Logistics Case Study',
      quote: 'Configurable merchant feedback template. Connect your CMS or customer review API to display verified shipping feedback.',
      author: '[ Merchant Name ]',
      company: 'Consumer Electronics Store'
    },
    {
      role: 'E-Commerce Manager, Personal Care',
      category: 'Personal Care Case Study',
      quote: 'Configurable merchant feedback template. Connect your CMS or customer review API to display verified shipping feedback.',
      author: '[ Merchant Name ]',
      company: 'Beauty Store'
    }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans relative">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative pt-10 sm:pt-12 pb-8 sm:pb-12 px-4 sm:px-8 lg:px-12 bg-gradient-to-b from-blue-50/40 via-white to-white overflow-hidden">
        {/* Three.js Dynamic Background Canvas */}
        <div className="absolute inset-0 opacity-40 pointer-events-none z-0">
          <GlobalThreeBackground />
        </div>

        <motion.div
          className="w-full mx-auto text-center relative z-10 space-y-5 sm:space-y-6 px-4 sm:px-8 lg:px-12"
          variants={heroContainerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* 1. Badge (y: -15 -> 0, opacity: 0 -> 1, 0.5s) */}
          <motion.div
            variants={heroBadgeVariants}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-extrabold border border-blue-200/80 shadow-xs"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            <Truck className="w-3.5 h-3.5 text-blue-600" />
            <span className="uppercase tracking-wider">Multi-Courier Shipping Aggregator</span>
          </motion.div>

          {/* 2. Responsive Animated Heading */}
          <motion.h1
            variants={heroHeadingWordContainerVariants}
            className="text-2xl xs:text-3xl sm:text-5xl md:text-6xl lg:text-[66px] xl:text-[72px] font-black text-slate-950 tracking-tight leading-tight sm:leading-none font-display max-w-[1350px] mx-auto flex items-center justify-center flex-wrap sm:flex-nowrap gap-x-2 sm:gap-x-3.5 py-1 px-2"
          >
            <motion.span variants={heroHeadingWordVariants} className="inline-block text-slate-950 shrink-0">
              Ship
            </motion.span>
            <motion.span variants={heroHeadingWordVariants} className="inline-block text-slate-950 shrink-0">
              Smarter.
            </motion.span>
            <motion.span variants={heroHeadingWordVariants} className="inline-block text-blue-600 shrink-0">
              Deliver
            </motion.span>
            <motion.span variants={heroHeadingWordVariants} className="inline-block text-blue-600 shrink-0">
              Faster.
            </motion.span>
          </motion.h1>

          {/* 3. Description (y: 20 -> 0, opacity: 0 -> 1, 0.5s) */}
          <motion.p
            variants={heroDescriptionVariants}
            className="text-base sm:text-lg text-slate-600 max-w-[780px] mx-auto leading-relaxed font-medium mt-3 sm:mt-4"
          >
            Compare live freight rates across Delhivery, Xpressbees, Shadowfax & DTDC. Book courier pickups, print shipping labels, track orders, and get faster Cash-on-Delivery payouts.
          </motion.p>

          {/* 4. CTA Buttons (y: 20 -> 0, opacity: 0 -> 1, 0.5s) */}
          <motion.div
            variants={heroCtaVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 mt-6 sm:mt-7"
          >
            <Link to="/register" className="w-full sm:w-auto">
              <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.18 }}>
                <Button size="lg" className="w-full sm:w-auto shadow-lg shadow-blue-500/20 group" rightIcon={<ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />}>
                  Book a Shipment
                </Button>
              </motion.div>
            </Link>
            <a href="#calculator" className="w-full sm:w-auto">
              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.18 }}>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto hover:border-blue-300 transition-colors"
                  leftIcon={
                    <span className="w-6 h-6 rounded-lg bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-blue-600 shadow-2xs">
                      <Calculator className="w-3.5 h-3.5" />
                    </span>
                  }
                >
                  Calculate Shipping Rates
                </Button>
              </motion.div>
            </a>
          </motion.div>

          {/* 4b. Mobile Quick Shortcut Pills */}
          <div className="flex sm:hidden items-center justify-center gap-2 pt-1 px-1 text-xs font-bold font-mono">
            <a href="#track" className="px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 flex items-center gap-1.5 shadow-2xs">
              <Search className="w-3 h-3 text-blue-600" />
              <span>Track AWB</span>
            </a>
            <a href="#calculator" className="px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center gap-1.5 shadow-2xs">
              <Calculator className="w-3 h-3 text-purple-600" />
              <span>Rates</span>
            </a>
            <a href="#solutions" className="px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center gap-1.5 shadow-2xs">
              <Building2 className="w-3 h-3 text-emerald-600" />
              <span>Solutions</span>
            </a>
          </div>

          {/* 5. Tracking Input (y: 20 -> 0, scale: 0.98 -> 1, opacity: 0 -> 1, 0.55s) */}
          <motion.div
            id="track"
            variants={heroTrackingVariants}
            className="mt-6 sm:mt-7 max-w-[540px] mx-auto"
          >
            <form onSubmit={handleTrackSubmit} className="bg-white p-2 rounded-2xl flex items-center gap-2 shadow-lg shadow-slate-900/5 border border-slate-200/90 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
              <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
              <input
                type="text"
                placeholder="Enter tracking number..."
                value={trackInput}
                onChange={(e) => setTrackInput(e.target.value)}
                className="w-full bg-transparent border-none text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none px-2 font-medium"
                aria-label="Enter AWB or Tracking Number"
              />
              <motion.div whileHover={{ y: -1 }}>
                <Button type="submit" size="sm" variant="primary" className="shrink-0 font-bold">
                  Track Shipment
                </Button>
              </motion.div>
            </form>
          </motion.div>

          {/* 6. Product Visual Showcase */}
          <motion.div
            variants={heroProductVisualVariants}
            className="mt-8 sm:mt-10 max-w-6xl mx-auto w-full"
          >
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden p-2 sm:p-2.5 bg-white border border-slate-200 shadow-xl shadow-slate-900/5">
              <div className="relative aspect-video w-full rounded-xl sm:rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center">
                <video
                  src="/Create_a_premium_–_second.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Minimalist Big-Logo Courier Network Showcase */}
      <section className="relative py-14 sm:py-16 px-4 sm:px-8 lg:px-12 bg-[#090d16] border-y border-slate-800/80 overflow-hidden">
        {/* Ambient Glows & Grid Mesh */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#38bdf8 1px, transparent 1px)`,
            backgroundSize: '28px 28px'
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[280px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative w-full mx-auto px-4 sm:px-8 lg:px-12 space-y-8">

          {/* Header Block (Standardized Chip & Gradient Heading) */}
          <div className="text-center space-y-3.5 max-w-4xl mx-auto">
            <div className="inline-block">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-cyan-200 text-xs font-extrabold border border-white/20 shadow-xs backdrop-blur-md">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
                </span>
                <Truck className="w-3.5 h-3.5 text-cyan-300" />
                <span className="uppercase tracking-wider text-white/95">12+ Integrated Courier Partners</span>
              </div>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight font-display text-white leading-[1.18]">
              One Platform.{' '}
              <span className="bg-gradient-to-r from-cyan-200 via-sky-200 to-white bg-clip-text text-transparent">
                Multiple Courier Networks.
              </span>
            </h2>
          </div>

          {/* LARGE LOGO CONTINUOUS INFINITE MARQUEE */}
          <div
            className="relative overflow-hidden py-4 max-w-full [mask-image:linear-gradient(to_right,transparent_0%,black_10%,black_90%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_10%,black_90%,transparent_100%)]"
          >
            <div ref={marqueeTrackRef} className="animate-infinite-marquee flex items-center shrink-0">
              {/* Track Loop 1 */}
              <div className="flex items-center gap-4 sm:gap-6 pr-4 sm:pr-6 shrink-0">
                {courierNetworkCards.map((partner, idx) => (
                  <div
                    key={`track1-${idx}`}
                    onMouseEnter={handleMarqueeCardMouseEnter}
                    onMouseLeave={handleMarqueeCardMouseLeave}
                    className={`group bg-slate-900/90 hover:bg-slate-800 p-3 sm:p-4 rounded-2xl border border-slate-800/90 shadow-2xl flex items-center justify-center ${partner.borderGlow} hover:-translate-y-1 transition-all duration-300 ease-out shrink-0 cursor-pointer`}
                  >
                    <div className="transition-transform duration-300 group-hover:scale-105">
                      {partner.logoSvg}
                    </div>
                  </div>
                ))}
              </div>

              {/* Track Loop 2 */}
              <div className="flex items-center gap-4 sm:gap-6 pr-4 sm:pr-6 shrink-0" aria-hidden="true">
                {courierNetworkCards.map((partner, idx) => (
                  <div
                    key={`track2-${idx}`}
                    onMouseEnter={handleMarqueeCardMouseEnter}
                    onMouseLeave={handleMarqueeCardMouseLeave}
                    className={`group bg-slate-900/90 hover:bg-slate-800 p-3 sm:p-4 rounded-2xl border border-slate-800/90 shadow-2xl flex items-center justify-center ${partner.borderGlow} hover:-translate-y-1 transition-all duration-300 ease-out shrink-0 cursor-pointer`}
                  >
                    <div className="transition-transform duration-300 group-hover:scale-105">
                      {partner.logoSvg}
                    </div>
                  </div>
                ))}
              </div>

              {/* Track Loop 3 */}
              <div className="flex items-center gap-4 sm:gap-6 pr-4 sm:pr-6 shrink-0" aria-hidden="true">
                {courierNetworkCards.map((partner, idx) => (
                  <div
                    key={`track3-${idx}`}
                    onMouseEnter={handleMarqueeCardMouseEnter}
                    onMouseLeave={handleMarqueeCardMouseLeave}
                    className={`group bg-slate-900/90 hover:bg-slate-800 p-3 sm:p-4 rounded-2xl border border-slate-800/90 shadow-2xl flex items-center justify-center ${partner.borderGlow} hover:-translate-y-1 transition-all duration-300 ease-out shrink-0 cursor-pointer`}
                  >
                    <div className="transition-transform duration-300 group-hover:scale-105">
                      {partner.logoSvg}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Industry Solutions / Workflow Section - Circular Orbiting Shipping Models Visualizer */}
      <div id="solutions">
        <IndustryOrbitVisualizer />
      </div>

      {/* Why ShipSmarter? Section */}
      <ComparisonSection />


      {/* FREIGHT CALCULATOR SECTION (#calculator) */}
      <section id="calculator" className="py-10 sm:py-12 px-4 sm:px-8 lg:px-12 bg-white border-b border-slate-200 overflow-hidden">
        <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-3.5 max-w-5xl mx-auto"
          >
            <div className="inline-block">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-extrabold border border-blue-200/80 shadow-xs">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                <Calculator className="w-3.5 h-3.5 text-blue-600" />
                <span className="uppercase tracking-wider">Multi-Courier Freight Calculator • Rate Demo</span>
              </div>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-display tracking-tight leading-[1.18] max-w-4xl mx-auto">
              Calculate Your Shipping Cost{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
                Before You Ship
              </span>
            </h2>

            <p className="text-sm sm:text-base md:text-lg text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto">
              Enter your shipment dimensions, weight, payment mode, and route to compute volumetric weight and compare carrier freight quotes.
            </p>
          </motion.div>

          <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl space-y-8">
            <ServiceabilityCheckForm
              onSuccessContinue={(res) => {
                if (res.pickupPincode) setCalcPickup(res.pickupPincode);
                if (res.deliveryPincode) setCalcDelivery(res.deliveryPincode);
                toast.success(`Location set: ${res.pickupCity} (${res.pickupPincode}) → ${res.deliveryCity} (${res.deliveryPincode})`);
              }}
            />

            <form onSubmit={handleCalculatorSubmit} className="space-y-6 pt-4 border-t border-slate-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">Pickup Pincode</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={calcPickup}
                    onChange={(e) => setCalcPickup(e.target.value.replace(/\D/g, ''))}
                    className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold"
                    placeholder="e.g. 110020"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">Delivery Pincode</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={calcDelivery}
                    onChange={(e) => setCalcDelivery(e.target.value.replace(/\D/g, ''))}
                    className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold"
                    placeholder="e.g. 400001"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">Shipment Type</label>
                  <div className="flex bg-white p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setShipmentType('FORWARD')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${shipmentType === 'FORWARD' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      Forward
                    </button>
                    <button
                      type="button"
                      onClick={() => setShipmentType('REVERSE')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${shipmentType === 'REVERSE' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      Reverse
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">Payment Mode</label>
                  <div className="flex bg-white p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setPaymentMode('PREPAID')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${paymentMode === 'PREPAID' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      Prepaid
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMode('COD')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${paymentMode === 'COD' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      COD
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">Actual Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={actualWeight}
                    onChange={(e) => setActualWeight(e.target.value)}
                    className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">Length (cm)</label>
                  <input
                    type="number"
                    min="1"
                    value={lengthCm}
                    onChange={(e) => setLengthCm(e.target.value)}
                    className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">Width (cm)</label>
                  <input
                    type="number"
                    min="1"
                    value={widthCm}
                    onChange={(e) => setWidthCm(e.target.value)}
                    className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">Height (cm)</label>
                  <input
                    type="number"
                    min="1"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold"
                    required
                  />
                </div>

                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">Product Value (₹)</label>
                  <input
                    type="number"
                    min="1"
                    value={productValue}
                    onChange={(e) => setProductValue(e.target.value)}
                    className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold"
                    required
                  />
                </div>
              </div>

              {calcErrorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{calcErrorMsg}</span>
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full shadow-md justify-center"
                leftIcon={
                  isCalcLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <span className="w-6 h-6 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center text-white shadow-xs">
                      <Calculator className="w-3.5 h-3.5" />
                    </span>
                  )
                }
                disabled={isCalcLoading}
              >
                {isCalcLoading ? 'Calculating Freight Rates...' : 'Compare Courier Rates →'}
              </Button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-blue-50/80 border border-blue-200 text-slate-900 text-xs">
              <div className="flex items-center gap-3">
                <Scale className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase font-bold">Actual Weight</span>
                  <span className="block text-base font-black font-mono">{actualWeight} kg</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Box className="w-5 h-5 text-purple-600 shrink-0" />
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase font-bold">Volumetric Weight (L*W*H / 5000)</span>
                  <span className="block text-base font-black font-mono">{calculatedVolumetric} kg</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="block text-[10px] text-emerald-800 uppercase font-bold">Chargeable Weight (Max)</span>
                  <span className="block text-base font-black text-emerald-600 font-mono">{calculatedChargeable} kg</span>
                </div>
              </div>
            </div>

            {!user ? (
              <div className="p-6 rounded-2xl bg-blue-50/70 border border-blue-200 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-xs">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-black text-slate-900 font-display">Sign In or Register to Unlock Live Rates</h4>
                  <p className="text-xs text-slate-600 max-w-md mx-auto font-medium">
                    Compare live courier rates across Delhivery, Xpressbees, Ecom Express &amp; Shadowfax for route <span className="font-mono font-bold text-slate-900">{calcPickup} &rarr; {calcDelivery}</span> ({calculatedChargeable} kg chargeable weight).
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      toast.info('Please sign in or create an account to compare live courier rates.');
                      navigate('/login');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-all inline-flex items-center gap-2"
                  >
                    <Lock className="w-4 h-4" /> Compare Live Rates Now
                  </button>
                  <Link to="/register">
                    <Button variant="outline" size="sm" className="text-xs font-bold">
                      Create Free Account &rarr;
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div ref={ratesTableRef} className="space-y-4 pt-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-base font-black text-slate-900 font-display">Courier Freight Quote Comparison</h3>
                  <span className="text-[10px] font-mono text-slate-400">* Live Carrier Card Estimates</span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="p-4">Courier</th>
                        <th className="p-4">Chargeable Wt.</th>
                        <th className="p-4">Freight</th>
                        <th className="p-4">COD Fee</th>
                        <th className="p-4">GST (18%)</th>
                        <th className="p-4">Total Rate</th>
                        <th className="p-4">ETA</th>
                        <th className="p-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {calculatedQuotes.map((q, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-2.5">
                              <span className="font-black text-slate-900 font-display">{q.courier_name}</span>
                              {q.recommendation_badge && (
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${q.recommendation_badge === 'Cheapest' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                    q.recommendation_badge === 'Fastest' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                                      'bg-blue-100 text-blue-800 border border-blue-200'
                                  }`}>
                                  {q.recommendation_badge}
                                </span>
                              )}
                            </div>
                            <span className="block text-[10px] text-slate-500">{q.service_name || 'Express Cargo'}</span>
                          </td>
                          <td className="p-4 font-mono font-bold text-slate-800">{calculatedChargeable} kg</td>
                          <td className="p-4 font-mono text-slate-800">₹{q.base_rate.toFixed(2)}</td>
                          <td className="p-4 font-mono text-slate-800">₹{(q.cod_charge || 0).toFixed(2)}</td>
                          <td className="p-4 font-mono text-slate-500">₹{(((q.base_rate + (q.cod_charge || 0)) * 0.18)).toFixed(2)}</td>
                          <td className="p-4 font-mono font-black text-blue-600 text-sm">₹{q.total_rate.toFixed(2)}</td>
                          <td className="p-4 font-bold text-slate-900">{q.estimated_days} Days</td>
                          <td className="p-4 text-right">
                            <Link to="/app/orders/new">
                              <Button size="sm" variant="outline" className="text-xs">
                                Ship Order &rarr;
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* PRICING PLANS SECTION (#pricing) */}
      <section id="pricing" className="py-10 sm:py-12 px-4 sm:px-8 lg:px-12 bg-slate-50 border-b border-slate-200 overflow-hidden">
        <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-3.5 max-w-5xl mx-auto"
          >
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

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-display tracking-tight leading-[1.18] max-w-4xl mx-auto">
              Simple, Predictable{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
                Logistics Pricing
              </span>
            </h2>

            <p className="text-sm sm:text-base md:text-lg text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto">
              Choose the plan that fits your current order volume and scale your e-commerce shipping with zero upfront subscription cost.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* STARTER PLAN */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -6, scale: 1.015 }}
              className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-xl flex flex-col justify-between space-y-6 transition-all duration-300 group"
            >
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500 font-display">STARTER</span>
                  <h3 className="text-3xl font-black text-slate-900 font-display mt-2">₹0<span className="text-sm font-normal text-slate-500">/month</span></h3>
                  <p className="text-xs text-slate-600 mt-2 font-medium">
                    For small stores getting started with multi-courier shipping.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-3 font-medium text-xs text-slate-800">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 group-hover:scale-110 transition-transform" />
                    <span>Multi-courier access</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 group-hover:scale-110 transition-transform" />
                    <span>Rate comparison</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 group-hover:scale-110 transition-transform" />
                    <span>Basic tracking</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 group-hover:scale-110 transition-transform" />
                    <span>NDR workflows</span>
                  </div>
                </div>
              </div>

              <Link to="/register">
                <Button variant="outline" className="w-full justify-center group-hover:border-blue-500 group-hover:text-blue-700 transition-all">
                  Get Started
                </Button>
              </Link>
            </motion.div>

            {/* GROWTH PLAN (RECOMMENDED HIGHLIGHTED) */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -6, scale: 1.015 }}
              className="bg-white p-8 rounded-3xl border-2 border-blue-600 shadow-2xl flex flex-col justify-between space-y-6 relative z-10 group"
            >
              <div className="absolute -top-3.5 right-6 px-3.5 py-1 rounded-full bg-blue-600 text-white text-[10px] font-extrabold uppercase tracking-widest shadow-md z-20">
                RECOMMENDED
              </div>

              <div className="space-y-6">
                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-blue-600 font-display">GROWTH</span>
                  <h3 className="text-3xl font-black text-slate-900 font-display mt-2">Pay as You Ship</h3>
                  <p className="text-xs text-slate-600 mt-2 font-medium">
                    Discounted shipping rates for growing businesses.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-3 font-medium text-xs text-slate-800">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-slate-900">Everything in Starter</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 group-hover:scale-110 transition-transform" />
                    <span>Advanced rate optimization</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 group-hover:scale-110 transition-transform" />
                    <span>NDR automation</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 group-hover:scale-110 transition-transform" />
                    <span>COD reporting</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 group-hover:scale-110 transition-transform" />
                    <span>Store integrations</span>
                  </div>
                </div>
              </div>

              <Link to="/register">
                <Button className="w-full justify-center bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all">
                  Start Shipping
                </Button>
              </Link>
            </motion.div>

            {/* ENTERPRISE PLAN */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -6, scale: 1.015 }}
              className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-xl flex flex-col justify-between space-y-6 transition-all duration-300 group"
            >
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500 font-display">ENTERPRISE</span>
                  <h3 className="text-3xl font-black text-slate-900 font-display mt-2">Custom</h3>
                  <p className="text-xs text-slate-600 mt-2 font-medium">
                    For high-volume businesses with advanced logistics requirements.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-3 font-medium text-xs text-slate-800">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 group-hover:scale-110 transition-transform" />
                    <span>Dedicated support</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 group-hover:scale-110 transition-transform" />
                    <span>Custom rate cards</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 group-hover:scale-110 transition-transform" />
                    <span>API integration</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 group-hover:scale-110 transition-transform" />
                    <span>Advanced reporting</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 group-hover:scale-110 transition-transform" />
                    <span>Custom workflows</span>
                  </div>
                </div>
              </div>

              <a href="#contact">
                <Button variant="outline" className="w-full justify-center group-hover:border-blue-500 group-hover:text-blue-700 transition-all">
                  Contact Sales
                </Button>
              </a>
            </motion.div>
          </div>

          <p className="text-center text-xs text-slate-500 font-medium max-w-xl mx-auto">
            * Plans and shipping rates may vary based on shipment volume and courier selection.
          </p>
        </div>
      </section>

      {/* Recover More Orders. Reduce RTO. Section (Upgraded Fantastic Design with Motion) */}
      <section id="ndr-recovery" className="py-20 px-4 sm:px-8 lg:px-12 bg-slate-950 text-white border-b border-slate-800 overflow-hidden relative">

        <div className="relative max-w-6xl mx-auto space-y-16">
          {/* Header Block */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-3.5 max-w-5xl mx-auto"
          >
            <div className="inline-block">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-cyan-200 text-xs font-extrabold border border-white/20 shadow-xs backdrop-blur-md">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
                </span>
                <Zap className="w-3.5 h-3.5 text-cyan-300" />
                <span className="uppercase tracking-wider text-white/95">NDR &amp; RTO Recovery Hub</span>
              </div>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-display tracking-tight leading-[1.18] max-w-4xl mx-auto">
              Recover More Orders,{' '}
              <span className="bg-gradient-to-r from-cyan-200 via-sky-200 to-white bg-clip-text text-transparent">
                Reduce RTO Costs
              </span>
            </h2>

            <p className="text-sm sm:text-base md:text-lg text-slate-300 font-medium leading-relaxed max-w-3xl mx-auto">
              Turn failed delivery attempts into successful deliveries with automated buyer WhatsApp reattempts and instant NDR recovery workflows.
            </p>
          </motion.div>

          {/* Automated NDR Resolution Pipeline Container */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-slate-900/90 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-[0_0_50px_rgba(15,23,42,0.6)] space-y-6 relative overflow-hidden backdrop-blur-md"
          >
            {/* Top Pipeline Bar */}
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 font-display flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                Automated NDR Resolution Pipeline
              </h3>
              <span className="hidden sm:inline-block text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">
                6-Stage Automated Workflow
              </span>
            </div>

            {/* Grid of Steps */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 sm:gap-4 items-stretch relative">
              {ndrWorkflowSteps.map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.15 + idx * 0.08 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="bg-slate-950/90 p-4 rounded-2xl border border-slate-800/80 hover:border-slate-700 text-center space-y-3 flex flex-col items-center justify-between group cursor-pointer shadow-md hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 relative"
                >
                  {/* Step Badge */}
                  <span className="text-[9px] font-mono font-extrabold text-slate-500 uppercase tracking-widest">
                    Step 0{idx + 1}
                  </span>

                  {/* Icon Container */}
                  <div className="w-11 h-11 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-center shadow-md group-hover:scale-110 group-hover:border-blue-500/40 transition-all duration-300">
                    {step.icon}
                  </div>

                  {/* Label */}
                  <span className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">
                    {step.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Action Center & Key Features Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Card: NDR Action Center Performance */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-7 bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800/90 shadow-2xl space-y-6 flex flex-col justify-between relative overflow-hidden backdrop-blur-md"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
                <div>
                  <h4 className="text-base font-black text-white font-display">NDR Action Center Performance</h4>
                  <span className="text-[10px] font-mono text-slate-400">* Demo Metrics • Simulated Platform Preview</span>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Live Action Engine
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  className="p-4 rounded-2xl bg-slate-900/90 border border-rose-500/20 space-y-1 shadow-[0_0_15px_rgba(244,63,94,0.05)] transition-all"
                >
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">NDR Orders</span>
                  <span className="block text-xl sm:text-2xl font-black text-rose-400 font-display">1,248</span>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.03 }}
                  className="p-4 rounded-2xl bg-slate-900/90 border border-blue-500/20 space-y-1 shadow-[0_0_15px_rgba(59,130,246,0.05)] transition-all"
                >
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contacted</span>
                  <span className="block text-xl sm:text-2xl font-black text-blue-400 font-display">1,180</span>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.03 }}
                  className="p-4 rounded-2xl bg-slate-900/90 border border-purple-500/20 space-y-1 shadow-[0_0_15px_rgba(168,85,247,0.05)] transition-all"
                >
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confirmed</span>
                  <span className="block text-xl sm:text-2xl font-black text-purple-400 font-display">945</span>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.03 }}
                  className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/20 space-y-1 shadow-[0_0_15px_rgba(245,158,11,0.05)] transition-all"
                >
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reattempts</span>
                  <span className="block text-xl sm:text-2xl font-black text-amber-400 font-display">912</span>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-4.5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 col-span-2 sm:col-span-2 space-y-1 shadow-[0_0_20px_rgba(16,185,129,0.1)] transition-all"
                >
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recovered Deliveries</span>
                  <span className="block text-2xl font-black text-emerald-400 font-display">840 Successful</span>
                </motion.div>
              </div>
            </motion.div>

            {/* Right Column: Key Recovery Features */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="lg:col-span-5 space-y-6 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <h3 className="text-xl font-black text-white font-display">Key Recovery Features</h3>

                <div className="space-y-3 font-medium text-xs text-slate-300">
                  {ndrHighlights.map((feat, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ x: 6 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-emerald-500/40 hover:bg-slate-900 transition-all cursor-pointer shadow-xs group"
                    >
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
                      <span className="font-bold text-slate-100 group-hover:text-white transition-colors">{feat}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <Link to="/register" className="block pt-2">
                <Button className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300" size="md">
                  Enable NDR Workflows →
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* One Tracking Experience for Every Courier Section (Elevated Redesign) */}
      <section
        ref={trackingSectionRef}
        id="unified-tracking"
        className="py-10 sm:py-12 px-4 sm:px-8 lg:px-12 bg-slate-50 border-b border-slate-200 overflow-hidden relative"
      >

        <div className="relative w-full mx-auto space-y-8 sm:space-y-10 px-4 sm:px-8 lg:px-12">
          {/* Header Block */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-3.5 max-w-5xl mx-auto"
          >
            {/* Badge */}
            <div className="inline-block">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-extrabold border border-blue-200/80 shadow-xs">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                <Navigation className="w-3.5 h-3.5 text-blue-600" />
                <span className="uppercase tracking-wider">Unified Courier Tracking Engine</span>
              </div>
            </div>

            {/* Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight font-display text-slate-900 leading-[1.18] max-w-4xl mx-auto">
              One Tracking Experience{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
                for Every Courier
              </span>
            </h2>

            {/* Description */}
            <p className="text-sm sm:text-base md:text-lg text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto">
              Normalize status events across Delhivery, Xpressbees, Ecom Express &amp; Shadowfax into a single, beautifully branded customer tracking experience.
            </p>
          </motion.div>

          {/* Product Showcase (Left Panel, Center Connection, Right Panel) */}
          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch max-w-6xl mx-auto">
            {/* LEFT PANEL: Courier Operations Dashboard */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: 0.15 }}
              whileHover={{ y: -3 }}
              className="lg:col-span-7 bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800/90 shadow-2xl shadow-slate-900/10 space-y-6 flex flex-col justify-between relative overflow-hidden group transition-all duration-300"
            >
              <div className="space-y-6">
                {/* Header Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="font-black text-blue-400">AWB: DL1928374650</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-300 font-bold">Delhivery Express</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-blue-600/20 text-blue-300 text-[10px] font-bold border border-blue-500/30 flex items-center gap-1.5 shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" /> Live Demo Workspace
                  </span>
                </div>

                {/* Location & Delivery Info Grid */}
                <div className="grid grid-cols-2 gap-3.5 text-xs font-medium">
                  <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1">
                    <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">Current Location</span>
                    <span className="block text-slate-100 font-bold truncate">Gurugram Hub (Haryana)</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1">
                    <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">Estimated Delivery</span>
                    <span className="block text-emerald-400 font-bold font-display truncate">Tomorrow, 5:00 PM</span>
                  </div>
                </div>

                {/* Tracking Timeline List with GSAP Progress Fill Line */}
                <div className="relative space-y-4 pl-2 pt-2">
                  {/* Vertical Connecting Line Container */}
                  <div className="absolute left-[19px] top-4 bottom-4 w-0.5 z-0">
                    <div className="w-full h-full bg-slate-800 rounded-full" />
                    <div
                      ref={trackingLineProgressRef}
                      className="absolute top-0 left-0 w-full bg-gradient-to-b from-emerald-500 via-emerald-400 to-blue-500 rounded-full origin-top"
                      style={{ height: '0%' }}
                    />
                  </div>

                  {trackingTimeline.map((node, idx) => (
                    <div
                      key={idx}
                      ref={(el) => { trackingNodesRef.current[idx] = el; }}
                      className="relative z-10 flex items-center gap-4 text-xs transition-all duration-300 opacity-90"
                    >
                      {/* Icon Node */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`tracking-node-icon w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shadow-md transition-all duration-300 ${idx === 4
                              ? 'bg-blue-600 text-white ring-4 ring-blue-500/30 scale-110'
                              : idx < 4
                                ? 'bg-emerald-500 text-slate-950'
                                : 'bg-slate-800 text-slate-500'
                            }`}
                        >
                          {idx < 4 ? '✓' : idx === 4 ? '●' : ''}
                        </div>
                      </div>

                      {/* Status Text & Time */}
                      <div className="flex-1 flex items-center justify-between py-1 border-b border-slate-800/60">
                        <span className={`tracking-node-text font-extrabold ${idx === 4
                            ? 'text-blue-400 font-black'
                            : idx < 4
                              ? 'text-slate-100'
                              : 'text-slate-500'
                          }`}>
                          {node.status}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">{node.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* RIGHT PANEL: Branded Customer Tracking Page */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -3 }}
              className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xl space-y-6 flex flex-col justify-between group transition-all duration-300"
            >
              <div className="space-y-6">
                {/* Brand Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8.5 h-8.5 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center font-display shadow-md">
                      FL
                    </div>
                    <span className="text-sm font-black text-slate-900 font-display">ShipFaster Logistic Merchant Store</span>
                  </div>
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    Branded Page
                  </span>
                </div>

                {/* Main Status Highlight Box */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 15 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.35 }}
                  className="bg-blue-50/70 p-5 rounded-2xl border border-blue-100/80 text-center space-y-2 shadow-xs"
                >
                  <Package className="w-8 h-8 text-blue-600 mx-auto transition-transform duration-300 group-hover:scale-110" />
                  <h4 className="text-lg font-black text-slate-900 font-display">Your order is on the way!</h4>
                  <p className="text-xs text-slate-600 font-medium">Out for Delivery with last-mile agent</p>
                </motion.div>

                {/* Delivery Time Info */}
                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-600">Expected Delivery</span>
                  <span className="font-black text-blue-600 font-display">Tomorrow by 5 PM</span>
                </div>
              </div>

              {/* Action Link Button */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <Link to="/track" className="block">
                  <Button className="w-full justify-between group/btn" rightIcon={<ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-1" />}>
                    Explore Tracking
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Bring COD, Settlements & Billing Into One View Section (3rd Mockup Design Upgrade) */}
      <section id="finance-suite" className="py-20 sm:py-24 px-4 sm:px-8 lg:px-12 bg-slate-50 border-b border-slate-200 overflow-hidden relative">

        <div className="relative max-w-6xl mx-auto space-y-12 sm:space-y-16">
          {/* Header Block */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-3.5 max-w-5xl mx-auto"
          >
            <div className="inline-block">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-extrabold border border-blue-200/80 shadow-xs">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                <Wallet className="w-3.5 h-3.5 text-blue-600" />
                <span className="uppercase tracking-wider">Financial Operations &amp; COD Suite</span>
              </div>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-display tracking-tight leading-[1.18] max-w-4xl mx-auto">
              Bring COD, Settlements &amp; Billing{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
                Into One View
              </span>
            </h2>

            <p className="text-sm sm:text-base md:text-lg text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto">
              Gain complete financial transparency with unified COD reconciliation, automated settlement tracking, and weight dispute logs.
            </p>
          </motion.div>

          {/* TOP CARD CONTAINER: Cash On Delivery Settlement Lifecycle (Infinite Marquee Ticker) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white py-8 sm:py-10 rounded-3xl border border-slate-200/90 shadow-xl space-y-8 relative overflow-hidden backdrop-blur-xs"
          >
            {/* Background Light Beam Accents */}
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-100/50 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-blue-100/50 rounded-full blur-3xl pointer-events-none" />

            <div className="text-center px-4">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 font-display flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 opacity-60" />
                <span>CASH ON DELIVERY SETTLEMENT LIFECYCLE</span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 opacity-60" />
              </h3>
            </div>

            {/* Continuous Marquee Container */}
            <div className="relative w-full overflow-hidden py-3">
              {/* Soft Gradient Side Fades */}
              <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

              <div className="animate-infinite-marquee flex items-center gap-6 shrink-0">
                {[0, 1, 2].map((setIndex) => (
                  <div key={setIndex} className="flex items-center gap-6 shrink-0">
                    {/* Step 01 */}
                    <div className="w-64 bg-slate-50/90 p-5 rounded-2xl border border-slate-200/90 space-y-2 flex flex-col items-center text-center relative shadow-xs hover:border-blue-300 transition-all duration-300 shrink-0">
                      <span className="absolute top-3 right-3 text-[10px] font-mono font-black text-blue-600 bg-blue-100/80 px-2 py-0.5 rounded-full border border-blue-200">
                        01
                      </span>
                      <div className="w-11 h-11 rounded-2xl bg-blue-100/80 border border-blue-200/80 flex items-center justify-center text-blue-600 shadow-xs">
                        <ShoppingBag className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 font-display">COD Order</h4>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">Order placed with COD amount</p>
                      </div>
                    </div>

                    {/* Arrow 1-2 */}
                    <div className="text-blue-400 flex items-center gap-1 font-mono text-xs shrink-0">
                      <span className="text-blue-300 tracking-widest">••••••</span>
                      <ChevronRight className="w-5 h-5 text-blue-500 animate-pulse" />
                    </div>

                    {/* Step 02 */}
                    <div className="w-64 bg-emerald-50/40 p-5 rounded-2xl border border-emerald-200/60 space-y-2 flex flex-col items-center text-center relative shadow-xs hover:border-emerald-300 transition-all duration-300 shrink-0">
                      <span className="absolute top-3 right-3 text-[10px] font-mono font-black text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
                        02
                      </span>
                      <div className="w-11 h-11 rounded-2xl bg-emerald-100/80 border border-emerald-200/80 flex items-center justify-center text-emerald-600 shadow-xs">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 font-display">Delivered</h4>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">Order delivered successfully</p>
                      </div>
                    </div>

                    {/* Arrow 2-3 */}
                    <div className="text-blue-400 flex items-center gap-1 font-mono text-xs shrink-0">
                      <span className="text-blue-300 tracking-widest">••••••</span>
                      <ChevronRight className="w-5 h-5 text-blue-500 animate-pulse" />
                    </div>

                    {/* Step 03 */}
                    <div className="w-64 bg-amber-50/40 p-5 rounded-2xl border border-amber-200/60 space-y-2 flex flex-col items-center text-center relative shadow-xs hover:border-amber-300 transition-all duration-300 shrink-0">
                      <span className="absolute top-3 right-3 text-[10px] font-mono font-black text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-200">
                        03
                      </span>
                      <div className="w-11 h-11 rounded-2xl bg-amber-100/80 border border-amber-200/80 flex items-center justify-center text-amber-600 shadow-xs">
                        <DollarSign className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 font-display">COD Collected</h4>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">COD collected from customer</p>
                      </div>
                    </div>

                    {/* Arrow 3-4 */}
                    <div className="text-blue-400 flex items-center gap-1 font-mono text-xs shrink-0">
                      <span className="text-blue-300 tracking-widest">••••••</span>
                      <ChevronRight className="w-5 h-5 text-blue-500 animate-pulse" />
                    </div>

                    {/* Step 04 */}
                    <div className="w-64 bg-purple-50/40 p-5 rounded-2xl border border-purple-200/60 space-y-2 flex flex-col items-center text-center relative shadow-xs hover:border-purple-300 transition-all duration-300 shrink-0">
                      <span className="absolute top-3 right-3 text-[10px] font-mono font-black text-purple-700 bg-purple-100/80 px-2 py-0.5 rounded-full border border-purple-200">
                        04
                      </span>
                      <div className="w-11 h-11 rounded-2xl bg-purple-100/80 border border-purple-200/80 flex items-center justify-center text-purple-600 shadow-xs">
                        <RefreshCw className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 font-display">Settlement Processing</h4>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">Reconciled &amp; verified</p>
                      </div>
                    </div>

                    {/* Arrow 4-5 */}
                    <div className="text-blue-400 flex items-center gap-1 font-mono text-xs shrink-0">
                      <span className="text-blue-300 tracking-widest">••••••</span>
                      <ChevronRight className="w-5 h-5 text-blue-500 animate-pulse" />
                    </div>

                    {/* Step 05 */}
                    <div className="w-64 bg-emerald-50/40 p-5 rounded-2xl border border-emerald-200/60 space-y-2 flex flex-col items-center text-center relative shadow-xs hover:border-emerald-300 transition-all duration-300 shrink-0">
                      <span className="absolute top-3 right-3 text-[10px] font-mono font-black text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
                        05
                      </span>
                      <div className="w-11 h-11 rounded-2xl bg-emerald-100/80 border border-emerald-200/80 flex items-center justify-center text-emerald-600 shadow-xs">
                        <Building2 className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 font-display">Merchant Account</h4>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">Settled to merchant wallet</p>
                      </div>
                    </div>

                    {/* End Loop Connector */}
                    <div className="text-blue-400 flex items-center gap-1 font-mono text-xs shrink-0 pr-6">
                      <span className="text-blue-300 tracking-widest">••••••</span>
                      <ChevronRight className="w-5 h-5 text-blue-500 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* BOTTOM GRID: Merchant Financial Ledger (Left) & Reconciliation Suite (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* LEFT CARD: Merchant Financial Ledger & Trend Chart */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -3 }}
              className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xl space-y-6 flex flex-col justify-between transition-all duration-300"
            >
              <div className="space-y-6">
                {/* Ledger Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-100/80 border border-blue-200/80 flex items-center justify-center text-blue-600 shadow-xs">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-slate-900 font-display">Merchant Financial Ledger</h4>
                      <span className="text-[10px] font-mono text-slate-400">* Demo Dashboard Metrics • Financial Reconciliation Preview</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-200 flex items-center gap-1.5 shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Wallet Active
                  </span>
                </div>

                {/* Top Metrics Row */}
                <div ref={dashboardMetricsContainerRef} className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1.5 shadow-xs">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">COD Collected</span>
                    <span className="block text-xl font-black text-slate-900 font-mono">
                      <AnimatedCounter value={342850} prefix="₹" decimals={2} />
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-600">
                      <TrendingUp className="w-3 h-3" /> ▲ 12.5% vs last 7 days
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1.5 shadow-xs">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pending Settlement</span>
                    <span className="block text-xl font-black text-amber-600 font-mono">
                      <AnimatedCounter value={45200} prefix="₹" decimals={2} />
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-600">
                      <TrendingUp className="w-3 h-3" /> ▲ 8.3% vs last 7 days
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1.5 shadow-xs">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Settled Amount</span>
                    <span className="block text-xl font-black text-emerald-600 font-mono">
                      <AnimatedCounter value={297650} prefix="₹" decimals={2} />
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-600">
                      <TrendingUp className="w-3 h-3" /> ▲ 15.8% vs last 7 days
                    </span>
                  </div>
                </div>

                {/* SLA & Outstanding Balance Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1.5 shadow-xs">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">SLA Adherence</span>
                    <span className="block text-xl font-black text-emerald-600 font-display">
                      <AnimatedCounter value={98.4} suffix="%" decimals={1} />
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-600">
                      <TrendingUp className="w-3 h-3" /> ▲ 2.1% vs last 7 days
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 col-span-1 sm:col-span-2 space-y-1.5 shadow-xs flex items-center justify-between">
                    <div>
                      <span className="block text-[10px] font-bold text-blue-800 uppercase tracking-wider">Outstanding Wallet Balance</span>
                      <span className="block text-2xl font-black text-blue-700 font-mono mt-0.5">
                        <AnimatedCounter value={12480} prefix="₹" decimals={2} />
                      </span>
                      <span className="block text-[10px] text-slate-500 font-medium mt-1">Available for shipping &amp; settlements</span>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200">
                      <Wallet className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                </div>

                {/* NEW Trend Chart Component Box */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 font-display">COD Collection Trend</span>
                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg bg-white text-slate-600 border border-slate-200 shadow-2xs flex items-center gap-1">
                      Last 7 Days <ChevronDown className="w-3 h-3 text-slate-400" />
                    </span>
                  </div>

                  {/* SVG Line Chart Graph */}
                  <div className="relative h-28 w-full pt-2">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 400 90">
                      <defs>
                        <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Area Fill */}
                      <path
                        d="M 0 65 Q 65 30, 130 55 T 260 40 T 400 20 L 400 90 L 0 90 Z"
                        fill="url(#chartGlow)"
                      />

                      {/* Curved Line */}
                      <path
                        d="M 0 65 Q 65 30, 130 55 T 260 40 T 400 20"
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />

                      {/* Data Points */}
                      <circle cx="0" cy="65" r="4" fill="#ffffff" stroke="#2563eb" strokeWidth="2.5" />
                      <circle cx="66" cy="42" r="4" fill="#ffffff" stroke="#2563eb" strokeWidth="2.5" />
                      <circle cx="132" cy="55" r="4" fill="#ffffff" stroke="#2563eb" strokeWidth="2.5" />
                      <circle cx="198" cy="45" r="4" fill="#ffffff" stroke="#2563eb" strokeWidth="2.5" />
                      <circle cx="264" cy="40" r="4" fill="#ffffff" stroke="#2563eb" strokeWidth="2.5" />
                      <circle cx="330" cy="50" r="4" fill="#ffffff" stroke="#2563eb" strokeWidth="2.5" />
                      <circle cx="400" cy="20" r="4" fill="#ffffff" stroke="#2563eb" strokeWidth="2.5" />
                    </svg>

                    {/* Date X-Axis Labels */}
                    <div className="flex justify-between text-[9px] font-mono font-medium text-slate-400 pt-2 border-t border-slate-200/60">
                      <span>May 5</span>
                      <span>May 6</span>
                      <span>May 7</span>
                      <span>May 8</span>
                      <span>May 9</span>
                      <span>May 10</span>
                      <span>May 11</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* RIGHT COLUMN: Financial & Reconciliation Suite */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: 0.25 }}
              whileHover={{ y: -3 }}
              className="lg:col-span-5 space-y-6 flex flex-col justify-between transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <h3 className="text-xl font-black text-slate-900 font-display">Financial &amp; Reconciliation Suite</h3>
                </div>

                {/* 6 Feature List Cards with Descriptions & Chevron > */}
                <div className="space-y-2.5 font-medium text-xs text-slate-700">
                  {financeSuiteFeatures.map((item, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 shrink-0 group-hover:scale-110 transition-transform">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <span className="block font-black text-slate-900 font-display group-hover:text-blue-600 transition-colors">{item.title}</span>
                          <span className="block text-[11px] text-slate-500 font-medium">{item.desc}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                    </motion.div>
                  ))}
                </div>
              </div>

              <Link to="/register" className="block pt-2">
                <Button className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 transition-all duration-300 justify-center" size="md" leftIcon={<BarChart3 className="w-4 h-4" />}>
                  View Financial Reports →
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* NEW BOTTOM 4-CARD BENEFIT BANNER GRID */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4"
          >
            <div className="p-4.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3.5 hover:border-blue-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <span className="block text-xs font-black text-slate-900 font-display">100% Reconciled</span>
                <span className="block text-[11px] text-slate-500 font-medium">Automated COD reconciliation</span>
              </div>
            </div>

            <div className="p-4.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3.5 hover:border-blue-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <span className="block text-xs font-black text-slate-900 font-display">T+1 Settlement</span>
                <span className="block text-[11px] text-slate-500 font-medium">Quick settlement cycle</span>
              </div>
            </div>

            <div className="p-4.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3.5 hover:border-blue-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                <Lock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <span className="block text-xs font-black text-slate-900 font-display">Secure &amp; Compliant</span>
                <span className="block text-[11px] text-slate-500 font-medium">RBI compliant process</span>
              </div>
            </div>

            <div className="p-4.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3.5 hover:border-blue-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <span className="block text-xs font-black text-slate-900 font-display">Full Transparency</span>
                <span className="block text-[11px] text-slate-500 font-medium">End-to-end visibility</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>



      {/* Talk to Our Logistics Experts / Book a Demo Section (#contact) */}
      <section id="contact" className="py-10 sm:py-12 px-4 sm:px-8 lg:px-12 bg-slate-50 border-b border-slate-200 overflow-hidden">
        <div className="w-full mx-auto space-y-6 sm:space-y-8 px-4 sm:px-8 lg:px-12">
          <div className="text-center space-y-3.5 max-w-5xl mx-auto">
            <div className="inline-block">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-extrabold border border-blue-200/80 shadow-xs">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                <Headset className="w-3.5 h-3.5 text-blue-600" />
                <span className="uppercase tracking-wider">Sales &amp; Logistics Consultation</span>
              </div>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-display tracking-tight leading-[1.18] max-w-4xl mx-auto">
              Talk to Our{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
                Logistics Experts
              </span>
            </h2>

            <p className="text-sm sm:text-base md:text-lg text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto">
              Tell us about your shipping volume, courier requirements, or integration needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
            <div className="md:col-span-5 space-y-6">
              <h3 className="text-xl font-black text-slate-900 font-display">Corporate Support Desk</h3>

              <div className="space-y-4 text-xs font-medium">
                <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <Phone className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-bold text-slate-900 text-sm">Toll-Free Seller Support</span>
                    <span className="text-slate-600">+91 1800 123 4567 (Mon-Sat 9AM - 8PM)</span>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <Mail className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-bold text-slate-900 text-sm">Email Inquiries</span>
                    <span className="text-slate-600">support@shipfasterlogistic.com</span>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <MapPin className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-bold text-slate-900 text-sm">Gurugram Corporate Headquarters</span>
                    <span className="text-slate-600 leading-relaxed">Plot 42, Cyber City, Phase 3, Gurugram, Haryana - 122002</span>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleDemoFormSubmit} className="md:col-span-7 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-4">
              <h3 className="text-xl font-black text-slate-900 font-display">Schedule a Product Consultation</h3>

              {demoFormError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{demoFormError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={demoFullName}
                  onChange={(e) => setDemoFullName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  required
                />
                <Input
                  label="Work Email"
                  type="email"
                  value={demoWorkEmail}
                  onChange={(e) => setDemoWorkEmail(e.target.value)}
                  placeholder="e.g. rahul@brand.com"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Mobile Number"
                  type="tel"
                  value={demoMobileNumber}
                  onChange={(e) => setDemoMobileNumber(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  required
                />
                <Input
                  label="Company Name"
                  value={demoCompanyName}
                  onChange={(e) => setDemoCompanyName(e.target.value)}
                  placeholder="e.g. Acme Commerce Pvt Ltd"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Monthly Shipment Volume</label>
                  <select
                    value={demoVolume}
                    onChange={(e) => setDemoVolume(e.target.value)}
                    className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm font-medium cursor-pointer"
                  >
                    <option value="0–100">0–100</option>
                    <option value="100–500">100–500</option>
                    <option value="500–2,000">500–2,000</option>
                    <option value="2,000–10,000">2,000–10,000</option>
                    <option value="10,000+">10,000+</option>
                  </select>
                </div>

                <Input
                  label="Website (Optional)"
                  type="url"
                  value={demoWebsite}
                  onChange={(e) => setDemoWebsite(e.target.value)}
                  placeholder="e.g. https://brand.com"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Requirement / Message</label>
                <textarea
                  rows={4}
                  value={demoRequirement}
                  onChange={(e) => setDemoRequirement(e.target.value)}
                  className="w-full glass-input rounded-xl p-3.5 text-sm font-medium"
                  placeholder="Tell us about your current courier stack, pain points, or custom API requirements..."
                  required
                />
              </div>

              <Button type="submit" size="md" className="w-full shadow-md justify-center" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Book a Demo →
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Auth Required Modal when clicking Compare Courier Rates */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-6 relative text-center"
            >
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
                aria-label="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
                <Lock className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 font-display">Sign In Required</h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Sign in or create a free ShipFaster Logistic account to compare live courier freight rates across Delhivery, Xpressbees, Ecom Express &amp; Shadowfax.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold flex justify-around text-slate-700">
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase font-sans">Route</span>
                  <span>{calcPickup} &rarr; {calcDelivery}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase font-sans">Chargeable Weight</span>
                  <span className="text-blue-600">{calculatedChargeable} kg</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Link to="/login" className="block">
                  <Button size="lg" className="w-full justify-center shadow-md">
                    Sign In to Account
                  </Button>
                </Link>
                <Link to="/register" className="block">
                  <Button variant="outline" size="lg" className="w-full justify-center">
                    Create Free Account &rarr;
                  </Button>
                </Link>
              </div>

              <p className="text-[10px] text-slate-400 font-medium">
                Free account • Instant access • Zero monthly subscription fees
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sticky Mobile Floating Conversion CTA Bar */}
      <div className="sm:hidden fixed bottom-4 left-4 right-4 z-40 bg-slate-950/95 backdrop-blur-md p-3 rounded-2xl border border-slate-800 shadow-2xl flex items-center justify-between text-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-xs shadow-xs">
            <Truck className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="block text-xs font-black text-white font-display">ShipFaster Logistic</span>
            <span className="block text-[10px] text-slate-400 font-semibold">Rates from ₹28/500g</span>
          </div>
        </div>
        <Link to="/register">
          <button className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-lg shadow-blue-600/30 flex items-center gap-1.5 cursor-pointer">
            <span>Start Shipping</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </Link>
      </div>

      <PublicFooter />
    </div>
  );
};
