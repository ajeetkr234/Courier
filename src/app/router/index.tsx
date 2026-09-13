import React, { lazy } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';

// Layouts
import { ScrollToTopWrapper } from '../../components/layout/ScrollToTopWrapper';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { SellerLayout } from '../../components/layout/SellerLayout';
import { AdminLayout } from '../../components/layout/AdminLayout';

// Eagerly loaded primary landing page for zero initial render delay
import { LandingPage } from '../../features/landing/LandingPage';
import { useAuth } from '../providers/AuthProvider';

// Helper for type-safe named export lazy-loading
const lazyNamed = <T extends Record<string, any>, K extends keyof T>(
  loader: () => Promise<T>,
  exportName: K
) => lazy(() => loader().then((module) => ({ default: module[exportName] })));

// Lazy-loaded Public Pages
const FeaturesPage = lazyNamed(() => import('../../features/landing/FeaturesPage'), 'FeaturesPage');
const SolutionsPage = lazyNamed(() => import('../../features/landing/SolutionsPage'), 'SolutionsPage');
const CouriersPage = lazyNamed(() => import('../../features/landing/CouriersPage'), 'CouriersPage');
const PublicIntegrationsPage = lazyNamed(() => import('../../features/landing/PublicIntegrationsPage'), 'PublicIntegrationsPage');
const PricingPage = lazyNamed(() => import('../../features/landing/PricingPage'), 'PricingPage');
const AboutPage = lazyNamed(() => import('../../features/landing/AboutPage'), 'AboutPage');
const ContactPage = lazyNamed(() => import('../../features/landing/ContactPage'), 'ContactPage');
const PublicTrackingPage = lazyNamed(() => import('../../features/tracking/PublicTrackingPage'), 'PublicTrackingPage');
const LoginPage = lazyNamed(() => import('../../features/auth/LoginPage'), 'LoginPage');
const RegisterPage = lazyNamed(() => import('../../features/auth/RegisterPage'), 'RegisterPage');
const ForgotPasswordPage = lazyNamed(() => import('../../features/auth/ForgotPasswordPage'), 'ForgotPasswordPage');
const VerifyEmailPage = lazyNamed(() => import('../../features/auth/VerifyEmailPage'), 'VerifyEmailPage');

const OnboardingPage = lazyNamed(() => import('../../features/onboarding/OnboardingPage'), 'OnboardingPage');

// Lazy-loaded Seller Feature Pages
const DashboardPage = lazyNamed(() => import('../../features/dashboard/DashboardPage'), 'DashboardPage');
const SellerHomePage = lazyNamed(() => import('../../features/dashboard/SellerHomePage'), 'SellerHomePage');
const OrdersListPage = lazyNamed(() => import('../../features/orders/OrdersListPage'), 'OrdersListPage');
const CreateOrderPage = lazyNamed(() => import('../../features/orders/CreateOrderPage'), 'CreateOrderPage');
const ImportOrdersPage = lazyNamed(() => import('../../features/orders/ImportOrdersPage'), 'ImportOrdersPage');
const ShipmentsListPage = lazyNamed(() => import('../../features/shipments/ShipmentsListPage'), 'ShipmentsListPage');
const NDRResolutionPage = lazyNamed(() => import('../../features/ndr/NDRResolutionPage'), 'NDRResolutionPage');
const RTOTrackingPage = lazyNamed(() => import('../../features/rto/RTOTrackingPage'), 'RTOTrackingPage');
const ReturnsPage = lazyNamed(() => import('../../features/returns/ReturnsPage'), 'ReturnsPage');
const WeightDisputesPage = lazyNamed(() => import('../../features/weight-disputes/WeightDisputesPage'), 'WeightDisputesPage');
const WalletPage = lazyNamed(() => import('../../features/wallet/WalletPage'), 'WalletPage');
const CODRemittancePage = lazyNamed(() => import('../../features/cod/CODRemittancePage'), 'CODRemittancePage');
const SellerIntegrationsPage = lazyNamed(() => import('../../features/integrations/IntegrationsPage'), 'IntegrationsPage');
const DeveloperPortalPage = lazyNamed(() => import('../../features/developers/DeveloperPortalPage'), 'DeveloperPortalPage');
const TeamManagementPage = lazyNamed(() => import('../../features/team/TeamManagementPage'), 'TeamManagementPage');
const ReportsPage = lazyNamed(() => import('../../features/reports/ReportsPage'), 'ReportsPage');
const RateCalculatorPage = lazyNamed(() => import('../../features/rate-calculator/RateCalculatorPage'), 'RateCalculatorPage');
const BrandedTrackingCustomizerPage = lazyNamed(() => import('../../features/tracking/BrandedTrackingCustomizerPage'), 'BrandedTrackingCustomizerPage');
const SettingsPage = lazyNamed(() => import('../../features/settings/SettingsPage'), 'SettingsPage');
const PickupsPage = lazyNamed(() => import('../../features/pickups/PickupsPage'), 'PickupsPage');
const ClaimsPage = lazyNamed(() => import('../../features/claims/ClaimsPage'), 'ClaimsPage');
const SupportPage = lazyNamed(() => import('../../features/support/SupportPage'), 'SupportPage');

