import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import { AppLink } from '../context/RouterContext.tsx';
import {
  FORMATION_SERVICES,
  COMPLIANCE_SERVICES,
  STORE_SERVICES,
  PAYMENT_SERVICES,
  DIGITAL_SERVICES
} from '../data/pages/index.ts';
import { QabsLogo } from './QabsLogo.tsx';

export const Footer: React.FC = () => {
  const { language, setMode } = useApp();
  const isAr = language === 'ar';

  const handleLinkClick = () => {
    setMode('landing');
  };

  const formationAndCompliance = [...FORMATION_SERVICES, ...COMPLIANCE_SERVICES];
  const storesAndPayments = [...STORE_SERVICES, ...PAYMENT_SERVICES];

  const generalLinks = [
    { path: '/about', ar: 'عن منصة قبس', en: 'About QABS' },
    { path: '/how-it-works', ar: 'كيف تعمل المنصة', en: 'How It Works' },
    { path: '/pricing', ar: 'الأسعار والباقات', en: 'Pricing & Plans' },
    { path: '/contact', ar: 'تواصل معنا', en: 'Contact Us' },
    { path: '/faq', ar: 'الأسئلة الشائعة', en: 'FAQ' },
    { path: '/support', ar: 'مركز الدعم الفني', en: 'Support Center' },
    { path: '/privacy', ar: 'سياسة الخصوصية', en: 'Privacy Policy' },
    { path: '/terms', ar: 'الشروط والأحكام', en: 'Terms of Service' }
  ];

  return (
    <footer className="w-full bg-[#14243E] text-slate-300 border-t-2 border-[#D5B46B]/50 text-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          {/* Brand Summary */}
          <div className="lg:col-span-4 space-y-4">
            <AppLink to="/" onClick={handleLinkClick} className="inline-block">
              <QabsLogo size="md" />
            </AppLink>
            <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
              {isAr
                ? 'منصة قبس الرقمية المتكاملة لتأسيس الشركات الأمريكية والبريطانية، إدارة الامتثال والوكيل المسجل، بناء المتاجر المستقلة، وتجهيز بوابات الدفع والحسابات التجارية.'
                : 'QABS Digital Platform unites US & UK company formation, registered agent compliance, multi-tenant stores, payment gateways, and digital growth services.'}
            </p>
            <div className="pt-1">
              <AppLink
                to="/order/company-formation"
                onClick={handleLinkClick}
                className="inline-flex items-center px-4 py-2.5 rounded-xl bg-[#D5B46B] hover:bg-[#c5a358] text-[#14243E] font-black text-xs transition-colors"
              >
                {isAr ? 'اطلب خدمة الآن' : 'Order a Service'}
              </AppLink>
            </div>
          </div>

          {/* Column 1: Formation & Compliance */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-black text-[#D5B46B]">
              {isAr ? 'الشركات والامتثال' : 'Formation & Compliance'}
            </h3>
            <ul className="space-y-2">
              {formationAndCompliance.map(svc => (
                <li key={svc.path}>
                  <AppLink
                    to={svc.path}
                    onClick={handleLinkClick}
                    className="text-[11px] text-slate-300 hover:text-[#D5B46B] transition-colors"
                  >
                    {isAr ? svc.titleAr : svc.titleEn}
                  </AppLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Stores & Payments */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-black text-[#D5B46B]">
              {isAr ? 'المتاجر والدفع' : 'Stores & Payments'}
            </h3>
            <ul className="space-y-2">
              {storesAndPayments.map(svc => (
                <li key={svc.path}>
                  <AppLink
                    to={svc.path}
                    onClick={handleLinkClick}
                    className="text-[11px] text-slate-300 hover:text-[#D5B46B] transition-colors"
                  >
                    {isAr ? svc.titleAr : svc.titleEn}
                  </AppLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Digital Services */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-black text-[#D5B46B]">
              {isAr ? 'الخدمات الرقمية' : 'Digital Services'}
            </h3>
            <ul className="space-y-2">
              {DIGITAL_SERVICES.map(svc => (
                <li key={svc.path}>
                  <AppLink
                    to={svc.path}
                    onClick={handleLinkClick}
                    className="text-[11px] text-slate-300 hover:text-[#D5B46B] transition-colors"
                  >
                    {isAr ? svc.titleAr : svc.titleEn}
                  </AppLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: General Pages */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-black text-[#D5B46B]">
              {isAr ? 'عن المنصة والدعم' : 'Platform & Legal'}
            </h3>
            <ul className="space-y-2">
              {generalLinks.map(item => (
                <li key={item.path}>
                  <AppLink
                    to={item.path}
                    onClick={handleLinkClick}
                    className="text-[11px] text-slate-300 hover:text-[#D5B46B] transition-colors"
                  >
                    {isAr ? item.ar : item.en}
                  </AppLink>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>
            {isAr
              ? 'الرسوم الحكومية ورسوم الجهات الخارجية منفصلة. قبول Stripe و PayPal يخضع للأهلية وموافقة المزود.'
              : 'Government statutory and third-party fees separate. Stripe & PayPal approvals are subject to provider compliance.'}
          </p>
          <div className="flex items-center gap-4 font-semibold text-[#D5B46B]">
            <span>© 2026 QABS | قبس — متاجر إلكترونية | خدمات رقمية.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
