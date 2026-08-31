import React, { useState } from 'react';
import { ShoppingBag, Globe, RefreshCw, CheckCircle2, Link2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { toast } from 'sonner';

export const IntegrationsPage: React.FC = () => {
  const [shopifyDomain, setShopifyDomain] = useState('apexwear.myshopify.com');
  const [isConnectedShopify, setIsConnectedShopify] = useState(true);

  const handleConnectShopify = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnectedShopify(true);
    toast.success(`Shopify store ${shopifyDomain} connected successfully!`);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Subheader */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <h2 className="text-base font-extrabold text-slate-900 font-display">E-Commerce Integrations</h2>
        <p className="text-xs text-slate-500 font-medium">Sync orders automatically from Shopify, WooCommerce &amp; custom storefronts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shopify Connector Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-extrabold text-sm">
                S
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 font-display">Shopify Integration</h3>
                <span className="text-xs text-slate-500 font-medium">Auto order import &amp; fulfillment tracking sync</span>
              </div>
            </div>

            {isConnectedShopify && (
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-extrabold border border-emerald-200">
                Connected
              </span>
            )}
          </div>

          <form onSubmit={handleConnectShopify} className="space-y-3 pt-2">
            <Input
              label="Shopify Store Domain"
              value={shopifyDomain}
              onChange={(e) => setShopifyDomain(e.target.value)}
              disabled={isConnectedShopify}
            />

            {isConnectedShopify ? (
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-600 font-semibold">Sync Status: Active (Every 5 mins)</span>
                <Button size="sm" variant="outline" className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50" onClick={() => setIsConnectedShopify(false)}>
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button type="submit" size="sm" className="w-full">
                Connect Shopify Store
              </Button>
            )}
          </form>
        </div>

        {/* WooCommerce Connector Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center font-extrabold text-sm">
                W
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 font-display">WooCommerce Connector</h3>
                <span className="text-xs text-slate-500 font-medium">REST API consumer key &amp; secret pairing</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Input label="WordPress Store URL" placeholder="https://store.brand.com" />
            <Button size="sm" variant="outline" className="w-full text-xs font-bold" onClick={() => toast.info('WooCommerce pairing initiated!')}>
              Connect WooCommerce
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
