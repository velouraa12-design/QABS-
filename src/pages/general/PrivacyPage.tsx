import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { AppLink } from '../../context/RouterContext.tsx';
import { GENERAL_PAGES } from '../../data/pages/index.ts';
import { GeneralPageTemplate } from '../../components/pages/GeneralPageTemplate.tsx';
import { Lock, ShieldCheck, Database, KeyRound } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  const { language } = useApp();
  const isAr = language === 'ar';
  const page = GENERAL_PAGES.privacy;

  const sections = [
    {
      icon: ShieldCheck,
      titleAr: '1. جمع ومعالجة بيانات التحقق والهوية (KYC)',
      titleEn: '1. Collection & Processing of KYC & Incorporation Data',
      bodyAr:
        'تجمع منصة قبس البيانات الضرورية حصراً لإتمام خدمات تأسيس الشركات واستخراج الأرقام الضريبية وفتح المتاجر، بما يشمل الاسم القانوني، بيانات الاتصال، وصورة جواز السفر عند التقديم الرسمي. لا يتم مشاركة هذه الوثائق مع أي طرف ثالث غير الجهات الحكومية المختصة (مثل أمين سر الولاية أو IRS أو Companies House) أو الوكيل المسجل المعتمد لتنفيذ طلبك.',
      bodyEn:
        'QABS collects only the information strictly required to file corporate formations, retrieve tax IDs, and provision stores—including legal names, contact details, and passport verification documents. KYC records are never sold and are shared solely with competent filing authorities (Secretary of State, IRS, Companies House) or authorized registered agents fulfilling your order.'
    },
    {
      icon: Database,
      titleAr: '2. العزل الصارم لبيانات المتاجر والمستأجرين (Multi-Tenant Isolation)',
      titleEn: '2. Strict Multi-Tenant Store Data Isolation',
      bodyAr:
        'تعتمد بنية متاجر قبس على عزل كامل للبيانات على مستوى معرف المتجر (storeId) بحيث تبقى منتجات كل تاجر وطلباته وعملاؤه وفواتيره وإعدادات نطاقه معزولة تماماً عن المتاجر الأخرى. لا يمتلك أي تاجر أو مستخدم صلاحية الوصول إلى بيانات مستأجر آخر.',
      bodyEn:
        'QABS Stores enforces strict tenant-level isolation keyed by storeId. Each merchant’s products, orders, customer directory, tax invoices, and custom domain records remain completely isolated from all other stores on the platform.'
    },
    {
      icon: KeyRound,
      titleAr: '3. أمن مفاتيح بوابات الدفع والمعاملات المالية',
      titleEn: '3. Payment Gateway Keys & Financial Security',
      bodyAr:
        'لا تخزّن منصة قبس أرقام البطاقات الائتمانية الكاملة للعملاء على خوادمها. تتم معالجة المدفوعات عبر مزودين معتمدين وفق معيار PCI-DSS مثل Stripe و PayPal و Moyasar و Tap. تُحفظ مفاتيح التكامل (Webhooks / OAuth tokens) بصلاحيات مقيدة وتخضع لمراجعة التفعيل.',
      bodyEn:
        'QABS never stores raw payment card numbers. Card and wallet transactions are processed directly by PCI-DSS compliant providers (Stripe, PayPal, Moyasar, Tap). Integration credentials and webhook secrets are scoped strictly to merchant workspaces.'
    },
    {
      icon: Lock,
      titleAr: '4. حقوق التصدير والتعديل والحذف والتخزين السحابي',
      titleEn: '4. Data Export, Correction & Deletion Rights',
      bodyAr:
        'يحق لكل عميل أو صاحب متجر طلب نسخة كاملة من ملفاته التجارية ونسخة احتياطية بصيغة JSON لبيانات متجره في أي وقت عبر مساحة العمل، كما يحق له طلب تصحيح بياناته أو إغلاق حسابه وحذف بياناته غير الخاضعة لالتزام الحفظ القانوني للجهات التنظيمية.',
      bodyEn:
        'Founders and merchants retain full ownership of their records and may export complete store backups or corporate filings at any time, request data corrections, or request account deletion subject to mandatory statutory retention laws.'
    }
  ];

  return (
    <GeneralPageTemplate
      page={page}
      schemaType="WebPage"
      headerAction={
        <AppLink
          to="/terms"
          className="px-5 py-3 rounded-xl border border-white/25 hover:border-[#D5B46B] text-white font-bold text-xs whitespace-nowrap"
        >
          {isAr ? 'الانتقال إلى الشروط والأحكام' : 'Read Terms of Service'}
        </AppLink>
      }
    >
      <div className="rounded-2xl bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div>
          <span className="text-slate-500">{isAr ? 'آخر تحديث للوثيقة:' : 'Last Updated:'}</span>{' '}
          <span className="font-mono font-bold text-[#14243E] dark:text-[#D5B46B]">2026-11-01</span>
        </div>
        <div>
          <span className="text-slate-500">{isAr ? 'مسؤول الخصوصية:' : 'Privacy Desk:'}</span>{' '}
          <a href="mailto:privacy@qabs1.store" dir="ltr" className="font-mono font-bold text-[#14243E] dark:text-white">
            privacy@qabs1.store
          </a>
        </div>
      </div>

      <section className="space-y-5">
        {sections.map(sec => {
          const Icon = sec.icon;
          return (
            <article
              key={sec.titleEn}
              className="rounded-2xl bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 p-6 sm:p-8 space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#14243E] text-[#D5B46B] flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-black text-[#14243E] dark:text-white">
                  {isAr ? sec.titleAr : sec.titleEn}
                </h2>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {isAr ? sec.bodyAr : sec.bodyEn}
              </p>
            </article>
          );
        })}
      </section>
    </GeneralPageTemplate>
  );
};
