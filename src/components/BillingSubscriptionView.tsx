import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  CreditCard,
  Check,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  FileText,
  RotateCcw,
  Plus,
  Download,
  Wallet,
  LockKeyhole,
  History
} from 'lucide-react';
import { SUBSCRIPTION_PLANS } from '../data/mockData.ts';
import { Invoice } from '../types/index.ts';
import { qabsApi } from '../services/qabsApi.ts';

export const BillingSubscriptionView: React.FC = () => {
  const {
    language,
    subscription,
    subscriptionHistory,
    creditLedger,
    changeSubscriptionPlan,
    cancelSubscription,
    renewSubscription,
    invoices,
    refunds,
    issueRefund,
    user,
    topUpCredits,
    showToast,
    integrationsStatus,
    backendStatus,
    refreshWorkspace
  } = useApp();

  const isAr = language === 'ar';

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>(subscription.billingCycle);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [refundOrderNumber, setRefundOrderNumber] = useState('');
  const [refundAmount, setRefundAmount] = useState(50);
  const [refundReason, setRefundReason] = useState('');
  const [payingInvoiceId, setPayingInvoiceId] = useState<string | null>(null);

  const tapSandboxReady = backendStatus === 'connected' && integrationsStatus?.integrations.tap.sandboxConfigured === true;
  const handleTapSandboxPayment = async (invoice: Invoice) => {
    if (!tapSandboxReady || payingInvoiceId) {
      showToast(isAr ? 'بوابة Tap التجريبية غير مهيأة حالياً.' : 'Tap sandbox is not currently configured.');
      return;
    }
    setPayingInvoiceId(invoice.id);
    try {
      const session = await qabsApi.createTapSandboxCharge(invoice.id);
      if (session.mode !== 'sandbox' || !session.redirectUrl.startsWith('https://')) {
        throw new Error('Invalid sandbox checkout response');
      }
      window.location.assign(session.redirectUrl);
    } catch (error) {
      showToast(error instanceof Error ? error.message : (isAr ? 'تعذر بدء الدفع التجريبي.' : 'Could not start sandbox payment.'));
      setPayingInvoiceId(null);
    }
  };

  const handleRefundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundOrderNumber.trim()) return;
    issueRefund(
      refundOrderNumber,
      Number(refundAmount),
      refundReason || 'طلب استرداد للمراجعة',
      refundReason || 'Customer refund request'
    );
    setRefundModalOpen(false);
    setRefundOrderNumber('');
    setRefundReason('');
  };

  return (
    <div className="w-full bg-[#03131D] text-slate-100 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-cyan-950/60">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                {isAr ? 'نظام الاشتراكات والفوترة وسجل الأرصدة' : 'Subscriptions, Invoicing & Credit Ledger'}
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] font-medium border border-[#D4AF37]/30">
                qabs-billing v2.5
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isAr
                ? 'إدارة طلبات الباقات والفواتير وسجل أرصدة AI غير القابل للتعديل — جميع العمليات المالية تخضع للتحقق المرجعي'
                : 'Manage plan upgrade requests, verification-gated invoices, and immutable AI credit ledger entries'}
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#082030] border border-cyan-950 p-2.5 rounded-xl">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-[#D4AF37]" />
              <div>
                <span className="text-[10px] text-slate-400 block">{isAr ? 'رصيد AI الموثق:' : 'Verified AI Credits:'}</span>
                <span className="text-sm font-black text-[#D4AF37] tabular-nums">{user.credits.toLocaleString()}</span>
              </div>
            </div>
            <button
              onClick={() => topUpCredits(100)}
              className="px-3 py-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] rounded-md hover:from-[#C59B27] hover:to-[#E5D28A] transition-all cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAr ? 'طلب شحن $100' : 'Request +$100 Pack'}</span>
            </button>
          </div>
        </div>

        {/* Financial Gate Notice */}
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/70 text-amber-200 text-xs flex items-start gap-2.5">
          <LockKeyhole className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
          <span>
            {isAr
              ? 'بوابة الحماية المالية مفعّلة: لا تُعتمد أي فاتورة كـ «مدفوعة» ولا يُضاف أي رصيد AI عند الطلب إلا بعد إدخال مرجع إثبات السداد وتوثيقه من مسؤول النظام.'
              : 'Strict financial gate active: Plan upgrades and AI credit packs generate Pending Verification invoices and are only marked Paid and credited after verified proof-reference approval by an administrator.'}
          </span>
        </div>

        {/* Subscription Plans */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white">
                {isAr ? 'باقات الاشتراك الشهرية والسنوية' : 'Subscription Tiers'}
              </h2>
              <p className="text-xs text-slate-400">
                {isAr ? `حالة الباقة الحالية: ${subscription.status}` : `Current plan status: ${subscription.status}`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start">
              <button
                type="button"
                onClick={() => void renewSubscription(subscription.planId, billingCycle)}
                className="px-3 py-1.5 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#F3E5AB] text-xs font-bold hover:bg-[#D4AF37]/30 cursor-pointer"
              >
                {isAr ? 'تجديد الاشتراك (إصدار فاتورة)' : 'Renew Plan (Issue Invoice)'}
              </button>
              {subscription.status !== 'cancelled' && subscription.status !== 'canceled' && (
                <button
                  type="button"
                  onClick={() => void cancelSubscription('Requested via Billing Hub')}
                  className="px-3 py-1.5 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-200 text-xs font-bold hover:bg-rose-900/70 cursor-pointer"
                >
                  {isAr ? 'إلغاء التجديد' : 'Cancel Renewal'}
                </button>
              )}
              <div className="flex items-center p-1 bg-[#082030] border border-cyan-950 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-4 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                    billingCycle === 'monthly' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {isAr ? 'شهري' : 'Monthly'}
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('annual')}
                  className={`px-4 py-1.5 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    billingCycle === 'annual' ? 'bg-[#D4AF37] text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{isAr ? 'سنوي' : 'Annual'}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-950 text-[#D4AF37]">-20%</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SUBSCRIPTION_PLANS.map(plan => {
              const isCurrent = subscription.planId === plan.id && subscription.status === 'active';
              const price = billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly;
              return (
                <div
                  key={plan.id}
                  className={`p-6 rounded-xl flex flex-col justify-between transition-all relative ${
                    isCurrent
                      ? 'bg-[#082030] border-2 border-[#D4AF37]'
                      : 'bg-[#051724] border border-cyan-950 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-white">{isAr ? plan.nameAr : plan.nameEn}</h3>
                      <p className="text-xs text-slate-400 mt-1">{isAr ? plan.descriptionAr : plan.descriptionEn}</p>
                    </div>
                    <div className="flex items-baseline gap-1 py-2 border-b border-slate-800">
                      <span className="text-3xl font-black text-white tabular-nums">${price}</span>
                      <span className="text-xs text-slate-400">{isAr ? '/شهرياً' : '/month'}</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      {(isAr ? plan.featuresAr : plan.featuresEn).map((feat, i) => (
                        <div key={i} className="flex items-start gap-2 text-slate-300">
                          <Check className="w-3.5 h-3.5 text-[#00A389] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="pt-6">
                    {isCurrent ? (
                      <div className="w-full py-2.5 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold text-center">
                        {isAr ? '✓ باقتك النشطة حالياً' : '✓ Current Active Plan'}
                      </div>
                    ) : (
                      <button
                        onClick={() => changeSubscriptionPlan(plan.id, billingCycle)}
                        className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-[#D4AF37] hover:text-slate-950 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span>{isAr ? 'طلب الترقية وإصدار فاتورة' : 'Request Plan & Issue Invoice'}</span>
                        {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* AI Credit Packs & Ledger */}
        <section className="p-6 rounded-xl bg-[#082030] border border-cyan-950/80 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span>{isAr ? 'سجل أرصدة الذكاء الاصطناعي الموثق (Immutable Credit Ledger)' : 'Verified AI Credit Ledger'}</span>
              </h2>
              <p className="text-xs text-slate-400">
                {isAr
                  ? 'كل عملية خصم أو شحن موثق تسجل ذرياً في السجل المحاسبي من جهة الخادم'
                  : 'Every AI deduction and verified credit grant is recorded atomically on the server'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => topUpCredits(50)}
                className="px-3 py-1.5 text-xs bg-[#051724] border border-cyan-950 hover:border-[#D4AF37] text-slate-200 rounded cursor-pointer"
              >
                {isAr ? 'طلب +500 رصيد ($50)' : 'Request +500 ($50)'}
              </button>
              <button
                onClick={() => topUpCredits(100)}
                className="px-3 py-1.5 text-xs font-bold bg-[#D4AF37] hover:bg-[#C59B27] text-slate-950 rounded cursor-pointer"
              >
                {isAr ? 'طلب +1,000 رصيد ($100)' : 'Request +1,000 ($100)'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{isAr ? 'آخر حركات سجل الأرصدة' : 'Recent Credit Ledger'}</span>
              </h3>
              {creditLedger.length === 0 ? (
                <div className="p-4 rounded-lg bg-[#051724] border border-cyan-950/60 text-xs text-slate-400">
                  {isAr ? 'لا توجد حركات رصيد مسجلة بعد.' : 'No credit ledger entries yet.'}
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {creditLedger.map(entry => (
                    <div
                      key={entry.id}
                      className="p-3 rounded-lg bg-[#051724] border border-cyan-950/60 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-white">{entry.reason}</div>
                        <div className="text-[10px] font-mono text-slate-400">{entry.createdAt}</div>
                      </div>
                      <div className="text-end font-mono">
                        <span className={entry.delta >= 0 ? 'text-emerald-400 font-bold' : 'text-amber-300 font-bold'}>
                          {entry.delta >= 0 ? `+${entry.delta}` : entry.delta}
                        </span>
                        <div className="text-[10px] text-slate-400">Bal: {entry.balanceAfter}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-[#00A389]" />
                <span>{isAr ? 'سجل طلبات الباقات والتجديدات' : 'Subscription History'}</span>
              </h3>
              {subscriptionHistory.length === 0 ? (
                <div className="p-4 rounded-lg bg-[#051724] border border-cyan-950/60 text-xs text-slate-400">
                  {isAr ? 'لم تُطلب تغييرات باقات بعد.' : 'No subscription history entries yet.'}
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {subscriptionHistory.map(sh => (
                    <div
                      key={sh.id}
                      className="p-3 rounded-lg bg-[#051724] border border-cyan-950/60 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-white uppercase">{sh.planTier} ({sh.billingCycle})</div>
                        <div className="text-[10px] text-slate-400">{sh.note || sh.createdAt}</div>
                      </div>
                      <div className="text-end font-mono">
                        <div className="text-[#D4AF37] font-bold">${sh.price}</div>
                        <div className="text-[10px] text-amber-300">{sh.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Invoices Table */}
        <section className="p-6 rounded-xl bg-[#082030] border border-cyan-950/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#00A389]" />
                <span>{isAr ? 'سجل الفواتير وحالة التحقق' : 'Invoices & Verification Status'}</span>
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400">{invoices.length} {isAr ? 'فواتير' : 'invoices'}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#051724] text-slate-400 border-b border-cyan-950/60 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">{isAr ? 'رقم الفاتورة' : 'Invoice #'}</th>
                  <th className="py-2.5 px-3">{isAr ? 'التاريخ' : 'Date'}</th>
                  <th className="py-2.5 px-3">{isAr ? 'البيان' : 'Description'}</th>
                  <th className="py-2.5 px-3 text-right">{isAr ? 'المبلغ' : 'Amount'}</th>
                  <th className="py-2.5 px-3 text-center">{isAr ? 'الحالة' : 'Status'}</th>
                  <th className="py-2.5 px-3 text-center">{isAr ? 'إيصال' : 'Details'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-cyan-950/20 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-[#D4AF37]">{inv.invoiceNumber}</td>
                    <td className="py-3 px-3 text-slate-300 font-mono">{inv.date}</td>
                    <td className="py-3 px-3 text-white max-w-[300px] truncate">
                      {isAr ? inv.descriptionAr : inv.descriptionEn}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-white text-right tabular-nums">
                      ${inv.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          inv.status === 'paid'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {inv.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-[#D4AF37] rounded text-[11px] font-medium cursor-pointer inline-flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          <span>{isAr ? 'عرض' : 'View'}</span>
                        </button>
                        {inv.status !== 'paid' && inv.status !== 'refunded' && (
                          <button
                            type="button"
                            disabled={!tapSandboxReady || payingInvoiceId !== null}
                            onClick={() => void handleTapSandboxPayment(inv)}
                            className="px-2.5 py-1 rounded text-[11px] font-bold border border-[#D4AF37]/50 text-[#F3E5AB] bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 disabled:opacity-40 disabled:cursor-not-allowed"
                            title={isAr ? 'دفع تجريبي فقط عبر بيئة Tap الاختبارية' : 'Sandbox payment only through Tap test mode'}
                          >
                            {payingInvoiceId === inv.id ? (isAr ? 'جارٍ التحويل…' : 'Redirecting…') : (isAr ? 'دفع تجريبي Tap' : 'Tap sandbox')}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Refunds Section */}
        <div className="p-6 rounded-xl bg-[#082030] border border-cyan-950/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-cyan-400" />
              <span>{isAr ? 'سجل طلبات الاسترداد للمراجعة' : 'Refund Review Queue'}</span>
            </h3>
            <button
              onClick={() => setRefundModalOpen(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded text-xs font-semibold cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>{isAr ? 'تقديم طلب استرداد' : 'Request Refund'}</span>
            </button>
          </div>
          <div className="space-y-2">
            {refunds.map(r => (
              <div key={r.id} className="p-3 bg-[#051724] border border-cyan-950/60 rounded-lg flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-white">{r.orderNumber}</div>
                  <div className="text-[11px] text-slate-400">{isAr ? r.reasonAr : r.reasonEn}</div>
                </div>
                <div className="text-right font-mono">
                  <span className="font-bold text-red-400">-${r.amount}</span>
                  <span className="block text-[10px] text-amber-300">{r.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#082030] border border-cyan-950 rounded-xl shadow-2xl max-w-lg w-full text-slate-100 p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <span className="text-xs font-mono font-bold text-[#D4AF37]">{selectedInvoice.invoiceNumber}</span>
              <button onClick={() => setSelectedInvoice(null)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">{isAr ? 'التاريخ:' : 'Date:'}</span>
                <span className="font-mono">{selectedInvoice.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{isAr ? 'الحالة:' : 'Status:'}</span>
                <span className="font-mono text-amber-300">{selectedInvoice.status}</span>
              </div>
              {selectedInvoice.paymentProofRef && (
                <div className="flex justify-between">
                  <span className="text-slate-400">{isAr ? 'مرجع السداد الموثق:' : 'Payment Proof Ref:'}</span>
                  <span className="font-mono text-emerald-300">{selectedInvoice.paymentProofRef}</span>
                </div>
              )}
              <div className="flex justify-between p-3 rounded-lg bg-[#051724] border border-cyan-950 text-sm">
                <span>{isAr ? 'المبلغ:' : 'Amount:'}</span>
                <span className="font-black text-[#D4AF37] tabular-nums">${selectedInvoice.amount} USD</span>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  showToast(isAr ? 'تم حفظ نسخة الفاتورة للمراجعة' : 'Invoice copy downloaded');
                  setSelectedInvoice(null);
                }}
                className="px-4 py-2 bg-[#D4AF37] text-slate-950 font-bold text-xs rounded cursor-pointer"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {refundModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form onSubmit={handleRefundSubmit} className="bg-[#082030] border border-cyan-950 rounded-xl shadow-2xl max-w-md w-full text-slate-100 p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">{isAr ? 'طلب مراجعة استرداد مالي' : 'Submit Refund Request'}</h3>
              <button type="button" onClick={() => setRefundModalOpen(false)} className="text-slate-400">✕</button>
            </div>
            <input
              type="text"
              required
              placeholder="e.g. QBS-8921"
              value={refundOrderNumber}
              onChange={e => setRefundOrderNumber(e.target.value)}
              className="w-full bg-[#051724] border border-cyan-950 rounded px-3 py-2 text-xs text-white font-mono"
            />
            <input
              type="number"
              required
              value={refundAmount}
              onChange={e => setRefundAmount(Number(e.target.value))}
              className="w-full bg-[#051724] border border-cyan-950 rounded px-3 py-2 text-xs text-white font-mono"
            />
            <input
              type="text"
              placeholder={isAr ? 'سبب الطلب' : 'Reason'}
              value={refundReason}
              onChange={e => setRefundReason(e.target.value)}
              className="w-full bg-[#051724] border border-cyan-950 rounded px-3 py-2 text-xs text-white"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setRefundModalOpen(false)} className="px-3 py-2 text-xs text-slate-400">
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button type="submit" className="px-4 py-2 bg-red-600 text-white font-bold text-xs rounded cursor-pointer">
                {isAr ? 'إرسال الطلب' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
