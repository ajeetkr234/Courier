import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { PublicNavbar, PublicFooter } from '../../features/landing/PublicNav';
import { GlobalThreeBackground } from '../ui/GlobalThreeBackground';
import { PageLoadingFallback } from '../ui/PageLoadingFallback';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-white font-sans text-slate-900 flex flex-col relative selection:bg-blue-500 selection:text-white">
      {/* Persistent Three.js Background across all public pages */}
      <GlobalThreeBackground />
      <PublicNavbar />
      <main className="flex-1 w-full max-w-full overflow-x-hidden relative z-10 flex flex-col">
        <Suspense fallback={<PageLoadingFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <PublicFooter />
    </div>
  );
};
