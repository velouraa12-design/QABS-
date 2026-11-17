import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Language,
  AppMode,
  UserProfile,
  CompanyFormation,
  StoreInstance,
  StoreProduct,
  StoreOrder,
  BankingAccount,
  SupportTicket,
  StaffMember,
  AuditLogItem,
  UserRole,
  UserSubscription,
  Invoice,
  CommissionRecord,
  RefundRecord,
  StoreCustomer,
  StoreDiscount,
  StoreShippingZone,
  StorePageItem,
  StoreAppAddon,
  StoreTemplatePreset,
  StoreSectionBlock,
  AICommandHistoryItem,
  WorkspaceSectionSettings,
  PendingServiceOrder,
  BackendStatus,
  NotificationItem,
  CreditLedgerItem,
  SubscriptionHistoryItem,
  RequestDocumentMeta,
  StoreCategoryItem,
  StoreTeamMemberItem
} from '../types/index.ts';
import { ServiceOrderStatus, SubmittedServiceOrder } from '../types/pages.ts';
import {
  OWNER_USER_PROFILE,
  INITIAL_USER,
  INITIAL_COMPANIES,
  INITIAL_STORES,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_BANKING,
  INITIAL_TICKETS,
  INITIAL_STAFF,
  INITIAL_AUDIT_LOGS,
  INITIAL_USER_SUBSCRIPTION,
  INITIAL_INVOICES,
  INITIAL_COMMISSIONS,
  INITIAL_REFUNDS,
  SUBSCRIPTION_PLANS,
  INITIAL_CUSTOMERS,
  INITIAL_DISCOUNTS,
  INITIAL_SHIPPING_ZONES,
  INITIAL_STORE_PAGES,
  INITIAL_STORE_APPS,
  INITIAL_STORE_TEMPLATES,
  DEFAULT_STORE_SECTIONS
} from '../data/mockData.ts';
import { AdminOverviewResponse, ApiError, BootstrapResponse, IntegrationsStatusResponse, qabsApi } from '../services/qabsApi.ts';
import {
  mapApiUserToProfile,
  mapDbAuditLog,
  mapDbCategory,
  mapDbCompany,
  mapDbCreditLedger,
  mapDbCustomer,
  mapDbDocument,
  mapDbInvoice,
  mapDbNotification,
  mapDbOrder,
  mapDbProduct,
  mapDbServiceRequest,
  mapDbStore,
  mapDbStoreTeamMember,
  mapDbSubscription,
  mapDbSubscriptionHistory,
  mapDbTicket
} from '../services/qabsMappers.ts';

const PRIVILEGED_ROLES = new Set<UserRole>(['super_admin', 'admin', 'staff', 'support']);

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  backendStatus: BackendStatus;
  authError: string | null;
  setAuthError: (msg: string | null) => void;
  authLoading: boolean;
  previewVerifyToken: string | null;
  previewResetToken: string | null;
  refreshWorkspace: () => Promise<void>;

  user: UserProfile;
  switchRole: (role: UserRole) => void;
  companies: CompanyFormation[];
  addCompany: (comp: Omit<CompanyFormation, 'id' | 'filingDate' | 'status' | 'documents'>) => void;
  updateCompanyStatus: (id: string, status: CompanyFormation['status']) => void;
  advanceCompanyStage: (id: string, nextStage?: 1 | 2 | 3 | 4 | 5) => void;

  // QABS Stores Multi-Tenant Core
  stores: StoreInstance[];
  activeStoreId: string;
  setActiveStoreId: (id: string) => void;
  addStore: (store: Omit<StoreInstance, 'id' | 'productsCount' | 'ordersCount' | 'totalRevenue' | 'createdAt'>) => void;
  updateStoreTheme: (id: string, theme: StoreInstance['theme'], customDomain?: string) => void;
  updateStoreDetails: (id: string, updates: Partial<StoreInstance>) => void;
  submitStoreForApproval: (storeId: string) => void;
  reviewStoreApproval: (
    storeId: string,
    decision: 'approved_published' | 'changes_requested' | 'rejected',
    feedback?: string
  ) => void;
  requestPaymentActivation: (
    storeId: string,
    gatewayType: StoreInstance['gatewayType'],
    sandboxConfig?: {
      madaEnabled?: boolean;
      applePayEnabled?: boolean;
      sadadEnabled?: boolean;
      stcPayEnabled?: boolean;
      merchantReference?: string;
    }
  ) => void;
  approveStorePayment: (storeId: string, approved: boolean) => void;
  requestDomainVerification: (storeId: string, customDomain: string) => void;
  verifyStoreDomain: (storeId: string) => void;
  saveStoreSnapshot: (storeId: string, label: string) => void;
  restoreStoreSnapshot: (storeId: string, snapshotId: string) => void;
  updateStoreSections: (storeId: string, sections: StoreSectionBlock[]) => void;

  // Isolated Store Commerce Entities
  storeCategories: StoreCategoryItem[];
  addStoreCategory: (storeId: string, nameAr: string, nameEn?: string) => Promise<void>;
  storeTeamMembers: StoreTeamMemberItem[];
  addStoreTeamMember: (
    storeId: string,
    input: { name: string; email: string; role: 'admin' | 'staff' | 'support'; permissions?: string[] }
  ) => Promise<void>;
  products: StoreProduct[];
  addProduct: (product: Omit<StoreProduct, 'id' | 'salesCount' | 'storeId'> & { storeId?: string }) => void;
  updateProduct: (id: string, updates: Partial<StoreProduct>) => void;
  deleteProduct: (id: string) => void;
  orders: StoreOrder[];
  addOrder: (order: Omit<StoreOrder, 'id' | 'orderNumber' | 'date'>) => void;
  updateOrderStatus: (id: string, status: StoreOrder['status'], trackingNumber?: string) => void;
  customers: StoreCustomer[];
  addCustomer: (customer: Omit<StoreCustomer, 'id' | 'ordersCount' | 'totalSpent' | 'lastOrderDate'>) => void;
  discounts: StoreDiscount[];
  addDiscount: (discount: Omit<StoreDiscount, 'id' | 'usedCount'>) => void;
  toggleDiscountStatus: (id: string) => void;
  shippingZones: StoreShippingZone[];
  addShippingZone: (zone: Omit<StoreShippingZone, 'id'>) => void;
  storePages: StorePageItem[];
  saveStorePage: (page: Omit<StorePageItem, 'id' | 'updatedAt'> & { id?: string }) => void;
  deleteStorePage: (id: string) => void;
  storeApps: StoreAppAddon[];
  toggleStoreApp: (appId: string, storeId: string) => void;
  storeTemplates: StoreTemplatePreset[];
  addStoreTemplate: (tpl: Omit<StoreTemplatePreset, 'id'>) => void;
  triggerSystemBackup: (targetLabel?: string) => void;

  // Support, Staff, Audit, Notifications & Subscriptions
  banking: BankingAccount[];
  addBankAccount: (bank: Omit<BankingAccount, 'id' | 'balance' | 'status'>) => void;
  tickets: SupportTicket[];
  addTicket: (t: Omit<SupportTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'status'>) => void;
  resolveTicket: (id: string) => void;
  staff: StaffMember[];
  addStaff: (s: Omit<StaffMember, 'id' | 'lastActive' | 'status'>) => void;
  updateStaffPermissions: (staffId: string, permissions: string[]) => void;
  removeStaff: (staffId: string) => void;
  auditLogs: AuditLogItem[];
  notifications: NotificationItem[];
  unreadNotificationsCount: number;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  requestDocuments: RequestDocumentMeta[];
  uploadRequestDocument: (input: {
    name: string;
    type?: string;
    mimeType: string;
    base64: string;
    requestId?: string;
    formationId?: string;
  }) => Promise<RequestDocumentMeta | null>;

  subscription: UserSubscription;
  subscriptionHistory: SubscriptionHistoryItem[];
  creditLedger: CreditLedgerItem[];
  changeSubscriptionPlan: (planId: 'starter' | 'growth' | 'enterprise', cycle: 'monthly' | 'annual') => void;
  invoices: Invoice[];
  verifyInvoiceWithProof: (invoiceId: string, paymentProofRef: string) => Promise<boolean>;
  commissions: CommissionRecord[];
  refunds: RefundRecord[];
  issueRefund: (orderNumber: string, amount: number, reasonAr: string, reasonEn: string) => void;
  topUpCredits: (amount: number) => void;
  issueOrderInvoice: (orderId: string) => Invoice | null;

  syncShopifyStore: (storeId: string, domain: string, accessToken: string, webhooksConnected: boolean) => void;
  toggleSetupStep: (storeId: string, stepId: string) => void;
  addCompanyDocument: (companyId: string, name: string, docType: CompanyFormation['documents'][number]['type']) => void;
  isProductionMode: boolean;
  activateProductionMode: (storeId?: string) => void;
  toggleProductionMode: () => void;
  aiHistory: AICommandHistoryItem[];
  executeAICommand: (prompt: string, storeId: string) => AICommandHistoryItem;
  sectionSettings: WorkspaceSectionSettings;
  updateSectionSettings: <K extends keyof WorkspaceSectionSettings>(
    section: K,
    updates: Partial<WorkspaceSectionSettings[K]>
  ) => void;
  exportWorkspaceBackupJson: () => string;
  importWorkspaceBackupJson: (jsonText: string) => boolean;
  resetWorkspaceData: () => void;

  // Admin Governance Overview (connected backend)
  adminOverview: AdminOverviewResponse | null;
  integrationsStatus: IntegrationsStatusResponse | null;
  adminCreateStaffUser: (input: { name: string; email: string; password: string; role: string }) => Promise<boolean>;
  adminUpdateStaffUser: (userId: string, input: { role?: string; status?: 'active' | 'suspended' }) => Promise<boolean>;
  adminUpdateServiceCatalog: (slug: string, input: { startingPriceUsd?: number; active?: boolean }) => Promise<boolean>;
  adminSendBroadcastNotification: (input: {
    tenantId?: string;
    titleAr: string;
    titleEn?: string;
    bodyAr: string;
    bodyEn?: string;
  }) => Promise<boolean>;
  adminUpdatePlatformSettings: (settings: Record<string, unknown>) => Promise<boolean>;

  // Auth & Service Order Gate state
  isAuthenticated: boolean;
  isOwner: boolean;
  authIntent: 'client' | 'owner';
  setAuthIntent: (intent: 'client' | 'owner') => void;
  openClientAuth: (initialMode?: 'login' | 'register') => void;
  openOwnerAuth: () => void;
  pendingServiceOrder: PendingServiceOrder | null;
  setPendingServiceOrder: (order: PendingServiceOrder | null) => void;
  checkoutModalOpen: boolean;
  setCheckoutModalOpen: (open: boolean) => void;
  requestServiceAction: (order: PendingServiceOrder) => void;
  completeServiceCheckout: (paymentMethod: 'Tap' | 'Moyasar' | 'Stripe' | 'PayPal' | 'Crypto' | 'BankTransfer') => void;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authMode: 'login' | 'register' | 'recover';
  setAuthMode: (mode: 'login' | 'register' | 'recover') => void;
  login: (email: string, role: UserRole, password?: string) => Promise<boolean>;
  loginOwner: (email?: string, password?: string) => Promise<boolean>;
  register: (
    name: string,
    email: string,
    companyName: string,
    role?: UserRole,
    password?: string
  ) => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<string | null>;
  confirmPasswordReset: (token: string, newPassword: string) => Promise<boolean>;
  confirmEmailVerification: (token: string) => Promise<boolean>;
  logout: () => Promise<void>;
  submittedServiceOrders: SubmittedServiceOrder[];
  submitServiceOrder: (
    order: Omit<SubmittedServiceOrder, 'id' | 'referenceCode' | 'status' | 'createdAt'> & {
      status?: 'draft' | 'new';
      document?: { name: string; mimeType: string; base64: string; type?: string };
    }
  ) => Promise<SubmittedServiceOrder>;
  updateServiceOrderStatus: (id: string, status: ServiceOrderStatus, adminNotes?: string) => Promise<boolean>;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const STORAGE_KEY = 'qabs_workspace_state_v1';

