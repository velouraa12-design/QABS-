/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { CustomizerProvider } from './context/CustomizerContext.tsx';
import { RouterProvider, useRouter, AppLink, normalizePath } from './context/RouterContext.tsx';
import { Header } from './components/Header.tsx';
import { LandingView } from './components/LandingView.tsx';
import { PortalView } from './components/PortalView.tsx';
import { StoreBuilderView } from './components/StoreBuilderView.tsx';
import { BillingSubscriptionView } from './components/BillingSubscriptionView.tsx';
import { AdminView } from './components/AdminView.tsx';
import { TemplateHubView } from './components/TemplateHubView.tsx';
import { FormationWizardModal } from './components/FormationWizardModal.tsx';
import { NewStoreModal } from './components/NewStoreModal.tsx';
import { AIChatModal } from './components/AIChatModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { CheckoutModal } from './components/CheckoutModal.tsx';
import { ContentEditorModal } from './components/ContentEditorModal.tsx';
import { Footer } from './components/Footer.tsx';
import {
  CompanyFormationPage,
  EinPage,
  RegisteredAgentPage,
  UsLlcPage,
  CompliancePage,
  AnnualReportPage,
  CompanyRenewalPage,
  StoreCreationPage,
  StoreManagementPage,
  MultiStorePage,
  StoreDevelopmentPage,
  PaymentGatewaysPage,
  BusinessAccountsPage,
  PaymentIntegrationPage,
  BrandIdentityPage,
  LogoDesignPage,
  WebDevelopmentPage,
  MarketingPage,
  ConsultingPage,
  AiSolutionsPage,
  AboutPage,
  HowItWorksPage,
  PricingPage,
  ContactPage,
  FaqPage,
  SupportPage,
  PrivacyPage,
  TermsPage,
  OrderServicePage
} from './pages/index.ts';
import { CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';

const WORKSPACE_HASH_PREFIXES = [
  '/overview',
  '/orders',
  '/documents',
  '/stores',
  '/billing',
  '/qabs-ai',
  '/crypto',
  '/support',
  '/settings',
  '/company-formation',
  '/workspace',
  '/requests',
  '/formation',
  '/products',
  '/inventory',
  '/customers',
  '/discounts',
  '/payments',
  '/shipping',
  '/domains',
  '/apps',
  '/analytics',
  '/create-store',
  '/design',
  '/pages',
  '/cards',
  '/bank-accounts'
];

const isWorkspacePreviewLocation = (): boolean =>
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).get('workspacePreview') === '1';

const isWorkspaceLocation = (): boolean => {
  if (typeof window === 'undefined' || isWorkspacePreviewLocation()) return false;
  const hash = window.location.hash || '';
  const path = normalizePath(window.location.pathname || '/');
  if (path === '/workspace' || path.startsWith('/workspace/')) return true;
  return WORKSPACE_HASH_PREFIXES.some(prefix => hash.startsWith(`#${prefix}`));
};

