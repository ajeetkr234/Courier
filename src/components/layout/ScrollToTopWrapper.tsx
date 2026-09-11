import React, { useEffect, Suspense } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { PageLoadingFallback } from '../ui/PageLoadingFallback';

// Ensure browser does NOT remember scroll position when refreshing the page
if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

export const ScrollToTopWrapper: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Reset window and document scroll position to top
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <Outlet />
    </Suspense>
  );
};
