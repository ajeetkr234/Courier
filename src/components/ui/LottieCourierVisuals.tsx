import React from 'react';
import { motion } from 'framer-motion';
import { Truck, Package, MapPin, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

interface LottieCourierVisualProps {
  type?: 'hero' | 'tracking' | 'delivery' | 'ndr';
  className?: string;
}

export const LottieCourierVisual: React.FC<LottieCourierVisualProps> = ({
  type = 'hero',
  className = ''
}) => {
  return (
    <div className={`relative w-full overflow-hidden rounded-3xl bg-gradient-to-r from-blue-50/80 via-white to-blue-50/80 p-6 border border-blue-100 shadow-xl ${className}`}>
      {/* Route Animation Path */}
      <div className="relative flex items-center justify-between px-6 z-10">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="flex flex-col items-center gap-1 text-blue-600"
        >
          <div className="p-3 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
            <MapPin className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-800 font-display">Pickup Warehouse</span>
        </motion.div>

        {/* Dashed Express Shipping Route Line */}
        <div className="flex-1 relative mx-6 h-1.5 bg-blue-100 rounded-full overflow-hidden">
          <motion.div
            animate={{ x: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
            className="absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent via-blue-600 to-transparent"
          />
        </div>

        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
          className="flex flex-col items-center gap-1 text-emerald-600"
        >
          <div className="p-3 rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-500/30">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-800 font-display">Buyer Doorstep</span>
        </motion.div>
      </div>

      {/* Express Courier Delivery Truck Animation */}
      <div className="relative h-20 mt-4 w-full flex items-center justify-center">
        <motion.div
          animate={{ x: ['-40%', '40%'] }}
          transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut', repeatType: 'reverse' }}
          className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl border border-blue-200 shadow-xl"
        >
          <div className="p-2.5 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
            <Truck className="w-6 h-6 animate-bounce text-white" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-900 font-display">Lottie Express Dispatch</span>
              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                Active Delivery
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">AWB: DEL1928374650 • SLA 24-48 Hours</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
