import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  X,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Coins,
  Building,
  Sparkles,
  Store,
  Building2,
  ArrowLeft
} from 'lucide-react';

type PaymentMethodType = 'Stripe' | 'PayPal' | 'Crypto' | 'BankTransfer';

export const CheckoutModal: React.FC = () => {
  const {
    language,
    user,
    checkoutModalOpen,
    setCheckoutModalOpen,
    pendingServiceOrder,
    setPendingServiceOrder,
    completeServiceCheckout
  } = useApp();

  const isAr = language === 'ar';
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('Stripe');

  if (!checkoutModalOpen || !pendingServiceOrder) return null;

  const sarAmount = Math.round(pendingServiceOrder.priceUsd * 3.75);

  const serviceBadge =
    pendingServiceOrder.serviceType === 'company_formation'
      ? { labelAr: 'تأسيس شركة دولية', labelEn: 'Company Formation', icon: Building2 }
      : pendingServiceOrder.serviceType === 'store_package'
      ? { labelAr: 'باقة متجر إلكتروني', labelEn: 'Online Store Package', icon: Store }
      : { labelAr: 'قبس AI والأرصدة', labelEn: 'QABS AI & Credits', icon: Sparkles };

  const ServiceIcon = serviceBadge.icon;

  const paymentOptions: {
    id: PaymentMethodType;
    titleAr: string;
    titleEn: string;
    descAr: string;
    descEn: string;
    icon: React.ElementType;
  }[] = [
    {
      id: 'Stripe',
      titleAr: 'بطاقة ائتمان / Apple Pay (Stripe)',
      titleEn: 'Credit Card / Apple Pay (Stripe)',
      descAr: 'دفع إلكتروني فوري ومؤمّن',
      descEn: 'Instant encrypted card checkout',
      icon: CreditCard
    },
    {
      id: 'PayPal',
      titleAr: 'باي بال العالمي (PayPal)',
      titleEn: 'PayPal Global Checkout',
      descAr: 'ربط حساب PayPal التجاري أو الشخصي',
      descEn: 'Pay via PayPal balance or linked bank',
      icon: ShieldCheck
    },
    {
      id: 'Crypto',
      titleAr: 'العملات الرقمية (USDT / BTC)',
      titleEn: 'Crypto Settlement (USDT / BTC)',
      descAr: 'تحويل فوري عبر شبكات TRC20 أو ERC20',
      descEn: 'Fast transfer on TRC20 or ERC20',
      icon: Coins
    },
    {
      id: 'BankTransfer',
      titleAr: 'تحويل بنكي مباشر (IBAN / Wire)',
      titleEn: 'Direct Bank Wire / IBAN',
      descAr: 'موافقة وإصدار فاتورة رسمية فورية',
      descEn: 'Instant invoice & wire confirmation',
      icon: Building
    }
  ];

  const handleClose = () => {
    setCheckoutModalOpen(false);
    setPendingServiceOrder(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#082030] border-2 border-[#D5B46B] rounded-2xl shadow-2xl max-w-lg w-full text-[#14243E] dark:text-slate-100 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EAE6DC] dark:border-cyan-950/60 bg-[#14243E] text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#D5B46B]/20 text-[#D5B46B] rounded-xl border border-[#D5B46B]/40">
              <ServiceIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black">
                {isAr ? 'إتمام الدفع وتأكيد الطلب' : 'Complete Service Checkout'}
              </h2>
              <p className="text-[11px] text-[#EAE6DC]">
                {isAr
                  ? `مسجل باسم: ${user.name} (${user.email})`
                  : `Authenticated as: ${user.name} (${user.email})`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            aria-label={isAr ? 'إغلاق' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          {/* Selected Order Summary */}
          <div className="rounded-2xl bg-[#F8F7F2] dark:bg-[#051724] border border-[#D5B46B]/60 p-4 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-[#14243E] text-[#D5B46B] text-[10px] font-black">
                {isAr ? serviceBadge.labelAr : serviceBadge.labelEn}
              </span>
              <div className="text-end">
                <div className="text-xl font-black text-[#14243E] dark:text-[#D5B46B] font-mono">
                  ${pendingServiceOrder.priceUsd.toLocaleString()}
                </div>
                <div className="text-[11px] font-bold text-[#92743A]">
                  {isAr ? `يعادل ~ ${sarAmount.toLocaleString()} ر.س` : `~ ${sarAmount.toLocaleString()} SAR`}
                </div>
              </div>
            </div>

            <div className="font-black text-sm text-[#14243E] dark:text-white">
              {isAr ? pendingServiceOrder.titleAr : pendingServiceOrder.titleEn}
            </div>

            {(pendingServiceOrder.subtitleAr || pendingServiceOrder.subtitleEn) && (
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {isAr ? pendingServiceOrder.subtitleAr : pendingServiceOrder.subtitleEn}
              </p>
            )}

            {pendingServiceOrder.details?.jurisdiction && (
              <div className="pt-2 border-t border-[#EAE6DC] dark:border-slate-800 flex flex-wrap gap-2 text-[11px] font-bold text-[#14243E] dark:text-slate-200">
                <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-[#EAE6DC] dark:border-slate-700">
                  {pendingServiceOrder.details.jurisdiction}
                </span>
                {pendingServiceOrder.details.companyName && (
                  <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-[#EAE6DC] dark:border-slate-700">
                    {pendingServiceOrder.details.companyName}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-2.5">
            <label className="block text-xs font-black text-[#14243E] dark:text-slate-200">
              {isAr ? 'اختر وسيلة الدفع المفضلة:' : 'Select Payment Method:'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {paymentOptions.map(opt => {
                const Icon = opt.icon;
                const active = paymentMethod === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPaymentMethod(opt.id)}
                    className={`p-3 rounded-xl border text-start transition-all cursor-pointer flex items-start gap-2.5 ${
                      active
                        ? 'border-[#14243E] dark:border-[#D5B46B] bg-[#FBFAF6] dark:bg-[#051724] ring-2 ring-[#D5B46B]/40'
                        : 'border-[#EAE6DC] dark:border-slate-800 bg-white dark:bg-[#051724]/60 hover:border-[#D5B46B]'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 mt-0.5 shrink-0 ${
                        active ? 'text-[#92743A] dark:text-[#D5B46B]' : 'text-slate-400'
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-black text-[#14243E] dark:text-white">
                        {isAr ? opt.titleAr : opt.titleEn}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {isAr ? opt.descAr : opt.descEn}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Guarantee Strip */}
          <div className="flex items-center gap-2 text-[11px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl px-3.5 py-2.5 font-bold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>
              {isAr
                ? 'سيتم حفظ الطلب وإصدار الفاتورة الرسمية ومستنداتك مباشرة داخل مساحة العمل الخاصة بك.'
                : 'Your order, official invoice, and documents will be saved automatically to your workspace.'}
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => completeServiceCheckout(paymentMethod)}
              className="flex-1 py-3 px-4 rounded-xl bg-[#14243E] hover:bg-[#1c3255] text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <span>
                {isAr
                  ? `تأكيد الدفع ($${pendingServiceOrder.priceUsd}) والانتقال لمساحة العمل`
                  : `Confirm Payment ($${pendingServiceOrder.priceUsd}) & Open Workspace`}
              </span>
              <ArrowLeft className="w-4 h-4 text-[#D5B46B] ltr:rotate-180" />
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="py-3 px-4 rounded-xl border border-[#EAE6DC] dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-xs cursor-pointer"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
