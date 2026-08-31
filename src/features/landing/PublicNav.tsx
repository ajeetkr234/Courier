import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { ArrowRight, Sparkles, Menu, X, ChevronRight, Phone, Mail, MapPin } from 'lucide-react';

export const PublicNavbar: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAnnouncementVisible, setIsAnnouncementVisible] = useState(true);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="sticky top-0 z-50">
      {/* Slim Professional Announcement Bar */}
      {isAnnouncementVisible && (
        <div className="bg-blue-600 text-white text-[11px] sm:text-xs font-semibold py-1.5 px-3 sm:px-6 flex items-center justify-between shadow-xs transition-all relative">
          <div className="flex-1 flex items-center justify-center gap-2 truncate">
            <span className="truncate">Special Offer — 15% Off Your First 100 Shipments</span>
            <Link 
              to="/register" 
              className="inline-flex items-center font-bold text-white hover:text-blue-100 underline decoration-white/60 underline-offset-2 shrink-0 transition-colors"
            >
              Claim Offer →
            </Link>
          </div>
          <button
            onClick={() => setIsAnnouncementVisible(false)}
            className="text-white/80 hover:text-white p-0.5 rounded-md hover:bg-blue-700/60 transition-colors shrink-0 ml-2"
            aria-label="Dismiss Announcement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Enterprise Navbar */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center font-black text-white shadow-md text-lg font-display">
              S
            </div>
            <div>
              <span className="font-black text-lg sm:text-xl tracking-tight text-slate-900 font-display">ShipSmarter</span>
              <span className="block text-[8px] sm:text-[9px] font-extrabold text-blue-600 uppercase tracking-widest">Multi-Courier Aggregator</span>
            </div>
          </Link>

          {/* Desktop Navigation Links — Dedicated Standalone Pages */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-bold text-slate-600">
            <Link 
              to="/" 
              className={`transition-colors py-1 ${isActive('/') ? 'text-blue-600 font-extrabold border-b-2 border-blue-600' : 'hover:text-blue-600'}`}
            >
              Home
            </Link>
            <Link 
              to="/features" 
              className={`transition-colors py-1 ${isActive('/features') ? 'text-blue-600 font-extrabold border-b-2 border-blue-600' : 'hover:text-blue-600'}`}
            >
              Features
            </Link>
            <Link 
              to="/integrations" 
              className={`transition-colors py-1 ${isActive('/integrations') ? 'text-blue-600 font-extrabold border-b-2 border-blue-600' : 'hover:text-blue-600'}`}
            >
              Integrations
            </Link>
            <Link 
              to="/pricing" 
              className={`transition-colors py-1 ${isActive('/pricing') ? 'text-blue-600 font-extrabold border-b-2 border-blue-600' : 'hover:text-blue-600'}`}
            >
              Pricing
            </Link>
            <Link 
              to="/track" 
              className={`transition-colors py-1 ${isActive('/track') ? 'text-blue-600 font-extrabold border-b-2 border-blue-600' : 'hover:text-blue-600'}`}
            >
              Track Order
            </Link>
            <Link 
              to="/contact" 
              className={`transition-colors py-1 ${isActive('/contact') ? 'text-blue-600 font-extrabold border-b-2 border-blue-600' : 'hover:text-blue-600'}`}
            >
              Contact
            </Link>
          </nav>

          {/* Desktop Right CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="font-bold text-slate-700 hover:text-blue-600">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>Start Shipping</Button>
            </Link>
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-blue-600 rounded-xl hover:bg-slate-100 transition-colors"
              aria-label="Toggle Mobile Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-slate-200 bg-white px-6 py-4 space-y-3 font-semibold text-sm shadow-xl max-h-[80vh] overflow-y-auto">
            <Link 
              to="/" 
              onClick={() => setMobileMenuOpen(false)} 
              className={`flex items-center justify-between py-2.5 border-b border-slate-100 ${isActive('/') ? 'text-blue-600 font-extrabold' : 'text-slate-700 hover:text-blue-600'}`}
            >
              <span>Home</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>
            <Link 
              to="/features" 
              onClick={() => setMobileMenuOpen(false)} 
              className={`flex items-center justify-between py-2.5 border-b border-slate-100 ${isActive('/features') ? 'text-blue-600 font-extrabold' : 'text-slate-700 hover:text-blue-600'}`}
            >
              <span>Features</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>
            <Link 
              to="/integrations" 
              onClick={() => setMobileMenuOpen(false)} 
              className={`flex items-center justify-between py-2.5 border-b border-slate-100 ${isActive('/integrations') ? 'text-blue-600 font-extrabold' : 'text-slate-700 hover:text-blue-600'}`}
            >
              <span>Integrations</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>
            <Link 
              to="/pricing" 
              onClick={() => setMobileMenuOpen(false)} 
              className={`flex items-center justify-between py-2.5 border-b border-slate-100 ${isActive('/pricing') ? 'text-blue-600 font-extrabold' : 'text-slate-700 hover:text-blue-600'}`}
            >
              <span>Pricing</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>
            <Link 
              to="/track" 
              onClick={() => setMobileMenuOpen(false)} 
              className={`flex items-center justify-between py-2.5 border-b border-slate-100 ${isActive('/track') ? 'text-blue-600 font-extrabold' : 'text-slate-700 hover:text-blue-600'}`}
            >
              <span>Track Order</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>
            <Link 
              to="/contact" 
              onClick={() => setMobileMenuOpen(false)} 
              className={`flex items-center justify-between py-2.5 border-b border-slate-100 ${isActive('/contact') ? 'text-blue-600 font-extrabold' : 'text-slate-700 hover:text-blue-600'}`}
            >
              <span>Contact</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>
            
            <div className="pt-3 flex flex-col gap-2.5">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full justify-center">Sign In to Dashboard</Button>
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full justify-center" rightIcon={<ArrowRight className="w-4 h-4" />}>Start Shipping</Button>
              </Link>
            </div>
          </div>
        )}
      </header>
    </div>
  );
};

export const PublicFooter: React.FC = () => {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <motion.footer 
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="border-t border-slate-200 bg-slate-50 pt-12 sm:pt-16 pb-12 px-4 sm:px-6 lg:px-8 mt-auto"
    >
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
        {/* Brand Header */}
        <div className="space-y-3 pb-8 border-b border-slate-200/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-lg font-display shadow-xs">
              S
            </div>
            <span className="font-black text-2xl text-slate-900 font-display">ShipSmarter</span>
          </div>
          <p className="text-xs text-slate-600 max-w-2xl font-medium leading-relaxed">
            Multi-courier shipping platform for Indian businesses. Compare carrier rates, automate pickups, track shipments, and manage COD settlements from one dashboard.
          </p>
        </div>

        {/* Desktop 5-Column Grid */}
        <div className="hidden sm:grid grid-cols-2 md:grid-cols-5 gap-8 text-xs text-slate-600">
          {/* Column 1: SERVICES */}
          <div className="space-y-4">
            <h4 className="font-black text-slate-900 uppercase text-xs tracking-wider font-display">SERVICES</h4>
            <ul className="space-y-2.5 font-medium">
              <li><Link to="/features" className="hover:text-blue-600 transition-colors">Multi-Courier Shipping</Link></li>
              <li><Link to="/features" className="hover:text-blue-600 transition-colors">Rate Calculator</Link></li>
              <li><Link to="/track" className="hover:text-blue-600 transition-colors">Shipment Tracking</Link></li>
              <li><Link to="/features" className="hover:text-blue-600 transition-colors">NDR & RTO Recovery</Link></li>
              <li><Link to="/features" className="hover:text-blue-600 transition-colors">COD Remittance</Link></li>
            </ul>
          </div>

          {/* Column 2: INTEGRATIONS */}
          <div className="space-y-4">
            <h4 className="font-black text-slate-900 uppercase text-xs tracking-wider font-display">INTEGRATIONS</h4>
            <ul className="space-y-2.5 font-medium">
              <li><Link to="/integrations" className="hover:text-blue-600 transition-colors">Shopify</Link></li>
              <li><Link to="/integrations" className="hover:text-blue-600 transition-colors">WooCommerce</Link></li>
              <li><Link to="/integrations" className="hover:text-blue-600 transition-colors">REST API</Link></li>
              <li><Link to="/integrations" className="hover:text-blue-600 transition-colors">CSV / Excel Import</Link></li>
            </ul>
          </div>

          {/* Column 3: RESOURCES */}
          <div className="space-y-4">
            <h4 className="font-black text-slate-900 uppercase text-xs tracking-wider font-display">RESOURCES</h4>
            <ul className="space-y-2.5 font-medium">
              <li><Link to="/contact" className="hover:text-blue-600 transition-colors">Help Center</Link></li>
              <li><Link to="/integrations" className="hover:text-blue-600 transition-colors">API Documentation</Link></li>
              <li><Link to="/contact" className="hover:text-blue-600 transition-colors">FAQs</Link></li>
            </ul>
          </div>

          {/* Column 4: COMPANY & LEGAL */}
          <div className="space-y-4">
            <h4 className="font-black text-slate-900 uppercase text-xs tracking-wider font-display">COMPANY</h4>
            <ul className="space-y-2.5 font-medium">
              <li><Link to="/about" className="hover:text-blue-600 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-blue-600 transition-colors">Contact Support</Link></li>
              <li><span className="text-slate-500">Privacy Policy</span></li>
              <li><span className="text-slate-500">Terms of Service</span></li>
            </ul>
          </div>

          {/* Column 5: CONTACT */}
          <div className="space-y-4">
            <h4 className="font-black text-slate-900 uppercase text-xs tracking-wider font-display">CONTACT</h4>
            <div className="space-y-2.5 font-medium text-slate-600">
              <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-blue-600 shrink-0" /> +91 1800 123 4567</p>
              <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-blue-600 shrink-0" /> support@shipsmarter.com</p>
              <p className="flex items-start gap-2 text-slate-500 leading-relaxed pt-1">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>Plot 42, Cyber City, Phase 3, Gurugram, Haryana - 122002</span>
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Accordion Groups */}
        <div className="sm:hidden space-y-3 text-xs text-slate-600">
          {/* Services Accordion */}
          <div className="border-b border-slate-200 pb-3">
            <button 
              onClick={() => toggleSection('services')}
              className="w-full flex items-center justify-between font-black text-slate-900 uppercase text-xs tracking-wider font-display py-1"
            >
              <span>SERVICES</span>
              <ChevronRight className={`w-4 h-4 transition-transform ${openSection === 'services' ? 'rotate-90 text-blue-600' : 'text-slate-400'}`} />
            </button>
            {openSection === 'services' && (
              <ul className="mt-2.5 space-y-2 font-medium pl-1">
                <li><Link to="/features" className="hover:text-blue-600 transition-colors">Multi-Courier Shipping</Link></li>
                <li><Link to="/features" className="hover:text-blue-600 transition-colors">Rate Calculator</Link></li>
                <li><Link to="/track" className="hover:text-blue-600 transition-colors">Shipment Tracking</Link></li>
                <li><Link to="/features" className="hover:text-blue-600 transition-colors">NDR & RTO Recovery</Link></li>
                <li><Link to="/features" className="hover:text-blue-600 transition-colors">COD Remittance</Link></li>
              </ul>
            )}
          </div>

          {/* Integrations Accordion */}
          <div className="border-b border-slate-200 pb-3">
            <button 
              onClick={() => toggleSection('integrations')}
              className="w-full flex items-center justify-between font-black text-slate-900 uppercase text-xs tracking-wider font-display py-1"
            >
              <span>INTEGRATIONS</span>
              <ChevronRight className={`w-4 h-4 transition-transform ${openSection === 'integrations' ? 'rotate-90 text-blue-600' : 'text-slate-400'}`} />
            </button>
            {openSection === 'integrations' && (
              <ul className="mt-2.5 space-y-2 font-medium pl-1">
                <li><Link to="/integrations" className="hover:text-blue-600 transition-colors">Shopify</Link></li>
                <li><Link to="/integrations" className="hover:text-blue-600 transition-colors">WooCommerce</Link></li>
                <li><Link to="/integrations" className="hover:text-blue-600 transition-colors">REST API</Link></li>
                <li><Link to="/integrations" className="hover:text-blue-600 transition-colors">CSV / Excel Import</Link></li>
              </ul>
            )}
          </div>

          {/* Resources Accordion */}
          <div className="border-b border-slate-200 pb-3">
            <button 
              onClick={() => toggleSection('resources')}
              className="w-full flex items-center justify-between font-black text-slate-900 uppercase text-xs tracking-wider font-display py-1"
            >
              <span>RESOURCES</span>
              <ChevronRight className={`w-4 h-4 transition-transform ${openSection === 'resources' ? 'rotate-90 text-blue-600' : 'text-slate-400'}`} />
            </button>
            {openSection === 'resources' && (
              <ul className="mt-2.5 space-y-2 font-medium pl-1">
                <li><Link to="/contact" className="hover:text-blue-600 transition-colors">Help Center</Link></li>
                <li><Link to="/integrations" className="hover:text-blue-600 transition-colors">API Documentation</Link></li>
                <li><Link to="/contact" className="hover:text-blue-600 transition-colors">FAQs</Link></li>
              </ul>
            )}
          </div>

          {/* Company Accordion */}
          <div className="border-b border-slate-200 pb-3">
            <button 
              onClick={() => toggleSection('company')}
              className="w-full flex items-center justify-between font-black text-slate-900 uppercase text-xs tracking-wider font-display py-1"
            >
              <span>COMPANY &amp; LEGAL</span>
              <ChevronRight className={`w-4 h-4 transition-transform ${openSection === 'company' ? 'rotate-90 text-blue-600' : 'text-slate-400'}`} />
            </button>
            {openSection === 'company' && (
              <ul className="mt-2.5 space-y-2 font-medium pl-1">
                <li><Link to="/about" className="hover:text-blue-600 transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-blue-600 transition-colors">Contact Support</Link></li>
                <li><span className="text-slate-500">Privacy Policy</span></li>
                <li><span className="text-slate-500">Terms of Service</span></li>
              </ul>
            )}
          </div>

          {/* Mobile Direct Contact Details */}
          <div className="pt-2 space-y-2 font-medium text-slate-600">
            <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-blue-600 shrink-0" /> +91 1800 123 4567</p>
            <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-blue-600 shrink-0" /> support@shipsmarter.com</p>
            <p className="flex items-start gap-2 text-slate-500 leading-relaxed pt-1">
              <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>Plot 42, Cyber City, Phase 3, Gurugram, Haryana - 122002</span>
            </p>
          </div>
        </div>

        {/* Bottom Bar Copyright */}
        <div className="pt-8 border-t border-slate-200/80 text-center text-xs font-semibold text-slate-500">
          <p>© 2026 ShipSmarter. All rights reserved.</p>
        </div>
      </div>
    </motion.footer>
  );
};
