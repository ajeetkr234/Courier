import React from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  leftIcon,
  rightIcon,
  helperText,
  className,
  id,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-bold uppercase tracking-wider text-slate-700">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 text-slate-400 pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'w-full bg-white border border-slate-300 text-slate-900 rounded-xl px-3.5 py-2.5 text-sm placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3.5 text-slate-400">
            {rightIcon}
          </div>
        )}
      </div>
      {error ? (
        <p className="text-xs text-rose-600 font-semibold">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  helperText?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  options,
  helperText,
  className,
  id,
  ...props
}, ref) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-bold uppercase tracking-wider text-slate-700">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={clsx(
          'w-full bg-white border border-slate-300 text-slate-900 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all cursor-pointer',
          error && 'border-rose-500',
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-white text-slate-900">
            {opt.label}
          </option>
        ))}
      </select>
      {error ? (
        <p className="text-xs text-rose-600 font-semibold">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
});

Select.displayName = 'Select';
