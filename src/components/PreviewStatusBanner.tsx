import React from 'react';
import { Activity, ArrowUpRight, Bell, Database, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';

export const PreviewStatusBanner: React.FC = () => {
  const {
    language,
    mode,
    setMode,
    backendStatus,
    isAuthenticated,
    isOwner,
    unreadNotificationsCount
  } = useApp();
  const isAr = language === 'ar';

  const isConnected = backendStatus === 'connected';

  return (
    <section
      aria-label={isAr ? 'حالة إصدار قبس' : 'QABS release status'}
      className="border-b border-[#D5B46B]/30 bg-[#14243E] text-white shadow-[0_8px_24px_rgba(20,36,62,0.16)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="mt-0.5 w-9 h-9 rounded-xl bg-[#D5B46B]/15 border border-[#D5B46B]/40 flex items-center justify-center shrink-0">
              <Activity className="w-4 h-4 text-[#E8C978]" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-black tracking-[0.16em] uppercase text-[#E8C978]">
                <span>{isAr ? 'مركز تشغيل قبس' : 'QABS CONTROL CENTER'}</span>
                <span
                  className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-amber-400'}`}
                  aria-hidden="true"
                />
                <span className={isConnected ? 'text-emerald-200' : 'text-amber-200'}>
                  {isConnected
                    ? isAr
                      ? 'خادم API + SQLite متصل'
                      : 'API + SQLite Connected'
                    : backendStatus === 'checking'
                    ? isAr
                      ? 'جاري فحص الاتصال'
                      : 'Checking Backend'
                    : isAr
                    ? 'معاينة ثابتة (بدون خادم خلفي)'
                    : 'Static Preview Fallback'}
                </span>
              </div>
              <p className="mt-1 text-sm font-bold text-white">
                {isConnected
                  ? isAr
                    ? 'بيئة العمل الفعلية لقبس — خادم API وقاعدة البيانات متصلان'
                    : 'QABS Live Workspace — API & Database Connected'
                  : isAr
                  ? 'نسخة معاينة محلية (بدون خادم خلفي)'
                  : 'Local Static Preview (Offline Fallback)'}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-300">
                {isConnected
                  ? isAr
                    ? 'جميع الحسابات والمتاجر والمنتجات والطلبات والفواتير والتذاكر محفوظة ومعزولة فعلياً بالخادم — بوابات الدفع المباشرة مقيدة أماناً.'
                    : 'Accounts, stores, products, orders, invoices, and tickets are persisted and tenant-isolated on the server — live card charging remains safely gated.'
                  : isAr
                  ? 'الحالة المعروضة صادقة: لا يتوفر خادم API على هذه الاستضافة الثابتة، وتُحفظ التجربة محلياً دون أي سداد مالي حقيقي.'
                  : 'Explicit static fallback: no live API server reachable here; preview state runs locally without financial settlement.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-[11px] font-bold">
            <span
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 ${
                isConnected
                  ? 'border-emerald-300/35 bg-emerald-300/15 text-emerald-100'
                  : 'border-amber-300/35 bg-amber-300/15 text-amber-100'
              }`}
            >
              <Database className="w-3.5 h-3.5" aria-hidden="true" />
              {isConnected
                ? isAr
                  ? 'قاعدة البيانات متصلة'
                  : 'Live DB Connected'
                : isAr
                ? 'وضع معاينة محلي'
                : 'Offline Preview'}
            </span>

            {isAuthenticated && (
              <button
                type="button"
                onClick={() => setMode(isOwner ? 'admin' : 'portal')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-sky-300/35 bg-sky-300/15 px-2.5 py-1.5 text-sky-100 cursor-pointer hover:bg-sky-300/25"
              >
                <Bell className="w-3.5 h-3.5" aria-hidden="true" />
                <span>
                  {isAr ? `الإشعارات (${unreadNotificationsCount})` : `Alerts (${unreadNotificationsCount})`}
                </span>
              </button>
            )}

            <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#D5B46B]/35 bg-[#D5B46B]/10 px-2.5 py-1.5 text-[#F2D995]">
              <LockKeyhole className="w-3.5 h-3.5" aria-hidden="true" />
              {isAr ? 'بوابات الدفع مقيدة' : 'Payments gated'}
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300/25 bg-emerald-300/10 px-2.5 py-1.5 text-emerald-100">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              {isAr ? 'عزل المستأجرين' : 'Tenant Isolated'}
            </span>

            <button
              type="button"
              onClick={() => setMode(mode === 'portal' || mode === 'admin' ? 'landing' : isOwner ? 'admin' : 'portal')}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-[#D5B46B] px-3.5 py-2 text-[11px] font-black text-[#14243E] transition-colors hover:bg-[#E8C978] focus:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
            >
              {mode === 'portal' || mode === 'admin'
                ? isAr
                  ? 'العودة للموقع'
                  : 'Back to showcase'
                : isOwner
                ? isAr
                  ? 'فتح لوحة الإدارة'
                  : 'Open Admin Center'
                : isAr
                ? 'فتح لوحة التحكم'
                : 'Open Workspace'}
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
