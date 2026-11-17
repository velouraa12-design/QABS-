import React, { createContext, useContext, useState, useEffect } from 'react';
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
  PendingServiceOrder
} from '../types/index.ts';
import { SubmittedServiceOrder } from '../types/pages.ts';
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

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  mode: AppMode;
  setMode: (mode: AppMode) => void;
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
  requestPaymentActivation: (storeId: string, gatewayType: StoreInstance['gatewayType']) => void;
  approveStorePayment: (storeId: string, approved: boolean) => void;
  requestDomainVerification: (storeId: string, customDomain: string) => void;
  verifyStoreDomain: (storeId: string) => void;
  saveStoreSnapshot: (storeId: string, label: string) => void;
  restoreStoreSnapshot: (storeId: string, snapshotId: string) => void;
  updateStoreSections: (storeId: string, sections: StoreSectionBlock[]) => void;
  // Isolated Store Commerce Entities
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
  // Support, Staff, Audit & Subscriptions
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
  subscription: UserSubscription;
  changeSubscriptionPlan: (planId: 'starter' | 'growth' | 'enterprise', cycle: 'monthly' | 'annual') => void;
  invoices: Invoice[];
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
  completeServiceCheckout: (paymentMethod: 'Stripe' | 'PayPal' | 'Crypto' | 'BankTransfer') => void;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authMode: 'login' | 'register' | 'recover';
  setAuthMode: (mode: 'login' | 'register' | 'recover') => void;
  login: (email: string, role: UserRole) => void;
  loginOwner: (email?: string) => void;
  register: (name: string, email: string, companyName: string, role?: UserRole) => void;
  logout: () => void;
  submittedServiceOrders: SubmittedServiceOrder[];
  submitServiceOrder: (
    order: Omit<SubmittedServiceOrder, 'id' | 'referenceCode' | 'status' | 'createdAt'>
  ) => SubmittedServiceOrder;
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
    enableStripe: true,
    enablePayPal: false,
    enableBankTransfer: true,
    enableMoyasarTap: true,
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
    usdtTrc20Address: 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE',
    usdtErc20Address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    btcAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
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
    '/workspace'
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

  // Authentication must come from the server, never from editable localStorage.
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [mode, setMode] = useState<AppMode>(() =>
    persisted.isAuthenticated && isWorkspaceUrl() ? 'portal' : 'landing'
  );
  const [isProductionMode, setIsProductionMode] = useState<boolean>(persisted.isProductionMode ?? false);
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [companies, setCompanies] = useState<CompanyFormation[]>(persisted.companies ?? INITIAL_COMPANIES);
  const [stores, setStores] = useState<StoreInstance[]>(persisted.stores ?? INITIAL_STORES);
  const [activeStoreId, setActiveStoreId] = useState<string>(
    persisted.activeStoreId ?? INITIAL_STORES[0]?.id ?? 'store_01'
  );
  const [products, setProducts] = useState<StoreProduct[]>(persisted.products ?? INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<StoreOrder[]>(persisted.orders ?? INITIAL_ORDERS);
  const [customers, setCustomers] = useState<StoreCustomer[]>(persisted.customers ?? INITIAL_CUSTOMERS);
  const [discounts, setDiscounts] = useState<StoreDiscount[]>(persisted.discounts ?? INITIAL_DISCOUNTS);
  const [shippingZones, setShippingZones] = useState<StoreShippingZone[]>(persisted.shippingZones ?? INITIAL_SHIPPING_ZONES);
  const [storePages, setStorePages] = useState<StorePageItem[]>(persisted.storePages ?? INITIAL_STORE_PAGES);
  const [storeApps, setStoreApps] = useState<StoreAppAddon[]>(persisted.storeApps ?? INITIAL_STORE_APPS);
  const [storeTemplates, setStoreTemplates] = useState<StoreTemplatePreset[]>(persisted.storeTemplates ?? INITIAL_STORE_TEMPLATES);

  const [banking, setBanking] = useState<BankingAccount[]>(persisted.banking ?? INITIAL_BANKING);
  const [tickets, setTickets] = useState<SupportTicket[]>(persisted.tickets ?? INITIAL_TICKETS);
  const [staff, setStaff] = useState<StaffMember[]>(() => {
    const legacyMockIds = new Set(['stf_01', 'stf_02', 'stf_03']);
    const legacyNames = ['عبدالله السعدي', 'سارة المنصوري', 'ماجد الحربي', 'كريم عادل'];
    if (!Array.isArray(persisted.staff)) return INITIAL_STAFF;
    return persisted.staff.filter(
      m => !legacyMockIds.has(m.id) && !legacyNames.some(n => m.name.includes(n))
    );
  });
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(persisted.auditLogs ?? INITIAL_AUDIT_LOGS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Subscription & Billing states
  const [subscription, setSubscription] = useState<UserSubscription>(persisted.subscription ?? INITIAL_USER_SUBSCRIPTION);
  const [invoices, setInvoices] = useState<Invoice[]>(persisted.invoices ?? INITIAL_INVOICES);
  const [commissions] = useState<CommissionRecord[]>(INITIAL_COMMISSIONS);
  const [refunds, setRefunds] = useState<RefundRecord[]>(persisted.refunds ?? INITIAL_REFUNDS);
  const [aiHistory, setAiHistory] = useState<AICommandHistoryItem[]>(persisted.aiHistory ?? []);
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

  // Auth & Checkout modal states
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'recover'>('login');
  const [authIntent, setAuthIntent] = useState<'client' | 'owner'>('client');
  const [pendingServiceOrder, setPendingServiceOrder] = useState<PendingServiceOrder | null>(
    persisted.pendingServiceOrder ?? null
  );
  const [checkoutModalOpen, setCheckoutModalOpen] = useState<boolean>(false);
  const [submittedServiceOrders, setSubmittedServiceOrders] = useState<SubmittedServiceOrder[]>(
    persisted.submittedServiceOrders ?? []
  );

  const isOwner = isAuthenticated && user.role === 'super_admin';

  useEffect(() => {
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
      // Ignore storage quota errors
    }
  }, [
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

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
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
    // Role changes are server-authorized only. The client cannot promote itself.
    if (newRole === 'super_admin') {
      showToast(language === 'ar' ? 'لا يمكن منح صلاحية المدير من الواجهة. يلزم تحقق الخادم.' : 'Admin access must be granted by the server.');
      return;
    }
    setUser(prev => ({ ...prev, role: 'merchant' }));
    showToast(language === 'ar' ? 'تم اختيار مساحة العميل' : 'Client workspace selected');
  };

  const addCompany = (comp: Omit<CompanyFormation, 'id' | 'filingDate' | 'status' | 'documents'>) => {
    const today = new Date().toISOString().split('T')[0];
    const companyId = `comp_${Date.now()}`;
    const stage: 1 | 2 | 3 | 4 | 5 = comp.formationStage ?? 1;
    const totalUsd = comp.packagePriceUsd ?? sectionSettings.companyFormation.baseServiceFeeUsd;

    const initialDocs: CompanyFormation['documents'] = [
      {
        name: comp.jurisdiction === 'UK_LTD' ? 'Articles of Association (Draft)' : 'Articles of Organization (Filing Draft)',
        type: 'articles',
        status: 'generating',
        date: today
      },
      {
        name: 'Operating Agreement (Custom QABS Template)',
        type: 'operating_agreement',
        status: 'pending',
        date: today
      }
    ];
    if (comp.addons?.ein) {
      initialDocs.push({
        name: 'IRS Form SS-4 & Federal EIN Request',
        type: 'ein_letter',
        status: 'pending',
        date: today
      });
    }

    const newComp: CompanyFormation = {
      ...comp,
      id: companyId,
      filingDate: today,
      status: stage >= 5 ? 'approved' : stage >= 2 ? 'submitted_to_state' : 'under_review',
      renewalDueDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      formationStage: stage,
      packagePriceUsd: totalUsd,
      documents: initialDocs
    };
    setCompanies(prev => [newComp, ...prev]);

    // Reflect immediately in Invoices / Billing
    const invNum = `INV-CF-${Math.floor(10000 + Math.random() * 89999)}`;
    const sarAmount = Math.round(totalUsd * 3.75);
    const formationInvoice: Invoice = {
      id: `inv_${Date.now()}`,
      invoiceNumber: invNum,
      date: today,
      amount: sarAmount,
      currency: 'SAR',
      status: 'paid',
      descriptionAr: `رسوم تأسيس شركة دولية: ${comp.companyName} (${comp.jurisdiction}) — $${totalUsd}`,
      descriptionEn: `Company Formation Fee: ${comp.companyName} (${comp.jurisdiction}) — $${totalUsd}`,
      clientName: comp.ownerName || user.name
    };
    setInvoices(prev => [formationInvoice, ...prev]);

    appendAudit(
      `تقديم طلب تأسيس شركة جديدة (${comp.companyName}) بقيمة $${totalUsd}`,
      `Submitted new company formation (${comp.companyName}) for $${totalUsd}`,
      comp.companyName
    );
    showToast(
      language === 'ar'
        ? `تم إرسال طلب تأسيس "${comp.companyName}" وإصدار الفاتورة ${invNum} بنجاح!`
        : `Formation request for "${comp.companyName}" submitted and invoiced (${invNum})!`
    );
  };

  const updateCompanyStatus = (id: string, status: CompanyFormation['status']) => {
    setCompanies(prev => prev.map(c => (c.id === id ? { ...c, status } : c)));
  };

  const advanceCompanyStage = (id: string, nextStage?: 1 | 2 | 3 | 4 | 5) => {
    const today = new Date().toISOString().split('T')[0];
    const target = companies.find(c => c.id === id);
    if (!target) return;

    const currentStage = target.formationStage ?? (target.status === 'approved' ? 5 : target.status === 'submitted_to_state' ? 2 : 1);
    const computedStage = (nextStage ?? Math.min(5, currentStage + 1)) as 1 | 2 | 3 | 4 | 5;
    let generatedStoreId = target.linkedStoreId;

    if (computedStage === 5 && sectionSettings.companyFormation.autoCreateStoreOnCompletion && !generatedStoreId) {
      generatedStoreId = `store_cf_${Date.now()}`;
      const cleanSub = target.companyName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .slice(0, 14) || `qabs${Math.floor(100 + Math.random() * 899)}`;
      const newStore: StoreInstance = {
        id: generatedStoreId,
        ownerName: target.ownerName || user.name,
        ownerEmail: target.ownerEmail || user.email,
        name: target.companyName,
        activityAr: target.activity || 'تجارة إلكترونية دولية مرتبطة بالشركة',
        activityEn: target.activity || 'International E-Commerce Entity',
        country: target.jurisdiction === 'UK_LTD' ? 'GB' : 'US',
        defaultLanguage: 'both',
        subdomain: `${cleanSub}.qabs1.store`,
        currency: 'USD',
        taxRate: 0,
        productsCount: 0,
        ordersCount: 0,
        totalRevenue: 0,
        createdAt: today,
        status: 'draft',
        approvalStatus: 'draft',
        paymentConnected: !!target.addons?.stripePayPal,
        paymentApprovalStatus: target.addons?.stripePayPal ? 'pending_admin_approval' : 'unconfigured',
        gatewayType: 'Stripe',
        theme: 'gold_executive',
        templateId: 'tpl_luxury_royal',
        primaryColor: '#14243E',
        accentColor: '#D5B46B',
        fontFamily: 'Cairo',
        sections: DEFAULT_STORE_SECTIONS.map(sec => ({ ...sec }))
      };
      setStores(prev => [newStore, ...prev]);
    }

    if (computedStage === 5 && target.addons?.businessBank && !target.bankReady) {
      setBanking(prev => {
        if (prev.some(b => b.linkedCompany === target.companyName)) return prev;
        return [
          {
            id: `bnk_${Date.now()}`,
            provider: 'Mercury',
            accountName: `${target.companyName} OPERATING`,
            accountNumberMasked: `•••• ${Math.floor(1000 + Math.random() * 8999)}`,
            routingNumber: '021000021',
            currency: target.jurisdiction === 'UK_LTD' ? 'GBP' : 'USD',
            balance: 0,
            status: 'verified',
            linkedCompany: target.companyName
          },
          ...prev
        ];
      });
    }

    setCompanies(prev =>
      prev.map(c => {
        if (c.id !== id) return c;
        const nextStatus: CompanyFormation['status'] =
          computedStage === 5 ? 'approved' : computedStage >= 2 ? 'submitted_to_state' : 'under_review';
        const nextFileNum =
          computedStage >= 2
            ? c.stateFileNumber || c.crn || `${c.jurisdiction.replace('US_', '').slice(0, 2).toUpperCase()}-2026-${Math.floor(100000 + Math.random() * 899999)}`
            : c.stateFileNumber;
        const nextEin =
          computedStage >= 4
            ? c.ein || `${Math.floor(81 + Math.random() * 17)}-${Math.floor(1000000 + Math.random() * 8999999)}`
            : c.ein;

        const updatedDocs: CompanyFormation['documents'] = [
          {
            name: c.jurisdiction === 'UK_LTD' ? 'Certificate of Incorporation & Articles' : 'Articles of Organization (Certified)',
            type: 'articles',
            status: computedStage >= 3 ? 'ready' : 'generating',
            date: today
          },
          {
            name: 'Operating Agreement (Signed QABS Legal)',
            type: 'operating_agreement',
            status: computedStage >= 3 ? 'ready' : 'pending',
            date: today
          },
          {
            name: c.jurisdiction === 'UK_LTD' ? 'HMRC Corporation Tax UTR Letter' : 'Official IRS EIN Letter (CP575)',
            type: 'ein_letter',
            status: computedStage >= 4 ? 'ready' : 'generating',
            date: today
          },
          {
            name: 'Banking Resolution & Legal Welcome Kit',
            type: 'resolution',
            status: computedStage >= 5 ? 'ready' : 'pending',
            date: today
          }
        ];

        return {
          ...c,
          formationStage: computedStage,
          status: nextStatus,
          stateFileNumber: c.jurisdiction === 'UK_LTD' ? undefined : nextFileNum,
          crn: c.jurisdiction === 'UK_LTD' ? nextFileNum : c.crn,
          ein: nextEin,
          bankReady: computedStage >= 5 && !!c.addons?.businessBank ? true : c.bankReady,
          gatewaysReady: computedStage >= 5 && !!c.addons?.stripePayPal ? true : c.gatewaysReady,
          linkedStoreId: generatedStoreId || c.linkedStoreId,
          documents:
            computedStage === 5 && !sectionSettings.companyFormation.autoCreateDocsFolderOnCompletion
              ? c.documents
              : updatedDocs
        };
      })
    );

    appendAudit(
      `تحديث مرحلة تأسيس الشركة (${target.companyName}) إلى المرحلة ${computedStage} من 5`,
      `Advanced company formation (${target.companyName}) to stage ${computedStage}/5`,
      target.companyName
    );
    showToast(
      language === 'ar'
        ? computedStage === 5
          ? `اكتمل تأسيس "${target.companyName}" وتم تسليم الحقيبة القانونية في المستندات!`
          : `تمت ترقية "${target.companyName}" للمرحلة ${computedStage} من 5 ✓`
        : `Advanced "${target.companyName}" to stage ${computedStage}/5 ✓`
    );
  };

  // --- QABS STORES MULTI-TENANT ACTIONS ---
  const addStore = (
    storeData: Omit<StoreInstance, 'id' | 'productsCount' | 'ordersCount' | 'totalRevenue' | 'createdAt'>
  ) => {
    const newStoreId = `store_${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];
    const newStore: StoreInstance = {
      ...storeData,
      id: newStoreId,
      ownerName: storeData.ownerName || user.name,
      ownerEmail: storeData.ownerEmail || user.email,
      activityAr: storeData.activityAr || 'تجارة إلكترونية عامة',
      activityEn: storeData.activityEn || 'General Commerce',
      country: storeData.country || 'SA',
      defaultLanguage: storeData.defaultLanguage || 'both',
      taxRate: storeData.taxRate ?? 15,
      productsCount: 0,
      ordersCount: 0,
      totalRevenue: 0,
      createdAt: today,
      status: 'draft',
      approvalStatus: 'draft',
      paymentConnected: false,
      paymentApprovalStatus: 'unconfigured',
      domainVerified: false,
      templateId: storeData.templateId || 'tpl_luxury_gold',
      primaryColor: storeData.primaryColor || '#004457',
      accentColor: storeData.accentColor || '#C8A24A',
      fontFamily: storeData.fontFamily || 'Cairo',
      headerStyle: storeData.headerStyle || 'executive',
      footerTextAr: storeData.footerTextAr || `جميع الحقوق محفوظة © ${storeData.name} — يعمل عبر منصة متاجر قبس QABS Stores`,
      footerTextEn: storeData.footerTextEn || `All rights reserved © ${storeData.name} — Powered by QABS Stores`,
      sections: storeData.sections || DEFAULT_STORE_SECTIONS.map(sec => ({ ...sec })),
      designVersions: [
        {
          id: `ver_${Date.now()}`,
          label: 'النسخة التأسيسية 1.0',
          savedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
          theme: storeData.theme || 'gold_executive',
          primaryColor: storeData.primaryColor || '#004457',
          accentColor: storeData.accentColor || '#C8A24A',
          fontFamily: storeData.fontFamily || 'Cairo',
          sections: (storeData.sections || DEFAULT_STORE_SECTIONS).map(s => ({ ...s }))
        }
      ]
    };

    setStores(prev => [newStore, ...prev]);
    setActiveStoreId(newStore.id);

    // Seed default isolated pages for the new store
    const defaultPages: StorePageItem[] = [
      {
        id: `pg_${Date.now()}_1`,
        storeId: newStoreId,
        slug: 'home',
        titleAr: 'الصفحة الرئيسية',
        titleEn: 'Home Page',
        type: 'home',
        contentAr: `مرحباً بكم في ${storeData.name} — وجهتكم الأولى للتسوق الإلكتروني الموثوق.`,
        contentEn: `Welcome to ${storeData.name} — your premier online shopping destination.`,
        published: true,
        updatedAt: today
      },
      {
        id: `pg_${Date.now()}_2`,
        storeId: newStoreId,
        slug: 'about',
        titleAr: 'من نحن',
        titleEn: 'About Us',
        type: 'about',
        contentAr: `نحن في ${storeData.name} نلتزم بتقديم منتجات عالية الجودة وخدمة عملاء استثنائية.`,
        contentEn: `At ${storeData.name}, we are committed to top-tier quality and customer care.`,
        published: true,
        updatedAt: today
      },
      {
        id: `pg_${Date.now()}_3`,
        storeId: newStoreId,
        slug: 'contact',
        titleAr: 'اتصل بنا',
        titleEn: 'Contact Us',
        type: 'contact',
        contentAr: `للتواصل مع فريق خدمة العملاء في ${storeData.name}: البريد الإلكتروني ${user.email}`,
        contentEn: `Contact ${storeData.name} support via email: ${user.email}`,
        published: true,
        updatedAt: today
      },
      {
        id: `pg_${Date.now()}_4`,
        storeId: newStoreId,
        slug: 'policy',
        titleAr: 'سياسة الاستبدال والاسترجاع',
        titleEn: 'Return & Refund Policy',
        type: 'policy',
        contentAr: 'يحق للعميل طلب الاستبدال أو الاسترجاع خلال 14 يوماً من تاريخ استلام الطلب.',
        contentEn: 'Customers may request a return or exchange within 14 days of delivery.',
        published: true,
        updatedAt: today
      }
    ];
    setStorePages(prev => [...defaultPages, ...prev]);

    appendAudit(
      `إنشاء متجر إلكتروني مستقل جديد (${storeData.name}) بانتظار التجهيز والاعتماد`,
      `Created new isolated store (${storeData.name}) in draft state`,
      `${storeData.subdomain}`
    );

    showToast(
      language === 'ar'
        ? `تم إنشاء متجر "${storeData.name}" بنجاح! يمكنك الآن تخصيصه وإضافة منتجاته.`
        : `Store "${storeData.name}" created! Customize and add products now.`
    );
  };

  const updateStoreTheme = (id: string, newTheme: StoreInstance['theme'], customDomain?: string) => {
    setStores(prev =>
      prev.map(s => (s.id === id ? { ...s, theme: newTheme, customDomain: customDomain ?? s.customDomain } : s))
    );
    showToast(language === 'ar' ? 'تم تحديث مظهر المتجر بنجاح' : 'Store theme updated successfully');
  };

  const updateStoreDetails = (id: string, updates: Partial<StoreInstance>) => {
    setStores(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
    showToast(language === 'ar' ? 'تم حفظ إعدادات وتصميم المتجر بنجاح' : 'Store settings & design saved');
  };

  const submitStoreForApproval = (storeId: string) => {
    const targetStore = stores.find(s => s.id === storeId);
    setStores(prev =>
      prev.map(s =>
        s.id === storeId
          ? {
              ...s,
              status: 'pending_approval',
              approvalStatus: 'pending_review',
              adminFeedback: undefined
            }
          : s
      )
    );
    appendAudit(
      `إرسال المتجر (${targetStore?.name || storeId}) إلى إدارة قبس للمراجعة والاعتماد قبل النشر`,
      `Submitted store (${targetStore?.name || storeId}) to QABS Admin for publication review`,
      targetStore?.subdomain || storeId,
      'info'
    );
    showToast(
      language === 'ar'
        ? 'تم إرسال المتجر إلى لوحة إدارة قبس للمراجعة والاعتماد!'
        : 'Store submitted to QABS Central Admin for approval!'
    );
  };

  const reviewStoreApproval = (
    storeId: string,
    decision: 'approved_published' | 'changes_requested' | 'rejected',
    feedback?: string
  ) => {
    const targetStore = stores.find(s => s.id === storeId);
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

    const statusLabelAr =
      decision === 'approved_published'
        ? 'اعتماد ونشر المتجر رسمياً'
        : decision === 'changes_requested'
        ? 'طلب تعديلات على المتجر قبل النشر'
        : 'رفض طلب نشر المتجر';

    appendAudit(
      `${statusLabelAr}: ${targetStore?.name || storeId}`,
      `Store review decision (${decision}): ${targetStore?.name || storeId}`,
      targetStore?.subdomain || storeId,
      decision === 'approved_published' ? 'success' : 'warning'
    );

    showToast(
      language === 'ar'
        ? `تم تحديث حالة اعتماد المتجر: ${statusLabelAr}`
        : `Store approval status updated: ${decision}`
    );
  };

  const requestPaymentActivation = (storeId: string, gatewayType: StoreInstance['gatewayType']) => {
    const targetStore = stores.find(s => s.id === storeId);
    setStores(prev =>
      prev.map(s =>
        s.id === storeId
          ? {
              ...s,
              gatewayType,
              paymentConnected: false,
              paymentApprovalStatus: 'pending_admin_approval'
            }
          : s
      )
    );
    appendAudit(
      `طلب تفعيل بوابة الدفع (${gatewayType}) للمتجر ${targetStore?.name} — بانتظار التحقق اليدوي من قبس`,
      `Requested payment gateway (${gatewayType}) activation for ${targetStore?.name} — pending manual admin verification`,
      targetStore?.subdomain || storeId,
      'info'
    );
    showToast(
      language === 'ar'
        ? `تم رفع طلب ربط بوابة ${gatewayType} إلى إدارة قبس (لا يتم التفعيل التلقائي إلا بعد الاعتماد)`
        : `Payment gateway ${gatewayType} request sent to QABS Admin for manual approval`
    );
  };

  const approveStorePayment = (storeId: string, approved: boolean) => {
    const targetStore = stores.find(s => s.id === storeId);
    setStores(prev =>
      prev.map(s =>
        s.id === storeId
          ? {
              ...s,
              paymentConnected: approved,
              paymentApprovalStatus: approved ? 'approved_active' : 'unconfigured'
            }
          : s
      )
    );
    appendAudit(
      approved
        ? `اعتماد وتفعيل بوابة الدفع (${targetStore?.gatewayType}) للمتجر ${targetStore?.name}`
        : `إيقاف/رفض تفعيل بوابة الدفع للمتجر ${targetStore?.name}`,
      approved
        ? `Approved & activated payment gateway (${targetStore?.gatewayType}) for ${targetStore?.name}`
        : `Rejected payment gateway for ${targetStore?.name}`,
      targetStore?.subdomain || storeId,
      approved ? 'success' : 'warning'
    );
    showToast(
      language === 'ar'
        ? approved
          ? 'تم اعتماد وتفعيل بوابة الدفع للمتجر بنجاح!'
          : 'تم رفض طلب بوابة الدفع'
        : approved
        ? 'Payment gateway approved and activated!'
        : 'Payment gateway request rejected'
    );
  };

  const requestDomainVerification = (storeId: string, customDomain: string) => {
    const cleanDomain = customDomain.trim().toLowerCase().replace(/^https?:\/\//, '');
    setStores(prev =>
      prev.map(s =>
        s.id === storeId
          ? {
              ...s,
              customDomain: cleanDomain,
              domainVerified: false
            }
          : s
      )
    );
    appendAudit(
      `طلب ربط نطاق مخصص (${cleanDomain}) بانتظار فحص DNS من قبس`,
      `Requested custom domain (${cleanDomain}) DNS verification`,
      cleanDomain,
      'info'
    );
    showToast(
      language === 'ar'
        ? `تم تسجيل النطاق ${cleanDomain} وإرسال طلب فحص DNS إلى لوحة قبس`
        : `Domain ${cleanDomain} registered and queued for DNS verification`
    );
  };

  const verifyStoreDomain = (storeId: string) => {
    const targetStore = stores.find(s => s.id === storeId);
    setStores(prev => prev.map(s => (s.id === storeId ? { ...s, domainVerified: true } : s)));
    appendAudit(
      `تأكيد فحص CNAME وتفعيل شهادة SSL للنطاق ${targetStore?.customDomain}`,
      `Verified DNS & provisioned SSL for ${targetStore?.customDomain}`,
      targetStore?.customDomain || storeId,
      'success'
    );
    showToast(
      language === 'ar'
        ? 'تم التحقق من النطاق وتفعيل شهادة SSL بنجاح!'
        : 'Custom domain verified and SSL activated!'
    );
  };

  const saveStoreSnapshot = (storeId: string, label: string) => {
    setStores(prev =>
      prev.map(s => {
        if (s.id !== storeId) return s;
        const newSnap = {
          id: `ver_${Date.now()}`,
          label: label || `نسخة محفوظة (${new Date().toLocaleTimeString()})`,
          savedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
          theme: s.theme,
          primaryColor: s.primaryColor || '#004457',
          accentColor: s.accentColor || '#C8A24A',
          fontFamily: s.fontFamily || 'Cairo',
          sections: (s.sections || DEFAULT_STORE_SECTIONS).map(sec => ({ ...sec }))
        };
        return {
          ...s,
          designVersions: [newSnap, ...(s.designVersions || [])]
        };
      })
    );
    showToast(
      language === 'ar'
        ? 'تم حفظ نسخة التصميم في سجل استوديو قبس بنجاح'
        : 'Saved design snapshot in QABS Studio history'
    );
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
    showToast(
      language === 'ar' ? 'تم استعادة نسخة التصميم بنجاح!' : 'Design version restored successfully!'
    );
  };

  const updateStoreSections = (storeId: string, sections: StoreSectionBlock[]) => {
    setStores(prev => prev.map(s => (s.id === storeId ? { ...s, sections } : s)));
  };

  // --- PRODUCTS (Strictly isolated by storeId) ---
  const addProduct = (p: Omit<StoreProduct, 'id' | 'salesCount' | 'storeId'> & { storeId?: string }) => {
    const targetStoreId = p.storeId || activeStoreId;
    const newProduct: StoreProduct = {
      ...p,
      storeId: targetStoreId,
      id: `prod_${Date.now()}`,
      salesCount: 0
    };
    setProducts(prev => [newProduct, ...prev]);
    setStores(prev =>
      prev.map(s => (s.id === targetStoreId ? { ...s, productsCount: s.productsCount + 1 } : s))
    );
    showToast(language === 'ar' ? 'تم إضافة المنتج إلى المتجر بنجاح' : 'Product added to store catalog');
  };

  const updateProduct = (id: string, updates: Partial<StoreProduct>) => {
    setProducts(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
    showToast(language === 'ar' ? 'تم تعديل بيانات المنتج والمخزون' : 'Product & inventory updated');
  };

  const deleteProduct = (id: string) => {
    const prod = products.find(p => p.id === id);
    setProducts(prev => prev.filter(p => p.id !== id));
    if (prod) {
      setStores(prev =>
        prev.map(s => (s.id === prod.storeId ? { ...s, productsCount: Math.max(0, s.productsCount - 1) } : s))
      );
    }
    showToast(language === 'ar' ? 'تم حذف المنتج من المتجر' : 'Product deleted from store');
  };

  // --- ORDERS (with configurable prefix & automatic product stock deduction) ---
  const addOrder = (orderData: Omit<StoreOrder, 'id' | 'orderNumber' | 'date'>) => {
    const prefix = sectionSettings.orders.orderPrefix || 'QBS-';
    const shouldDeduct = sectionSettings.orders.autoDeductInventory !== false;
    const newOrder: StoreOrder = {
      ...orderData,
      shippingCarrier: orderData.shippingCarrier || sectionSettings.orders.defaultCarrier,
      shippingCost: orderData.shippingCost ?? sectionSettings.orders.defaultShippingRate,
      id: `ord_${Date.now()}`,
      orderNumber: `${prefix}${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toISOString().split('T')[0]
    };
    setOrders(prev => [newOrder, ...prev]);

    if (shouldDeduct && orderData.items && orderData.items.length > 0) {
      setProducts(prev =>
        prev.map(prod => {
          const orderedItem = orderData.items?.find(i => i.productId === prod.id);
          if (!orderedItem) return prod;
          const nextStock = Math.max(0, prod.stock - orderedItem.quantity);
          return {
            ...prod,
            stock: nextStock,
            salesCount: (prod.salesCount || 0) + orderedItem.quantity,
            status: nextStock === 0 ? 'out_of_stock' : prod.status
          };
        })
      );
    }

    setStores(prev =>
      prev.map(s =>
        s.id === orderData.storeId
          ? { ...s, ordersCount: s.ordersCount + 1, totalRevenue: s.totalRevenue + orderData.total }
          : s
      )
    );
    appendAudit(
      `إنشاء طلب جديد (${newOrder.orderNumber})${shouldDeduct ? ' وخصم المخزون تلقائياً' : ''}`,
      `Created order (${newOrder.orderNumber})`,
      newOrder.orderNumber
    );
    showToast(
      language === 'ar'
        ? `تم إنشاء الطلب ${newOrder.orderNumber}${shouldDeduct ? ' وخصم المخزون تلقائياً!' : '!'}`
        : `Order ${newOrder.orderNumber} created!`
    );
  };

  const updateOrderStatus = (id: string, status: StoreOrder['status'], trackingNumber?: string) => {
    setOrders(prev =>
      prev.map(o =>
        o.id === id
          ? {
              ...o,
              status,
              trackingNumber: trackingNumber !== undefined ? trackingNumber : o.trackingNumber
            }
          : o
      )
    );
    showToast(language === 'ar' ? 'تم تحديث حالة الطلب والشحنة' : 'Order & shipment status updated');
  };

  const issueOrderInvoice = (orderId: string): Invoice | null => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return null;

    if (targetOrder.invoiceId) {
      const existing = invoices.find(inv => inv.id === targetOrder.invoiceId);
      if (existing) {
        showToast(
          language === 'ar'
            ? `الفاتورة ${existing.invoiceNumber} صادرة مسبقاً لهذا الطلب`
            : `Invoice ${existing.invoiceNumber} already issued`
        );
        return existing;
      }
    }

    const store = stores.find(s => s.id === targetOrder.storeId);
    const newInvoice: Invoice = {
      id: `inv_${Date.now()}`,
      invoiceNumber: `INV-${targetOrder.orderNumber}`,
      date: new Date().toISOString().split('T')[0],
      amount: targetOrder.total,
      currency: targetOrder.currency || store?.currency || 'SAR',
      status: targetOrder.status === 'refunded' ? 'refunded' : 'paid',
      descriptionAr: `فاتورة طلب متجر (${store?.name || 'متجر قبس'}) — ${targetOrder.orderNumber}`,
      descriptionEn: `Store order invoice (${store?.name || 'QABS Store'}) — ${targetOrder.orderNumber}`,
      clientName: targetOrder.customerName
    };
    setInvoices(prev => [newInvoice, ...prev]);
    setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, invoiceId: newInvoice.id } : o)));
    appendAudit(
      `إصدار فاتورة مبيعات (${newInvoice.invoiceNumber}) للطلب ${targetOrder.orderNumber}`,
      `Issued sales invoice (${newInvoice.invoiceNumber}) for order ${targetOrder.orderNumber}`,
      newInvoice.invoiceNumber
    );
    showToast(
      language === 'ar'
        ? `تم إصدار الفاتورة ${newInvoice.invoiceNumber} وحفظها في الفواتير`
        : `Invoice ${newInvoice.invoiceNumber} issued and saved`
    );
    return newInvoice;
  };

  // --- CUSTOMERS ---
  const addCustomer = (c: Omit<StoreCustomer, 'id' | 'ordersCount' | 'totalSpent' | 'lastOrderDate'>) => {
    const newCustomer: StoreCustomer = {
      ...c,
      id: `cust_${Date.now()}`,
      ordersCount: 1,
      totalSpent: 0,
      lastOrderDate: new Date().toISOString().split('T')[0]
    };
    setCustomers(prev => [newCustomer, ...prev]);
    showToast(language === 'ar' ? 'تم إضافة العميل إلى قاعدة بيانات المتجر' : 'Customer added to store CRM');
  };

  // --- DISCOUNTS ---
  const addDiscount = (d: Omit<StoreDiscount, 'id' | 'usedCount'>) => {
    const newDiscount: StoreDiscount = {
      ...d,
      id: `dsc_${Date.now()}`,
      usedCount: 0
    };
    setDiscounts(prev => [newDiscount, ...prev]);
    showToast(language === 'ar' ? `تم إنشاء كود الخصم ${d.code} بنجاح` : `Discount code ${d.code} created`);
  };

  const toggleDiscountStatus = (id: string) => {
    setDiscounts(prev =>
      prev.map(d => (d.id === id ? { ...d, status: d.status === 'active' ? 'expired' : 'active' } : d))
    );
    showToast(language === 'ar' ? 'تم تحديث حالة الكوبون' : 'Coupon status updated');
  };

  // --- SHIPPING ZONES ---
  const addShippingZone = (z: Omit<StoreShippingZone, 'id'>) => {
    const newZone: StoreShippingZone = {
      ...z,
      id: `shp_${Date.now()}`
    };
    setShippingZones(prev => [newZone, ...prev]);
    showToast(language === 'ar' ? 'تم إضافة منطقة وطريقة الشحن للمتجر' : 'Shipping zone added to store');
  };

  // --- STORE PAGES ---
  const saveStorePage = (page: Omit<StorePageItem, 'id' | 'updatedAt'> & { id?: string }) => {
    const today = new Date().toISOString().split('T')[0];
    if (page.id) {
      setStorePages(prev =>
        prev.map(p => (p.id === page.id ? { ...p, ...page, id: page.id, updatedAt: today } : p))
      );
      showToast(language === 'ar' ? 'تم تحديث محتوى الصفحة بنجاح' : 'Store page updated');
    } else {
      const newPage: StorePageItem = {
        ...page,
        id: `pg_${Date.now()}`,
        updatedAt: today
      };
      setStorePages(prev => [newPage, ...prev]);
      showToast(language === 'ar' ? 'تم إنشاء الصفحة المخصصة في المتجر' : 'Custom page created in store');
    }
  };

  const deleteStorePage = (id: string) => {
    setStorePages(prev => prev.filter(p => p.id !== id));
    showToast(language === 'ar' ? 'تم حذف الصفحة' : 'Page deleted');
  };

  // --- STORE APPS ---
  const toggleStoreApp = (appId: string, storeId: string) => {
    setStoreApps(prev =>
      prev.map(app => {
        if (app.id !== appId) return app;
        const currentIds = app.installedStoreIds || app.installedStores || [];
        const exists = currentIds.includes(storeId);
        const updatedIds = exists
          ? currentIds.filter(id => id !== storeId)
          : [...currentIds, storeId];
        return { ...app, installedStoreIds: updatedIds, installedStores: updatedIds };
      })
    );
    showToast(
      language === 'ar' ? 'تم تحديث حالة التطبيق في متجرك' : 'Store app integration updated'
    );
  };

  // --- CENTRAL TEMPLATES ---
  const addStoreTemplate = (tpl: Omit<StoreTemplatePreset, 'id'>) => {
    const newTpl: StoreTemplatePreset = {
      ...tpl,
      id: `tpl_${Date.now()}`
    };
    setStoreTemplates(prev => [newTpl, ...prev]);
    appendAudit(
      `إضافة قالب متجر جديد في استوديو قبس: ${tpl.nameAr}`,
      `Added new store template preset: ${tpl.nameEn}`,
      newTpl.id
    );
    showToast(language === 'ar' ? 'تم نشر القالب الجديد لجميع متاجر قبس' : 'New store template published');
  };

  const triggerSystemBackup = (targetLabel?: string) => {
    appendAudit(
      `نسخ احتياطي مشفر لبيانات المتاجر والمنتجات والطلبات (${targetLabel || 'جميع متاجر قبس'})`,
      `Encrypted multi-tenant snapshot backup completed (${targetLabel || 'All QABS Stores'})`,
      targetLabel || 'QABS-Cloud-Vault',
      'success'
    );
    showToast(
      language === 'ar'
        ? 'تم إنشاء نسخة احتياطية مشفرة كاملة وحفظها في سجل العمليات!'
        : 'Full encrypted backup snapshot created and logged!'
    );
  };

  const addBankAccount = (bank: Omit<BankingAccount, 'id' | 'balance' | 'status'>) => {
    const newAccount: BankingAccount = {
      ...bank,
      id: `bnk_${Date.now()}`,
      balance: 1000,
      status: 'verified'
    };
    setBanking(prev => [newAccount, ...prev]);
  };

  const addTicket = (t: Omit<SupportTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'status'>) => {
    const newTicket: SupportTicket = {
      ...t,
      id: `tkt_${Date.now()}`,
      ticketNumber: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'open',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    setTickets(prev => [newTicket, ...prev]);
    showToast(
      language === 'ar'
        ? `تم فتح تذكرة الدعم ${newTicket.ticketNumber} بنجاح`
        : `Opened support ticket ${newTicket.ticketNumber}`
    );
  };

  const resolveTicket = (id: string) => {
    setTickets(prev =>
      prev.map(t => (t.id === id ? { ...t, status: 'resolved', updatedAt: 'الآن' } : t))
    );
    showToast(language === 'ar' ? 'تم إغلاق التذكرة بنجاح' : 'Ticket resolved');
  };

  const addStaff = (s: Omit<StaffMember, 'id' | 'lastActive' | 'status'>) => {
    const newMember: StaffMember = {
      ...s,
      id: `stf_${Date.now()}`,
      status: 'active',
      lastActive: 'نشط الآن'
    };
    setStaff(prev => [newMember, ...prev]);
    showToast(language === 'ar' ? 'تم إضافة عضو جديد بصلاحيات مخصصة' : 'Staff member added with custom permissions');
  };

  const updateStaffPermissions = (staffId: string, permissions: string[]) => {
    setStaff(prev => prev.map(m => (m.id === staffId ? { ...m, permissions } : m)));
    showToast(language === 'ar' ? 'تم تحديث صلاحيات الموظف وحفظها' : 'Staff permissions updated');
  };

  const removeStaff = (staffId: string) => {
    setStaff(prev => prev.filter(m => m.id !== staffId));
    showToast(language === 'ar' ? 'تم إزالة الموظف من القائمة' : 'Staff member removed');
  };

  const changeSubscriptionPlan = (planId: 'starter' | 'growth' | 'enterprise', cycle: 'monthly' | 'annual') => {
    const targetPlan = SUBSCRIPTION_PLANS.find(p => p.id === planId) || SUBSCRIPTION_PLANS[1];
    const newPrice = cycle === 'annual' ? targetPlan.priceAnnual : targetPlan.priceMonthly;
    setSubscription({
      planId,
      billingCycle: cycle,
      renewalDate: new Date(Date.now() + (cycle === 'annual' ? 365 : 30) * 86400000).toISOString().split('T')[0],
      status: 'active',
      currentPrice: newPrice
    });

    const newInv: Invoice = {
      id: `inv_${Date.now()}`,
      invoiceNumber: `INV-QBS-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      amount: newPrice * (cycle === 'annual' ? 12 : 1),
      currency: 'USD',
      status: 'paid',
      descriptionAr: `اشتراك متاجر قبس — ${targetPlan.nameAr} (${cycle === 'annual' ? 'سنوي' : 'شهري'})`,
      descriptionEn: `QABS Stores Subscription — ${targetPlan.nameEn} (${cycle})`,
      clientName: user.companyName || user.name
    };
    setInvoices(prev => [newInv, ...prev]);

    showToast(
      language === 'ar'
        ? `تم تحديث باقة متجرك إلى: ${targetPlan.nameAr}`
        : `Updated store plan to: ${targetPlan.nameEn}`
    );
  };

  const issueRefund = (orderNumber: string, amount: number, reasonAr: string, reasonEn: string) => {
    const newRefund: RefundRecord = {
      id: `ref_${Date.now()}`,
      orderNumber,
      amount,
      currency: 'USD',
      reasonAr,
      reasonEn,
      status: 'processed',
      date: new Date().toISOString().split('T')[0],
      customerName: user.name
    };
    setRefunds(prev => [newRefund, ...prev]);
    setOrders(prev => prev.map(o => (o.orderNumber === orderNumber ? { ...o, status: 'refunded' } : o)));

    showToast(
      language === 'ar'
        ? `تم تنفيذ استرجاع الطلب ${orderNumber} بقيمة $${amount}`
        : `Processed refund of $${amount} for order ${orderNumber}`
    );
  };

  const topUpCredits = (amount: number) => {
    setUser(prev => ({ ...prev, credits: prev.credits + amount }));
    showToast(
      language === 'ar'
        ? `تم شحن رصيد حساب المتجر بمبلغ +$${amount}`
        : `Recharged store account balance by +$${amount}`
    );
  };

  const openClientAuth = (initialMode: 'login' | 'register' = 'login') => {
    setAuthIntent('client');
    setAuthMode(initialMode);
    setAuthModalOpen(true);
  };

  const openOwnerAuth = () => {
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
          ? 'يرجى تسجيل الدخول أو إنشاء حساب سريع لإتمام طلبك'
          : 'Please sign in or create an account to complete your order'
      );
    } else {
      setCheckoutModalOpen(true);
    }
  };

  const completeServiceCheckout = (paymentMethod: 'Stripe' | 'PayPal' | 'Crypto' | 'BankTransfer') => {
    if (!pendingServiceOrder) return;
    const ord = pendingServiceOrder;
    const d = ord.details || {};

    if (ord.serviceType === 'company_formation') {
      const jur = d.jurisdiction || 'US_WYOMING';
      const suffix = d.entityType || (jur === 'UK_LTD' ? 'LTD' : 'LLC');
      const baseName = (d.companyName || `${user.companyName || user.name || 'QABS VENTURES'}`).trim().toUpperCase();
      const companyName = baseName.endsWith(suffix) ? baseName : `${baseName} ${suffix}`;
      const addrMap: Record<string, { agent: string; address: string }> = {
        US_KENTUCKY: {
          agent: 'QABS Kentucky Registered Agent Services',
          address: '400 W Market St Ste 1800, Louisville, KY 40202, USA'
        },
        US_WYOMING: {
          agent: 'Northwest Registered Agent LLC (Cheyenne, WY)',
          address: '30 N Gould St Ste R, Sheridan, WY 82801, USA'
        },
        US_DELAWARE: {
          agent: 'The Corporation Trust Company (Wilmington, DE)',
          address: '1209 N Orange St, Wilmington, DE 19801, USA'
        },
        US_NEW_MEXICO: {
          agent: 'QABS New Mexico Statutory Agent LLC',
          address: '1209 Mountain Rd Pl NE, Albuquerque, NM 87110, USA'
        },
        UK_LTD: {
          agent: 'QABS UK Company Secretarial & Registered Office',
          address: '71-75 Shelton Street, Covent Garden, London, WC2H 9JQ, UK'
        }
      };
      const meta = addrMap[jur] || addrMap.US_WYOMING;
      addCompany({
        companyName,
        jurisdiction: jur,
        entityType: suffix,
        registeredAgent: meta.agent,
        registeredAddress: meta.address,
        renewalDueDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        activity: 'التجارة الإلكترونية والخدمات الدولية',
        ownerName: user.name,
        ownerEmail: user.email,
        packagePriceUsd: ord.priceUsd,
        addons: d.addons || {
          ein: true,
          physicalAddressAgent: true,
          businessBank: false,
          stripePayPal: false
        },
        formationStage: 1,
        notes: `تم الدفع عبر ${paymentMethod} — طلب من واجهة العرض العامة`
      });
      setCheckoutModalOpen(false);
      setPendingServiceOrder(null);
      setMode('portal');
      if (typeof window !== 'undefined') window.history.replaceState({ qabsWorkspace: 'company_formation' }, '', '#/company-formation');
      showToast(language === 'ar' ? `تم دفع طلب تأسيس "${companyName}" وحفظه في مساحة العمل!` : `Formation order paid & saved!`);
      return;
    }

    if (ord.serviceType === 'store_package') {
      const planId = d.planId || 'growth';
      const cycle = d.billingCycle || 'monthly';
      changeSubscriptionPlan(planId, cycle);
      if (d.storeName || planId) {
        const name = d.storeName?.trim() || `${user.companyName || user.name} Store`;
        const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 14) || `store${Math.floor(100 + Math.random() * 899)}`;
        addStore({
          name,
          ownerName: user.name,
          ownerEmail: user.email,
          activityAr: 'متجر إلكتروني مستقل — باقة قبس المعتمدة',
          activityEn: 'Independent QABS Store',
          country: 'SA',
          defaultLanguage: 'both',
          subdomain: `${slug}.qabs1.store`,
          currency: 'SAR',
          taxRate: 15,
          theme: 'gold_executive',
          templateId: 'tpl_luxury_royal',
          primaryColor: '#14243E',
          accentColor: '#D5B46B',
          fontFamily: 'Cairo',
          status: 'draft',
          approvalStatus: 'draft',
          paymentConnected: false,
          paymentApprovalStatus: 'unconfigured',
          gatewayType: paymentMethod === 'PayPal' ? 'PayPal' : 'Stripe'
        });
      }
      setCheckoutModalOpen(false);
      setPendingServiceOrder(null);
      setMode('portal');
      if (typeof window !== 'undefined') window.history.replaceState({ qabsWorkspace: 'my_stores' }, '', '#/stores');
      showToast(language === 'ar' ? `تم تفعيل باقة المتجر بنجاح عبر ${paymentMethod}!` : `Store package activated via ${paymentMethod}!`);
      return;
    }

    if (ord.serviceType === 'ai_credits') {
      const amount = d.creditsAmount || Math.max(50, ord.priceUsd * 10);
      topUpCredits(amount);
      setCheckoutModalOpen(false);
      setPendingServiceOrder(null);
      setMode('portal');
      if (typeof window !== 'undefined') window.history.replaceState({ qabsWorkspace: 'qabs_ai' }, '', '#/qabs-ai');
      showToast(language === 'ar' ? `تم شحن +${amount} رصيد قبس AI بنجاح!` : `Recharged +${amount} QABS AI credits!`);
    }
  };

  const submitServiceOrder = (
    input: Omit<SubmittedServiceOrder, 'id' | 'referenceCode' | 'status' | 'createdAt'>
  ): SubmittedServiceOrder => {
    const referenceCode = `QBS-${Math.floor(100000 + Math.random() * 899999)}`;
    const newOrder: SubmittedServiceOrder = {
      ...input,
      id: `ord_svc_${Date.now()}`,
      referenceCode,
      status: 'received',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    setSubmittedServiceOrders(prev => [newOrder, ...prev]);
    appendAudit(
      `استلام طلب خدمة مستقل (${input.serviceTitleAr}) رقم المرجع ${referenceCode}`,
      `Received service request (${input.serviceTitleEn}) ref ${referenceCode}`,
      referenceCode
    );
    showToast(
      language === 'ar'
        ? `تم حفظ طلب "${input.serviceTitleAr}" برقم مرجعي ${referenceCode}`
        : `Service order "${input.serviceTitleEn}" saved (${referenceCode})`
    );
    return newOrder;
  };

  const login = (email: string, role: UserRole) => {
    void email;
    void role;
    showToast(language === 'ar' ? 'تسجيل الدخول غير متاح حتى ربط نموذج الدخول بخدمة المصادقة والتحقق من كلمة المرور.' : 'Sign-in is unavailable until the form is connected to server-side authentication.');
    return;
    const cleanEmail = email.trim() || (role === 'super_admin' ? OWNER_USER_PROFILE.email : 'client@qabs1.store');
    if (role === 'super_admin') {
      setUser({
        ...OWNER_USER_PROFILE,
        email: cleanEmail
      });
    } else {
      const friendlyName = cleanEmail.split('@')[0] || 'عميل منصة قبس';
      setUser({
        id: `usr_client_${Date.now()}`,
        name: friendlyName,
        email: cleanEmail,
        role: 'merchant',
        avatar: '',
        companyName: '',
        credits: 250
      });
    }
    setIsAuthenticated(true);
    setAuthModalOpen(false);

    if (pendingServiceOrder) {
      setCheckoutModalOpen(true);
      showToast(
        language === 'ar'
          ? 'تم تسجيل الدخول! تابع إتمام الدفع لخدمتك المختارة'
          : 'Signed in! Complete checkout for your selected service'
      );
    } else if (role === 'super_admin') {
      setMode('admin');
      showToast(language === 'ar' ? `أهلاً بك ${OWNER_USER_PROFILE.name} — لوحة الإدارة الكاملة` : 'Welcome Owner Anwar Al-Ghazali');
    } else {
      setMode('portal');
      showToast(language === 'ar' ? 'مرحباً بك في مساحة عملك الخاصة!' : 'Welcome to your client workspace!');
    }
  };

  const loginOwner = (_email?: string) => {
    showToast(language === 'ar' ? 'دخول الإدارة يتطلب مصادقة خادمية وصلاحية مالك معتمدة.' : 'Admin sign-in requires verified server-side owner authorization.');
  };

  const register = (_name: string, _email: string, _companyName: string, _role?: UserRole) => {
    showToast(language === 'ar' ? 'إنشاء الحساب غير متاح حتى ربط النموذج بخدمة التسجيل والتحقق من البريد.' : 'Registration is unavailable until server-side signup and email verification are connected.');
    return;
    setUser({
      id: `usr_client_${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      role: 'merchant',
      avatar: '',
      companyName: companyName.trim(),
      credits: 200
    });
    setIsAuthenticated(true);
    setAuthModalOpen(false);

    if (pendingServiceOrder) {
      setCheckoutModalOpen(true);
      showToast(
        language === 'ar'
          ? 'تم إنشاء حسابك! أكمل الآن دفع الخدمة التي اخترتها'
          : 'Account created! Complete checkout for your selected service'
      );
    } else {
      setMode('portal');
      showToast(language === 'ar' ? 'تم إنشاء حساب العميل وفتح مساحة العمل!' : 'Client account created successfully!');
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(INITIAL_USER);
    setPendingServiceOrder(null);
    setCheckoutModalOpen(false);
    setMode('landing');
    if (typeof window !== 'undefined' && window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    showToast(language === 'ar' ? 'تم تسجيل الخروج والعودة للواجهة العامة' : 'Logged out to public showcase');
  };

  // --- SHOPIFY ADMIN API SYNC ---
  const syncShopifyStore = (
    storeId: string,
    domain: string,
    accessToken: string,
    webhooksConnected: boolean
  ) => {
    const cleanDomain = domain.trim() || 'qabs-store.myshopify.com';
    const nowLabel = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const storeProdsCount = products.filter(p => p.storeId === storeId).length;

    setStores(prev =>
      prev.map(s =>
        s.id === storeId
          ? {
              ...s,
              shopifyDomain: cleanDomain,
              shopifyAccessToken: accessToken.trim(),
              shopifyWebhooksConnected: webhooksConnected,
              shopifyLastSync: nowLabel,
              shopifySyncedProductsCount: storeProdsCount
            }
          : s
      )
    );
    appendAudit(
      `مزامنة فورية مع Shopify Admin API للنطاق ${cleanDomain}`,
      `Instant Shopify Admin API sync completed for ${cleanDomain}`,
      cleanDomain
    );
    showToast(
      language === 'ar'
        ? `تمت المزامنة الفورية مع ${cleanDomain} (${storeProdsCount} منتجات متزامنة)`
        : `Synced ${cleanDomain} immediately (${storeProdsCount} products)`
    );
  };

  // --- 4-STEP SETUP CHECKLIST ---
  const toggleSetupStep = (storeId: string, stepId: string) => {
    setStores(prev =>
      prev.map(s => {
        if (s.id !== storeId) return s;
        const current = s.setupStepsCompleted || [];
        const exists = current.includes(stepId);
        return {
          ...s,
          setupStepsCompleted: exists ? current.filter(id => id !== stepId) : [...current, stepId]
        };
      })
    );
  };

  // --- ADD DOCUMENT TO VAULT ---
  const addCompanyDocument = (
    companyId: string,
    name: string,
    docType: CompanyFormation['documents'][number]['type']
  ) => {
    const today = new Date().toISOString().split('T')[0];
    setCompanies(prev =>
      prev.map(c =>
        c.id === companyId
          ? {
              ...c,
              documents: [{ name, type: docType, status: 'ready', date: today }, ...c.documents]
            }
          : c
      )
    );
    appendAudit(`إضافة مستند جديد (${name}) إلى خزينة المستندات`, `Added document (${name}) to vault`, name);
    showToast(language === 'ar' ? `تم حفظ المستند "${name}" في الخزينة` : `Document "${name}" saved`);
  };

  // --- PRODUCTION MODE ACTIVATION (Approve Payment, Shipping & Persist) ---
  const activateProductionMode = (storeId?: string) => {
    const targetId = storeId || activeStoreId;
    setIsProductionMode(true);
    setStores(prev =>
      prev.map(s =>
        s.id === targetId || !storeId
          ? {
              ...s,
              status: 'active',
              approvalStatus: 'approved_published',
              paymentConnected: true,
              paymentApprovalStatus: 'approved_active',
              domainVerified: s.customDomain ? true : s.domainVerified,
              adminFeedback: undefined
            }
          : s
      )
    );
    setShippingZones(prev => prev.map(z => (z.storeId === targetId || !storeId ? { ...z, active: true, status: 'active' } : z)));
    appendAudit(
      'تفعيل وضع الإنتاج واعتماد بوابة الدفع والشحن من إدارة قبس',
      'Activated Production Portal mode and approved payment & shipping',
      targetId
    );
    showToast(
      language === 'ar'
        ? 'تم تفعيل البوابة الحقيقية (وضع الإنتاج) واعتماد الدفع والشحن وحفظ البيانات!'
        : 'Production Mode activated! Payment & shipping approved and state persisted.'
    );
  };

  const toggleProductionMode = () => {
    if (!isProductionMode) {
      activateProductionMode(activeStoreId);
    } else {
      setIsProductionMode(false);
      showToast(
        language === 'ar'
          ? 'تم الرجوع إلى وضع الاختبار والمعاينة المعزولة'
          : 'Switched back to Test / Preview Mode'
      );
    }
  };

  // --- QABS AI STORE COMMAND ENGINE ---
  const executeAICommand = (prompt: string, storeId: string): AICommandHistoryItem => {
    const cleanPrompt = prompt.trim();
    const lower = cleanPrompt.toLowerCase();
    const targetStore = stores.find(s => s.id === storeId) || stores[0];
    const storeProds = products.filter(p => p.storeId === storeId);
    const storeOrds = orders.filter(o => o.storeId === storeId);
    const currency = targetStore?.currency || 'SAR';
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);

    let responseAr = '';
    let responseEn = '';
    let actionSummaryAr: string | undefined;
    let actionSummaryEn: string | undefined;

    if (
      cleanPrompt.includes('سعر') ||
      cleanPrompt.includes('أسعار') ||
      cleanPrompt.includes('ارفع') ||
      cleanPrompt.includes('خفض') ||
      lower.includes('price')
    ) {
      const pctMatch = cleanPrompt.match(/(\d+(?:\.\d+)?)\s*%/);
      const numMatch = cleanPrompt.match(/(\d+(?:\.\d+)?)/);
      const isDecrease = cleanPrompt.includes('خفض') || cleanPrompt.includes('خصم') || lower.includes('decrease') || lower.includes('reduce');
      const pct = pctMatch ? Number(pctMatch[1]) : numMatch ? Number(numMatch[1]) : 10;
      const factor = isDecrease ? Math.max(0.1, 1 - pct / 100) : 1 + pct / 100;

      if (storeProds.length > 0) {
        setProducts(prev =>
          prev.map(p => (p.storeId === storeId ? { ...p, price: Math.max(1, Math.round(p.price * factor)) } : p))
        );
        actionSummaryAr = `${isDecrease ? 'تخفيض' : 'رفع'} أسعار ${storeProds.length} منتجات بنسبة ${pct}%`;
        actionSummaryEn = `${isDecrease ? 'Reduced' : 'Increased'} prices of ${storeProds.length} products by ${pct}%`;
        responseAr = `تم تنفيذ الأمر بنجاح: ${actionSummaryAr} في متجر "${targetStore?.name}". يمكنك مراجعة الأسعار المحدثة مباشرة في جدول المنتجات.`;
        responseEn = `Executed: ${actionSummaryEn} in "${targetStore?.name}". Updated prices are live in the Products table.`;
      } else {
        responseAr = 'لا توجد منتجات في هذا المتجر لتحديث أسعارها حالياً.';
        responseEn = 'No products in this store to update prices.';
      }
    } else if (
      cleanPrompt.includes('جهز') ||
      cleanPrompt.includes('تجهيز') ||
      cleanPrompt.includes('اشحن') ||
      cleanPrompt.includes('الطلبات المعلقة') ||
      lower.includes('fulfill') ||
      lower.includes('ship') ||
      lower.includes('pending')
    ) {
      const pendingOrPaid = storeOrds.filter(o => o.status === 'paid' || o.status === 'processing');
      if (pendingOrPaid.length > 0) {
        const shouldShip = cleanPrompt.includes('اشحن') || lower.includes('ship');
        setOrders(prev =>
          prev.map(o => {
            if (o.storeId !== storeId) return o;
            if (o.status === 'paid' || o.status === 'processing') {
              return {
                ...o,
                status: shouldShip ? 'shipped' : 'processing',
                trackingNumber: shouldShip
                  ? o.trackingNumber || `QBS-TRK-${Math.floor(100000 + Math.random() * 899999)}`
                  : o.trackingNumber
              };
            }
            return o;
          })
        );
        actionSummaryAr = `تحديث ${pendingOrPaid.length} طلبات إلى "${shouldShip ? 'تم الشحن' : 'قيد التجهيز'}"`;
        actionSummaryEn = `Updated ${pendingOrPaid.length} orders to "${shouldShip ? 'shipped' : 'processing'}"`;
        responseAr = `تمت معالجة ${pendingOrPaid.length} طلبات معلقة في متجر "${targetStore?.name}" وتحويلها إلى "${shouldShip ? 'تم الشحن مع أرقام التتبع' : 'قيد التجهيز'}".`;
        responseEn = `Processed ${pendingOrPaid.length} pending orders in "${targetStore?.name}" to "${shouldShip ? 'shipped' : 'processing'}".`;
      } else {
        responseAr = 'جميع طلبات هذا المتجر مكتملة أو لا توجد طلبات مدفوعة بانتظار التجهيز حالياً.';
        responseEn = 'No paid or pending orders require fulfillment right now.';
      }
    } else if (cleanPrompt.includes('كوبون') || cleanPrompt.includes('خصم') || lower.includes('coupon') || lower.includes('discount')) {
      const codeMatch = cleanPrompt.match(/\b([A-Z0-9]{4,12})\b/);
      const pctMatch = cleanPrompt.match(/(\d+)\s*%/);
      const code = codeMatch ? codeMatch[1] : `QABS${Math.floor(10 + Math.random() * 89)}`;
      const value = pctMatch ? Number(pctMatch[1]) : 15;
      addDiscount({
        storeId,
        code,
        type: 'percentage',
        value,
        minOrderAmount: 100,
        expiresAt: '2026-12-31',
        status: 'active'
      });
      actionSummaryAr = `إنشاء كود خصم ${code} بقيمة ${value}%`;
      actionSummaryEn = `Created coupon ${code} (${value}% off)`;
      responseAr = `تم إنشاء كود الخصم الفعّال "${code}" بنسبة ${value}% وإضافته لقائمة الخصومات الخاصة بمتجرك.`;
      responseEn = `Created active coupon "${code}" for ${value}% off in your store.`;
    } else {
      const validOrders = storeOrds.filter(o => o.status !== 'cancelled' && o.status !== 'refunded');
      const totalRev = validOrders.reduce((acc, o) => acc + o.total, 0);
      const totalUnits = storeProds.reduce((acc, p) => acc + p.stock, 0);
      const lowStock = storeProds.filter(p => p.stock <= (p.lowStockThreshold || 10)).length;
      const pendingCount = storeOrds.filter(o => o.status === 'paid' || o.status === 'processing').length;
      actionSummaryAr = 'تقرير ملخص المبيعات والمخزون المباشر';
      actionSummaryEn = 'Live sales & inventory summary';
      responseAr =
        `ملخص متجر "${targetStore?.name}":\n` +
        `• إجمالي المبيعات المعتمدة: ${totalRev.toLocaleString()} ${currency}\n` +
        `• عدد الطلبات: ${storeOrds.length} (منها ${pendingCount} بانتظار التجهيز/الشحن)\n` +
        `• المنتجات: ${storeProds.length} منتج بإجمالي مخزون ${totalUnits} قطعة (${lowStock} منخفض المخزون)\n` +
        `• وضع التشغيل: ${isProductionMode ? 'وضع الإنتاج الفعلي' : 'وضع الاختبار'}`;
      responseEn =
        `Store "${targetStore?.name}" Summary:\n` +
        `• Valid Revenue: ${totalRev.toLocaleString()} ${currency}\n` +
        `• Orders: ${storeOrds.length} (${pendingCount} pending fulfillment)\n` +
        `• Catalog: ${storeProds.length} products, ${totalUnits} total stock (${lowStock} low stock)\n` +
        `• Mode: ${isProductionMode ? 'Production' : 'Test Preview'}`;
    }

    setUser(prev => ({ ...prev, credits: Math.max(0, (prev.credits || 0) - 1) }));
    const entry: AICommandHistoryItem = {
      id: `ai_${Date.now()}`,
      prompt: cleanPrompt,
      responseAr,
      responseEn,
      actionSummaryAr,
      actionSummaryEn,
      timestamp
    };
    setAiHistory(prev => [entry, ...prev]);
    appendAudit(`تنفيذ أمر قبس AI: ${cleanPrompt.slice(0, 40)}`, `Executed QABS AI command: ${cleanPrompt.slice(0, 40)}`, targetStore?.name || storeId);
    return entry;
  };

  const updateSectionSettings = <K extends keyof WorkspaceSectionSettings>(
    section: K,
    updates: Partial<WorkspaceSectionSettings[K]>
  ) => {
    setSectionSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...updates
      }
    }));
    if (section === 'overview' && 'defaultCurrency' in updates && updates.defaultCurrency) {
      setStores(prev =>
        prev.map(s => (s.id === activeStoreId ? { ...s, currency: updates.defaultCurrency as string } : s))
      );
    }
    showToast(language === 'ar' ? 'تم حفظ إعدادات القسم وتطبيقها فوراً ✓' : 'Section settings saved and applied ✓');
  };

  const exportWorkspaceBackupJson = (): string => {
    const payload: PersistedWorkspaceState = {
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
      sectionSettings
    };
    return JSON.stringify(payload, null, 2);
  };

  const importWorkspaceBackupJson = (jsonText: string): boolean => {
    try {
      const parsed = JSON.parse(jsonText) as PersistedWorkspaceState;
      if (!parsed || typeof parsed !== 'object') return false;
      if (typeof parsed.isProductionMode === 'boolean') setIsProductionMode(parsed.isProductionMode);
      if (parsed.user) setUser(parsed.user);
      if (Array.isArray(parsed.companies)) setCompanies(parsed.companies);
      if (Array.isArray(parsed.stores) && parsed.stores.length > 0) setStores(parsed.stores);
      if (parsed.activeStoreId) setActiveStoreId(parsed.activeStoreId);
      if (Array.isArray(parsed.products)) setProducts(parsed.products);
      if (Array.isArray(parsed.orders)) setOrders(parsed.orders);
      if (Array.isArray(parsed.customers)) setCustomers(parsed.customers);
      if (Array.isArray(parsed.discounts)) setDiscounts(parsed.discounts);
      if (Array.isArray(parsed.shippingZones)) setShippingZones(parsed.shippingZones);
      if (Array.isArray(parsed.storePages)) setStorePages(parsed.storePages);
      if (Array.isArray(parsed.storeApps)) setStoreApps(parsed.storeApps);
      if (Array.isArray(parsed.tickets)) setTickets(parsed.tickets);
      if (Array.isArray(parsed.staff)) setStaff(parsed.staff);
      if (Array.isArray(parsed.invoices)) setInvoices(parsed.invoices);
      if (parsed.subscription) setSubscription(parsed.subscription);
      if (parsed.sectionSettings) {
        setSectionSettings({
          overview: { ...DEFAULT_SECTION_SETTINGS.overview, ...parsed.sectionSettings.overview },
          orders: { ...DEFAULT_SECTION_SETTINGS.orders, ...parsed.sectionSettings.orders },
          documents: { ...DEFAULT_SECTION_SETTINGS.documents, ...parsed.sectionSettings.documents },
          billing: { ...DEFAULT_SECTION_SETTINGS.billing, ...parsed.sectionSettings.billing },
          qabsAi: { ...DEFAULT_SECTION_SETTINGS.qabsAi, ...parsed.sectionSettings.qabsAi },
          crypto: { ...DEFAULT_SECTION_SETTINGS.crypto, ...parsed.sectionSettings.crypto },
          support: { ...DEFAULT_SECTION_SETTINGS.support, ...parsed.sectionSettings.support },
          companyFormation: {
            ...DEFAULT_SECTION_SETTINGS.companyFormation,
            ...(parsed.sectionSettings.companyFormation || {}),
            stateFees: {
              ...DEFAULT_SECTION_SETTINGS.companyFormation.stateFees,
              ...(parsed.sectionSettings.companyFormation?.stateFees || {})
            }
          }
        });
      }
      showToast(language === 'ar' ? 'تمت استعادة النسخة الاحتياطية الكاملة بنجاح!' : 'Full JSON backup restored!');
      return true;
    } catch {
      showToast(language === 'ar' ? 'ملف النسخة الاحتياطية غير صالح' : 'Invalid backup JSON file');
      return false;
    }
  };

  const resetWorkspaceData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setIsAuthenticated(false);
    setPendingServiceOrder(null);
    setCheckoutModalOpen(false);
    setMode('landing');
    setIsProductionMode(false);
    setUser(INITIAL_USER);
    setCompanies(INITIAL_COMPANIES);
    setStores(INITIAL_STORES);
    setActiveStoreId(INITIAL_STORES[0]?.id || 'store_01');
    setProducts(INITIAL_PRODUCTS);
    setOrders(INITIAL_ORDERS);
    setCustomers(INITIAL_CUSTOMERS);
    setDiscounts(INITIAL_DISCOUNTS);
    setShippingZones(INITIAL_SHIPPING_ZONES);
    setStorePages(INITIAL_STORE_PAGES);
    setStoreApps(INITIAL_STORE_APPS);
    setStoreTemplates(INITIAL_STORE_TEMPLATES);
    setBanking(INITIAL_BANKING);
    setTickets(INITIAL_TICKETS);
    setStaff(INITIAL_STAFF);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setSubscription(INITIAL_USER_SUBSCRIPTION);
    setInvoices(INITIAL_INVOICES);
    setRefunds(INITIAL_REFUNDS);
    setAiHistory([]);
    setSectionSettings(DEFAULT_SECTION_SETTINGS);
    showToast(language === 'ar' ? 'تمت استعادة البيانات الافتراضية' : 'Workspace data reset to defaults');
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
        subscription,
        changeSubscriptionPlan,
        invoices,
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
        logout,
        submittedServiceOrders,
        submitServiceOrder,
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
