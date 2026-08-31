import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Truck, CheckCircle2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export const VerifyEmailPage: React.FC = () => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isVerified, setIsVerified] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.some((c) => !c)) {
      toast.error('Please enter the complete 6-digit verification code');
      return;
    }
    setIsVerified(true);
    toast.success('Email verified successfully!');
    setTimeout(() => {
      navigate('/onboarding');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-600/15 blur-3xl rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center items-center space-x-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Truck className="h-7 w-7 text-white" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">ShipSwift AI</span>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Verify your email
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          We sent a 6-digit verification code to your email address.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-slate-900/90 border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10 backdrop-blur-xl">
          {isVerified ? (
            <div className="text-center py-6 space-y-4">
              <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-white">Email Verified!</h3>
              <p className="text-sm text-slate-400">
                Redirecting you to complete your seller onboarding...
              </p>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleVerify}>
              <div className="flex justify-center space-x-2 sm:space-x-3">
                {code.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-input-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleInputChange(idx, e.target.value)}
                    className="w-11 h-13 text-center text-xl font-bold bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                ))}
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-indigo-600/25 cursor-pointer"
                >
                  <ShieldCheck className="mr-2 h-4 w-4" /> Verify Account
                </button>
              </div>

              <div className="text-center text-xs text-slate-500">
                Didn't receive the code?{' '}
                <button
                  type="button"
                  onClick={() => toast.success('New verification code sent!')}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer underline"
                >
                  Resend Code
                </button>
              </div>

              <div className="text-center pt-2">
                <Link to="/login" className="text-xs text-slate-400 hover:text-slate-200">
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
