import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { AppLink } from '../../context/RouterContext.tsx';
import {
  GENERAL_PAGES,
  ALL_SERVICE_PAGES,
  SERVICE_CATEGORY_LABELS
} from '../../data/pages/index.ts';
import { SUBSCRIPTION_PLANS } from '../../data/mockData.ts';
import { ServiceCategoryId } from '../../types/pages.ts';
import { GeneralPageTemplate } from '../../components/pages/GeneralPageTemplate.tsx';
import { CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';

export const PricingPage: React.FC = () => {
  const { language } = useApp();
  const isAr = language === 'ar';
  const page = GENERAL_PAGES.pricing;
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const [selectedCategory, setSelectedCategory] = useState<'all' | ServiceCategoryId>('all');
  const [storeCycle, setStoreCycle] = useState<'monthly' | 'annual'>('monthly');

  const categories: { id: 'all' | ServiceCategoryId; ar: string; en: string }[] = [
    { id: 'all', ar: 'جميع الخدمات (20)', en: 'All Services (20)' },
    ...(Object.keys(SERVICE_CATEGORY_LABELS) as ServiceCategoryId[]).map(cat => ({
      id: cat,
      ar: SERVICE_CATEGORY_LABELS[cat].ar,
      en: SERVICE_CATEGORY_LABELS[cat].en
    }))
  ];

  const visibleServices =
    selectedCategory === 'all'
      ? ALL_SERVICE_PAGES
      : ALL_SERVICE_PAGES.filter(s => s.category === selectedCategory);

  return (
    <GeneralPageTemplate
      page={page}
      schemaType="WebPage"
      headerAction={
        <AppLink
          to="/order/company-formation"
          className="px-5 py-3 rounded-xl bg-[#D5B46B] hover:bg-[#c5a358] text-[#14243E] font-black text-xs flex items-center gap-2 whitespace-nowrap shrink-0"
        >
          <span>{isAr ? 'ابدأ طلب خدمة' : 'Order a Service'}</span>
          <ArrowIcon className="w-4 h-4" />
        </AppLink>
      }
    >
      {/* Category Filter */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-[#14243E] dark:text-white">
              {isAr ? 'دليل أسعار الخدمات المستقلة' : 'Independent Services Pricing Directory'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {isAr
                ? 'اختر التصنيف لعرض تفاصيل كل خدمة والانتقال إلى صفحتها المستقلة أو نموذج طلبها.'
                : 'Filter by category to compare starting rates and open each dedicated service page.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-[#14243E] text-white border-[#14243E] dark:bg-[#D5B46B] dark:text-[#14243E] dark:border-[#D5B46B]'
                    : 'bg-white dark:bg-[#071D2B] text-slate-700 dark:text-slate-300 border-[#EAE6DC] dark:border-slate-800 hover:border-[#D5B46B]'
                }`}
              >
                {isAr ? cat.ar : cat.en}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleServices.map(svc => (
            <div
              key={svc.slug}
              className="rounded-2xl bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 p-6 flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-bold text-[#92743A] dark:text-[#D5B46B]">
                    {isAr ? svc.categoryLabelAr : svc.categoryLabelEn}
                  </span>
                  <span className="font-mono text-slate-500">
                    {isAr ? svc.deliveryTimeAr : svc.deliveryTimeEn}
                  </span>
                </div>

                <h3 className="text-base font-black text-[#14243E] dark:text-white leading-snug">
                  {isAr ? svc.titleAr : svc.titleEn}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                  {isAr ? svc.subtitleAr : svc.subtitleEn}
                </p>

                <div className="pt-2 border-t border-[#EAE6DC] dark:border-slate-800 flex items-baseline justify-between">
                  <span className="text-xs text-slate-500">
                    {isAr ? 'تبدأ من' : 'Starting at'}
                  </span>
                  <span className="text-2xl font-black font-mono tabular-nums text-[#14243E] dark:text-[#D5B46B]">
                    ${svc.startingPriceUsd}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  {isAr ? svc.pricingNoteAr : svc.pricingNoteEn}
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <AppLink
                  to={svc.path}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-[#EAE6DC] dark:border-slate-700 hover:border-[#D5B46B] text-center text-xs font-bold text-[#14243E] dark:text-slate-200 whitespace-nowrap"
                >
                  {isAr ? 'تفاصيل الخدمة' : 'View Page'}
                </AppLink>
                <AppLink
                  to={`/order/${svc.slug}`}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-[#14243E] hover:bg-[#1d3559] text-white text-center text-xs font-black whitespace-nowrap"
                >
                  {isAr ? 'اطلب الخدمة' : 'Order Now'}
                </AppLink>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Store Subscription Plans */}
      <section className="space-y-6 pt-4 border-t border-[#EAE6DC] dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-[#14243E] dark:text-white">
              {isAr ? 'باقات اشتراك متاجر قبس المستقلة' : 'QABS Standalone Store Subscriptions'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {isAr
                ? 'عمولة مبيعات 0% مع استضافة معزولة ودعم العربية والإنجليزية.'
                : '0% transaction commission with isolated cloud hosting and bilingual RTL/LTR support.'}
            </p>
          </div>

          <div className="inline-flex rounded-xl border border-[#EAE6DC] dark:border-slate-800 bg-white dark:bg-[#071D2B] p-1 self-start">
            <button
              type="button"
              onClick={() => setStoreCycle('monthly')}
              className={`px-4 py-2 rounded-lg text-xs font-bold cursor-pointer ${
                storeCycle === 'monthly'
                  ? 'bg-[#14243E] text-white'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {isAr ? 'اشتراك شهري' : 'Monthly'}
            </button>
            <button
              type="button"
              onClick={() => setStoreCycle('annual')}
              className={`px-4 py-2 rounded-lg text-xs font-bold cursor-pointer ${
                storeCycle === 'annual'
                  ? 'bg-[#14243E] text-white'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {isAr ? 'اشتراك سنوي' : 'Annual'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SUBSCRIPTION_PLANS.map(plan => {
            const price = storeCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly;
            return (
              <div
                key={plan.id}
                className={`rounded-2xl p-6 flex flex-col justify-between space-y-5 border ${
                  plan.popular
                    ? 'bg-[#14243E] text-white border-[#D5B46B] shadow-lg'
                    : 'bg-white dark:bg-[#071D2B] text-[#14243E] dark:text-white border-[#EAE6DC] dark:border-slate-800'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-black">
                      {isAr ? plan.nameAr : plan.nameEn}
                    </h3>
                    {plan.popular && (
                      <span className="text-[11px] font-black text-[#D5B46B]">
                        {isAr ? 'الأكثر طلباً' : 'Popular'}
                      </span>
                    )}
                  </div>
                  <div className="text-3xl font-black font-mono tabular-nums text-[#D5B46B]">
                    ${price}
                    <span className="text-xs font-normal opacity-75">
                      {' '}
                      / {isAr ? 'شهرياً' : 'mo'}
                    </span>
                  </div>
                  <p className={`text-xs leading-relaxed ${plan.popular ? 'text-slate-300' : 'text-slate-500 dark:text-slate-300'}`}>
                    {isAr ? plan.descriptionAr : plan.descriptionEn}
                  </p>
                  <ul className="space-y-2 pt-2 text-xs">
                    {(isAr ? plan.featuresAr : plan.featuresEn).map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#D5B46B] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <AppLink
                  to="/order/store-creation"
                  className={`w-full py-3 rounded-xl font-black text-xs text-center transition-colors ${
                    plan.popular
                      ? 'bg-[#D5B46B] hover:bg-[#c5a358] text-[#14243E]'
                      : 'bg-[#14243E] hover:bg-[#1d3559] text-white'
                  }`}
                >
                  {isAr ? 'اطلب إنشاء متجر بهذه الباقة' : 'Order Store with Plan'}
                </AppLink>
              </div>
            );
          })}
        </div>
      </section>
    </GeneralPageTemplate>
  );
};
