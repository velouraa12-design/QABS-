import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { AppLink } from '../../context/RouterContext.tsx';
import { GENERAL_PAGES } from '../../data/pages/index.ts';
import { GeneralPageTemplate } from '../../components/pages/GeneralPageTemplate.tsx';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  const { language } = useApp();
  const isAr = language === 'ar';
  const page = GENERAL_PAGES.howItWorks;
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const phases = [
    {
      num: '01',
      titleAr: 'اختيار الخدمة وتعبئة نموذج الطلب المستقل',
      titleEn: 'Select Service & Submit Dedicated Requirements',
      durationAr: '10 دقائق',
      durationEn: '10 Minutes',
      descAr:
        'تصفح الخدمة المناسبة لنشاطك (تأسيس شركة، EIN، متجر إلكتروني، بوابة دفع، أو هوية بصرية) واختر الباقة المعتمدة، ثم أدخل بياناتك في النموذج المخصص لتحصل فوراً على رقم مرجعي.',
      descEn:
        'Choose your target service, select a transparent package tier, and complete the tailored intake form to receive an instant tracking reference.',
      links: [
        { to: '/services/company-formation', ar: 'تأسيس الشركات', en: 'Company Formation' },
        { to: '/services/us-llc', ar: 'تأسيس US LLC', en: 'US LLC Pricing' },
        { to: '/services/store-creation', ar: 'إنشاء المتاجر', en: 'Store Creation' }
      ]
    },
    {
      num: '02',
      titleAr: 'المراجعة القانونية وإيداع المستندات الرسمية',
      titleEn: 'Compliance Verification & Statutory Filing',
      durationAr: '1 – 5 أيام عمل',
      durationEn: '1–5 Business Days',
      descAr:
        'يراجع فريق قبس صحة الاسم التجاري وبيانات الملاك (KYC)، ثم يباشر الإيداع الرسمي لدى سكرتير الولاية الأمريكية أو Companies House وتعيين الوكيل المسجل وتجهيز عقد التأسيس.',
      descEn:
        'QABS verifies entity name availability and KYC records, files official formation documents with the state or Companies House, and assigns your Registered Agent.',
      links: [
        { to: '/services/registered-agent', ar: 'الوكيل المسجل', en: 'Registered Agent' },
        { to: '/services/ein', ar: 'الرقم الضريبي EIN', en: 'IRS EIN Filing' },
        { to: '/services/compliance', ar: 'الامتثال السنوي', en: 'Compliance' }
      ]
    },
    {
      num: '03',
      titleAr: 'فتح الحسابات البنكية وربط بوابات الدفع',
      titleEn: 'Business Banking & Payment Gateway Integration',
      durationAr: '3 – 10 أيام عمل',
      durationEn: '3–10 Business Days',
      descAr:
        'بعد صدور السجل والرقم الضريبي EIN، نجهز ملف التقديم للبنوك التجارية (Mercury / Wise / Relay) ونربط بوابات الدفع Stripe أو PayPal أو Tap أو Moyasar مع ضبط الويب هوك والاختبارات.',
      descEn:
        'With formation and EIN documents ready, we prepare your commercial banking application (Mercury / Wise / Relay) and integrate Stripe, PayPal, Tap, or Moyasar.',
      links: [
        { to: '/services/business-accounts', ar: 'الحسابات البنكية', en: 'Business Banking' },
        { to: '/services/payment-gateways', ar: 'بوابات الدفع', en: 'Payment Gateways' },
        { to: '/services/payment-integration', ar: 'الربط التقني للدفع', en: 'Payment Integration' }
      ]
    },
    {
      num: '04',
      titleAr: 'إطلاق المتجر الإلكتروني والتوسع المستمر',
      titleEn: 'Storefront Launch, Multi-Store & Ongoing Growth',
      durationAr: 'تشغيل مستمر',
      durationEn: 'Continuous Scale',
      descAr:
        'أطلق متجرك المعزول أو منظومة المتاجر المتعددة مع ربط النطاق المخصص والهوية التجارية وحلول التسويق والأتمتة بالذكاء الاصطناعي من لوحة موحدة.',
      descEn:
        'Launch your isolated storefront or multi-store fleet with custom domain SSL, brand identity, marketing automation, and QABS AI copilot operations.',
      links: [
        { to: '/services/multi-store', ar: 'المتاجر المتعددة', en: 'Multi-Store Architecture' },
        { to: '/services/marketing', ar: 'التسويق الرقمي', en: 'Digital Marketing' },
        { to: '/services/ai-solutions', ar: 'حلول الذكاء الاصطناعي', en: 'AI Solutions' }
      ]
    }
  ];

  return (
    <GeneralPageTemplate
      page={page}
      schemaType="WebPage"
      headerAction={
        <AppLink
          to="/order/company-formation"
          className="px-5 py-3 rounded-xl bg-[#D5B46B] hover:bg-[#c5a358] text-[#14243E] font-black text-xs flex items-center gap-2 whitespace-nowrap shrink-0"
        >
          <span>{isAr ? 'ابدأ طلبك الأول الآن' : 'Start Your First Request'}</span>
          <ArrowIcon className="w-4 h-4" />
        </AppLink>
      }
    >
      <section className="space-y-6">
        {phases.map(phase => (
          <div
            key={phase.num}
            className="rounded-2xl bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 p-6 sm:p-8 flex flex-col lg:flex-row gap-6 justify-between"
          >
            <div className="flex items-start gap-4 max-w-3xl">
              <div className="w-12 h-12 rounded-2xl bg-[#14243E] text-[#D5B46B] font-mono font-black text-base flex items-center justify-center shrink-0 tabular-nums">
                {phase.num}
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <span className="font-mono font-bold text-[#92743A] dark:text-[#D5B46B]">
                    {isAr ? `المدة المتوقعة: ${phase.durationAr}` : `Est. Duration: ${phase.durationEn}`}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-[#14243E] dark:text-white">
                  {isAr ? phase.titleAr : phase.titleEn}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {isAr ? phase.descAr : phase.descEn}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap lg:flex-col gap-2 shrink-0 lg:w-60 justify-center">
              {phase.links.map(lnk => (
                <AppLink
                  key={lnk.to}
                  to={lnk.to}
                  className="px-4 py-2.5 rounded-xl bg-[#F8F7F2] dark:bg-[#051724] border border-[#EAE6DC] dark:border-slate-800 hover:border-[#D5B46B] text-xs font-bold text-[#14243E] dark:text-slate-200 flex items-center justify-between gap-2 transition-colors"
                >
                  <span>{isAr ? lnk.ar : lnk.en}</span>
                  <ArrowIcon className="w-3.5 h-3.5 text-[#92743A] dark:text-[#D5B46B]" />
                </AppLink>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-2xl bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 p-6 sm:p-8 space-y-5">
        <h2 className="text-xl font-black text-[#14243E] dark:text-white">
          {isAr ? 'ما الذي يميز مسار التنفيذ في قبس؟' : 'Why Founders Choose the QABS Workflow'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              ar: 'رقم مرجعي مستقل لكل طلب مع متابعة فورية للمراحل',
              en: 'Dedicated reference ID for every service request with clear milestones'
            },
            {
              ar: 'لا نافذة منبثقة مبهمة — لكل خدمة صفحة وشروط وتكلفة معلنة',
              en: 'No opaque popups — each service has its own transparent scope and deliverables'
            },
            {
              ar: 'دعم فني وقانوني متكامل قبل الطلب وبعد التسليم',
              en: 'Pre-filing advisory and post-delivery compliance assistance'
            }
          ].map((item, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-[#F8F7F2] dark:bg-[#051724] border border-[#EAE6DC] dark:border-slate-800 flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-200 font-semibold"
            >
              <CheckCircle2 className="w-4 h-4 text-[#92743A] dark:text-[#D5B46B] shrink-0 mt-0.5" />
              <span>{isAr ? item.ar : item.en}</span>
            </div>
          ))}
        </div>
      </section>
    </GeneralPageTemplate>
  );
};
