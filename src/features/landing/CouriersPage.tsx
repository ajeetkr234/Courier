import React, { useState } from 'react';
import { PublicNavbar, PublicFooter } from './PublicNav';
import { motion } from 'framer-motion';
import { Truck, CheckCircle2, ShieldCheck, MapPin, Zap, Search, ArrowRight, Sparkles } from 'lucide-react';
import { HeroCourierAnimation, FloatingCourierBadges } from '../../components/ui/AnimatedCourierVisuals';
import { MOCK_COURIERS } from '../../lib/mockData';
import { Button } from '../../components/ui/Button';

export const CouriersPage: React.FC = () => {
  const [searchPincode, setSearchPincode] = useState('110020');
  const [serviceableCouriers, setServiceableCouriers] = useState<string[]>(['Delhivery Express', 'Xpressbees Surface', 'Ecom Express COD', 'Shadowfax Hyperlocal']);

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchPincode) {
      setServiceableCouriers(['Delhivery Express', 'Xpressbees Surface', 'Ecom Express COD', 'Shadowfax Hyperlocal']);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="py-12 sm:py-16 px-6 sm:px-8 bg-gradient-to-b from-blue-50/70 via-white to-white border-b border-slate-200 text-center">
        <div className="max-w-7xl mx-auto space-y-6">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/90 text-blue-800 text-xs font-extrabold border border-blue-200 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin" /> Pan-India Courier Network
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 font-display tracking-tight">
            Integrated Carrier Partners & Coverage
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
            Compare rates, check pincode serviceability, and book shipments across 28,000+ pincodes in India.
          </p>

          <HeroCourierAnimation />
        </div>
      </section>

      {/* Main Content Container with Standardized Padding */}
      <section className="py-12 sm:py-16 px-6 sm:px-8 max-w-7xl mx-auto w-full space-y-16">
        {/* Interactive Pincode Serviceability Lookup Tool */}
        <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 shadow-md space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-slate-900 font-display">Check Pincode Courier Serviceability</h2>
            <p className="text-xs text-slate-600">Enter any destination pincode to view available couriers and COD eligibility.</p>
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

        {/* Carrier Detail Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {MOCK_COURIERS.map((c: any) => (
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

      <PublicFooter />
    </div>
  );
};

