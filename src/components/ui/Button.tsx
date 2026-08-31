import React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg focus:ring-blue-500 border border-blue-600',
    secondary: 'bg-slate-900 hover:bg-slate-800 text-white focus:ring-slate-900 border border-slate-900',
    outline: 'border border-slate-300 hover:border-blue-600 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 focus:ring-blue-500',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white focus:ring-rose-500 border border-rose-600',
    ghost: 'hover:bg-slate-100 text-slate-600 hover:text-slate-900 focus:ring-slate-400',
    glass: 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-sm focus:ring-blue-500',
  };

  const sizes = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5',
    md: 'text-sm px-4.5 py-2.5 gap-2',
    lg: 'text-base px-6 py-3 gap-2.5',
  };

  return (
    <button
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : leftIcon ? (
        <span className="shrink-0">{leftIcon}</span>
      ) : null}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
