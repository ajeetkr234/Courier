import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, Headphones, CheckCircle2 } from 'lucide-react';

export const ReadyToShipCTA: React.FC = () => {
  return (
    <section className="py-16 sm:py-20 px-4 sm:px-8 lg:px-12 bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-700 text-white relative overflow-hidden">
      {/* Background Radial Glow & Accents */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)] pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Side Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 space-y-6 text-left"
          >
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-white text-xs font-bold border border-white/20 backdrop-blur-sm shadow-xs">
              <Zap className="w-3.5 h-3.5 text-blue-200 fill-blue-200" />
              <span>Start Shipping Today</span>
            </div>

            {/* Main Title */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-white leading-tight">
              Ready to Ship Smarter?
            </h2>

            {/* Subtext */}
            <p className="text-sm sm:text-base text-blue-100/90 max-w-xl font-medium leading-relaxed">
              Connect your store, compare courier rates, and manage your entire shipping workflow from one platform.
            </p>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3 sm:gap-4 pt-2">
              <Link to="/register">
                <button className="bg-white hover:bg-blue-50 text-blue-600 font-extrabold text-sm px-6 py-3.5 rounded-xl shadow-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 group hover:-translate-y-0.5">
                  <span>Start Shipping Free</span>
                  <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>

              <Link to="/contact">
                <button 
                  className="bg-white hover:bg-blue-50 text-blue-600 font-bold p-3.5 rounded-xl shadow-xl transition-all duration-200 cursor-pointer flex items-center justify-center hover:-translate-y-0.5"
                  title="Contact Support & Demo"
                  aria-label="Contact Support"
                >
                  <Headphones className="w-5 h-5 text-blue-600" />
                </button>
              </Link>
            </div>
          </motion.div>

          {/* Right Side Visual Mockup Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-5 bg-[#0b1b44]/80 border border-white/15 backdrop-blur-md rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl relative overflow-hidden"
          >
            {/* Top Card Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-blue-500 text-white font-black text-xs flex items-center justify-center font-display shadow-xs shrink-0">
                  FL
                </div>
                <span className="text-xs sm:text-sm font-bold text-white font-display truncate">
                  ShipFaster Logistic Aggregator
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 shrink-0">
                Ready to Dispatch
              </span>
            </div>

            {/* Metrics 2-Col Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-blue-900/50 border border-blue-700/40 space-y-1">
                <span className="block text-[10px] text-blue-300 font-bold uppercase tracking-wider">
                  RATE ENGINE
                </span>
                <span className="block text-xs sm:text-sm font-extrabold text-emerald-400 font-mono">
                  4 Couriers Active
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-900/50 border border-blue-700/40 space-y-1">
                <span className="block text-[10px] text-blue-300 font-bold uppercase tracking-wider">
                  SERVICEABLE PINS
                </span>
                <span className="block text-xs sm:text-sm font-extrabold text-white font-mono">
                  28,000+ Verified
                </span>
              </div>
            </div>

            {/* Recommended Carrier Section */}
            <div className="p-4 rounded-2xl bg-blue-900/40 border border-blue-700/40 space-y-2.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-blue-200">Recommended Carrier</span>
                <span className="text-emerald-400 font-mono font-bold">₹48.00 • 2 Days</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-md bg-red-600 flex items-center justify-center text-[10px] font-extrabold text-white shrink-0 shadow-xs">
                  DL
                </div>
                <span className="text-xs sm:text-sm font-bold text-white font-display flex-1 truncate">
                  Delhivery Express Surface
                </span>
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0 ml-auto" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
