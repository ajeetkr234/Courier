import React from 'react';
import { PublicNavbar, PublicFooter } from './PublicNav';
import { Building2, Users, Award, ShieldCheck, Sparkles, MapPin, Truck } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      <PublicNavbar />

      {/* Hero Header */}
      <section className="py-12 sm:py-16 px-6 sm:px-8 bg-gradient-to-b from-blue-50/70 via-white to-white border-b border-slate-200 text-center">
        <div className="max-w-7xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/90 text-blue-800 text-xs font-extrabold border border-blue-200 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin" /> Our Story & Mission
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 font-display tracking-tight">
            Building the Infrastructure for Indian E-Commerce
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
            Multi-courier rate comparison, transparent COD financial settlements, and automated NDR recovery for Indian businesses.
          </p>
        </div>
      </section>

      {/* Main Content Container with Standardized Padding */}
      <section className="py-12 sm:py-16 px-6 sm:px-8 max-w-7xl mx-auto w-full space-y-16">
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
        <div className="bg-slate-900 text-white p-8 sm:p-12 rounded-3xl space-y-4 shadow-xl">
          <h2 className="text-2xl font-black font-display text-blue-400">Headquarters & Operational Hubs</h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Headquartered in Gurugram's Cyber City technology corridor, with regional fulfillment support desks in Mumbai, Bengaluru, Kolkata, and Hyderabad.
          </p>
          <div className="pt-2 flex items-center gap-2 text-xs font-bold text-slate-400">
            <MapPin className="w-4 h-4 text-rose-500" />
            <span>Plot 42, Cyber City, Phase 3, Gurugram, Haryana - 122002</span>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};
