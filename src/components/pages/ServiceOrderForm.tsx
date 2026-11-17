import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { AppLink } from '../../context/RouterContext.tsx';
import { ServicePageData, SubmittedServiceOrder } from '../../types/pages.ts';
import {
  CheckCircle2,
  Send,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CreditCard
} from 'lucide-react';

interface ServiceOrderFormProps {
  service: ServicePageData;
  selectedPackageId?: string;
  onPackageChange?: (pkgId: string) => void;
  variant?: 'inline' | 'dedicated';
}

export const ServiceOrderForm: React.FC<ServiceOrderFormProps> = ({
  service,
  selectedPackageId,
  onPackageChange,
  variant = 'inline'
}) => {
  const {
    language,
    user,
    isAuthenticated,
    submitServiceOrder,
    requestServiceAction
  } = useApp();
  const isAr = language === 'ar';

  const defaultPkg =
    service.packages.find(p => p.id === selectedPackageId) ||
    service.packages.find(p => p.recommended) ||
    service.packages[0];

  const [pkgId, setPkgId] = useState<string>(defaultPkg?.id || '');
  const [customerName, setCustomerName] = useState<string>(
    isAuthenticated && user.id !== 'guest' ? user.name : ''
  );
  const [customerEmail, setCustomerEmail] = useState<string>(
    isAuthenticated && user.id !== 'guest' ? user.email : ''
  );
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [companyOrStoreName, setCompanyOrStoreName] = useState<string>(
    isAuthenticated && user.companyName ? user.companyName : ''
  );
  const [customFields, setCustomFields] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const f of service.formFields) {
      if (f.type === 'select' && f.options?.length) {
        init[f.name] = f.options[0].value;
      } else {
        init[f.name] = '';
      }
    }
    return init;
  });
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedOrder, setSubmittedOrder] = useState<SubmittedServiceOrder | null>(null);

  useEffect(() => {
    if (selectedPackageId) {
      setPkgId(selectedPackageId);
    }
  }, [selectedPackageId]);

  useEffect(() => {
    setSubmittedOrder(null);
    setErrorMsg(null);
    const nextPkg =
      service.packages.find(p => p.id === selectedPackageId) ||
      service.packages.find(p => p.recommended) ||
      service.packages[0];
    setPkgId(nextPkg?.id || '');

    const init: Record<string, string> = {};
    for (const f of service.formFields) {
      init[f.name] = f.type === 'select' && f.options?.length ? f.options[0].value : '';
    }
    setCustomFields(init);
  }, [service.slug]);

  const activePkg = service.packages.find(p => p.id === pkgId) || service.packages[0];
  const priceUsd = activePkg ? activePkg.priceUsd : service.startingPriceUsd;
  const sarEstimate = Math.round(priceUsd * 3.75);

  const handleSelectPackage = (id: string) => {
    setPkgId(id);
    if (onPackageChange) onPackageChange(id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
      setErrorMsg(
        isAr
          ? 'يرجى تعبئة الاسم الكامل والبريد الإلكتروني ورقم الجوال.'
          : 'Please complete your full name, email address, and phone number.'
      );
      return;
    }

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim());
    if (!emailValid) {
      setErrorMsg(
        isAr ? 'يرجى إدخال بريد إلكتروني صحيح.' : 'Please enter a valid email address.'
      );
      return;
    }

    for (const field of service.formFields) {
      if (field.required && !(customFields[field.name] || '').trim()) {
        setErrorMsg(
          isAr
            ? `الحقل "${field.labelAr}" مطلوب لإتمام الطلب.`
            : `"${field.labelEn}" is required to submit your request.`
        );
        return;
      }
    }

    const created = submitServiceOrder({
      serviceSlug: service.slug,
      servicePath: service.path,
      serviceTitleAr: service.titleAr,
      serviceTitleEn: service.titleEn,
      packageId: activePkg?.id,
      packageNameAr: activePkg?.nameAr,
      packageNameEn: activePkg?.nameEn,
      priceUsd,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      customerPhone: customerPhone.trim(),
      companyOrStoreName: companyOrStoreName.trim() || undefined,
      customFields,
      notes: notes.trim() || undefined
    });

    setSubmittedOrder(created);
  };

  const handleProceedCheckout = () => {
    const mappedType: 'company_formation' | 'store_package' | 'ai_credits' =
      service.category === 'stores'
        ? 'store_package'
        : service.slug === 'ai-solutions'
        ? 'ai_credits'
        : 'company_formation';

    requestServiceAction({
      id: `svc_${service.slug}_${Date.now()}`,
      serviceType: mappedType,
      titleAr: activePkg ? `${service.titleAr} — ${activePkg.nameAr}` : service.titleAr,
      titleEn: activePkg ? `${service.titleEn} — ${activePkg.nameEn}` : service.titleEn,
      subtitleAr: submittedOrder
        ? `رقم الطلب المرجعي: ${submittedOrder.referenceCode}`
        : service.subtitleAr,
      subtitleEn: submittedOrder
        ? `Order Ref: ${submittedOrder.referenceCode}`
        : service.subtitleEn,
      priceUsd,
      details: {
        companyName: companyOrStoreName.trim() || undefined,
        storeName: companyOrStoreName.trim() || undefined,
        jurisdiction: 'US_WYOMING',
        entityType: 'LLC',
        planId: 'growth',
        billingCycle: 'monthly',
        creditsAmount: service.slug === 'ai-solutions' ? 1500 : undefined
      }
    });
  };

  if (submittedOrder) {
    return (
      <div className="rounded-2xl bg-white dark:bg-[#071D2B] border border-[#D5B46B] p-6 sm:p-8 space-y-5 shadow-sm">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-lg font-black text-[#14243E] dark:text-white">
              {isAr ? 'تم استلام وحفظ طلب الخدمة بنجاح' : 'Service Request Saved Successfully'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              {isAr
                ? 'تم تسجيل نوع الخدمة وكافة البيانات المطلوبة في نظام قبس، وسيتابع معك المستشار المختص.'
                : 'Your service type and submitted details have been recorded in QABS and queued for specialist review.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-[#F8F7F2] dark:bg-[#051724] border border-[#EAE6DC] dark:border-slate-800 text-xs">
          <div>
            <span className="text-slate-500 block">{isAr ? 'الرقم المرجعي' : 'Reference Code'}</span>
            <span className="font-mono font-black text-[#14243E] dark:text-[#D5B46B] tabular-nums">
              {submittedOrder.referenceCode}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">{isAr ? 'الخدمة المختارة' : 'Selected Service'}</span>
            <span className="font-bold text-[#14243E] dark:text-white">
              {isAr ? submittedOrder.serviceTitleAr : submittedOrder.serviceTitleEn}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">{isAr ? 'الباقة' : 'Package'}</span>
            <span className="font-bold text-[#14243E] dark:text-white">
              {isAr ? submittedOrder.packageNameAr || 'قياسية' : submittedOrder.packageNameEn || 'Standard'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">{isAr ? 'التكلفة المعتمدة' : 'Approved Fee'}</span>
            <span className="font-mono font-black text-[#92743A] dark:text-[#D5B46B] tabular-nums">
              ${submittedOrder.priceUsd.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleProceedCheckout}
            className="px-5 py-3 rounded-xl bg-[#14243E] hover:bg-[#1d3559] text-white font-black text-xs flex items-center gap-2 cursor-pointer transition-colors"
          >
            <CreditCard className="w-4 h-4 text-[#D5B46B]" />
            <span>
              {isAr
                ? `متابعة الدفع وحفظه في مساحة العمل ($${priceUsd})`
                : `Proceed to Checkout & Save to Workspace ($${priceUsd})`}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSubmittedOrder(null)}
            className="px-4 py-3 rounded-xl border border-[#EAE6DC] dark:border-slate-700 text-[#14243E] dark:text-slate-200 hover:bg-[#F8F7F2] dark:hover:bg-slate-800 font-bold text-xs cursor-pointer"
          >
            {isAr ? 'إرسال طلب جديد' : 'Submit Another Request'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE6DC] dark:border-slate-800 pb-5">
        <div>
          <h3 className="text-xl font-black text-[#14243E] dark:text-white">
            {isAr ? `نموذج طلب خدمة: ${service.titleAr}` : `Order Form: ${service.titleEn}`}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isAr
              ? 'يُحفظ نوع الخدمة وبياناتك تلقائياً لبدء التنفيذ الفوري.'
              : 'Your selected service type and details are saved automatically for immediate execution.'}
          </p>
        </div>

        <div className="px-4 py-2.5 rounded-xl bg-[#14243E] text-white shrink-0">
          <div className="text-[11px] text-[#D5B46B] font-bold">
            {isAr ? 'التكلفة المعتمدة' : 'Selected Package Fee'}
          </div>
          <div className="text-lg font-black font-mono tabular-nums">
            ${priceUsd.toLocaleString()}{' '}
            <span className="text-xs font-normal text-slate-300">
              / ~{sarEstimate.toLocaleString()} {isAr ? 'ر.س' : 'SAR'}
            </span>
          </div>
        </div>
      </div>

      {/* Package Selector inside form */}
      {service.packages.length > 0 && (
        <div className="space-y-2.5">
          <label className="block text-xs font-black text-[#14243E] dark:text-slate-200">
            {isAr ? 'الباقة المختارة' : 'Selected Package'}
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {service.packages.map(pkg => {
              const active = activePkg?.id === pkg.id;
              return (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => handleSelectPackage(pkg.id)}
                  className={`p-3.5 rounded-xl border text-start transition-colors cursor-pointer ${
                    active
                      ? 'border-[#14243E] dark:border-[#D5B46B] bg-[#F8F7F2] dark:bg-[#051724] ring-1 ring-[#D5B46B]'
                      : 'border-[#EAE6DC] dark:border-slate-800 hover:border-[#D5B46B]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-[#14243E] dark:text-white">
                      {isAr ? pkg.nameAr : pkg.nameEn}
                    </span>
                    <span className="text-xs font-mono font-black text-[#92743A] dark:text-[#D5B46B] tabular-nums">
                      ${pkg.priceUsd}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {isAr ? pkg.billingNoteAr : pkg.billingNoteEn}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Core Applicant Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-[#14243E] dark:text-slate-200 mb-1.5">
            {isAr ? 'الاسم الكامل *' : 'Full Name *'}
          </label>
          <input
            type="text"
            required
            value={customerName}
            onChange={e => setCustomerName(e.target.value)}
            placeholder={isAr ? 'الاسم الثلاثي أو الكامل' : 'Your full legal name'}
            className="w-full rounded-xl border border-[#EAE6DC] dark:border-slate-700 bg-[#F8F7F2] dark:bg-[#051724] px-3.5 py-2.5 text-xs text-[#14243E] dark:text-white focus:outline-none focus:border-[#D5B46B]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#14243E] dark:text-slate-200 mb-1.5">
            {isAr ? 'البريد الإلكتروني *' : 'Email Address *'}
          </label>
          <input
            type="email"
            required
            value={customerEmail}
            onChange={e => setCustomerEmail(e.target.value)}
            placeholder="name@company.com"
            className="w-full rounded-xl border border-[#EAE6DC] dark:border-slate-700 bg-[#F8F7F2] dark:bg-[#051724] px-3.5 py-2.5 text-xs text-[#14243E] dark:text-white focus:outline-none focus:border-[#D5B46B]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#14243E] dark:text-slate-200 mb-1.5">
            {isAr ? 'رقم الجوال / واتساب *' : 'Phone / WhatsApp Number *'}
          </label>
          <input
            type="tel"
            required
            dir="ltr"
            value={customerPhone}
            onChange={e => setCustomerPhone(e.target.value)}
            placeholder="+966 5X XXX XXXX"
            className="w-full rounded-xl border border-[#EAE6DC] dark:border-slate-700 bg-[#F8F7F2] dark:bg-[#051724] px-3.5 py-2.5 text-xs text-[#14243E] dark:text-white focus:outline-none focus:border-[#D5B46B]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#14243E] dark:text-slate-200 mb-1.5">
            {isAr ? 'اسم الشركة أو المتجر (إن وجد)' : 'Company or Store Name (Optional)'}
          </label>
          <input
            type="text"
            value={companyOrStoreName}
            onChange={e => setCompanyOrStoreName(e.target.value)}
            placeholder={isAr ? 'مثال: Qabs Ventures LLC' : 'e.g. Qabs Ventures LLC'}
            className="w-full rounded-xl border border-[#EAE6DC] dark:border-slate-700 bg-[#F8F7F2] dark:bg-[#051724] px-3.5 py-2.5 text-xs text-[#14243E] dark:text-white focus:outline-none focus:border-[#D5B46B]"
          />
        </div>
      </div>

      {/* Service-Specific Custom Fields */}
      {service.formFields.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#EAE6DC] dark:border-slate-800">
          {service.formFields.map(field => (
            <div
              key={field.name}
              className={field.type === 'textarea' ? 'sm:col-span-2' : ''}
            >
              <label className="block text-xs font-bold text-[#14243E] dark:text-slate-200 mb-1.5">
                {isAr ? field.labelAr : field.labelEn}
                {field.required ? ' *' : ''}
              </label>

              {field.type === 'select' && field.options ? (
                <select
                  value={customFields[field.name] || ''}
                  onChange={e =>
                    setCustomFields(prev => ({ ...prev, [field.name]: e.target.value }))
                  }
                  className="w-full rounded-xl border border-[#EAE6DC] dark:border-slate-700 bg-[#F8F7F2] dark:bg-[#051724] px-3.5 py-2.5 text-xs text-[#14243E] dark:text-white focus:outline-none focus:border-[#D5B46B]"
                >
                  {field.options.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {isAr ? opt.labelAr : opt.labelEn}
                    </option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  rows={3}
                  required={field.required}
                  value={customFields[field.name] || ''}
                  onChange={e =>
                    setCustomFields(prev => ({ ...prev, [field.name]: e.target.value }))
                  }
                  placeholder={isAr ? field.placeholderAr : field.placeholderEn}
                  className="w-full rounded-xl border border-[#EAE6DC] dark:border-slate-700 bg-[#F8F7F2] dark:bg-[#051724] px-3.5 py-2.5 text-xs text-[#14243E] dark:text-white focus:outline-none focus:border-[#D5B46B]"
                />
              ) : (
                <input
                  type={field.type}
                  required={field.required}
                  value={customFields[field.name] || ''}
                  onChange={e =>
                    setCustomFields(prev => ({ ...prev, [field.name]: e.target.value }))
                  }
                  placeholder={isAr ? field.placeholderAr : field.placeholderEn}
                  className="w-full rounded-xl border border-[#EAE6DC] dark:border-slate-700 bg-[#F8F7F2] dark:bg-[#051724] px-3.5 py-2.5 text-xs text-[#14243E] dark:text-white focus:outline-none focus:border-[#D5B46B]"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Additional Notes */}
      <div>
        <label className="block text-xs font-bold text-[#14243E] dark:text-slate-200 mb-1.5">
          {isAr ? 'ملاحظات إضافية للفريق المختص (اختياري)' : 'Additional Notes (Optional)'}
        </label>
        <textarea
          rows={2}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder={
            isAr
              ? 'أي تفاصيل إضافية أو متطلبات خاصة بالجدول الزمني...'
              : 'Any extra context or timeline requirements...'
          }
          className="w-full rounded-xl border border-[#EAE6DC] dark:border-slate-700 bg-[#F8F7F2] dark:bg-[#051724] px-3.5 py-2.5 text-xs text-[#14243E] dark:text-white focus:outline-none focus:border-[#D5B46B]"
        />
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold">
          {errorMsg}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <ShieldCheck className="w-4 h-4 text-[#92743A] shrink-0" />
          <span>
            {isAr
              ? 'تُحفظ بياناتك بسرية تامة مع رقم مرجعي فوري'
              : 'Your data is stored securely with an instant tracking reference'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {variant === 'inline' && (
            <AppLink
              to={`/order/${service.slug}${activePkg ? `?pkg=${activePkg.id}` : ''}`}
              className="px-4 py-3 rounded-xl border border-[#D5B46B] text-[#14243E] dark:text-[#D5B46B] hover:bg-[#F8F7F2] dark:hover:bg-slate-800 font-bold text-xs flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <span>{isAr ? 'فتح صفحة الطلب المستقلة' : 'Open Dedicated Order Page'}</span>
              {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </AppLink>
          )}

          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-[#14243E] hover:bg-[#1d3559] text-white font-black text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-colors shadow-sm whitespace-nowrap shrink-0"
          >
            <Send className="w-4 h-4 text-[#D5B46B]" />
            <span>
              {isAr
                ? `إرسال طلب ${service.titleAr.split('(')[0].trim()}`
                : `Submit Service Request ($${priceUsd})`}
            </span>
          </button>
        </div>
      </div>
    </form>
  );
};