export const DEFAULT_SECTION_SETTINGS: WorkspaceSectionSettings = {
  overview: {
    showKpiCards: true,
    defaultCurrency: 'SAR',
    showPreviewBanner: true,
    showSetupChecklist: true
  },
  orders: {
    orderPrefix: 'QBS-',
    autoDeductInventory: true,
    defaultCarrier: 'DHL Express / SMSA',
    defaultShippingRate: 25,
    enabledStatuses: ['paid', 'processing', 'shipped', 'delivered', 'refunded']
  },
  documents: {
    officialTemplateStyle: 'executive_gold',
    companyStampText: 'معتمد رسمياً — منصة قبس الرقمية QABS',
    logoDataUrl: '',
    stampDataUrl: '',
    allowedExportFormats: ['PDF', 'JSON', 'CSV'],
    autoArchiveIssuedInvoices: true
  },
  billing: {
    taxNumber: '310492819400003',
    enableStripe: false,
    enablePayPal: false,
    enableBankTransfer: true,
    enableMoyasarTap: false,
    bankIban: 'SA4480000492608010492811'
  },
  qabsAi: {
    autoExecuteEnabled: true,
    allowPriceModification: true,
    allowOrderFulfillment: true,
    monthlyCreditLimit: 500,
    lowCreditAlertThreshold: 25
  },
  crypto: {
    usdtTrc20Address: 'CONFIGURE_TRC20_ADDRESS_IN_ADMIN',
    usdtErc20Address: 'CONFIGURE_ERC20_ADDRESS_IN_ADMIN',
    btcAddress: 'CONFIGURE_BTC_ADDRESS_IN_ADMIN',
    enabledNetworks: ['TRC20', 'ERC20', 'BTC'],
    minTransferUsd: 50
  },
  support: {
    officialPhone: '+966 11 510 8890',
    officialEmail: 'support@qabs1.store',
    workingHoursAr: 'الأحد - الخميس | 9:00 صباحاً - 6:00 مساءً (GMT+3)',
    workingHoursEn: 'Sun - Thu | 9:00 AM - 6:00 PM (GMT+3)',
    autoReplyEnabled: true,
    autoReplyMessageAr: 'تم استلام تذكرتك بنجاح، سيتواصل معك فريق دعم قبس خلال أقل من ساعتين.'
  },
  companyFormation: {
    baseServiceFeeUsd: 199,
    stateFees: {
      US_KENTUCKY: 40,
      US_WYOMING: 100,
      US_DELAWARE: 90,
      US_NEW_MEXICO: 50,
      UK_LTD: 65
    },
    einFeeUsd: 70,
    registeredAgentFeeUsd: 99,
    annualRenewalAlertDays: 30,
    autoAnnualReportReminder: true,
    autoAgentRenewalReminder: true,
    requiredDocuments: ['passport'],
    operatingAgreementTemplate:
      'اتفاقية التشغيل القياسية لقبس (Operating Agreement): يقر المؤسس والأعضاء بتوزيع الحصص والصلاحيات الكاملة لإدارة الحسابات البنكية والتجارة الإلكترونية وفق أنظمة الولاية المعتمدة.',
    autoCreateStoreOnCompletion: true,
    autoCreateDocsFolderOnCompletion: true
  }
};

interface PersistedWorkspaceState {
  isAuthenticated?: boolean;
  pendingServiceOrder?: PendingServiceOrder | null;
  isProductionMode?: boolean;
  user?: UserProfile;
  companies?: CompanyFormation[];
  stores?: StoreInstance[];
  activeStoreId?: string;
  products?: StoreProduct[];
  orders?: StoreOrder[];
  customers?: StoreCustomer[];
  discounts?: StoreDiscount[];
  shippingZones?: StoreShippingZone[];
  storePages?: StorePageItem[];
  storeApps?: StoreAppAddon[];
  storeTemplates?: StoreTemplatePreset[];
  banking?: BankingAccount[];
  tickets?: SupportTicket[];
  staff?: StaffMember[];
  auditLogs?: AuditLogItem[];
  subscription?: UserSubscription;
  invoices?: Invoice[];
  refunds?: RefundRecord[];
  aiHistory?: AICommandHistoryItem[];
  sectionSettings?: WorkspaceSectionSettings;
  submittedServiceOrders?: SubmittedServiceOrder[];
}

function loadPersistedState(): PersistedWorkspaceState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as PersistedWorkspaceState;
  } catch {
    return {};
  }
}

