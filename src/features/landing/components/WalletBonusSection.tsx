import React, { useState } from 'react';
import { 
  Coins, CheckCircle2, ArrowRight, Wallet
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const WalletBonusSection: React.FC = () => {
  const [rechargeAmount, setRechargeAmount] = useState<number>(25000);

  // Bonus Calculation Logic
  const getBonusPercent = (amount: number): number => {
    if (amount >= 100000) return 0.12; // 12%
    if (amount >= 50000) return 0.10;  // 10%
    if (amount >= 25000) return 0.07;  // 7%
    if (amount >= 10000) return 0.05;  // 5%
    return 0;                          // 0%
  };

  const bonusPercent = getBonusPercent(rechargeAmount);
  const bonusCredits = Math.round(rechargeAmount * bonusPercent);
  const totalUsableBalance = rechargeAmount + bonusCredits;

  const walletTiers = [
    {
      name: 'Starter Wallet',
      deposit: '₹2,000',
      minVal: 2000,
      bonus: '₹0 Bonus',
      bonusRate: '0%',
      perks: [
        'Instant multi-carrier AWB generation',
        'Standard T+5 COD remittance cycle',
        'Standard email ticket support',
        'Zero minimum balance maintenance'
      ],
      tag: 'Pay As You Go'
    },
    {
      name: 'Silver Growth',
      deposit: '₹10,000',
      minVal: 10000,
      bonus: '+₹500 Credits',
      bonusRate: '5% Instant Bonus',
      perks: [
        '₹10,500 total usable balance',
        'Early T+2 Fast COD bank payout',
        'Automated WhatsApp NDR bot enabled',
        'Shopify & WooCommerce auto-sync'
      ],
      tag: 'Growing D2C'
    },
    {
      name: 'Gold Scale',
      deposit: '₹25,000',
      minVal: 25000,
      bonus: '+₹1,750 Credits',
      bonusRate: '7% Instant Bonus',
      isPopular: true,
      perks: [
        '₹26,750 total usable balance',
        'Early T+2 Fast COD settlement',
        'Complimentary ₹10,000 Transit Guard',
        'Weight dispute photo evidence priority'
      ],
      tag: 'MOST POPULAR'
    },
    {
      name: 'Platinum Elite',
      deposit: '₹50,000+',
      minVal: 50000,
      bonus: '+₹5,000 Credits',
      bonusRate: '10% Instant Bonus',
      perks: [
        '₹55,000+ total usable balance',
        '0% COD collection remittance fee',
        'Dedicated Key Account Manager (KAM)',
        'Custom weight slab rate cards (from ₹34)'
      ],
      tag: 'High-Volume Brands'
    }
  ];

  return (
    <div id="wallet-bonus" className="space-y-6 sm:space-y-8 pt-8 border-t border-slate-200/80 scroll-mt-24">
      {/* Header */}
      <div className="text-center space-y-3 sm:space-y-3.5 max-w-5xl mx-auto px-1 xs:px-2">
        <div className="inline-block">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 xs:px-3.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] xs:text-xs font-extrabold border border-emerald-200/80 shadow-xs">
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
            </span>
            <Coins className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="uppercase tracking-wider">Shipping Wallet Cashback &amp; Bonus Slabs</span>
          </div>
        </div>

        <h2 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-display tracking-tight leading-[1.2] sm:leading-[1.24] max-w-4xl mx-auto">
          Fund Your Shipping Wallet,{' '}
          <span className="inline-block pb-1 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
            Earn Instant Extra Credits
          </span>
        </h2>

        <p className="text-xs xs:text-sm sm:text-base md:text-lg text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto">
          We charge ₹0 monthly subscription fees. Instead, recharge your prepaid shipping wallet and unlock up to 10% in free bonus shipping credits on every top-up.
        </p>
      </div>

      {/* Interactive Bonus Calculator Studio */}
      <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 xs:p-6 sm:p-10 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-center">
          {/* Controls */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] xs:text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                  Select or Enter Wallet Recharge Amount:
                </span>
                <span className="text-[11px] xs:text-xs font-mono font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {bonusPercent > 0 ? `${(bonusPercent * 100).toFixed(0)}% Bonus Credits Unlocked` : 'Standard Slabs'}
                </span>
              </div>

              {/* Quick Presets */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 xs:gap-2.5">
                {[5000, 10000, 25000, 50000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setRechargeAmount(amt)}
                    className={`py-2 xs:py-2.5 px-2.5 xs:px-3 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer text-center ${
                      rechargeAmount === amt
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    ₹{amt.toLocaleString()}
                  </button>
                ))}
              </div>

              {/* Slider */}
              <div className="pt-2 sm:pt-3 space-y-2">
                <input
                  type="range"
                  min="2000"
                  max="100000"
                  step="1000"
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] xs:text-[11px] font-mono text-slate-400">
                  <span>₹2,000 (Base)</span>
                  <span>₹25,000 (+7%)</span>
                  <span>₹50,000 (+10%)</span>
                  <span>₹1,00,000 (+12%)</span>
                </div>
              </div>
            </div>

            {/* Perks at this level */}
            <div className="p-3.5 xs:p-4 rounded-xl sm:rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
              <span className="text-[11px] xs:text-xs font-bold text-slate-800 uppercase tracking-wider font-mono block">
                Perks Included at this Top-up Level:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Instant wallet balance credit</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{rechargeAmount >= 10000 ? 'T+2 Fast COD Bank Remittance' : 'Standard T+5 COD Remittance'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{rechargeAmount >= 25000 ? 'Complimentary Transit Insurance' : 'Standard Transit Cover'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{rechargeAmount >= 50000 ? '0% COD Collection Remittance Fee' : '1.5% or ₹20 COD fee'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Result Card */}
          <div className="lg:col-span-5 rounded-2xl sm:rounded-3xl p-4 xs:p-6 sm:p-8 bg-slate-950 text-white shadow-xl space-y-4 sm:space-y-5 border border-slate-800">
            <div className="space-y-1">
              <span className="text-[10px] xs:text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400 block">
                Total Usable Shipping Balance
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl xs:text-4xl sm:text-5xl font-black font-mono text-white tracking-tight">
                  ₹{totalUsableBalance.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-slate-400 pt-1 font-medium leading-relaxed">
                Deposit ₹{rechargeAmount.toLocaleString()} and receive an extra{' '}
                <strong className="text-emerald-400 font-mono">₹{bonusCredits.toLocaleString()}</strong> in free shipping credits.
              </p>
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-800 text-xs font-mono">
              <div className="flex justify-between text-slate-300">
                <span>Recharge Principal:</span>
                <span className="font-bold text-white">₹{rechargeAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-bold">
                <span>Instant Bonus Credits ({bonusPercent * 100}%):</span>
                <span>+₹{bonusCredits.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Effective Cost per ₹100:</span>
                <span className="font-bold text-white">₹{(100 / (1 + bonusPercent)).toFixed(1)}</span>
              </div>
            </div>

            <Link to="/register" className="block pt-2">
              <button className="w-full py-2.5 xs:py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                <Wallet className="w-4 h-4 shrink-0" />
                <span>Recharge &amp; Claim Bonus Credits</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* 4-Tier Wallet Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 items-stretch">
        {walletTiers.map((tier) => (
          <div
            key={tier.name}
            className={`p-4 xs:p-5 rounded-xl sm:rounded-2xl border transition-all flex flex-col justify-between space-y-4 relative ${
              tier.isPopular
                ? 'bg-slate-950 text-white border-emerald-500 shadow-xl ring-1 ring-emerald-500/30'
                : 'bg-white text-slate-900 border-slate-200/90 shadow-2xs hover:shadow-md'
            }`}
          >
            {tier.isPopular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest shadow-md whitespace-nowrap">
                ★ {tier.tag}
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  tier.isPopular ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-100 text-slate-600'
                }`}>
                  {tier.name}
                </span>
                <span className="text-xs font-mono font-extrabold text-emerald-500">
                  {tier.bonusRate}
                </span>
              </div>

              <div>
                <div className="flex items-baseline gap-1">
                  <span className={`text-xl xs:text-2xl sm:text-3xl font-black font-mono tracking-tight ${
                    tier.isPopular ? 'text-white' : 'text-slate-950'
                  }`}>
                    {tier.deposit}
                  </span>
                  <span className={`text-xs ${tier.isPopular ? 'text-slate-400' : 'text-slate-500'}`}>
                    recharge
                  </span>
                </div>
                <div className="text-xs font-mono font-bold text-emerald-500 mt-0.5">
                  {tier.bonus}
                </div>
              </div>

              <div className={`pt-3 border-t space-y-2 text-xs font-medium ${
                tier.isPopular ? 'border-slate-800 text-slate-200' : 'border-slate-100 text-slate-700'
              }`}>
                {tier.perks.map((p, pIdx) => (
                  <div key={pIdx} className="flex items-start gap-2">
                    <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                      tier.isPopular ? 'text-emerald-400' : 'text-emerald-600'
                    }`} />
                    <span className="leading-snug">{p}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setRechargeAmount(tier.minVal)}
              className={`w-full py-2 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer text-center ${
                tier.isPopular
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-800'
              }`}
            >
              Select {tier.deposit} Slabs
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
