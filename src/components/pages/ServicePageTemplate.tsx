import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { AppLink } from '../../context/RouterContext.tsx';
import { ServicePageData } from '../../types/pages.ts';
import { ALL_SERVICE_PAGES } from '../../data/pages/index.ts';
import { usePageSeo } from '../../utils/seo.ts';
import { ServiceOrderForm } from './ServiceOrderForm.tsx';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ArrowRight,
  Clock,
  ShieldCheck,
  HelpCircle,
  ShoppingBag
} from 'lucide-react';

interface ServicePageTemplateProps {
  service: ServicePageData;
  extraSection?: React.ReactNode;
}

export const ServicePageTemplate: React.FC<ServicePageTemplateProps> = ({
  service,
  extraSection
}) => {
  const { language } = useApp();
  const isAr = language === 'ar';

  const defaultPkg =
    service.packages.find(p => p.recommended) || service.packages[0];
  const [selectedPkgId, setSelectedPkgId] = useState<string>(defaultPkg?.id || '');
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  usePageSeo({
    titleAr: service.seoTitleAr,
    titleEn: service.seoTitleEn,
    descriptionAr: service.seoDescriptionAr,
    descriptionEn: service.seoDescriptionEn,
    path: service.path,
    schemaType: 'Service',
    priceUsd: service.startingPriceUsd,
    faqs: service.faqs
  });

  const relatedServices = service.relatedPaths
    .map(p => ALL_SERVICE_PAGES.find(item => item.path === p))
    .filter((item): item is ServicePageData => Boolean(item));

  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  return (
    <div className="pb-20">
      {/* 1. Navy & Gold Service Hero Header */}
      <section className="bg-[#14243E] text-white border-b border-[#D5B46B]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-xs text-slate-300"
          >
            <AppLink to="/" className="hover:text-[#D5B46B] transition-colors">
              {isAr ? 'الرئيسية' : 'Home'}
            </AppLink>
            <span aria-hidden="true">/</span>
            <AppLink to="/pricing" className="hover:text-[#D5B46B] transition-colors">
              {isAr ? service.categoryLabelAr : service.categoryLabelEn}
            </AppLink>
            <span aria-hidden="true">/</span>
            <span className="text-[#D5B46B] font-bold">
              {isAr ? service.titleAr : service.titleEn}
            </span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Hero Main Content */}
            <div className="lg:col-span-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#D5B46B] font-bold">
                  <span>{isAr ? service.categoryLabelAr : service.categoryLabelEn}</span>
                  <span aria-hidden="true">·</span>
                  <span>{isAr ? service.deliveryTimeAr : service.deliveryTimeEn}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">{service.path}</span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-black leading-tight text-balance">
                  {isAr ? service.titleAr : service.titleEn}
                </h1>

                <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl">
                  {isAr ? service.subtitleAr : service.subtitleEn}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <AppLink
                  to={`/order/${service.slug}${selectedPkgId ? `?pkg=${selectedPkgId}` : ''}`}
                  className="px-6 py-3.5 rounded-xl bg-[#D5B46B] hover:bg-[#c5a45c] text-[#14243E] font-black text-xs sm:text-sm flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isAr ? 'اطلب الخدمة' : 'Order Service'}</span>
                  <ArrowIcon className="w-4 h-4" />
                </AppLink>

                <a
                  href="#order-form"
                  className="px-5 py-3.5 rounded-xl border border-white/25 hover:border-[#D5B46B] text-white font-bold text-xs sm:text-sm transition-colors whitespace-nowrap shrink-0"
                >
                  {isAr ? 'تعبئة نموذج الطلب المباشر' : 'Fill Inline Request Form'}
                </a>
              </div>
            </div>

            {/* Hero Right Focal Summary Card */}
            <div className="lg:col-span-4 rounded-2xl bg-[#0D1B30] border border-[#D5B46B]/50 p-6 flex flex-col justify-between space-y-5">
              <div className="space-y-2 border-b border-white/10 pb-4">
                <div className="text-xs text-[#D5B46B] font-bold">
                  {isAr ? 'السعر الإرشادي يبدأ من' : 'Indicative Pricing Starts At'}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black font-mono text-white tabular-nums">
                    ${service.startingPriceUsd.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-300">
                    USD (~{Math.round(service.startingPriceUsd * 3.75).toLocaleString()}{' '}
                    {isAr ? 'ر.س' : 'SAR'})
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {isAr ? service.pricingNoteAr : service.pricingNoteEn}
                </p>
              </div>

              <div className="space-y-2.5 text-xs text-slate-200">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#D5B46B] shrink-0" />
                  <span>{isAr ? service.deliveryTimeAr : service.deliveryTimeEn}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#D5B46B] shrink-0" />
                  <span>
                    {isAr
                      ? 'يخضع الطلب لمراجعة الأهلية وتأكيد نطاق الخدمة قبل التنفيذ'
                      : 'Requests are reviewed for eligibility and scope before work begins'}
                  </span>
                </div>
              </div>

              <AppLink
                to={`/order/${service.slug}${selectedPkgId ? `?pkg=${selectedPkgId}` : ''}`}
                className="w-full py-3 px-4 rounded-xl bg-white text-[#14243E] hover:bg-[#F8F7F2] font-black text-xs text-center transition-colors"
              >
                {isAr ? 'اطلب الخدمة الآن' : 'Proceed to Service Order'}
              </AppLink>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14 pt-12">
        {/* 2. Detailed Service Description */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-2xl font-black text-[#14243E] dark:text-white">
              {isAr ? 'الوصف التفصيلي للخدمة' : 'Detailed Service Overview'}
            </h2>
            <div className="space-y-3 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              {(isAr ? service.detailedDescriptionAr : service.detailedDescriptionEn).map(
                (para, idx) => (
                  <p key={idx}>{para}</p>
                )
              )}
            </div>
          </div>

          <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-black text-[#14243E] dark:text-white">
              {isAr ? 'الفوائد والمكاسب الرئيسية' : 'Key Business Benefits'}
            </h3>
            <ul className="space-y-3">
              {(isAr ? service.benefitsAr : service.benefitsEn).map((benefit, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#92743A] dark:text-[#D5B46B] shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 3. Features Grid */}
        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-[#14243E] dark:text-white">
              {isAr ? 'المميزات والمكونات المشمولة' : 'Included Features & Capabilities'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {isAr
                ? 'تفاصيل الخدمات المتاحة تخضع للأهلية وتأكيد نطاق الباقة قبل التنفيذ.'
                : 'Available deliverables are subject to eligibility and package-scope confirmation.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {service.features.map((feat, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 p-5 space-y-2.5"
              >
                <div className="text-xs font-mono font-black text-[#92743A] dark:text-[#D5B46B] tabular-nums">
                  0{idx + 1}.
                </div>
                <h3 className="text-sm font-black text-[#14243E] dark:text-white">
                  {isAr ? feat.titleAr : feat.titleEn}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {isAr ? feat.descriptionAr : feat.descriptionEn}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Execution Steps */}
        <section className="rounded-2xl bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#EAE6DC] dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-2xl font-black text-[#14243E] dark:text-white">
                {isAr ? 'خطوات تنفيذ الخدمة' : 'Service Execution Workflow'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {isAr
                  ? 'مراحل إرشادية للطلب؛ تختلف الخطوات والمدد حسب الجهة واكتمال المستندات.'
                  : 'Indicative request stages; steps and timing vary by registry and document completeness.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {service.steps.map(step => (
              <div
                key={step.stepNumber}
                className="p-5 rounded-xl bg-[#F8F7F2] dark:bg-[#051724] border border-[#EAE6DC] dark:border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-black text-[#14243E] dark:text-[#D5B46B] tabular-nums">
                    {step.stepNumber}
                  </span>
                  <span className="text-[11px] font-bold text-[#92743A] dark:text-[#D5B46B]">
                    {isAr ? step.durationAr : step.durationEn}
                  </span>
                </div>
                <h3 className="text-sm font-black text-[#14243E] dark:text-white">
                  {isAr ? step.titleAr : step.titleEn}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {isAr ? step.descriptionAr : step.descriptionEn}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Indicative Packages & Pricing */}
        {service.packages.length > 0 && (
          <section className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-[#14243E] dark:text-white">
                {isAr ? 'الأسعار والباقات الإرشادية' : 'Packages & Indicative Pricing'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {isAr ? service.pricingNoteAr : service.pricingNoteEn}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {service.packages.map(pkg => {
                const isSelected = selectedPkgId === pkg.id;
                return (
                  <div
                    key={pkg.id}
                    className={`rounded-2xl bg-white dark:bg-[#071D2B] p-6 border flex flex-col justify-between space-y-5 ${
                      pkg.recommended || isSelected
                        ? 'border-[#D5B46B] ring-1 ring-[#D5B46B]/40'
                        : 'border-[#EAE6DC] dark:border-slate-800'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[#92743A] dark:text-[#D5B46B]">
                          {pkg.recommended
                            ? isAr
                              ? 'خيار مقترح'
                              : 'Suggested option'
                            : isAr
                            ? 'خيار إرشادي'
                            : 'Indicative option'}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {isAr ? pkg.billingNoteAr : pkg.billingNoteEn}
                        </span>
                      </div>

                      <h3 className="text-lg font-black text-[#14243E] dark:text-white">
                        {isAr ? pkg.nameAr : pkg.nameEn}
                      </h3>

                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black font-mono text-[#14243E] dark:text-[#D5B46B] tabular-nums">
                          ${pkg.priceUsd.toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-500">USD</span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {isAr ? pkg.descriptionAr : pkg.descriptionEn}
                      </p>

                      <ul className="space-y-2 pt-3 border-t border-[#EAE6DC] dark:border-slate-800">
                        {(isAr ? pkg.featuresAr : pkg.featuresEn).map((item, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#92743A] dark:text-[#D5B46B] shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPkgId(pkg.id);
                          const formEl = document.getElementById('order-form');
                          formEl?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={`py-2.5 px-3 rounded-xl font-bold text-xs cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[#D5B46B] text-[#14243E]'
                            : 'border border-[#EAE6DC] dark:border-slate-700 text-[#14243E] dark:text-white hover:border-[#D5B46B]'
                        }`}
                      >
                        {isSelected
                          ? isAr
                            ? 'محددة في النموذج'
                            : 'Selected in Form'
                          : isAr
                          ? 'تحديد الباقة'
                          : 'Select Tier'}
                      </button>

                      <AppLink
                        to={`/order/${service.slug}?pkg=${pkg.id}`}
                        className="py-2.5 px-3 rounded-xl bg-[#14243E] hover:bg-[#1d3559] text-white font-black text-xs text-center transition-colors"
                      >
                        {isAr ? 'اطلب الخدمة' : 'Order Service'}
                      </AppLink>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 6. Optional Specialized Section per Service */}
        {extraSection}

        {/* 7. Service-Specific FAQ */}
        {service.faqs.length > 0 && (
          <section className="space-y-5">
            <div>
              <h2 className="text-2xl font-black text-[#14243E] dark:text-white">
                {isAr ? 'الأسئلة الشائعة حول هذه الخدمة' : 'Service-Specific FAQs'}
              </h2>
            </div>

            <div className="space-y-3">
              {service.faqs.map((faq, idx) => {
                const isOpen = openFaqIdx === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-[#EAE6DC] dark:border-slate-800 bg-white dark:bg-[#071D2B] overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                      className="w-full p-5 text-start flex items-center justify-between gap-4 cursor-pointer font-bold text-sm text-[#14243E] dark:text-white hover:bg-[#F8F7F2] dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <HelpCircle className="w-4 h-4 text-[#92743A] dark:text-[#D5B46B] shrink-0" />
                        <span>{isAr ? faq.questionAr : faq.questionEn}</span>
                      </div>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-[#92743A] shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 pt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-[#EAE6DC] dark:border-slate-800">
                        {isAr ? faq.answerAr : faq.answerEn}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 8. Dedicated Inline Order Form */}
        <section id="order-form" className="scroll-mt-24">
          <ServiceOrderForm
            service={service}
            selectedPackageId={selectedPkgId}
            onPackageChange={setSelectedPkgId}
            variant="inline"
          />
        </section>

        {/* 9. Related Services */}
        {relatedServices.length > 0 && (
          <section className="space-y-5 pt-4 border-t border-[#EAE6DC] dark:border-slate-800">
            <h2 className="text-xl font-black text-[#14243E] dark:text-white">
              {isAr ? 'خدمات مكملة ذات صلة' : 'Related QABS Services'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedServices.map(rel => (
                <AppLink
                  key={rel.path}
                  to={rel.path}
                  className="p-5 rounded-2xl bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 hover:border-[#D5B46B] transition-colors flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-[#92743A] dark:text-[#D5B46B]">
                      {isAr ? rel.categoryLabelAr : rel.categoryLabelEn}
                    </div>
                    <h3 className="text-sm font-black text-[#14243E] dark:text-white">
                      {isAr ? rel.titleAr : rel.titleEn}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-[#14243E] dark:text-[#D5B46B]">
                    <span className="font-mono tabular-nums">
                      ${rel.startingPriceUsd}+
                    </span>
                    <span className="flex items-center gap-1">
                      <span>{isAr ? 'عرض الخدمة' : 'View'}</span>
                      <ArrowIcon className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </AppLink>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
