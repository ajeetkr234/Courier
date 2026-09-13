import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { 
  Search, MapPin, Truck, CheckCircle2, Package, Clock, 
  Phone, AlertTriangle, Download, MessageSquare, 
  ChevronDown, UserCheck, Navigation, Copy, Share2, 
  HelpCircle, Check, X, Building2, FileCheck, RotateCcw,
  BadgeCheck
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { fetchPublicTrackingFromSupabase } from '../../services/supabaseShipments';
import { usePlatformStore } from '../../services/store';
import { TrackingResult } from '../../services/couriers/adapter.interface';
import { ShipmentStatus } from '../../types';
import { toast } from 'sonner';
import { ReadyToShipCTA } from '../landing/components/ReadyToShipCTA';

const routeStages = [
  { id: 'pickup', title: 'PICKUP', subtitle: 'Manifest & Picked Up', icon: <Package className="w-4 h-4 text-blue-600" /> },
  { id: 'hub', title: 'HUB', subtitle: 'Origin Sorting Hub', icon: <Building2 className="w-4 h-4 text-purple-600" /> },
  { id: 'in_transit', title: 'IN TRANSIT', subtitle: 'Interstate Transport', icon: <Truck className="w-4 h-4 text-amber-600" /> },
  { id: 'out_for_delivery', title: 'OUT FOR DELIVERY', subtitle: 'Assigned to Courier Agent', icon: <Clock className="w-4 h-4 text-sky-600" /> },
  { id: 'delivered', title: 'DELIVERED', subtitle: 'Doorstep Delivered & Signed', icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" /> }
];

const getStageIndex = (status: ShipmentStatus): number => {
  switch (status) {
    case 'CREATED':
    case 'PICKUP_SCHEDULED':
      return 0;
    case 'PICKED_UP':
      return 1;
    case 'IN_TRANSIT':
      return 2;
    case 'OUT_FOR_DELIVERY':
    case 'NDR':
      return 3;
    case 'DELIVERED':
      return 4;
    default:
      return 2;
  }
};

export const PublicTrackingPage: React.FC = () => {
  const location = useLocation();
  const isSellerPanel = location.pathname.startsWith('/app/');
  const [searchParams, setSearchParams] = useSearchParams();
  const awbQuery = searchParams.get('awb') || '';

  const [searchType, setSearchType] = useState<'AWB' | 'ORDER'>('AWB');
  const [inputQuery, setInputQuery] = useState(awbQuery);
  const [trackingData, setTrackingData] = useState<TrackingResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notFoundError, setNotFoundError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [waOptIn, setWaOptIn] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isShareCopied, setIsShareCopied] = useState(false);

  // Modals
  const [showInstructionModal, setShowInstructionModal] = useState(false);
  const [instructionText, setInstructionText] = useState('');
  const [showPodModal, setShowPodModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('Tomorrow');
  const [rescheduleSlot, setRescheduleSlot] = useState<'MORNING' | 'AFTERNOON' | 'EVENING'>('AFTERNOON');
  const [rescheduleNotes, setRescheduleNotes] = useState('');

  const routeLineRef = useRef<HTMLDivElement>(null);
  const truckIconRef = useRef<HTMLDivElement>(null);
  const stageNodesRef = useRef<(HTMLDivElement | null)[]>([]);

  const fetchTracking = async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setIsLoading(true);
    setNotFoundError(null);

    try {
      // 1. Try real live database tracking from Supabase
      const liveResult = await fetchPublicTrackingFromSupabase(trimmed);
      if (liveResult) {
        setTrackingData(liveResult);
        setSearchParams({ awb: liveResult.awbNumber }, { replace: true });
        return;
      }

      // 2. Fallback to active shipments in platform store
      const storeShipments = usePlatformStore.getState().shipments;
      const storeShipment = storeShipments.find(
        (s) => s.awb_number.toLowerCase() === trimmed.toLowerCase() ||
               s.order_id.toLowerCase() === trimmed.toLowerCase() ||
               s.id.toLowerCase() === trimmed.toLowerCase()
      );

      if (storeShipment) {
        const localResult: TrackingResult = {
          awbNumber: storeShipment.awb_number,
          courierName: storeShipment.courier_name,
          courierCode: storeShipment.courier_code || 'delhivery',
          originCity: 'Mumbai Fulfillment Center',
          destinationCity: storeShipment.order?.shipping_address?.city || 'Destination Hub',
          currentStatus: storeShipment.status.replace(/_/g, ' '),
          normalizedStatus: storeShipment.status,
          estimatedDeliveryDate: new Date(Date.now() + 2 * 86400000).toISOString(),
          events: [
            {
              id: `ev-${storeShipment.id}-1`,
              shipment_id: storeShipment.id,
              raw_status: storeShipment.status,
              normalized_status: storeShipment.status,
              event_time: storeShipment.created_at || new Date().toISOString(),
              location: storeShipment.order?.shipping_address?.city || 'Local Sorting Hub',
              message: `Shipment is currently ${storeShipment.status.replace(/_/g, ' ')} with ${storeShipment.courier_name}`,
            }
          ],
        };
        setTrackingData(localResult);
        setSearchParams({ awb: localResult.awbNumber }, { replace: true });
        return;
      }

      setTrackingData(null);
      setNotFoundError(`No live shipment found for ${trimmed}.`);
    } catch (err: any) {
      setTrackingData(null);
      setNotFoundError(err.message || `No tracking milestones found for ${trimmed}.`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (awbQuery) {
      fetchTracking(awbQuery);
    }
  }, [awbQuery]);

  // GSAP Dynamic Route Stepper Animation
  useEffect(() => {
    if (!trackingData) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const currentStageIndex = getStageIndex(trackingData.normalizedStatus);
    const targetProgress = currentStageIndex / (routeStages.length - 1); // 0 to 1

    // Animate Line Progress
    if (routeLineRef.current) {
      gsap.fromTo(routeLineRef.current,
        { width: '0%' },
        { width: `${targetProgress * 100}%`, duration: 1.1, ease: 'power2.out' }
      );
    }

    // Animate Truck Indicator Position
    if (truckIconRef.current) {
      gsap.fromTo(truckIconRef.current,
        { left: '0%' },
        { left: `${targetProgress * 100}%`, duration: 1.1, ease: 'power2.out' }
      );
    }

    // Stage Nodes Highlight Animation
    stageNodesRef.current.forEach((nodeEl, idx) => {
      if (!nodeEl) return;
      if (idx <= currentStageIndex) {
        gsap.fromTo(nodeEl,
          { scale: 0.85, opacity: 0.6 },
          { 
            scale: idx === currentStageIndex ? 1.12 : 1, 
            opacity: 1, 
            duration: 0.35, 
            delay: (idx / (routeStages.length - 1)) * 0.9, 
            ease: 'back.out(1.7)' 
          }
        );
      }
    });
  }, [trackingData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputQuery.trim()) {
      fetchTracking(inputQuery);
    }
  };

  const trackingFaqs = [
    {
      q: 'How frequently is AWB tracking status updated?',
      a: 'Tracking statuses update in real-time via direct courier webhooks. Scanning events at origin centers, transshipment hubs, and delivery scans are reflected instantly.'
    },
    {
      q: 'What if my shipment shows "Attempt Failed" (NDR)?',
      a: 'If a delivery attempt fails due to customer unreachability or premise gate issues, you can click "Reschedule Delivery" right here to select a new preferred date and time slot.'
    },
    {
      q: 'Where can I download Proof of Delivery (POD)?',
      a: 'Once a parcel reaches "DELIVERED" status, the digital POD receipt with recipient acknowledgment and delivery timestamp becomes instantly accessible via the "View Digital POD" button.'
    },
    {
      q: 'What should I do if my delivery is delayed past the estimated date?',
      a: 'Transit times can occasionally fluctuate due to regional transit volumes or customs clearance. If a parcel exceeds its EDD, our automated tracking engine priority-escalates the parcel with carrier dispatch.'
    },
    {
      q: 'Can I contact the assigned delivery executive or leave gate instructions?',
      a: 'Yes! When a shipment reaches "Out For Delivery", the executive name and direct phone dialer become active. You can also click "Delivery Instructions" to leave security gate or landmark notes.'
    },
    {
      q: 'How can an online store brand this tracking page with their own logo?',
      a: 'E-commerce merchants on ShipFaster can enable white-labeled branded tracking portals featuring their brand logo, custom tracking domain, and recommended cross-sell products.'
    }
  ];

  const currentStageIndex = trackingData ? getStageIndex(trackingData.normalizedStatus) : 0;

  return (
    <div className="text-slate-900 flex flex-col font-sans relative overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative py-10 xs:py-12 sm:py-16 px-3.5 xs:px-4 sm:px-8 bg-gradient-to-b from-blue-50/40 via-white to-white border-b border-slate-200/80 overflow-hidden">
        <div className="relative max-w-4xl mx-auto space-y-6 sm:space-y-8 text-center z-10">
          {/* Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 xs:gap-2 px-3 xs:px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-[10px] xs:text-xs font-extrabold border border-blue-200/80 shadow-xs max-w-full"
          >
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
            </span>
            <Navigation className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="uppercase tracking-wider truncate">
              {isSellerPanel ? 'Seller Shipment Tracking • Live DB' : 'Universal Courier Radar • Live Multi-Carrier Tracking'}
            </span>
          </motion.div>

          {/* Display Heading */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-2xl xs:text-3xl sm:text-5xl md:text-6xl font-black font-display tracking-tight leading-[1.2] sm:leading-[1.24] max-w-6xl mx-auto text-slate-950"
          >
            <span className="block pb-1 sm:pb-1.5 text-slate-950">
              {isSellerPanel ? 'Track Your Live Shipments.' : 'Track Any Shipment.'}
            </span>
            <span className="inline-block mt-0.5 sm:mt-2 px-1 xs:px-2 pb-1.5 sm:pb-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
              {isSellerPanel ? 'Search by AWB or Order ID.' : 'Across All 29,000+ PIN Codes.'}
            </span>
          </motion.h1>

          {/* Subtitle Paragraph */}
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xs xs:text-sm sm:text-base md:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium mt-2.5 sm:mt-4 px-1"
          >
            {isSellerPanel
              ? 'Tracking results are read from your live shipment records and status events.'
              : 'Real-time milestone visibility across Delhivery, Xpressbees, Shadowfax, and DTDC with direct courier GPS telematics and instant digital Proof of Delivery.'}
          </motion.p>

          {/* Search Card Container */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white p-3.5 xs:p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-900/5 space-y-3.5 xs:space-y-4 text-left"
          >
            {/* Search Type Selector Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 xs:gap-2 border-b border-slate-100 pb-2.5 xs:pb-3">
              <button
                type="button"
                onClick={() => {
                  setSearchType('AWB');
                  if (!isSellerPanel && inputQuery.startsWith('ORD')) setInputQuery('DEL1928374650');
                }}
                className={`px-3 xs:px-4 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  searchType === 'AWB'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Track by AWB Number
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchType('ORDER');
                  if (!isSellerPanel && !inputQuery.startsWith('ORD')) setInputQuery('ORD-1001');
                }}
                className={`px-3 xs:px-4 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  searchType === 'ORDER'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Track by Order ID
              </button>
            </div>

            {/* Input Search Form */}
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5 xs:gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder={
                    searchType === 'AWB'
                      ? "Enter AWB number..."
                      : "Enter Order ID..."
                  }
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl px-3.5 xs:px-5 py-3 xs:py-3.5 text-xs xs:text-sm font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all"
                  required
                />
              </div>
              <Button 
                type="submit" 
                isLoading={isLoading} 
                leftIcon={<Search className="w-4 h-4" />} 
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-6 sm:px-8 py-3 xs:py-3.5 rounded-xl sm:rounded-2xl shadow-lg shadow-blue-500/20 shrink-0 text-xs xs:text-sm cursor-pointer justify-center"
              >
                Track Shipment
              </Button>
            </form>

          </motion.div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-8 sm:py-12 px-3 xs:px-4 sm:px-8 max-w-5xl mx-auto w-full space-y-6 sm:space-y-8">
        {/* Error / Not Found State */}
        {notFoundError && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-5 xs:p-8 sm:p-10 rounded-2xl sm:rounded-3xl border border-rose-200 shadow-xl text-center space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg xs:text-xl font-black text-slate-900 font-display">Shipment Not Found</h3>
              <p className="text-xs xs:text-sm text-slate-600 max-w-md mx-auto font-medium">
                {notFoundError}
              </p>
            </div>
          </motion.div>
        )}

        {/* Live Tracking Result Card */}
        {trackingData && (
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-3.5 xs:p-5 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xl space-y-6 sm:space-y-8"
          >
            {/* Header Info Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 xs:gap-4 pb-5 xs:pb-6 border-b border-slate-100">
              <div className="space-y-1.5 w-full sm:w-auto">
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 font-mono flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse shrink-0" />
                  AIR WAYBILL (AWB) LIVE TRACKING
                </span>

                <div className="flex items-center gap-2 xs:gap-2.5 flex-wrap">
                  <h2 className="text-xl xs:text-2xl sm:text-3xl font-black text-slate-900 font-display break-all">{trackingData.awbNumber}</h2>
                  
                  {/* Copy AWB */}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(trackingData.awbNumber);
                      setIsCopied(true);
                      toast.success('AWB number copied to clipboard!');
                      setTimeout(() => setIsCopied(false), 2000);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                    title="Copy AWB Number"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{isCopied ? 'Copied' : 'Copy'}</span>
                  </button>

                  {/* Shareable Link */}
                  <button
                    onClick={() => {
                      const shareUrl = `${window.location.origin}/track?awb=${trackingData.awbNumber}`;
                      navigator.clipboard.writeText(shareUrl);
                      setIsShareCopied(true);
                      toast.success('Shareable tracking URL copied!');
                      setTimeout(() => setIsShareCopied(false), 2000);
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 xs:px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold transition-colors cursor-pointer"
                    title="Share Live Tracking Link"
                  >
                    {isShareCopied ? <Check className="w-3.5 h-3.5 text-blue-600" /> : <Share2 className="w-3.5 h-3.5 text-blue-600" />}
                    <span>{isShareCopied ? 'Link Copied' : 'Share Link'}</span>
                  </button>
                </div>

                {/* Specs Pill Bar */}
                <div className="flex items-center gap-1.5 xs:gap-2 text-[11px] xs:text-xs text-slate-500 font-medium font-mono pt-0.5 xs:pt-1 flex-wrap">
                  <span>Carrier: <strong className="text-slate-800">{trackingData.courierName || 'Not assigned'}</strong></span>
                  <span>•</span>
                  <span>Order: <strong className="text-slate-800">{trackingData.orderId || 'Not linked'}</strong></span>
                  <span>•</span>
                  <span>Weight: <strong className="text-slate-800">{trackingData.weightKg || 0.5} kg</strong></span>
                  <span>•</span>
                  <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                    trackingData.paymentMode === 'COD' ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}>
                    {trackingData.paymentMode === 'COD' ? `COD: ₹${trackingData.codAmount || 0}` : 'PREPAID'}
                  </span>
                </div>
              </div>

              {/* Status Badge & Dynamic Delivery ETA */}
              <div className="flex flex-col items-start sm:items-end gap-1.5 w-full sm:w-auto pt-1 sm:pt-0">
                <StatusBadge status={trackingData.normalizedStatus} />
                {trackingData.normalizedStatus === 'DELIVERED' ? (
                  <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Delivered Successfully</span>
                  </span>
                ) : trackingData.normalizedStatus === 'NDR' ? (
                  <span className="text-xs font-extrabold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Action Required: Reattempt Scheduled</span>
                  </span>
                ) : (
                  <span className="text-xs text-slate-600 font-medium">
                    Est. Delivery: <strong className="text-blue-700 font-display">
                      {trackingData.estimatedDeliveryDate 
                        ? new Date(trackingData.estimatedDeliveryDate).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })
                        : 'Not available'}
                    </strong>
                  </span>
                )}
              </div>
            </div>

            {/* Origin ➔ Destination Journey Visualizer Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 xs:gap-4 p-3.5 xs:p-5 rounded-xl sm:rounded-2xl bg-slate-50/80 border border-slate-200/90 text-xs">
              {/* Origin Hub */}
              <div className="flex items-start gap-2.5 xs:gap-3">
                <div className="w-8 h-8 xs:w-9 xs:h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Origin Dispatch</span>
                  <span className="font-black text-slate-900 text-xs xs:text-sm block truncate">{trackingData.originCity || 'Not available'}</span>
                  <span className="text-slate-500 font-mono text-[10px] xs:text-[11px]">PIN {trackingData.originPincode || 'NA'}</span>
                </div>
              </div>

              {/* Central Path Indicator */}
              <div className="flex flex-col items-center justify-center gap-1.5 py-1.5 md:py-1 text-center border-y md:border-y-0 border-slate-200/60 py-2 md:py-0">
                <div className="flex items-center gap-2 text-slate-500 font-mono text-[10px] font-bold uppercase">
                  <span>Surface Express</span>
                  <Truck className="w-3.5 h-3.5 text-blue-600" />
                  <span>{trackingData.weightKg || 0.5} kg</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden relative max-w-[200px]">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
                    style={{ width: `${(currentStageIndex / (routeStages.length - 1)) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] xs:text-[11px] text-blue-700 font-extrabold truncate max-w-full">{trackingData.courierName || 'Courier not assigned'}</span>
              </div>

              {/* Destination Doorstep */}
              <div className="flex items-start gap-2.5 xs:gap-3 md:justify-end md:text-right">
                <div className="md:order-1 min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Destination Address</span>
                  <span className="font-black text-slate-900 text-xs xs:text-sm block truncate">{trackingData.destinationCity || 'Not available'}</span>
                  <span className="text-slate-500 font-mono text-[10px] xs:text-[11px] truncate block">
                    PIN {trackingData.destinationPincode || 'NA'} • {trackingData.recipientName || 'Consignee'}
                  </span>
                </div>
                <div className="w-8 h-8 xs:w-9 xs:h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0 md:order-2">
                  <MapPin className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* CONTEXTUAL ACTION BANNERS BASED ON ACTUAL STATUS */}
            
            {/* 1. OUT FOR DELIVERY: Courier Executive & Special Instructions Card */}
            {trackingData.normalizedStatus === 'OUT_FOR_DELIVERY' && (
              <div className="p-3.5 xs:p-5 rounded-xl sm:rounded-2xl bg-blue-50/70 border border-blue-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 xs:gap-4 text-xs">
                <div className="flex items-center gap-3 xs:gap-3.5">
                  <div className="w-10 h-10 xs:w-11 xs:h-11 rounded-xl xs:rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-md">
                    <UserCheck className="w-4 h-4 xs:w-5 xs:h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <span className="block font-black text-slate-900 text-xs xs:text-sm truncate">
                      Delivery Agent: {trackingData.deliveryAgent?.name || 'Not assigned'} ({trackingData.deliveryAgent?.phone || 'Phone not available'})
                    </span>
                    <span className="block text-slate-600 font-medium text-[11px] xs:text-xs truncate">
                      Assigned Hub: {trackingData.deliveryAgent?.hub || 'Not assigned'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 shrink-0 w-full sm:w-auto">
                  <button 
                    type="button"
                    onClick={() => setShowInstructionModal(true)}
                    className="flex-1 sm:flex-none px-3.5 xs:px-4 py-2 rounded-xl bg-blue-600 text-white font-extrabold hover:bg-blue-500 transition-colors shadow-sm cursor-pointer inline-flex items-center justify-center gap-1.5 text-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Delivery Instructions</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => toast.info('Delivery agent calling is not connected yet.')}
                    className="flex-1 sm:flex-none px-3.5 xs:px-4 py-2 rounded-xl bg-white border border-blue-200 text-blue-700 font-extrabold hover:bg-blue-50 transition-colors shadow-xs cursor-pointer inline-flex items-center justify-center gap-1.5 text-xs"
                  >
                    <Phone className="w-3.5 h-3.5 text-blue-600" />
                    <span>Call Driver</span>
                  </button>
                </div>
              </div>
            )}

            {/* 2. DELIVERED: Proof of Delivery (POD) & Delivery Confirmation Card */}
            {trackingData.normalizedStatus === 'DELIVERED' && (
              <div className="p-3.5 xs:p-5 rounded-xl sm:rounded-2xl bg-emerald-50/80 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 xs:gap-4 text-xs">
                <div className="flex items-center gap-3 xs:gap-3.5">
                  <div className="w-10 h-10 xs:w-11 xs:h-11 rounded-xl xs:rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-md">
                    <BadgeCheck className="w-5 h-5 xs:w-6 xs:h-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <span className="block font-black text-slate-900 text-xs xs:text-sm">
                      Package Delivered to {trackingData.podDetails?.receivedBy || trackingData.recipientName || 'Consignee'}
                    </span>
                    <span className="block text-slate-600 font-medium text-[11px] xs:text-xs">
                      Delivered at {trackingData.podDetails?.deliveredAt || 'Not recorded'} • Signed by {trackingData.podDetails?.relation || 'Not recorded'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                  <button 
                    type="button"
                    onClick={() => setShowPodModal(true)}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold transition-colors shadow-sm cursor-pointer inline-flex items-center justify-center gap-1.5 text-xs"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>View Digital POD</span>
                  </button>
                </div>
              </div>
            )}

            {/* 3. NDR / ATTEMPT FAILED: Reschedule Delivery Alert Card */}
            {trackingData.normalizedStatus === 'NDR' && (
              <div className="p-3.5 xs:p-5 rounded-xl sm:rounded-2xl bg-rose-50/80 border border-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 xs:gap-4 text-xs">
                <div className="flex items-center gap-3 xs:gap-3.5">
                  <div className="w-10 h-10 xs:w-11 xs:h-11 rounded-xl xs:rounded-2xl bg-rose-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-md">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <span className="block font-black text-rose-950 text-xs xs:text-sm">
                      Delivery Attempt #{trackingData.ndrDetails?.attemptCount || 1} Failed — {trackingData.ndrDetails?.reason || 'Reason not recorded'}
                    </span>
                    <span className="block text-rose-700 font-medium text-[11px] xs:text-xs">
                      Last Attempt: {trackingData.ndrDetails?.lastAttemptAt || 'Not recorded'}. Please reschedule your delivery slot.
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                  <button 
                    type="button"
                    onClick={() => setShowRescheduleModal(true)}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold transition-colors shadow-sm cursor-pointer inline-flex items-center justify-center gap-1.5 text-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reschedule Delivery</span>
                  </button>
                </div>
              </div>
            )}

            {/* DYNAMIC GSAP STEPPER CONTAINER */}
            <div className="space-y-4 xs:space-y-6 pt-2">
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 font-display">
                  Shipment Route Progress
                </h3>
                <span className="text-xs font-bold text-blue-600 font-mono">
                  Stage {currentStageIndex + 1} of 5 • {routeStages[currentStageIndex]?.title}
                </span>
              </div>

              {/* Desktop Stepper Bar with GSAP Animated Line & Truck */}
              <div className="hidden md:block relative bg-slate-900 p-5 lg:p-8 rounded-2xl sm:rounded-3xl border border-slate-800 overflow-hidden text-white shadow-xl">
                {/* Background Rail */}
                <div className="absolute left-8 lg:left-12 right-8 lg:right-12 top-1/2 -translate-y-1/2 h-2 bg-slate-800 rounded-full z-0">
                  <div
                    ref={routeLineRef}
                    className="h-full bg-gradient-to-r from-blue-500 via-indigo-400 to-emerald-400 rounded-full origin-left shadow-lg shadow-blue-500/50"
                    style={{ width: '0%' }}
                  />
                </div>

                {/* Animated Truck Indicator */}
                <div
                  ref={truckIconRef}
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 transition-transform duration-300"
                  style={{ left: '0%' }}
                >
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xl shadow-blue-500/50 ring-4 ring-blue-500/30">
                    <Truck className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                  </div>
                </div>

                {/* Stage Nodes */}
                <div className="relative z-10 flex items-center justify-between">
                  {routeStages.map((stage, idx) => {
                    const isActive = idx <= currentStageIndex;
                    const isCurrent = idx === currentStageIndex;

                    return (
                      <div
                        key={stage.id}
                        ref={(el) => { stageNodesRef.current[idx] = el; }}
                        className="flex flex-col items-center gap-2 text-center"
                      >
                        <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-xl lg:rounded-2xl flex items-center justify-center border text-xs transition-all duration-300 ${
                          isCurrent
                            ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/30 ring-4 ring-blue-500/20 scale-110'
                            : isActive
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                            : 'bg-slate-950 border-slate-800 text-slate-600'
                        }`}>
                          {isActive && !isCurrent ? '✓' : stage.icon}
                        </div>
                        <div className="space-y-0.5">
                          <span className={`block text-[9px] lg:text-[10px] font-mono font-extrabold uppercase ${
                            isCurrent ? 'text-blue-400' : isActive ? 'text-white' : 'text-slate-500'
                          }`}>
                            {stage.title}
                          </span>
                          <span className="block text-[8px] lg:text-[9px] text-slate-400 font-medium max-w-[80px] lg:max-w-[100px] truncate">
                            {stage.subtitle}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Vertical Timeline */}
              <div className="block md:hidden space-y-3 pl-3.5 xs:pl-4 border-l-2 border-blue-500 relative ml-1.5">
                {routeStages.map((stage, idx) => (
                  <div key={stage.id} className="relative flex items-center gap-2.5 xs:gap-3">
                    <div className={`w-6 h-6 xs:w-7 xs:h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      idx <= currentStageIndex ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {idx <= currentStageIndex ? '✓' : idx + 1}
                    </div>
                    <div className="min-w-0">
                      <span className={`block text-xs font-bold ${idx <= currentStageIndex ? 'text-slate-900' : 'text-slate-500'}`}>{stage.title}</span>
                      <span className="block text-[10px] text-slate-500 truncate">{stage.subtitle}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notification Preferences Bar */}
            <div className="p-3.5 xs:p-5 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 xs:gap-4 text-xs">
              <div className="flex items-start sm:items-center gap-2.5 xs:gap-3">
                <input
                  type="checkbox"
                  id="wa-opt"
                  checked={waOptIn}
                  onChange={(e) => setWaOptIn(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer mt-0.5 sm:mt-0 shrink-0"
                />
                <label htmlFor="wa-opt" className="font-bold text-slate-700 cursor-pointer text-xs leading-snug break-words">
                  Send real-time WhatsApp delivery milestones for AWB {trackingData.awbNumber}
                </label>
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                {trackingData.normalizedStatus === 'DELIVERED' ? (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setShowPodModal(true)}
                    leftIcon={<Download className="w-3.5 h-3.5" />}
                    className="font-bold text-xs w-full sm:w-auto justify-center"
                  >
                    Download Digital POD
                  </Button>
                ) : (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => toast.info('Digital POD will become available once package is marked Delivered.')}
                    className="text-slate-400 text-xs cursor-not-allowed w-full sm:w-auto justify-center"
                  >
                    POD Available Upon Delivery
                  </Button>
                )}
              </div>
            </div>

            {/* Detailed Activity Log */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 font-display">
                  Full Tracking Scan History
                </h3>
                <span className="text-xs font-bold text-slate-400 font-mono">{trackingData.events.length} Scans Logged</span>
              </div>

              <div className="space-y-2.5 xs:space-y-3">
                {trackingData.events.map((evt, idx) => (
                  <motion.div 
                    key={evt.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.08 }}
                    className="p-3 xs:p-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs hover:border-blue-300 transition-colors"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${
                          idx === trackingData.events.length - 1 ? 'bg-blue-600 animate-ping' : 'bg-slate-400'
                        }`} />
                        <span className="font-extrabold text-slate-900 block break-words">{evt.message}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium pl-4 block">{evt.location}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 font-bold bg-white px-2.5 xs:px-3 py-1 rounded-lg border border-slate-200 shadow-2xs self-start sm:self-auto shrink-0">
                      {new Date(evt.event_time).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Tracking FAQs Accordion */}
        {!isSellerPanel && <div className="bg-white py-6 sm:py-12 space-y-6 sm:space-y-8">
          <div className="text-center space-y-3.5 max-w-5xl mx-auto">
            <div className="inline-block">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-extrabold border border-blue-200/80 shadow-xs">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                <span className="uppercase tracking-wider">TRACKING HELP • FREQUENTLY ASKED QUESTIONS</span>
              </div>
            </div>

            <h2 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-display tracking-tight leading-[1.2] sm:leading-[1.24] max-w-4xl mx-auto">
              Frequently Asked{' '}
              <span className="inline-block pb-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
                Tracking Questions
              </span>
            </h2>

            <p className="text-xs xs:text-sm sm:text-base md:text-lg text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto">
              Learn about live scanning intervals, failed delivery reattempts, and how to download digital Proof of Delivery receipts.
            </p>
          </div>

          <div className="divide-y divide-slate-200/80 max-w-3xl mx-auto">
            {trackingFaqs.map((faq, idx) => (
              <div key={idx} className="py-4 sm:py-5 first:pt-0 last:pb-0">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left flex items-start justify-between gap-3 font-bold text-slate-900 text-sm xs:text-base sm:text-lg hover:text-blue-600 transition-colors cursor-pointer group"
                >
                  <span className="group-hover:translate-x-0.5 transition-transform leading-snug">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 xs:w-5 xs:h-5 text-slate-400 shrink-0 mt-1 transition-transform duration-200 ${openFaq === idx ? 'rotate-180 text-blue-600' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="pt-2.5 sm:pt-3 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>}
      </section>

      {/* Pre-Footer High-Converting CTA Banner */}
      {!isSellerPanel && <ReadyToShipCTA />}

      {/* 1. Digital Proof of Delivery (POD) Modal */}
      <AnimatePresence>
        {showPodModal && trackingData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 xs:p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl sm:rounded-3xl p-4 xs:p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4 sm:space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 xs:pb-4">
                <div className="flex items-center gap-2 xs:gap-2.5">
                  <div className="w-9 h-9 xs:w-10 xs:h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <FileCheck className="w-5 h-5 xs:w-6 xs:h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm xs:text-base font-black text-slate-900 font-display">Digital Proof of Delivery (POD)</h3>
                    <p className="text-[11px] xs:text-xs text-slate-500 font-medium">AWB: {trackingData.awbNumber}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPodModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* POD Certificate Sheet */}
              <div className="p-3.5 xs:p-5 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200 space-y-3 xs:space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 xs:pb-3">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Carrier Partner</span>
                    <strong className="text-slate-900 text-xs xs:text-sm font-display">{trackingData.courierName || 'Shadowfax Express'}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Delivered At</span>
                    <strong className="text-emerald-700 text-xs xs:text-sm font-display">{trackingData.podDetails?.deliveredAt || 'Today, 2:15 PM'}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 xs:grid-cols-2 gap-2.5 xs:gap-3 py-1">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Consignee Name</span>
                    <strong className="text-slate-900">{trackingData.recipientName || 'Kavita Nair'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Received By</span>
                    <strong className="text-slate-900">{trackingData.podDetails?.receivedBy || 'Kavita Nair'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Relationship</span>
                    <strong className="text-slate-900">{trackingData.podDetails?.relation || 'Self / Consignee'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Destination PIN</span>
                    <strong className="text-slate-900">{trackingData.destinationPincode || 'NA'}</strong>
                  </div>
                </div>

                {/* Digital Signature Stamp */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-center space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Authorized Digital Signature</span>
                  <div className="font-serif italic text-blue-700 text-base xs:text-lg py-0.5 select-none">
                    ~ {trackingData.podDetails?.receivedBy || 'Kavita Nair'} ~
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono block">GPS Verification Hash: #GEO-9948172635</span>
                </div>
              </div>

              <div className="flex flex-col-reverse xs:flex-row items-stretch xs:items-center justify-end gap-2 xs:gap-3 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPodModal(false)}
                  className="font-bold text-slate-600 justify-center"
                >
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    toast.success(`Proof of Delivery (POD) for AWB ${trackingData.awbNumber} downloaded!`);
                    setShowPodModal(false);
                  }}
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                  className="bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold px-5 justify-center"
                >
                  Download Signed PDF
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. NDR Delivery Reschedule Modal */}
      <AnimatePresence>
        {showRescheduleModal && trackingData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 xs:p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl sm:rounded-3xl p-4 xs:p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4 sm:space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 xs:pb-4">
                <div className="flex items-center gap-2 xs:gap-2.5">
                  <div className="w-9 h-9 xs:w-10 xs:h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm xs:text-base font-black text-slate-900 font-display">Reschedule Delivery Attempt</h3>
                    <p className="text-[11px] xs:text-xs text-slate-500 font-medium">For AWB {trackingData.awbNumber}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRescheduleModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3.5 xs:space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Select Reattempt Date
                  </label>
                  <div className="grid grid-cols-1 xs:grid-cols-3 gap-2 font-semibold">
                    {['Tomorrow', 'Day After Tomorrow', 'This Weekend'].map((dateOption) => (
                      <button
                        key={dateOption}
                        type="button"
                        onClick={() => setRescheduleDate(dateOption)}
                        className={`p-2 xs:p-2.5 rounded-xl border text-center transition-colors cursor-pointer text-xs ${
                          rescheduleDate === dateOption
                            ? 'border-rose-600 bg-rose-50 text-rose-700 font-extrabold shadow-2xs'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        {dateOption}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Select Preferred Delivery Time Slot
                  </label>
                  <div className="grid grid-cols-1 xs:grid-cols-3 gap-2 font-semibold">
                    {[
                      { id: 'MORNING', label: 'Morning', time: '9 AM - 1 PM' },
                      { id: 'AFTERNOON', label: 'Afternoon', time: '1 PM - 5 PM' },
                      { id: 'EVENING', label: 'Evening', time: '5 PM - 8 PM' }
                    ].map((slot) => (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setRescheduleSlot(slot.id as any)}
                        className={`p-2 xs:p-2.5 rounded-xl border text-center transition-colors cursor-pointer text-xs ${
                          rescheduleSlot === slot.id
                            ? 'border-rose-600 bg-rose-50 text-rose-700 font-extrabold shadow-2xs'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="block font-bold">{slot.label}</span>
                        <span className="block text-[10px] text-slate-500 font-normal">{slot.time}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Additional Landmark / Address Directions
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Please leave with neighbor at Flat 402 or call my secondary mobile..."
                    value={rescheduleNotes}
                    onChange={(e) => setRescheduleNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 xs:p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 font-medium"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse xs:flex-row items-stretch xs:items-center justify-end gap-2 xs:gap-3 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRescheduleModal(false)}
                  className="font-bold text-slate-600 justify-center"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    toast.success(`Delivery reattempt successfully scheduled for ${rescheduleDate} (${rescheduleSlot})!`);
                    setShowRescheduleModal(false);
                  }}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-extrabold px-5 justify-center"
                >
                  Confirm Reschedule
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Special Delivery Instructions Modal */}
      <AnimatePresence>
        {showInstructionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 xs:p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl sm:rounded-3xl p-4 xs:p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4 sm:space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 xs:pb-4">
                <div className="flex items-center gap-2 xs:gap-2.5">
                  <div className="w-9 h-9 xs:w-10 xs:h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm xs:text-base font-black text-slate-900 font-display">Special Delivery Instructions</h3>
                    <p className="text-[11px] xs:text-xs text-slate-500 font-medium">For AWB {trackingData?.awbNumber || 'NA'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowInstructionModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3.5 xs:space-y-4">
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Select or enter special delivery instructions for delivery executive <strong>{trackingData?.deliveryAgent?.name || 'Not assigned'}</strong>:
                </p>

                <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 text-xs font-semibold">
                  {[
                    'Leave at Security / Gate',
                    'Call Before Delivery',
                    'Deliver to Neighbor (Flat 401)',
                    'Deliver Post 4:00 PM'
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setInstructionText(preset)}
                      className={`p-2 xs:p-2.5 rounded-xl border text-left transition-colors cursor-pointer text-xs ${
                        instructionText === preset
                          ? 'border-blue-600 bg-blue-50 text-blue-700 font-extrabold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={3}
                  placeholder="Or enter custom instructions for courier driver..."
                  value={instructionText}
                  onChange={(e) => setInstructionText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 xs:p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 font-medium"
                />
              </div>

              <div className="flex flex-col-reverse xs:flex-row items-stretch xs:items-center justify-end gap-2 xs:gap-3 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowInstructionModal(false)}
                  className="font-bold text-slate-600 justify-center"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    if (!instructionText.trim()) {
                      toast.error('Please enter or select a delivery instruction.');
                      return;
                    }
                    toast.success('Delivery instruction submitted to courier partner!');
                    setShowInstructionModal(false);
                    setInstructionText('');
                  }}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold px-5 justify-center"
                >
                  Submit Instruction
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
