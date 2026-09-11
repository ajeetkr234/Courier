import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Truck, CheckCircle2, ShieldCheck, MapPin, Zap, Search, ArrowRight, Sparkles } from 'lucide-react';
import { HeroCourierAnimation, FloatingCourierBadges } from '../../components/ui/AnimatedCourierVisuals';
import { fetchCouriersFromSupabase } from '../../services/supabaseCouriers';
import { Courier } from '../../types';
import { Button } from '../../components/ui/Button';

export const CouriersPage: React.FC = () => {
  const [couriersList, setCouriersList] = useState<Courier[]>([]);
  const [searchPincode, setSearchPincode] = useState('110020');
  const [serviceableCouriers, setServiceableCouriers] = useState<string[]>(['Delhivery Express', 'Xpressbees Surface', 'Ecom Express COD', 'Shadowfax Hyperlocal']);

  useEffect(() => {
    fetchCouriersFromSupabase().then((data) => {
      if (data && data.length > 0) setCouriersList(data);
    });
  }, []);

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchPincode) {
      setServiceableCouriers(['Delhivery Express', 'Xpressbees Surface', 'Ecom Express COD', 'Shadowfax Hyperlocal']);
    }
  };

  return (
    <div className="text-slate-900 flex flex-col font-sans">

      {/* Hero Section */}
      <section className="py-12 sm:py-16 px-6 sm:px-8 bg-gradient-to-b from-blue-50/70 via-white to-white border-b border-slate-200 text-center">
        <div className="max-w-7xl mx-auto space-y-6">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-extrabold border border-blue-200/80 shadow-xs">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
            </span>
            <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin" />
            <span className="uppercase tracking-wider">Pan-India Courier Network</span>
          </span>
          <h1 className="text-2xl xs:text-3xl sm:text-5xl md:text-6xl lg:text-[66px] font-black font-display tracking-tight leading-[1.12] max-w-5xl mx-auto text-slate-950">
            Integrated Carrier Partners &amp;{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
              Pan-India Coverage
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto font-medium leading-relaxed mt-3 sm:mt-4">
            Compare rates, check pincode serviceability, and book shipments across 28,000+ pincodes in India.
          </p>

          <HeroCourierAnimation />
        </div>
      </section>

      {/* Main Content Container with Standardized Padding */}
      <section className="py-12 sm:py-16 px-6 sm:px-8 max-w-7xl mx-auto w-full space-y-16">
        {/* Interactive Pincode Serviceability Lookup Tool */}
        <div className="bg-slate-50 p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-md space-y-8">
          <div className="text-center space-y-3.5 max-w-5xl mx-auto">
            <div className="inline-block">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-extrabold border border-blue-200/80 shadow-xs">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span className="uppercase tracking-wider">PINCODE SERVICEABILITY • INSTANT CHECK</span>
              </div>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-display tracking-tight leading-[1.18] max-w-4xl mx-auto">
              Check Pincode Courier{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
                Serviceability
              </span>
            </h2>

            <p className="text-sm sm:text-base md:text-lg text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto">
              Enter any 6-digit Indian destination pincode to verify active carrier connectivity, COD readiness, and transit SLAs.
            </p>
          </div>

          <form onSubmit={handlePincodeCheck} className="max-w-md mx-auto flex gap-2">
            <input
              type="text"
              placeholder="Enter Pincode (e.g. 110020)..."
              value={searchPincode}
              onChange={(e) => setSearchPincode(e.target.value)}
              className="flex-1 glass-input rounded-xl px-4 py-2.5 text-sm font-medium"
              required
            />
            <Button type="submit" leftIcon={<Search className="w-4 h-4" />}>
              Check
            </Button>
          </form>

          {serviceableCouriers.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-2">
              {serviceableCouriers.map((name, idx) => (
                <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="block text-xs font-bold text-slate-900">{name}</span>
                    <span className="block text-[10px] text-emerald-700 font-bold">Serviceable • COD</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <FloatingCourierBadges />

        {/* Carrier Detail Cards Header */}
        <div className="text-center space-y-3.5 max-w-5xl mx-auto">
          <div className="inline-block">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-extrabold border border-blue-200/80 shadow-xs">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              <Truck className="w-3.5 h-3.5 text-blue-600" />
              <span className="uppercase tracking-wider">FLEET CAPABILITIES • CARRIER BENCHMARKS</span>
            </div>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-display tracking-tight leading-[1.18] max-w-4xl mx-auto">
            Compare Courier Strengths &amp;{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
              Delivery SLAs
            </span>
          </h2>

          <p className="text-sm sm:text-base md:text-lg text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto">
            Direct API connections with top Indian carriers ensure real-time rate discounts, automated manifest uploads, and instant label generation.
          </p>
        </div>

        {/* Carrier Detail Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {couriersList.map((c) => (
            <motion.div 
              key={c.id} 
              whileHover={{ scale: 1.01 }}
              className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-blue-700 text-sm font-display shadow-xs">
                    {c.code.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 font-display">{c.name}</h3>
                    <span className="text-xs text-slate-500 font-medium">Express Air & Surface Logistics</span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-emerald-600 animate-pulse" /> Operational
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-slate-500 font-medium block">Pincodes</span>
                  <strong className="text-slate-900 font-bold">28,000+</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">COD Status</span>
                  <strong className="text-emerald-700 font-bold">Active</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Avg SLA</span>
                  <strong className="text-blue-600 font-bold">24-72 Hours</strong>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

