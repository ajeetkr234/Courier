import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Public Pages
import { LandingPage } from '../../features/landing/LandingPage';
import { FeaturesPage } from '../../features/landing/FeaturesPage';
import { SolutionsPage } from '../../features/landing/SolutionsPage';
import { CouriersPage } from '../../features/landing/CouriersPage';
import { PublicIntegrationsPage } from '../../features/landing/PublicIntegrationsPage';
import { PricingPage } from '../../features/landing/PricingPage';
import { AboutPage } from '../../features/landing/AboutPage';
import { ContactPage } from '../../features/landing/ContactPage';
import { PublicTrackingPage } from '../../features/tracking/PublicTrackingPage';
import { LoginPage } from '../../features/auth/LoginPage';
import { RegisterPage } from '../../features/auth/RegisterPage';
import { ForgotPasswordPage } from '../../features/auth/ForgotPasswordPage';
import { VerifyEmailPage } from '../../features/auth/VerifyEmailPage';
import { OnboardingPage } from '../../features/onboarding/OnboardingPage';

// Layouts
import { SellerLayout } from '../../components/layout/SellerLayout';
import { AdminLayout } from '../../components/layout/AdminLayout';

// Seller Feature Pages
import { DashboardPage } from '../../features/dashboard/DashboardPage';
import { SellerHomePage } from '../../features/dashboard/SellerHomePage';
import { OrdersListPage } from '../../features/orders/OrdersListPage';
import { CreateOrderPage } from '../../features/orders/CreateOrderPage';
import { ImportOrdersPage } from '../../features/orders/ImportOrdersPage';
import { ShipmentsListPage } from '../../features/shipments/ShipmentsListPage';
import { NDRResolutionPage } from '../../features/ndr/NDRResolutionPage';
import { RTOTrackingPage } from '../../features/rto/RTOTrackingPage';
import { ReturnsPage } from '../../features/returns/ReturnsPage';
import { WeightDisputesPage } from '../../features/weight-disputes/WeightDisputesPage';
import { WalletPage } from '../../features/wallet/WalletPage';
import { CODRemittancePage } from '../../features/cod/CODRemittancePage';
import { IntegrationsPage as SellerIntegrationsPage } from '../../features/integrations/IntegrationsPage';
import { DeveloperPortalPage } from '../../features/developers/DeveloperPortalPage';
import { TeamManagementPage } from '../../features/team/TeamManagementPage';
import { ReportsPage } from '../../features/reports/ReportsPage';
import { RateCalculatorPage } from '../../features/rate-calculator/RateCalculatorPage';

// Admin Feature Pages
import { AdminDashboardPage } from '../../admin/dashboard/AdminDashboardPage';
import { AdminSellersPage } from '../../admin/sellers/AdminSellersPage';
import { AdminCouriersPage } from '../../admin/couriers/AdminCouriersPage';
import { AdminRateCardsPage } from '../../admin/rates/AdminRateCardsPage';
import { AdminReconciliationPage } from '../../admin/reconciliation/AdminReconciliationPage';
import { AdminAuditLogsPage } from '../../admin/audit/AdminAuditLogsPage';
import { ScrollToTopWrapper } from '../../components/layout/ScrollToTopWrapper';

export const router = createBrowserRouter([
  {
    element: <ScrollToTopWrapper />,
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
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/verify-email', element: <VerifyEmailPage /> },
      { path: '/onboarding', element: <OnboardingPage /> },

      /* Seller Application Scope */
      {
        path: '/app',
        element: <SellerLayout />,
        children: [
          { path: '', element: <Navigate to="/app/home" replace /> },
          { path: 'home', element: <SellerHomePage /> },
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'orders', element: <OrdersListPage /> },
          { path: 'orders/new', element: <CreateOrderPage /> },
          { path: 'orders/import', element: <ImportOrdersPage /> },
          { path: 'orders/:id', element: <OrdersListPage /> },
          { path: 'shipments', element: <ShipmentsListPage /> },
          { path: 'pickups', element: <ShipmentsListPage /> },
          { path: 'tracking', element: <PublicTrackingPage /> },
          { path: 'ndr', element: <NDRResolutionPage /> },
          { path: 'rto', element: <RTOTrackingPage /> },
          { path: 'returns', element: <ReturnsPage /> },
          { path: 'weight-disputes', element: <WeightDisputesPage /> },
          { path: 'rate-calculator', element: <RateCalculatorPage /> },
          { path: 'tools/rate-calculator', element: <RateCalculatorPage /> },
          { path: 'wallet', element: <WalletPage /> },
          { path: 'cod', element: <CODRemittancePage /> },
          { path: 'billing', element: <WalletPage /> },
          { path: 'integrations', element: <SellerIntegrationsPage /> },
          { path: 'reports', element: <ReportsPage /> },
          { path: 'developers', element: <DeveloperPortalPage /> },
          { path: 'team', element: <TeamManagementPage /> },
          { path: 'settings', element: <OnboardingPage /> },
        ],
      },

      /* Platform Admin Control Tower Scope */
      {
        path: '/admin',
        element: <AdminLayout />,
        children: [
          { path: '', element: <AdminDashboardPage /> },
          { path: 'sellers', element: <AdminSellersPage /> },
          { path: 'couriers', element: <AdminCouriersPage /> },
          { path: 'rates', element: <AdminRateCardsPage /> },
          { path: 'finance', element: <CODRemittancePage /> },
          { path: 'reconciliation', element: <AdminReconciliationPage /> },
          { path: 'audit', element: <AdminAuditLogsPage /> },
          { path: 'reports', element: <ReportsPage /> },
        ],
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

