import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { SUBSCRIPTION_PLANS } from '../data/mockData.ts';
import { ServiceOrderStatus } from '../types/pages.ts';
import { qabsApi } from '../services/qabsApi.ts';
import {
  ShieldCheck,
  Store,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
  CreditCard,
  History,
  Database,
  Plus,
  Eye,
  Building2,
  FileText,
  Package,
  Bell,
  Settings,
  ClipboardList,
  UserCog,
  Download,
  RefreshCw,
  Send
} from 'lucide-react';

type CentralAdminTab =
  | 'clients'
  | 'staff'
  | 'services'
  | 'service_requests'
  | 'formations'
  | 'documents'
  | 'stores'
  | 'products'
  | 'subscriptions'
  | 'invoices'
  | 'notifications'
  | 'audit_logs'
  | 'settings';

const REQUEST_STATUSES: ServiceOrderStatus[] = [
  'draft',
  'new',
  'under_review',
  'needs_info',
  'in_progress',
  'completed',
  'rejected',
  'cancelled'
];

export const AdminView: React.FC = () => {
  const {
    language,
    user,
    setMode,
    backendStatus,
    adminOverview,
    integrationsStatus,
    refreshWorkspace,
    stores,
    setActiveStoreId,
    reviewStoreApproval,
    approveStorePayment,
    verifyStoreDomain,
    auditLogs,
    triggerSystemBackup,
    products,
    invoices,
    companies,
    submittedServiceOrders,
    updateServiceOrderStatus,
    verifyInvoiceWithProof,
    adminCreateStaffUser,
    adminUpdateStaffUser,
    adminUpdateServiceCatalog,
    adminSendBroadcastNotification,
    adminUpdatePlatformSettings
  } = useApp();

  const isAr = language === 'ar';
  const [activeTab, setActiveTab] = useState<CentralAdminTab>('service_requests');
  const [feedbackNotes, setFeedbackNotes] = useState<Record<string, string>>({});
  const [requestAdminNotes, setRequestAdminNotes] = useState<Record<string, string>>({});
  const [proofRefs, setProofRefs] = useState<Record<string, string>>({});
  const [servicePrices, setServicePrices] = useState<Record<string, string>>({});

  // Staff creation state
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('QabsStaff!2026');
  const [newStaffRole, setNewStaffRole] = useState<'staff' | 'support' | 'admin'>('staff');

  // Notification broadcast state
  const [notifTenantId, setNotifTenantId] = useState('');
  const [notifTitleAr, setNotifTitleAr] = useState('');
  const [notifBodyAr, setNotifBodyAr] = useState('');

  // Settings form state
  const [supportEmailDraft, setSupportEmailDraft] = useState(
    String(adminOverview?.platformSettings?.supportEmail || 'support@qabs1.store')
  );
  const [previewBannerDraft, setPreviewBannerDraft] = useState(
    String(adminOverview?.platformSettings?.previewNotice || 'QABS Isolated Preview Governance')
  );

  // Use live adminOverview arrays when connected, or context fallbacks in preview_offline
  const clientsList = adminOverview?.clients || [];
  const staffList = adminOverview?.staff || [];
  const servicesList = adminOverview?.servicesCatalog || [];
  const requestsList = adminOverview?.serviceRequests || [];
  const formationsList = adminOverview?.formations || [];
  const documentsList = adminOverview?.documents || [];
  const storesList = adminOverview?.stores || [];
  const productsList = adminOverview?.products || [];
  const subscriptionsList = adminOverview?.subscriptions || [];
  const invoicesList = adminOverview?.invoices || [];
  const notificationsList = adminOverview?.notifications || [];
  const auditLogsList = adminOverview?.auditLogs || [];
  const errorLogsList = adminOverview?.errorLogs || [];
  const backupsList = adminOverview?.backups || [];

  const isConnected = backendStatus === 'connected' && Boolean(adminOverview);

  const adminSections: {
    id: CentralAdminTab;
    labelAr: string;
    labelEn: string;
    descAr: string;
    icon: React.ElementType;
    badge?: number;
  }[] = [
    {
      id: 'clients',
      labelAr: '1. العملاء',
      labelEn: '1. Clients',
      descAr: 'حسابات العملاء المسجلين',
      icon: Users,
      badge: isConnected ? clientsList.length : stores.length
    },
    {
      id: 'staff',
      labelAr: '2. الموظفون والصلاحيات',
      labelEn: '2. Staff & RBAC',
      descAr: 'إدارة الطاقم والأدوار',
      icon: UserCog,
      badge: staffList.length
    },
    {
      id: 'services',
      labelAr: '3. كتالوج الخدمات',
      labelEn: '3. Services Catalog',
      descAr: 'الأسعار وحالة التفعيل',
      icon: ClipboardList,
      badge: servicesList.length
    },
    {
      id: 'service_requests',
      labelAr: '4. طلبات الخدمات',
      labelEn: '4. Service Requests',
      descAr: 'دورة 8 حالات وملاحظات',
      icon: FileText,
      badge: isConnected ? requestsList.length : submittedServiceOrders.length
    },
    {
      id: 'formations',
      labelAr: '5. تأسيس الشركات',
      labelEn: '5. Formations',
      descAr: 'ملفات LLC / EIN / UK',
      icon: Building2,
      badge: isConnected ? formationsList.length : companies.length
    },
    {
      id: 'documents',
      labelAr: '6. المستندات الخاصة',
      labelEn: '6. Documents Vault',
      descAr: 'تصفح وتنزيل المرفقات',
      icon: Download,
      badge: documentsList.length
    },
    {
      id: 'stores',
      labelAr: '7. المتاجر والموافقات',
      labelEn: '7. Stores & Approvals',
      descAr: 'المراجعة والنشر والنطاقات',
      icon: Store,
      badge: isConnected ? storesList.length : stores.length
    },
    {
      id: 'products',
      labelAr: '8. المنتجات',
      labelEn: '8. Products',
      descAr: 'منتجات متاجر المستأجرين',
      icon: Package,
      badge: isConnected ? productsList.length : products.length
    },
    {
      id: 'subscriptions',
      labelAr: '9. الاشتراكات',
      labelEn: '9. Subscriptions',
      descAr: 'باقات الحسابات والتجديدات',
      icon: CreditCard,
      badge: subscriptionsList.length
    },
    {
      id: 'invoices',
      labelAr: '10. الفواتير والتحقق',
      labelEn: '10. Invoices & Proof',
      descAr: 'مراجعة مراجع السداد',
      icon: CreditCard,
      badge: isConnected ? invoicesList.length : invoices.length
    },
    {
      id: 'notifications',
      labelAr: '11. الإشعارات',
      labelEn: '11. Notifications',
      descAr: 'بث التنبيهات للعملاء',
      icon: Bell,
      badge: notificationsList.length
    },
    {
      id: 'audit_logs',
      labelAr: '12. سجل التدقيق',
      labelEn: '12. Audit Logs',
      descAr: 'سجل الأمان والتغييرات',
      icon: History,
      badge: isConnected ? auditLogsList.length : auditLogs.length
    },
    {
      id: 'settings',
      labelAr: '13. إعدادات المنصة',
      labelEn: '13. Platform Settings',
      descAr: 'ضوابط الأمان والحوكمة',
      icon: Settings
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Central Governance Header */}
      <div className="rounded-2xl bg-gradient-to-r from-[#03131D] via-[#004457] to-[#03131D] text-white p-6 border border-cyan-900 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C8A24A]/20 border border-[#C8A24A]/40 text-[#E5C158] text-xs font-black">
            <ShieldCheck className="w-4 h-4" />
            <span>
              {isAr
                ? `لوحة حوكمة قبس المركزية (13 قسماً) — الصلاحية: ${user.role}`
                : `QABS Central Governance (13 Sections) — Role: ${user.role}`}
            </span>
          </div>
          <h1 className="text-2xl font-black">
            {isAr
              ? 'الإدارة المركزية للعملاء، الموظفين، الطلبات، المستندات، المتاجر، والفواتير'
              : 'Central Governance for Clients, Staff, Requests, Vault, Stores & Billing'}
          </h1>
          <p className="text-xs text-teal-100">
            {isAr
              ? 'تحكم كامل بصلاحيات RBAC: لا يُنشر أي متجر أو تُعتمد فاتورة إلا يدوياً مع مرجع إثبات سداد مسجل في سجل التدقيق.'
              : 'Strict RBAC governance: stores, service statuses, and invoices are audited and never auto-paid.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
          <button
            type="button"
            onClick={() => void refreshWorkspace()}
            className="px-4 py-2.5 rounded-xl bg-white text-[#14243E] hover:bg-slate-100 font-black text-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{isAr ? 'مزامنة من الخادم' : 'Refresh Server Data'}</span>
          </button>

          <button
            type="button"
            onClick={() => triggerSystemBackup('جميع بيانات قبس')}
            className="px-4 py-2.5 rounded-xl bg-[#E5C158] text-slate-950 font-black text-xs hover:bg-[#d8b348] transition-all flex items-center gap-2 cursor-pointer"
          >
            <Database className="w-4 h-4" />
            <span>{isAr ? 'نقطة تدقيق احتياطية' : 'Record Audit Backup'}</span>
          </button>
        </div>
      </div>

      {/* 13-Section Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <aside className="lg:col-span-3">
          <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-3 space-y-1 shadow-sm">
            <div className="px-3 py-2 text-[11px] font-black text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800 mb-1">
              {isAr ? 'أقسام لوحة قبس (13 قسماً)' : 'QABS Central Admin (13)'}
            </div>
            {adminSections.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full text-right px-3 py-2.5 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#004457] text-white font-bold shadow-sm'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-teal-50/60 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#E5C158]' : 'text-[#00A896]'}`} />
                    <div className="truncate">
                      <div className="text-xs font-bold leading-tight">{isAr ? item.labelAr : item.labelEn}</div>
                      <div className={`text-[10px] truncate ${isActive ? 'text-teal-200' : 'text-slate-400'}`}>
                        {item.descAr}
                      </div>
                    </div>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        <main className="lg:col-span-9 space-y-6">
          {/* 1. CLIENTS */}
          {activeTab === 'clients' && (
            <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-black text-[#004457] dark:text-white">
                {isAr ? 'حسابات العملاء والمستأجرين المسجلين' : 'Registered Customer Accounts & Tenants'}
              </h2>
              {isConnected ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-900 font-bold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="p-3">{isAr ? 'العميل' : 'Client'}</th>
                        <th className="p-3">{isAr ? 'الشركة / المستأجر' : 'Legal Entity / Tenant'}</th>
                        <th className="p-3">{isAr ? 'البريد مؤكد؟' : 'Verified'}</th>
                        <th className="p-3">{isAr ? 'الرصيد' : 'Credits'}</th>
                        <th className="p-3">{isAr ? 'الحالة' : 'Status'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {clientsList.map(c => (
                        <tr key={String(c.id)}>
                          <td className="p-3">
                            <div className="font-black text-[#004457] dark:text-white">{String(c.name)}</div>
                            <div className="font-mono text-[11px] text-slate-500">{String(c.email)}</div>
                          </td>
                          <td className="p-3">
                            <div>{String(c.company_legal_name || '-')}</div>
                            <div className="font-mono text-[10px] text-slate-400">{String(c.tenant_id)}</div>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${c.email_verified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                              {c.email_verified ? (isAr ? 'مؤكد ✓' : 'Verified') : isAr ? 'معلق' : 'Pending'}
                            </span>
                          </td>
                          <td className="p-3 font-black text-[#00A896]">{Number(c.credits_balance || 0)}</td>
                          <td className="p-3 font-bold">{String(c.status || 'active')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="space-y-2 text-xs text-slate-500">
                  {stores.map(st => (
                    <div key={st.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                      {st.ownerName} ({st.ownerEmail}) — {st.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2. STAFF & RBAC */}
          {activeTab === 'staff' && (
            <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
              <div>
                <h2 className="text-lg font-black text-[#004457] dark:text-white">
                  {isAr ? 'إدارة الموظفين وصلاحيات RBAC' : 'Staff Management & RBAC Roles'}
                </h2>
                <p className="text-xs text-slate-500">
                  {isAr
                    ? 'إنشاء وتعديل أدوار الموظفين مقصور على Admin و Super Admin.'
                    : 'Creating or updating staff accounts is restricted to Admin and Super Admin.'}
                </p>
              </div>

              <form
                onSubmit={async e => {
                  e.preventDefault();
                  const ok = await adminCreateStaffUser({
                    name: newStaffName.trim(),
                    email: newStaffEmail.trim(),
                    password: newStaffPassword,
                    role: newStaffRole
                  });
                  if (ok) {
                    setNewStaffName('');
                    setNewStaffEmail('');
                  }
                }}
                className="grid grid-cols-1 sm:grid-cols-5 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
              >
                <input
                  type="text"
                  required
                  value={newStaffName}
                  onChange={e => setNewStaffName(e.target.value)}
                  placeholder={isAr ? 'الاسم *' : 'Name *'}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs"
                />
                <input
                  type="email"
                  required
                  value={newStaffEmail}
                  onChange={e => setNewStaffEmail(e.target.value)}
                  placeholder="staff@qabs1.store"
                  className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs"
                />
                <input
                  type="password"
                  required
                  value={newStaffPassword}
                  onChange={e => setNewStaffPassword(e.target.value)}
                  placeholder="Password (8+)"
                  className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs"
                />
                <select
                  value={newStaffRole}
                  onChange={e => setNewStaffRole(e.target.value as 'staff' | 'support' | 'admin')}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs font-bold"
                >
                  <option value="staff">Staff</option>
                  <option value="support">Support</option>
                  <option value="admin">Admin</option>
                </select>
                <button
                  type="submit"
                  className="rounded-xl bg-[#004457] text-white text-xs font-black py-2 px-4 cursor-pointer flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAr ? 'إضافة موظف' : 'Add Staff'}</span>
                </button>
              </form>

              <div className="space-y-2.5">
                {staffList.map(st => (
                  <div
                    key={String(st.id)}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-black text-[#004457] dark:text-white">{String(st.name)}</div>
                      <div className="font-mono text-[11px] text-slate-500">{String(st.email)}</div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full bg-teal-50 text-[#004457] font-mono font-black text-[11px]">
                        {String(st.role)}
                      </span>
                      {String(st.role) !== 'super_admin' && (
                        <>
                          <select
                            aria-label={`Role for ${String(st.email)}`}
                            value={String(st.role)}
                            onChange={e => void adminUpdateStaffUser(String(st.id), { role: e.target.value })}
                            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-[11px] font-bold"
                          >
                            <option value="staff">staff</option>
                            <option value="support">support</option>
                            <option value="admin">admin</option>
                          </select>
                          <button
                            type="button"
                            onClick={() =>
                              void adminUpdateStaffUser(String(st.id), {
                                status: st.status === 'suspended' ? 'active' : 'suspended'
                              })
                            }
                            className={`px-3 py-1 rounded-lg font-bold text-[11px] cursor-pointer ${
                              st.status === 'suspended'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {st.status === 'suspended' ? (isAr ? 'إعادة تفعيل' : 'Activate') : isAr ? 'تعليق' : 'Suspend'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. SERVICES CATALOG */}
          {activeTab === 'services' && (
            <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-black text-[#004457] dark:text-white">
                {isAr ? 'كتالوج خدمات قبس والأسعار المعتمدة' : 'QABS Services Catalog & Pricing'}
              </h2>
              <div className="space-y-2.5">
                {servicesList.map(svc => {
                  const slug = String(svc.slug);
                  const currentPrice = String(svc.starting_price_usd ?? 0);
                  return (
                    <div
                      key={slug}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-black text-[#004457] dark:text-white">
                          {isAr ? String(svc.title_ar) : String(svc.title_en)}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">
                          /services/{slug} • {String(svc.category)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={servicePrices[slug] ?? currentPrice}
                          onChange={e => setServicePrices({ ...servicePrices, [slug]: e.target.value })}
                          className="w-24 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 font-mono font-bold"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            void adminUpdateServiceCatalog(slug, {
                              startingPriceUsd: Number(servicePrices[slug] ?? currentPrice)
                            })
                          }
                          className="px-3 py-1.5 rounded-lg bg-[#004457] text-white font-bold cursor-pointer"
                        >
                          {isAr ? 'حفظ السعر' : 'Save Price'}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            void adminUpdateServiceCatalog(slug, { active: !Boolean(svc.active) })
                          }
                          className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer ${
                            svc.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {svc.active ? (isAr ? 'مفعل' : 'Active') : isAr ? 'معطل' : 'Disabled'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. SERVICE REQUESTS (8-STATUS LIFECYCLE) */}
          {activeTab === 'service_requests' && (
            <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
              <div>
                <h2 className="text-lg font-black text-[#004457] dark:text-white">
                  {isAr ? 'إدارة طلبات الخدمات (دورة 8 حالات)' : 'Service Requests Queue (8-Status Lifecycle)'}
                </h2>
                <p className="text-xs text-slate-500">
                  {isAr
                    ? 'تحديث حالة الطلب يُرسل إشعاراً تلقائياً لحساب العميل ويُوثق في سجل التدقيق.'
                    : 'Status updates automatically notify the customer tenant and log to the security audit trail.'}
                </p>
              </div>
              <div className="space-y-3">
                {(isConnected ? requestsList : submittedServiceOrders).map((rawReq: any) => {
                  const id = String(rawReq.id);
                  const refCode = String(rawReq.reference_code || rawReq.referenceCode);
                  const title = isAr
                    ? String(rawReq.service_title_ar || rawReq.serviceTitleAr)
                    : String(rawReq.service_title_en || rawReq.serviceTitleEn);
                  const status = String(rawReq.status) as ServiceOrderStatus;
                  const custName = String(rawReq.customer_name || rawReq.customerName);
                  const custEmail = String(rawReq.customer_email || rawReq.customerEmail);
                  const existingNote = String(rawReq.admin_notes || rawReq.adminNotes || '');
                  const price = Number(rawReq.price_usd ?? rawReq.priceUsd ?? 0);

                  return (
                    <div
                      key={id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 space-y-3 text-xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-black text-[#004457] dark:text-[#E5C158]">{refCode}</span>
                          <span className="font-black">{title}</span>
                          <span className="text-slate-500">
                            • {custName} ({custEmail})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {price > 0 && <span className="font-black text-[#00A896]">${price}</span>}
                          <span className="px-2.5 py-0.5 rounded-full bg-[#004457] text-white font-bold text-[10px]">
                            {status}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={requestAdminNotes[id] ?? existingNote}
                          onChange={e => setRequestAdminNotes({ ...requestAdminNotes, [id]: e.target.value })}
                          placeholder={isAr ? 'ملاحظات المراجع للعميل...' : 'Admin review notes for client...'}
                          className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs"
                        />
                        <select
                          aria-label={`Status for ${refCode}`}
                          value={status}
                          onChange={e =>
                            void updateServiceOrderStatus(
                              id,
                              e.target.value as ServiceOrderStatus,
                              requestAdminNotes[id] ?? existingNote
                            )
                          }
                          className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs font-bold"
                        >
                          {REQUEST_STATUSES.map(st => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() =>
                            void updateServiceOrderStatus(id, status, requestAdminNotes[id] ?? existingNote)
                          }
                          className="px-4 py-2 rounded-xl bg-[#004457] text-white font-black cursor-pointer"
                        >
                          {isAr ? 'حفظ التحديث' : 'Save Update'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. FORMATIONS */}
          {activeTab === 'formations' && (
            <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-black text-[#004457] dark:text-white">
                {isAr ? 'ملفات تأسيس الشركات الدولية' : 'International Company Formations'}
              </h2>
              <div className="space-y-3">
                {(isConnected ? formationsList : companies).map((c: any) => (
                  <div
                    key={String(c.id)}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-black text-[#004457] dark:text-white">
                        {String(c.company_name || c.companyName)} — {String(c.jurisdiction)}
                      </div>
                      <div className="text-slate-500">
                        {String(c.entity_type || c.entityType)} • EIN: {String(c.ein || 'Pending')} • Tenant: {String(c.tenant_id || '-')}
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-teal-50 text-[#004457] font-black self-start">
                      {String(c.status)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. DOCUMENTS VAULT */}
          {activeTab === 'documents' && (
            <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-black text-[#004457] dark:text-white">
                {isAr ? 'خزينة المستندات المرفوعة (وصول خاص مخول)' : 'Private Uploaded Documents Vault'}
              </h2>
              {documentsList.length === 0 ? (
                <p className="text-xs text-slate-500">{isAr ? 'لا توجد مستندات مرفوعة حالياً.' : 'No documents uploaded yet.'}</p>
              ) : (
                <div className="space-y-2.5">
                  {documentsList.map(doc => (
                    <div
                      key={String(doc.id)}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="font-black text-[#004457] dark:text-white">{String(doc.document_name)}</div>
                        <div className="font-mono text-[11px] text-slate-500 truncate">
                          {String(doc.mime_type)} • {Math.max(1, Math.round(Number(doc.size_bytes || 0) / 1024))} KB • SHA256: {String(doc.sha256_hash || '').slice(0, 14)}…
                        </div>
                      </div>
                      <a
                        href={qabsApi.getDocumentDownloadUrl(String(doc.id))}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-[#004457] text-white font-bold flex items-center gap-1.5 self-start shrink-0"
                      >
                        <Download className="w-3.5 h-3.5 text-[#E5C158]" />
                        <span>{isAr ? 'تنزيل آمن' : 'Authorized Download'}</span>
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 7. STORES & APPROVALS */}
          {activeTab === 'stores' && (
            <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
              <div>
                <h2 className="text-lg font-black text-[#004457] dark:text-white">
                  {isAr ? 'المتاجر المستقلة وبوابة الاعتماد والنطاقات' : 'Independent Stores, Approvals & Domains'}
                </h2>
                <p className="text-xs text-slate-500">
                  {isAr
                    ? 'قاعدة حاكمة: يظل أي متجر جديد كمسودة حتى توافق الإدارة هنا.'
                    : 'No client store is published publicly without explicit approval here.'}
                </p>
              </div>
              <div className="space-y-4">
                {(isConnected ? storesList : stores).map((rawSt: any) => {
                  const id = String(rawSt.id);
                  const name = String(rawSt.name);
                  const subdomain = String(rawSt.subdomain);
                  const approvalStatus = String(rawSt.approval_status || rawSt.approvalStatus || 'draft');
                  const domainStatus = String(rawSt.domain_status || (rawSt.domainVerified ? 'verified_active' : 'pending_verification'));
                  const customDomain = String(rawSt.custom_domain || rawSt.customDomain || '');

                  return (
                    <div
                      key={id}
                      className="p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3 text-xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="text-sm font-black text-[#004457] dark:text-white">
                            {name} <span className="font-mono text-xs text-[#00A896]">({subdomain})</span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {customDomain ? `Custom Domain: ${customDomain} (${domainStatus})` : `Tenant: ${String(rawSt.tenant_id || '-')}`}
                          </div>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-teal-50 text-[#004457] font-black">
                          {approvalStatus}
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={feedbackNotes[id] || ''}
                          onChange={e => setFeedbackNotes({ ...feedbackNotes, [id]: e.target.value })}
                          placeholder={isAr ? 'ملاحظات المراجعة أو التعديلات المطلوبة...' : 'Review notes...'}
                          className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => void reviewStoreApproval(id, 'approved_published', feedbackNotes[id])}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-black flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isAr ? 'قبول ونشر' : 'Approve'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            void reviewStoreApproval(
                              id,
                              'changes_requested',
                              feedbackNotes[id] || 'يرجى استكمال سياسة الاسترجاع'
                            )
                          }
                          className="px-3.5 py-2 rounded-xl bg-amber-500 text-white font-black flex items-center gap-1 cursor-pointer"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{isAr ? 'طلب تعديل' : 'Changes'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            void reviewStoreApproval(id, 'rejected', feedbackNotes[id] || 'مرفوض من الإدارة')
                          }
                          className="px-3.5 py-2 rounded-xl bg-rose-600 text-white font-black flex items-center gap-1 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{isAr ? 'رفض' : 'Reject'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => void verifyStoreDomain(id)}
                          className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-[#004457] font-bold cursor-pointer"
                        >
                          {isAr ? 'توثيق النطاق' : 'Verify Domain'}
                        </button>
                        <button
                          type="button"
                          onClick={() => void approveStorePayment(id, true)}
                          className="px-3 py-2 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 font-bold cursor-pointer"
                        >
                          {isAr ? 'اعتماد الدفع (Sandbox)' : 'Verify Gateway'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveStoreId(id);
                            setMode('portal');
                          }}
                          className="px-3 py-2 rounded-xl bg-[#004457] text-white font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{isAr ? 'فتح' : 'Open'}</span>
                        </button>
                      </div>
                      <div className="text-[11px] text-slate-500 flex flex-wrap gap-3">
                        <span>
                          {isAr ? 'بوابة الدفع:' : 'Gateway:'}{' '}
                          <strong className="font-mono text-[#004457] dark:text-[#E5C158]">
                            {String(rawSt.gateway_type || rawSt.gatewayType || 'Tap')}
                          </strong>
                        </span>
                        <span>
                          {isAr ? 'حالة التحصيل:' : 'Payment Status:'}{' '}
                          <strong className="font-mono">
                            {String(rawSt.payment_approval_status || rawSt.paymentApprovalStatus || 'unconfigured')}
                          </strong>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 8. PRODUCTS */}
          {activeTab === 'products' && (
            <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-black text-[#004457] dark:text-white">
                {isAr ? 'جميع منتجات المتاجر المسجلة' : 'All Tenant Store Products'}
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900 font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3">{isAr ? 'المنتج' : 'Product'}</th>
                      <th className="p-3">SKU</th>
                      <th className="p-3">{isAr ? 'المتجر' : 'Store ID'}</th>
                      <th className="p-3">{isAr ? 'السعر' : 'Price'}</th>
                      <th className="p-3">{isAr ? 'المخزون' : 'Stock'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(isConnected ? productsList : products).map((p: any) => (
                      <tr key={String(p.id)}>
                        <td className="p-3 font-bold">{String(p.title_ar || p.nameAr || p.titleAr)}</td>
                        <td className="p-3 font-mono">{String(p.sku)}</td>
                        <td className="p-3 font-mono text-[11px]">{String(p.store_id || p.storeId)}</td>
                        <td className="p-3 font-black">{Number(p.retail_price ?? p.price)}</td>
                        <td className="p-3">{Number(p.stock_quantity ?? p.stock)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 9. SUBSCRIPTIONS */}
          {activeTab === 'subscriptions' && (
            <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
              <h2 className="text-lg font-black text-[#004457] dark:text-white">
                {isAr ? 'باقات واشتراكات المستأجرين' : 'Tenant Subscriptions & Tiers'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {SUBSCRIPTION_PLANS.map(pl => (
                  <div key={pl.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="text-sm font-black text-[#004457] dark:text-white">
                      {isAr ? pl.nameAr : pl.nameEn}
                    </div>
                    <div className="text-xl font-black text-[#00A896]">${pl.priceMonthly}/mo</div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {subscriptionsList.map(sub => (
                  <div
                    key={String(sub.id)}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 flex flex-wrap items-center justify-between text-xs gap-2"
                  >
                    <span className="font-mono font-bold">{String(sub.tenant_id)}</span>
                    <span className="font-black text-[#004457] dark:text-white">
                      {String(sub.plan_tier)} ({String(sub.billing_cycle)})
                    </span>
                    <span className="font-bold text-emerald-700">${Number(sub.current_price)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 10. INVOICES & PROOF VERIFICATION */}
          {activeTab === 'invoices' && (
            <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
              <div>
                <h2 className="text-lg font-black text-[#004457] dark:text-white">
                  {isAr ? 'الفواتير والتحقق اليدوي من مراجع السداد' : 'Invoices & Payment Proof Verification'}
                </h2>
                <p className="text-xs text-slate-500">
                  {isAr
                    ? 'يُمنع تحويل أي فاتورة إلى مدفوعة أو إضافة أرصدة إلا بإدخال مرجع سداد موثق من Admin أو Super Admin.'
                    : 'Invoices remain pending_verification until verified by Admin/Super Admin with a payment proof reference.'}
                </p>
              </div>
              <div className="space-y-3">
                {(isConnected ? invoicesList : invoices).map((rawInv: any) => {
                  const id = String(rawInv.id);
                  const invNum = String(rawInv.invoice_number || rawInv.invoiceNumber);
                  const amount = Number(rawInv.amount);
                  const status = String(rawInv.status);
                  const desc = isAr
                    ? String(rawInv.description_ar || rawInv.descriptionAr)
                    : String(rawInv.description_en || rawInv.descriptionEn);
                  const existingProof = String(rawInv.payment_proof_ref || rawInv.paymentProofRef || '');

                  return (
                    <div
                      key={id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-black text-[#004457] dark:text-white">
                          <span className="font-mono">{invNum}</span> — ${amount} — {status}
                        </div>
                        <div className="text-[11px] text-slate-500">{desc}</div>
                        {existingProof && (
                          <div className="text-[11px] font-mono text-emerald-700">Proof Ref: {existingProof}</div>
                        )}
                      </div>

                      {status !== 'paid' && (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={proofRefs[id] || ''}
                            onChange={e => setProofRefs({ ...proofRefs, [id]: e.target.value })}
                            placeholder={isAr ? 'مرجع السداد (مثل: WIRE-9921)' : 'Payment Proof Ref *'}
                            className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => void verifyInvoiceWithProof(id, proofRefs[id] || '')}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-black cursor-pointer shrink-0"
                          >
                            {isAr ? 'اعتماد الدفع' : 'Verify Proof'}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 11. NOTIFICATIONS BROADCAST */}
          {activeTab === 'notifications' && (
            <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
              <h2 className="text-lg font-black text-[#004457] dark:text-white">
                {isAr ? 'مركز بث الإشعارات للعملاء' : 'Client Notification Broadcast'}
              </h2>
              <form
                onSubmit={async e => {
                  e.preventDefault();
                  const ok = await adminSendBroadcastNotification({
                    tenantId: notifTenantId.trim() || undefined,
                    titleAr: notifTitleAr.trim(),
                    titleEn: notifTitleAr.trim(),
                    bodyAr: notifBodyAr.trim(),
                    bodyEn: notifBodyAr.trim()
                  });
                  if (ok) {
                    setNotifTitleAr('');
                    setNotifBodyAr('');
                  }
                }}
                className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    value={notifTenantId}
                    onChange={e => setNotifTenantId(e.target.value)}
                    className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 font-bold"
                  >
                    <option value="">{isAr ? 'إرسال جماعي لكل العملاء' : 'Broadcast to All Customers'}</option>
                    {clientsList.map(c => (
                      <option key={String(c.tenant_id)} value={String(c.tenant_id)}>
                        {String(c.name)} ({String(c.email)})
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    required
                    value={notifTitleAr}
                    onChange={e => setNotifTitleAr(e.target.value)}
                    placeholder={isAr ? 'عنوان الإشعار *' : 'Notification title *'}
                    className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2"
                  />
                </div>
                <textarea
                  rows={2}
                  required
                  value={notifBodyAr}
                  onChange={e => setNotifBodyAr(e.target.value)}
                  placeholder={isAr ? 'نص الإشعار للعملاء...' : 'Notification message...'}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#004457] text-white font-black flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isAr ? 'إرسال الإشعار الآن' : 'Send Notification'}</span>
                </button>
              </form>

              <div className="space-y-2">
                {notificationsList.slice(0, 15).map(n => (
                  <div key={String(n.id)} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs flex justify-between gap-2">
                    <div>
                      <div className="font-black">{String(n.title_ar)}</div>
                      <div className="text-slate-500">{String(n.body_ar)}</div>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400 shrink-0">{String(n.tenant_id)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 12. AUDIT LOGS */}
          {activeTab === 'audit_logs' && (
            <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-[#004457] dark:text-white">
                  {isAr ? 'سجل التدقيق الأمني المركزي' : 'Central Security Audit Trail'}
                </h2>
              </div>
              <div className="space-y-2.5">
                {(isConnected ? auditLogsList : auditLogs).map((log: any) => (
                  <div
                    key={String(log.id)}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs gap-2"
                  >
                    <div>
                      <div className="font-bold text-[#004457] dark:text-white">
                        {isAr ? String(log.action_ar || log.actionAr) : String(log.action_en || log.actionEn)}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {String(log.actor_name || log.actor)} •{' '}
                        <span className="font-mono">{String(log.target_ref || log.target || '-')}</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 shrink-0">
                      {String(log.created_at || log.timestamp)}
                    </span>
                  </div>
                ))}
              </div>

              {isConnected && (
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="font-black text-[#004457] dark:text-white">
                      {isAr ? `النسخ الاحتياطية على الخادم (${backupsList.length})` : `Server Workspace Backups (${backupsList.length})`}
                    </div>
                    {backupsList.length === 0 ? (
                      <p className="text-slate-400">{isAr ? 'لا توجد لقطات نسخ احتياطي بعد.' : 'No backup snapshots yet.'}</p>
                    ) : (
                      backupsList.slice(0, 5).map(bak => (
                        <div key={String(bak.id)} className="flex justify-between font-mono text-[11px]">
                          <span>{String(bak.label)}</span>
                          <span className="text-slate-400">{Math.max(1, Math.round(Number(bak.size_bytes || 0) / 1024))} KB</span>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="font-black text-[#004457] dark:text-white">
                      {isAr ? `سجل أعطال الخادم (${errorLogsList.length})` : `System Error Telemetry (${errorLogsList.length})`}
                    </div>
                    {errorLogsList.length === 0 ? (
                      <p className="text-emerald-600 font-bold">
                        {isAr ? 'لا توجد أعطال 500 مسجلة ✓' : 'Zero unhandled 500 errors logged ✓'}
                      </p>
                    ) : (
                      errorLogsList.slice(0, 5).map(err => (
                        <div key={String(err.id)} className="font-mono text-[11px] text-rose-600">
                          {String(err.method)} {String(err.route)} — {String(err.message)}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 13. PLATFORM SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5 text-xs">
              <h2 className="text-lg font-black text-[#004457] dark:text-white">
                {isAr ? 'إعدادات الحوكمة والأمان العامة' : 'Global Governance & Safety Settings'}
              </h2>
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 space-y-1">
                <div className="font-black">
                  {isAr
                    ? 'قفل الأمان المالي مفعّل (paymentsEnabled = false | autoPublishStores = false)'
                    : 'Financial Safety Gate Enforced (paymentsEnabled = false | autoPublishStores = false)'}
                </div>
                <p>
                  {isAr
                    ? 'تُمنع جميع عمليات تحصيل البطاقات المباشرة أو تعديل DNS الخارجي أو نشر المتاجر تلقائياً عبر الواجهة البرمجية في بيئة المعاينة.'
                    : 'Live card charging, external DNS/Shopify mutations, and automatic store publishing remain disabled by policy.'}
                </p>
              </div>
              {integrationsStatus && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                    <div className="font-black text-[#004457] dark:text-white">
                      {isAr ? 'خدمة البريد (Email)' : 'Email Dispatch'}
                    </div>
                    <div className="font-mono text-[11px] text-slate-500 mt-1">
                      {integrationsStatus.integrations.email?.configured
                        ? 'Resend API Ready'
                        : 'Preview Token Channel'}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                    <div className="font-black text-[#004457] dark:text-white">
                      Cloudflare Workers / D1 / R2
                    </div>
                    <div className="font-mono text-[11px] text-slate-500 mt-1">
                      {integrationsStatus.integrations.cloudflare.workersReady ? 'wrangler.toml Parity ✓' : 'Pending'} •{' '}
                      {integrationsStatus.integrations.cloudflare.dnsLocked ? 'DNS Locked' : 'Unlocked'}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                    <div className="font-black text-[#004457] dark:text-white">
                      {isAr ? 'بوابات الخليج (Tap / Moyasar)' : 'GCC Gateways (Tap / Moyasar)'}
                    </div>
                    <div className="font-mono text-[11px] text-slate-500 mt-1">
                      {integrationsStatus.integrations.tap.mode} • {integrationsStatus.integrations.gemini.configured ? 'Gemini AI Live' : 'Gemini Preview Fallback'}
                    </div>
                  </div>
                </div>
              )}
              <form
                onSubmit={e => {
                  e.preventDefault();
                  void adminUpdatePlatformSettings({
                    supportEmail: supportEmailDraft.trim(),
                    previewNotice: previewBannerDraft.trim()
                  });
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block font-bold mb-1">{isAr ? 'بريد الدعم الرسمي' : 'Official Support Email'}</label>
                  <input
                    type="email"
                    value={supportEmailDraft}
                    onChange={e => setSupportEmailDraft(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">{isAr ? 'رسالة إشعار المعاينة' : 'Preview Governance Notice'}</label>
                  <input
                    type="text"
                    value={previewBannerDraft}
                    onChange={e => setPreviewBannerDraft(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#004457] text-white font-black cursor-pointer"
                >
                  {isAr ? 'حفظ إعدادات المنصة ✓' : 'Save Platform Settings ✓'}
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