function isWorkspaceUrl(): boolean {
  const hash = window.location.hash || '';
  const path = window.location.pathname || '';
  if (path.startsWith('/workspace')) return true;
  const workspacePrefixes = [
    '/overview',
    '/orders',
    '/documents',
    '/company-formation',
    '/formation',
    '/stores',
    '/billing',
    '/qabs-ai',
    '/crypto',
    '/support',
    '/settings',
    '/workspace',
    '/requests'
  ];
  return workspacePrefixes.some(p => hash.startsWith(`#${p}`));
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [persisted] = useState<PersistedWorkspaceState>(() => loadPersistedState());

  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('qabs_lang') as Language) || 'ar';
  });

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('qabs_theme_v2') as 'dark' | 'light') || 'light';
  });

  const [backendStatus, setBackendStatus] = useState<BackendStatus>('checking');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [previewVerifyToken, setPreviewVerifyToken] = useState<string | null>(null);
  const [previewResetToken, setPreviewResetToken] = useState<string | null>(null);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [mode, setMode] = useState<AppMode>('landing');
  const [isProductionMode, setIsProductionMode] = useState<boolean>(false);
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [companies, setCompanies] = useState<CompanyFormation[]>(INITIAL_COMPANIES);
  const [stores, setStores] = useState<StoreInstance[]>(INITIAL_STORES);
  const [activeStoreId, setActiveStoreId] = useState<string>(INITIAL_STORES[0]?.id ?? 'store_01');
  const [storeCategories, setStoreCategories] = useState<StoreCategoryItem[]>([]);
  const [storeTeamMembers, setStoreTeamMembers] = useState<StoreTeamMemberItem[]>([]);
  const [products, setProducts] = useState<StoreProduct[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<StoreOrder[]>(INITIAL_ORDERS);
  const [customers, setCustomers] = useState<StoreCustomer[]>(INITIAL_CUSTOMERS);
  const [discounts, setDiscounts] = useState<StoreDiscount[]>(INITIAL_DISCOUNTS);
  const [shippingZones, setShippingZones] = useState<StoreShippingZone[]>(INITIAL_SHIPPING_ZONES);
  const [storePages, setStorePages] = useState<StorePageItem[]>(INITIAL_STORE_PAGES);
  const [storeApps, setStoreApps] = useState<StoreAppAddon[]>(INITIAL_STORE_APPS);
  const [storeTemplates, setStoreTemplates] = useState<StoreTemplatePreset[]>(INITIAL_STORE_TEMPLATES);

  const [banking, setBanking] = useState<BankingAccount[]>(INITIAL_BANKING);
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [requestDocuments, setRequestDocuments] = useState<RequestDocumentMeta[]>([]);
  const [creditLedger, setCreditLedger] = useState<CreditLedgerItem[]>([]);
  const [subscriptionHistory, setSubscriptionHistory] = useState<SubscriptionHistoryItem[]>([]);
  const [adminOverview, setAdminOverview] = useState<AdminOverviewResponse | null>(null);
  const [integrationsStatus, setIntegrationsStatus] = useState<IntegrationsStatusResponse | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [subscription, setSubscription] = useState<UserSubscription>(INITIAL_USER_SUBSCRIPTION);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [commissions] = useState<CommissionRecord[]>(INITIAL_COMMISSIONS);
  const [refunds, setRefunds] = useState<RefundRecord[]>(INITIAL_REFUNDS);
  const [aiHistory, setAiHistory] = useState<AICommandHistoryItem[]>([]);
  const [sectionSettings, setSectionSettings] = useState<WorkspaceSectionSettings>(() => ({
    overview: { ...DEFAULT_SECTION_SETTINGS.overview, ...(persisted.sectionSettings?.overview || {}) },
    orders: { ...DEFAULT_SECTION_SETTINGS.orders, ...(persisted.sectionSettings?.orders || {}) },
    documents: { ...DEFAULT_SECTION_SETTINGS.documents, ...(persisted.sectionSettings?.documents || {}) },
    billing: { ...DEFAULT_SECTION_SETTINGS.billing, ...(persisted.sectionSettings?.billing || {}) },
    qabsAi: { ...DEFAULT_SECTION_SETTINGS.qabsAi, ...(persisted.sectionSettings?.qabsAi || {}) },
    crypto: { ...DEFAULT_SECTION_SETTINGS.crypto, ...(persisted.sectionSettings?.crypto || {}) },
    support: { ...DEFAULT_SECTION_SETTINGS.support, ...(persisted.sectionSettings?.support || {}) },
    companyFormation: {
      ...DEFAULT_SECTION_SETTINGS.companyFormation,
      ...(persisted.sectionSettings?.companyFormation || {}),
      stateFees: {
        ...DEFAULT_SECTION_SETTINGS.companyFormation.stateFees,
        ...(persisted.sectionSettings?.companyFormation?.stateFees || {})
      }
    }
  }));

  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'recover'>('login');
  const [authIntent, setAuthIntent] = useState<'client' | 'owner'>('client');
  const [pendingServiceOrder, setPendingServiceOrder] = useState<PendingServiceOrder | null>(
    persisted.pendingServiceOrder ?? null
  );
  const [checkoutModalOpen, setCheckoutModalOpen] = useState<boolean>(false);
  const [submittedServiceOrders, setSubmittedServiceOrders] = useState<SubmittedServiceOrder[]>(() => {
    const raw = persisted.submittedServiceOrders ?? [];
    return raw.map(item => ({
      ...item,
      status: ((item.status as string) === 'received'
        ? 'new'
        : (item.status as string) === 'in_review'
        ? 'under_review'
        : (item.status as string) === 'awaiting_payment'
        ? 'needs_info'
        : item.status) as ServiceOrderStatus
    }));
  });

  const isOwner = isAuthenticated && PRIVILEGED_ROLES.has(user.role);
  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  const applyBootstrapPayload = useCallback((boot: BootstrapResponse) => {
    const mappedUser = mapApiUserToProfile(boot.user);
    const mappedDocs = boot.documents.map(mapDbDocument);
    const mappedProducts = boot.products.map(mapDbProduct);
    const mappedOrders = boot.orders.map(mapDbOrder);
    const mappedStores = boot.stores.map(row => {
      const sid = String(row.id);
      return mapDbStore(
        row,
        mappedProducts.filter(p => p.storeId === sid).length,
        mappedOrders.filter(o => o.storeId === sid).length
      );
    });
    const mappedCompanies = boot.companies.map(c => mapDbCompany(c, mappedDocs));
    const mappedReqs = boot.serviceRequests.map(r => mapDbServiceRequest(r, mappedDocs));

    setUser(mappedUser);
    setIsAuthenticated(true);
    setRequestDocuments(mappedDocs);
    setCompanies(mappedCompanies);
    setStores(mappedStores);
    setActiveStoreId(prev =>
      mappedStores.some(s => s.id === prev) ? prev : mappedStores[0]?.id || ''
    );
    setStoreCategories(boot.categories.map(mapDbCategory));
    setStoreTeamMembers(boot.teamMembers.map(mapDbStoreTeamMember));
    setProducts(mappedProducts);
    setOrders(mappedOrders);
    setCustomers(boot.customers.map(mapDbCustomer));
    setSubmittedServiceOrders(mappedReqs);
    setSubscription(mapDbSubscription(boot.subscription));
    setSubscriptionHistory(boot.subscriptionHistory.map(mapDbSubscriptionHistory));
    setInvoices(boot.invoices.map(mapDbInvoice));
    setCreditLedger(boot.creditLedger.map(mapDbCreditLedger));
    setNotifications(boot.notifications.map(mapDbNotification));
    setTickets(boot.tickets.map(mapDbTicket));
    setAuditLogs(boot.auditLogs.map(mapDbAuditLog));
  }, []);

  const refreshWorkspace = useCallback(async () => {
    if (backendStatus !== 'connected') return;
    try {
      const sess = await qabsApi.session();
      if (!sess.authenticated || !sess.user) {
        setIsAuthenticated(false);
        setUser(INITIAL_USER);
        setAdminOverview(null);
        setNotifications([]);
        return;
      }
      const boot = await qabsApi.bootstrap();
      applyBootstrapPayload(boot);
      try {
        const integ = await qabsApi.getIntegrationsStatus();
        setIntegrationsStatus(integ);
      } catch {
        // non-blocking
      }
      if (PRIVILEGED_ROLES.has(sess.user.role as UserRole)) {
        try {
          const ov = await qabsApi.adminOverview();
          setAdminOverview(ov);
        } catch {
          setAdminOverview(null);
        }
      } else {
        setAdminOverview(null);
      }
    } catch {
      // Keep UI responsive on transient refresh errors
    }
  }, [backendStatus, applyBootstrapPayload]);

  // Initial server health + session detection
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        await qabsApi.health();
        if (!active) return;
        setBackendStatus('connected');
        const sess = await qabsApi.session();
        if (!active) return;
        if (sess.authenticated && sess.user) {
          const boot = await qabsApi.bootstrap();
          if (!active) return;
          applyBootstrapPayload(boot);
          try {
            const integ = await qabsApi.getIntegrationsStatus();
            if (active) setIntegrationsStatus(integ);
          } catch {
            // non-blocking
          }
          if (PRIVILEGED_ROLES.has(sess.user.role as UserRole)) {
            try {
              const ov = await qabsApi.adminOverview();
              if (active) setAdminOverview(ov);
            } catch {
              // ignore
            }
          }
          if (isWorkspaceUrl()) {
            setMode(PRIVILEGED_ROLES.has(sess.user.role as UserRole) ? 'admin' : 'portal');
          }
        } else {
          // Connected server without active session: start strictly clean (no fake auth!)
          setIsAuthenticated(false);
          setUser(INITIAL_USER);
          setCompanies([]);
          setStores([]);
          setProducts([]);
          setOrders([]);
          setCustomers([]);
          setInvoices([]);
          setTickets([]);
          setAuditLogs([]);
          setSubmittedServiceOrders([]);
          setNotifications([]);
        }
      } catch {
        if (!active) return;
        // Static CDN deployment fallback (explicitly marked preview_offline)
        setBackendStatus('preview_offline');
        if (persisted.isAuthenticated && persisted.user) {
          setIsAuthenticated(true);
          setUser(persisted.user);
          if (isWorkspaceUrl()) setMode('portal');
        }
        if (persisted.companies) setCompanies(persisted.companies);
        if (persisted.stores) setStores(persisted.stores);
        if (persisted.activeStoreId) setActiveStoreId(persisted.activeStoreId);
        if (persisted.products) setProducts(persisted.products);
        if (persisted.orders) setOrders(persisted.orders);
        if (persisted.customers) setCustomers(persisted.customers);
        if (persisted.tickets) setTickets(persisted.tickets);
        if (persisted.invoices) setInvoices(persisted.invoices);
      }
    })();
    return () => {
      active = false;
    };
  }, [applyBootstrapPayload]);

  // Persist local fallback state ONLY when running in static preview_offline mode
  useEffect(() => {
    if (backendStatus !== 'preview_offline') return;
    try {
      const payload: PersistedWorkspaceState = {
        isAuthenticated,
        pendingServiceOrder,
        isProductionMode,
        user,
        companies,
        stores,
        activeStoreId,
        products,
        orders,
        customers,
        discounts,
        shippingZones,
        storePages,
        storeApps,
        storeTemplates,
        banking,
        tickets,
        staff,
        auditLogs,
        subscription,
        invoices,
        refunds,
        aiHistory,
        sectionSettings,
        submittedServiceOrders
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore quota errors
    }
  }, [
    backendStatus,
    isAuthenticated,
    pendingServiceOrder,
    isProductionMode,
    user,
    companies,
    stores,
    activeStoreId,
    products,
    orders,
    customers,
    discounts,
    shippingZones,
    storePages,
    storeApps,
    storeTemplates,
    banking,
    tickets,
    staff,
    auditLogs,
    subscription,
    invoices,
    refunds,
    aiHistory,
    sectionSettings,
    submittedServiceOrders
  ]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('qabs_lang', language);
  }, [language]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('qabs_theme_v2', theme);
  }, [theme]);

  const setLanguage = (lang: Language) => setLanguageState(lang);
  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  const handleApiFailure = (err: unknown, fallbackAr: string, fallbackEn: string) => {
    const apiErr = err as ApiError;
    const msg = apiErr?.message && apiErr.message !== 'NETWORK_UNREACHABLE'
      ? apiErr.message
      : language === 'ar'
      ? fallbackAr
      : fallbackEn;
    showToast(msg);
  };

  const appendAudit = (actionAr: string, actionEn: string, target: string, status: AuditLogItem['status'] = 'success') => {
    setAuditLogs(prev => [
      {
        id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
        actor: user.name,
        actionAr,
        actionEn,
        target,
        status
      },
      ...prev
    ]);
  };

  const switchRole = (newRole: UserRole) => {
    if (backendStatus === 'connected') {
      showToast(
        language === 'ar'
          ? 'تبديل الصلاحيات يتطلب تسجيل دخول فعلي بحساب يمتلك الدور المطلوب.'
          : 'Role changes require authenticating with an account holding that role.'
      );
      if (newRole === 'super_admin') openOwnerAuth();
      else openClientAuth('login');
      return;
    }
    if (newRole === 'super_admin') {
      setUser(OWNER_USER_PROFILE);
      setIsAuthenticated(true);
      showToast(language === 'ar' ? 'وضع المعاينة غير المتصل: المالك (Super Admin)' : 'Offline preview: Super Admin');
    } else {
      setUser(prev => ({
        ...prev,
        id: prev.id === 'owner_anwar' || prev.id === 'guest' ? 'usr_client_01' : prev.id,
        role: 'customer',
        name: prev.id === 'owner_anwar' || prev.id === 'guest' ? 'عميل منصة قبس' : prev.name
      }));
      setIsAuthenticated(true);
    }
  };

  // --- COMPANIES ---
  const addCompany = (comp: Omit<CompanyFormation, 'id' | 'filingDate' | 'status' | 'documents'>) => {
    if (backendStatus === 'connected') {
      void (async () => {
        try {
          await qabsApi.createFormation({
            companyName: comp.companyName,
            jurisdiction: comp.jurisdiction,
            entityType: comp.entityType,
            registeredAgent: comp.registeredAgent,
            registeredAddress: comp.registeredAddress,
            notes: comp.notes
          });
          await refreshWorkspace();
          showToast(
            language === 'ar'
              ? `تم تسجيل طلب تأسيس "${comp.companyName}" في قاعدة البيانات!`
              : `Formation request for "${comp.companyName}" saved on server!`
          );
        } catch (err) {
          handleApiFailure(err, 'تعذر حفظ طلب التأسيس في الخادم', 'Failed to save formation request');
        }
      })();
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const companyId = `comp_${Date.now()}`;
    const totalUsd = comp.packagePriceUsd ?? sectionSettings.companyFormation.baseServiceFeeUsd;
    const newComp: CompanyFormation = {
      ...comp,
      id: companyId,
      filingDate: today,
      status: 'under_review',
      renewalDueDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      formationStage: comp.formationStage ?? 1,
      packagePriceUsd: totalUsd,
      documents: []
    };
    setCompanies(prev => [newComp, ...prev]);

    const invNum = `INV-CF-${Math.floor(10000 + Math.random() * 89999)}`;
    const formationInvoice: Invoice = {
      id: `inv_${Date.now()}`,
      invoiceNumber: invNum,
      date: today,
      amount: totalUsd,
      currency: 'USD',
      status: 'pending_verification',
      descriptionAr: `رسوم تأسيس شركة دولية: ${comp.companyName} (${comp.jurisdiction}) — بانتظار التحقق`,
      descriptionEn: `Company Formation Fee: ${comp.companyName} (${comp.jurisdiction}) — Pending Verification`,
      clientName: comp.ownerName || user.name
    };
    setInvoices(prev => [formationInvoice, ...prev]);
    appendAudit(`طلب تأسيس شركة (${comp.companyName})`, `Requested formation (${comp.companyName})`, comp.companyName);
    showToast(
      language === 'ar'
        ? `تم تسجيل طلب تأسيس "${comp.companyName}" وإصدار الفاتورة ${invNum} بانتظار التحقق المرجعي.`
        : `Formation request "${comp.companyName}" recorded (${invNum} pending verification).`
    );
  };

  const updateCompanyStatus = (id: string, status: CompanyFormation['status']) => {
    setCompanies(prev => prev.map(c => (c.id === id ? { ...c, status } : c)));
  };

  const advanceCompanyStage = (id: string, nextStage?: 1 | 2 | 3 | 4 | 5) => {
    const target = companies.find(c => c.id === id);
    if (!target) return;
    const computedStage = (nextStage ?? Math.min(5, (target.formationStage ?? 1) + 1)) as 1 | 2 | 3 | 4 | 5;
    setCompanies(prev =>
      prev.map(c =>
        c.id === id
          ? {
              ...c,
              formationStage: computedStage,
              status: computedStage === 5 ? 'approved' : computedStage >= 2 ? 'submitted_to_state' : 'under_review'
            }
          : c
      )
    );
    appendAudit(`ترقية مرحلة التأسيس (${target.companyName}) إلى ${computedStage}/5`, `Advanced formation (${target.companyName}) to ${computedStage}/5`, target.companyName);
  };

  // --- STORES (TENANT & ADMIN GATED) ---
  const addStore = (
    storeData: Omit<StoreInstance, 'id' | 'productsCount' | 'ordersCount' | 'totalRevenue' | 'createdAt'>
  ) => {
    if (backendStatus === 'connected') {
      void (async () => {
        try {
          const res = await qabsApi.createStore({
            name: storeData.name,
            subdomain: storeData.subdomain,
            currency: storeData.currency,
            theme: storeData.theme,
            gatewayType: storeData.gatewayType,
            country: storeData.country,
            activityAr: storeData.activityAr,
            activityEn: storeData.activityEn,
            defaultLanguage: storeData.defaultLanguage,
            taxRate: storeData.taxRate
          });
          await refreshWorkspace();
          if (res.store?.id) setActiveStoreId(String(res.store.id));
          showToast(
            language === 'ar'
              ? `تم إنشاء متجر "${storeData.name}" كمسودة في قاعدة البيانات ✓`
              : `Store "${storeData.name}" created as draft on server ✓`
          );
        } catch (err) {
          handleApiFailure(err, 'تعذر إنشاء المتجر في الخادم', 'Failed to create store');
        }
      })();
      return;
    }

    const newStoreId = `store_${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];
    const newStore: StoreInstance = {
      ...storeData,
      id: newStoreId,
      ownerName: storeData.ownerName || user.name,
      ownerEmail: storeData.ownerEmail || user.email,
      productsCount: 0,
      ordersCount: 0,
      totalRevenue: 0,
      createdAt: today,
      status: 'draft',
      approvalStatus: 'draft',
      paymentConnected: false,
      paymentApprovalStatus: 'unconfigured',
      domainVerified: false,
      sections: storeData.sections || DEFAULT_STORE_SECTIONS.map(sec => ({ ...sec }))
    };
    setStores(prev => [newStore, ...prev]);
    setActiveStoreId(newStore.id);
    showToast(language === 'ar' ? `تم إنشاء متجر "${storeData.name}" كمسودة!` : `Store "${storeData.name}" created as draft!`);
  };

  const updateStoreTheme = (id: string, newTheme: StoreInstance['theme'], customDomain?: string) => {
    if (backendStatus === 'connected') {
      void (async () => {
        try {
          await qabsApi.updateStore(id, { theme: newTheme, customDomain });
          await refreshWorkspace();
          showToast(language === 'ar' ? 'تم حفظ مظهر المتجر في الخادم' : 'Store theme saved on server');
        } catch (err) {
          handleApiFailure(err, 'تعذر حفظ مظهر المتجر', 'Failed to update store theme');
        }
      })();
      return;
    }
    setStores(prev =>
      prev.map(s => (s.id === id ? { ...s, theme: newTheme, customDomain: customDomain ?? s.customDomain } : s))
    );
    showToast(language === 'ar' ? 'تم تحديث مظهر المتجر' : 'Store theme updated');
  };

  const updateStoreDetails = (id: string, updates: Partial<StoreInstance>) => {
    if (backendStatus === 'connected') {
      void (async () => {
        try {
          await qabsApi.updateStore(id, {
            name: updates.name,
            currency: updates.currency,
            theme: updates.theme,
            customDomain: updates.customDomain,
            settings: {
              country: updates.country,
              activityAr: updates.activityAr,
              activityEn: updates.activityEn,
              defaultLanguage: updates.defaultLanguage,
              taxRate: updates.taxRate
            }
          });
          await refreshWorkspace();
          showToast(language === 'ar' ? 'تم حفظ إعدادات المتجر في الخادم ✓' : 'Store settings saved on server ✓');
        } catch (err) {
          handleApiFailure(err, 'تعذر حفظ إعدادات المتجر', 'Failed to save store settings');
        }
      })();
      return;
    }
    setStores(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
    showToast(language === 'ar' ? 'تم حفظ إعدادات المتجر' : 'Store settings saved');
  };

  const submitStoreForApproval = (storeId: string) => {
    if (backendStatus === 'connected') {
      void (async () => {
        try {
          await qabsApi.submitStoreReview(storeId);
          await refreshWorkspace();
          showToast(
            language === 'ar'
              ? 'تم إرسال المتجر إلى لوحة إدارة قبس للمراجعة والاعتماد!'
              : 'Store submitted to QABS Admin for review!'
          );
        } catch (err) {
          handleApiFailure(err, 'تعذر إرسال المتجر للمراجعة', 'Failed to submit store for review');
        }
      })();
      return;
    }
    setStores(prev =>
      prev.map(s => (s.id === storeId ? { ...s, status: 'pending_approval', approvalStatus: 'pending_review' } : s))
    );
    showToast(language === 'ar' ? 'تم إرسال المتجر للمراجعة' : 'Store submitted for review');
  };

  const reviewStoreApproval = (
    storeId: string,
    decision: 'approved_published' | 'changes_requested' | 'rejected',
    feedback?: string
  ) => {
    if (backendStatus === 'connected') {
      void (async () => {
        try {
          await qabsApi.adminReviewStore(storeId, decision, feedback);
          await refreshWorkspace();
          showToast(
            language === 'ar'
              ? `تم تحديث قرار اعتماد المتجر وإشعار التاجر (${decision})`
              : `Store review updated & merchant notified (${decision})`
          );
        } catch (err) {
          handleApiFailure(err, 'يتطلب هذا الإجراء صلاحية إدارية', 'Admin permission required for store approval');
        }
      })();
      return;
    }
    setStores(prev =>
      prev.map(s =>
        s.id === storeId
          ? {
              ...s,
              approvalStatus: decision,
              status: decision === 'approved_published' ? 'active' : decision === 'rejected' ? 'suspended' : 'draft',
              adminFeedback: feedback
            }
          : s
      )
    );
  };

  const requestPaymentActivation = (
    storeId: string,
    gatewayType: StoreInstance['gatewayType'],
    sandboxConfig?: {
      madaEnabled?: boolean;
      applePayEnabled?: boolean;
      sadadEnabled?: boolean;
      stcPayEnabled?: boolean;
      merchantReference?: string;
    }
  ) => {
    if (backendStatus === 'connected') {
      void (async () => {
        try {
          await qabsApi.requestStorePayment(storeId, { gatewayType, sandboxConfig });
          await refreshWorkspace();
          showToast(
            language === 'ar'
              ? `تم حفظ إعدادات بوابة ${gatewayType} (وضع المعاينة المقيد) وإرسال الطلب للمراجعة ✓`
              : `${gatewayType} sandbox settings persisted & submitted for review ✓`
          );
        } catch (err) {
          handleApiFailure(err, 'تعذر حفظ طلب بوابة الدفع', 'Failed to save payment gateway request');
        }
      })();
      return;
    }
    // Offline preview fallback (no live charging)
    setStores(prev =>
      prev.map(s =>
        s.id === storeId
          ? {
              ...s,
              gatewayType,
              paymentConnected: false,
              paymentApprovalStatus: 'pending_admin_approval',
              paymentSandbox: sandboxConfig ? { ...sandboxConfig, gatewayType, mode: 'sandbox_pending_review' } : s.paymentSandbox
            }
          : s
      )
    );
    showToast(
      language === 'ar'
        ? `تم تسجيل طلب بوابة ${gatewayType} بحالة انتظار المراجعة اليدوية (التفعيل المالي المباشر معطل في المعاينة).`
        : `${gatewayType} gateway request recorded as pending review (live activation disabled in preview).`
    );
  };

  const approveStorePayment = (storeId: string, approved: boolean) => {
    if (backendStatus === 'connected') {
      void (async () => {
        try {
          await qabsApi.adminReviewStorePayment(storeId, approved ? 'sandbox_verified' : 'unconfigured');
          await refreshWorkspace();
          showToast(
            language === 'ar'
              ? 'تم تسجيل مراجعة جاهزية البوابة (يبقى التحصيل الحي معطلاً في المعاينة).'
              : 'Gateway readiness review recorded (live card charging stays gated).'
          );
        } catch (err) {
          handleApiFailure(err, 'يتطلب هذا الإجراء صلاحية إدارية', 'Admin role required for payment review');
        }
      })();
      return;
    }
    showToast(
      language === 'ar'
        ? 'تفعيل بوابات الدفع الحقيقية وجمع البطاقات معطل أماناً في بيئة المعاينة.'
        : 'Live payment gateway activation is safely disabled in preview environment.'
    );
  };

  const requestDomainVerification = (storeId: string, customDomain: string) => {
    const cleanDomain = customDomain.trim().toLowerCase().replace(/^https?:\/\//, '');
    if (backendStatus === 'connected') {
      updateStoreDetails(storeId, { customDomain: cleanDomain });
      return;
    }
    setStores(prev =>
      prev.map(s => (s.id === storeId ? { ...s, customDomain: cleanDomain, domainVerified: false } : s))
    );
  };

  const verifyStoreDomain = (storeId: string) => {
    if (backendStatus === 'connected') {
      void (async () => {
        try {
          await qabsApi.adminVerifyStoreDomain(storeId, true);
          await refreshWorkspace();
          showToast(language === 'ar' ? 'تم توثيق سجل النطاق في قاعدة البيانات (بدون تعديل DNS فعلي).' : 'Domain status verified in database.');
        } catch (err) {
          handleApiFailure(err, 'تعذر توثيق النطاق', 'Failed to verify store domain');
        }
      })();
      return;
    }
    setStores(prev => prev.map(s => (s.id === storeId ? { ...s, domainVerified: true } : s)));
  };

  const saveStoreSnapshot = (storeId: string, label: string) => {
    setStores(prev =>
      prev.map(s => {
        if (s.id !== storeId) return s;
        const newSnap = {
          id: `ver_${Date.now()}`,
          label: label || `نسخة (${new Date().toLocaleTimeString()})`,
          savedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
          theme: s.theme,
          primaryColor: s.primaryColor || '#004457',
          accentColor: s.accentColor || '#C8A24A',
          fontFamily: s.fontFamily || 'Cairo',
          sections: (s.sections || DEFAULT_STORE_SECTIONS).map(sec => ({ ...sec }))
        };
        return { ...s, designVersions: [newSnap, ...(s.designVersions || [])] };
      })
    );
    showToast(language === 'ar' ? 'تم حفظ نسخة التصميم' : 'Design snapshot saved');
  };

  const restoreStoreSnapshot = (storeId: string, snapshotId: string) => {
    setStores(prev =>
      prev.map(s => {
        if (s.id !== storeId) return s;
        const snap = (s.designVersions || []).find(v => v.id === snapshotId);
        if (!snap) return s;
        return {
          ...s,
          theme: snap.theme,
          primaryColor: snap.primaryColor,
          accentColor: snap.accentColor,
          fontFamily: snap.fontFamily,
          sections: snap.sections.map(sec => ({ ...sec }))
        };
      })
    );
    showToast(language === 'ar' ? 'تم استعادة نسخة التصميم' : 'Design restored');
  };

  const updateStoreSections = (storeId: string, sections: StoreSectionBlock[]) => {
    setStores(prev => prev.map(s => (s.id === storeId ? { ...s, sections } : s)));
  };

  const addStoreCategory = async (storeId: string, nameAr: string, nameEn?: string) => {
    if (backendStatus === 'connected') {
      try {
        await qabsApi.createCategory(storeId, { nameAr, nameEn });
        await refreshWorkspace();
        showToast(language === 'ar' ? 'تمت إضافة التصنيف للمتجر ✓' : 'Store category added ✓');
      } catch (err) {
        handleApiFailure(err, 'تعذر إضافة التصنيف', 'Failed to add category');
      }
      return;
    }
    setStoreCategories(prev => [
      { id: `cat_${Date.now()}`, storeId, nameAr, nameEn: nameEn || nameAr, slug: nameAr.toLowerCase() },
      ...prev
    ]);
  };

  const addStoreTeamMember = async (
    storeId: string,
    input: { name: string; email: string; role: 'admin' | 'staff' | 'support'; permissions?: string[] }
  ) => {
    if (backendStatus === 'connected') {
      try {
        await qabsApi.addStoreTeamMember(storeId, input);
        await refreshWorkspace();
        showToast(language === 'ar' ? 'تمت إضافة عضو فريق المتجر ✓' : 'Store team member added ✓');
      } catch (err) {
        handleApiFailure(err, 'تعذر إضافة عضو فريق المتجر', 'Failed to add store team member');
      }
      return;
    }
    setStoreTeamMembers(prev => [
      {
        id: `stm_${Date.now()}`,
        storeId,
        name: input.name,
        email: input.email,
        role: input.role,
        permissions: input.permissions || ['orders', 'products'],
        status: 'active'
      },
      ...prev
    ]);
  };

  // --- PRODUCTS ---
  const addProduct = (p: Omit<StoreProduct, 'id' | 'salesCount' | 'storeId'> & { storeId?: string }) => {
    const targetStoreId = p.storeId || activeStoreId;
    if (backendStatus === 'connected') {
      void (async () => {
        try {
          await qabsApi.createProduct(targetStoreId, {
            titleAr: p.titleAr || p.nameAr,
            titleEn: p.titleEn || p.nameEn,
            sku: p.sku,
            price: p.price,
            cost: p.cost ?? p.costPrice ?? 0,
            stock: p.stock,
            productType: p.productType,
            categoryAr: p.categoryAr || p.category,
            categoryEn: p.categoryEn,
            status: p.status
          });
          await refreshWorkspace();
          showToast(language === 'ar' ? 'تم حفظ المنتج في قاعدة بيانات المتجر ✓' : 'Product saved to store ✓');
        } catch (err) {
          handleApiFailure(err, 'تعذر إضافة المنتج', 'Failed to create product');
        }
      })();
      return;
    }

    const newProduct: StoreProduct = { ...p, storeId: targetStoreId, id: `prod_${Date.now()}`, salesCount: 0 };
    setProducts(prev => [newProduct, ...prev]);
    setStores(prev => prev.map(s => (s.id === targetStoreId ? { ...s, productsCount: s.productsCount + 1 } : s)));
    showToast(language === 'ar' ? 'تم إضافة المنتج إلى المتجر' : 'Product added to store');
  };

  const updateProduct = (id: string, updates: Partial<StoreProduct>) => {
    if (backendStatus === 'connected') {
      const target = products.find(p => p.id === id);
      if (!target) return;
      void (async () => {
        try {
          await qabsApi.updateProduct(target.storeId, id, {
            titleAr: updates.titleAr || updates.nameAr,
            price: updates.price,
            stock: updates.stock,
            status: updates.status
          });
          await refreshWorkspace();
          showToast(language === 'ar' ? 'تم تحديث المنتج في الخادم ✓' : 'Product updated on server ✓');
        } catch (err) {
          handleApiFailure(err, 'تعذر تحديث المنتج', 'Failed to update product');
        }
      })();
      return;
    }
    setProducts(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
    showToast(language === 'ar' ? 'تم تعديل المنتج' : 'Product updated');
  };

  const deleteProduct = (id: string) => {
    const prod = products.find(p => p.id === id);
    if (backendStatus === 'connected' && prod) {
      void (async () => {
        try {
          await qabsApi.deleteProduct(prod.storeId, id);
          await refreshWorkspace();
          showToast(language === 'ar' ? 'تم حذف المنتج من قاعدة البيانات' : 'Product deleted from server');
        } catch (err) {
          handleApiFailure(err, 'تعذر حذف المنتج', 'Failed to delete product');
        }
      })();
      return;
    }
    setProducts(prev => prev.filter(p => p.id !== id));
    if (prod) {
      setStores(prev =>
        prev.map(s => (s.id === prod.storeId ? { ...s, productsCount: Math.max(0, s.productsCount - 1) } : s))
      );
    }
    showToast(language === 'ar' ? 'تم حذف المنتج' : 'Product deleted');
  };

  // --- STORE ORDERS ---
  const addOrder = (orderData: Omit<StoreOrder, 'id' | 'orderNumber' | 'date'>) => {
    if (backendStatus === 'connected') {
      void (async () => {
        try {
          await qabsApi.createOrder(orderData.storeId, {
            customerName: orderData.customerName,
            customerEmail: orderData.customerEmail,
            customerCountry: orderData.customerCountry,
            itemsCount: orderData.itemsCount,
            total: orderData.total
          });
          await refreshWorkspace();
          showToast(language === 'ar' ? 'تم تسجيل طلب المتجر في الخادم ✓' : 'Store order saved on server ✓');
        } catch (err) {
          handleApiFailure(err, 'تعذر تسجيل الطلب', 'Failed to create store order');
        }
      })();
      return;
    }
    const newOrder: StoreOrder = {
      ...orderData,
      id: `ord_${Date.now()}`,
      orderNumber: `QBS-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toISOString().split('T')[0]
    };
    setOrders(prev => [newOrder, ...prev]);
    showToast(language === 'ar' ? `تم إنشاء الطلب ${newOrder.orderNumber}` : `Order ${newOrder.orderNumber} created`);
  };

  const updateOrderStatus = (id: string, status: StoreOrder['status'], trackingNumber?: string) => {
    const existing = orders.find(o => o.id === id);
    if (backendStatus === 'connected' && existing) {
      void (async () => {
        try {
          await qabsApi.updateOrderStatus(existing.storeId, id, { status, trackingNumber });
          await refreshWorkspace();
          showToast(language === 'ar' ? 'تم تحديث حالة الطلب والتتبع' : 'Order status updated');
        } catch (err) {
          handleApiFailure(err, 'تعذر تحديث حالة الطلب', 'Failed to update order status');
        }
      })();
      return;
    }
    setOrders(prev =>
      prev.map(o =>
        o.id === id ? { ...o, status, trackingNumber: trackingNumber !== undefined ? trackingNumber : o.trackingNumber } : o
      )
    );
  };

  const issueOrderInvoice = (orderId: string): Invoice | null => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return null;
    const store = stores.find(s => s.id === targetOrder.storeId);
    const newInvoice: Invoice = {
      id: `inv_${Date.now()}`,
      invoiceNumber: `INV-${targetOrder.orderNumber}`,
      date: new Date().toISOString().split('T')[0],
      amount: targetOrder.total,
      currency: targetOrder.currency || store?.currency || 'SAR',
      status: 'pending_verification',
      descriptionAr: `فاتورة طلب متجر (${store?.name || 'متجر قبس'}) — ${targetOrder.orderNumber}`,
      descriptionEn: `Store order invoice (${store?.name || 'QABS Store'}) — ${targetOrder.orderNumber}`,
      clientName: targetOrder.customerName
    };
    setInvoices(prev => [newInvoice, ...prev]);
    return newInvoice;
  };

  const addCustomer = (c: Omit<StoreCustomer, 'id' | 'ordersCount' | 'totalSpent' | 'lastOrderDate'>) => {
    const newCustomer: StoreCustomer = {
      ...c,
      id: `cust_${Date.now()}`,
      ordersCount: 1,
      totalSpent: 0,
      lastOrderDate: new Date().toISOString().split('T')[0]
    };
    setCustomers(prev => [newCustomer, ...prev]);
  };

  const addDiscount = (d: Omit<StoreDiscount, 'id' | 'usedCount'>) => {
    setDiscounts(prev => [{ ...d, id: `dsc_${Date.now()}`, usedCount: 0 }, ...prev]);
  };
  const toggleDiscountStatus = (id: string) => {
    setDiscounts(prev => prev.map(d => (d.id === id ? { ...d, status: d.status === 'active' ? 'expired' : 'active' } : d)));
  };
  const addShippingZone = (z: Omit<StoreShippingZone, 'id'>) => {
    setShippingZones(prev => [{ ...z, id: `shp_${Date.now()}` }, ...prev]);
  };
  const saveStorePage = (page: Omit<StorePageItem, 'id' | 'updatedAt'> & { id?: string }) => {
    const today = new Date().toISOString().split('T')[0];
    if (page.id) {
      setStorePages(prev => prev.map(p => (p.id === page.id ? { ...p, ...page, id: page.id, updatedAt: today } : p)));
    } else {
      setStorePages(prev => [{ ...page, id: `pg_${Date.now()}`, updatedAt: today }, ...prev]);
    }
  };
  const deleteStorePage = (id: string) => setStorePages(prev => prev.filter(p => p.id !== id));
  const toggleStoreApp = (appId: string, storeId: string) => {
    setStoreApps(prev =>
      prev.map(app => {
        if (app.id !== appId) return app;
        const currentIds = app.installedStoreIds || app.installedStores || [];
        const updatedIds = currentIds.includes(storeId) ? currentIds.filter(x => x !== storeId) : [...currentIds, storeId];
        return { ...app, installedStoreIds: updatedIds, installedStores: updatedIds };
      })
    );
  };
  const addStoreTemplate = (tpl: Omit<StoreTemplatePreset, 'id'>) => {
    setStoreTemplates(prev => [{ ...tpl, id: `tpl_${Date.now()}` }, ...prev]);
  };
  const triggerSystemBackup = (targetLabel?: string) => {
    appendAudit(`نسخ احتياطي للبيانات (${targetLabel || 'المنصة'})`, `Triggered backup (${targetLabel || 'Platform'})`, targetLabel || 'QABS-Vault');
    showToast(language === 'ar' ? 'تم تسجيل عملية النسخ الاحتياطي في السجل' : 'Backup recorded in audit log');
  };

  const addBankAccount = (bank: Omit<BankingAccount, 'id' | 'balance' | 'status'>) => {
    setBanking(prev => [{ ...bank, id: `bnk_${Date.now()}`, balance: 0, status: 'pending_verification' }, ...prev]);
  };

  // --- SUPPORT TICKETS ---
  const addTicket = (t: Omit<SupportTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'status'>) => {
    if (backendStatus === 'connected') {
      void (async () => {
        try {
          await qabsApi.createTicket({
            subject: t.subject || t.subjectAr || t.subjectEn || 'Support Request',
            category: t.category,
            priority: t.priority,
            lastMessage: t.lastMessage
          });
          await refreshWorkspace();
          showToast(language === 'ar' ? 'تم إرسال تذكرة الدعم بنجاح ✓' : 'Support ticket created ✓');
        } catch (err) {
          handleApiFailure(err, 'تعذر إنشاء التذكرة', 'Failed to create ticket');
        }
      })();
      return;
    }
    const newTicket: SupportTicket = {
      ...t,
      id: `tkt_${Date.now()}`,
      ticketNumber: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'open',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    setTickets(prev => [newTicket, ...prev]);
  };

  const resolveTicket = (id: string) => {
    if (backendStatus === 'connected') {
      void (async () => {
        try {
          await qabsApi.resolveTicket(id);
          await refreshWorkspace();
          showToast(language === 'ar' ? 'تم إغلاق التذكرة بنجاح' : 'Ticket resolved');
        } catch (err) {
          handleApiFailure(err, 'تعذر إغلاق التذكرة', 'Failed to resolve ticket');
        }
      })();
      return;
    }
    setTickets(prev => prev.map(t => (t.id === id ? { ...t, status: 'resolved', updatedAt: 'now' } : t)));
  };

  // --- NOTIFICATIONS & DOCUMENTS VAULT ---
  const markNotificationRead = async (id: string) => {
    if (backendStatus === 'connected') {
      try {
        await qabsApi.markNotificationRead(id);
        setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
      } catch {
        // ignore
      }
      return;
    }
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsRead = async () => {
    if (backendStatus === 'connected') {
      try {
        await qabsApi.markAllNotificationsRead();
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      } catch {
        // ignore
      }
      return;
    }
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const uploadRequestDocument = async (input: {
    name: string;
    type?: string;
    mimeType: string;
    base64: string;
    requestId?: string;
    formationId?: string;
  }): Promise<RequestDocumentMeta | null> => {
    if (backendStatus === 'connected') {
      try {
        const res = await qabsApi.uploadDocument(input);
        const mapped = mapDbDocument(res.document);
        await refreshWorkspace();
        showToast(language === 'ar' ? `تم رفع المستند "${mapped.documentName}" بشكل خاص ومشفر ✓` : `Private document "${mapped.documentName}" uploaded ✓`);
        return mapped;
      } catch (err) {
        handleApiFailure(err, 'فشل التحقق الأمني للملف المرفوع (PDF/PNG/JPEG/WEBP حتى 5MB فقط)', 'File rejected by server security validation');
        return null;
      }
    }
    const meta: RequestDocumentMeta = {
      id: `doc_${Date.now()}`,
      requestId: input.requestId || null,
      formationId: input.formationId || null,
      documentName: input.name,
      documentType: input.type || 'kyc',
      mimeType: input.mimeType,
      sizeBytes: Math.round((input.base64.length * 3) / 4),
      status: 'uploaded',
      createdAt: new Date().toISOString()
    };
    setRequestDocuments(prev => [meta, ...prev]);
    return meta;
  };

  // --- STAFF ---
  const addStaff = (s: Omit<StaffMember, 'id' | 'lastActive' | 'status'>) => {
    setStaff(prev => [{ ...s, id: `stf_${Date.now()}`, status: 'active', lastActive: 'now' }, ...prev]);
  };
  const updateStaffPermissions = (staffId: string, permissions: string[]) => {
    setStaff(prev => prev.map(m => (m.id === staffId ? { ...m, permissions } : m)));
  };
  const removeStaff = (staffId: string) => {
    setStaff(prev => prev.filter(m => m.id !== staffId));
  };

  // --- BILLING, SUBSCRIPTIONS, INVOICES & CREDITS (STRICT FINANCIAL GATE) ---
  const changeSubscriptionPlan = (planId: 'starter' | 'growth' | 'enterprise', cycle: 'monthly' | 'annual') => {
    if (backendStatus === 'connected') {
      void (async () => {
        try {
          const res = await qabsApi.requestSubscriptionChange(planId, cycle);
          await refreshWorkspace();
          showToast(
            language === 'ar'
              ? `تم إصدار فاتورة الترقية (${res.invoice.invoice_number}) بانتظار التحقق المرجعي من الإدارة.`
              : `Upgrade invoice (${res.invoice.invoice_number}) issued as pending verification.`
          );
        } catch (err) {
          handleApiFailure(err, 'تعذر إنشاء طلب تغيير الباقة', 'Failed to request subscription change');
        }
      })();
      return;
    }
    const targetPlan = SUBSCRIPTION_PLANS.find(p => p.id === planId) || SUBSCRIPTION_PLANS[1];
    const newPrice = cycle === 'annual' ? targetPlan.priceAnnual * 12 : targetPlan.priceMonthly;
    const newInv: Invoice = {
      id: `inv_${Date.now()}`,
      invoiceNumber: `INV-QBS-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      amount: newPrice,
      currency: 'USD',
      status: 'pending_verification',
      descriptionAr: `طلب ترقية الباقة: ${targetPlan.nameAr} (${cycle}) — بانتظار التحقق`,
      descriptionEn: `Subscription upgrade: ${targetPlan.nameEn} (${cycle}) — Pending Verification`,
      clientName: user.companyName || user.name
    };
    setInvoices(prev => [newInv, ...prev]);
    showToast(
      language === 'ar'
        ? `تم إصدار الفاتورة ${newInv.invoiceNumber} بحالة انتظار التحقق (لا يُفعّل الاشتراك قبل تأكيد السداد).`
        : `Invoice ${newInv.invoiceNumber} created as pending verification.`
    );
  };

  const verifyInvoiceWithProof = async (invoiceId: string, paymentProofRef: string): Promise<boolean> => {
    if (backendStatus === 'connected') {
      try {
        await qabsApi.adminVerifyInvoice(invoiceId, paymentProofRef);
        await refreshWorkspace();
        showToast(language === 'ar' ? 'تم توثيق مرجع السداد وتحديث الفاتورة والأرصدة ✓' : 'Payment proof verified & applied ✓');
        return true;
      } catch (err) {
        handleApiFailure(err, 'تعذر توثيق الفاتورة — تأكد من الصلاحية ومرجع السداد', 'Failed to verify invoice');
        return false;
      }
    }
    if (!paymentProofRef.trim() || paymentProofRef.trim().length < 4) return false;
    setInvoices(prev =>
      prev.map(inv => (inv.id === invoiceId ? { ...inv, status: 'paid', paymentProofRef } : inv))
    );
    return true;
  };

  const issueRefund = (orderNumber: string, amount: number, reasonAr: string, reasonEn: string) => {
    const newRefund: RefundRecord = {
      id: `ref_${Date.now()}`,
      orderNumber,
      amount,
      currency: 'USD',
      reasonAr,
      reasonEn,
      status: 'requested',
      date: new Date().toISOString().split('T')[0],
      customerName: user.name
    };
    setRefunds(prev => [newRefund, ...prev]);
    showToast(language === 'ar' ? `تم تسجيل طلب الاسترداد للطلب ${orderNumber} للمراجعة` : `Refund request recorded for ${orderNumber}`);
  };

  const topUpCredits = (amount: number) => {
    if (backendStatus === 'connected') {
      void (async () => {
        try {
          const res = await qabsApi.requestCreditTopup(amount);
          await refreshWorkspace();
          showToast(
            language === 'ar'
              ? `تم إصدار فاتورة شحن الرصيد (${res.invoice.invoice_number}) بانتظار التحقق المرجعي (لا يضاف الرصيد تلقائياً بدون إثبات).`
              : `Credit top-up invoice (${res.invoice.invoice_number}) created — pending proof verification.`
          );
        } catch (err) {
          handleApiFailure(err, 'تعذر إنشاء طلب شحن الرصيد', 'Failed to request credit top-up');
        }
      })();
      return;
    }
    const newInv: Invoice = {
      id: `inv_${Date.now()}`,
      invoiceNumber: `INV-CRD-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      amount,
      currency: 'USD',
      status: 'pending_verification',
      descriptionAr: `طلب شحن ${amount * 10} رصيد AI — بانتظار التحقق`,
      descriptionEn: `AI Credit Pack (${amount * 10} credits) — Pending Verification`,
      clientName: user.name
    };
    setInvoices(prev => [newInv, ...prev]);
    showToast(language === 'ar' ? `صدرت الفاتورة ${newInv.invoiceNumber} بانتظار مرجع التحقق` : `Invoice ${newInv.invoiceNumber} pending verification`);
  };

  // --- ADMIN GOVERNANCE HELPERS ---
  const adminCreateStaffUser = async (input: { name: string; email: string; password: string; role: string }) => {
    if (backendStatus !== 'connected') return false;
    try {
      await qabsApi.adminCreateStaff(input);
      await refreshWorkspace();
      showToast(language === 'ar' ? 'تم إنشاء حساب الموظف بنجاح ✓' : 'Staff user created ✓');
      return true;
    } catch (err) {
      handleApiFailure(err, 'تعذر إنشاء حساب الموظف', 'Failed to create staff user');
      return false;
    }
  };

  const adminUpdateStaffUser = async (userId: string, input: { role?: string; status?: 'active' | 'suspended' }) => {
    if (backendStatus !== 'connected') return false;
    try {
      await qabsApi.adminUpdateStaff(userId, input);
      await refreshWorkspace();
      showToast(language === 'ar' ? 'تم تحديث دور/حالة الموظف ✓' : 'Staff updated ✓');
      return true;
    } catch (err) {
      handleApiFailure(err, 'تعذر تحديث صلاحيات الموظف', 'Failed to update staff role');
      return false;
    }
  };

  const adminUpdateServiceCatalog = async (slug: string, input: { startingPriceUsd?: number; active?: boolean }) => {
    if (backendStatus !== 'connected') return false;
    try {
      await qabsApi.adminUpdateService(slug, input);
      await refreshWorkspace();
      showToast(language === 'ar' ? `تم تحديث خدمة ${slug} ✓` : `Updated service ${slug} ✓`);
      return true;
    } catch (err) {
      handleApiFailure(err, 'تعذر تحديث الخدمة', 'Failed to update service');
      return false;
    }
  };

  const adminSendBroadcastNotification = async (input: {
    tenantId?: string;
    titleAr: string;
    titleEn?: string;
    bodyAr: string;
    bodyEn?: string;
  }) => {
    if (backendStatus !== 'connected') return false;
    try {
      const res = await qabsApi.adminSendNotification(input);
      await refreshWorkspace();
      showToast(language === 'ar' ? `تم إرسال الإشعار إلى ${res.sentCount} حساب ✓` : `Notification sent to ${res.sentCount} tenant(s) ✓`);
      return true;
    } catch (err) {
      handleApiFailure(err, 'تعذر إرسال الإشعار', 'Failed to send notification');
      return false;
    }
  };

  const adminUpdatePlatformSettings = async (settings: Record<string, unknown>) => {
    if (backendStatus !== 'connected') return false;
    try {
      await qabsApi.adminUpdateSettings(settings);
      await refreshWorkspace();
      showToast(language === 'ar' ? 'تم حفظ إعدادات المنصة العامة ✓' : 'Platform settings updated ✓');
      return true;
    } catch (err) {
      handleApiFailure(err, 'تعذر تحديث إعدادات المنصة', 'Failed to update platform settings');
      return false;
    }
  };

  // --- AUTH GATE ---
  const openClientAuth = (initialMode: 'login' | 'register' = 'login') => {
    setAuthError(null);
    setAuthIntent('client');
    setAuthMode(initialMode);
    setAuthModalOpen(true);
  };

  const openOwnerAuth = () => {
    setAuthError(null);
    setAuthIntent('owner');
    setAuthMode('login');
    setAuthModalOpen(true);
  };

  const requestServiceAction = (order: PendingServiceOrder) => {
    setPendingServiceOrder(order);
    if (!isAuthenticated) {
      setAuthIntent('client');
      setAuthMode('login');
      setAuthModalOpen(true);
      showToast(
        language === 'ar'
          ? 'يرجى تسجيل الدخول أو إنشاء حساب لإتمام طلبك'
          : 'Please sign in or register to submit your request'
      );
    } else {
      setCheckoutModalOpen(true);
    }
  };

  const completeServiceCheckout = (paymentMethod: 'Tap' | 'Moyasar' | 'Stripe' | 'PayPal' | 'Crypto' | 'BankTransfer') => {
    if (!pendingServiceOrder) return;
    const ord = pendingServiceOrder;
    const d = ord.details || {};

    if (ord.serviceType === 'company_formation') {
      const jur = d.jurisdiction || 'US_WYOMING';
      const suffix = d.entityType || (jur === 'UK_LTD' ? 'LTD' : 'LLC');
      const baseName = (d.companyName || `${user.companyName || user.name || 'QABS VENTURES'}`).trim().toUpperCase();
      const companyName = baseName.endsWith(suffix) ? baseName : `${baseName} ${suffix}`;
      addCompany({
        companyName,
        jurisdiction: jur,
        entityType: suffix,
        registeredAgent: 'QABS Statutory Registered Agent LLC',
        registeredAddress: '30 N Gould St Ste R, Sheridan, WY 82801, USA',
        renewalDueDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        ownerName: user.name,
        ownerEmail: user.email,
        packagePriceUsd: ord.priceUsd,
        formationStage: 1,
        notes: `Submitted via ${paymentMethod} (pending verification)`
      });
      setCheckoutModalOpen(false);
      setPendingServiceOrder(null);
      setMode('portal');
      return;
    }

    if (ord.serviceType === 'store_package') {
      const planId = d.planId || 'growth';
      const cycle = d.billingCycle || 'monthly';
      changeSubscriptionPlan(planId, cycle);
      if (d.storeName || planId) {
        const name = d.storeName?.trim() || `${user.companyName || user.name} Store`;
        const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 14) || `store${Math.floor(100 + Math.random() * 899)}`;
        const resolvedGateway: StoreInstance['gatewayType'] =
          paymentMethod === 'Tap' || paymentMethod === 'Moyasar' || paymentMethod === 'PayPal'
            ? paymentMethod
            : 'Tap';
        addStore({
          name,
          ownerName: user.name,
          ownerEmail: user.email,
          activityAr: 'متجر إلكتروني مستقل — مسودة',
          activityEn: 'Independent Storefront — Draft',
          country: 'SA',
          defaultLanguage: 'both',
          subdomain: `${slug}.qabs1.store`,
          currency: 'SAR',
          taxRate: 15,
          theme: 'gold_executive',
          status: 'draft',
          approvalStatus: 'draft',
          paymentConnected: false,
          paymentApprovalStatus: 'unconfigured',
          gatewayType: resolvedGateway
        });
      }
      setCheckoutModalOpen(false);
      setPendingServiceOrder(null);
      setMode('portal');
      return;
    }

    if (ord.serviceType === 'ai_credits') {
      topUpCredits(ord.priceUsd);
      setCheckoutModalOpen(false);
      setPendingServiceOrder(null);
      setMode('portal');
    }
  };

  const submitServiceOrder = async (
    input: Omit<SubmittedServiceOrder, 'id' | 'referenceCode' | 'status' | 'createdAt'> & {
      status?: 'draft' | 'new';
      document?: { name: string; mimeType: string; base64: string; type?: string };
    }
  ): Promise<SubmittedServiceOrder> => {
    if (backendStatus === 'connected') {
      const res = await qabsApi.createServiceRequest({
        serviceSlug: input.serviceSlug,
        servicePath: input.servicePath,
        serviceTitleAr: input.serviceTitleAr,
        serviceTitleEn: input.serviceTitleEn,
        packageId: input.packageId,
        packageNameAr: input.packageNameAr,
        packageNameEn: input.packageNameEn,
        priceUsd: input.priceUsd,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        companyOrStoreName: input.companyOrStoreName,
        customFields: input.customFields,
        notes: input.notes,
        status: input.status || 'new',
        document: input.document
      });
      const mapped = mapDbServiceRequest(res.request);
      if (isAuthenticated) await refreshWorkspace();
      else setSubmittedServiceOrders(prev => [mapped, ...prev]);
      showToast(
        language === 'ar'
          ? `تم حفظ الطلب "${input.serviceTitleAr}" في الخادم برقم ${mapped.referenceCode}`
          : `Request saved on server (${mapped.referenceCode})`
      );
      return mapped;
    }

    const referenceCode = `QBS-${Math.floor(100000 + Math.random() * 899999)}`;
    const newOrder: SubmittedServiceOrder = {
      ...input,
      id: `ord_svc_${Date.now()}`,
      referenceCode,
      status: input.status || 'new',
      attachedDocumentName: input.document?.name,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    setSubmittedServiceOrders(prev => [newOrder, ...prev]);
    showToast(language === 'ar' ? `تم حفظ الطلب محلياً برقم ${referenceCode}` : `Order saved locally (${referenceCode})`);
    return newOrder;
  };

  const updateServiceOrderStatus = async (id: string, status: ServiceOrderStatus, adminNotes?: string): Promise<boolean> => {
    if (backendStatus === 'connected') {
      try {
        await qabsApi.updateServiceRequest(id, { status, adminNotes });
        await refreshWorkspace();
        showToast(language === 'ar' ? `تم تحديث حالة الطلب إلى ${status} وإشعار العميل ✓` : `Request status updated to ${status} ✓`);
        return true;
      } catch (err) {
        handleApiFailure(err, 'تعذر تحديث حالة الطلب', 'Failed to update request status');
        return false;
      }
    }
    setSubmittedServiceOrders(prev => prev.map(r => (r.id === id ? { ...r, status, adminNotes } : r)));
    return true;
  };

  const login = async (email: string, role: UserRole, password = ''): Promise<boolean> => {
    setAuthError(null);
    if (backendStatus === 'connected') {
      setAuthLoading(true);
      try {
        await qabsApi.login(email.trim(), password);
        const boot = await qabsApi.bootstrap();
        applyBootstrapPayload(boot);
        if (PRIVILEGED_ROLES.has(boot.user.role as UserRole)) {
          try {
            const ov = await qabsApi.adminOverview();
            setAdminOverview(ov);
          } catch {
            // ignore
          }
        }
        setAuthModalOpen(false);
        if (pendingServiceOrder) {
          setCheckoutModalOpen(true);
        } else if (PRIVILEGED_ROLES.has(boot.user.role as UserRole)) {
          setMode('admin');
        } else {
          setMode('portal');
        }
        showToast(language === 'ar' ? `مرحباً بك ${boot.user.name}` : `Welcome, ${boot.user.name}`);
        return true;
      } catch (err) {
        const msg = (err as ApiError)?.message || 'Invalid credentials';
        setAuthError(msg);
        showToast(msg);
        return false;
      } finally {
        setAuthLoading(false);
      }
    }

    const cleanEmail = email.trim() || 'client@qabs1.store';
    setUser(role === 'super_admin' ? { ...OWNER_USER_PROFILE, email: cleanEmail } : { ...INITIAL_USER, id: `usr_${Date.now()}`, name: cleanEmail.split('@')[0], email: cleanEmail, role: 'customer', credits: 50 });
    setIsAuthenticated(true);
    setAuthModalOpen(false);
    setMode(role === 'super_admin' ? 'admin' : 'portal');
    return true;
  };

  const loginOwner = async (email?: string, password?: string): Promise<boolean> => {
    return login(email?.trim() || OWNER_USER_PROFILE.email, 'super_admin', password || '');
  };

  const register = async (
    name: string,
    email: string,
    companyName: string,
    _role?: UserRole,
    password = ''
  ): Promise<boolean> => {
    setAuthError(null);
    if (backendStatus === 'connected') {
      setAuthLoading(true);
      try {
        const res = await qabsApi.register({ name: name.trim(), email: email.trim(), password, companyName: companyName.trim() });
        if (res.previewEmailVerifyToken) setPreviewVerifyToken(res.previewEmailVerifyToken);
        const boot = await qabsApi.bootstrap();
        applyBootstrapPayload(boot);
        setAuthModalOpen(false);
        setMode(pendingServiceOrder ? 'landing' : 'portal');
        if (pendingServiceOrder) setCheckoutModalOpen(true);
        showToast(language === 'ar' ? 'تم إنشاء حسابك المستقل في قاعدة البيانات بنجاح!' : 'Isolated client workspace created!');
        return true;
      } catch (err) {
        const msg = (err as ApiError)?.message || 'Registration failed';
        setAuthError(msg);
        showToast(msg);
        return false;
      } finally {
        setAuthLoading(false);
      }
    }

    setUser({
      id: `usr_client_${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      role: 'customer',
      avatar: '',
      companyName: companyName.trim(),
      credits: 50
    });
    setIsAuthenticated(true);
    setAuthModalOpen(false);
    setMode('portal');
    return true;
  };

  const requestPasswordReset = async (email: string): Promise<string | null> => {
    setAuthError(null);
    if (backendStatus === 'connected') {
      try {
        const res = await qabsApi.forgotPassword(email.trim());
        const tok = res.previewResetToken || null;
        setPreviewResetToken(tok);
        return tok;
      } catch (err) {
        const msg = (err as ApiError)?.message || 'Recovery failed';
        setAuthError(msg);
        return null;
      }
    }
    return 'preview-offline-token';
  };

  const confirmPasswordReset = async (token: string, newPassword: string): Promise<boolean> => {
    setAuthError(null);
    if (backendStatus === 'connected') {
      try {
        await qabsApi.resetPassword(token.trim(), newPassword);
        setPreviewResetToken(null);
        showToast(language === 'ar' ? 'تم تغيير كلمة المرور وإلغاء الجلسات السابقة ✓' : 'Password reset successfully ✓');
        return true;
      } catch (err) {
        const msg = (err as ApiError)?.message || 'Invalid or expired reset token';
        setAuthError(msg);
        return false;
      }
    }
    return true;
  };

  const confirmEmailVerification = async (token: string): Promise<boolean> => {
    if (backendStatus === 'connected') {
      try {
        await qabsApi.verifyEmail(token.trim());
        setPreviewVerifyToken(null);
        await refreshWorkspace();
        showToast(language === 'ar' ? 'تم تأكيد البريد الإلكتروني بنجاح ✓' : 'Email verified ✓');
        return true;
      } catch (err) {
        handleApiFailure(err, 'رمز التحقق غير صالح أو منتهي', 'Invalid or expired verification token');
        return false;
      }
    }
    setUser(prev => ({ ...prev, emailVerified: true }));
    return true;
  };

  const logout = async () => {
    if (backendStatus === 'connected') {
      try {
        await qabsApi.logout();
      } catch {
        // clear local state anyway
      }
      setCompanies([]);
      setStores([]);
      setProducts([]);
      setOrders([]);
      setCustomers([]);
      setInvoices([]);
      setTickets([]);
      setAuditLogs([]);
      setSubmittedServiceOrders([]);
      setNotifications([]);
      setAdminOverview(null);
    }
    setIsAuthenticated(false);
    setUser(INITIAL_USER);
    setPendingServiceOrder(null);
    setCheckoutModalOpen(false);
    setMode('landing');
    if (typeof window !== 'undefined' && window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    showToast(language === 'ar' ? 'تم تسجيل الخروج بنجاح' : 'Signed out cleanly');
  };

  // --- OTHER HELPERS ---
  const syncShopifyStore = (storeId: string, domain: string, _accessToken: string, webhooksConnected: boolean) => {
    const cleanDomain = domain.trim();
    if (backendStatus === 'connected') {
      void (async () => {
        try {
          // Persist non-secret Shopify domain & webhook preference cleanly (never store raw secret tokens on client/DB)
          await qabsApi.updateStore(storeId, {
            settings: {
              shopifyDomain: cleanDomain,
              shopifyWebhooksConnected: webhooksConnected
            }
          });
          await refreshWorkspace();
          showToast(
            language === 'ar'
              ? 'تم حفظ نطاق Shopify وحالة Webhooks في المسودة (التزامن الحي مقيد في المعاينة) ✓'
              : 'Shopify domain & webhook config persisted safely in draft ✓'
          );
        } catch (err) {
          handleApiFailure(err, 'تعذر حفظ إعدادات Shopify', 'Failed to save Shopify config');
        }
      })();
      return;
    }
    setStores(prev =>
      prev.map(s =>
        s.id === storeId
          ? {
              ...s,
              shopifyDomain: cleanDomain,
              shopifyWebhooksConnected: webhooksConnected
            }
          : s
      )
    );
    showToast(language === 'ar' ? 'تم حفظ بيانات الربط في المسودة (التشغيل الحي معطل في المعاينة)' : 'Integration configuration saved');
  };

  const toggleSetupStep = (storeId: string, stepId: string) => {
    setStores(prev =>
      prev.map(s => {
        if (s.id !== storeId) return s;
        const current = s.setupStepsCompleted || [];
        return {
          ...s,
          setupStepsCompleted: current.includes(stepId) ? current.filter(x => x !== stepId) : [...current, stepId]
        };
      })
    );
  };

  const addCompanyDocument = (
    companyId: string,
    name: string,
    docType: CompanyFormation['documents'][number]['type']
  ) => {
    const today = new Date().toISOString().split('T')[0];
    setCompanies(prev =>
      prev.map(c =>
        c.id === companyId ? { ...c, documents: [{ name, type: docType, status: 'ready', date: today }, ...c.documents] } : c
      )
    );
  };

  const activateProductionMode = (_storeId?: string) => {
    showToast(
      language === 'ar'
        ? 'بيئة المعاينة مقيدة أمنياً — بوابات الدفع والنشر المباشر لا تتفعل تلقائياً.'
        : 'Preview security gate: live payment & public auto-publish remain disabled.'
    );
  };

  const toggleProductionMode = () => {
    setIsProductionMode(false);
    activateProductionMode();
  };

  const executeAICommand = (prompt: string, storeId: string): AICommandHistoryItem => {
    const cleanPrompt = prompt.trim();
    const targetStore = stores.find(s => s.id === storeId) || stores[0];
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);

    if (backendStatus === 'connected') {
      const placeholder: AICommandHistoryItem = {
        id: `ai_pending_${Date.now()}`,
        prompt: cleanPrompt,
        responseAr: 'جاري تنفيذ الأمر عبر الخادم وتحديث سجل الأرصدة...',
        responseEn: 'Executing command on server & updating credit ledger...',
        timestamp
      };
      void (async () => {
        try {
          const res = await qabsApi.executeAI(cleanPrompt, targetStore?.id);
          await refreshWorkspace();
          const entry: AICommandHistoryItem = {
            id: res.result.id,
            prompt: cleanPrompt,
            responseAr: res.result.responseAr,
            responseEn: res.result.responseEn,
            timestamp: res.result.timestamp
          };
          setAiHistory(prev => [entry, ...prev]);
          showToast(language === 'ar' ? `تم التنفيذ — الرصيد المتبقي: ${res.creditsBalance}` : `Executed — Credits left: ${res.creditsBalance}`);
        } catch (err) {
          handleApiFailure(err, 'الرصيد غير كافٍ أو فشل التنفيذ في الخادم', 'Insufficient AI credits or execution failed');
        }
      })();
      return placeholder;
    }

    setUser(prev => ({ ...prev, credits: Math.max(0, (prev.credits || 0) - 1) }));
    const entry: AICommandHistoryItem = {
      id: `ai_${Date.now()}`,
      prompt: cleanPrompt,
      responseAr: `تم تحليل "${targetStore?.name || 'Workspace'}" في وضع المعاينة غير المتصل.`,
      responseEn: `Analyzed "${targetStore?.name || 'Workspace'}" in offline preview mode.`,
      timestamp
    };
    setAiHistory(prev => [entry, ...prev]);
    return entry;
  };

  const updateSectionSettings = <K extends keyof WorkspaceSectionSettings>(
    section: K,
    updates: Partial<WorkspaceSectionSettings[K]>
  ) => {
    setSectionSettings(prev => ({ ...prev, [section]: { ...prev[section], ...updates } }));
    showToast(language === 'ar' ? 'تم حفظ إعدادات القسم ✓' : 'Section settings saved ✓');
  };

  const exportWorkspaceBackupJson = (): string => {
    return JSON.stringify({ stores, companies, products, orders, invoices, submittedServiceOrders }, null, 2);
  };

  const importWorkspaceBackupJson = (): boolean => false;
  const resetWorkspaceData = () => {
    localStorage.removeItem(STORAGE_KEY);
    if (backendStatus === 'connected') void refreshWorkspace();
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        theme,
        toggleTheme,
        mode,
        setMode,
        backendStatus,
        authError,
        setAuthError,
        authLoading,
        previewVerifyToken,
        previewResetToken,
        refreshWorkspace,
        user,
        switchRole,
        companies,
        addCompany,
        updateCompanyStatus,
        advanceCompanyStage,
        stores,
        activeStoreId,
        setActiveStoreId,
        addStore,
        updateStoreTheme,
        updateStoreDetails,
        submitStoreForApproval,
        reviewStoreApproval,
        requestPaymentActivation,
        approveStorePayment,
        requestDomainVerification,
        verifyStoreDomain,
        saveStoreSnapshot,
        restoreStoreSnapshot,
        updateStoreSections,
        storeCategories,
        addStoreCategory,
        storeTeamMembers,
        addStoreTeamMember,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        orders,
        addOrder,
        updateOrderStatus,
        customers,
        addCustomer,
        discounts,
        addDiscount,
        toggleDiscountStatus,
        shippingZones,
        addShippingZone,
        storePages,
        saveStorePage,
        deleteStorePage,
        storeApps,
        toggleStoreApp,
        storeTemplates,
        addStoreTemplate,
        triggerSystemBackup,
        banking,
        addBankAccount,
        tickets,
        addTicket,
        resolveTicket,
        staff,
        addStaff,
        updateStaffPermissions,
        removeStaff,
        auditLogs,
        notifications,
        unreadNotificationsCount,
        markNotificationRead,
        markAllNotificationsRead,
        requestDocuments,
        uploadRequestDocument,
        subscription,
        subscriptionHistory,
        creditLedger,
        changeSubscriptionPlan,
        invoices,
        verifyInvoiceWithProof,
        commissions,
        refunds,
        issueRefund,
        topUpCredits,
        issueOrderInvoice,
        syncShopifyStore,
        toggleSetupStep,
        addCompanyDocument,
        isProductionMode,
        activateProductionMode,
        toggleProductionMode,
        aiHistory,
        executeAICommand,
        sectionSettings,
        updateSectionSettings,
        exportWorkspaceBackupJson,
        importWorkspaceBackupJson,
        resetWorkspaceData,
        adminOverview,
        integrationsStatus,
        adminCreateStaffUser,
        adminUpdateStaffUser,
        adminUpdateServiceCatalog,
        adminSendBroadcastNotification,
        adminUpdatePlatformSettings,
        isAuthenticated,
        isOwner,
        authIntent,
        setAuthIntent,
        openClientAuth,
        openOwnerAuth,
        pendingServiceOrder,
        setPendingServiceOrder,
        checkoutModalOpen,
        setCheckoutModalOpen,
        requestServiceAction,
        completeServiceCheckout,
        authModalOpen,
        setAuthModalOpen,
        authMode,
        setAuthMode,
        login,
        loginOwner,
        register,
        requestPasswordReset,
        confirmPasswordReset,
        confirmEmailVerification,
        logout,
        submittedServiceOrders,
        submitServiceOrder,
        updateServiceOrderStatus,
        toastMessage,
        showToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
