import React from 'react';
import { Building2, Users, Award, ShieldCheck, Sparkles, MapPin, Truck } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="text-slate-900 flex flex-col font-sans">

      {/* Hero Header */}
      <section className="py-12 sm:py-16 px-6 sm:px-8 bg-gradient-to-b from-blue-50/70 via-white to-white border-b border-slate-200 text-center">
        <div className="max-w-7xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-extrabold border border-blue-200/80 shadow-xs">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
            </span>
            <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin" />
            <span className="uppercase tracking-wider">Our Story &amp; Mission</span>
          </span>
          <h1 className="text-2xl xs:text-3xl sm:text-5xl md:text-6xl lg:text-[66px] font-black text-slate-950 font-display tracking-tight leading-[1.12] max-w-5xl mx-auto">
            Building the Infrastructure for{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
              Indian E-Commerce
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto font-medium leading-relaxed mt-3 sm:mt-4">
            Multi-courier rate comparison, transparent COD financial settlements, and automated NDR recovery for Indian businesses.
          </p>
        </div>
      </section>

      {/* Main Content Container with Standardized Padding */}
      <section className="py-12 sm:py-16 px-6 sm:px-8 max-w-7xl mx-auto w-full space-y-16">
        {/* Core Pillars Header */}
        <div className="text-center space-y-3.5 max-w-5xl mx-auto">
          <div className="inline-block">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-extrabold border border-blue-200/80 shadow-xs">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span className="uppercase tracking-wider">PLATFORM MISSION • FOUNDATIONAL PILLARS</span>
            </div>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-display tracking-tight leading-[1.18] max-w-4xl mx-auto">
            Empowering 10,000+ Brands{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
              Across India
            </span>
          </h2>

          <p className="text-sm sm:text-base md:text-lg text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto">
            Designed to solve logistics fragmentation, volatile freight costs, and cash flow delays for modern digital merchants.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 font-display">Multi-Courier Platform</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Built from the ground up to solve courier fragmentation, high RTO rates, and delayed Cash On Delivery remittances for Indian sellers.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 font-display">D2C & Wholesale Ready</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Built for fast-growing apparel storefronts, electronics distributors, and enterprise business shipping.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 font-display">Pan-India Coverage</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Courier coverage across Metro cities, Tier-2 hubs, and regional PIN codes through combined carrier integration.
            </p>
          </div>
        </div>

        {/* Corporate Office Highlight */}
        <div className="bg-slate-900 text-white p-8 sm:p-12 rounded-3xl space-y-6 shadow-xl relative overflow-hidden">
          <div className="text-center space-y-3.5 max-w-5xl mx-auto">
            <div className="inline-block">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-cyan-200 text-xs font-extrabold border border-white/20 shadow-xs backdrop-blur-md">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
                </span>
                <MapPin className="w-3.5 h-3.5 text-cyan-300" />
                <span className="uppercase tracking-wider text-white/95">PHYSICAL PRESENCE • OPERATIONAL HUBS</span>
              </div>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight font-display text-white leading-[1.18] max-w-4xl mx-auto">
              Headquarters &amp;{' '}
              <span className="bg-gradient-to-r from-cyan-200 via-sky-200 to-white bg-clip-text text-transparent">
                Regional Logistics Hubs
              </span>
            </h2>

            <p className="text-sm sm:text-base md:text-lg text-slate-300 font-medium leading-relaxed max-w-3xl mx-auto">
              Headquartered in Gurugram's Cyber City technology corridor, with regional fulfillment support desks in Mumbai, Bengaluru, Kolkata, and Hyderabad.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-2 text-xs font-bold text-slate-300">
            <MapPin className="w-4 h-4 text-rose-500" />
            <span>Plot 42, Cyber City, Phase 3, Gurugram, Haryana - 122002</span>
          </div>
        </div>
      </section>
    </div>
  );
};
