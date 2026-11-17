import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { useCustomizer } from '../../context/CustomizerContext.tsx';
import { AppLink } from '../../context/RouterContext.tsx';
import { GENERAL_PAGES } from '../../data/pages/index.ts';
import { GeneralPageTemplate } from '../../components/pages/GeneralPageTemplate.tsx';
import { Mail, Phone, Clock, Send, CheckCircle2, MessageSquare } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { language, submitServiceOrder, sectionSettings } = useApp();
  const { siteContent } = useCustomizer();
  const isAr = language === 'ar';
  const page = GENERAL_PAGES.contact;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [topic, setTopic] = useState('formation');
  const [message, setMessage] = useState('');
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const supportPhone = sectionSettings.support.officialPhone || siteContent.whatsappNumber;
  const supportEmail = sectionSettings.support.officialEmail || 'support@qabs1.store';
  const workHours = isAr
    ? sectionSettings.support.workingHoursAr || 'الأحد – الخميس | 09:00 – 18:00 بتوقيت السعودية'
    : sectionSettings.support.workingHoursEn || 'Sunday – Thursday | 09:00 – 18:00 AST';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMsg(
        isAr
          ? 'يرجى كتابة الاسم والبريد الإلكتروني وتفاصيل الرسالة.'
          : 'Please enter your name, email, and message details.'
      );
      return;
    }

    const saved = submitServiceOrder({
      serviceSlug: 'consulting',
      servicePath: '/contact',
      serviceTitleAr: 'استفسار أو طلب تواصل — صفحة اتصل بنا',
      serviceTitleEn: 'Direct Contact Inquiry',
      priceUsd: 0,
      customerName: name.trim(),
      customerEmail: email.trim(),
      customerPhone: phone.trim() || '-',
      customFields: { topic },
      notes: message.trim()
    });

    setSubmittedRef(saved.referenceCode);
    setName('');
    setEmail('');
    setPhone('');
    setMessage('');
  };

  return (
    <GeneralPageTemplate page={page} schemaType="ContactPage">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Direct Channels */}
        <aside className="lg:col-span-5 space-y-5">
          <div className="rounded-2xl bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 p-6 space-y-5">
            <h2 className="text-lg font-black text-[#14243E] dark:text-white">
              {isAr ? 'قنوات التواصل الرسمية' : 'Official Contact Channels'}
            </h2>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#92743A] dark:text-[#D5B46B] shrink-0 mt-0.5" />
                <div>
                  <div className="text-slate-500">{isAr ? 'البريد الإلكتروني الرسمي' : 'Official Email'}</div>
                  <a
                    href={`mailto:${supportEmail}`}
                    dir="ltr"
                    className="font-mono font-bold text-[#14243E] dark:text-white hover:text-[#92743A]"
                  >
                    {supportEmail}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#92743A] dark:text-[#D5B46B] shrink-0 mt-0.5" />
                <div>
                  <div className="text-slate-500">{isAr ? 'واتساب الأعمال المباشر' : 'Direct Business WhatsApp'}</div>
                  <a
                    href={`https://wa.me/${supportPhone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    dir="ltr"
                    className="font-mono font-bold text-[#14243E] dark:text-white hover:text-[#92743A]"
                  >
                    {supportPhone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#92743A] dark:text-[#D5B46B] shrink-0 mt-0.5" />
                <div>
                  <div className="text-slate-500">{isAr ? 'ساعات عمل الاستشارات' : 'Advisory Hours'}</div>
                  <div className="font-bold text-[#14243E] dark:text-white">{workHours}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-[#14243E] text-white p-6 space-y-3">
            <div className="flex items-center gap-2 text-[#D5B46B] font-black text-sm">
              <MessageSquare className="w-4 h-4" />
              <span>{isAr ? 'هل تحتاج لتقديم طلب خدمة مباشرة؟' : 'Need a Specific Service Order?'}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {isAr
                ? 'يمكنك الانتقال مباشرة إلى صفحة الطلب المخصصة لحفظ نوع الخدمة والباقة واستخراج الرقم المرجعي فوراً.'
                : 'Use our dedicated order workflow to pick a service package and get an instant reference code.'}
            </p>
            <AppLink
              to="/order/company-formation"
              className="inline-block px-4 py-2.5 rounded-xl bg-[#D5B46B] text-[#14243E] font-black text-xs"
            >
              {isAr ? 'الانتقال لصفحة الطلبات' : 'Go to Order Page'}
            </AppLink>
          </div>
        </aside>

        {/* Contact Form */}
        <div className="lg:col-span-7">
          {submittedRef ? (
            <div className="rounded-2xl bg-white dark:bg-[#071D2B] border border-[#D5B46B] p-8 space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <h3 className="text-lg font-black text-[#14243E] dark:text-white">
                    {isAr ? 'تم استلام رسالتك بنجاح' : 'Inquiry Received Successfully'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isAr ? `الرقم المرجعي للمتابعة: ${submittedRef}` : `Tracking Reference: ${submittedRef}`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSubmittedRef(null)}
                className="px-4 py-2.5 rounded-xl bg-[#14243E] text-white text-xs font-bold cursor-pointer"
              >
                {isAr ? 'إرسال استفسار آخر' : 'Send Another Inquiry'}
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 p-6 sm:p-8 space-y-5"
            >
              <h2 className="text-xl font-black text-[#14243E] dark:text-white">
                {isAr ? 'أرسل رسالة إلى فريق قبس' : 'Send a Message to QABS Advisory'}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5">
                    {isAr ? 'الاسم الكامل *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
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
                    {isAr ? 'رقم الجوال / واتساب' : 'Phone / WhatsApp'}
                  </label>
                  <input
                    type="tel"
                    dir="ltr"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+966 5X XXX XXXX"
                    className="w-full rounded-xl border border-[#EAE6DC] dark:border-slate-700 bg-[#F8F7F2] dark:bg-[#051724] px-3.5 py-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5">
                    {isAr ? 'موضوع التواصل' : 'Inquiry Topic'}
                  </label>
                  <select
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    className="w-full rounded-xl border border-[#EAE6DC] dark:border-slate-700 bg-[#F8F7F2] dark:bg-[#051724] px-3.5 py-2.5 text-xs"
                  >
                    <option value="formation">{isAr ? 'تأسيس الشركات والـ EIN' : 'Company Formation & EIN'}</option>
                    <option value="compliance">{isAr ? 'الامتثال والتجديد السنوي' : 'Compliance & Renewals'}</option>
                    <option value="stores">{isAr ? 'إنشاء وإدارة المتاجر' : 'E-Commerce Stores'}</option>
                    <option value="payments">{isAr ? 'بوابات الدفع والحسابات البنكية' : 'Payments & Business Banking'}</option>
                    <option value="digital">{isAr ? 'الهوية والبرمجة والذكاء الاصطناعي' : 'Digital & AI Solutions'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5">
                  {isAr ? 'تفاصيل الاستفسار *' : 'Message Details *'}
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder={
                    isAr ? 'اكتب تفاصيل مشروعك أو استفسارك هنا...' : 'Describe your question or project scope...'
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
                <span>{isAr ? 'إرسال الرسالة' : 'Send Message'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </GeneralPageTemplate>
  );
};
