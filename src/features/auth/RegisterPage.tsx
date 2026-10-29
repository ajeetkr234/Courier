import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Building, Phone, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../app/providers/AuthProvider';
import { AuthLayout } from './AuthLayout';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();

  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const canSignInInstead = /already|sign in instead/i.test(formError);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email.trim())) {
      setFormError('Enter a complete email address, for example name@gmail.com.');
      return;
    }
    try {
      await register(email.trim().toLowerCase(), password, companyName.trim(), phone.trim());
      navigate('/onboarding');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Registration failed. Please try again.');
    }
  };

  return (
    <AuthLayout mode="register" title="Start shipping smarter" subtitle="Create your business workspace and begin onboarding in minutes.">
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
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
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

          {formError && (
            <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-xs font-semibold leading-relaxed text-rose-700">
              <p>{formError}</p>
              {canSignInInstead && (
                <Link to="/login" className="mt-2 inline-flex font-bold text-blue-700 underline underline-offset-2">
                  Go to Sign In
                </Link>
              )}
            </div>
          )}

          <Button type="submit" isLoading={isLoading} disabled={isLoading} className="w-full" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Create Account & Start Onboarding
          </Button>
        </form>

        <p className="mt-4 text-[10px] leading-relaxed text-slate-400">
          By creating an account, you agree to the Terms of Service and Privacy Policy.
        </p>
        <p className="mt-5 text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="text-blue-600 font-semibold hover:underline">
            Sign In
          </Link>
        </p>
    </AuthLayout>
  );
};
