import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff, ShieldCheck, Store, UserPlus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../app/providers/AuthProvider';
import { AuthLayout } from './AuthLayout';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginDemo, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      if (email.toLowerCase().includes('admin')) {
        navigate('/admin');
      } else {
        navigate('/app/home');
      }
    } catch {
      // Error handled and toasted in AuthProvider
    }
  };

  const handleInstantLogin = async (isAdmin: boolean) => {
    const demoEmail = isAdmin ? 'admin.demo@shipfaster.test' : 'seller.demo@shipfaster.test';
    setEmail(demoEmail);
    setPassword(isAdmin ? 'AdminDemo@2026!' : 'SellerDemo@2026!');
    try {
      if (typeof loginDemo === 'function') {
        loginDemo(isAdmin);
      } else {
        await login(demoEmail, 'Demo@2026!');
      }
      navigate(isAdmin ? '/admin' : '/app/home');
    } catch {
      navigate(isAdmin ? '/admin' : '/app/home');
    }
  };

  return (
    <AuthLayout mode="login" title="Welcome back" subtitle="Sign in to manage orders, shipments, tracking, and settlements.">
      {/* 1-Click Role Login Buttons */}
      <div className="mb-5 p-3 rounded-2xl bg-gradient-to-r from-blue-50/80 via-slate-50 to-purple-50/80 border border-slate-200/80">
        <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-2 text-center">
          ⚡ 1-Click Instant Login
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleInstantLogin(false)}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white border border-blue-200 hover:border-blue-400 hover:bg-blue-50/50 text-blue-700 text-xs font-bold shadow-xs hover:shadow-sm transition-all cursor-pointer"
          >
            <Store className="w-3.5 h-3.5 text-blue-600" />
            <span>Login as Seller</span>
          </button>
          <button
            type="button"
            onClick={() => handleInstantLogin(true)}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white border border-purple-200 hover:border-purple-400 hover:bg-purple-50/50 text-purple-700 text-xs font-bold shadow-xs hover:shadow-sm transition-all cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
            <span>Login as Admin</span>
          </button>
        </div>
      </div>

      <div className="relative my-4 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <span className="relative bg-white px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Or Enter Credentials
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
          placeholder="name@company.com"
          required
        />
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              className="flex h-8 min-h-0 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          required
        />

        <Button type="submit" isLoading={isLoading} className="w-full shadow-md" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
          Sign In to Dashboard
        </Button>
      </form>

      <div className="mt-4 flex items-center justify-between gap-3 text-xs">
        <Link to="/forgot-password" className="font-bold text-blue-600 hover:underline">Forgot password?</Link>
        <span className="text-slate-400">Offline & Cloud Ready</span>
      </div>

      {/* New User Callout */}
      <div className="mt-6 pt-4 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-600 font-medium mb-2">
          New to ShipFaster?
        </p>
        <Link 
          to="/register" 
          className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Seller Account</span>
        </Link>
      </div>
    </AuthLayout>
  );
};
