import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { AppLink, useRouter } from '../context/RouterContext.tsx';
import { ALL_SERVICE_PAGES, getServiceBySlug } from '../data/pages/index.ts';
import { usePageSeo } from '../utils/seo.ts';
import { ServiceOrderForm } from '../components/pages/ServiceOrderForm.tsx';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

interface OrderServicePageProps {
  serviceSlug?: string;
}

export const OrderServicePage: React.FC<OrderServicePageProps> = ({ serviceSlug }) => {
  const { language, submittedServiceOrders } = useApp();
  const { searchParams, navigate } = useRouter();
  const isAr = language === 'ar';

  const initialService =
    (serviceSlug && getServiceBySlug(serviceSlug)) || ALL_SERVICE_PAGES[0];
  const [activeSlug, setActiveSlug] = useState<string>(initialService.slug);

  const currentService = getServiceBySlug(activeSlug) || ALL_SERVICE_PAGES[0];
  const preselectedPkg = searchParams.get('pkg') || undefined;

  usePageSeo({
    titleAr: `طلب خدمة: ${currentService.titleAr} | قبس QABS`,
    titleEn: `Order Service: ${currentService.titleEn} | QABS`,
    descriptionAr: `قدّم طلبك المباشر لخدمة ${currentService.titleAr} مع حفظ نوع الخدمة والباقة وجميع البيانات المطلوبة.`,
    descriptionEn: `Complete your direct order for ${currentService.titleEn} with saved package selection and tracking reference.`,
    path: `/order/${currentService.slug}`,
    schemaType: 'WebPage'
  });

  const handleSwitchService = (slug: string) => {
    setActiveSlug(slug);
    navigate(`/order/${slug}`);
  };

  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  return (
    <div className="pb-20">
      <section className="bg-[#14243E] text-white border-b border-[#D5B46B]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-4">
          <nav className="flex items-center gap-2 text-xs text-slate-300">
            <AppLink to="/" className="hover:text-[#D5B46B]">
              {isAr ? 'الرئيسية' : 'Home'}
            </AppLink>
            <span aria-hidden="true">/</span>
            <AppLink to={currentService.path} className="hover:text-[#D5B46B]">
              {isAr ? currentService.titleAr : currentService.titleEn}
            </AppLink>
            <span aria-hidden="true">/</span>
            <span className="text-[#D5B46B] font-bold">
              {isAr ? 'نموذج طلب الخدمة' : 'Service Order'}
            </span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black text-balance">
                {isAr
                  ? `طلب خدمة: ${currentService.titleAr}`
                  : `Order: ${currentService.titleEn}`}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
                {isAr
                  ? 'مسار طلب مخصص يحفظ نوع الخدمة وبياناتك المطلوبة لإصدار الرقم المرجعي ومتابعة التنفيذ.'
                  : 'Dedicated service order route saving your chosen service type, tier, and project details.'}
              </p>
            </div>

            <AppLink
              to={currentService.path}
              className="px-4 py-2.5 rounded-xl border border-white/25 hover:border-[#D5B46B] text-white text-xs font-bold flex items-center gap-2 self-start whitespace-nowrap shrink-0"
            >
              <BackArrow className="w-3.5 h-3.5" />
              <span>{isAr ? 'العودة لصفحة الخدمة' : 'Back to Service Page'}</span>
            </AppLink>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          {/* Quick Service Switcher */}
          <div className="rounded-2xl bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 p-5 space-y-3">
            <label
              htmlFor="qabs-order-service-select"
              className="block text-xs font-black text-[#14243E] dark:text-white"
            >
              {isAr ? 'نوع الخدمة المحفوظة في الطلب:' : 'Selected Service Type:'}
            </label>
            <select
              id="qabs-order-service-select"
              value={currentService.slug}
              onChange={e => handleSwitchService(e.target.value)}
              className="w-full rounded-xl border border-[#EAE6DC] dark:border-slate-700 bg-[#F8F7F2] dark:bg-[#051724] px-3.5 py-2.5 text-xs font-bold text-[#14243E] dark:text-white"
            >
              {ALL_SERVICE_PAGES.map(svc => (
                <option key={svc.slug} value={svc.slug}>
                  {isAr
                    ? `${svc.categoryLabelAr} — ${svc.titleAr} (من $${svc.startingPriceUsd})`
                    : `${svc.categoryLabelEn} — ${svc.titleEn} ($${svc.startingPriceUsd}+)`}
                </option>
              ))}
            </select>
          </div>

          <ServiceOrderForm
            service={currentService}
            selectedPackageId={preselectedPkg}
            variant="dedicated"
          />
        </div>

        {/* Saved Orders & Service Summary Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 p-6 space-y-4">
            <h2 className="text-base font-black text-[#14243E] dark:text-white">
              {isAr ? 'ما الذي تحصل عليه؟' : 'What Is Included'}
            </h2>
            <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
              {(isAr ? currentService.benefitsAr : currentService.benefitsEn).map((b, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#92743A] dark:text-[#D5B46B] shrink-0 mt-0.5" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          {submittedServiceOrders.length > 0 && (
            <div className="rounded-2xl bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 p-6 space-y-4">
              <h3 className="text-sm font-black text-[#14243E] dark:text-white">
                {isAr ? 'طلباتك المحفوظة مؤخراً' : 'Your Saved Service Orders'}
              </h3>
              <div className="space-y-3">
                {submittedServiceOrders.slice(0, 4).map(ord => (
                  <div
                    key={ord.id}
                    className="p-3 rounded-xl bg-[#F8F7F2] dark:bg-[#051724] border border-[#EAE6DC] dark:border-slate-800 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-mono font-bold">
                      <span className="text-[#92743A] dark:text-[#D5B46B]">{ord.referenceCode}</span>
                      <span className="text-[#14243E] dark:text-white tabular-nums">${ord.priceUsd}</span>
                    </div>
                    <div className="font-bold text-[#14243E] dark:text-white truncate">
                      {isAr ? ord.serviceTitleAr : ord.serviceTitleEn}
                    </div>
                    <div className="text-[11px] text-slate-500">{ord.createdAt}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
