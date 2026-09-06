import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PublicNavbar, PublicFooter } from './PublicNav';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, Phone, MapPin, Send, Sparkles, Clock, Headset, ShieldCheck, 
  AlertTriangle, ChevronDown, ArrowRight, Building2, CheckCircle2, MessageSquare,
  Search, Calculator, Code2, Zap, ExternalLink, HelpCircle
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { toast } from 'sonner';
import { GlobalThreeBackground } from '../../components/ui/GlobalThreeBackground';

export const ContactPage: React.FC = () => {
  const [demoFullName, setDemoFullName] = useState('');
  const [demoWorkEmail, setDemoWorkEmail] = useState('');
  const [demoMobileNumber, setDemoMobileNumber] = useState('');
  const [demoCompanyName, setDemoCompanyName] = useState('');
  const [demoVolume, setDemoVolume] = useState('500–2,000');
  const [demoWebsite, setDemoWebsite] = useState('');
  const [demoRequirement, setDemoRequirement] = useState('');
  const [demoFormError, setDemoFormError] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const departments = [
    { 
      name: 'Sales & Custom Rate Cards', 
      email: 'sales@shipfasterlogistic.com', 
      phone: '+91 1800 123 4567 (Ext 1)', 
      icon: <Headset className="w-5 h-5 text-blue-400" />,
      tag: 'Rate Quotations'
    },
    { 
      name: 'Enterprise Accounts & APIs', 
      email: 'enterprise@shipfasterlogistic.com', 
      phone: '+91 1800 123 4567 (Ext 2)', 
      icon: <Building2 className="w-5 h-5 text-purple-400" />,
      tag: 'Custom Contracts'
    },
    { 
      name: 'Courier & Tracking Support', 
      email: 'support@shipfasterlogistic.com', 
      phone: '+91 1800 123 4567 (Ext 3)', 
      icon: <Clock className="w-5 h-5 text-amber-400" />,
      tag: 'Live Tracking'
    },
    { 
      name: 'COD Remittances & Billing', 
      email: 'finance@shipfasterlogistic.com', 
      phone: '+91 1800 123 4567 (Ext 4)', 
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      tag: 'T+2 Settlements'
    },
  ];

  const regionalHubs = [
    {
      city: 'Delhi NCR (North HQ)',
      tag: 'Corporate & Air Hub',
      address: 'DLF Cyber City, Phase III, Sector 24, Gurugram, Haryana - 122002',
      phone: '+91 124 456 7890',
      email: 'delhi.hub@shipfasterlogistic.com',
      status: 'Operational'
    },
    {
      city: 'Mumbai (Western Hub)',
      tag: 'B2C & Ocean Corridor',
      address: 'One BKC, G Block, Bandra Kurla Complex, Mumbai, Maharashtra - 400051',
      phone: '+91 22 265 4321',
      email: 'mumbai.hub@shipfasterlogistic.com',
      status: 'Operational'
    },
    {
      city: 'Bengaluru (Southern Hub)',
      tag: 'Tech & Fulfillment Node',
      address: 'ITPL Main Road, Whitefield, Bengaluru, Karnataka - 560066',
      phone: '+91 80 678 9012',
      email: 'blr.hub@shipfasterlogistic.com',
      status: 'Operational'
    },
    {
      city: 'Kolkata (Eastern Hub)',
      tag: 'East & NE Transit Center',
      address: 'Salt Lake City, Sector V, Bidhannagar, Kolkata, West Bengal - 700091',
      phone: '+91 33 235 7890',
      email: 'kolkata.hub@shipfasterlogistic.com',
      status: 'Operational'
    },
  ];

  const contactFaqs = [
    {
      q: 'How quickly does the sales team respond to demo requests?',
      a: 'A dedicated logistics specialist will reach out within 2 to 4 business hours to discuss your shipping volume, rate requirements, and store setup.'
    },
    {
      q: 'Where is the ShipFaster Logistic corporate office located?',
      a: 'Our corporate headquarters is located at Plot 42, Cyber City, Phase 3, Gurugram, Haryana - 122002.'
    },
    {
      q: 'What are the seller support desk operating hours?',
      a: 'Our support team is available Monday through Saturday from 9:00 AM to 8:00 PM IST via toll-free phone and email.'
    },
    {
      q: 'Can high-volume enterprise brands get a dedicated Key Account Manager (KAM)?',
      a: 'Yes! Sellers shipping over 2,000 orders per month are assigned a dedicated Key Account Manager for customized rate cards, API onboarding, and priority support.'
    },
    {
      q: 'How does your support team handle emergency NDRs or urgent delivery escalations?',
      a: 'Our automated NDR engine escalates non-delivery attempts immediately via courier APIs. For critical high-value parcels, our courier operations desk intervenes directly with the local destination hub.'
    },
    {
      q: 'Who do I contact for monthly GST tax invoices, billing queries, and COD remittance reports?',
      a: 'You can reach our dedicated Finance & Billing desk directly at finance@shipfasterlogistic.com or download automated GST invoices from the Billing section of your dashboard.'
    }
  ];

  const handleDemoFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDemoFormError('');

    if (!demoFullName.trim()) {
      setDemoFormError('Please enter your full name.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(demoWorkEmail.trim())) {
      setDemoFormError('Please enter a valid work email address.');
      return;
    }

    const mobileClean = demoMobileNumber.replace(/\D/g, '');
    if (mobileClean.length < 10 || mobileClean.length > 12) {
      setDemoFormError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    if (!demoCompanyName.trim()) {
      setDemoFormError('Please enter your company name.');
      return;
    }

    if (!demoRequirement.trim()) {
      setDemoFormError('Please detail your shipping requirement or message.');
      return;
    }

    toast.success('Thank you! Your demo request has been received. A logistics expert will reach out within 24 hours.');
    setDemoFullName('');
    setDemoWorkEmail('');
    setDemoMobileNumber('');
    setDemoCompanyName('');
    setDemoWebsite('');
    setDemoRequirement('');
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans relative overflow-x-hidden">
      <PublicNavbar />

      {/* Hero Header (White Theme, Consistent with Landing Page) */}
      <section className="relative py-12 sm:py-16 px-6 sm:px-8 bg-gradient-to-b from-blue-50/40 via-white to-white border-b border-slate-200/80 overflow-hidden text-center">
        {/* Three.js Dynamic Background Canvas (Exact match to Home Page) */}
        <div className="absolute inset-0 opacity-40 pointer-events-none z-0">
          <GlobalThreeBackground />
        </div>

        <div className="relative max-w-4xl mx-auto space-y-8 z-10">
          {/* Standardized Pill Chip Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-extrabold border border-blue-200/80 shadow-xs"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
            </span>
            <Headset className="w-3.5 h-3.5 text-blue-600" />
            <span className="uppercase tracking-wider">Seller Support &amp; Logistics Desk • 2-4 Hr Response Time</span>
          </motion.div>

          {/* Standardized Heading */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-2xl xs:text-3xl sm:text-5xl md:text-6xl lg:text-[66px] font-black font-display tracking-tight leading-[1.22] sm:leading-[1.24] max-w-5xl mx-auto text-slate-950"
          >
            Talk to Our{' '}
            <span className="inline-block pb-1 sm:pb-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
              Logistics Experts.
            </span>
          </motion.h1>

          {/* Subtitle Paragraph */}
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium mt-3 sm:mt-4"
          >
            Tell us about your monthly shipping volume, courier rate requirements, or custom store integration needs.
          </motion.p>

          {/* Live Metrics Ticker Bar (Light Theme, Consistent Height) */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="pt-6 border-t border-slate-200/80 flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-xs font-mono text-slate-600 max-w-3xl mx-auto"
          >
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-slate-900 font-bold">&lt; 2 Hrs Avg Response</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-2xs">
              <span className="text-blue-600 font-bold">Priority</span>
              <span>Onboarding Desk</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-2xs">
              <span className="text-emerald-600 font-bold">Dedicated</span>
              <span>Account Manager</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-2xs">
              <span className="text-indigo-600 font-bold">24/7</span>
              <span>NDR Escalation Support</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content: Form & Department Contacts */}
      <section className="py-10 sm:py-12 px-6 sm:px-8 max-w-7xl mx-auto w-full space-y-8 sm:space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
          {/* Department Contact Desk Cards */}
          <div className="md:col-span-5 space-y-6">
            <div className="space-y-3.5">
              <div className="inline-block">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-extrabold border border-blue-200/80 shadow-xs">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                  </span>
                  <Headset className="w-3.5 h-3.5 text-blue-600" />
                  <span className="uppercase tracking-wider">Direct Support Desks</span>
                </div>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-display tracking-tight leading-[1.18]">
                Department{' '}
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
                  Contacts
                </span>
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
                Reach out directly to the team specializing in your logistics requirement.
              </p>
            </div>

            <div className="space-y-4">
              {departments.map((dept, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  whileHover={{ scale: 1.01, y: -2 }}
                  className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-300 space-y-3 group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center shadow-md">
                        {dept.icon}
                      </div>
                      <h3 className="font-extrabold text-slate-900 text-sm font-display group-hover:text-blue-600 transition-colors">{dept.name}</h3>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200">
                      {dept.tag}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1.5 pl-13 font-mono font-medium">
                    <a href={`mailto:${dept.email}`} className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                      <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>{dept.email}</span>
                    </a>
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{dept.phone}</span>
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Corporate HQ Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="block font-black text-white text-xs uppercase tracking-widest font-display">Corporate Headquarters</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              </div>
              <p className="text-xs text-slate-300 flex items-start gap-2.5 leading-relaxed font-medium">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Plot 42, Cyber City, Phase 3, Gurugram, Haryana - 122002</span>
              </p>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Support Hours:</span>
                <span className="text-emerald-400 font-bold">Mon - Sat: 9 AM - 8 PM IST</span>
              </div>
            </motion.div>
          </div>

          {/* Book a Demo Sales Form */}
          <motion.form 
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            onSubmit={handleDemoFormSubmit} 
            className="md:col-span-7 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-xl space-y-5"
          >
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-extrabold border border-blue-200/80 shadow-xs">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                <Send className="w-3.5 h-3.5 text-blue-600" />
                <span className="uppercase tracking-wider">Schedule Consultation</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-display tracking-tight leading-[1.18]">
                Book a{' '}
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
                  Product Demo
                </span>
              </h3>
            </div>

            {demoFormError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{demoFormError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input 
                label="Full Name" 
                value={demoFullName} 
                onChange={(e) => setDemoFullName(e.target.value)} 
                placeholder="e.g. Rahul Sharma"
                required 
              />
              <Input 
                label="Work Email" 
                type="email" 
                value={demoWorkEmail} 
                onChange={(e) => setDemoWorkEmail(e.target.value)} 
                placeholder="e.g. rahul@brand.com"
                required 
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input 
                label="Mobile Number" 
                type="tel" 
                value={demoMobileNumber} 
                onChange={(e) => setDemoMobileNumber(e.target.value)} 
                placeholder="e.g. +91 98765 43210"
                required 
              />
              <Input 
                label="Company Name" 
                value={demoCompanyName} 
                onChange={(e) => setDemoCompanyName(e.target.value)} 
                placeholder="e.g. Acme Commerce Pvt Ltd"
                required 
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Monthly Shipment Volume</label>
                <select
                  value={demoVolume}
                  onChange={(e) => setDemoVolume(e.target.value)}
                  className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm font-medium cursor-pointer"
                >
                  <option value="0–100">0–100</option>
                  <option value="100–500">100–500</option>
                  <option value="500–2,000">500–2,000</option>
                  <option value="2,000–10,000">2,000–10,000</option>
                  <option value="10,000+">10,000+</option>
                </select>
              </div>

              <Input 
                label="Website (Optional)" 
                type="url" 
                value={demoWebsite} 
                onChange={(e) => setDemoWebsite(e.target.value)} 
                placeholder="e.g. https://brand.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Requirement / Message</label>
              <textarea
                rows={4}
                value={demoRequirement}
                onChange={(e) => setDemoRequirement(e.target.value)}
                className="w-full glass-input rounded-xl p-3.5 text-sm font-medium"
                placeholder="Tell us about your current courier stack, pain points, or custom API requirements..."
                required
              />
            </div>

            <Button type="submit" size="lg" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold shadow-lg shadow-blue-500/25 justify-center py-3.5">
              <span>Book a Demo</span>
              <ArrowRight className="w-5 h-5 ml-1" />
            </Button>
          </motion.form>
        </div>

        {/* Section: Pan-India Regional Logistics Hubs */}
        <div className="py-8 sm:py-10 border-t border-slate-200/80 space-y-6">
          <div className="text-center space-y-3.5 max-w-5xl mx-auto">
            <div className="inline-block">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-extrabold border border-blue-200/80 shadow-xs">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span className="uppercase tracking-wider">Regional Infrastructure</span>
              </div>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-display tracking-tight leading-[1.18] max-w-4xl mx-auto">
              Pan-India Regional{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
                Logistics Hubs
              </span>
            </h2>

            <p className="text-sm sm:text-base md:text-lg text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto">
              Strategic sorting centers, dispatch corridors, and regional operational offices across major commercial metros.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 pt-2">
            {regionalHubs.map((hub, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.08 }}
                whileHover={{ y: -3 }}
                className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-300 transition-all duration-200 flex flex-col justify-between space-y-3.5"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200/80">
                      {hub.tag}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/70">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {hub.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm font-display flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>{hub.city}</span>
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{hub.address}</span>
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-1 text-xs font-mono text-slate-600">
                  <a href={`tel:${hub.phone.replace(/\s+/g, '')}`} className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                    <Phone className="w-3 h-3 text-emerald-500 shrink-0" />
                    <span>{hub.phone}</span>
                  </a>
                  <a href={`mailto:${hub.email}`} className="flex items-center gap-1.5 hover:text-blue-600 transition-colors truncate">
                    <Mail className="w-3 h-3 text-blue-500 shrink-0" />
                    <span className="truncate">{hub.email}</span>
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Section: Instant Support & Quick Tools (Self-Serve Shortcuts) */}
        <div className="py-8 border-t border-slate-200/80 space-y-6">
          <div className="text-center space-y-3.5 max-w-5xl mx-auto">
            <div className="inline-block">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-extrabold border border-blue-200/80 shadow-xs">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                <Zap className="w-3.5 h-3.5 text-blue-600" />
                <span className="uppercase tracking-wider">Instant Resolution</span>
              </div>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-display tracking-tight leading-[1.18] max-w-4xl mx-auto">
              Instant Support &amp;{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
                Quick Tools
              </span>
            </h2>

            <p className="text-sm sm:text-base md:text-lg text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto">
              Looking for tracking updates, live shipping rates, or API documentation? Access quick shortcuts below.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5 items-stretch pt-2">
            {/* WhatsApp Quick Chat Card */}
            <motion.a
              href="https://wa.me/9118001234567?text=Hi%2C%20I%20would%20like%20to%20know%20more%20about%20ShipFaster%20courier%20rates." 
              target="_blank" 
              rel="noopener noreferrer"
              whileHover={{ scale: 1.01, y: -2 }}
              className="md:col-span-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/20 flex items-center justify-between gap-4 group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 shadow-inner">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-base font-display text-white">Quick Support on WhatsApp</h4>
                    <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1 border border-white/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      &lt; 5m reply
                    </span>
                  </div>
                  <p className="text-xs text-emerald-100 font-medium mt-0.5">Direct hotline to an active logistics specialist</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform shrink-0" />
            </motion.a>

            {/* Quick Self-Serve Tool 1: Track Active AWB */}
            <Link to="/track" className="md:col-span-2 block">
              <motion.div 
                whileHover={{ y: -3 }}
                className="h-full p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all duration-200 flex flex-col justify-between space-y-3"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Search className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 font-display">Track AWB</h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">Live parcel timeline</p>
                </div>
              </motion.div>
            </Link>

            {/* Quick Self-Serve Tool 2: Rate Calculator */}
            <Link to="/#calculator" className="md:col-span-2 block">
              <motion.div 
                whileHover={{ y: -3 }}
                className="h-full p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all duration-200 flex flex-col justify-between space-y-3"
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 font-display">Rate Engine</h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">Pincode freight quote</p>
                </div>
              </motion.div>
            </Link>

            {/* Quick Self-Serve Tool 3: Developer API Docs */}
            <Link to="/integrations" className="md:col-span-2 block">
              <motion.div 
                whileHover={{ y: -3 }}
                className="h-full p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all duration-200 flex flex-col justify-between space-y-3"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Code2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 font-display">API &amp; Docs</h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">REST API &amp; Webhooks</p>
                </div>
              </motion.div>
            </Link>
          </div>
        </div>

        {/* Contact FAQs Accordion — Clean Hairline Accordion (No Boxed Cards) */}
        <div className="py-8 sm:py-10 border-t border-slate-200/80 space-y-8">
          <div className="text-center space-y-3.5 max-w-5xl mx-auto">
            <div className="inline-block">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-extrabold border border-blue-200/80 shadow-xs">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                <span className="uppercase tracking-wider">Support FAQs</span>
              </div>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-display tracking-tight leading-[1.18] max-w-4xl mx-auto">
              Frequently Asked{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
                Questions
              </span>
            </h2>

            <p className="text-sm sm:text-base md:text-lg text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto">
              Everything you need to know about contacting our team and getting onboarded.
            </p>
          </div>

          <div className="divide-y divide-slate-200/80 max-w-3xl mx-auto">
            {contactFaqs.map((faq, idx) => (
              <div key={idx} className="py-5 first:pt-0 last:pb-0">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left flex items-center justify-between font-bold text-slate-900 text-base sm:text-lg hover:text-blue-600 transition-colors cursor-pointer group"
                >
                  <span className="pr-4 group-hover:translate-x-0.5 transition-transform">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${openFaq === idx ? 'rotate-180 text-blue-600' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="pt-3 text-sm text-slate-600 leading-relaxed font-medium"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};
