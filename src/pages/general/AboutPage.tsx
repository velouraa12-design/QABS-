import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { AppLink } from '../../context/RouterContext.tsx';
import { GENERAL_PAGES, ALL_SERVICE_PAGES } from '../../data/pages/index.ts';
import { GeneralPageTemplate } from '../../components/pages/GeneralPageTemplate.tsx';
import {
  Building2,
  ShieldCheck,
  Store,
  Globe,
  CheckCircle2,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { language } = useApp();
  const isAr = language === 'ar';
  const page = GENERAL_PAGES.about;
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const pillars = [
    {
      icon: Building2,
      titleAr: 'التأسيس القانوني الدولي',
      titleEn: 'International Incorporation',
      descAr:
        'تأسيس شركات LLC و C-Corp في جميع الولايات الأمريكية الخمسين وشركات UK LTD في بريطانيا عن بُعد بنسبة ملكية 100% لغير المقيمين.',
      descEn:
        'Remote 100% foreign-owned US LLC & C-Corp filings across all 50 states plus UK LTD registration.',
      link: '/services/company-formation'
    },
    {
      icon: ShieldCheck,
      titleAr: 'الامتثال وحفظ الكيانات',
      titleEn: 'Continuous Statutory Compliance',
      descAr:
        'إدارة الوكيل المسجل، تجديد التقارير السنوية، استخراج الرقم الضريبي EIN، وضمان حالة Good Standing دون غرامات تأخير.',
      descEn:
        'Registered agent representation, annual reports, IRS EIN retrieval, and Good Standing preservation.',
      link: '/services/compliance'
    },
    {
      icon: Store,
      titleAr: 'متاجر قبس المستقلة (QABS Stores)',
      titleEn: 'Isolated Multi-Tenant Stores',
      descAr:
        'بنية تحتية معزولة تمنح كل تاجر متجراً مستقلاً ونطاقاً مخصصاً واستوديو تصميم مرئي متكامل دون قيود.',
      descEn:
        'Multi-tenant isolated architecture giving every brand its own storefront, custom domain, and visual studio.',
      link: '/services/store-creation'
    },
    {
      icon: Globe,
      titleAr: 'الجاهزية البنكية وبوابات الدفع',
      titleEn: 'Global Banking & Payment Gateways',
      descAr:
        'تجهيز ملفات الحسابات البنكية التجارية (Mercury / Wise / Relay) وربط بوابات الدفع Stripe و PayPal و Tap و Moyasar.',
      descEn:
        'Turnkey readiness for commercial fintech banking and Stripe, PayPal, Tap & Moyasar integrations.',
      link: '/services/payment-gateways'
    }
  ];

  const stats = [
    { val: '50', labelAr: 'ولاية أمريكية + بريطانيا', labelEn: 'US States + UK' },
    { val: '20+', labelAr: 'خدمة رقمية وقانونية مستقلة', labelEn: 'Dedicated Services' },
    { val: '100%', labelAr: 'عزل لبيانات كل متجر وعميل', labelEn: 'Tenant Data Isolation' },
    { val: '24/7', labelAr: 'مساحة عمل سحابية متاحة', labelEn: 'Cloud Workspace Access' }
  ];

  return (
    <GeneralPageTemplate
      page={page}
      schemaType="AboutPage"
      headerAction={
        <AppLink
          to="/pricing"
          className="px-5 py-3 rounded-xl bg-[#D5B46B] hover:bg-[#c5a358] text-[#14243E] font-black text-xs flex items-center gap-2 whitespace-nowrap shrink-0"
        >
          <span>{isAr ? 'استعرض الباقات والأسعار' : 'Explore Pricing & Plans'}</span>
          <ArrowIcon className="w-4 h-4" />
        </AppLink>
      }
    >
      {/* Vision & Mission */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 p-6 sm:p-8 space-y-5">
          <h2 className="text-2xl font-black text-[#14243E] dark:text-white">
            {isAr ? 'رؤيتنا ورسالتنا' : 'Our Mission & Operating Philosophy'}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {isAr
              ? 'وُلدت منصة قبس الرقمية (QABS) لحل الفجوة التي يواجهها رواد الأعمال والتجار في المنطقة العربية والعالم عند التوسع الدولي: تشتت الإجراءات بين مكاتب التأسيس، واستشاريي الضرائب، وشركات تطوير المتاجر، ومزودي بوابات الدفع.'
              : 'QABS Digital Platform was built to eliminate the fragmentation global founders face when scaling cross-border—replacing separate incorporation brokers, compliance agents, storefront agencies, and payment consultants with one sovereign platform.'}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {isAr
              ? 'نجمع اليوم أكثر من 20 خدمة متخصصة في منظومة واحدة بشفافية كاملة في الأسعار، ومسارات تنفيذ موثقة، وعزل تقني صارم لبيانات كل عميل ومتجر.'
              : 'Today QABS unifies over 20 specialized legal, commerce, payment, and digital growth services under one roof with transparent pricing, documented delivery milestones, and strict per-tenant isolation.'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {[
              {
                ar: 'شفافية تامة وفصل واضح بين الأتعاب والرسوم الحكومية',
                en: 'Full separation between QABS fees and statutory state fees'
              },
              {
                ar: 'دعم أصيل للغتين العربية RTL والإنجليزية LTR',
                en: 'Native Arabic RTL and English LTR across every workflow'
              },
              {
                ar: 'ملكية كاملة للعميل على الكيان والنطاق والبيانات',
                en: '100% founder ownership over entities, domains, and data'
              },
              {
                ar: 'تكامل مباشر مع بنية التجارة والدفع العالمية',
                en: 'Direct alignment with global banking and payment underwriting'
              }
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-[#92743A] dark:text-[#D5B46B] shrink-0 mt-0.5" />
                <span>{isAr ? item.ar : item.en}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Key Figures */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-4">
          {stats.map(st => (
            <div
              key={st.val}
              className="rounded-2xl bg-[#14243E] text-white p-6 border border-[#D5B46B]/30 space-y-2"
            >
              <div className="text-3xl font-black font-mono tabular-nums text-[#D5B46B]">
                {st.val}
              </div>
              <div className="text-xs text-slate-200 font-bold leading-snug">
                {isAr ? st.labelAr : st.labelEn}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Four Pillars */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-black text-[#14243E] dark:text-white">
            {isAr ? 'الركائز الأربع لمنظومة قبس' : 'Four Pillars of the QABS Ecosystem'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isAr
              ? `تغطي المنصة حالياً ${ALL_SERVICE_PAGES.length} خدمة مستقلة عبر خمسة مسارات تخصصية.`
              : `Our platform currently spans ${ALL_SERVICE_PAGES.length} dedicated services across five core tracks.`}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map(pillar => {
            const Icon = pillar.icon;
            return (
              <AppLink
                key={pillar.link}
                to={pillar.link}
                className="group rounded-2xl bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 hover:border-[#D5B46B] p-6 space-y-4 transition-colors"
              >
                <div className="w-11 h-11 rounded-xl bg-[#14243E] text-[#D5B46B] flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-[#14243E] dark:text-white group-hover:text-[#92743A] dark:group-hover:text-[#D5B46B] transition-colors">
                    {isAr ? pillar.titleAr : pillar.titleEn}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {isAr ? pillar.descAr : pillar.descEn}
                  </p>
                </div>
                <div className="text-xs font-black text-[#92743A] dark:text-[#D5B46B] flex items-center gap-1.5">
                  <span>{isAr ? 'استكشف الخدمة' : 'Explore Service'}</span>
                  <ArrowIcon className="w-3.5 h-3.5" />
                </div>
              </AppLink>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="rounded-2xl bg-[#14243E] text-white p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <h2 className="text-xl sm:text-2xl font-black">
            {isAr ? 'جاهز لإطلاق شركتك أو متجرك مع قبس؟' : 'Ready to Launch Your Entity or Store with QABS?'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            {isAr
              ? 'ابدأ الآن عبر صفحة الطلب المخصصة أو تواصل مع فريق الاستشارات لتحديد المسار الأنسب لنشاطك.'
              : 'Start via our dedicated order workflow or talk to our advisory team to pick the ideal setup.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <AppLink
            to="/order/company-formation"
            className="px-5 py-3 rounded-xl bg-[#D5B46B] hover:bg-[#c5a358] text-[#14243E] font-black text-xs whitespace-nowrap"
          >
            {isAr ? 'اطلب خدمة الآن' : 'Order a Service'}
          </AppLink>
          <AppLink
            to="/contact"
            className="px-5 py-3 rounded-xl border border-white/25 hover:border-[#D5B46B] text-white font-bold text-xs whitespace-nowrap"
          >
            {isAr ? 'تواصل معنا' : 'Contact Team'}
          </AppLink>
        </div>
      </section>
    </GeneralPageTemplate>
  );
};
