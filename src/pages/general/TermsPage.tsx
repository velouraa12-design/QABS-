import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { AppLink } from '../../context/RouterContext.tsx';
import { GENERAL_PAGES } from '../../data/pages/index.ts';
import { GeneralPageTemplate } from '../../components/pages/GeneralPageTemplate.tsx';
import { Scale, Landmark, FileCheck2, RefreshCw, Copyright } from 'lucide-react';

export const TermsPage: React.FC = () => {
  const { language } = useApp();
  const isAr = language === 'ar';
  const page = GENERAL_PAGES.terms;

  const clauses = [
    {
      icon: Scale,
      titleAr: '1. نطاق الخدمات وطبيعة التمثيل',
      titleEn: '1. Scope of Services & Non-Legal Advice Notice',
      bodyAr:
        'توفر منصة قبس الرقمية خدمات تجهيز وإيداع ملفات تأسيس الشركات، وتنسيق الوكيل المسجل، واستخراج الرقم الضريبي EIN، وبناء واستضافة المتاجر الإلكترونية والخدمات الرقمية. لا تُعد معلومات المنصة بديلاً عن الاستشارة القانونية أو المحاسبية المخصصة من محامٍ مرخص أو محاسب قانوني معتمد (CPA) في حالة النزاعات الضريبية أو القضائية.',
      bodyEn:
        'QABS Digital Platform provides administrative company formation filings, registered agent coordination, IRS EIN submissions, isolated e-commerce infrastructure, and digital services. Platform content does not constitute formal legal or tax representation by a licensed attorney or CPA.'
    },
    {
      icon: Landmark,
      titleAr: '2. الرسوم الحكومية وسياسة الاسترداد',
      titleEn: '2. Statutory State Fees & Refund Governance',
      bodyAr:
        'الرسوم الحكومية المدفوعة لأمين سر الولاية الأمريكية أو هيئة Companies House البريطانية غير قابلة للاسترداد بمجرد تقديم الطلب رسمياً إلى الجهة الحكومية. بالنسبة لأتعاب خدمات قبس، يمكن طلب استرداد كامل إذا لم تبدأ مرحلة الإيداع الرسمي أو التنفيذ الفعلي للخدمة.',
      bodyEn:
        'Statutory filing fees remitted to any US Secretary of State or UK Companies House are strictly non-refundable once submitted. QABS service fees are eligible for refund only prior to formal submission or production kickoff.'
    },
    {
      icon: FileCheck2,
      titleAr: '3. الحسابات البنكية وبوابات الدفع الخارجية',
      titleEn: '3. Third-Party Banking & Payment Gateway Underwriting',
      bodyAr:
        'تلتزم قبس بتجهيز الملف المؤسسي والمستندات الفنية والامتثال وفق متطلبات البنوك الرقمية (Mercury / Wise / Relay) وبوابات الدفع (Stripe / PayPal / Tap / Moyasar). يظل القرار النهائي للقبول أو المراجعة خاضعاً لسياسات الامتثال والمخاطر الخاصة بالمزود الخارجي وطبيعة نشاط التاجر.',
      bodyEn:
        'QABS prepares complete corporate documentation and storefront compliance packages for banking partners (Mercury, Wise, Relay) and payment processors (Stripe, PayPal, Tap, Moyasar). Final underwriting and approval remain subject to each external provider’s risk and compliance policies.'
    },
    {
      icon: RefreshCw,
      titleAr: '4. التجديد السنوي ومسؤولية العميل عن الامتثال',
      titleEn: '4. Annual Renewals & Ongoing Compliance Responsibility',
      bodyAr:
        'تُقدَّم خدمة الوكيل المسجل على أساس اشتراك سنوي ويتم إشعار العميل قبل موعد التقرير السنوي أو تجديد الوكيل بمدة لا تقل عن 30 يوماً. يتعهد العميل بسداد رسوم التجديد في موعدها لتجنب أي غرامات ولاية أو تعليق إداري للكيان.',
      bodyEn:
        'Registered agent services operate on an annual term, with renewal reminders dispatched at least 30 days ahead of statutory deadlines. Clients remain responsible for timely settlement of annual state report fees and renewal invoices to preserve Good Standing.'
    },
    {
      icon: Copyright,
      titleAr: '5. حقوق الملكية الفكرية والتشغيل التجاري',
      titleEn: '5. Intellectual Property & Merchant Ownership',
      bodyAr:
        'يحتفظ العميل بالملكية الكاملة لشركته المؤسسة، وعلامته التجارية، والشعارات المصممة له بعد السداد الكامل، وبيانات متجره ومنتجاته. وتحتفظ قبس بحقوق الملكية الفكرية للبرمجيات الأساسية لمنصة قبس وقوالب النظام التحتية.',
      bodyEn:
        'Upon full settlement, clients hold 100% ownership over their incorporated entity, custom brand identity assets, domain names, and store catalog data. QABS retains intellectual property rights to the underlying SaaS platform engine and proprietary templates.'
    }
  ];

  return (
    <GeneralPageTemplate
      page={page}
      schemaType="WebPage"
      headerAction={
        <AppLink
          to="/privacy"
          className="px-5 py-3 rounded-xl border border-white/25 hover:border-[#D5B46B] text-white font-bold text-xs whitespace-nowrap"
        >
          {isAr ? 'الاطلاع على سياسة الخصوصية' : 'Read Privacy Policy'}
        </AppLink>
      }
    >
      <div className="rounded-2xl bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div>
          <span className="text-slate-500">{isAr ? 'تاريخ السريان:' : 'Effective Date:'}</span>{' '}
          <span className="font-mono font-bold text-[#14243E] dark:text-[#D5B46B]">2026-11-01</span>
        </div>
        <div>
          <span className="text-slate-500">{isAr ? 'استفسارات الشؤون القانونية:' : 'Legal Notice Email:'}</span>{' '}
          <a href="mailto:legal@qabs1.store" dir="ltr" className="font-mono font-bold text-[#14243E] dark:text-white">
            legal@qabs1.store
          </a>
        </div>
      </div>

      <section className="space-y-5">
        {clauses.map(clause => {
          const Icon = clause.icon;
          return (
            <article
              key={clause.titleEn}
              className="rounded-2xl bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 p-6 sm:p-8 space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#14243E] text-[#D5B46B] flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-black text-[#14243E] dark:text-white">
                  {isAr ? clause.titleAr : clause.titleEn}
                </h2>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {isAr ? clause.bodyAr : clause.bodyEn}
              </p>
            </article>
          );
        })}
      </section>
    </GeneralPageTemplate>
  );
};
