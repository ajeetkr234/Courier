import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../app/providers/AuthProvider';
import { ShipFasterLogo } from '../../components/ui/ShipFasterLogo';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState('seller@apexwear.com');
  const [password, setPassword] = useState('password123');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      if (email.includes('admin')) {
        navigate('/admin');
      } else {
        navigate('/app/dashboard');
      }
    } catch {
      // Error handled and toasted in AuthProvider
    }
  };

  const handleQuickDemoLogin = async (role: 'SELLER' | 'ADMIN') => {
    if (role === 'ADMIN') {
      await login('admin@platformlogistics.com');
      navigate('/admin');
    } else {
      await login('seller@apexwear.com');
      navigate('/app/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 space-y-6 shadow-xl">
        {/* Brand */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center justify-center">
            <ShipFasterLogo size="lg" variant="dark" />
          </Link>
          <p className="text-xs text-slate-500 font-medium">Sign in to manage your multi-courier shipping operations</p>
        </div>

        {/* Quick Demo Switcher Buttons */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <span className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest text-center">Quick Demo Login</span>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickDemoLogin('SELLER')}
              leftIcon={<UserCheck className="w-3.5 h-3.5 text-blue-600" />}
            >
              Seller Portal
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickDemoLogin('ADMIN')}
              leftIcon={<ShieldCheck className="w-3.5 h-3.5 text-rose-600" />}
            >
              Admin Portal
            </Button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
            required
          />

          <Button type="submit" isLoading={isLoading} className="w-full shadow-md" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Sign In to Dashboard
          </Button>
        </form>

        <p className="text-center text-xs text-slate-500 font-medium">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 font-bold hover:underline">
            Register Seller Account
          </Link>
        </p>
      </div>
    </div>
  );
};
