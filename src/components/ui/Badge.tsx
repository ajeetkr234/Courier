import React from 'react';
import { clsx } from 'clsx';
import { 
  CheckCircle2, Clock, Truck, AlertTriangle, XCircle, RotateCcw, Package 
} from 'lucide-react';
import { OrderStatus, ShipmentStatus } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'amber' | 'indigo' | 'rose' | 'slate' | 'cyan';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'indigo',
  size = 'md',
  icon,
  className
}) => {
  const styles = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    indigo: 'bg-blue-50 text-blue-700 border-blue-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    cyan: 'bg-sky-50 text-sky-700 border-sky-200',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1 font-semibold',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-bold',
  };

  return (
    <span className={clsx(
      'inline-flex items-center rounded-full border',
      styles[variant],
      sizes[size],
      className
    )}>
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: OrderStatus | ShipmentStatus | string; className?: string }> = ({ 
  status, className 
}) => {
  switch (status) {
    case 'DELIVERED':
    case 'SETTLED':
      return <Badge variant="emerald" icon={<CheckCircle2 className="w-3.5 h-3.5" />} className={className}>Delivered</Badge>;
    case 'IN_TRANSIT':
    case 'SHIPPED':
      return <Badge variant="indigo" icon={<Truck className="w-3.5 h-3.5" />} className={className}>In Transit</Badge>;
    case 'OUT_FOR_DELIVERY':
      return <Badge variant="cyan" icon={<Truck className="w-3.5 h-3.5" />} className={className}>Out For Delivery</Badge>;
    case 'NEW':
    case 'CONFIRMED':
    case 'READY_TO_SHIP':
    case 'PICKUP_SCHEDULED':
    case 'PENDING':
      return <Badge variant="amber" icon={<Clock className="w-3.5 h-3.5" />} className={className}>{status.replace('_', ' ')}</Badge>;
    case 'NDR':
      return <Badge variant="rose" icon={<AlertTriangle className="w-3.5 h-3.5" />} className={className}>NDR Action Needed</Badge>;
    case 'RTO':
    case 'RTO_INITIATED':
    case 'RTO_IN_TRANSIT':
    case 'RTO_DELIVERED':
    case 'RETURNED':
      return <Badge variant="rose" icon={<RotateCcw className="w-3.5 h-3.5" />} className={className}>RTO / Return</Badge>;
    case 'CANCELLED':
    case 'LOST':
      return <Badge variant="slate" icon={<XCircle className="w-3.5 h-3.5" />} className={className}>{status}</Badge>;
    default:
      return <Badge variant="slate" icon={<Package className="w-3.5 h-3.5" />} className={className}>{status}</Badge>;
  }
};
