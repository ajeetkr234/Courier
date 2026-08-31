import React from 'react';
import { clsx } from 'clsx';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: 'default' | 'indigo' | 'emerald' | 'amber' | 'rose';
  className?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
  className,
  onClick
}) => {
  const borderAccents = {
    default: 'border-slate-200 hover:border-slate-300 bg-white',
    indigo: 'border-blue-200 bg-blue-50/50',
    emerald: 'border-emerald-200 bg-emerald-50/50',
    amber: 'border-amber-200 bg-amber-50/50',
    rose: 'border-rose-200 bg-rose-50/50',
  };

  return (
    <div
      onClick={onClick}
      className={clsx(
        'glass-panel p-5 rounded-2xl transition-all duration-200 shadow-sm hover:shadow-md',
        onClick && 'cursor-pointer hover:scale-[1.01]',
        borderAccents[variant],
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</p>
        {icon && (
          <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <h4 className="text-2xl font-black text-slate-900 tracking-tight font-display">{value}</h4>
        {trend && (
          <span className={clsx(
            'inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full',
            trend.isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
          )}>
            {trend.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && <p className="mt-1.5 text-xs text-slate-500 font-medium">{subtitle}</p>}
    </div>
  );
};
