import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Palette, Globe, Image, Tag, Phone, Mail, MessageSquare, 
  ExternalLink, Sparkles, CheckCircle2, ShieldCheck, Eye, Smartphone, Copy
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { usePlatformStore } from '../../services/store';
import { toast } from 'sonner';

export const BrandedTrackingCustomizerPage: React.FC = () => {
  const { brandedTrackingConfig, updateBrandedTrackingConfig } = usePlatformStore();

  const [brandName, setBrandName] = useState(brandedTrackingConfig?.brand_name || '');
  const [logoUrl, setLogoUrl] = useState(brandedTrackingConfig?.logo_url || '');
  const [brandColor, setBrandColor] = useState(brandedTrackingConfig?.brand_color || '#4f46e5');
  const [supportPhone, setSupportPhone] = useState(brandedTrackingConfig?.support_phone || '');
  const [supportEmail, setSupportEmail] = useState(brandedTrackingConfig?.support_email || '');
  const [promoBannerUrl, setPromoBannerUrl] = useState(brandedTrackingConfig?.promotional_banner_url || '');
  const [promoLink, setPromoLink] = useState(brandedTrackingConfig?.promotional_banner_link || '');
  const [couponCode, setCouponCode] = useState(brandedTrackingConfig?.discount_coupon_code || '');
  const [discountPercent, setDiscountPercent] = useState<number>(brandedTrackingConfig?.discount_percentage || 0);
  const [customDomain, setCustomDomain] = useState(brandedTrackingConfig?.custom_domain || '');

  useEffect(() => {
    setBrandName(brandedTrackingConfig?.brand_name || '');
    setLogoUrl(brandedTrackingConfig?.logo_url || '');
    setBrandColor(brandedTrackingConfig?.brand_color || '#4f46e5');
    setSupportPhone(brandedTrackingConfig?.support_phone || '');
    setSupportEmail(brandedTrackingConfig?.support_email || '');
    setPromoBannerUrl(brandedTrackingConfig?.promotional_banner_url || '');
    setPromoLink(brandedTrackingConfig?.promotional_banner_link || '');
    setCouponCode(brandedTrackingConfig?.discount_coupon_code || '');
    setDiscountPercent(brandedTrackingConfig?.discount_percentage || 0);
    setCustomDomain(brandedTrackingConfig?.custom_domain || '');
  }, [brandedTrackingConfig]);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateBrandedTrackingConfig({
      brand_name: brandName,
      logo_url: logoUrl,
      brand_color: brandColor,
      support_phone: supportPhone,
      support_email: supportEmail,
      promotional_banner_url: promoBannerUrl,
      promotional_banner_link: promoLink,
      discount_coupon_code: couponCode,
      discount_percentage: discountPercent,
      custom_domain: customDomain,
    });
    toast.success('Branded customer tracking page updated live!');
  };

  return (
    <div className="space-y-6 animate-fadeIn text-slate-900">
      {/* Page Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 font-display flex items-center gap-2">
            <Palette className="w-5 h-5 text-indigo-600" /> Post-Purchase Branded Tracking Page
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Turn order tracking into a high-converting repeat sales channel with your brand logo, custom domain, and promo banners
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/app/tracking">
            <Button size="sm" variant="outline" leftIcon={<Eye className="w-3.5 h-3.5" />}>
              Test AWB Tracking
            </Button>
          </Link>
          <a
            href={`http://${customDomain}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            <span>{customDomain}</span>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form (7 Cols) */}
        <form onSubmit={handleSaveConfig} className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          {/* Brand Identity */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider font-display flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" /> 1. Brand Identity &amp; Colors
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Brand / Store Name"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Apex Retail"
                required
              />

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Primary Theme Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="w-10 h-10 rounded-xl border border-slate-300 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="flex-1 text-xs font-mono font-bold px-3 py-2 border border-slate-300 rounded-xl uppercase"
                  />
                </div>
              </div>
            </div>

            <Input
              label="Brand Logo URL (PNG/SVG)"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://yourstore.com/logo.png"
            />
          </div>

          {/* Support Channels */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider font-display flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-600" /> 2. Customer Support Desk
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Support Helpline / WhatsApp"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                placeholder="+91 98765 43210"
              />
              <Input
                label="Support Email Address"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                placeholder="care@yourstore.com"
              />
            </div>
          </div>

          {/* Marketing & Cross-sell */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider font-display flex items-center gap-2">
              <Tag className="w-4 h-4 text-amber-500" /> 3. Post-Purchase Repeat Sales &amp; Coupons
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Repeat Purchase Discount Coupon"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="SAVE15"
              />
              <Input
                label="Discount Percentage (%)"
                type="number"
                value={discountPercent.toString()}
                onChange={(e) => setDiscountPercent(parseInt(e.target.value) || 0)}
                placeholder="15"
              />
            </div>

            <Input
              label="Promotional Marketing Banner URL"
              value={promoBannerUrl}
              onChange={(e) => setPromoBannerUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-promo.jpg"
            />
            <Input
              label="Banner Click Destination Link"
              value={promoLink}
              onChange={(e) => setPromoLink(e.target.value)}
              placeholder="https://yourstore.com/festive-sale"
            />
          </div>

          {/* Custom Domain */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider font-display flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-600" /> 4. White-Label Custom Domain
            </h3>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  className="flex-1 text-xs font-bold px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  placeholder="track.yourbrand.com"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Point a <strong>CNAME record</strong> for <code className="text-indigo-600 font-bold">{customDomain}</code> to <code className="text-slate-800 font-bold">cname.shipfaster.local</code> to activate your free SSL certificate.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6">
              Save &amp; Publish Branded Page
            </Button>
          </div>
        </form>

        {/* Right Phone Mockup (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="sticky top-6 w-full max-w-[340px] bg-slate-950 p-4 rounded-[40px] border-[6px] border-slate-800 shadow-2xl space-y-3 text-xs">
            {/* Phone Speaker & Notch */}
            <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto" />

            {/* Mobile Screen Inside */}
            <div className="bg-slate-50 rounded-[28px] overflow-hidden border border-slate-200 shadow-inner flex flex-col min-h-[580px]">
              {/* Header Bar with Seller Brand */}
              <div 
                className="p-4 text-white flex items-center justify-between"
                style={{ backgroundColor: brandColor }}
              >
                <div className="flex items-center gap-2">
                  <img src={logoUrl} alt="Logo" className="w-7 h-7 rounded-lg object-cover bg-white p-0.5" />
                  <span className="font-extrabold text-sm tracking-tight">{brandName}</span>
                </div>
                <span className="text-[9px] font-black uppercase bg-white/20 px-2 py-0.5 rounded-full">
                  Help
                </span>
              </div>

              {/* Order Status Hero Card */}
              <div className="p-4 space-y-3 bg-white border-b border-slate-100">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Order Tracking</span>
                    <span className="font-black text-sm text-slate-900 font-mono">AWB #DEL9948271049</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                    OUT FOR DELIVERY
                  </span>
                </div>

                {/* Simulated Step Progress */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-600">
                    <span>Order Placed</span>
                    <span>In-Transit</span>
                    <span className="text-indigo-600">Arriving Today</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: '85%', backgroundColor: brandColor }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 block text-center font-medium">
                    Expected by 6:00 PM today with Delhivery Rider
                  </span>
                </div>
              </div>

              {/* Promotional Marketing Banner */}
              {promoBannerUrl && (
                <div className="p-3">
                  <div className="rounded-2xl overflow-hidden shadow-sm relative group cursor-pointer border border-slate-200">
                    <img src={promoBannerUrl} alt="Promo" className="w-full h-24 object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent flex items-end p-2.5">
                      <span className="text-[11px] text-white font-extrabold flex items-center gap-1">
                        Special Offer: Shop New Collection →
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Discount Coupon Box */}
              {couponCode && (
                <div className="px-3 pb-3">
                  <div className="p-3 rounded-2xl bg-amber-50 border border-dashed border-amber-300 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-amber-900 font-extrabold uppercase block">Exclusive {discountPercent}% Off Next Order</span>
                      <span className="font-mono font-black text-sm text-slate-900">{couponCode}</span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => toast.success(`Coupon ${couponCode} copied to clipboard!`)}
                      className="p-1.5 bg-amber-200 text-amber-950 rounded-lg text-[10px] font-black uppercase cursor-pointer"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}

              {/* Support Contact Footer inside preview */}
              <div className="mt-auto p-4 bg-slate-100/80 border-t border-slate-200 text-center space-y-1">
                <span className="text-[10px] text-slate-500 block font-semibold">Need help with your order?</span>
                <div className="flex justify-center gap-3 text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-indigo-600" /> {supportPhone}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <span className="text-xs text-slate-500 font-bold mt-3 flex items-center gap-1">
            <Smartphone className="w-4 h-4 text-slate-400" /> Live Customer Tracking Mobile View
          </span>
        </div>
      </div>
    </div>
  );
};