const MainLayout: React.FC = () => {
  const {
    language,
    mode,
    setMode,
    toastMessage,
    isAuthenticated,
    isOwner,
    openClientAuth,
    openOwnerAuth
  } = useApp();
  const { currentPath } = useRouter();
  const isAr = language === 'ar';

  const [formationModalOpen, setFormationModalOpen] = useState(false);
  const [selectedStateCode, setSelectedStateCode] = useState<string>('WY');
  const [storeModalOpen, setStoreModalOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  // Browse First, Auth on Action: guard workspace hashes & /workspace path without hijacking public routes like /support
  useEffect(() => {
    const syncWorkspaceRoute = () => {
      if (isWorkspaceLocation()) {
        if (isAuthenticated) {
          setMode('portal');
        } else {
          setMode('landing');
          openClientAuth('login');
        }
      }
    };

    syncWorkspaceRoute();
    window.addEventListener('hashchange', syncWorkspaceRoute);
    window.addEventListener('popstate', syncWorkspaceRoute);
    return () => {
      window.removeEventListener('hashchange', syncWorkspaceRoute);
      window.removeEventListener('popstate', syncWorkspaceRoute);
    };
  }, [isAuthenticated, setMode, openClientAuth]);

  useEffect(() => {
    if (!isAuthenticated && mode !== 'landing') {
      setMode('landing');
      return;
    }
    if ((mode === 'admin' || mode === 'template_hub') && !isOwner) {
      setMode(isAuthenticated ? 'portal' : 'landing');
      openOwnerAuth();
    }
  }, [mode, isAuthenticated, isOwner, setMode, openOwnerAuth]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (mode === 'portal' && isAuthenticated) {
      if (!isWorkspaceLocation()) {
        window.history.replaceState({ qabsWorkspace: 'overview' }, '', `${window.location.pathname}#/overview`);
      }
    } else if (!isWorkspacePreviewLocation() && window.location.hash && WORKSPACE_HASH_PREFIXES.some(p => window.location.hash.startsWith(`#${p}`))) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, [mode, isAuthenticated]);

  const handleOpenFormationWithState = (stateCode?: string) => {
    if (stateCode) {
      setSelectedStateCode(stateCode);
    }
    setFormationModalOpen(true);
  };

  const renderPublicRoute = (): React.ReactNode => {
    const path = normalizePath(currentPath);

    if (path === '/' || path === '/workspace') {
      return (
        <LandingView
          onOpenFormationModal={handleOpenFormationWithState}
          onOpenStoreModal={() => setStoreModalOpen(true)}
          onOpenAIModal={() => setAiModalOpen(true)}
        />
      );
    }

    if (path === '/order' || path.startsWith('/order/')) {
      const slug = path === '/order' ? undefined : path.slice('/order/'.length);
      return <OrderServicePage serviceSlug={slug} />;
    }

    const staticRoutes: Record<string, React.ReactNode> = {
      // Company Formation (4)
      '/services/company-formation': <CompanyFormationPage />,
      '/services/ein': <EinPage />,
      '/services/registered-agent': <RegisteredAgentPage />,
      '/services/us-llc': <UsLlcPage />,

      // Compliance (3)
      '/services/compliance': <CompliancePage />,
      '/services/annual-report': <AnnualReportPage />,
      '/services/company-renewal': <CompanyRenewalPage />,

      // Stores (4)
      '/services/store-creation': <StoreCreationPage />,
      '/services/store-management': <StoreManagementPage />,
      '/services/multi-store': <MultiStorePage />,
      '/services/store-development': <StoreDevelopmentPage />,

      // Payments & Banking (3)
      '/services/payment-gateways': <PaymentGatewaysPage />,
      '/services/business-accounts': <BusinessAccountsPage />,
      '/services/payment-integration': <PaymentIntegrationPage />,

      // Digital Services (6)
      '/services/brand-identity': <BrandIdentityPage />,
      '/services/logo-design': <LogoDesignPage />,
      '/services/web-development': <WebDevelopmentPage />,
      '/services/marketing': <MarketingPage />,
      '/services/consulting': <ConsultingPage />,
      '/services/ai-solutions': <AiSolutionsPage />,

      // General Pages (8)
      '/about': <AboutPage />,
      '/how-it-works': <HowItWorksPage />,
      '/pricing': <PricingPage />,
      '/contact': <ContactPage />,
      '/faq': <FaqPage />,
      '/support': <SupportPage />,
      '/privacy': <PrivacyPage />,
      '/terms': <TermsPage />
    };

    if (staticRoutes[path]) {
      return staticRoutes[path];
    }

    const ArrowIcon = isAr ? ArrowLeft : ArrowRight;
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="text-5xl font-black font-mono text-[#D5B46B]">404</div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#14243E] dark:text-white">
          {isAr ? 'الصفحة المطلوبة غير موجودة' : 'Page Not Found'}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {isAr
            ? `لم يتم العثور على المسار (${path}). يمكنك العودة للرئيسية أو استعراض خدماتنا وأسعارنا المعتمدة.`
            : `No route matched (${path}). Return to the homepage or browse our approved services and pricing.`}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <AppLink
            to="/"
            className="px-5 py-3 rounded-xl bg-[#14243E] text-white font-black text-xs flex items-center gap-2"
          >
            <span>{isAr ? 'العودة للرئيسية' : 'Back to Home'}</span>
            <ArrowIcon className="w-4 h-4" />
          </AppLink>
          <AppLink
            to="/pricing"
            className="px-5 py-3 rounded-xl border border-[#D5B46B] text-[#14243E] dark:text-[#D5B46B] font-black text-xs"
          >
            {isAr ? 'الأسعار والخدمات' : 'Pricing & Services'}
          </AppLink>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8F7F2] dark:bg-[#03131D] text-[#14243E] dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-[#D5B46B]/30 selection:text-[#14243E] dark:selection:text-white">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white dark:bg-[#082030] border-2 border-[#D5B46B] text-[#14243E] dark:text-white text-xs font-bold shadow-2xl animate-fade-in">
          <CheckCircle className="w-4 h-4 text-[#92743A] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <Header
        onOpenFormationModal={() => handleOpenFormationWithState()}
        onOpenStoreModal={() => setStoreModalOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {isWorkspacePreviewLocation() && (
          <div className="mx-auto mt-4 max-w-7xl px-4">
            <div className="rounded-xl border border-amber-400/60 bg-amber-50 px-4 py-3 text-xs font-bold text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
              {isAr
                ? 'وضع معاينة مساحة العمل: بيانات تجريبية محلية للاختبار فقط. لا تستخدمه لإدخال بيانات عملاء أو تنفيذ مدفوعات حقيقية.'
                : 'Workspace preview: local demo data for testing only. Do not enter customer data or use it for real payments.'}
            </div>
          </div>
        )}
        {!isWorkspacePreviewLocation() && (mode === 'landing' || !isAuthenticated) && renderPublicRoute()}

        {(isAuthenticated && mode === 'portal' || isWorkspacePreviewLocation()) && (
          <PortalView
            onOpenFormationModal={() => handleOpenFormationWithState()}
            onOpenStoreModal={() => setStoreModalOpen(true)}
            previewOnly={isWorkspacePreviewLocation()}
          />
        )}

        {isAuthenticated && mode === 'store_builder' && (
          <StoreBuilderView onOpenStoreModal={() => setStoreModalOpen(true)} />
        )}

        {isAuthenticated && mode === 'billing' && <BillingSubscriptionView />}

        {isOwner && mode === 'admin' && <AdminView />}

        {isOwner && mode === 'template_hub' && <TemplateHubView />}
      </main>

      {/* Footer */}
      <Footer />

      {/* Global Modals */}
      <FormationWizardModal
        isOpen={formationModalOpen}
        onClose={() => setFormationModalOpen(false)}
        initialStateCode={selectedStateCode}
      />

      <NewStoreModal isOpen={storeModalOpen} onClose={() => setStoreModalOpen(false)} />

      <AIChatModal isOpen={aiModalOpen} onClose={() => setAiModalOpen(false)} />

      <AuthModal />

      <CheckoutModal />

      <ContentEditorModal />
    </div>
  );
};

export default function App() {
  return (
    <RouterProvider>
      <AppProvider>
        <CustomizerProvider>
          <MainLayout />
        </CustomizerProvider>
      </AppProvider>
    </RouterProvider>
  );
}
