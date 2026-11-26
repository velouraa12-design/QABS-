import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { useCustomizer } from '../context/CustomizerContext.tsx';
import { useRouter, AppLink } from '../context/RouterContext.tsx';
import {
  FORMATION_SERVICES,
  COMPLIANCE_SERVICES,
  STORE_SERVICES,
  PAYMENT_SERVICES,
  DIGITAL_SERVICES,
  SERVICE_CATEGORY_LABELS
} from '../data/pages/index.ts';
import { QabsLogo } from './QabsLogo.tsx';
import {
  Globe,
  Sun,
  Moon,
  Shield,
  Layers,
  Store,
  FileCode2,
  ChevronDown,
  CreditCard,
  Edit3,
  User,
  CheckCircle2,
  FlaskConical,
  LogOut,
  Crown,
  Menu,
  X,
  Building2,
  ShieldCheck,
  Sparkles,
  Landmark
} from 'lucide-react';

interface HeaderProps {
  onOpenFormationModal: () => void;
  onOpenStoreModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenFormationModal, onOpenStoreModal }) => {
  const {
    language,
    setLanguage,
    theme,
    toggleTheme,
    mode,
    setMode,
    user,
    isAuthenticated,
    isOwner,
    openClientAuth,
    logout,
    isProductionMode,
    toggleProductionMode,
    backendStatus
  } = useApp();
  const { setEditorOpen } = useCustomizer();
  const { currentPath, navigate } = useRouter();

  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const [servicesMenuOpen, setServicesMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const servicesDropdownRef = useRef<HTMLDivElement>(null);

  const isAr = language === 'ar';

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        servicesDropdownRef.current &&
        !servicesDropdownRef.current.contains(e.target as Node)
      ) {
        setServicesMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handlePublicNav = (to: string) => {
    setServicesMenuOpen(false);
    setMobileMenuOpen(false);
    setMode('landing');
    navigate(to);
  };

  const handleGuardedMode = (targetMode: 'portal' | 'store_builder' | 'billing') => {
    setServicesMenuOpen(false);
    setMobileMenuOpen(false);
    if (!isAuthenticated) {
      openClientAuth('login');
      return;
    }
    setMode(targetMode);
  };

  const categoryGroups = [
    {
      id: 'formation' as const,
      icon: Building2,
      items: FORMATION_SERVICES
    },
    {
      id: 'compliance' as const,
      icon: ShieldCheck,
      items: COMPLIANCE_SERVICES
    },
    {
      id: 'stores' as const,
      icon: Store,
      items: STORE_SERVICES
    },
    {
      id: 'payments' as const,
      icon: Landmark,
      items: PAYMENT_SERVICES
    },
    {
      id: 'digital' as const,
      icon: Sparkles,
      items: DIGITAL_SERVICES
    }
  ];

  const isServicesActive = currentPath.startsWith('/services') && mode === 'landing';

  return (
    <header className="sticky top-0 z-40 w-full overflow-x-clip bg-white/95 dark:bg-[#002B38]/95 backdrop-blur-md border-b-2 border-[#D5B46B]/40 text-[#14243E] dark:text-slate-100 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-3">
        {/* Zone 1: Official QABS Brand Lockup */}
        <div className="flex items-center gap-2 shrink-0 min-w-0">
          <button
            type="button"
            onClick={() => handlePublicNav('/')}
            className="flex items-center gap-2 group text-left cursor-pointer focus:outline-none"
            title="QABS | قبس — متاجر إلكترونية | خدمات رقمية"
          >
            <QabsLogo size="md" className="group-hover:scale-[1.02] transition-transform" />
          </button>
        </div>

        {/* Zone 2: Primary Desktop Navigation */}
        <nav className="hidden xl:flex items-center gap-5 text-xs font-bold shrink-0">
          <AppLink
            to="/"
            onClick={() => setMode('landing')}
            className={`whitespace-nowrap shrink-0 pb-1 border-b-2 transition-colors ${
              mode === 'landing' && currentPath === '/'
                ? 'border-[#D5B46B] text-[#14243E] dark:text-[#D5B46B]'
                : 'border-transparent text-slate-600 dark:text-slate-300 hover:text-[#14243E] dark:hover:text-white'
            }`}
          >
            {isAr ? 'الرئيسية' : 'Home'}
          </AppLink>

          {/* Services Mega Dropdown */}
          <div className="relative shrink-0" ref={servicesDropdownRef}>
            <button
              type="button"
              onClick={() => setServicesMenuOpen(prev => !prev)}
              className={`whitespace-nowrap shrink-0 pb-1 border-b-2 transition-colors cursor-pointer flex items-center gap-1 ${
                isServicesActive || servicesMenuOpen
                  ? 'border-[#D5B46B] text-[#14243E] dark:text-[#D5B46B]'
                  : 'border-transparent text-slate-600 dark:text-slate-300 hover:text-[#14243E] dark:hover:text-white'
              }`}
            >
              <span>{isAr ? 'الخدمات (20)' : 'Services (20)'}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${servicesMenuOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {servicesMenuOpen && (
              <div
                className={`fixed top-20 inset-x-4 max-w-6xl mx-auto bg-white dark:bg-[#071D2B] border-2 border-[#D5B46B]/50 rounded-2xl shadow-2xl p-6 z-50`}
              >
                <div className="grid grid-cols-5 gap-5">
                  {categoryGroups.map(group => {
                    const Icon = group.icon;
                    const label = SERVICE_CATEGORY_LABELS[group.id];
                    return (
                      <div key={group.id} className="space-y-2.5">
                        <div className="flex items-center gap-2 pb-2 border-b border-[#EAE6DC] dark:border-slate-800 text-[#14243E] dark:text-[#D5B46B] font-black text-xs">
                          <Icon className="w-4 h-4 text-[#92743A] dark:text-[#D5B46B] shrink-0" />
                          <span>{isAr ? label.ar : label.en}</span>
                        </div>
                        <ul className="space-y-1.5">
                          {group.items.map(svc => (
                            <li key={svc.path}>
                              <AppLink
                                to={svc.path}
                                onNavigate={() => {
                                  setServicesMenuOpen(false);
                                  setMode('landing');
                                }}
                                className={`block px-2 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
                                  currentPath === svc.path
                                    ? 'bg-[#14243E] text-[#D5B46B]'
                                    : 'text-slate-700 dark:text-slate-200 hover:bg-[#F8F7F2] dark:hover:bg-[#051724] hover:text-[#92743A] dark:hover:text-[#D5B46B]'
                                }`}
                              >
                                {isAr ? svc.titleAr : svc.titleEn}
                              </AppLink>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-5 pt-4 border-t border-[#EAE6DC] dark:border-slate-800 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300">
                    <AppLink
                      to="/about"
                      onNavigate={() => {
                        setServicesMenuOpen(false);
                        setMode('landing');
                      }}
                      className="hover:text-[#92743A] dark:hover:text-[#D5B46B] font-bold"
                    >
                      {isAr ? 'عن قبس' : 'About QABS'}
                    </AppLink>
                    <AppLink
                      to="/faq"
                      onNavigate={() => {
                        setServicesMenuOpen(false);
                        setMode('landing');
                      }}
                      className="hover:text-[#92743A] dark:hover:text-[#D5B46B] font-bold"
                    >
                      {isAr ? 'الأسئلة الشائعة' : 'FAQ'}
                    </AppLink>
                    <AppLink
                      to="/support"
                      onNavigate={() => {
                        setServicesMenuOpen(false);
                        setMode('landing');
                      }}
                      className="hover:text-[#92743A] dark:hover:text-[#D5B46B] font-bold"
                    >
                      {isAr ? 'الدعم الفني' : 'Support Center'}
                    </AppLink>
                  </div>
                  <AppLink
                    to="/order/company-formation"
                    onNavigate={() => {
                      setServicesMenuOpen(false);
                      setMode('landing');
                    }}
                    className="px-4 py-2 rounded-xl bg-[#D5B46B] text-[#14243E] font-black text-xs"
                  >
                    {isAr ? 'اطلب خدمة الآن' : 'Order a Service'}
                  </AppLink>
                </div>
              </div>
            )}
          </div>

          <AppLink
            to="/how-it-works"
            onClick={() => setMode('landing')}
            className={`whitespace-nowrap shrink-0 pb-1 border-b-2 transition-colors ${
              mode === 'landing' && currentPath === '/how-it-works'
                ? 'border-[#D5B46B] text-[#14243E] dark:text-[#D5B46B]'
                : 'border-transparent text-slate-600 dark:text-slate-300 hover:text-[#14243E] dark:hover:text-white'
            }`}
          >
            {isAr ? 'كيف نعمل' : 'How It Works'}
          </AppLink>

          <AppLink
            to="/pricing"
            onClick={() => setMode('landing')}
            className={`whitespace-nowrap shrink-0 pb-1 border-b-2 transition-colors ${
              mode === 'landing' && currentPath === '/pricing'
                ? 'border-[#D5B46B] text-[#14243E] dark:text-[#D5B46B]'
                : 'border-transparent text-slate-600 dark:text-slate-300 hover:text-[#14243E] dark:hover:text-white'
            }`}
          >
            {isAr ? 'الأسعار' : 'Pricing'}
          </AppLink>

          <AppLink
            to="/contact"
            onClick={() => setMode('landing')}
            className={`whitespace-nowrap shrink-0 pb-1 border-b-2 transition-colors ${
              mode === 'landing' && currentPath === '/contact'
                ? 'border-[#D5B46B] text-[#14243E] dark:text-[#D5B46B]'
                : 'border-transparent text-slate-600 dark:text-slate-300 hover:text-[#14243E] dark:hover:text-white'
            }`}
          >
            {isAr ? 'تواصل معنا' : 'Contact'}
          </AppLink>

          <button
            type="button"
            onClick={() => handleGuardedMode('portal')}
            className={`whitespace-nowrap shrink-0 pb-1 border-b-2 transition-colors cursor-pointer flex items-center gap-1 ${
              mode === 'portal'
                ? 'border-[#D5B46B] text-[#14243E] dark:text-[#D5B46B]'
                : 'border-transparent text-slate-600 dark:text-slate-300 hover:text-[#14243E] dark:hover:text-white'
            }`}
          >
            <Store className="w-3.5 h-3.5 text-[#92743A]" />
            <span>{isAr ? 'مساحة العمل' : 'Workspace'}</span>
          </button>

          {isAuthenticated && (
            <>
              <button
                type="button"
                onClick={() => handleGuardedMode('store_builder')}
                className={`whitespace-nowrap shrink-0 pb-1 border-b-2 transition-colors cursor-pointer flex items-center gap-1 ${
                  mode === 'store_builder'
                    ? 'border-[#D5B46B] text-[#14243E] dark:text-[#D5B46B]'
                    : 'border-transparent text-slate-600 dark:text-slate-300 hover:text-[#14243E] dark:hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-[#92743A]" />
                <span>{isAr ? 'Studio' : 'Studio'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleGuardedMode('billing')}
                className={`whitespace-nowrap shrink-0 pb-1 border-b-2 transition-colors cursor-pointer flex items-center gap-1 ${
                  mode === 'billing'
                    ? 'border-[#D5B46B] text-[#14243E] dark:text-[#D5B46B]'
                    : 'border-transparent text-slate-600 dark:text-slate-300 hover:text-[#14243E] dark:hover:text-white'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5 text-[#92743A]" />
                <span>{isAr ? 'الفوترة' : 'Billing'}</span>
              </button>
            </>
          )}

          {isOwner && (
            <>
              <button
                type="button"
                onClick={() => setMode('admin')}
                className={`whitespace-nowrap shrink-0 pb-1 border-b-2 transition-colors cursor-pointer flex items-center gap-1 ${
                  mode === 'admin'
                    ? 'border-[#14243E] dark:border-[#D5B46B] text-[#14243E] dark:text-[#D5B46B]'
                    : 'border-transparent text-slate-600 dark:text-slate-300 hover:text-[#14243E] dark:hover:text-white'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-[#92743A]" />
                <span>{isAr ? 'الإدارة' : 'Admin'}</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('template_hub')}
                className={`whitespace-nowrap shrink-0 pb-1 border-b-2 transition-colors cursor-pointer flex items-center gap-1 ${
                  mode === 'template_hub'
                    ? 'border-[#D5B46B] text-[#14243E] dark:text-[#D5B46B]'
                    : 'border-transparent text-slate-600 dark:text-slate-300 hover:text-[#14243E] dark:hover:text-white'
                }`}
              >
                <FileCode2 className="w-3.5 h-3.5 text-[#92743A]" />
                <span>GitHub</span>
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: Auth Buttons, Lang, Theme, Mobile Menu Trigger */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {isOwner && (
            <>
              <button
                type="button"
                onClick={toggleProductionMode}
                className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                  isProductionMode
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                    : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                }`}
                title={isAr ? 'تبديل وضع الاختبار والإنتاج' : 'Toggle Test / Production'}
              >
                {isProductionMode ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <FlaskConical className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                )}
                <span>
                  {isProductionMode
                    ? isAr
                      ? 'الإنتاج مفعّل'
                      : 'Live'
                    : backendStatus === 'connected'
                    ? isAr
                      ? 'بيئة فعلية'
                      : 'Live DB'
                    : isAr
                    ? 'معاينة محلية'
                    : 'Offline'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setEditorOpen(true)}
                className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-[#14243E] dark:text-[#D5B46B] bg-[#F8F7F2] dark:bg-slate-800 hover:bg-[#EAE6DC] rounded-lg border border-[#D5B46B]/50 transition-colors cursor-pointer"
                title={isAr ? 'تخصيص محتوى الواجهة' : 'Customize Site Content'}
              >
                <Edit3 className="w-3.5 h-3.5 text-[#92743A]" />
                <span>{isAr ? 'تخصيص' : 'Customize'}</span>
              </button>
            </>
          )}

          {!isAuthenticated ? (
            <button
              type="button"
              onClick={() => openClientAuth('login')}
              aria-label={isAr ? 'تسجيل الدخول' : 'Sign In'}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-[11px] sm:text-xs font-black text-[#14243E] dark:text-white bg-[#F8F7F2] dark:bg-slate-800 hover:bg-[#EAE6DC] dark:hover:bg-slate-700 rounded-xl border border-[#D5B46B] transition-colors cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-[#92743A] shrink-0" />
              <span className="whitespace-nowrap">
                {isAr ? 'تسجيل الدخول' : 'Sign In'}
              </span>
            </button>
          ) : !isOwner ? (
            <button
              type="button"
              onClick={() => setMode('portal')}
              aria-label={isAr ? 'مساحة العمل' : 'Workspace'}
              className="flex items-center gap-1.5 px-2 sm:px-3 py-2 text-xs font-black text-[#14243E] dark:text-white bg-[#F8F7F2] dark:bg-slate-800 hover:bg-[#EAE6DC] rounded-xl border border-[#D5B46B] transition-colors cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-[#92743A] shrink-0" />
              <span className="max-w-[96px] truncate hidden sm:inline">{user.name}</span>
            </button>
          ) : null}

          {isOwner && (
            <button
              type="button"
              onClick={() => setMode('admin')}
              className="flex items-center gap-1.5 px-2 sm:px-3 py-2 text-xs font-black text-[#14243E] bg-gradient-to-r from-[#D5B46B] to-[#F3E5AB] hover:opacity-95 rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              <Crown className="w-3.5 h-3.5 text-[#14243E] shrink-0" />
              <span className="whitespace-nowrap hidden sm:inline">{user.name}</span>
            </button>
          )}

          {isAuthenticated && (
            <button
              type="button"
              onClick={logout}
              className="hidden sm:flex items-center gap-1 px-2 py-2 text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 rounded-xl border border-rose-200 dark:border-rose-900 transition-colors cursor-pointer"
              title={isAr ? 'تسجيل الخروج' : 'Sign Out'}
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setLanguage(isAr ? 'en' : 'ar')}
            className="flex items-center gap-1 px-2 py-2 text-xs font-bold text-[#14243E] dark:text-slate-200 bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700/60 transition-colors cursor-pointer"
            title={isAr ? 'Switch to English' : 'التحويل إلى العربية'}
          >
            <Globe className="w-3.5 h-3.5 text-[#92743A]" />
            <span>{isAr ? 'EN' : 'عربي'}</span>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 text-[#14243E] dark:text-slate-200 bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700/60 transition-colors cursor-pointer"
            title={theme === 'dark' ? 'الوضع النهاري الفاتح' : 'الوضع الليلي الداكن'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#D5B46B]" />
            ) : (
              <Moon className="w-4 h-4 text-[#14243E]" />
            )}
          </button>

          {isAuthenticated && (
            <div className="hidden sm:block relative">
              <button
                type="button"
                onClick={() => setActionMenuOpen(!actionMenuOpen)}
                className="px-3 py-2 text-xs font-bold text-white bg-[#14243E] hover:bg-[#1c3357] rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1"
              >
                <span>{isAr ? '+ جديد' : '+ New'}</span>
                <ChevronDown className="w-3 h-3 text-[#D5B46B]" />
              </button>

              {actionMenuOpen && (
                <div
                  className={`absolute ${
                    isAr ? 'left-0' : 'right-0'
                  } mt-2 w-56 bg-white dark:bg-[#082030] border border-[#EAE6DC] dark:border-cyan-950 rounded-xl shadow-2xl py-1.5 z-50 text-xs`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setActionMenuOpen(false);
                      onOpenFormationModal();
                    }}
                    className="w-full text-start px-3 py-2.5 text-[#14243E] dark:text-slate-200 hover:bg-[#F8F7F2] dark:hover:bg-cyan-900/40 flex items-center gap-2 font-semibold cursor-pointer"
                  >
                    <Layers className="w-4 h-4 text-[#92743A]" />
                    <span>{isAr ? 'طلب تأسيس شركة جديدة' : 'Form US / UK Company'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActionMenuOpen(false);
                      onOpenStoreModal();
                    }}
                    className="w-full text-start px-3 py-2.5 text-[#14243E] dark:text-slate-200 hover:bg-[#F8F7F2] dark:hover:bg-cyan-900/40 flex items-center gap-2 font-semibold cursor-pointer"
                  >
                    <Store className="w-4 h-4 text-[#92743A]" />
                    <span>{isAr ? 'إنشاء متجر إلكتروني جديد' : 'Launch New Store'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mobile Drawer Trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="xl:hidden p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-[#14243E] dark:text-white cursor-pointer"
            aria-label={isAr ? 'فتح القائمة الرئيسية' : 'Toggle Navigation Menu'}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Responsive Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-[#EAE6DC] dark:border-slate-800 bg-white dark:bg-[#051724] max-h-[80vh] overflow-y-auto px-4 py-5 space-y-6">
          <div className="flex flex-wrap gap-2">
            <AppLink
              to="/"
              onNavigate={() => setMobileMenuOpen(false)}
              onClick={() => setMode('landing')}
              className="px-3 py-2 rounded-xl bg-[#F8F7F2] dark:bg-[#071D2B] text-xs font-black text-[#14243E] dark:text-white"
            >
              {isAr ? 'الرئيسية' : 'Home'}
            </AppLink>
            <AppLink
              to="/about"
              onNavigate={() => setMobileMenuOpen(false)}
              onClick={() => setMode('landing')}
              className="px-3 py-2 rounded-xl bg-[#F8F7F2] dark:bg-[#071D2B] text-xs font-bold"
            >
              {isAr ? 'عن قبس' : 'About'}
            </AppLink>
            <AppLink
              to="/how-it-works"
              onNavigate={() => setMobileMenuOpen(false)}
              onClick={() => setMode('landing')}
              className="px-3 py-2 rounded-xl bg-[#F8F7F2] dark:bg-[#071D2B] text-xs font-bold"
            >
              {isAr ? 'كيف نعمل' : 'How It Works'}
            </AppLink>
            <AppLink
              to="/pricing"
              onNavigate={() => setMobileMenuOpen(false)}
              onClick={() => setMode('landing')}
              className="px-3 py-2 rounded-xl bg-[#F8F7F2] dark:bg-[#071D2B] text-xs font-bold"
            >
              {isAr ? 'الأسعار' : 'Pricing'}
            </AppLink>
            <AppLink
              to="/contact"
              onNavigate={() => setMobileMenuOpen(false)}
              onClick={() => setMode('landing')}
              className="px-3 py-2 rounded-xl bg-[#F8F7F2] dark:bg-[#071D2B] text-xs font-bold"
            >
              {isAr ? 'اتصل بنا' : 'Contact'}
            </AppLink>
            <AppLink
              to="/faq"
              onNavigate={() => setMobileMenuOpen(false)}
              onClick={() => setMode('landing')}
              className="px-3 py-2 rounded-xl bg-[#F8F7F2] dark:bg-[#071D2B] text-xs font-bold"
            >
              {isAr ? 'الأسئلة الشائعة' : 'FAQ'}
            </AppLink>
            <AppLink
              to="/support"
              onNavigate={() => setMobileMenuOpen(false)}
              onClick={() => setMode('landing')}
              className="px-3 py-2 rounded-xl bg-[#F8F7F2] dark:bg-[#071D2B] text-xs font-bold"
            >
              {isAr ? 'الدعم الفني' : 'Support'}
            </AppLink>
            <button
              type="button"
              onClick={() => handleGuardedMode('portal')}
              className="px-3 py-2 rounded-xl bg-[#14243E] text-[#D5B46B] text-xs font-black cursor-pointer"
            >
              {isAr ? 'مساحة العمل' : 'Workspace'}
            </button>
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  void logout();
                }}
                className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 text-xs font-bold cursor-pointer flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{isAr ? 'تسجيل الخروج' : 'Sign Out'}</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categoryGroups.map(group => {
              const label = SERVICE_CATEGORY_LABELS[group.id];
              return (
                <div
                  key={group.id}
                  className="rounded-xl border border-[#EAE6DC] dark:border-slate-800 p-3.5 space-y-2"
                >
                  <div className="text-xs font-black text-[#92743A] dark:text-[#D5B46B]">
                    {isAr ? label.ar : label.en}
                  </div>
                  <div className="flex flex-col gap-1">
                    {group.items.map(svc => (
                      <AppLink
                        key={svc.path}
                        to={svc.path}
                        onNavigate={() => setMobileMenuOpen(false)}
                        onClick={() => setMode('landing')}
                        className="text-xs text-slate-700 dark:text-slate-200 hover:text-[#92743A] py-1"
                      >
                        {isAr ? svc.titleAr : svc.titleEn}
                      </AppLink>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
