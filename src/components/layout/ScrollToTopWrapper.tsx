import React, { useEffect } from 'react';
import { useLocation, Outlet } from 'react-router-dom';

// Ensure browser does NOT remember scroll position when refreshing the page
if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

export const ScrollToTopWrapper: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Reset window and document scroll position to top (0, 0)
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Reset scroll position of any internal scroll containers (such as main viewports)
    const scrollables = document.querySelectorAll('main, .overflow-y-auto');
    scrollables.forEach((el) => {
      el.scrollTop = 0;
    });
  }, [pathname]);

  return <Outlet />;
};
