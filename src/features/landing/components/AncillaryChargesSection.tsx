import React from 'react';
import { 
  ShieldCheck, Banknote, RotateCcw, Truck, Camera, 
  MessageSquare, CheckCircle2, Lock
} from 'lucide-react';

export const AncillaryChargesSection: React.FC = () => {
  const charges = [
    {
      icon: Banknote,
      title: 'COD Remittance & Handling',
      fee: '1.5% or ₹20 (Whichever is higher)',
      badge: 'T+2 Direct Bank Settlement',
      desc: 'Applied only on successful cash deliveries. 0% remittance fee unlocked for Platinum and high-volume sellers.',
      color: 'blue'
    },
    {
      icon: Truck,
      title: 'Doorstep Courier Pickup',
      fee: '₹0 (100% Free Doorstep Pickup)',
      badge: 'Pan-India 28,000+ PINs',
      desc: 'Couriers come directly to your warehouse or retail store. Zero minimum daily parcel threshold required.',
      color: 'emerald'
    },
    {
      icon: RotateCcw,
      title: 'RTO (Return to Origin) Charges',
      fee: 'Billed at Standard Forward Rate',
      badge: 'Zero Surge Penalty',
      desc: 'If a parcel fails 3 delivery attempts and is returned, reverse freight is billed strictly at baseline forward rates without extra penalties.',
      color: 'amber'
    },
    {
      icon: ShieldCheck,
      title: 'Freight Guard / Transit Protection',
      fee: 'Free Cover up to ₹5,000 / parcel',
      badge: 'Optional 0.5% High-Value Cover',
      desc: 'Every parcel is covered up to ₹5,000 against transit loss or damage. High-value jewelry or electronics can add 0.5% full-value insurance.',
      color: 'indigo'
    },
    {
      icon: Camera,
      title: 'Weight Dispute Evidence Locker',
      fee: '₹0 Dispute Resolution Charge',
      badge: 'Dedicated Audit Desk',
      desc: 'Upload parcel scale photos in 1 click. Our team mediates directly with Delhivery, Xpressbees, and Shadowfax to freeze incorrect excess charges.',
      color: 'sky'
    },
    {
      icon: MessageSquare,
      title: 'WhatsApp NDR Buyer Bot',
      fee: 'Free on Growth & Enterprise',
      badge: 'Cuts RTO by up to 38%',
      desc: 'Automated interactive WhatsApp messages sent to buyers with wrong address or delivery reschedules before courier initiates RTO.',
      color: 'teal'
    }
  ];

  return (
    <div id="ancillary" className="space-y-8 pt-8 border-t border-slate-200/80 scroll-mt-24">
      {/* Header */}
      <div className="text-center space-y-3.5 max-w-5xl mx-auto">
        <div className="inline-block">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-extrabold border border-blue-200/80 shadow-xs">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
            </span>
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span className="uppercase tracking-wider">Value Added Services &amp; Ancillary Fees</span>
          </div>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-display tracking-tight leading-[1.24] max-w-4xl mx-auto">
          Zero Hidden Fees.{' '}
          <span className="inline-block pb-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
            100% Transparent Pricing.
          </span>
        </h2>

        <p className="text-sm sm:text-base md:text-lg text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto">
          We believe in complete pricing transparency. Here is our exact fee schedule for COD collections, RTO reverse logistics, and value-added services.
        </p>
      </div>

      {/* Grid of 6 Transparent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {charges.map((c, idx) => {
          const IconComp = c.icon;
          return (
            <div
              key={idx}
              className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {c.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    {c.title}
                  </h3>
                  <div className="text-xs font-mono font-extrabold text-blue-600 mt-1">
                    {c.fee}
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {c.desc}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] font-bold text-slate-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>No hidden surcharges or markup</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust Guarantee Strip */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-blue-400" />
          <span className="font-bold">ShipFaster Commercial Commitment:</span>
        </div>
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-slate-300">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ₹0 Security Deposit
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ₹0 Account Inactivity Fee
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ₹0 Manifest Cancellation Charge
          </span>
        </div>
      </div>
    </div>
  );
};
