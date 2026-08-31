import React from 'react';
import { Smartphone, AlertCircle } from 'lucide-react';

interface MobileInputProps {
  value: string;
  onChange: (val: string) => void;
  error?: string;
  id?: string;
  required?: boolean;
  label?: string;
}

export const MobileInput: React.FC<MobileInputProps> = ({
  value,
  onChange,
  error,
  id = 'mobile-number-input',
  required = true,
  label = 'Mobile Number',
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only accept numeric digits, cap at 10 digits
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
    onChange(digitsOnly);
  };

  return (
    <div className="w-full space-y-1.5">
      <label htmlFor={id} className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
        <Smartphone className="w-3.5 h-3.5 text-blue-600" /> {label} {required && <span className="text-rose-500">*</span>}
      </label>

      <div className="relative flex items-center">
        {/* Country Code Prefix Pill */}
        <div className="absolute left-3 flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md border border-slate-200 pointer-events-none">
          <span>🇮🇳</span>
          <span>+91</span>
        </div>

        <input
          id={id}
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="tel"
          maxLength={10}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          placeholder="XXXXX XXXXX"
          value={value}
          onChange={handleChange}
          className={`w-full bg-white border text-slate-900 font-mono font-bold rounded-xl pl-20 pr-3.5 py-3 text-sm placeholder:text-slate-400 focus:outline-none transition-all shadow-xs ${
            error
              ? 'border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
              : 'border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20'
          }`}
        />
      </div>

      {error && (
        <p id={`${id}-error`} className="text-xs text-rose-600 font-semibold flex items-center gap-1.5 pt-0.5">
          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};
