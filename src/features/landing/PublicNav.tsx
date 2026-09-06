import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { ArrowRight, Menu, X, ChevronRight, Phone, Mail, MapPin } from 'lucide-react';

export const PublicNavbar: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAnnouncementVisible, setIsAnnouncementVisible] = useState(true);
  const [isNavHidden, setIsNavHidden] = useState(false);

  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Always show near top of page (first 60px) or if mobile menu is open
      if (currentScrollY <= 60 || mobileMenuOpen) {
        setIsNavHidden(false);
        lastScrollY.current = currentScrollY;
        return;
      }

      const diff = currentScrollY - lastScrollY.current;

      // Upward scroll -> reveal navbar immediately
      if (diff < -4) {
        setIsNavHidden(false);
        lastScrollY.current = currentScrollY;
      }
      // Downward scroll -> hide navbar
      else if (diff > 8) {
        setIsNavHidden(true);
        lastScrollY.current = currentScrollY;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mobileMenuOpen]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Features', path: '/features' },
    { label: 'Integrations', path: '/integrations' },
    { label: 'Pricing', path: '/pricing' },
    { label: 'Track Order', path: '/track' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <motion.div 
      variants={{
        visible: { y: '0%' },
        hidden: { y: '-100%' }
      }}
      animate={isNavHidden ? 'hidden' : 'visible'}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-50 will-change-transform"
    >
      {/* Slim Refined Top Promotional Bar with Continuous Marquee */}
      {isAnnouncementVisible && (
        <div className="bg-blue-600 text-white text-[11px] sm:text-xs font-semibold py-1.5 flex items-center overflow-hidden shadow-xs transition-all relative">
          <div className="flex-1 overflow-hidden relative">
            <div className="animate-infinite-marquee flex items-center">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="flex items-center gap-6 px-6 shrink-0">
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse shrink-0" />
                    <span>Special Offer — 15% Off Your First 100 Shipments</span>
                  </span>
                  <Link 
                    to="/register" 
                    className="inline-flex items-center font-bold text-white hover:text-amber-200 underline decoration-white/60 underline-offset-2 shrink-0 transition-colors"
                  >
                    Claim Offer →
                  </Link>
                  <span className="text-blue-300/60 font-mono select-none">•</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative z-10 pl-4 pr-3 bg-gradient-to-l from-blue-600 via-blue-600 to-transparent flex items-center shrink-0">
            <button
              onClick={() => setIsAnnouncementVisible(false)}
              className="text-white/80 hover:text-white p-0.5 rounded-md hover:bg-blue-700/80 transition-colors shrink-0 cursor-pointer"
              aria-label="Dismiss Announcement"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Enterprise Navbar — 72px Height with Balanced Spacing */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs h-[72px] flex items-center w-full">
        <div className="w-full mx-auto px-4 sm:px-8 lg:px-12 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center font-black text-white shadow-md text-lg font-display group-hover:scale-105 transition-transform duration-200">
              S
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-black text-lg sm:text-xl tracking-tight text-slate-900 font-display leading-tight">ShipSmarter</span>
              <span className="text-[8px] sm:text-[9px] font-extrabold text-blue-600 uppercase tracking-widest leading-none mt-0.5">Multi-Courier Aggregator</span>
            </div>
          </Link>

          {/* Desktop Navigation Links — Only Active Item gets Underline */}
          <nav className="hidden lg:flex items-center gap-8 text-xs">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link 
                  key={link.path}
                  to={link.path} 
                  className={`relative py-2.5 transition-colors ${
                    active 
                      ? 'text-blue-600 font-extrabold' 
                      : 'text-slate-600 hover:text-blue-600 font-semibold'
                  }`}
                >
                  {link.label}
                  {active && (
                    <motion.div 
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right CTAs */}
          <div className="hidden sm:flex items-center gap-3.5">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="font-bold text-slate-700 hover:text-blue-600 px-3">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button 
                size="sm" 
                className="font-bold shadow-xs hover:shadow-md hover:shadow-blue-500/20 hover:-translate-y-0.5 transition-all duration-200 group"
                rightIcon={<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />}
              >
                Start Shipping
              </Button>
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
          <div className="absolute top-[72px] left-0 right-0 lg:hidden border-b border-slate-200 bg-white px-6 py-4 space-y-3 font-semibold text-sm shadow-xl max-h-[80vh] overflow-y-auto">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link 
                  key={link.path}
                  to={link.path} 
                  onClick={() => setMobileMenuOpen(false)} 
                  className={`flex items-center justify-between py-2.5 border-b border-slate-100 ${
                    active ? 'text-blue-600 font-extrabold' : 'text-slate-700 hover:text-blue-600'
                  }`}
                >
                  <span>{link.label}</span>
                  <ChevronRight className={`w-4 h-4 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                </Link>
              );
            })}
            
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
    </motion.div>
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
      className="border-t border-slate-200 bg-slate-50 pt-12 sm:pt-16 pb-12 px-4 sm:px-8 lg:px-12 mt-auto w-full"
    >
      <div className="w-full mx-auto space-y-8 sm:space-y-12">
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
