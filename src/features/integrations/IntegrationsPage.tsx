import React, { useState } from 'react';
import { 
  ShoppingBag, RefreshCw, CheckCircle2, 
  ArrowRight, ShieldCheck, Zap, Activity, 
  Clock, UploadCloud, ChevronRight, Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { toast } from 'sonner';

interface SyncLog {
  id: string;
  channel: string;
  type: 'ORDER_IMPORT' | 'TRACKING_PUSH' | 'INVENTORY_SYNC';
  status: 'SUCCESS' | 'WARNING';
  count: number;
  timestamp: string;
}

export const IntegrationsPage: React.FC = () => {
  const [shopifyDomain, setShopifyDomain] = useState('');
  const [shopifyConnected, setShopifyConnected] = useState(false);
  const [shopifyAutoSync, setShopifyAutoSync] = useState(false);

  const [wooUrl, setWooUrl] = useState('');
  const [wooConsumerKey, setWooConsumerKey] = useState('');
  const [wooConnected, setWooConnected] = useState(false);

  const [amazonSellerId, setAmazonSellerId] = useState('');
  const [amazonConnected, setAmazonConnected] = useState(false);

  const [flipkartSellerId, setFlipkartSellerId] = useState('');
  const [flipkartConnected, setFlipkartConnected] = useState(false);

  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncingChannel, setSyncingChannel] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState('Never');

  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);

  const activeChannelsCount = (shopifyConnected ? 1 : 0) + 
                              (wooConnected ? 1 : 0) + 
                              (amazonConnected ? 1 : 0) + 
                              (flipkartConnected ? 1 : 0);

  const handleSyncAll = () => {
    if (isSyncingAll) return;
    if (activeChannelsCount === 0) {
      toast.info('No live storefront integration is connected yet.');
      return;
    }
    setIsSyncingAll(true);
    setIsSyncingAll(false);
    toast.info('Integration sync backend is not configured yet.');
  };

  const handleSyncChannel = (channelName: string) => {
    setSyncingChannel(channelName);
    setSyncingChannel(null);
    toast.info(`${channelName} sync backend is not configured yet.`);
  };

  const handleConnectShopify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopifyDomain) {
      toast.error('Please enter a valid Shopify domain');
      return;
    }
    toast.info('Shopify backend/OAuth connector is not configured yet.');
  };

  const handleConnectWoo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wooUrl) {
      toast.error('Please enter your WooCommerce site URL');
      return;
    }
    toast.info('WooCommerce backend connector is not configured yet.');
  };

  const handleConnectAmazon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amazonSellerId) {
      toast.error('Please enter your Amazon Merchant Token or Seller ID');
      return;
    }
    toast.info('Amazon SP-API backend connector is not configured yet.');
  };

  const handleConnectFlipkart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flipkartSellerId) {
      toast.error('Please enter your Flipkart Seller ID');
      return;
    }
    toast.info('Flipkart backend connector is not configured yet.');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* Subheader & Global Action */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 font-display">Storefront &amp; Channel Integrations</h1>
            <Badge variant="emerald" size="sm">Live Mesh</Badge>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Connect your storefronts, marketplaces, and custom ERPs to automate order imports and tracking sync in real-time.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button 
            size="sm" 
            variant="outline" 
            className="text-xs font-bold gap-1.5 shrink-0" 
            onClick={handleSyncAll}
            disabled={isSyncingAll}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
            {isSyncingAll ? 'Syncing...' : 'Sync All Channels'}
          </Button>
          <Link to="/app/developers">
            <Button size="sm" className="text-xs font-bold gap-1.5 shrink-0 bg-blue-600 hover:bg-blue-700 text-white">
              <Zap className="w-3.5 h-3.5" />
              API Keys
            </Button>
          </Link>
        </div>
      </div>

      {/* Sync Telemetry Stat Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-900 font-display">4,821</div>
            <div className="text-[11px] font-semibold text-slate-500">Total Synced Orders</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-900 font-display">{activeChannelsCount} Active</div>
            <div className="text-[11px] font-semibold text-slate-500">Connected Channels</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-900 font-display">{lastSyncTime}</div>
            <div className="text-[11px] font-semibold text-slate-500">Last Telemetry Ping</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-900 font-display">99.98%</div>
            <div className="text-[11px] font-semibold text-slate-500">Webhook Health SLA</div>
          </div>
        </div>
      </div>

      {/* Main Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shopify Connector Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-black text-lg">
                  S
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-black text-slate-900 font-display">Shopify App</h2>
                    {shopifyConnected && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Active
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 font-medium">Auto order import &amp; tracking webhook sync</span>
                </div>
              </div>

              {shopifyConnected && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs h-8 px-2.5" 
                  onClick={() => handleSyncChannel('Shopify')}
                  disabled={syncingChannel === 'Shopify'}
                >
                  <RefreshCw className={`w-3 h-3 ${syncingChannel === 'Shopify' ? 'animate-spin text-blue-600' : ''}`} />
                </Button>
              )}
            </div>

            <form onSubmit={handleConnectShopify} className="space-y-3 pt-4">
              <Input
                label="Shopify Store Domain"
                value={shopifyDomain}
                onChange={(e) => setShopifyDomain(e.target.value)}
                disabled={shopifyConnected}
                placeholder="brandname.myshopify.com"
              />

              {shopifyConnected ? (
                <div className="space-y-3 pt-1">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-700 block">Webhook Stream: Active</span>
                      <span className="text-[11px] text-slate-500">orders/create, fulfillments/create</span>
                    </div>
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-600">
                      <input 
                        type="checkbox" 
                        checked={shopifyAutoSync} 
                        onChange={(e) => setShopifyAutoSync(e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500" 
                      />
                      Auto Sync
                    </label>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-slate-500">Sync Cadence: Real-time (Webhook)</span>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50" 
                      onClick={() => {
                        setShopifyConnected(false);
                        toast.info('Shopify store disconnected.');
                      }}
                    >
                      Disconnect
                    </Button>
                  </div>
                </div>
              ) : (
                <Button type="submit" size="sm" className="w-full bg-slate-900 text-white hover:bg-slate-800">
                  Connect Shopify Store
                </Button>
              )}
            </form>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Supports GraphQL Admin API v2024-04</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <Check className="w-3 h-3" /> Zero Delays
            </span>
          </div>
        </div>

        {/* WooCommerce Connector Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center font-black text-lg">
                  W
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-black text-slate-900 font-display">WooCommerce Store</h2>
                    {wooConnected && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Connected
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 font-medium">REST API consumer key &amp; secret pairing</span>
                </div>
              </div>

              {wooConnected && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs h-8 px-2.5" 
                  onClick={() => handleSyncChannel('WooCommerce')}
                  disabled={syncingChannel === 'WooCommerce'}
                >
                  <RefreshCw className={`w-3 h-3 ${syncingChannel === 'WooCommerce' ? 'animate-spin text-blue-600' : ''}`} />
                </Button>
              )}
            </div>

            <form onSubmit={handleConnectWoo} className="space-y-3 pt-4">
              <Input 
                label="WordPress Store URL" 
                placeholder="https://store.apexwear.com" 
                value={wooUrl}
                onChange={(e) => setWooUrl(e.target.value)}
                disabled={wooConnected}
              />
              {!wooConnected && (
                <Input 
                  label="Consumer Key (ck_...)" 
                  placeholder="ck_xxxxxxxxxxxx" 
                  value={wooConsumerKey}
                  onChange={(e) => setWooConsumerKey(e.target.value)}
                />
              )}

              {wooConnected ? (
                <div className="space-y-3 pt-1">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">Tracking Push: Active</span>
                    <span className="text-[11px] text-emerald-600 font-bold">2-Way Sync</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-slate-500">Polled Every 10 Mins</span>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                      onClick={() => {
                        setWooConnected(false);
                        toast.info('WooCommerce store disconnected.');
                      }}
                    >
                      Disconnect
                    </Button>
                  </div>
                </div>
              ) : (
                <Button type="submit" size="sm" variant="outline" className="w-full text-xs font-bold border-purple-300 text-purple-700 hover:bg-purple-50">
                  Connect WooCommerce
                </Button>
              )}
            </form>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Requires WooCommerce 7.0+ &amp; SSL</span>
            <span className="text-slate-600">REST v3 Engine</span>
          </div>
        </div>

        {/* Amazon India SP-API Connector Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center font-black text-lg">
                  A
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-black text-slate-900 font-display">Amazon India (SP-API)</h2>
                    {amazonConnected ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold">
                        Available
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 font-medium">Selling Partner API, Easy Ship &amp; Self-Ship sync</span>
                </div>
              </div>

              {amazonConnected && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs h-8 px-2.5" 
                  onClick={() => handleSyncChannel('Amazon India')}
                  disabled={syncingChannel === 'Amazon India'}
                >
                  <RefreshCw className={`w-3 h-3 ${syncingChannel === 'Amazon India' ? 'animate-spin text-blue-600' : ''}`} />
                </Button>
              )}
            </div>

            <form onSubmit={handleConnectAmazon} className="space-y-3 pt-4">
              <Input 
                label="Amazon Merchant Token / Seller ID" 
                placeholder="e.g. A21TJRUUN4KGV" 
                value={amazonSellerId}
                onChange={(e) => setAmazonSellerId(e.target.value)}
                disabled={amazonConnected}
              />

              {amazonConnected ? (
                <div className="space-y-3 pt-1">
                  <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/60 flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-900">Easy Ship Sync: Enabled</span>
                    <span className="text-[11px] text-amber-700 font-semibold">Region: IN</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-slate-500">Auto-Generates Shipping Labels</span>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                      onClick={() => {
                        setAmazonConnected(false);
                        toast.info('Amazon SP-API disconnected.');
                      }}
                    >
                      Disconnect
                    </Button>
                  </div>
                </div>
              ) : (
                <Button type="submit" size="sm" variant="outline" className="w-full text-xs font-bold border-amber-300 text-amber-800 hover:bg-amber-50">
                  Authorize Amazon SP-API
                </Button>
              )}
            </form>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>OAuth 2.0 LWA Token Auth</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <Check className="w-3 h-3" /> Auto-Manifest
            </span>
          </div>
        </div>

        {/* Flipkart Marketplace Connector Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center font-black text-lg">
                  F
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-black text-slate-900 font-display">Flipkart Marketplace</h2>
                    {flipkartConnected ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold">
                        Available
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 font-medium">Flipkart Seller Hub API, Smart fulfillment routing</span>
                </div>
              </div>

              {flipkartConnected && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs h-8 px-2.5" 
                  onClick={() => handleSyncChannel('Flipkart')}
                  disabled={syncingChannel === 'Flipkart'}
                >
                  <RefreshCw className={`w-3 h-3 ${syncingChannel === 'Flipkart' ? 'animate-spin text-blue-600' : ''}`} />
                </Button>
              )}
            </div>

            <form onSubmit={handleConnectFlipkart} className="space-y-3 pt-4">
              <Input 
                label="Flipkart Seller App ID" 
                placeholder="e.g. FK_SELLER_99214" 
                value={flipkartSellerId}
                onChange={(e) => setFlipkartSellerId(e.target.value)}
                disabled={flipkartConnected}
              />

              {flipkartConnected ? (
                <div className="space-y-3 pt-1">
                  <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-200/60 flex items-center justify-between text-xs">
                    <span className="font-bold text-sky-900">Pickup Dispatch: Synchronized</span>
                    <span className="text-[11px] text-sky-700 font-semibold">Tier: Gold</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-slate-500">Label Push: Immediate</span>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                      onClick={() => {
                        setFlipkartConnected(false);
                        toast.info('Flipkart marketplace disconnected.');
                      }}
                    >
                      Disconnect
                    </Button>
                  </div>
                </div>
              ) : (
                <Button type="submit" size="sm" variant="outline" className="w-full text-xs font-bold border-sky-300 text-sky-700 hover:bg-sky-50">
                  Connect Flipkart Seller Hub
                </Button>
              )}
            </form>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Flipkart Smart Fulfillment v2</span>
            <span className="text-slate-600">Secure Token Auth</span>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards: Developer Portal & Manual CSV Import */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-linear-to-r from-slate-900 to-slate-800 text-white p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-400" />
              <h3 className="font-extrabold text-sm font-display text-white">Custom ERP or Direct REST API?</h3>
            </div>
            <p className="text-xs text-slate-300">
              Manage your production API keys, HMAC webhook endpoints, and inspect raw JSON event logs.
            </p>
          </div>
          <Link to="/app/developers">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shrink-0 gap-1.5 ml-4">
              Developer Portal
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-emerald-600" />
              <h3 className="font-extrabold text-sm font-display text-slate-900">Bulk CSV/Excel Order Import</h3>
            </div>
            <p className="text-xs text-slate-500">
              Prefer uploading batches of orders offline? Use our drag-and-drop CSV importer with column mapping.
            </p>
          </div>
          <Link to="/app/orders/import">
            <Button size="sm" variant="outline" className="text-xs font-bold shrink-0 gap-1.5 ml-4 border-slate-300">
              Import Orders
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Sync Audit Stream */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 font-display">Recent Channel Sync Events</h3>
            <p className="text-xs text-slate-500">Live feed of order import events, inventory reconciliations, and tracking pushes</p>
          </div>
          <Badge variant="slate" size="sm">Audit Log</Badge>
        </div>

        <div className="divide-y divide-slate-100">
          {syncLogs.map((log) => (
            <div key={log.id} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                  {log.type === 'ORDER_IMPORT' ? <ShoppingBag className="w-4 h-4 text-blue-600" /> :
                   log.type === 'TRACKING_PUSH' ? <Activity className="w-4 h-4 text-emerald-600" /> :
                   <RefreshCw className="w-4 h-4 text-purple-600" />}
                </div>
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span>{log.channel}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-600 font-medium">
                      {log.type === 'ORDER_IMPORT' ? `Imported ${log.count} new orders` :
                       log.type === 'TRACKING_PUSH' ? `Pushed ${log.count} AWB tracking numbers` :
                       `Reconciled ${log.count} inventory SKUs`}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">{log.timestamp}</span>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                200 OK
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
