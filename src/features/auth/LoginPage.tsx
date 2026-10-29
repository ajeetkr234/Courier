import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../app/providers/AuthProvider';
import { AuthLayout } from './AuthLayout';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

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
        navigate('/app/dashboard');
      }
    } catch {
      // Error handled and toasted in AuthProvider
    }
  };

  return (
    <AuthLayout mode="login" title="Welcome back" subtitle="Sign in to manage orders, shipments, tracking, and settlements.">
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
      <p className="mt-6 text-center text-xs text-slate-500 font-medium">
        Don't have an account?{' '}
        <Link to="/register" className="text-blue-600 font-bold hover:underline">
          Register Seller Account
        </Link>
      </p>
    </AuthLayout>
  );
};
