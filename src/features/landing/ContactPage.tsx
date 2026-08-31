import React, { useState } from 'react';
import { PublicNavbar, PublicFooter } from './PublicNav';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, Phone, MapPin, Send, Sparkles, Clock, Headset, ShieldCheck, 
  AlertTriangle, ChevronDown, ArrowRight, Building2, CheckCircle2, MessageSquare
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { toast } from 'sonner';

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
      email: 'sales@shipsmarter.com', 
      phone: '+91 1800 123 4567 (Ext 1)', 
      icon: <Headset className="w-5 h-5 text-blue-400" />,
      tag: 'Rate Quotations'
    },
    { 
      name: 'Enterprise Accounts & APIs', 
      email: 'enterprise@shipsmarter.com', 
      phone: '+91 1800 123 4567 (Ext 2)', 
      icon: <Building2 className="w-5 h-5 text-purple-400" />,
      tag: 'Custom Contracts'
    },
    { 
      name: 'Courier & Tracking Support', 
      email: 'support@shipsmarter.com', 
      phone: '+91 1800 123 4567 (Ext 3)', 
      icon: <Clock className="w-5 h-5 text-amber-400" />,
      tag: 'Live Tracking'
    },
    { 
      name: 'COD Remittances & Billing', 
      email: 'finance@shipsmarter.com', 
      phone: '+91 1800 123 4567 (Ext 4)', 
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      tag: 'T+2 Settlements'
    },
  ];

  const contactFaqs = [
    {
      q: 'How quickly does the sales team respond to demo requests?',
      a: 'A dedicated logistics specialist will reach out within 2 to 4 business hours to discuss your shipping volume, rate requirements, and store setup.'
    },
    {
      q: 'Where is the ShipSmarter corporate office located?',
      a: 'Our corporate headquarters is located at Plot 42, Cyber City, Phase 3, Gurugram, Haryana - 122002.'
    },
    {
      q: 'What are the seller support desk operating hours?',
      a: 'Our support team is available Monday through Saturday from 9:00 AM to 8:00 PM IST via toll-free phone and email.'
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans overflow-x-hidden">
      <PublicNavbar />

      <section className="relative py-10 sm:py-14 px-6 sm:px-8 bg-slate-950 text-white border-b border-slate-800 overflow-hidden text-center">
        <div className="relative max-w-4xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-extrabold shadow-sm"
          >
            <Headset className="w-4 h-4 text-blue-400" />
            <span>Seller Support & Logistics Desk • 2-4 Hr Response Time</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-black font-display tracking-tight leading-tight max-w-4xl mx-auto text-white"
          >
            Talk to Our Logistics Experts.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium"
          >
            Tell us about your monthly shipping volume, courier rate requirements, or custom store integration needs.
          </motion.p>
        </div>
      </section>

      {/* Main Content: Form & Department Contacts */}
      <section className="py-10 sm:py-12 px-6 sm:px-8 max-w-7xl mx-auto w-full space-y-8 sm:space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
          {/* Department Contact Desk Cards */}
          <div className="md:col-span-5 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 font-display">DIRECT DESKS</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">Department Contacts</h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">Reach out directly to the team specializing in your logistics requirement.</p>
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
            <div className="space-y-1">
              <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 font-display">SCHEDULE CONSULTATION</span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">Book a Product Demo</h3>
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

        {/* Contact FAQs Accordion */}
        <div className="bg-slate-100/70 p-8 sm:p-12 rounded-3xl border border-slate-200/90 shadow-md space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 font-display">SUPPORT FAQS</span>
            <h3 className="text-2xl sm:text-4xl font-black text-slate-900 font-display tracking-tight">Frequently Asked Questions</h3>
          </div>

          <div className="space-y-3 max-w-3xl mx-auto">
            {contactFaqs.map((faq, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between font-bold text-slate-900 text-sm sm:text-base hover:text-blue-600 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${openFaq === idx ? 'rotate-180 text-blue-600' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium border-t border-slate-200 pt-3"
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
