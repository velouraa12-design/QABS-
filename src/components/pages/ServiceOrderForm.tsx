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
  CreditCard,
  Upload,
  FileText,
  Save
} from 'lucide-react';

interface ServiceOrderFormProps {
  service: ServicePageData;
  selectedPackageId?: string;
  onPackageChange?: (pkgId: string) => void;
  variant?: 'inline' | 'dedicated';
}

const ALLOWED_MIME_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

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
    backendStatus,
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
      init[f.name] = f.type === 'select' && f.options?.length ? f.options[0].value : '';
    }
    return init;
  });
  const [notes, setNotes] = useState<string>('');
  const [uploadedDoc, setUploadedDoc] = useState<{
    name: string;
    mimeType: string;
    base64: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedOrder, setSubmittedOrder] = useState<SubmittedServiceOrder | null>(null);

  useEffect(() => {
    if (selectedPackageId) setPkgId(selectedPackageId);
  }, [selectedPackageId]);

  useEffect(() => {
    setSubmittedOrder(null);
    setErrorMsg(null);
    setUploadedDoc(null);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) {
      setUploadedDoc(null);
      return;
    }
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setErrorMsg(
        isAr
          ? 'نوع الملف غير مسموح. الصيغ المقبولة: PDF, PNG, JPG, WEBP فقط.'
          : 'Unsupported file type. Allowed: PDF, PNG, JPG, WEBP.'
      );
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setErrorMsg(
        isAr ? 'حجم الملف يتجاوز الحد الأقصى المسموح (5 ميجابايت).' : 'File exceeds 5 MB maximum upload size.'
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const res = typeof reader.result === 'string' ? reader.result : '';
      const base64 = res.includes(',') ? res.split(',')[1] : res;
      setUploadedDoc({
        name: file.name,
        mimeType: file.type,
        base64
      });
    };
    reader.readAsDataURL(file);
  };

  const submitWithStatus = async (status: 'draft' | 'new') => {
    setErrorMsg(null);
    if (backendStatus !== 'connected') {
      setErrorMsg(isAr
        ? 'المعاينة غير متصلة بخدمة الطلبات؛ يمكنك مراجعة النموذج فقط ولم يتم حفظ أي طلب.'
        : 'The preview is not connected to the request service; you can review the form, but no request can be saved.');
      return;
    }

    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
      setErrorMsg(
        isAr
          ? 'يرجى تعبئة الاسم الكامل والبريد الإلكتروني ورقم الجوال.'
          : 'Please complete your full name, email address, and phone number.'
      );
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) {
      setErrorMsg(isAr ? 'يرجى إدخال بريد إلكتروني صحيح.' : 'Please enter a valid email address.');
      return;
    }

    if (status === 'new') {
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
    }

    setSubmitting(true);
    try {
      const created = await submitServiceOrder({
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
        notes: notes.trim() || undefined,
        status,
        document: uploadedDoc
          ? { name: uploadedDoc.name, mimeType: uploadedDoc.mimeType, base64: uploadedDoc.base64, type: 'supporting_doc' }
          : undefined
      });
      setSubmittedOrder(created);
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : isAr
          ? 'حدث خطأ أثناء إرسال الطلب للخادم'
          : 'Failed to submit service request'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void submitWithStatus('new');
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
      subtitleAr: submittedOrder ? `رقم الطلب المرجعي: ${submittedOrder.referenceCode}` : service.subtitleAr,
      subtitleEn: submittedOrder ? `Order Ref: ${submittedOrder.referenceCode}` : service.subtitleEn,
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
              {isAr ? 'تم تسجيل طلب الخدمة في قاعدة البيانات بنجاح' : 'Service Request Recorded Successfully'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              {isAr
                ? `حالة الطلب الحالية: ${submittedOrder.status} — يمكنك متابعة التحديثات والإشعارات والمستندات من مساحة العمل.`
                : `Current order status: ${submittedOrder.status} — Track updates and private documents inside your Workspace.`}
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
            <span className="text-slate-500 block">{isAr ? 'الحالة' : 'Status'}</span>
            <span className="font-mono font-black text-emerald-700 dark:text-emerald-300">
              {submittedOrder.status}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">{isAr ? 'الباقة' : 'Package'}</span>
            <span className="font-bold text-[#14243E] dark:text-white">
              {isAr ? submittedOrder.packageNameAr || 'قياسية' : submittedOrder.packageNameEn || 'Standard'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">{isAr ? 'الرسوم التقديرية' : 'Estimated Fee'}</span>
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
                ? `إصدار فاتورة الطلب في مساحة العمل ($${priceUsd})`
                : `Create Pending Invoice in Workspace ($${priceUsd})`}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSubmittedOrder(null)}
            className="px-4 py-3 rounded-xl border border-[#EAE6DC] dark:border-slate-700 text-[#14243E] dark:text-slate-200 hover:bg-[#F8F7F2] dark:hover:bg-slate-800 font-bold text-xs cursor-pointer"
          >
            {isAr ? 'تقديم طلب جديد' : 'Submit Another Request'}
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
              ? 'يُحفظ الطلب في قاعدة البيانات مع دعم رفع المستندات الخاصة بأمان.'
              : 'Persisted to backend storage with optional verified supporting document upload.'}
          </p>
        </div>

        <div className="px-4 py-2.5 rounded-xl bg-[#14243E] text-white shrink-0">
          <div className="text-[11px] text-[#D5B46B] font-bold">
            {isAr ? 'الرسوم المحددة' : 'Package Fee'}
          </div>
          <div className="text-lg font-black font-mono tabular-nums">
            ${priceUsd.toLocaleString()}{' '}
            <span className="text-xs font-normal text-slate-300">
              / ~{sarEstimate.toLocaleString()} {isAr ? 'ر.س' : 'SAR'}
            </span>
          </div>
        </div>
      </div>

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

      {service.formFields.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#EAE6DC] dark:border-slate-800">
          {service.formFields.map(field => (
            <div key={field.name} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
              <label className="block text-xs font-bold text-[#14243E] dark:text-slate-200 mb-1.5">
                {isAr ? field.labelAr : field.labelEn}
                {field.required ? ' *' : ''}
              </label>

              {field.type === 'select' && field.options ? (
                <select
                  value={customFields[field.name] || ''}
                  onChange={e => setCustomFields(prev => ({ ...prev, [field.name]: e.target.value }))}
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
                  onChange={e => setCustomFields(prev => ({ ...prev, [field.name]: e.target.value }))}
                  placeholder={isAr ? field.placeholderAr : field.placeholderEn}
                  className="w-full rounded-xl border border-[#EAE6DC] dark:border-slate-700 bg-[#F8F7F2] dark:bg-[#051724] px-3.5 py-2.5 text-xs text-[#14243E] dark:text-white focus:outline-none focus:border-[#D5B46B]"
                />
              ) : (
                <input
                  type={field.type}
                  required={field.required}
                  value={customFields[field.name] || ''}
                  onChange={e => setCustomFields(prev => ({ ...prev, [field.name]: e.target.value }))}
                  placeholder={isAr ? field.placeholderAr : field.placeholderEn}
                  className="w-full rounded-xl border border-[#EAE6DC] dark:border-slate-700 bg-[#F8F7F2] dark:bg-[#051724] px-3.5 py-2.5 text-xs text-[#14243E] dark:text-white focus:outline-none focus:border-[#D5B46B]"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Optional Supporting Document Upload (Private Vault) */}
      <div className="p-4 rounded-xl bg-[#F8F7F2] dark:bg-[#051724] border border-dashed border-[#D5B46B]/60 space-y-2">
        <label className="flex items-center gap-2 text-xs font-black text-[#14243E] dark:text-white">
          <Upload className="w-4 h-4 text-[#92743A]" />
          <span>{isAr ? 'إرفاق مستند داعم (اختياري — PDF أو صورة حتى 5MB)' : 'Attach Supporting Document (Optional — PDF/PNG/JPG/WEBP max 5MB)'}</span>
        </label>
        <input
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/png,image/jpeg,image/webp"
          onChange={handleFileChange}
          className="block w-full text-xs text-slate-600 dark:text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#14243E] file:text-white cursor-pointer"
        />
        {uploadedDoc && (
          <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
            <FileText className="w-3.5 h-3.5" />
            <span>{uploadedDoc.name} ({uploadedDoc.mimeType})</span>
          </div>
        )}
      </div>

      <div>
        <label className="block text-xs font-bold text-[#14243E] dark:text-slate-200 mb-1.5">
          {isAr ? 'ملاحظات إضافية (اختياري)' : 'Additional Notes (Optional)'}
        </label>
        <textarea
          rows={2}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder={
            isAr ? 'أي تفاصيل إضافية...' : 'Any extra context...'
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
            {isAr ? 'يخضع المستند لفحص MIME والبصمة الثنائية ويُحفظ بشكل خاص' : 'Attachments verified by MIME + magic-byte signature and stored privately'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {variant === 'inline' && (
            <AppLink
              to={`/order/${service.slug}${activePkg ? `?pkg=${activePkg.id}` : ''}`}
              className="px-4 py-3 rounded-xl border border-[#D5B46B] text-[#14243E] dark:text-[#D5B46B] hover:bg-[#F8F7F2] dark:hover:bg-slate-800 font-bold text-xs flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <span>{isAr ? 'صفحة الطلب المستقلة' : 'Dedicated Order Page'}</span>
              {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </AppLink>
          )}

          <button
            type="button"
            disabled={submitting}
            onClick={() => void submitWithStatus('draft')}
            className="px-4 py-3 rounded-xl border border-[#EAE6DC] dark:border-slate-700 text-[#14243E] dark:text-slate-200 hover:bg-[#F8F7F2] font-bold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isAr ? 'حفظ كمسودة' : 'Save Draft'}</span>
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 rounded-xl bg-[#14243E] hover:bg-[#1d3559] text-white font-black text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-colors shadow-sm whitespace-nowrap shrink-0 disabled:opacity-60"
          >
            <Send className="w-4 h-4 text-[#D5B46B]" />
            <span>
              {submitting
                ? isAr
                  ? 'جاري الحفظ...'
                  : 'Submitting...'
                : isAr
                ? `إرسال طلب ${service.titleAr.split('(')[0].trim()}`
                : `Submit Request ($${priceUsd})`}
            </span>
          </button>
        </div>
      </div>
    </form>
  );
};
