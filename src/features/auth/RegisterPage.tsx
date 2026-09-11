import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Building, Phone, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../app/providers/AuthProvider';
import { ShipFasterLogo } from '../../components/ui/ShipFasterLogo';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(email, password, companyName, phone);
      navigate('/app/dashboard');
    } catch {
      // Error handled by toast in AuthProvider
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full glass-panel p-8 rounded-2xl border border-slate-800 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center justify-center">
            <ShipFasterLogo size="lg" variant="light" />
          </Link>
          <p className="text-xs text-slate-400">Register your brand to start multi-courier shipping</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Company / Brand Name"
            placeholder="e.g. Acme Wear Tech Pvt Ltd"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            leftIcon={<Building className="w-4 h-4" />}
            required
          />
          <Input
            label="Work Email Address"
            type="email"
            placeholder="seller@acmewear.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />
          <Input
            label="Mobile Number"
            type="tel"
            placeholder="+91 98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            leftIcon={<Phone className="w-4 h-4" />}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />

          <Button type="submit" className="w-full" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Create Account & Start Onboarding
          </Button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Already registered?{' '}
          <Link to="/login" className="text-indigo-400 font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
