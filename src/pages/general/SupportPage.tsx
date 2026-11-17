import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { AppLink } from '../../context/RouterContext.tsx';
import { GENERAL_PAGES } from '../../data/pages/index.ts';
import { GeneralPageTemplate } from '../../components/pages/GeneralPageTemplate.tsx';
import { SupportTicket } from '../../types/index.ts';
import {
  LifeBuoy,
  Clock,
  Mail,
  Phone,
  CheckCircle2,
  Send,
  FileText,
  CreditCard,
  ShieldCheck,
  Store
} from 'lucide-react';

export const SupportPage: React.FC = () => {
  const {
    language,
    sectionSettings,
    addTicket,
    submitServiceOrder,
    tickets,
    isAuthenticated,
    setMode,
    openClientAuth
  } = useApp();
  const isAr = language === 'ar';
  const page = GENERAL_PAGES.support;

  const [clientName, setClientName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<SupportTicket['category']>('formation');
  const [priority, setPriority] = useState<SupportTicket['priority']>('medium');
  const [subject, setSubject] = useState('');
  const [details, setDetails] = useState('');
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const supportPhone = sectionSettings.support.officialPhone || '+966 50 000 0000';
  const supportEmail = sectionSettings.support.officialEmail || 'support@qabs1.store';
  const workHours = isAr
    ? sectionSettings.support.workingHoursAr || 'الأحد – الخميس | 09:00 – 18:00 بتوقيت السعودية'
    : sectionSettings.support.workingHoursEn || 'Sunday – Thursday | 09:00 – 18:00 AST';

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!clientName.trim() || !email.trim() || !subject.trim() || !details.trim()) {
      setErrorMsg(
        isAr
          ? 'يرجى استكمال الاسم والبريد الإلكتروني وموضوع التذكرة والتفاصيل.'
          : 'Please complete your name, email, ticket subject, and details.'
      );
      return;
    }

    addTicket({
      clientName: clientName.trim(),
      subject: subject.trim(),
      subjectAr: subject.trim(),
      subjectEn: subject.trim(),
      category,
      priority,
      lastMessage: details.trim()
    });

    const saved = submitServiceOrder({
      serviceSlug: 'support',
      servicePath: '/support',
      serviceTitleAr: `تذكرة دعم فني: ${subject.trim()}`,
      serviceTitleEn: `Support Ticket: ${subject.trim()}`,
      priceUsd: 0,
      customerName: clientName.trim(),
      customerEmail: email.trim(),
      customerPhone: '-',
      customFields: { category, priority },
      notes: details.trim()
    });

    setSubmittedRef(saved.referenceCode);
    setClientName('');
    setEmail('');
    setSubject('');
    setDetails('');
  };

  const quickGuides = [
    {
      icon: FileText,
      titleAr: 'متابعة تأسيس الشركة والـ EIN',
      titleEn: 'Formation & IRS EIN Tracking',
      descAr: 'تحقق من المستندات المطلوبة والمدة الزمنية لإصدار ملف الولاية والرقم الضريبي.',
      descEn: 'Review KYC requirements and IRS CP575 turnaround timelines.',
      to: '/services/ein'
    },
    {
      icon: ShieldCheck,
      titleAr: 'التقارير السنوية وتجديد الوكيل',
      titleEn: 'Annual Reports & Renewals',
      descAr: 'جدد التقرير السنوي أو الوكيل المسجل لتفادي غرامات الولاية أو إيقاف الكيان.',
      descEn: 'File overdue annual reports or renew registered agent representation.',
      to: '/services/annual-report'
    },
    {
      icon: Store,
      titleAr: 'إعداد المتاجر والنطاقات',
      titleEn: 'Storefront & Custom Domains',
      descAr: 'أدلة تفعيل الدومين المخصص، ربط Shopify، وتحديث أقسام المتجر.',
      descEn: 'Guides for custom DNS setup, Shopify sync, and storefront publishing.',
      to: '/services/store-management'
    },
    {
      icon: CreditCard,
      titleAr: 'اعتماد بوابات الدفع والحسابات',
      titleEn: 'Payment Gateways & Banking',
      descAr: 'متطلبات الامتثال لتفعيل Stripe و PayPal و Tap و Moyasar وحساب Mercury.',
      descEn: 'Compliance checklists for Stripe, PayPal, Tap, Moyasar, and Mercury.',
      to: '/services/payment-gateways'
    }
  ];

  return (
    <GeneralPageTemplate
      page={page}
      schemaType="WebPage"
      headerAction={
        <button
          type="button"
          onClick={() => {
            if (isAuthenticated) {
              setMode('portal');
              window.location.hash = '#/support';
            } else {
              openClientAuth('login');
            }
          }}
          className="px-5 py-3 rounded-xl bg-[#D5B46B] hover:bg-[#c5a358] text-[#14243E] font-black text-xs cursor-pointer whitespace-nowrap"
        >
          {isAr ? 'فتح تذاكر مساحة العمل' : 'Open Workspace Ticket Desk'}
        </button>
      }
    >
      {/* Quick Guides */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickGuides.map(guide => {
          const Icon = guide.icon;
          return (
            <AppLink
              key={guide.to}
              to={guide.to}
              className="rounded-2xl bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 hover:border-[#D5B46B] p-5 space-y-3 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-[#14243E] text-[#D5B46B] flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-black text-[#14243E] dark:text-white">
                {isAr ? guide.titleAr : guide.titleEn}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {isAr ? guide.descAr : guide.descEn}
              </p>
            </AppLink>
          );
        })}
      </section>

      {/* Support Desk + SLA Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <aside className="lg:col-span-5 space-y-5">
          <div className="rounded-2xl bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center gap-2 text-[#14243E] dark:text-white font-black text-base">
              <LifeBuoy className="w-5 h-5 text-[#92743A] dark:text-[#D5B46B]" />
              <span>{isAr ? 'اتفاقية مستوى الخدمة (SLA)' : 'Support SLA & Channels'}</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#92743A] shrink-0 mt-0.5" />
                <div>
                  <div className="text-slate-500">{isAr ? 'ساعات الاستجابة المباشرة' : 'Live Desk Hours'}</div>
                  <div className="font-bold text-[#14243E] dark:text-white">{workHours}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#92743A] shrink-0 mt-0.5" />
                <div>
                  <div className="text-slate-500">{isAr ? 'بريد الدعم الرسمي' : 'Official Support Email'}</div>
                  <a href={`mailto:${supportEmail}`} dir="ltr" className="font-mono font-bold text-[#14243E] dark:text-white">
                    {supportEmail}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#92743A] shrink-0 mt-0.5" />
                <div>
                  <div className="text-slate-500">{isAr ? 'هاتف وواتساب الدعم' : 'Support Phone / WhatsApp'}</div>
                  <div dir="ltr" className="font-mono font-bold text-[#14243E] dark:text-white">
                    {supportPhone}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#F8F7F2] dark:bg-[#051724] border border-[#EAE6DC] dark:border-slate-800 space-y-1.5 text-xs">
              <div className="font-black text-[#14243E] dark:text-[#D5B46B]">
                {isAr ? 'زمن الرد المستهدف' : 'Target Response Window'}
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                {isAr
                  ? 'التذاكر العاجلة (توقف متجر أو بوابة دفع): خلال ساعتين. الاستفسارات التأسيسية والمحاسبية: خلال 12 ساعة عمل.'
                  : 'Urgent incidents (store/gateway downtime): within 2 hours. Incorporation & compliance requests: within 12 business hours.'}
              </p>
            </div>
          </div>

          {isAuthenticated && tickets.length > 0 && (
            <div className="rounded-2xl bg-[#14243E] text-white p-6 space-y-3">
              <div className="text-xs font-black text-[#D5B46B]">
                {isAr ? `تذاكرك النشطة (${tickets.length})` : `Your Active Tickets (${tickets.length})`}
              </div>
              <div className="space-y-2">
                {tickets.slice(0, 3).map(t => (
                  <div key={t.id} className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs flex justify-between gap-2">
                    <span className="font-bold truncate">{isAr ? t.subjectAr || t.subject : t.subjectEn || t.subject}</span>
                    <span className="font-mono text-[#D5B46B] shrink-0">{t.ticketNumber}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Ticket Form */}
        <div className="lg:col-span-7">
          {submittedRef ? (
            <div className="rounded-2xl bg-white dark:bg-[#071D2B] border border-[#D5B46B] p-8 space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <h3 className="text-lg font-black text-[#14243E] dark:text-white">
                    {isAr ? 'تم فتح تذكرة الدعم وحفظها بنجاح' : 'Support Ticket Created Successfully'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isAr ? `رقم المرجع: ${submittedRef}` : `Reference Code: ${submittedRef}`}
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {isAr
                  ? 'تم تسجيل التذكرة في مكتب الدعم الفني لقبس وسيتابع معك المختص عبر البريد الإلكتروني أو داخل مساحة العمل.'
                  : 'Your ticket has been logged with the QABS technical & corporate desk. Our team will follow up via email and inside your workspace.'}
              </p>
              <button
                type="button"
                onClick={() => setSubmittedRef(null)}
                className="px-4 py-2.5 rounded-xl bg-[#14243E] text-white text-xs font-bold cursor-pointer"
              >
                {isAr ? 'فتح تذكرة أخرى' : 'Submit Another Ticket'}
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmitTicket}
              className="rounded-2xl bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 p-6 sm:p-8 space-y-5"
            >
              <h2 className="text-xl font-black text-[#14243E] dark:text-white">
                {isAr ? 'فتح تذكرة دعم جديدة' : 'Open a New Support Ticket'}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5">
                    {isAr ? 'الاسم الكامل *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    className="w-full rounded-xl border border-[#EAE6DC] dark:border-slate-700 bg-[#F8F7F2] dark:bg-[#051724] px-3.5 py-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5">
                    {isAr ? 'البريد الإلكتروني *' : 'Email Address *'}
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-[#EAE6DC] dark:border-slate-700 bg-[#F8F7F2] dark:bg-[#051724] px-3.5 py-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5">
                    {isAr ? 'تصنيف التذكرة' : 'Ticket Category'}
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as SupportTicket['category'])}
                    className="w-full rounded-xl border border-[#EAE6DC] dark:border-slate-700 bg-[#F8F7F2] dark:bg-[#051724] px-3.5 py-2.5 text-xs"
                  >
                    <option value="formation">{isAr ? 'تأسيس الشركات و EIN' : 'Company Formation & EIN'}</option>
                    <option value="compliance">{isAr ? 'الامتثال والتقارير السنوية' : 'Compliance & Annual Reports'}</option>
                    <option value="store">{isAr ? 'إدارة المتاجر والنطاقات' : 'Store & Domain Support'}</option>
                    <option value="payments">{isAr ? 'بوابات الدفع والبنوك' : 'Payment Gateways & Banking'}</option>
                    <option value="billing">{isAr ? 'الفواتير والاشتراكات' : 'Billing & Subscriptions'}</option>
                    <option value="technical">{isAr ? 'الدعم التقني والمنصة' : 'Technical Support'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5">
                    {isAr ? 'درجة الأولوية' : 'Priority Level'}
                  </label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as SupportTicket['priority'])}
                    className="w-full rounded-xl border border-[#EAE6DC] dark:border-slate-700 bg-[#F8F7F2] dark:bg-[#051724] px-3.5 py-2.5 text-xs"
                  >
                    <option value="low">{isAr ? 'منخفضة' : 'Low'}</option>
                    <option value="medium">{isAr ? 'متوسطة' : 'Medium'}</option>
                    <option value="high">{isAr ? 'عالية' : 'High'}</option>
                    <option value="urgent">{isAr ? 'عاجلة' : 'Urgent'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5">
                  {isAr ? 'عنوان المشكلة أو الطلب *' : 'Subject *'}
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder={
                    isAr
                      ? 'مثال: ربط سجل DNS لنطاق متجر أو استعلام عن رقم CP575'
                      : 'e.g. Custom domain DNS record or IRS CP575 status check'
                  }
                  className="w-full rounded-xl border border-[#EAE6DC] dark:border-slate-700 bg-[#F8F7F2] dark:bg-[#051724] px-3.5 py-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5">
                  {isAr ? 'تفاصيل التذكرة *' : 'Detailed Description *'}
                </label>
                <textarea
                  rows={4}
                  required
                  value={details}
                  onChange={e => setDetails(e.target.value)}
                  placeholder={
                    isAr
                      ? 'أدخل رقم الشركة أو المتجر والوصف الدقيق للمساعدة في الحل السريع...'
                      : 'Include your company/store name and details for rapid resolution...'
                  }
                  className="w-full rounded-xl border border-[#EAE6DC] dark:border-slate-700 bg-[#F8F7F2] dark:bg-[#051724] px-3.5 py-2.5 text-xs"
                />
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-[#14243E] hover:bg-[#1d3559] text-white font-black text-xs flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4 text-[#D5B46B]" />
                <span>{isAr ? 'إرسال تذكرة الدعم' : 'Submit Support Ticket'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </GeneralPageTemplate>
  );
};
