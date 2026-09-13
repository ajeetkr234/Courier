import React from 'react';
import { motion } from 'framer-motion';
import { Layers } from 'lucide-react';

export interface CourierOrbitPartner {
  id: string;
  name: string;
  orbitRing: 'inner' | 'middle' | 'outer';
  orbitAngle: number;
  logoSvg: React.ReactNode;
}

export const IndustryOrbitVisualizer: React.FC = () => {
  return (
    <section 
      className="py-14 sm:py-20 px-3 xs:px-4 sm:px-8 lg:px-12 bg-white border-b border-slate-200 overflow-hidden relative"
    >
      <div className="relative max-w-6xl mx-auto space-y-8 sm:space-y-10">
        {/* Header Block (Standardized Chip, Heading & Subtitle) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-3.5 max-w-5xl mx-auto px-1 xs:px-2 sm:px-4"
        >
          {/* Standardized Section Pill / Chip Badge */}
          <div className="inline-block">
            <div className="inline-flex items-center gap-1.5 xs:gap-2 px-3 xs:px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-[10px] xs:text-xs font-extrabold border border-blue-200/80 shadow-xs max-w-full">
              <span className="flex h-2 w-2 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              <Layers className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="uppercase tracking-wider truncate">Industry Solutions • Built for Every Seller</span>
            </div>
          </div>

          {/* Standardized Heading */}
          <h2 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-display tracking-tight leading-[1.18]">
            Specialized Shipping Solutions,{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
              Tailored for Every Industry
            </span>
          </h2>

          {/* Standardized Paragraph */}
          <p className="text-sm sm:text-base md:text-lg text-slate-600 font-medium leading-relaxed max-w-3xl sm:max-w-4xl mx-auto">
            From fast-growing D2C fashion and fragile electronics to beauty care and heavy B2B freight — get intelligent courier rules, lower RTO, and custom delivery workflows designed specifically for your sector.
          </p>
        </motion.div>

        {/* Video Player Showcase (EXACT SAME UI Design, Border, Height & Width as Hero Video) */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.55 }}
          className="w-full"
        >
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden p-2 sm:p-2.5 bg-white border border-slate-200 shadow-xl shadow-slate-900/5">
            <div className="relative aspect-video w-full rounded-xl sm:rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center">
              <video
                src="/same_eese_type_ka_video_ban_na_gwr_video_mvp (1).mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
