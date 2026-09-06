import React from 'react';

interface ShipFasterLogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'dark' | 'light';
  styleOption?: string;
}

export const ShipFasterLogo: React.FC<ShipFasterLogoProps> = ({
  className = '',
  iconOnly = false,
  size = 'md',
  variant = 'dark'
}) => {
  const iconSizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textClasses = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  const subtitleClasses = {
    sm: 'text-[8px]',
    md: 'text-[9.5px]',
    lg: 'text-[11px]',
    xl: 'text-[13px]'
  };

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* High-Tech 3D SF Monogram Emblem */}
      <div className={`relative ${iconSizeClasses[size]} shrink-0 flex items-center justify-center`}>
        <img 
          src="/sf-logo-mark.png" 
          alt="SF Monogram Logo" 
          className="w-full h-full object-contain transition-transform duration-200 hover:scale-105 filter drop-shadow-sm" 
        />
      </div>

      {/* Brand Typography with Tighter Natural Letter-Spacing for LOGISTIC */}
      {!iconOnly && (
        <div className="flex flex-col leading-none text-left">
          <span className={`font-black tracking-tight font-display ${textClasses[size]} ${variant === 'dark' ? 'text-slate-900' : 'text-white'}`}>
            Ship<span className="bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 bg-clip-text text-transparent">Faster</span>
          </span>
          <span className={`font-black tracking-[0.18em] uppercase font-display mt-0.5 ${subtitleClasses[size]} ${variant === 'dark' ? 'text-blue-600' : 'text-sky-300'}`}>
            LOGISTIC
          </span>
        </div>
      )}
    </div>
  );
};

