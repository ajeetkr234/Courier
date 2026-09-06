import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Wallet, ShieldAlert, PlusCircle, ArrowRight, Play, Video, Calendar, 
  Users, MapPin, Truck, Package, CheckCircle2, ChevronRight, Calculator,
  ShoppingBag, Sparkles, Tag, ArrowUpRight, BarChart3, HelpCircle
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../app/providers/AuthProvider';
import { usePlatformStore } from '../../services/store';
import { toast } from 'sonner';

export const SellerHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Rate calculator quick inputs
  const [quickPickupPin, setQuickPickupPin] = useState('');
  const [quickDeliveryPin, setQuickDeliveryPin] = useState('');

  // Task Completion Checkers State
  const [completedTasksCount] = useState(0);

  const handleQuickCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPickupPin.trim() || !quickDeliveryPin.trim()) {
      toast.error('Please enter both Pickup and Delivery Pincodes.');
      return;
    }
    navigate('/app/rate-calculator', {
      state: { pickupPincode: quickPickupPin, deliveryPincode: quickDeliveryPin }
    });
  };

  return (
    <div className="w-full space-y-8 pb-16 text-slate-900 font-sans">
      {/* Top Welcome Greeting Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-slate-900 font-display tracking-tight">
          Welcome {user?.name || 'Ajeet'}!
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          You're few steps away from shipping your first order.
        </p>
      </div>

      {/* Main Grid: Left Onboarding Card & Right Widget Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Onboarding Task Checklist Card */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          {/* Header & Progress Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
            <div>
              <h2 className="text-lg font-black text-slate-900 font-display">
                Get Started
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Follow this simple steps to setup your ShipSwift Account
              </p>
            </div>

            <div className="space-y-1 text-right">
              <span className="text-xs font-bold text-slate-600 block">
                {completedTasksCount} of 3 tasks complete
              </span>
              <div className="w-44 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${(completedTasksCount / 3) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Cashback Offer Alert Banner */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 font-black text-xs">
                %
              </span>
              <span className="font-extrabold text-emerald-950">
                100% cashback on recharge of Rs.500 <span className="text-emerald-700 font-bold">+1 Offers Available</span>
              </span>
            </div>
            <button
              onClick={() => {
                toast.success('Offer code APPLIED! Recharge ₹500 to get ₹500 extra bonus cashback.');
                navigate('/app/wallet');
              }}
              className="text-xs font-extrabold text-indigo-600 hover:text-indigo-800 hover:underline shrink-0 cursor-pointer"
            >
              Apply Now
            </button>
          </div>

          {/* TASK ITEM 1: Recharge Wallet */}
          <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:bg-slate-50">
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-full bg-slate-100 text-emerald-700 font-black text-sm flex items-center justify-center border border-slate-300 shrink-0">
                1
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-900">
                  Recharge Wallet
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Add balance to your wallet and start shipping instantly.
                </p>
                <span className="text-[11px] font-bold text-slate-400 block">
                  Takes less than 2 mins
                </span>
              </div>
            </div>

            <Button
              onClick={() => navigate('/app/wallet')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs shadow-xs shrink-0 self-start sm:self-auto"
            >
              Recharge Wallet
            </Button>
          </div>

          {/* TASK ITEM 2: Complete KYC */}
          <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:bg-slate-50">
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-black text-sm flex items-center justify-center border border-slate-300 shrink-0">
                2
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-900">
                  Complete KYC
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Verify your KYC to unlock shipping access.
                </p>
                <span className="text-[11px] font-bold text-slate-400 block">
                  Takes less than 3 mins
                </span>
              </div>
            </div>

            <Button
              onClick={() => navigate('/app/settings')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs shadow-xs shrink-0 self-start sm:self-auto"
            >
              Verify KYC
            </Button>
          </div>

          {/* TASK ITEM 3: Add Order */}
          <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:bg-slate-50">
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-black text-sm flex items-center justify-center border border-slate-300 shrink-0">
                3
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-900">
                  Add Order
                </h3>
                <p className="text-xs text-slate-500 font-medium max-w-md">
                  Create your first order in minutes, or connect your sales channel to fetch orders automatically
                </p>
                <span className="text-[11px] font-bold text-slate-400 block">
                  Takes less than 3 mins
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 shrink-0 self-start sm:self-auto">
              <Button
                onClick={() => navigate('/app/orders/new')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-6 py-2 rounded-xl text-xs shadow-xs"
              >
                Add Order
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/app/integrations')}
                className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 font-bold px-6 py-2 rounded-xl text-xs"
              >
                Connect My Store
              </Button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Calculate Shipping Rates & Quick Learning Widgets */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: Calculate Your Shipping Rates */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-black text-slate-900 font-display">
              Calculate Your Shipping Rates
            </h3>

            <form onSubmit={handleQuickCalculate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3 items-center relative">
                <div>
                  <label className="block text-[11px] font-extrabold text-indigo-700 flex items-center gap-1 mb-1">
                    <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                    Pickup Pincode
                  </label>
                  <Input
                    type="text"
                    maxLength={6}
                    value={quickPickupPin}
                    onChange={(e) => setQuickPickupPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter Pincode"
                    className="text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-emerald-700 flex items-center gap-1 mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Delivery Pincode
                  </label>
                  <Input
                    type="text"
                    maxLength={6}
                    value={quickDeliveryPin}
                    onChange={(e) => setQuickDeliveryPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter Pincode"
                    className="text-xs font-mono"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="outline"
                className="w-full justify-center border-indigo-300 text-indigo-700 hover:bg-indigo-50 font-extrabold py-2.5 rounded-xl text-xs"
              >
                Calculate Rates
              </Button>
            </form>
          </div>

          {/* Card 2: Quick Help & Learning */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 font-display">
                Quick Help &amp; Learning
              </h3>
              <button
                onClick={() => toast.info('Opening ShipSwift Learning Academy & Video Tutorials...')}
                className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Tutorial 1 */}
              <div
                onClick={() => toast.info('Playing video: How to Complete your KYC')}
                className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-900 to-slate-900 border border-slate-200 p-3 h-28 flex flex-col justify-between cursor-pointer shadow-xs hover:shadow-md transition"
              >
                <div className="w-8 h-8 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white self-center my-auto z-10 shadow-xs group-hover:scale-110 transition">
                  <Play className="w-4 h-4 fill-white translate-x-0.5" />
                </div>
                <span className="text-[10px] font-black text-white relative z-10 leading-tight">
                  How to Complete your KYC
                </span>
              </div>

              {/* Tutorial 2 */}
              <div
                onClick={() => toast.info('Playing video: How to Add Bank Details')}
                className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-800 to-purple-900 border border-slate-200 p-3 h-28 flex flex-col justify-between cursor-pointer shadow-xs hover:shadow-md transition"
              >
                <div className="w-8 h-8 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white self-center my-auto z-10 shadow-xs group-hover:scale-110 transition">
                  <Play className="w-4 h-4 fill-white translate-x-0.5" />
                </div>
                <span className="text-[10px] font-black text-white relative z-10 leading-tight">
                  How to Add Bank Details
                </span>
              </div>
            </div>

            {/* Card 3: Book Training Session */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4">
              <div className="space-y-1">
                <h4 className="text-xs font-black text-slate-900">
                  Book Training Session
                </h4>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed max-w-[200px]">
                  Get a guided demo to understand ShipSwift tools and start shipping with ease.
                </p>
              </div>

              <Button
                variant="outline"
                onClick={() => toast.success('Training session scheduled! A logistics expert will connect via Google Meet.')}
                className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 font-bold px-4 py-2 rounded-xl text-xs shrink-0"
              >
                Schedule Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM BANNER: India's Leading Seller Community Metrics */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-black font-display tracking-tight text-white">
            Now you're part of <span className="text-indigo-400 italic font-serif">India's Leading</span> seller community
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            A network built to help your business grow.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-2 border-t border-slate-800">
          {/* Pillar 1 */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-lg font-black text-white font-display">2 Lakh+</span>
              <span className="block text-[11px] text-slate-400 font-semibold">Active Sellers</span>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-lg font-black text-white font-display">19,000+</span>
              <span className="block text-[11px] text-slate-400 font-semibold">Pincodes</span>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-lg font-black text-white font-display">250+</span>
              <span className="block text-[11px] text-slate-400 font-semibold">Courier Partners</span>
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30 shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-lg font-black text-white font-display">50 Crore</span>
              <span className="block text-[11px] text-slate-400 font-semibold">Orders Delivered</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
