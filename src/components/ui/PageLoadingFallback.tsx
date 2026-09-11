import React from 'react';

export const PageLoadingFallback: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center relative w-full pointer-events-none">
      {/* Top indeterminate progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-blue-100 overflow-hidden">
        <div className="h-full bg-blue-600 animate-indeterminate-bar w-1/3" />
      </div>

      <div className="flex flex-col items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center font-black text-white shadow-md text-lg font-display animate-pulse">
          S
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
          <span>Loading...</span>
        </div>
      </div>
    </div>
  );
};