// Lazy-loaded Admin Feature Pages
const AdminDashboardPage = lazyNamed(() => import('../../admin/dashboard/AdminDashboardPage'), 'AdminDashboardPage');
const AdminSellersPage = lazyNamed(() => import('../../admin/sellers/AdminSellersPage'), 'AdminSellersPage');
const AdminCouriersPage = lazyNamed(() => import('../../admin/couriers/AdminCouriersPage'), 'AdminCouriersPage');
const AdminRateCardsPage = lazyNamed(() => import('../../admin/rates/AdminRateCardsPage'), 'AdminRateCardsPage');
const AdminReconciliationPage = lazyNamed(() => import('../../admin/reconciliation/AdminReconciliationPage'), 'AdminReconciliationPage');
const AdminAuditLogsPage = lazyNamed(() => import('../../admin/audit/AdminAuditLogsPage'), 'AdminAuditLogsPage');
const AdminNDREscalationsPage = lazyNamed(() => import('../../admin/ndr/AdminNDREscalationsPage'), 'AdminNDREscalationsPage');
const AdminWeightDisputesPage = lazyNamed(() => import('../../admin/disputes/AdminWeightDisputesPage'), 'AdminWeightDisputesPage');
const AdminCODPayoutsPage = lazyNamed(() => import('../../admin/finance/AdminCODPayoutsPage'), 'AdminCODPayoutsPage');

const RequireAuth: React.FC<{ admin?: boolean }> = ({ admin = false }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen grid place-items-center text-sm font-bold text-slate-500">Checking secure session…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (admin && !user.role.startsWith('PLATFORM_')) return <Navigate to="/app/home" replace />;
  return <React.Fragment><Outlet /></React.Fragment>;
};

export const router = createBrowserRouter([
  {
    element: <ScrollToTopWrapper />,
    children: [
      /* Public Landing Pages under Persistent PublicLayout */
      {
        element: <PublicLayout />,
        children: [
          { path: '/', element: <LandingPage /> },
          { path: '/features', element: <FeaturesPage /> },
          { path: '/solutions', element: <SolutionsPage /> },
          { path: '/couriers', element: <CouriersPage /> },
          { path: '/integrations', element: <PublicIntegrationsPage /> },
          { path: '/pricing', element: <PricingPage /> },
          { path: '/track', element: <PublicTrackingPage /> },
          { path: '/about', element: <AboutPage /> },
          { path: '/contact', element: <ContactPage /> },
        ],
      },

      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/verify-email', element: <VerifyEmailPage /> },
      { path: '/onboarding', element: <OnboardingPage /> },

      /* Seller Application Scope */
      { element: <RequireAuth />, children: [{
        path: '/app', element: <SellerLayout />, children: [
          { path: '', element: <Navigate to="/app/home" replace /> },
          { path: 'home', element: <SellerHomePage /> },
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'orders', element: <OrdersListPage /> },
          { path: 'orders/new', element: <CreateOrderPage /> },
          { path: 'orders/import', element: <ImportOrdersPage /> },
          { path: 'orders/:id', element: <OrdersListPage /> },
          { path: 'shipments', element: <ShipmentsListPage /> },
          { path: 'pickups', element: <PickupsPage /> },
          { path: 'tracking', element: <PublicTrackingPage /> },
          { path: 'tracking/customizer', element: <BrandedTrackingCustomizerPage /> },
          { path: 'ndr', element: <NDRResolutionPage /> },
          { path: 'rto', element: <RTOTrackingPage /> },
          { path: 'returns', element: <ReturnsPage /> },
          { path: 'weight-disputes', element: <WeightDisputesPage /> },
          { path: 'claims', element: <ClaimsPage /> },
          { path: 'rate-calculator', element: <RateCalculatorPage /> },
          { path: 'tools/rate-calculator', element: <RateCalculatorPage /> },
          { path: 'wallet', element: <WalletPage /> },
          { path: 'cod', element: <CODRemittancePage /> },
          { path: 'billing', element: <WalletPage /> },
          { path: 'integrations', element: <SellerIntegrationsPage /> },
          { path: 'reports', element: <ReportsPage /> },
          { path: 'developers', element: <DeveloperPortalPage /> },
          { path: 'team', element: <TeamManagementPage /> },
          { path: 'settings', element: <SettingsPage /> },
          { path: 'support', element: <SupportPage /> },
        ],
      }]},

      /* Platform Admin Control Tower Scope */
      { element: <RequireAuth admin />, children: [{
        path: '/admin', element: <AdminLayout />, children: [
          { path: '', element: <AdminDashboardPage /> },
          { path: 'orders', element: <AdminDashboardPage /> },
          { path: 'sellers', element: <AdminSellersPage /> },
          { path: 'couriers', element: <AdminCouriersPage /> },
          { path: 'rates', element: <AdminRateCardsPage /> },
          { path: 'ndr-escalations', element: <AdminNDREscalationsPage /> },
          { path: 'weight-disputes', element: <AdminWeightDisputesPage /> },
          { path: 'cod-payouts', element: <AdminCODPayoutsPage /> },
          { path: 'finance', element: <CODRemittancePage /> },
          { path: 'reconciliation', element: <AdminReconciliationPage /> },
          { path: 'audit', element: <AdminAuditLogsPage /> },
          { path: 'reports', element: <ReportsPage /> },
        ],
      }]},
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
