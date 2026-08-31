import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Truck, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your registered email address');
      return;
    }
    setIsSubmitted(true);
    toast.success('Password reset link sent to your email!');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/15 blur-3xl rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center items-center space-x-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Truck className="h-7 w-7 text-white" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">ShipSwift AI</span>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Enter your account email to receive a secure recovery link.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-slate-900/90 border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10 backdrop-blur-xl">
          {isSubmitted ? (
            <div className="text-center py-4 space-y-4">
              <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-medium text-white">Check your email</h3>
              <p className="text-sm text-slate-400">
                We sent a password reset instructions link to <span className="text-indigo-400 font-semibold">{email}</span>.
              </p>
              <div className="pt-4">
                <Link
                  to="/login"
                  className="w-full inline-flex justify-center items-center px-4 py-2.5 border border-slate-700 text-sm font-medium rounded-xl text-slate-200 bg-slate-800 hover:bg-slate-700 transition"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                  Email address
                </label>
                <div className="mt-1.5 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seller@company.com"
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-indigo-600/25 cursor-pointer"
                >
                  Send Reset Link
                </button>
              </div>

              <div className="text-center">
                <Link
                  to="/login"
                  className="text-sm font-medium text-indigo-400 hover:text-indigo-300 inline-flex items-center"
                >
                  <ArrowLeft className="mr-1.5 h-4 w-4" /> Return to sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
