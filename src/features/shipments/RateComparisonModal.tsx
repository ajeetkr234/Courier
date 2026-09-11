import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShieldCheck, Zap, Tag, AlertCircle, ArrowRight, CheckCircle2, Wallet } from 'lucide-react';
import { Order, RateQuote } from '../../types';
import { rateEngine } from '../../services/couriers/rateEngine';
import { usePlatformStore } from '../../services/store';
import { toast } from 'sonner';

interface RateComparisonModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onShipmentCreated?: () => void;
}

export const RateComparisonModal: React.FC<RateComparisonModalProps> = ({
  order,
  isOpen,
  onClose,
  onShipmentCreated,
}) => {
  const navigate = useNavigate();
  const { walletBalance, createShipment } = usePlatformStore();
  const [quotes, setQuotes] = useState<RateQuote[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedQuote, setSelectedQuote] = useState<RateQuote | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [filter, setFilter] = useState<'ALL' | 'CHEAPEST' | 'FASTEST'>('ALL');

  useEffect(() => {
    if (!isOpen || !order) return;

    let isMounted = true;
    setLoading(true);

    rateEngine
      .fetchComparisonQuotes({
        sellerId: order.seller_id,
        orderId: order.id,
        pickupPincode: order.warehouse?.pincode || '421302',
        deliveryPincode: order.shipping_address.pincode,
        weightKg: order.weight_kg,
        lengthCm: order.length_cm,
        widthCm: order.width_cm,
        heightCm: order.height_cm,
        paymentType: order.payment_type,
        orderValue: order.total_amount,
      })
      .then((resQuotes) => {
        if (!isMounted) return;
        setQuotes(resQuotes);
        if (resQuotes.length > 0) {
          // Preselect recommended or cheapest
          const rec = resQuotes.find((q) => q.recommendation_badge === 'Recommended') || resQuotes[0];
          setSelectedQuote(rec);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        toast.error('Failed to calculate rates from courier partners');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, order]);

  if (!isOpen) return null;

  const handleConfirmShipment = () => {
    if (!selectedQuote) {
      toast.error('Please select a courier partner');
      return;
    }

    if (walletBalance < selectedQuote.total_rate) {
      toast.warning(`Insufficient balance (₹${walletBalance.toFixed(2)}). Opening Wallet to recharge...`);
      onClose();
      navigate('/app/wallet');
      return;
    }

    setSubmitting(true);
    try {
      createShipment(
        order.id,
        selectedQuote.courier_id,
        selectedQuote.courier_name,
        selectedQuote.courier_code,
        selectedQuote.base_rate + selectedQuote.surcharges + selectedQuote.tax_amount,
        selectedQuote.cod_charge
      );
      toast.success(`Shipment created with ${selectedQuote.courier_name}!`);
      setSubmitting(false);
      if (onShipmentCreated) onShipmentCreated();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create shipment');
      setSubmitting(false);
    }
  };

  const filteredQuotes = quotes.filter((q) => {
    if (filter === 'CHEAPEST') return q.recommendation_badge === 'Cheapest';
    if (filter === 'FASTEST') return q.recommendation_badge === 'Fastest';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-400" /> Compare Courier Rates & Ship
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Order #{order.external_order_id || order.id} • {order.shipping_address.city}, {order.shipping_address.state} ({order.shipping_address.pincode}) • Weight: {order.weight_kg}kg
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filters & Wallet status banner */}
        <div className="px-6 py-3 bg-slate-950/30 border-b border-slate-800/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400">Sort & Filter:</span>
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition ${
                filter === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              All Partners ({quotes.length})
            </button>
            <button
              onClick={() => setFilter('CHEAPEST')}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition ${
                filter === 'CHEAPEST' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Cheapest Rate
            </button>
            <button
              onClick={() => setFilter('FASTEST')}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition ${
                filter === 'FASTEST' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Fastest ETA
            </button>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1 rounded-xl text-xs">
            <span className="text-slate-400">Available Wallet Balance:</span>
            <span className={`font-bold ${walletBalance < 100 ? 'text-rose-400' : 'text-emerald-400'}`}>
              ₹{walletBalance.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto" />
              <p className="text-sm text-slate-400">Fetching real-time quotes across Delhivery, Xpressbees, Ecom Express & Shadowfax...</p>
            </div>
          ) : filteredQuotes.length === 0 ? (
            <div className="py-12 text-center bg-slate-950/40 rounded-xl border border-slate-800/60 p-6">
              <AlertCircle className="h-10 w-10 text-amber-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-white">No Serviceable Courier Found</p>
              <p className="text-xs text-slate-400 mt-1">Check pincode serviceability or update shipment weight/dimensions.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredQuotes.map((quote) => {
                const isSelected = selectedQuote?.id === quote.id;
                return (
                  <div
                    key={quote.id}
                    onClick={() => setSelectedQuote(quote)}
                    className={`p-4 rounded-xl border transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isSelected
                        ? 'bg-indigo-950/30 border-indigo-500 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500'
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div
                        className={`h-5 w-5 rounded-full border flex items-center justify-center mt-1 transition ${
                          isSelected ? 'border-indigo-400 bg-indigo-500 text-white' : 'border-slate-600'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="h-4 w-4" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-white text-base">{quote.courier_name}</span>
                          <span className="text-xs px-2 py-0.5 bg-slate-800 rounded-md text-slate-300">
                            {quote.service_name}
                          </span>

                          {quote.recommendation_badge && (
                            <span
                              className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full tracking-wider ${
                                quote.recommendation_badge === 'Cheapest'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : quote.recommendation_badge === 'Fastest'
                                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                  : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                              }`}
                            >
                              {quote.recommendation_badge}
                            </span>
                          )}
                        </div>

                        <div className="mt-2 text-xs text-slate-400 flex items-center gap-4 flex-wrap">
                          <span>
                            ETA: <strong className="text-slate-200">{quote.estimated_days} Days</strong>
                          </span>
                          <span>
                            Base Freight: <strong className="text-slate-300">₹{quote.base_rate}</strong>
                          </span>
                          {quote.cod_charge > 0 && (
                            <span>
                              COD Charge: <strong className="text-slate-300">₹{quote.cod_charge}</strong>
                            </span>
                          )}
                          <span>
                            Tax (GST 18%): <strong className="text-slate-300">₹{quote.tax_amount}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-2 md:pt-0 border-slate-800">
                      <div className="text-xs text-slate-400">Total Shipping Cost</div>
                      <div className="text-xl font-extrabold text-white text-emerald-400">
                        ₹{quote.total_rate.toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/70 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="text-xs text-slate-400">
            {selectedQuote && (
              <div className="flex items-center gap-2">
                <span>Selected: <strong className="text-white">{selectedQuote.courier_name}</strong></span>
                <span className="text-indigo-400 font-mono font-bold bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-lg">
                  Wallet Impact: ₹{walletBalance.toLocaleString('en-IN')} → ₹{(walletBalance - selectedQuote.total_rate).toLocaleString('en-IN')} (–₹{selectedQuote.total_rate})
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition w-1/2 sm:w-auto cursor-pointer"
            >
              Cancel
            </button>
            <button
              disabled={!selectedQuote || submitting}
              onClick={handleConfirmShipment}
              className={`px-5 py-2.5 text-xs font-bold rounded-xl text-white transition shadow-lg flex items-center justify-center gap-2 cursor-pointer w-1/2 sm:w-auto ${
                walletBalance < (selectedQuote?.total_rate || 0)
                  ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
              }`}
            >
              {submitting ? (
                'Generating AWB...'
              ) : walletBalance < (selectedQuote?.total_rate || 0) ? (
                `Recharge +₹${Math.ceil((selectedQuote?.total_rate || 0) - walletBalance)} to Ship`
              ) : (
                <>Confirm & Create Shipment <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

