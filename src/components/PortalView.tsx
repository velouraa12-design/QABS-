import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { SUBSCRIPTION_PLANS } from '../data/mockData.ts';
import { CompanyFormation, Invoice, StoreOrder, StoreProduct } from '../types/index.ts';
import {
  LayoutDashboard,
  Store,
  PlusCircle,
  Palette,
  FileText,
  ShoppingBag,
  Package,
  Truck,
  Users,
  Tag,
  CreditCard,
  Wallet,
  Landmark,
  Sparkles,
  Headphones,
  Receipt,
  Coins,
  ClipboardList,
  Globe,
  Puzzle,
  BarChart3,
  Settings,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  Plus,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
  Database,
  RefreshCw,
  Barcode,
  Building2,
  Download,
  Copy,
  X,
  FileCheck,
  LayoutGrid,
  Box,
  MessageCircle,
  HelpCircle,
  PanelRightClose,
  PanelRightOpen,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Link2,
  Printer,
  FlaskConical,
  Rocket,
  Check,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Upload,
  Save,
  FileJson,
  CheckSquare,
  Phone,
  Mail,
  ChevronRight,
  ChevronLeft,
  Sliders,
  Percent,
  Bell,
  KeyRound
} from 'lucide-react';

interface PortalViewProps {
  onOpenFormationModal: () => void;
  onOpenStoreModal: () => void;
}

type ClientTab =
  | 'overview'
  | 'overview_settings'
  | 'requests'
  | 'documents'
  | 'documents_settings'
  | 'subscriptions'
  | 'billing_settings'
  | 'qabs_ai'
  | 'qabs_ai_settings'
  | 'digital_currencies'
  | 'crypto_settings'
  | 'support'
  | 'support_settings'
  | 'cards'
  | 'bank_accounts'
  | 'my_stores'
  | 'stores_settings'
  | 'create_store'
  | 'store_design'
  | 'pages'
  | 'products'
  | 'inventory'
  | 'orders'
  | 'orders_settings'
  | 'customers'
  | 'discounts'
  | 'payments'
  | 'shipping'
  | 'domains'
  | 'apps'
  | 'analytics'
  | 'settings'
  | 'company_formation'
  | 'company_formation_settings';

export const PortalView: React.FC<PortalViewProps> = ({ onOpenStoreModal, onOpenFormationModal }) => {
  const {
    language,
    setMode,
    stores,
    activeStoreId,
    setActiveStoreId,
    addStore,
    updateStoreDetails,
    submitStoreForApproval,
    requestPaymentActivation,
    requestDomainVerification,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    orders,
    addOrder,
    updateOrderStatus,
    issueOrderInvoice,
    issueRefund,
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
    staff,
    addStaff,
    updateStaffPermissions,
    removeStaff,
    triggerSystemBackup,
    user,
    companies,
    addCompany,
    advanceCompanyStage,
    tickets,
    addTicket,
    resolveTicket,
    banking,
    subscription,
    changeSubscriptionPlan,
    topUpCredits,
    invoices,
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
    isOwner,
    logout,
    showToast
  } = useApp();

  const isAr = language === 'ar';
  const tabSlugs: Record<ClientTab, string> = {
    overview: 'overview',
    overview_settings: 'overview/settings',
    requests: 'requests',
    documents: 'documents',
    documents_settings: 'documents/settings',
    subscriptions: 'billing',
    billing_settings: 'billing/settings',
    qabs_ai: 'qabs-ai',
    qabs_ai_settings: 'qabs-ai/settings',
    digital_currencies: 'crypto',
    crypto_settings: 'crypto/settings',
    support: 'support',
    support_settings: 'support/settings',
    cards: 'cards',
    bank_accounts: 'bank-accounts',
    my_stores: 'stores',
    stores_settings: 'stores/settings',
    create_store: 'create-store',
    store_design: 'design',
    pages: 'pages',
    products: 'products',
    inventory: 'inventory',
    orders: 'orders',
    orders_settings: 'orders/settings',
    customers: 'customers',
    discounts: 'discounts',
    payments: 'payments',
    shipping: 'shipping',
    domains: 'domains',
    apps: 'apps',
    analytics: 'analytics',
    settings: 'settings',
    company_formation: 'company-formation',
    company_formation_settings: 'company-formation/settings'
  };
  const slugTabs = Object.fromEntries(Object.entries(tabSlugs).map(([tab, slug]) => [slug, tab])) as Record<string, ClientTab>;
  const tabFromLocation = (): ClientTab => {
    const hashSlug = (window.location.hash || '').replace(/^#\/?(?:workspace\/)?/, '').split('?')[0].replace(/\/+$/, '');
    if (hashSlug === 'formation') return 'company_formation';
    if (hashSlug && slugTabs[hashSlug]) return slugTabs[hashSlug];
    const pathSlug = (window.location.pathname || '').replace(/^\/?(?:workspace\/)?/, '').split('?')[0].replace(/\/+$/, '');
    if (pathSlug === 'formation') return 'company_formation';
    if (pathSlug && slugTabs[pathSlug]) return slugTabs[pathSlug];
    return 'overview';
  };
  const [activeTab, setActiveTab] = useState<ClientTab>(tabFromLocation);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() =>
    typeof window === 'undefined' ? true : window.innerWidth >= 1024
  );
  const navigateToTab = (tab: ClientTab) => {
    setActiveTab(tab);
    const nextHash = `#/${tabSlugs[tab]}`;
    if (window.location.hash !== nextHash) window.history.pushState({ qabsWorkspace: tab }, '', nextHash);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (typeof window !== 'undefined' && window.innerWidth < 1024) setSidebarOpen(false);
        setProductModalOpen(false);
        setNewOrderModalOpen(false);
        setSelectedOrder(null);
        setViewingInvoice(null);
        setViewingDoc(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const syncTab = () => setActiveTab(tabFromLocation());
    window.addEventListener('popstate', syncTab);
    window.addEventListener('hashchange', syncTab);
    const hashSlug = (window.location.hash || '').replace(/^#\/?(?:workspace\/)?/, '').split('?')[0].replace(/\/+$/, '');
    const pathSlug = (window.location.pathname || '').replace(/^\/?(?:workspace\/)?/, '').split('?')[0].replace(/\/+$/, '');
    const matchedSlug = (hashSlug && slugTabs[hashSlug] && hashSlug) || (pathSlug && slugTabs[pathSlug] && pathSlug) || '';
    if (!matchedSlug) {
      window.history.replaceState({ qabsWorkspace: 'overview' }, '', '#/overview');
      setActiveTab('overview');
    } else if (window.location.hash !== `#/${matchedSlug}`) {
      window.history.replaceState({ qabsWorkspace: slugTabs[matchedSlug] }, '', `#/${matchedSlug}`);
      setActiveTab(slugTabs[matchedSlug]);
    }
    return () => {
      window.removeEventListener('popstate', syncTab);
      window.removeEventListener('hashchange', syncTab);
    };
  }, []);

  // Strictly isolated data for the active store (`storeId === activeStoreId`)
  const currentStore = stores.find(s => s.id === activeStoreId) || stores[0];
  const storeProducts = products.filter(p => p.storeId === currentStore?.id);
  const storeOrders = orders.filter(o => o.storeId === currentStore?.id);
  const storeCustomers = customers.filter(c => c.storeId === currentStore?.id);
  const storeDiscounts = discounts.filter(d => d.storeId === currentStore?.id);
  const storeShipping = shippingZones.filter(z => z.storeId === currentStore?.id);
  const currentStorePages = storePages.filter(p => p.storeId === currentStore?.id);

  // Local state for Section 3: Inline Create Store form
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreSubdomain, setNewStoreSubdomain] = useState('');
  const [newStoreActivity, setNewStoreActivity] = useState('الأزياء والعطور والمنتجات الفاخرة');
  const [newStoreCountry, setNewStoreCountry] = useState('SA');
  const [newStoreLang, setNewStoreLang] = useState<'ar' | 'en' | 'both'>('both');
  const [newStoreCurrency, setNewStoreCurrency] = useState('SAR');
  const [newStoreTemplate, setNewStoreTemplate] = useState(storeTemplates[0]?.id || 'tpl_luxury_gold');

  // Local state for Product Add / Edit Modal
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<StoreProduct | null>(null);
  const [prodNameAr, setProdNameAr] = useState('');
  const [prodNameEn, setProdNameEn] = useState('');
  const [prodPrice, setProdPrice] = useState('290');
  const [prodCost, setProdCost] = useState('140');
  const [prodSku, setProdSku] = useState('QBS-ITEM-101');
  const [prodBarcode, setProdBarcode] = useState('6281000991201');
  const [prodStock, setProdStock] = useState('25');
  const [prodStatus, setProdStatus] = useState<'active' | 'draft' | 'out_of_stock'>('active');
  const [prodImage, setProdImage] = useState('https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80');
  const [prodCategory, setProdCategory] = useState('العطور الفاخرة');
  const [prodType, setProdType] = useState<'physical' | 'digital'>('physical');
  const [prodWarehouse, setProdWarehouse] = useState('مستودع الرياض الرئيسي');
  const [prodVariantLabel, setProdVariantLabel] = useState('100 مل / إصدار ملكي');

  // Orders Filter, Details Modal & New Order Modal
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'paid' | 'shipped' | 'processing' | 'delivered' | 'refunded'>('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<StoreOrder | null>(null);
  const [orderTrackingInput, setOrderTrackingInput] = useState('');
  const [newOrderModalOpen, setNewOrderModalOpen] = useState(false);
  const [newOrdCustomerName, setNewOrdCustomerName] = useState('');
  const [newOrdCustomerEmail, setNewOrdCustomerEmail] = useState('');
  const [newOrdProductId, setNewOrdProductId] = useState('');
  const [newOrdQuantity, setNewOrdQuantity] = useState('1');
  const [newOrdGateway, setNewOrdGateway] = useState<StoreOrder['paymentGateway']>('Tap');
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);

  // Shopify Admin API settings state
  const [shopifyDomainInput, setShopifyDomainInput] = useState(currentStore?.shopifyDomain || '');
  const [shopifyTokenInput, setShopifyTokenInput] = useState(currentStore?.shopifyAccessToken || '');
  const [shopifyWebhooksInput, setShopifyWebhooksInput] = useState(!!currentStore?.shopifyWebhooksConnected);
  const [showShopifyToken, setShowShopifyToken] = useState(false);

  // QABS AI Command state
  const [aiPromptInput, setAiPromptInput] = useState('');

  // Documents vault state
  const [newDocName, setNewDocName] = useState('');
  const [newDocType, setNewDocType] = useState<CompanyFormation['documents'][number]['type']>('resolution');
  const [newDocCompanyId, setNewDocCompanyId] = useState(companies[0]?.id || '');

  // Subscriptions billing cycle toggle
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>(subscription.billingCycle);

  // Digital currencies settlement state
  const [cryptoEnabledInput, setCryptoEnabledInput] = useState(!!currentStore?.cryptoSettlementEnabled);
  const [cryptoNetworkInput, setCryptoNetworkInput] = useState(currentStore?.cryptoNetwork || 'TRC20 (TRON)');
  const [cryptoWalletInput, setCryptoWalletInput] = useState(currentStore?.cryptoWalletAddress || '');

  // Support ticket state
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState<'formation' | 'store' | 'payments' | 'billing' | 'technical' | 'compliance'>('store');
  const [ticketPriority, setTicketPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketFilter, setTicketFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const [lastAutoReplyNote, setLastAutoReplyNote] = useState<string | null>(null);

  // Dedicated Section Settings Draft States
  const [ovDraft, setOvDraft] = useState(sectionSettings.overview);
  const [ordDraft, setOrdDraft] = useState(sectionSettings.orders);
  const [docDraft, setDocDraft] = useState(sectionSettings.documents);
  const [storeNameDraft, setStoreNameDraft] = useState(stores.find(s => s.id === activeStoreId)?.name || '');
  const [storeActivityDraft, setStoreActivityDraft] = useState(stores.find(s => s.id === activeStoreId)?.activityAr || '');
  const [billDraft, setBillDraft] = useState(sectionSettings.billing);
  const [billTaxRateDraft, setBillTaxRateDraft] = useState<number>(stores.find(s => s.id === activeStoreId)?.taxRate ?? 15);
  const [aiDraft, setAiDraft] = useState(sectionSettings.qabsAi);
  const [cryptoDraft, setCryptoDraft] = useState(sectionSettings.crypto);
  const [supDraft, setSupDraft] = useState(sectionSettings.support);
  const [cfDraft, setCfDraft] = useState(sectionSettings.companyFormation);
  const [newStaffPerms, setNewStaffPerms] = useState<string[]>(['inventory_update_only', 'orders_fulfillment']);

  // Interactive Company Formation Wizard State
  const [cfWizardOpen, setCfWizardOpen] = useState(true);
  const [cfJurisdiction, setCfJurisdiction] = useState<'US_KENTUCKY' | 'US_WYOMING' | 'US_DELAWARE' | 'US_NEW_MEXICO' | 'UK_LTD'>('US_WYOMING');
  const [cfProposedName, setCfProposedName] = useState('');
  const [cfSuffix, setCfSuffix] = useState<'LLC' | 'INC' | 'LTD' | 'C-CORP'>('LLC');
  const [cfActivity, setCfActivity] = useState('التجارة الإلكترونية والمنتجات الرقمية');
  const [cfOwnerName, setCfOwnerName] = useState(user.name);
  const [cfOwnerEmail, setCfOwnerEmail] = useState(user.email);
  const [cfPassportFile, setCfPassportFile] = useState('');
  const [cfPassportPreview, setCfPassportPreview] = useState('');
  const [cfExtraDocsConfirmed, setCfExtraDocsConfirmed] = useState<string[]>([]);
  const [cfAddonEin, setCfAddonEin] = useState(true);
  const [cfAddonAgent, setCfAddonAgent] = useState(true);
  const [cfAddonBank, setCfAddonBank] = useState(true);
  const [cfAddonGateways, setCfAddonGateways] = useState(true);
  const [cfFormError, setCfFormError] = useState<string | null>(null);

  useEffect(() => {
    setOvDraft(sectionSettings.overview);
    setOrdDraft(sectionSettings.orders);
    setDocDraft(sectionSettings.documents);
    setBillDraft(sectionSettings.billing);
    setAiDraft(sectionSettings.qabsAi);
    setCryptoDraft(sectionSettings.crypto);
    setSupDraft(sectionSettings.support);
    setCfDraft(sectionSettings.companyFormation);
  }, [sectionSettings]);

  useEffect(() => {
    if (!currentStore) return;
    setDomainInput(currentStore.customDomain || '');
    setStoreNameDraft(currentStore.name || '');
    setStoreActivityDraft(currentStore.activityAr || '');
    setBillTaxRateDraft(currentStore.taxRate ?? 15);
    setShopifyDomainInput(currentStore.shopifyDomain || '');
    setShopifyTokenInput(currentStore.shopifyAccessToken || '');
    setShopifyWebhooksInput(!!currentStore.shopifyWebhooksConnected);
    setCryptoEnabledInput(!!currentStore.cryptoSettlementEnabled);
    setCryptoNetworkInput(currentStore.cryptoNetwork || 'TRC20 (TRON)');
    setCryptoWalletInput(currentStore.cryptoWalletAddress || '');
  }, [
    currentStore?.id,
    currentStore?.name,
    currentStore?.activityAr,
    currentStore?.taxRate,
    currentStore?.customDomain,
    currentStore?.shopifyDomain,
    currentStore?.shopifyAccessToken,
    currentStore?.shopifyWebhooksConnected,
    currentStore?.cryptoSettlementEnabled,
    currentStore?.cryptoNetwork,
    currentStore?.cryptoWalletAddress
  ]);

  useEffect(() => {
    if (selectedOrder) {
      const latest = orders.find(o => o.id === selectedOrder.id);
      if (latest) {
        setSelectedOrder(latest);
        setOrderTrackingInput(latest.trackingNumber || '');
      }
    }
  }, [orders]);

  // Local state for Section 5: Pages
  const [pageTitleAr, setPageTitleAr] = useState('');
  const [pageSlug, setPageSlug] = useState('');
  const [pageContentAr, setPageContentAr] = useState('');

  // Local state for Section 9: Add Customer
  const [custName, setCustName] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPhone, setCustPhone] = useState('+966 50 000 0000');
  const [custCity, setCustCity] = useState('الرياض');

  // Local state for Section 10: Add Discount
  const [discCode, setDiscCode] = useState('');
  const [discValue, setDiscValue] = useState('15');
  const [discType, setDiscType] = useState<'percentage' | 'fixed'>('percentage');

  // Local state for Section 12: Add Shipping Zone
  const [shipRegionAr, setShipRegionAr] = useState('');
  const [shipCarrier, setShipCarrier] = useState('DHL Express / SMSA');
  const [shipRate, setShipRate] = useState('25');
  const [shipTime, setShipTime] = useState('1 - 3 أيام عمل');

  // Local state for Section 13: Custom Domain
  const [domainInput, setDomainInput] = useState(currentStore?.customDomain || '');

  // Local state for Section 16: Add Store Staff
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');

  // Local state for Company Formation Section
  const [companyFilter, setCompanyFilter] = useState<'all' | 'approved' | 'in_progress'>('all');
  const [viewingDoc, setViewingDoc] = useState<{ docName: string; companyName: string; type: string; date: string; jurisdiction?: string; ein?: string; fileNumber?: string } | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const triggerTextDownload = (filename: string, content: string, mimeType = 'application/json') => {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const readImageAsDataUrl = (file: File, onLoaded: (url: string) => void) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') onLoaded(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const sidebarItems: { id: ClientTab; labelAr: string; labelEn: string; descAr: string; icon: React.ElementType; badge?: number | string }[] = [
    { id: 'overview', labelAr: 'نظرة عامة', labelEn: 'Overview', descAr: 'ملخص مساحة العمل والإحصائيات', icon: LayoutDashboard },
    { id: 'overview_settings', labelAr: 'إعدادات نظرة عامة', labelEn: 'Overview Settings', descAr: 'بطاقات KPI والعملة وبانر المعاينة', icon: Sliders },
    { id: 'requests', labelAr: 'طلبات الخدمات', labelEn: 'Service Requests', descAr: 'متابعة طلبات خدمات قبس', icon: ClipboardList },
    { id: 'documents', labelAr: 'المستندات والأرشفة', labelEn: 'Documents Vault', descAr: 'الوثائق الرسمية وتصدير الملفات', icon: FileCheck },
    { id: 'documents_settings', labelAr: 'إعدادات المستندات', labelEn: 'Documents Settings', descAr: 'القالب الرسمي والختم وصيغ التصدير', icon: Sliders },
    { id: 'subscriptions', labelAr: 'الاشتراكات والفواتير', labelEn: 'Subscriptions & Billing', descAr: 'الباقات والفواتير والضرائب', icon: Receipt },
    { id: 'billing_settings', labelAr: 'إعدادات الاشتراكات والفواتير', labelEn: 'Billing Settings', descAr: 'الرقم الضريبي وبوابات الدفع', icon: Sliders },
    { id: 'qabs_ai', labelAr: 'قبس AI والأرصدة', labelEn: 'QABS AI & Credits', descAr: 'محرك الأوامر الذكي وإدارة الرصيد', icon: Sparkles },
    { id: 'qabs_ai_settings', labelAr: 'إعدادات قبس AI والأرصدة', labelEn: 'QABS AI Settings', descAr: 'صلاحيات التنفيذ وحدود الأرصدة', icon: Sliders },
    { id: 'digital_currencies', labelAr: 'العملات الرقمية', labelEn: 'Digital Currencies', descAr: 'محافظ الاستلام وشبكات التسوية', icon: Coins },
    { id: 'crypto_settings', labelAr: 'إعدادات العملات الرقمية', labelEn: 'Crypto Settings', descAr: 'عناوين المحافظ والحد الأدنى للتحويل', icon: Sliders },
    { id: 'cards', labelAr: 'البطاقات', labelEn: 'Cards', descAr: 'إدارة بطاقات الأعمال', icon: CreditCard },
    { id: 'bank_accounts', labelAr: 'الحسابات البنكية', labelEn: 'Bank Accounts', descAr: 'حساباتك التجارية والبنكية', icon: Landmark },
    { id: 'support', labelAr: 'الدعم الفني', labelEn: 'Support Center', descAr: 'تذاكر الدعم ومعلومات التواصل', icon: Headphones },
    { id: 'support_settings', labelAr: 'إعدادات الدعم والتواصل', labelEn: 'Support Settings', descAr: 'الهاتف وساعات العمل والرد التلقائي', icon: Sliders },
    { id: 'my_stores', labelAr: 'متاجري', labelEn: 'My Stores', descAr: 'إدارة المتاجر وربط Shopify API', icon: Store, badge: stores.length },
    { id: 'stores_settings', labelAr: 'إعدادات متاجري', labelEn: 'Stores Settings', descAr: 'اسم المتجر والنطاق والربط والنشر', icon: Sliders },
    { id: 'create_store', labelAr: 'إنشاء متجر', labelEn: 'Create Store', descAr: 'الاسم والنشاط واللغة والعملة', icon: PlusCircle },
    { id: 'store_design', labelAr: 'تصميم المتجر', labelEn: 'Store Design', descAr: 'القوالب والألوان والخطوط', icon: Palette },
    { id: 'pages', labelAr: 'الصفحات', labelEn: 'Pages', descAr: 'الرئيسية، من نحن، اتصل بنا', icon: FileText, badge: currentStorePages.length },
    { id: 'products', labelAr: 'المنتجات', labelEn: 'Products', descAr: 'إضافة وتعديل وحذف وتصنيف', icon: ShoppingBag, badge: storeProducts.length },
    { id: 'inventory', labelAr: 'المخزون', labelEn: 'Inventory', descAr: 'الكميات والتنبيهات', icon: Package },
    { id: 'orders', labelAr: 'الطلبات', labelEn: 'Orders', descAr: 'إدارة الطلبات والفواتير والشحن', icon: Truck, badge: storeOrders.length },
    { id: 'orders_settings', labelAr: 'إعدادات الطلبات والشحن', labelEn: 'Orders Settings', descAr: 'الترقيم وخصم المخزون وشركات الشحن', icon: Sliders },
    { id: 'customers', labelAr: 'العملاء', labelEn: 'Customers', descAr: 'بيانات العملاء وسجل مشترياتهم', icon: Users, badge: storeCustomers.length },
    { id: 'discounts', labelAr: 'الخصومات', labelEn: 'Discounts', descAr: 'كوبونات وعروض', icon: Tag, badge: storeDiscounts.length },
    { id: 'payments', labelAr: 'الدفع', labelEn: 'Payments', descAr: 'إعداد وربط بوابات الدفع', icon: CreditCard },
    { id: 'shipping', labelAr: 'الشحن', labelEn: 'Shipping', descAr: 'المناطق والأسعار وطرق التوصيل', icon: Truck, badge: storeShipping.length },
    { id: 'domains', labelAr: 'النطاقات', labelEn: 'Domains', descAr: 'ربط نطاق مستقل', icon: Globe },
    { id: 'apps', labelAr: 'التطبيقات', labelEn: 'Apps', descAr: 'تكاملات وإضافات', icon: Puzzle },
    { id: 'analytics', labelAr: 'التحليلات', labelEn: 'Analytics', descAr: 'المبيعات والأداء', icon: BarChart3 },
    { id: 'settings', labelAr: 'الإعدادات العامة والصلاحيات', labelEn: 'General Settings & Roles', descAr: 'بوابة إعدادات الأقسام والصلاحيات والنسخ الاحتياطي', icon: Settings },
    { id: 'company_formation', labelAr: 'تأسيس الشركات', labelEn: 'Company Formation', descAr: 'تأسيس شركات أمريكية وبريطانية وحاسبة الرسوم ومتابعة المراحل', icon: Building2, badge: companies.length },
    { id: 'company_formation_settings', labelAr: 'إعدادات تأسيس الشركات', labelEn: 'Company Formation Settings', descAr: 'رسوم الولايات والتجديد السنوي والمستندات الإلزامية والربط التلقائي', icon: Sliders }
  ];

  const storeSubTabs: ClientTab[] = [
    'create_store',
    'store_design',
    'pages',
    'products',
    'inventory',
    'customers',
    'discounts',
    'payments',
    'shipping',
    'domains',
    'apps',
    'analytics'
  ];

  const primarySidebarItems: { id: ClientTab; labelAr: string; labelEn: string; icon: React.ElementType; matchTabs?: ClientTab[] }[] = [
    { id: 'overview', labelAr: 'نظرة عامة', labelEn: 'Overview', icon: LayoutGrid, matchTabs: ['overview', 'overview_settings'] },
    { id: 'orders', labelAr: 'الطلبات', labelEn: 'Orders', icon: FileText, matchTabs: ['orders', 'orders_settings', 'requests'] },
    { id: 'company_formation', labelAr: 'تأسيس الشركات', labelEn: 'Company Formation', icon: Building2, matchTabs: ['company_formation', 'company_formation_settings'] },
    { id: 'documents', labelAr: 'المستندات', labelEn: 'Documents', icon: Box, matchTabs: ['documents', 'documents_settings'] },
    { id: 'my_stores', labelAr: 'متاجري', labelEn: 'My Stores', icon: Store, matchTabs: ['my_stores', 'stores_settings', ...storeSubTabs] },
    { id: 'subscriptions', labelAr: 'الاشتراكات والفواتير', labelEn: 'Subscriptions & Invoices', icon: CreditCard, matchTabs: ['subscriptions', 'billing_settings'] },
    { id: 'qabs_ai', labelAr: 'قبس AI والأرصدة', labelEn: 'QABS AI & Credits', icon: Sparkles, matchTabs: ['qabs_ai', 'qabs_ai_settings'] },
    { id: 'digital_currencies', labelAr: 'العملات الرقمية', labelEn: 'Digital Currencies', icon: Wallet, matchTabs: ['digital_currencies', 'crypto_settings'] },
    { id: 'support', labelAr: 'الدعم', labelEn: 'Support', icon: MessageCircle, matchTabs: ['support', 'support_settings'] },
    { id: 'settings', labelAr: 'الإعدادات', labelEn: 'Settings', icon: Settings, matchTabs: ['settings'] }
  ];

  const handleInlineCreateStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName.trim()) return;
    const tpl = storeTemplates.find(t => t.id === newStoreTemplate) || storeTemplates[0];
    addStore({
      name: newStoreName,
      ownerName: user.name,
      ownerEmail: user.email,
      activityAr: newStoreActivity,
      activityEn: newStoreActivity,
      country: newStoreCountry,
      defaultLanguage: newStoreLang,
      subdomain: `${newStoreSubdomain || 'mystore'}.qabs1.store`,
      currency: newStoreCurrency,
      taxRate: newStoreCountry === 'SA' ? 15 : newStoreCountry === 'AE' ? 5 : 0,
      theme: tpl?.theme || 'gold_executive',
      templateId: tpl?.id || 'tpl_luxury_gold',
      primaryColor: tpl?.primaryColor || '#004457',
      accentColor: tpl?.accentColor || '#C8A24A',
      fontFamily: tpl?.fontFamily || 'Cairo',
      status: 'draft',
      approvalStatus: 'draft',
      paymentConnected: false,
      paymentApprovalStatus: 'unconfigured',
      gatewayType: 'Tap'
    });
    setNewStoreName('');
    setNewStoreSubdomain('');
    navigateToTab('overview');
  };

  const openNewProductModal = () => {
    setEditingProduct(null);
    setProdNameAr('');
    setProdNameEn('');
    setProdPrice('290');
    setProdCost('140');
    setProdSku(`QBS-${Math.floor(1000 + Math.random() * 9000)}`);
    setProdBarcode(`6281000${Math.floor(100000 + Math.random() * 899999)}`);
    setProdStock('25');
    setProdStatus('active');
    setProdImage('https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80');
    setProdCategory('العطور الفاخرة');
    setProdType('physical');
    setProdWarehouse('مستودع الرياض الرئيسي');
    setProdVariantLabel('100 مل / إصدار ملكي');
    setProductModalOpen(true);
  };

  const openEditProductModal = (prod: StoreProduct) => {
    setEditingProduct(prod);
    setProdNameAr(prod.nameAr || prod.titleAr || '');
    setProdNameEn(prod.nameEn || prod.titleEn || '');
    setProdPrice(String(prod.price));
    setProdCost(String(prod.costPrice ?? prod.cost ?? Math.round(prod.price * 0.5)));
    setProdSku(prod.sku);
    setProdBarcode(prod.barcode || '6281000492811');
    setProdStock(String(prod.stock));
    setProdStatus(prod.status);
    setProdImage(prod.image || prod.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80');
    setProdCategory(prod.category || prod.categoryAr || 'منتجات المتجر');
    setProdType(prod.productType);
    setProdWarehouse(prod.warehouse || 'مستودع الرياض الرئيسي');
    setProdVariantLabel(prod.variants?.[0]?.nameAr || 'إصدار قياسي');
    setProductModalOpen(true);
  };

  const handleProductModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodNameAr.trim() || !currentStore) return;
    const numericStock = Math.max(0, Number(prodStock) || 0);
    const computedStatus: StoreProduct['status'] = numericStock === 0 ? 'out_of_stock' : prodStatus;
    if (editingProduct) {
      updateProduct(editingProduct.id, {
        nameAr: prodNameAr,
        titleAr: prodNameAr,
        nameEn: prodNameEn || prodNameAr,
        titleEn: prodNameEn || prodNameAr,
        price: Number(prodPrice) || 100,
        costPrice: Number(prodCost) || 50,
        cost: Number(prodCost) || 50,
        sku: prodSku,
        barcode: prodBarcode,
        stock: numericStock,
        status: computedStatus,
        image: prodImage,
        imageUrl: prodImage,
        category: prodCategory,
        categoryAr: prodCategory,
        productType: prodType,
        warehouse: prodWarehouse
      });
    } else {
      addProduct({
        storeId: currentStore.id,
        nameAr: prodNameAr,
        titleAr: prodNameAr,
        nameEn: prodNameEn || prodNameAr,
        titleEn: prodNameEn || prodNameAr,
        descriptionAr: `منتج أصلي معتمد في ${currentStore.name}`,
        descriptionEn: `Verified product in ${currentStore.name}`,
        price: Number(prodPrice) || 100,
        costPrice: Number(prodCost) || 50,
        cost: Number(prodCost) || 50,
        sku: prodSku,
        barcode: prodBarcode,
        stock: numericStock,
        lowStockThreshold: 5,
        warehouse: prodWarehouse,
        category: prodCategory,
        categoryAr: prodCategory,
        productType: prodType,
        status: computedStatus,
        image: prodImage,
        imageUrl: prodImage,
        variants: [
          {
            id: `var_${Date.now()}`,
            nameAr: prodVariantLabel,
            nameEn: prodVariantLabel,
            sku: `${prodSku}-V1`,
            price: Number(prodPrice) || 100,
            stock: numericStock
          }
        ]
      });
    }
    setProductModalOpen(false);
    setEditingProduct(null);
  };

  const openNewOrderModal = () => {
    const firstAvailable = storeProducts.find(p => p.stock > 0) || storeProducts[0];
    setNewOrdCustomerName('');
    setNewOrdCustomerEmail('');
    setNewOrdProductId(firstAvailable?.id || '');
    setNewOrdQuantity('1');
    setNewOrdGateway(currentStore?.gatewayType || 'Tap');
    setNewOrderModalOpen(true);
  };

  const handleNewOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStore) return;
    const chosenProduct = storeProducts.find(p => p.id === newOrdProductId);
    if (!chosenProduct) {
      showToast(isAr ? 'أضف منتجاً للمتجر أولاً لإنشاء طلب' : 'Please add a product first');
      return;
    }
    const qty = Math.max(1, Number(newOrdQuantity) || 1);
    const totalAmount = chosenProduct.price * qty;
    addOrder({
      storeId: currentStore.id,
      customerName: newOrdCustomerName.trim() || (isAr ? 'عميل متجر قبس' : 'QABS Store Customer'),
      customerEmail: newOrdCustomerEmail.trim() || 'customer@qabs1.store',
      itemsCount: qty,
      total: totalAmount,
      currency: currentStore.currency || 'SAR',
      status: 'paid',
      paymentGateway: newOrdGateway,
      shippingCarrier: 'DHL Express / SMSA',
      items: [
        {
          productId: chosenProduct.id,
          productName: isAr ? chosenProduct.nameAr || chosenProduct.titleAr || 'منتج' : chosenProduct.nameEn || chosenProduct.titleEn || 'Product',
          quantity: qty,
          unitPrice: chosenProduct.price
        }
      ]
    });
    setNewOrderModalOpen(false);
  };

  if (!currentStore) return null;

  const totalCostValue = storeProducts.reduce((acc, p) => acc + (p.costPrice || p.cost || p.price * 0.5) * p.salesCount, 0);
  const totalSalesRevenue = storeOrders
    .filter(o => o.status !== 'cancelled' && o.status !== 'canceled' && o.status !== 'refunded')
    .reduce((acc, o) => acc + o.total, 0);
  const estimatedTax = Math.round(totalSalesRevenue * ((currentStore.taxRate || 15) / 100));
  const netProfit = Math.max(0, totalSalesRevenue - totalCostValue - estimatedTax);
  const totalStockUnits = storeProducts.reduce((acc, p) => acc + p.stock, 0);
  const lowStockCount = storeProducts.filter(p => p.stock <= (p.lowStockThreshold || 5)).length;
  const paidOrdersCount = storeOrders.filter(o => o.status === 'paid').length;
  const processingOrdersCount = storeOrders.filter(o => o.status === 'processing').length;
  const shippedOrdersCount = storeOrders.filter(o => o.status === 'shipped' || o.status === 'delivered').length;

  const completedStepsSet = new Set(currentStore.setupStepsCompleted || []);
  const fourSetupSteps = [
    {
      id: 'store_design',
      stepNum: 1,
      titleAr: '1. تخصيص الهوية والقالب',
      titleEn: '1. Customize Brand & Theme',
      descAr: 'اختيار القالب والألوان والخط المعتمد',
      descEn: 'Select template, colors, and store font',
      done: !!currentStore.templateId || completedStepsSet.has('store_design'),
      tab: 'store_design' as ClientTab
    },
    {
      id: 'products',
      stepNum: 2,
      titleAr: '2. إضافة المنتجات والمخزون',
      titleEn: '2. Add Products & Inventory',
      descAr: `${storeProducts.length} منتج • ${totalStockUnits} وحدة بالمخزون`,
      descEn: `${storeProducts.length} products • ${totalStockUnits} stock units`,
      done: storeProducts.length > 0 || completedStepsSet.has('products'),
      tab: 'products' as ClientTab
    },
    {
      id: 'payment_shipping',
      stepNum: 3,
      titleAr: '3. اعتماد بوابة الدفع والشحن',
      titleEn: '3. Approve Payment & Shipping',
      descAr: isProductionMode || currentStore.paymentApprovalStatus === 'approved_active' ? 'معتمد ومفعل' : 'تفعيل وضع الإنتاج أو البوابة',
      descEn: isProductionMode || currentStore.paymentApprovalStatus === 'approved_active' ? 'Approved & active' : 'Activate live gateway',
      done: isProductionMode || currentStore.paymentApprovalStatus === 'approved_active' || completedStepsSet.has('payment_shipping'),
      tab: 'payments' as ClientTab
    },
    {
      id: 'shopify_publish',
      stepNum: 4,
      titleAr: '4. ربط Shopify والنشر النهائي',
      titleEn: '4. Shopify API Sync & Publish',
      descAr: currentStore.shopifyDomain ? `متصل بـ ${currentStore.shopifyDomain}` : 'ربط Shopify Admin API والنشر',
      descEn: currentStore.shopifyDomain ? `Connected to ${currentStore.shopifyDomain}` : 'Connect Shopify Admin API & publish',
      done: !!currentStore.shopifyDomain || currentStore.approvalStatus === 'approved_published' || completedStepsSet.has('shopify_publish'),
      tab: 'my_stores' as ClientTab
    }
  ];
  const fourStepsDoneCount = fourSetupSteps.filter(s => s.done).length;

  const statusLabelAr: Record<string, string> = {
    paid: 'مدفوع',
    processing: 'قيد التجهيز',
    shipped: 'تم الشحن',
    delivered: 'تم التوصيل',
    refunded: 'مسترجع',
    cancelled: 'ملغي',
    canceled: 'ملغي'
  };

  const renderShopifyIntegrationCard = () => (
    <div className="rounded-2xl border border-[#D5B46B]/50 bg-[#FBFAF6] dark:bg-slate-900/60 p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#14243E] text-[#D5B46B] flex items-center justify-center shrink-0">
            <Link2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-[#14243E] dark:text-white">
              {isAr ? 'الربط البرمجي مع Shopify Admin API وإعداد القائمة' : 'Shopify Admin API Integration & Sync'}
            </h3>
            <p className="text-[11px] text-slate-500">
              {isAr
                ? 'اربط نطاق متجر شوبيفاي ورمز Admin Access Token وفعّل Webhooks للمزامنة الفورية للمنتجات والطلبات'
                : 'Connect your Shopify Store Domain, Admin Access Token, and Webhooks for instant catalog & order sync'}
            </p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black self-start ${
            shopifyWebhooksInput && currentStore.shopifyDomain
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              shopifyWebhooksInput && currentStore.shopifyDomain ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
          />
          {shopifyWebhooksInput && currentStore.shopifyDomain
            ? isAr
              ? 'Webhooks متصل (Live)'
              : 'Webhooks Connected'
            : isAr
            ? 'Webhooks بانتظار المزامنة'
            : 'Webhooks Pending Sync'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
            {isAr ? 'نطاق المتجر (Store Domain)' : 'Store Domain'}
          </label>
          <input
            type="text"
            value={shopifyDomainInput}
            onChange={e => setShopifyDomainInput(e.target.value)}
            placeholder="qabs-luxury.myshopify.com"
            className="w-full rounded-xl border border-[#EAE6DC] dark:border-slate-700 bg-white dark:bg-[#071D2B] px-3 py-2 text-xs font-mono"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
            {isAr ? 'Admin Access Token' : 'Admin Access Token'}
          </label>
          <div className="relative flex items-center">
            <input
              type={showShopifyToken ? 'text' : 'password'}
              value={shopifyTokenInput}
              onChange={e => setShopifyTokenInput(e.target.value)}
              placeholder="shpat_xxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full rounded-xl border border-[#EAE6DC] dark:border-slate-700 bg-white dark:bg-[#071D2B] px-3 py-2 text-xs font-mono pe-9"
            />
            <button
              type="button"
              onClick={() => setShowShopifyToken(v => !v)}
              className="absolute left-2.5 rtl:left-2.5 ltr:right-2.5 text-slate-400 hover:text-[#14243E] cursor-pointer"
              aria-label={showShopifyToken ? 'Hide token' : 'Show token'}
            >
              {showShopifyToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <label className="inline-flex items-center gap-2 cursor-pointer font-bold text-[#14243E] dark:text-slate-200">
            <input
              type="checkbox"
              checked={shopifyWebhooksInput}
              onChange={e => setShopifyWebhooksInput(e.target.checked)}
              className="rounded border-slate-300 text-[#14243E]"
            />
            <span>{isAr ? 'تفعيل اتصال Webhooks التلقائي (orders/create, products/update)' : 'Enable Shopify Webhooks (orders/create, products/update)'}</span>
          </label>
          {currentStore.shopifyLastSync && (
            <span className="text-[11px] font-mono text-slate-500">
              {isAr ? `آخر مزامنة: ${currentStore.shopifyLastSync}` : `Last sync: ${currentStore.shopifyLastSync}`}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => syncShopifyStore(currentStore.id, shopifyDomainInput, shopifyTokenInput, shopifyWebhooksInput)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#14243E] hover:bg-[#1d3559] text-white px-4 py-2.5 text-xs font-black cursor-pointer shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#D5B46B]" />
          <span>{isAr ? 'مزامنة فورية' : 'Instant Sync'}</span>
        </button>
      </div>
    </div>
  );

  const renderSettingsPageHeader = (
    parentTab: ClientTab,
    sectionTitleAr: string,
    sectionTitleEn: string,
    onSave: () => void
  ) => (
    <div className="bg-white dark:bg-[#071D2B] border border-[#D5B46B]/60 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-slate-500 font-bold">
          <button type="button" onClick={() => navigateToTab('overview')} className="hover:text-[#14243E] cursor-pointer">
            {isAr ? 'مساحة العمل' : 'Workspace'}
          </button>
          {isAr ? <ChevronLeft className="w-3.5 h-3.5 text-[#92743A]" /> : <ChevronRight className="w-3.5 h-3.5 text-[#92743A]" />}
          <button type="button" onClick={() => navigateToTab(parentTab)} className="hover:text-[#14243E] cursor-pointer">
            {isAr ? sectionTitleAr : sectionTitleEn}
          </button>
          {isAr ? <ChevronLeft className="w-3.5 h-3.5 text-[#92743A]" /> : <ChevronRight className="w-3.5 h-3.5 text-[#92743A]" />}
          <span className="text-[#14243E] dark:text-[#D5B46B] font-black">
            {isAr ? `إعدادات ${sectionTitleAr}` : `${sectionTitleEn} Settings`}
          </span>
        </nav>
        <span className="px-2.5 py-1 rounded-lg bg-[#F8F7F2] dark:bg-slate-900 border border-[#EAE6DC] dark:border-slate-700 font-mono text-[11px] font-bold text-[#92743A]">
          /{tabSlugs[activeTab]}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#EAE6DC] dark:border-slate-800">
        <button
          type="button"
          onClick={() => navigateToTab(parentTab)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#EAE6DC] bg-[#F8F7F2] dark:bg-slate-900 hover:border-[#D5B46B] text-[#14243E] dark:text-white px-4 py-2 text-xs font-black cursor-pointer self-start"
        >
          <span>{isAr ? `← العودة إلى صفحة ${sectionTitleAr}` : `← Back to ${sectionTitleEn}`}</span>
        </button>
        <button
          type="button"
          onClick={onSave}
          className="inline-flex items-center gap-2 rounded-xl bg-[#14243E] hover:bg-[#1d3559] text-white px-5 py-2.5 text-xs font-black cursor-pointer shadow-sm self-start sm:self-auto"
        >
          <Save className="w-3.5 h-3.5 text-[#D5B46B]" />
          <span>{isAr ? 'حفظ إعدادات القسم' : 'Save Section Settings'}</span>
        </button>
      </div>
    </div>
  );

  const renderOrdersWorkspace = () => {
    const enabledStatuses = sectionSettings.orders.enabledStatuses;
    const filteredOrders = storeOrders.filter(ord => {
      const matchesStatus = orderStatusFilter === 'all' ? true : ord.status === orderStatusFilter;
      const q = orderSearch.trim().toLowerCase();
      const matchesSearch =
        !q ||
        ord.orderNumber.toLowerCase().includes(q) ||
        ord.customerName.toLowerCase().includes(q) ||
        ord.customerEmail.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });

    const allFilterTabs: { id: typeof orderStatusFilter; labelAr: string; labelEn: string; count: number }[] = [
      { id: 'all', labelAr: 'الكل', labelEn: 'All', count: storeOrders.length },
      { id: 'paid', labelAr: 'مدفوع (paid)', labelEn: 'Paid', count: storeOrders.filter(o => o.status === 'paid').length },
      { id: 'processing', labelAr: 'قيد التجهيز', labelEn: 'Processing', count: storeOrders.filter(o => o.status === 'processing').length },
      { id: 'shipped', labelAr: 'تم الشحن (shipped)', labelEn: 'Shipped', count: storeOrders.filter(o => o.status === 'shipped').length },
      { id: 'delivered', labelAr: 'تم التوصيل', labelEn: 'Delivered', count: storeOrders.filter(o => o.status === 'delivered').length },
      { id: 'refunded', labelAr: 'مسترجع', labelEn: 'Refunded', count: storeOrders.filter(o => o.status === 'refunded').length }
    ];
    const filterTabs = allFilterTabs.filter(
      ft => ft.id === 'all' || enabledStatuses.includes(ft.id as 'paid' | 'processing' | 'shipped' | 'delivered' | 'refunded')
    );

    return (
      <div className="bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-[#14243E] dark:text-white">
              {isAr ? `إدارة الطلبات والفواتير (${currentStore.name})` : `Orders, Fulfillment & Invoices (${currentStore.name})`}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isAr
                ? `البادئة: ${sectionSettings.orders.orderPrefix} • الشحن الافتراضي: ${sectionSettings.orders.defaultCarrier} (${sectionSettings.orders.defaultShippingRate} ${currentStore.currency}) • خصم المخزون التلقائي: ${sectionSettings.orders.autoDeductInventory ? 'مفعّل' : 'متوقف'}`
                : `Prefix: ${sectionSettings.orders.orderPrefix} • Carrier: ${sectionSettings.orders.defaultCarrier} (${sectionSettings.orders.defaultShippingRate} ${currentStore.currency})`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 self-start">
            <button
              type="button"
              onClick={() => navigateToTab('orders_settings')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#D5B46B] bg-[#FBFAF6] hover:bg-[#F5F1E6] text-[#14243E] px-3.5 py-2.5 text-xs font-black cursor-pointer"
            >
              <span>{isAr ? '⚙️ إعدادات الطلبات' : '⚙️ Orders Settings'}</span>
            </button>
            <button
              type="button"
              onClick={openNewOrderModal}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#14243E] hover:bg-[#1d3559] text-white px-4 py-2.5 text-xs font-black cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4 text-[#D5B46B]" />
              <span>{isAr ? '+ إنشاء طلب جديد' : '+ New Order'}</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {filterTabs.map(ft => (
              <button
                key={ft.id}
                type="button"
                onClick={() => setOrderStatusFilter(ft.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  orderStatusFilter === ft.id
                    ? 'bg-[#14243E] text-white shadow-2xs'
                    : 'bg-[#F8F7F2] dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-[#EAE6DC] dark:border-slate-800 hover:border-[#D5B46B]'
                }`}
              >
                {isAr ? ft.labelAr : ft.labelEn} ({ft.count})
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute top-1/2 -translate-y-1/2 right-3 rtl:right-3 ltr:left-3" />
            <input
              type="text"
              value={orderSearch}
              onChange={e => setOrderSearch(e.target.value)}
              placeholder={isAr ? 'بحث برقم الطلب أو العميل...' : 'Search order # or customer...'}
              className="w-full rounded-xl border border-[#EAE6DC] dark:border-slate-700 bg-[#F8F7F2] dark:bg-slate-900 ps-9 pe-3 py-2 text-xs"
            />
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="p-10 text-center rounded-2xl border border-dashed border-[#EAE6DC] dark:border-slate-800 text-xs text-slate-400">
            {isAr ? 'لا توجد طلبات مطابقة للفلتر المحدد حالياً' : 'No matching orders found'}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-[#EAE6DC] dark:border-slate-800">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#F8F7F2] dark:bg-slate-900 text-[#14243E] dark:text-slate-200 font-black border-b border-[#EAE6DC] dark:border-slate-800">
                <tr>
                  <th className="p-3.5">{isAr ? 'رقم الطلب' : 'Order #'}</th>
                  <th className="p-3.5">{isAr ? 'العميل' : 'Customer'}</th>
                  <th className="p-3.5">{isAr ? 'التاريخ' : 'Date'}</th>
                  <th className="p-3.5">{isAr ? 'المبلغ' : 'Total'}</th>
                  <th className="p-3.5">{isAr ? 'الحالة' : 'Status'}</th>
                  <th className="p-3.5">{isAr ? 'التتبع والفاتورة' : 'Tracking & Invoice'}</th>
                  <th className="p-3.5">{isAr ? 'إجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE6DC]/70 dark:divide-slate-800">
                {filteredOrders.map(ord => {
                  const linkedInvoice = ord.invoiceId ? invoices.find(i => i.id === ord.invoiceId) : undefined;
                  return (
                    <tr key={ord.id} className="hover:bg-[#FBFAF6] dark:hover:bg-slate-900/40">
                      <td className="p-3.5 font-mono font-black text-[#14243E] dark:text-[#D5B46B]">
                        {ord.orderNumber}
                        <div className="text-[10px] font-sans font-normal text-slate-400">
                          {ord.itemsCount} {isAr ? 'عناصر' : 'items'} • {ord.paymentGateway || 'Tap'}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-[#14243E] dark:text-white">{ord.customerName}</div>
                        <div className="text-[10px] text-slate-400">{ord.customerEmail}</div>
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-slate-500">{ord.date || ord.createdAt}</td>
                      <td className="p-3.5 font-black text-[#14243E] dark:text-white">
                        {ord.total.toLocaleString()} {ord.currency || currentStore.currency}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                            ord.status === 'shipped' || ord.status === 'delivered'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : ord.status === 'paid'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                              : ord.status === 'processing'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                          }`}
                        >
                          {isAr ? `${statusLabelAr[ord.status] || ord.status} (${ord.status})` : ord.status}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="font-mono text-[11px] text-slate-600 dark:text-slate-300">
                          {ord.trackingNumber || (isAr ? 'بانتظار التتبع' : 'Pending')}
                        </div>
                        {linkedInvoice ? (
                          <button
                            type="button"
                            onClick={() => setViewingInvoice(linkedInvoice)}
                            className="text-[10px] font-bold text-emerald-700 hover:underline cursor-pointer"
                          >
                            ✓ {linkedInvoice.invoiceNumber}
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400">{isAr ? 'بدون فاتورة' : 'No invoice'}</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedOrder(ord);
                              setOrderTrackingInput(ord.trackingNumber || '');
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-[#F8F7F2] border border-[#EAE6DC] text-[#14243E] font-bold text-[11px] hover:border-[#D5B46B] cursor-pointer flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3 text-[#92743A]" />
                            <span>{isAr ? 'تفاصيل' : 'Details'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const inv = issueOrderInvoice(ord.id);
                              if (inv) setViewingInvoice(inv);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-[#14243E] text-white font-bold text-[11px] hover:bg-[#1d3559] cursor-pointer flex items-center gap-1"
                          >
                            <Receipt className="w-3 h-3 text-[#D5B46B]" />
                            <span>{isAr ? 'إصدار فاتورة' : 'Invoice'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Compact workspace heading inspired by the approved mobile reference. */}
      <section className="qabs-workspace-heading mb-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] font-bold text-[#92743A] mb-1">
            <span>
              {isProductionMode
                ? isAr
                  ? 'مساحة عمل قبس — وضع الإنتاج'
                  : 'QABS Workspace — Production'
                : isAr
                ? 'مساحة عمل تجريبية'
                : 'Workspace Preview'}
            </span>
            <span className="h-px w-8 bg-[#D5B46B]" />
            <span className="px-2 py-0.5 rounded bg-[#F5F1E6] text-[#14243E] font-mono text-[10px]">
              /{tabSlugs[activeTab]}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#14243E] dark:text-white">
            {isAr ? (sidebarItems.find(item => item.id === activeTab)?.labelAr || 'مساحة العمل') : (sidebarItems.find(item => item.id === activeTab)?.labelEn || 'Workspace')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isAr ? (sidebarItems.find(item => item.id === activeTab)?.descAr || 'إدارة خدمات قبس من مساحة واحدة') : 'Manage your QABS services in one workspace'}
          </p>
        </div>
        <div className="qabs-workspace-tools flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-expanded={sidebarOpen}
            aria-controls="qabs-workspace-sidebar"
            onClick={() => setSidebarOpen(open => !open)}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#D5B46B] bg-white dark:bg-[#071D2B] px-3 py-2 text-xs font-bold text-[#14243E] dark:text-white hover:bg-[#F8F7F2] dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {isAr ? (
              sidebarOpen ? <PanelRightClose className="w-4 h-4 text-[#92743A]" /> : <PanelRightOpen className="w-4 h-4 text-[#92743A]" />
            ) : (
              sidebarOpen ? <PanelLeftClose className="w-4 h-4 text-[#92743A]" /> : <PanelLeftOpen className="w-4 h-4 text-[#92743A]" />
            )}
            <span>
              {sidebarOpen
                ? isAr ? 'إخفاء القائمة' : 'Hide menu'
                : isAr ? 'إظهار القائمة' : 'Show menu'}
            </span>
          </button>

          {isOwner ? (
            <button
              type="button"
              onClick={toggleProductionMode}
              className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-xs font-black transition-colors cursor-pointer ${
                isProductionMode
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  : 'border-[#EAE6DC] bg-[#F5F1E6] text-[#92743A] hover:border-[#D5B46B]'
              }`}
            >
              {isProductionMode ? <Rocket className="w-3.5 h-3.5 text-emerald-600" /> : <FlaskConical className="w-3.5 h-3.5" />}
              <span>
                {isProductionMode
                  ? isAr ? 'وضع الإنتاج مفعّل ✓' : 'Production Active ✓'
                  : isAr ? 'تحويل إلى وضع الإنتاج' : 'Switch to Production'}
              </span>
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-[#D5B46B]/60 bg-[#F5F1E6] px-3 py-2 text-xs font-black text-[#14243E]">
              <span>{isAr ? `حساب العميل: ${user.name}` : `Client: ${user.name}`}</span>
            </span>
          )}

          <select
            aria-label={isAr ? 'اختيار المتجر النشط' : 'Select active store'}
            value={activeStoreId}
            onChange={e => setActiveStoreId(e.target.value)}
            className="min-w-0 max-w-full rounded-md border border-[#EAE6DC] bg-white dark:bg-[#071D2B] dark:text-white px-3 py-2 text-xs font-bold text-[#14243E]"
          >
            {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <button onClick={() => setMode('store_builder')} className="rounded-md bg-[#14243E] px-3 py-2 text-xs font-bold text-white cursor-pointer">
            {isAr ? 'استوديو قبس' : 'QABS Studio'}
          </button>
          <button
            type="button"
            onClick={resetWorkspaceData}
            title={isAr ? 'استعادة البيانات الافتراضية' : 'Reset workspace data'}
            className="rounded-md border border-[#EAE6DC] bg-white dark:bg-[#071D2B] p-2 text-slate-500 hover:text-[#14243E] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* Admin Feedback Alert if changes requested */}
      {currentStore.adminFeedback && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-black">
                {isAr ? 'ملاحظات مراجعة إدارة قبس المركزية:' : 'QABS Central Admin Review Notes:'}
              </span>{' '}
              {currentStore.adminFeedback}
            </div>
          </div>
          <button
            onClick={() => submitStoreForApproval(currentStore.id)}
            className="px-3 py-1.5 rounded-xl bg-amber-700 text-white text-xs font-bold hover:bg-amber-800 cursor-pointer shrink-0"
          >
            {isAr ? 'إعادة الإرسال بعد التعديل' : 'Resubmit Store'}
          </button>
        </div>
      )}

      {/* Shopify-style hide/show workspace sidebar (drawer on mobile, collapsible rail on desktop) */}
      <div className="qabs-workspace-layout flex flex-col lg:flex-row gap-5 lg:gap-6 items-start">
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] lg:hidden"
            aria-hidden="true"
          />
        )}

        {sidebarOpen && (
          <aside
            id="qabs-workspace-sidebar"
            className={`qabs-workspace-sidebar fixed top-20 bottom-0 z-50 w-72 max-w-[85vw] overflow-y-auto bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 shadow-2xl transition-all duration-200 lg:static lg:top-auto lg:bottom-auto lg:z-auto lg:w-64 lg:max-w-none lg:overflow-visible lg:rounded-2xl lg:shadow-sm shrink-0 ${
              isAr ? 'right-0 rounded-l-2xl lg:rounded-2xl' : 'left-0 rounded-r-2xl lg:rounded-2xl'
            }`}
            aria-label={isAr ? 'القائمة الجانبية لمساحة العمل' : 'Workspace sidebar'}
          >
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between gap-2 px-2 pt-1 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    {isAr ? 'مساحة العمل' : 'Workspace'}
                  </span>
                  <span className="text-[11px] font-bold text-[#92743A] dark:text-[#D5B46B]">
                    {isProductionMode ? (isAr ? 'إنتاج' : 'Live') : isAr ? 'تجريبي' : 'Preview'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-[#14243E] dark:hover:text-white hover:bg-[#F8F7F2] dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label={isAr ? 'إخفاء القائمة' : 'Hide menu'}
                  title={isAr ? 'إخفاء القائمة' : 'Hide menu'}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav
                id="qabs-workspace-section-links"
                aria-label={isAr ? 'أقسام لوحة التحكم' : 'Dashboard sections'}
                className="flex flex-col gap-1"
              >
                {primarySidebarItems.map(item => {
                  const Icon = item.icon;
                  const isActive = item.matchTabs ? item.matchTabs.includes(activeTab) : activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      aria-current={isActive ? 'page' : undefined}
                      onClick={() => navigateToTab(item.id)}
                      className={`qabs-nav-item w-full rounded-xl px-3.5 py-2.5 flex items-center gap-3 text-xs font-bold transition-colors cursor-pointer ${
                        isActive
                          ? 'qabs-nav-item-active bg-[#14243E] text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-200 hover:bg-[#F8F7F2] dark:hover:bg-slate-800 hover:text-[#14243E]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                      <span className="min-w-0 flex-1 truncate text-start">
                        {isAr ? item.labelAr : item.labelEn}
                      </span>
                    </button>
                  );
                })}
              </nav>

              <div className="pt-3 mt-2 border-t border-[#EAE6DC] dark:border-slate-800 px-2 space-y-2 text-[11px] text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  <span>
                    {isOwner
                      ? isAr
                        ? 'حساب المالك الوحيد (Super Admin)'
                        : 'Sole Owner (Super Admin)'
                      : isAr
                      ? 'مساحة عمل العميل — متابعة الطلبات والمستندات'
                      : 'Client Workspace'}
                  </span>
                </div>
                {isOwner ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('admin');
                      if (typeof window !== 'undefined' && window.innerWidth < 1024) setSidebarOpen(false);
                    }}
                    className="block text-start font-bold text-[#92743A] underline underline-offset-4 hover:text-[#14243E] dark:hover:text-white transition-colors cursor-pointer"
                  >
                    {isAr ? 'الانتقال إلى لوحة إدارة المالك (أنور الغزالي)' : 'Open Owner Admin Panel'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={logout}
                    className="block text-start text-rose-600 hover:underline transition-colors cursor-pointer font-bold"
                  >
                    {isAr ? 'تسجيل الخروج والعودة للواجهة العامة' : 'Sign Out to Public Showcase'}
                  </button>
                )}
              </div>
            </div>
          </aside>
        )}

        {/* Main Content Area */}
        <main className="qabs-workspace-content flex-1 w-full min-w-0 space-y-6">
              {storeSubTabs.includes(activeTab) && (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#EAE6DC] bg-white dark:bg-[#071D2B] px-4 py-2.5 text-xs">
                  <button
                    type="button"
                    onClick={() => navigateToTab('my_stores')}
                    className="font-bold text-[#14243E] dark:text-[#D5B46B] hover:underline cursor-pointer"
                  >
                    {isAr ? '← العودة إلى متاجري' : '← Back to My Stores'}
                  </button>
                  <span className="text-slate-500 font-semibold">
                    {isAr
                      ? sidebarItems.find(item => item.id === activeTab)?.labelAr
                      : sidebarItems.find(item => item.id === activeTab)?.labelEn}
                  </span>
                </div>
              )}
              {sectionSettings.overview.showPreviewBanner && !activeTab.endsWith('_settings') && (
                isProductionMode ? (
                  <div role="status" className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-300" />
                        <div className="min-w-0">
                          <div className="text-sm font-black">
                            {isAr ? 'البوابة الحقيقية مفعّلة (وضع الإنتاج) — موافقة قبس للدفع والشحن سارية' : 'Production Portal Active — QABS Payment & Shipping Approved'}
                          </div>
                          <p className="mt-1 text-xs leading-5">
                            {isAr
                              ? 'تم اعتماد بوابة الدفع والشحن ونشر المتجر، ويتم حفظ كافة المنتجات والطلبات والفواتير وإعدادات Shopify محلياً في مساحة العمل.'
                              : 'Payment & shipping are approved and all products, orders, invoices, and Shopify settings persist locally across reloads.'}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={toggleProductionMode}
                        className="px-3.5 py-2 rounded-xl border border-emerald-300 bg-white text-emerald-800 text-xs font-bold hover:bg-emerald-100 cursor-pointer shrink-0 self-start sm:self-center"
                      >
                        {isAr ? 'العودة لوضع الاختبار' : 'Switch to Test Mode'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div role="status" className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700 dark:text-amber-300" />
                        <div className="min-w-0">
                          <div className="text-sm font-black">{isAr ? 'وضع الاختبار التفاعلي — التغييرات محفوظة محلياً' : 'Interactive Test Workspace — Local State Persisted'}</div>
                          <p className="mt-1 text-xs leading-5">
                            {isAr
                              ? 'يمكنك تجربة إضافة المنتجات والطلبات وأوامر قبس AI، أو تفعيل البوابة الحقيقية لاعتماد الدفع والشحن والانتقال لوضع الإنتاج.'
                              : 'Test adding products, creating orders, and running QABS AI commands, or activate Production Mode to approve payment & shipping.'}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => activateProductionMode(currentStore.id)}
                        className="px-4 py-2 rounded-xl bg-[#14243E] text-white text-xs font-black hover:bg-[#1d3559] cursor-pointer shrink-0 self-start sm:self-center flex items-center gap-1.5 shadow-xs"
                      >
                        <Rocket className="w-3.5 h-3.5 text-[#D5B46B]" />
                        <span>{isAr ? 'تفعيل البوابة الحقيقية (إنتاج)' : 'Activate Production Mode'}</span>
                      </button>
                    </div>
                  </div>
                )
              )}

          {/* SECTION 1: OVERVIEW (/overview) */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div>
                  <h2 className="text-lg font-black text-[#14243E] dark:text-white">
                    {isAr ? `لوحة نظرة عامة — ${currentStore.name}` : `Overview — ${currentStore.name}`}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isAr
                      ? `العملة الافتراضية: ${sectionSettings.overview.defaultCurrency} • بطاقات الإحصائيات: ${sectionSettings.overview.showKpiCards ? 'ظاهرة' : 'مخفية'} • قائمة الإعداد: ${sectionSettings.overview.showSetupChecklist ? 'ظاهرة' : 'مخفية'}`
                      : `Currency: ${sectionSettings.overview.defaultCurrency} • KPIs: ${sectionSettings.overview.showKpiCards ? 'Shown' : 'Hidden'}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigateToTab('overview_settings')}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#D5B46B] bg-[#FBFAF6] hover:bg-[#F5F1E6] text-[#14243E] px-4 py-2.5 text-xs font-black cursor-pointer self-start sm:self-auto"
                >
                  <span>{isAr ? '⚙️ إعدادات نظرة عامة' : '⚙️ Overview Settings'}</span>
                </button>
              </div>

              {/* Live Store KPIs */}
              {sectionSettings.overview.showKpiCards && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 shadow-sm">
                    <div className="text-xs text-slate-500 font-bold">
                      {isAr ? 'إجمالي مبيعات المتجر' : 'Store Total Sales'}
                    </div>
                    <div className="text-2xl font-black text-[#14243E] dark:text-white mt-1">
                      {totalSalesRevenue.toLocaleString()} <span className="text-xs text-[#92743A]">{sectionSettings.overview.defaultCurrency || currentStore.currency}</span>
                    </div>
                    <div className="text-[11px] text-emerald-600 font-bold mt-2">
                      {isAr ? `صافي تقديري: ${netProfit.toLocaleString()} ${sectionSettings.overview.defaultCurrency || currentStore.currency}` : `Est. Net: ${netProfit.toLocaleString()} ${sectionSettings.overview.defaultCurrency || currentStore.currency}`}
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 shadow-sm">
                    <div className="text-xs text-slate-500 font-bold">
                      {isAr ? 'الطلبات المسجلة' : 'Store Orders'}
                    </div>
                    <div className="text-2xl font-black text-[#14243E] dark:text-white mt-1">
                      {storeOrders.length}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-2">
                      {isAr
                        ? `${paidOrdersCount} مدفوع • ${processingOrdersCount} تجهيز • ${shippedOrdersCount} مشحون`
                        : `${paidOrdersCount} paid • ${processingOrdersCount} processing • ${shippedOrdersCount} shipped`}
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 shadow-sm">
                    <div className="text-xs text-slate-500 font-bold">
                      {isAr ? 'المنتجات والمخزون الفعلي' : 'Products & Stock Units'}
                    </div>
                    <div className="text-2xl font-black text-[#14243E] dark:text-white mt-1">
                      {storeProducts.length} <span className="text-xs font-bold text-slate-400">({totalStockUnits} {isAr ? 'وحدة' : 'units'})</span>
                    </div>
                    <div className={`text-[11px] font-bold mt-2 ${lowStockCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {lowStockCount > 0
                        ? isAr
                          ? `تنبيه: ${lowStockCount} منتجات بمخزون منخفض`
                          : `${lowStockCount} low-stock products`
                        : isAr
                        ? 'المخزون متوازن بالكامل'
                        : 'Inventory levels healthy'}
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 shadow-sm">
                    <div className="text-xs text-slate-500 font-bold">
                      {isAr ? 'تأسيس الشركات والامتثال' : 'Company Formations'}
                    </div>
                    <div className="text-2xl font-black text-[#14243E] dark:text-white mt-1">
                      {companies.length} <span className="text-xs text-[#92743A] font-bold">({companies.filter(c => c.status === 'approved').length} {isAr ? 'معتمدة' : 'active'})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigateToTab('company_formation')}
                      className="text-[11px] text-[#92743A] font-bold mt-2 hover:underline cursor-pointer"
                    >
                      {isAr
                        ? `${companies.filter(c => c.status !== 'approved').length} قيد الإجراء • فتح تأسيس الشركات ←`
                        : `${companies.filter(c => c.status !== 'approved').length} in progress • Open Formation →`}
                    </button>
                  </div>
                </div>
              )}

              {/* Interactive 4-Step Setup Checklist */}
              {sectionSettings.overview.showSetupChecklist && (
              <div className="bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-[#14243E] dark:text-white">
                        {isAr ? 'خطوات الإعداد الأربع لمتجرك (تفاعلية)' : '4-Step Store Setup Checklist'}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#F5F1E6] text-[#92743A] text-[11px] font-black">
                        {fourStepsDoneCount} / 4
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isAr
                        ? 'إتمام أي خطوة أو إضافة منتجات وطلبات ينعكس فوراً على جاهزية المتجر ومؤشرات النظرة العامة'
                        : 'Completing steps or adding products and orders updates your store readiness KPIs immediately'}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={openNewProductModal}
                      className="px-3.5 py-2 rounded-xl border border-[#D5B46B] bg-[#FBFAF6] text-[#14243E] text-xs font-black hover:bg-[#F5F1E6] cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#92743A]" />
                      <span>{isAr ? 'إضافة منتج' : 'Add Product'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={openNewOrderModal}
                      className="px-3.5 py-2 rounded-xl bg-[#14243E] text-white text-xs font-black hover:bg-[#1d3559] cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#D5B46B]" />
                      <span>{isAr ? 'إنشاء طلب' : 'New Order'}</span>
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 rounded-full bg-[#F5F1E6] dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#14243E] to-[#D5B46B] transition-all duration-300"
                    style={{ width: `${Math.round((fourStepsDoneCount / 4) * 100)}%` }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {fourSetupSteps.map(st => (
                    <div
                      key={st.id}
                      className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                        st.done
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900'
                          : 'bg-[#F8F7F2] dark:bg-slate-900 border-[#EAE6DC] dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => toggleSetupStep(currentStore.id, st.id)}
                          className="flex items-start gap-2.5 text-right cursor-pointer"
                        >
                          {st.done ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                          ) : (
                            <Clock className="w-5 h-5 text-[#92743A] shrink-0 mt-0.5" />
                          )}
                          <div>
                            <div className="text-xs font-black text-[#14243E] dark:text-white">{isAr ? st.titleAr : st.titleEn}</div>
                            <div className="text-[11px] text-slate-500 mt-1">{isAr ? st.descAr : st.descEn}</div>
                          </div>
                        </button>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800 text-[11px]">
                        <button
                          type="button"
                          onClick={() => toggleSetupStep(currentStore.id, st.id)}
                          className="font-bold text-slate-500 hover:text-[#14243E] cursor-pointer"
                        >
                          {st.done ? (isAr ? 'مكتملة ✓' : 'Done ✓') : isAr ? 'تحديد كمكتمل' : 'Mark complete'}
                        </button>
                        <button
                          type="button"
                          onClick={() => navigateToTab(st.tab)}
                          className="font-black text-[#92743A] hover:underline cursor-pointer"
                        >
                          {isAr ? 'فتح القسم ←' : 'Open →'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              )}

              {/* Recent Store Orders & Products Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-[#14243E] dark:text-white">
                      {isAr ? 'أحدث طلبات هذا المتجر' : 'Recent Store Orders'}
                    </h4>
                    <button
                      onClick={() => navigateToTab('orders')}
                      className="text-xs font-bold text-[#92743A] hover:underline cursor-pointer"
                    >
                      {isAr ? 'إدارة الطلبات' : 'Manage Orders'}
                    </button>
                  </div>
                  {storeOrders.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">
                      {isAr ? 'لا توجد طلبات مسجلة في هذا المتجر بعد' : 'No orders for this store yet'}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {storeOrders.slice(0, 4).map(ord => (
                        <div
                          key={ord.id}
                          onClick={() => {
                            setSelectedOrder(ord);
                            setOrderTrackingInput(ord.trackingNumber || '');
                          }}
                          className="p-3 rounded-xl bg-[#F8F7F2] dark:bg-slate-900 flex items-center justify-between text-xs hover:border-[#D5B46B] border border-transparent cursor-pointer"
                        >
                          <div>
                            <div className="font-bold text-[#14243E] dark:text-white">
                              {ord.orderNumber} — {ord.customerName}
                            </div>
                            <div className="text-[11px] text-slate-500">{ord.date}</div>
                          </div>
                          <div className="text-left">
                            <div className="font-black text-[#14243E] dark:text-[#D5B46B]">
                              {ord.total} {currentStore.currency}
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F5F1E6] text-[#92743A] font-bold">
                              {isAr ? statusLabelAr[ord.status] || ord.status : ord.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-[#14243E] dark:text-white">
                      {isAr ? 'منتجات المتجر والمخزون' : 'Store Catalog & Inventory'}
                    </h4>
                    <button
                      type="button"
                      onClick={openNewProductModal}
                      className="text-xs font-black text-[#92743A] hover:underline cursor-pointer"
                    >
                      {isAr ? '+ إضافة منتج' : '+ Add Product'}
                    </button>
                  </div>
                  {storeProducts.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">
                      {isAr ? 'لم تتم إضافة منتجات لهذا المتجر بعد' : 'No products in this store yet'}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {storeProducts.slice(0, 4).map(prod => (
                        <div
                          key={prod.id}
                          onClick={() => openEditProductModal(prod)}
                          className="p-3 rounded-xl bg-[#F8F7F2] dark:bg-slate-900 flex items-center justify-between text-xs hover:border-[#D5B46B] border border-transparent cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <img src={prod.image || prod.imageUrl} alt="" className="w-9 h-9 rounded-lg object-cover" />
                            <div>
                              <div className="font-bold text-[#14243E] dark:text-white">
                                {isAr ? prod.nameAr || prod.titleAr : prod.nameEn || prod.titleEn}
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono">SKU: {prod.sku}</div>
                            </div>
                          </div>
                          <div className="text-left">
                            <div className="font-black text-[#14243E] dark:text-white">
                              {prod.price} {currentStore.currency}
                            </div>
                            <div className={`text-[10px] font-bold ${prod.stock <= 5 ? 'text-amber-600' : 'text-emerald-600'}`}>
                              {isAr ? `المخزون: ${prod.stock}` : `Stock: ${prod.stock}`}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: MY STORES (متاجري — إنشاء عدة متاجر وإدارتها) */}
          {activeTab === 'my_stores' && (
            <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-[#004457] dark:text-white">
                    {isAr ? 'متاجري المستقلة (إدارة عدة متاجر بحساب واحد)' : 'My Independent Stores'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {isAr
                      ? 'كل متجر يمتلك قاعدة منتجات وطلبات وعملاء ونطاق فرعي مستقل تماماً عن المتاجر الأخرى'
                      : 'Each store has its own isolated products, orders, customers, and domain'}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 self-start">
                  <button
                    type="button"
                    onClick={() => navigateToTab('stores_settings')}
                    className="px-4 py-2.5 rounded-xl border border-[#D5B46B] bg-[#FBFAF6] text-[#14243E] text-xs font-black hover:bg-[#F5F1E6] cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{isAr ? '⚙️ إعدادات متاجري' : '⚙️ Stores Settings'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={openNewProductModal}
                    className="px-4 py-2.5 rounded-xl border border-[#D5B46B] bg-[#FBFAF6] text-[#14243E] text-xs font-black hover:bg-[#F5F1E6] cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4 text-[#92743A]" />
                    <span>{isAr ? '+ إضافة منتج' : '+ Add Product'}</span>
                  </button>
                  <button
                    onClick={() => navigateToTab('create_store')}
                    className="px-4 py-2.5 rounded-xl bg-[#14243E] text-white text-xs font-black hover:bg-[#1d3559] cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4 text-[#D5B46B]" />
                    <span>{isAr ? 'إنشاء متجر جديد' : 'Create New Store'}</span>
                  </button>
                </div>
              </div>

              {renderShopifyIntegrationCard()}

              <div className="rounded-2xl border border-[#D5B46B]/40 bg-[#FBFAF6] dark:bg-slate-900/40 p-4 space-y-3">
                <div className="flex items-center justify-between gap-2"><h3 className="text-sm font-black text-[#14243E] dark:text-white">{isAr ? 'إدارة المتجر — جميع الأقسام' : 'Store Management — All Sections'}</h3><span className="text-[10px] text-slate-500">{isAr ? 'اختر قسماً لفتحه في صفحة مستقلة' : 'Open each section as a separate page'}</span></div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {sidebarItems.filter(item => (['create_store','store_design','pages','products','inventory','orders','customers','discounts','payments','shipping','domains','apps','analytics','stores_settings'] as ClientTab[]).includes(item.id)).map(item => {
                    const ItemIcon = item.icon;
                    return <button key={item.id} onClick={() => navigateToTab(item.id)} className="min-h-[86px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#071D2B] p-3 text-right hover:border-[#D5B46B] hover:shadow-sm transition-all cursor-pointer">
                      <span className="flex items-center justify-between gap-2"><ItemIcon className="w-4 h-4 text-[#A88948]"/>{item.badge !== undefined && <span className="text-[10px] text-slate-400">{item.badge}</span>}</span>
                      <span className="block mt-2 text-xs font-black text-[#14243E] dark:text-white">{isAr ? item.labelAr : item.labelEn}</span>
                      <span className="block mt-1 text-[10px] leading-4 text-slate-500">{item.descAr}</span>
                    </button>;
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stores.map(st => {
                  const stProds = products.filter(p => p.storeId === st.id).length;
                  const stOrders = orders.filter(o => o.storeId === st.id).length;
                  const isCurrent = st.id === activeStoreId;
                  return (
                    <div
                      key={st.id}
                      className={`p-5 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                        isCurrent
                          ? 'border-[#00A896] bg-teal-50/30 dark:bg-teal-950/20'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-black text-[#004457] dark:text-white">{st.name}</h3>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                              st.approvalStatus === 'approved_published'
                                ? 'bg-emerald-100 text-emerald-800'
                                : st.approvalStatus === 'pending_review'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {st.approvalStatus === 'approved_published'
                              ? isAr
                                ? 'حالة تجريبية: منشور'
                                : 'Sample: Published'
                              : st.approvalStatus === 'pending_review'
                              ? isAr
                                ? 'بانتظار الاعتماد'
                                : 'Pending Review'
                              : isAr
                              ? 'مسودة'
                              : 'Draft'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500">{isAr ? st.activityAr : st.activityEn}</div>
                        <div className="text-xs font-mono text-[#00A896]">{st.subdomain}</div>
                        <div className="flex items-center gap-4 text-xs font-bold text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <span>
                            {stProds} {isAr ? 'منتجات معزولة' : 'Products'}
                          </span>
                          <span>•</span>
                          <span>
                            {stOrders} {isAr ? 'طلبات' : 'Orders'}
                          </span>
                          <span>•</span>
                          <span>{st.currency}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <button
                          onClick={() => setActiveStoreId(st.id)}
                          className={`flex-1 py-2 rounded-xl text-xs font-black cursor-pointer ${
                            isCurrent
                              ? 'bg-[#00A896] text-white'
                              : 'bg-[#004457] text-white hover:bg-[#003342]'
                          }`}
                        >
                          {isCurrent
                            ? isAr
                              ? 'المتجر النشط حالياً ✓'
                              : 'Active Store ✓'
                            : isAr
                            ? 'التبديل لإدارة هذا المتجر'
                            : 'Switch to This Store'}
                        </button>
                        <button
                          onClick={() => {
                            setActiveStoreId(st.id);
                            setMode('store_builder');
                          }}
                          className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-[#004457] dark:text-teal-300 cursor-pointer"
                        >
                          {isAr ? 'استوديو التصميم' : 'Studio'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 3: CREATE STORE (إنشاء متجر — الاسم والنشاط واللغة والعملة) */}
          {activeTab === 'create_store' && (
            <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
              <div>
                <h2 className="text-lg font-black text-[#004457] dark:text-white">
                  {isAr ? 'إنشاء متجر إلكتروني مستقل جديد' : 'Create New Independent Store'}
                </h2>
                <p className="text-xs text-slate-500">
                  {isAr
                    ? 'حدد الاسم والنشاط واللغة والعملة والقالب المبدئي لمتجرك الجديد'
                    : 'Configure store name, business activity, language, currency, and starting template'}
                </p>
              </div>

              <form onSubmit={handleInlineCreateStore} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isAr ? 'اسم المتجر *' : 'Store Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={newStoreName}
                      onChange={e => {
                        setNewStoreName(e.target.value);
                        setNewStoreSubdomain(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9]/g, '-')
                            .replace(/-+/g, '-') || 'mystore'
                        );
                      }}
                      placeholder={isAr ? 'مثال: دار العود الملكي' : 'e.g. Royal Oud House'}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isAr ? 'النشاط التجاري *' : 'Business Activity *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={newStoreActivity}
                      onChange={e => setNewStoreActivity(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isAr ? 'البلد' : 'Country'}
                    </label>
                    <select
                      value={newStoreCountry}
                      onChange={e => setNewStoreCountry(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2.5 text-xs font-bold"
                    >
                      <option value="SA">{isAr ? 'السعودية (SA)' : 'Saudi Arabia'}</option>
                      <option value="AE">{isAr ? 'الإمارات (AE)' : 'UAE'}</option>
                      <option value="KW">{isAr ? 'الكويت (KW)' : 'Kuwait'}</option>
                      <option value="US">{isAr ? 'أمريكا (US)' : 'United States'}</option>
                      <option value="UK">{isAr ? 'بريطانيا (UK)' : 'United Kingdom'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isAr ? 'اللغة الافتراضية' : 'Store Language'}
                    </label>
                    <select
                      value={newStoreLang}
                      onChange={e => setNewStoreLang(e.target.value as 'ar' | 'en' | 'both')}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2.5 text-xs font-bold"
                    >
                      <option value="both">{isAr ? 'العربية والإنجليزية معاً' : 'Arabic & English'}</option>
                      <option value="ar">{isAr ? 'العربية (RTL)' : 'Arabic Only'}</option>
                      <option value="en">{isAr ? 'الإنجليزية (LTR)' : 'English Only'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isAr ? 'العملة' : 'Currency'}
                    </label>
                    <select
                      value={newStoreCurrency}
                      onChange={e => setNewStoreCurrency(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2.5 text-xs font-bold"
                    >
                      <option value="SAR">SAR (ر.س)</option>
                      <option value="AED">AED (د.إ)</option>
                      <option value="USD">USD ($)</option>
                      <option value="KWD">KWD (د.ك)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    {isAr ? 'اختر القالب الابتدائي' : 'Select Starting Template'}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {storeTemplates.map(tpl => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => setNewStoreTemplate(tpl.id)}
                        className={`p-3 rounded-xl border text-right cursor-pointer ${
                          newStoreTemplate === tpl.id
                            ? 'border-[#00A896] bg-teal-50/50 font-bold'
                            : 'border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div className="text-xs font-black text-[#004457] dark:text-white">
                          {isAr ? tpl.nameAr : tpl.nameEn}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {isAr ? tpl.categoryAr : tpl.categoryEn}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#004457] to-[#00A896] text-white font-black text-xs cursor-pointer shadow-md"
                >
                  {isAr ? 'إنشاء المتجر والانتقال لإدارته فوراً' : 'Create Store & Switch Workspace'}
                </button>
              </form>
            </div>
          )}

          {/* SECTION 4: STORE DESIGN (تصميم المتجر — القوالب والألوان والخطوط) */}
          {activeTab === 'store_design' && (
            <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-[#004457] dark:text-white">
                    {isAr ? 'تصميم المتجر (القوالب والألوان والخطوط)' : 'Store Design (Templates, Colors & Fonts)'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {isAr
                      ? 'عدّل الهوية البصرية لمتجرك أو افتح محرر السحب والإفلات الكامل في QABS Studio'
                      : 'Customize your store colors and typography or launch full QABS Studio visual builder'}
                  </p>
                </div>
                <button
                  onClick={() => setMode('store_builder')}
                  className="px-4 py-2.5 rounded-xl bg-[#004457] text-white text-xs font-black hover:bg-[#003342] cursor-pointer flex items-center gap-2 self-start"
                >
                  <Eye className="w-4 h-4 text-[#E5C158]" />
                  <span>{isAr ? 'فتح المحرر المرئي الكامل QABS Studio' : 'Open Full QABS Studio'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isAr ? 'اللون الأساسي للمتجر' : 'Primary Brand Color'}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={currentStore.primaryColor || '#004457'}
                      onChange={e => updateStoreDetails(currentStore.id, { primaryColor: e.target.value })}
                      className="w-10 h-10 rounded-lg border border-slate-300 cursor-pointer"
                    />
                    <span className="text-xs font-mono">{currentStore.primaryColor || '#004457'}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isAr ? 'اللون الثانوي / الأزرار' : 'Accent Color'}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={currentStore.accentColor || '#C8A24A'}
                      onChange={e => updateStoreDetails(currentStore.id, { accentColor: e.target.value })}
                      className="w-10 h-10 rounded-lg border border-slate-300 cursor-pointer"
                    />
                    <span className="text-xs font-mono">{currentStore.accentColor || '#C8A24A'}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isAr ? 'الخط الرسمي للمتجر' : 'Store Typography'}
                  </label>
                  <select
                    value={currentStore.fontFamily || 'Cairo'}
                    onChange={e => updateStoreDetails(currentStore.id, { fontFamily: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2.5 text-xs font-bold"
                  >
                    <option value="Cairo">Cairo (كايرو العصري)</option>
                    <option value="Tajawal">Tajawal (تجوال للتجارة)</option>
                    <option value="IBM Plex Sans Arabic">IBM Plex Sans Arabic</option>
                    <option value="Readex Pro">Readex Pro</option>
                  </select>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-black text-slate-600 dark:text-slate-300 mb-3">
                  {isAr ? 'القوالب الجاهزة المتاحة لمتجرك:' : 'Ready Templates for Your Store:'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {storeTemplates.map(tpl => (
                    <div
                      key={tpl.id}
                      onClick={() =>
                        updateStoreDetails(currentStore.id, {
                          templateId: tpl.id,
                          theme: tpl.theme,
                          primaryColor: tpl.primaryColor,
                          accentColor: tpl.accentColor,
                          fontFamily: tpl.fontFamily
                        })
                      }
                      className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                        currentStore.templateId === tpl.id
                          ? 'border-[#00A896] bg-teal-50/40'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <img src={tpl.previewImage} alt="" className="w-full h-24 object-cover rounded-xl mb-2" />
                      <div className="text-xs font-black text-[#004457] dark:text-white">
                        {isAr ? tpl.nameAr : tpl.nameEn}
                      </div>
                      <div className="text-[10px] text-slate-500">{isAr ? tpl.categoryAr : tpl.categoryEn}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: PAGES (الصفحات — الرئيسية، من نحن، اتصل بنا، وصفحات مخصصة) */}
          {activeTab === 'pages' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                <h2 className="text-lg font-black text-[#004457] dark:text-white">
                  {isAr ? 'صفحات المتجر (الرئيسية، من نحن، اتصل بنا، والسياسات)' : 'Store Pages Manager'}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentStorePages.map(pg => (
                    <div
                      key={pg.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/70 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black text-[#004457] dark:text-white">
                          {isAr ? pg.titleAr : pg.titleEn}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                            /{pg.slug}
                          </span>
                          {pg.type === 'custom' && (
                            <button
                              onClick={() => deleteStorePage(pg.id)}
                              className="text-rose-500 hover:text-rose-700 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                        {isAr ? pg.contentAr : pg.contentEn}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Add Custom Page */}
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    if (!pageTitleAr.trim()) return;
                    saveStorePage({
                      storeId: currentStore.id,
                      titleAr: pageTitleAr,
                      titleEn: pageTitleAr,
                      slug: pageSlug || 'custom-page',
                      type: 'custom',
                      contentAr: pageContentAr || pageTitleAr,
                      contentEn: pageContentAr || pageTitleAr,
                      published: true
                    });
                    setPageTitleAr('');
                    setPageSlug('');
                    setPageContentAr('');
                  }}
                  className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3"
                >
                  <h3 className="text-xs font-black text-[#004457] dark:text-white">
                    {isAr ? '+ بناء صفحة مخصصة جديدة في المتجر' : '+ Create Custom Store Page'}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder={isAr ? 'عنوان الصفحة (مثال: الأسئلة الشائعة)' : 'Page Title'}
                      value={pageTitleAr}
                      onChange={e => setPageTitleAr(e.target.value)}
                      className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs"
                    />
                    <input
                      type="text"
                      placeholder={isAr ? 'الرابط اللطيف (مثال: faq)' : 'Slug (e.g. faq)'}
                      value={pageSlug}
                      onChange={e => setPageSlug(e.target.value)}
                      className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs font-mono"
                    />
                  </div>
                  <textarea
                    rows={2}
                    placeholder={isAr ? 'محتوى الصفحة...' : 'Page content...'}
                    value={pageContentAr}
                    onChange={e => setPageContentAr(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#004457] text-white text-xs font-bold cursor-pointer"
                  >
                    {isAr ? 'حفظ مسودة تجريبية' : 'Save Preview Draft'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* SECTION 6: PRODUCTS (المنتجات — نافذة منبثقة للإضافة والتعديل والمخزون) */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-black text-[#14243E] dark:text-white">
                      {isAr ? `إدارة منتجات المتجر (${currentStore.name})` : `Store Products (${currentStore.name})`}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {isAr
                        ? 'إضافة وتعديل المنتجات (الاسم، السعر، المخزون، الحالة، الصورة) مع خصم المخزون تلقائياً عند الطلب'
                        : 'Add & edit products (name, price, stock, status, image) with automatic stock deduction on new orders'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-start">
                    <span className="px-3 py-1.5 rounded-full bg-[#F5F1E6] text-[#92743A] text-xs font-black">
                      {storeProducts.length} {isAr ? 'منتج' : 'Products'} • {totalStockUnits} {isAr ? 'وحدة' : 'Units'}
                    </span>
                    <button
                      type="button"
                      onClick={openNewProductModal}
                      className="px-4 py-2.5 rounded-xl bg-[#14243E] hover:bg-[#1d3559] text-white font-black text-xs cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <Plus className="w-4 h-4 text-[#D5B46B]" />
                      <span>{isAr ? '+ إضافة منتج' : '+ Add Product'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Isolated Products Table */}
              <div className="bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-[#F8F7F2] dark:bg-slate-900 text-[#14243E] dark:text-slate-300 font-black border-b border-[#EAE6DC] dark:border-slate-800">
                      <tr>
                        <th className="p-3.5">{isAr ? 'المنتج' : 'Product'}</th>
                        <th className="p-3.5">{isAr ? 'الحالة والتصنيف' : 'Status & Category'}</th>
                        <th className="p-3.5">SKU & Barcode</th>
                        <th className="p-3.5">{isAr ? 'السعر / التكلفة' : 'Price / Cost'}</th>
                        <th className="p-3.5">{isAr ? 'المخزون والمبيعات' : 'Stock & Sales'}</th>
                        <th className="p-3.5">{isAr ? 'إجراءات' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAE6DC]/60 dark:divide-slate-800">
                      {storeProducts.map(prod => (
                        <tr key={prod.id} className="hover:bg-[#FBFAF6] dark:hover:bg-slate-900/40">
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              <img src={prod.image || prod.imageUrl} alt="" className="w-11 h-11 rounded-xl object-cover border border-[#EAE6DC]" />
                              <div>
                                <div className="font-black text-[#14243E] dark:text-white">
                                  {isAr ? prod.nameAr || prod.titleAr : prod.nameEn || prod.titleEn}
                                </div>
                                <div className="text-[11px] text-slate-400">{prod.warehouse || 'المستودع الرئيسي'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`px-2.5 py-0.5 rounded-full font-black text-[10px] ${
                                prod.status === 'active' && prod.stock > 0
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : prod.stock === 0 || prod.status === 'out_of_stock'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {prod.stock === 0 || prod.status === 'out_of_stock'
                                ? isAr
                                  ? 'نفد المخزون'
                                  : 'Out of stock'
                                : prod.status === 'draft'
                                ? isAr
                                  ? 'مسودة'
                                  : 'Draft'
                                : isAr
                                ? 'نشط'
                                : 'Active'}
                            </span>
                            <div className="text-[11px] text-slate-500 mt-1">{prod.category || prod.categoryAr}</div>
                          </td>
                          <td className="p-3.5 font-mono text-[11px]">
                            <div className="font-bold text-slate-700 dark:text-slate-200">{prod.sku}</div>
                            <div className="text-slate-400 flex items-center gap-1">
                              <Barcode className="w-3 h-3" />
                              <span>{prod.barcode || '6281000412'}</span>
                            </div>
                          </td>
                          <td className="p-3.5">
                            <div className="font-black text-[#14243E] dark:text-white">
                              {prod.price} {currentStore.currency}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {isAr ? `التكلفة: ${prod.costPrice || prod.cost || Math.round(prod.price * 0.55)}` : `Cost: ${prod.costPrice || 50}`}
                            </div>
                          </td>
                          <td className="p-3.5">
                            <div className={`font-black ${prod.stock <= (prod.lowStockThreshold || 5) ? 'text-amber-600' : 'text-emerald-600'}`}>
                              {prod.stock} {isAr ? 'وحدة' : 'units'}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {isAr ? `مبيعات: ${prod.salesCount || 0}` : `Sold: ${prod.salesCount || 0}`}
                            </div>
                          </td>
                          <td className="p-3.5">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openEditProductModal(prod)}
                                className="px-2.5 py-1.5 rounded-lg bg-[#F8F7F2] border border-[#EAE6DC] hover:border-[#D5B46B] text-[#14243E] font-bold text-[11px] cursor-pointer flex items-center gap-1"
                                title={isAr ? 'تعديل المنتج' : 'Edit product'}
                              >
                                <Edit3 className="w-3.5 h-3.5 text-[#92743A]" />
                                <span>{isAr ? 'تعديل' : 'Edit'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteProduct(prod.id)}
                                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer"
                                title={isAr ? 'حذف المنتج' : 'Delete'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 7: INVENTORY (المخزون — الكميات والمستودعات والتنبيهات) */}
          {activeTab === 'inventory' && (
            <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
              <div>
                <h2 className="text-lg font-black text-[#004457] dark:text-white">
                  {isAr ? 'إدارة المخزون والمستودعات وتنبيهات النفاذ' : 'Inventory, Warehouses & Low-Stock Alerts'}
                </h2>
                <p className="text-xs text-slate-500">
                  {isAr
                    ? 'متابعة فورية للكميات المتوفرة في مستودعات المتجر وتحديث الرصيد'
                    : 'Real-time stock levels and warehouse alerts'}
                </p>
              </div>

              <div className="space-y-3">
                {storeProducts.map(prod => {
                  const isLow = prod.stock <= (prod.lowStockThreshold || 10);
                  return (
                    <div
                      key={prod.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <img src={prod.image || prod.imageUrl} alt="" className="w-11 h-11 rounded-xl object-cover" />
                        <div>
                          <div className="text-sm font-black text-[#004457] dark:text-white">
                            {isAr ? prod.nameAr || prod.titleAr : prod.nameEn || prod.titleEn}
                          </div>
                          <div className="text-xs text-slate-500">
                            {prod.warehouse || 'المستودع الرئيسي'} • SKU: <span className="font-mono">{prod.sku}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {isLow && (
                          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black">
                            {isAr ? 'تنبيه: مخزون منخفض' : 'Low Stock Alert'}
                          </span>
                        )}
                        <div className="text-sm font-black text-[#004457] dark:text-white">
                          {prod.stock} {isAr ? 'قطعة' : 'in stock'}
                        </div>
                        <button
                          onClick={() => updateProduct(prod.id, { stock: prod.stock + 10 })}
                          className="px-3 py-1.5 rounded-xl bg-teal-50 text-[#004457] font-bold text-xs hover:bg-teal-100 cursor-pointer"
                        >
                          +10 {isAr ? 'توريد' : 'Restock'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 8: ORDERS (الطلبات — جدول تفاعلي، فلاتر، تفاصيل الطلب، وإصدار الفواتير) */}
          {activeTab === 'orders' && renderOrdersWorkspace()}

          {/* SECTION 9: CUSTOMERS (العملاء — بيانات العملاء وسجل مشترياتهم) */}
          {activeTab === 'customers' && (
            <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
              <h2 className="text-lg font-black text-[#004457] dark:text-white">
                {isAr ? 'عملاء المتجر وسجل مشترياتهم' : 'Store Customers & Purchase History'}
              </h2>

              <form
                onSubmit={e => {
                  e.preventDefault();
                  if (!custName.trim()) return;
                  addCustomer({
                    storeId: currentStore.id,
                    name: custName,
                    email: custEmail || 'customer@domain.com',
                    phone: custPhone,
                    city: custCity
                  });
                  setCustName('');
                  setCustEmail('');
                }}
                className="grid grid-cols-1 sm:grid-cols-4 gap-3"
              >
                <input
                  type="text"
                  required
                  placeholder={isAr ? 'اسم العميل *' : 'Customer Name *'}
                  value={custName}
                  onChange={e => setCustName(e.target.value)}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs"
                />
                <input
                  type="email"
                  placeholder={isAr ? 'البريد الإلكتروني' : 'Email'}
                  value={custEmail}
                  onChange={e => setCustEmail(e.target.value)}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs"
                />
                <input
                  type="text"
                  placeholder={isAr ? 'المدينة' : 'City'}
                  value={custCity}
                  onChange={e => setCustCity(e.target.value)}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-[#004457] text-white text-xs font-black py-2 px-4 cursor-pointer"
                >
                  {isAr ? '+ إضافة عميل للمتجر' : '+ Add Customer'}
                </button>
              </form>

              <div className="space-y-2.5">
                {storeCustomers.map(c => (
                  <div
                    key={c.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-black text-[#004457] dark:text-white">{c.name}</div>
                      <div className="text-slate-500">
                        {c.email} • {c.phone} • {c.city}
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="font-black text-emerald-600">
                        {c.totalSpent} {currentStore.currency}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {c.ordersCount} {isAr ? 'طلبات' : 'orders'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 10: DISCOUNTS (الخصومات — كوبونات وعروض) */}
          {activeTab === 'discounts' && (
            <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
              <h2 className="text-lg font-black text-[#004457] dark:text-white">
                {isAr ? 'كوبونات الخصم والعروض الترويجية' : 'Discount Coupons & Promotions'}
              </h2>

              <form
                onSubmit={e => {
                  e.preventDefault();
                  if (!discCode.trim()) return;
                  addDiscount({
                    storeId: currentStore.id,
                    code: discCode.toUpperCase(),
                    type: discType,
                    value: Number(discValue) || 10,
                    minOrderAmount: 100,
                    expiresAt: '2026-12-31',
                    status: 'active'
                  });
                  setDiscCode('');
                }}
                className="grid grid-cols-1 sm:grid-cols-4 gap-3"
              >
                <input
                  type="text"
                  required
                  placeholder={isAr ? 'كود الخصم (مثال: QABS20)' : 'Coupon Code'}
                  value={discCode}
                  onChange={e => setDiscCode(e.target.value)}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs font-mono uppercase"
                />
                <select
                  value={discType}
                  onChange={e => setDiscType(e.target.value as 'percentage' | 'fixed')}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs font-bold"
                >
                  <option value="percentage">{isAr ? 'نسبة مئوية (%)' : 'Percentage (%)'}</option>
                  <option value="fixed">{isAr ? 'مبلغ ثابت' : 'Fixed Amount'}</option>
                </select>
                <input
                  type="number"
                  placeholder={isAr ? 'قيمة الخصم' : 'Discount Value'}
                  value={discValue}
                  onChange={e => setDiscValue(e.target.value)}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-[#004457] text-white text-xs font-black py-2 px-4 cursor-pointer"
                >
                  {isAr ? '+ إنشاء الكوبون' : '+ Create Coupon'}
                </button>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {storeDiscounts.map(d => (
                  <div
                    key={d.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-mono font-black text-sm text-[#004457] dark:text-teal-300">{d.code}</div>
                      <div className="text-xs text-slate-500">
                        {d.type === 'percentage' ? `${d.value}%` : `${d.value} ${currentStore.currency}`} •{' '}
                        {isAr ? `استخدم ${d.usedCount} مرة` : `Used ${d.usedCount} times`}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleDiscountStatus(d.id)}
                      className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer ${
                        d.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {d.status === 'active' ? (isAr ? 'نشط' : 'Active') : isAr ? 'متوقف' : 'Expired'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 11: PAYMENTS (الدفع — قاعدة عدم تفعيل بوابة دفع تلقائياً) */}
          {activeTab === 'payments' && (
            <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-[#004457] dark:text-white">
                    {isAr ? 'إعداد وربط بوابات الدفع الإلكترونية' : 'Payment Gateways Setup'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {isAr
                      ? 'وفق سياسة الأمان في متاجر قبس: لا يتم تفعيل أي بوابة دفع تلقائياً، بل يتم التحقق منها واعتمادها من لوحة قبس المركزية'
                      : 'Per QABS governance: Payment gateways are never auto-activated; they require manual QABS Central Admin verification'}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black ${
                    currentStore.paymentApprovalStatus === 'approved_active'
                      ? 'bg-emerald-100 text-emerald-800'
                      : currentStore.paymentApprovalStatus === 'pending_admin_approval'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {currentStore.paymentApprovalStatus === 'approved_active'
                    ? isAr
                      ? 'بوابة الدفع معتمدة ومفعلة'
                      : 'Approved & Active'
                    : currentStore.paymentApprovalStatus === 'pending_admin_approval'
                    ? isAr
                      ? 'قيد مراجعة إدارة قبس'
                      : 'Pending QABS Verification'
                    : isAr
                    ? 'غير مفعلة'
                    : 'Unconfigured'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['Tap', 'Moyasar', 'Stripe'] as const).map(gw => (
                  <div
                    key={gw}
                    className={`p-5 rounded-2xl border-2 flex flex-col justify-between space-y-4 ${
                      currentStore.gatewayType === gw
                        ? 'border-[#00A896] bg-teal-50/30 dark:bg-teal-950/20'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="text-base font-black text-[#004457] dark:text-white">{gw} Payments</div>
                      <p className="text-xs text-slate-500 mt-1">
                        {gw === 'Tap'
                          ? isAr
                            ? 'مدى، فيزا، ماستركارد، أبل باي لدول الخليج'
                            : 'Mada, Visa, Apple Pay for GCC'
                          : gw === 'Moyasar'
                          ? isAr
                            ? 'بوابة ميسر المعتمدة في السعودية (مدى وسداد)'
                            : 'Saudi Arabia Mada, SADAD & Apple Pay'
                          : isAr
                          ? 'المدفوعات الدولية بالعملات المتعددة'
                          : 'Global multi-currency card processing'}
                      </p>
                    </div>
                    <button
                      onClick={() => requestPaymentActivation(currentStore.id, gw)}
                      className="w-full py-2.5 rounded-xl bg-[#004457] hover:bg-[#003342] text-white text-xs font-black cursor-pointer"
                    >
                      {isAr ? `طلب تفعيل ${gw} من إدارة قبس` : `Request ${gw} Activation`}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 12: SHIPPING (الشحن — المناطق والأسعار وطرق التوصيل) */}
          {activeTab === 'shipping' && (
            <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
              <h2 className="text-lg font-black text-[#004457] dark:text-white">
                {isAr ? 'مناطق الشحن وأسعار وشركات التوصيل' : 'Shipping Zones, Rates & Carriers'}
              </h2>

              <form
                onSubmit={e => {
                  e.preventDefault();
                  if (!shipRegionAr.trim()) return;
                  addShippingZone({
                    storeId: currentStore.id,
                    regionNameAr: shipRegionAr,
                    regionNameEn: shipRegionAr,
                    carrier: shipCarrier,
                    rate: Number(shipRate) || 25,
                    deliveryTimeAr: shipTime,
                    deliveryTimeEn: shipTime,
                    active: true
                  });
                  setShipRegionAr('');
                }}
                className="grid grid-cols-1 sm:grid-cols-4 gap-3"
              >
                <input
                  type="text"
                  required
                  placeholder={isAr ? 'المنطقة / المدن (مثال: كافة مدن المملكة)' : 'Region / Cities'}
                  value={shipRegionAr}
                  onChange={e => setShipRegionAr(e.target.value)}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs"
                />
                <input
                  type="text"
                  placeholder={isAr ? 'شركة الشحن (DHL / Aramex / SMSA)' : 'Carrier'}
                  value={shipCarrier}
                  onChange={e => setShipCarrier(e.target.value)}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs"
                />
                <input
                  type="number"
                  placeholder={isAr ? 'تكلفة الشحن' : 'Rate'}
                  value={shipRate}
                  onChange={e => setShipRate(e.target.value)}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-[#004457] text-white text-xs font-black py-2 px-4 cursor-pointer"
                >
                  {isAr ? '+ إضافة منطقة شحن' : '+ Add Shipping Zone'}
                </button>
              </form>

              <div className="space-y-2.5">
                {storeShipping.map(z => (
                  <div
                    key={z.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-black text-[#004457] dark:text-white">
                        {isAr ? z.regionNameAr : z.regionNameEn}
                      </div>
                      <div className="text-slate-500">
                        {z.carrier} • {isAr ? z.deliveryTimeAr : z.deliveryTimeEn}
                      </div>
                    </div>
                    <div className="font-black text-[#00A896]">
                      {z.rate} {currentStore.currency}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 13: DOMAINS (النطاقات — ربط نطاق مستقل) */}
          {activeTab === 'domains' && (
            <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
              <h2 className="text-lg font-black text-[#004457] dark:text-white">
                {isAr ? 'النطاقات وربط النطاق المستقل (Custom Domain)' : 'Store Domains & Custom DNS'}
              </h2>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500">{isAr ? 'النطاق الفرعي المجاني من قبس:' : 'Default QABS Subdomain:'}</div>
                  <div className="text-sm font-mono font-black text-[#004457] dark:text-teal-300 mt-0.5">
                    https://{currentStore.subdomain}
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  SSL Active
                </span>
              </div>

              <form
                onSubmit={e => {
                  e.preventDefault();
                  if (!domainInput.trim()) return;
                  requestDomainVerification(currentStore.id, domainInput);
                }}
                className="space-y-3"
              >
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isAr ? 'ربط نطاق خاص بمتجرك (مثال: www.mybrand.sa)' : 'Connect Custom Domain'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="shop.yourbrand.com"
                    value={domainInput}
                    onChange={e => setDomainInput(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 text-xs font-mono"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#004457] text-white text-xs font-black cursor-pointer"
                  >
                    {isAr ? 'طلب ربط وفحص DNS' : 'Verify Domain'}
                  </button>
                </div>
              </form>

              {currentStore.customDomain && (
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-mono font-bold text-sm">{currentStore.customDomain}</div>
                    <div className="text-slate-500">CNAME → stores.qabs1.store</div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full font-bold ${
                      currentStore.domainVerified
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {currentStore.domainVerified
                      ? isAr
                        ? 'تم التحقق وتفعيل SSL'
                        : 'Verified & Active'
                      : isAr
                      ? 'بانتظار تأكيد إدارة قبس'
                      : 'Pending DNS Verification'}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* SECTION 14: APPS (التطبيقات — تكاملات وإضافات) */}
          {activeTab === 'apps' && (
            <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
              <h2 className="text-lg font-black text-[#004457] dark:text-white">
                {isAr ? 'تطبيقات وتكاملات المتجر' : 'Store Apps & Integrations'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {storeApps.map(app => {
                  const installed = (app.installedStoreIds || app.installedStores || []).includes(currentStore.id);
                  return (
                    <div
                      key={app.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4"
                    >
                      <div>
                        <div className="text-sm font-black text-[#004457] dark:text-white">
                          {isAr ? app.nameAr : app.nameEn}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {isAr ? app.descriptionAr : app.descriptionEn}
                        </div>
                      </div>
                      <button
                        onClick={() => toggleStoreApp(app.id, currentStore.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-black cursor-pointer shrink-0 ${
                          installed
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-[#004457] text-white'
                        }`}
                      >
                        {installed ? (isAr ? 'مُفعّل ✓' : 'Installed ✓') : isAr ? 'تثبيت' : 'Install'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 15: ANALYTICS (التحليلات — المبيعات والأرباح والضرائب حسب البلد) */}
          {activeTab === 'analytics' && (
            <div className="bg-white dark:bg-[#071D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6">
              <h2 className="text-lg font-black text-[#004457] dark:text-white">
                {isAr ? 'تحليلات المبيعات والأرباح والضرائب' : 'Store Sales, Profit & Tax Analytics'}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-xs text-slate-500">{isAr ? 'إجمالي المبيعات' : 'Gross Revenue'}</div>
                  <div className="text-xl font-black text-[#004457] dark:text-white mt-1">
                    {totalSalesRevenue.toLocaleString()} {currentStore.currency}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-xs text-slate-500">{isAr ? 'تكلفة البضاعة المباعة' : 'Product Cost (COGS)'}</div>
                  <div className="text-xl font-black text-slate-700 dark:text-slate-300 mt-1">
                    {totalCostValue.toLocaleString()} {currentStore.currency}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-xs text-slate-500">
                    {isAr ? `الضريبة (${currentStore.taxRate ?? 15}% - ${currentStore.country})` : `Tax (${currentStore.taxRate ?? 15}%)`}
                  </div>
                  <div className="text-xl font-black text-amber-600 mt-1">
                    {estimatedTax.toLocaleString()} {currentStore.currency}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900">
                  <div className="text-xs text-emerald-800 dark:text-emerald-300 font-bold">
                    {isAr ? 'صافي الربح التقديري' : 'Estimated Net Profit'}
                  </div>
                  <div className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
                    {netProfit.toLocaleString()} {currentStore.currency}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 9 (MASTER): GENERAL SETTINGS, SECTION NAVIGATION CARDS, STAFF PERMISSIONS & JSON BACKUP (/settings) */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Navigation Cards Grid to all 8 independent section settings pages */}
              <div className="bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-black text-[#14243E] dark:text-white">
                      {isAr ? 'مركز إعدادات الأقسام المستقلة والصلاحيات' : 'Master Settings & Independent Section Configurations'}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isAr
                        ? 'اختر أي قسم للانتقال مباشرة إلى صفحة إعداداته المستقلة الكاملة، أو أدر صلاحيات الموظفين والنسخ الاحتياطي أدناه'
                        : 'Open any section’s dedicated full-page settings view or manage staff roles and full JSON backups below'}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-lg bg-[#F8F7F2] border border-[#EAE6DC] font-mono text-[11px] font-bold text-[#92743A] self-start">
                    /settings
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {([
                    {
                      tab: 'overview_settings' as ClientTab,
                      titleAr: 'إعدادات نظرة عامة',
                      titleEn: 'Overview Settings',
                      route: '/overview/settings',
                      summaryAr: `العملة: ${sectionSettings.overview.defaultCurrency} • KPI: ${sectionSettings.overview.showKpiCards ? 'مفعّل' : 'مخفي'}`,
                      icon: LayoutGrid
                    },
                    {
                      tab: 'orders_settings' as ClientTab,
                      titleAr: 'إعدادات الطلبات والشحن',
                      titleEn: 'Orders & Shipping Settings',
                      route: '/orders/settings',
                      summaryAr: `البادئة: ${sectionSettings.orders.orderPrefix} • ${sectionSettings.orders.defaultShippingRate} ${currentStore.currency}`,
                      icon: Truck
                    },
                    {
                      tab: 'documents_settings' as ClientTab,
                      titleAr: 'إعدادات المستندات والأرشفة',
                      titleEn: 'Documents Settings',
                      route: '/documents/settings',
                      summaryAr: `القالب: ${sectionSettings.documents.officialTemplateStyle} • ${sectionSettings.documents.allowedExportFormats.join(', ')}`,
                      icon: FileCheck
                    },
                    {
                      tab: 'stores_settings' as ClientTab,
                      titleAr: 'إعدادات متاجري',
                      titleEn: 'My Stores Settings',
                      route: '/stores/settings',
                      summaryAr: currentStore.name,
                      icon: Store
                    },
                    {
                      tab: 'billing_settings' as ClientTab,
                      titleAr: 'إعدادات الاشتراكات والفواتير',
                      titleEn: 'Billing & Tax Settings',
                      route: '/billing/settings',
                      summaryAr: `ضريبة ${currentStore.taxRate ?? 15}% • الرقم: ${sectionSettings.billing.taxNumber}`,
                      icon: Receipt
                    },
                    {
                      tab: 'qabs_ai_settings' as ClientTab,
                      titleAr: 'إعدادات قبس AI والأرصدة',
                      titleEn: 'QABS AI Settings',
                      route: '/qabs-ai/settings',
                      summaryAr: `سقف ${sectionSettings.qabsAi.monthlyCreditLimit} • تنبيه ${sectionSettings.qabsAi.lowCreditAlertThreshold}`,
                      icon: Sparkles
                    },
                    {
                      tab: 'crypto_settings' as ClientTab,
                      titleAr: 'إعدادات العملات الرقمية',
                      titleEn: 'Crypto Settings',
                      route: '/crypto/settings',
                      summaryAr: `الشبكات: ${sectionSettings.crypto.enabledNetworks.join(' / ')}`,
                      icon: Coins
                    },
                    {
                      tab: 'support_settings' as ClientTab,
                      titleAr: 'إعدادات الدعم والتواصل',
                      titleEn: 'Support Settings',
                      route: '/support/settings',
                      summaryAr: sectionSettings.support.officialEmail,
                      icon: Headphones
                    },
                    {
                      tab: 'company_formation_settings' as ClientTab,
                      titleAr: 'إعدادات تأسيس الشركات',
                      titleEn: 'Company Formation Settings',
                      route: '/company-formation/settings',
                      summaryAr: `الأساسي: $${sectionSettings.companyFormation.baseServiceFeeUsd} • EIN: $${sectionSettings.companyFormation.einFeeUsd}`,
                      icon: Building2
                    }
                  ]).map(card => {
                    const CardIcon = card.icon;
                    return (
                      <button
                        key={card.tab}
                        type="button"
                        onClick={() => navigateToTab(card.tab)}
                        className="p-4 rounded-2xl border border-[#EAE6DC] dark:border-slate-800 bg-[#FBFAF6] dark:bg-slate-900/70 hover:border-[#D5B46B] hover:bg-white dark:hover:bg-[#071D2B] text-right transition-all cursor-pointer flex flex-col justify-between gap-3 group shadow-2xs"
                      >
                        <div className="flex items-center justify-between gap-2 w-full">
                          <div className="w-9 h-9 rounded-xl bg-[#14243E] text-[#D5B46B] flex items-center justify-center shrink-0">
                            <CardIcon className="w-4 h-4" />
                          </div>
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-[#EAE6DC] dark:border-slate-700 text-[#92743A]">
                            {card.route}
                          </span>
                        </div>
                        <div>
                          <div className="text-xs font-black text-[#14243E] dark:text-white group-hover:text-[#92743A] transition-colors">
                            {isAr ? card.titleAr : card.titleEn}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1 truncate">{card.summaryAr}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Store Basics & Full JSON System Backup/Restore */}
              <div className="bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <FileJson className="w-5 h-5 text-[#92743A]" />
                    <div>
                      <h3 className="text-base font-black text-[#14243E] dark:text-white">
                        {isAr ? 'النسخ الاحتياطي الكامل للنظام واستعادة البيانات (JSON)' : 'Full Workspace JSON Backup & Restore'}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {isAr
                          ? 'تصدير أو استيراد جميع بيانات المتاجر، المنتجات، الطلبات، الموظفين، وإعدادات الأقسام الثمانية بصيغة JSON'
                          : 'Download or restore all stores, products, orders, staff, and all section settings as JSON'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const json = exportWorkspaceBackupJson();
                      triggerTextDownload(`qabs-workspace-backup-${new Date().toISOString().slice(0, 10)}.json`, json, 'application/json');
                      showToast(isAr ? 'تم تنزيل ملف النسخة الاحتياطية الكاملة (JSON) ✓' : 'Full JSON backup downloaded ✓');
                    }}
                    className="py-3 px-4 rounded-xl bg-[#14243E] hover:bg-[#1d3559] text-white text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Download className="w-4 h-4 text-[#D5B46B]" />
                    <span>{isAr ? 'تنزيل نسخة احتياطية كاملة (JSON)' : 'Download Full Backup (JSON)'}</span>
                  </button>

                  <label className="py-3 px-4 rounded-xl border border-[#D5B46B] bg-[#FBFAF6] hover:bg-[#F5F1E6] text-[#14243E] text-xs font-black flex items-center justify-center gap-2 cursor-pointer">
                    <Upload className="w-4 h-4 text-[#92743A]" />
                    <span>{isAr ? 'استعادة نسخة من ملف JSON' : 'Restore from JSON File'}</span>
                    <input
                      type="file"
                      accept=".json,application/json"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                          if (typeof reader.result === 'string') importWorkspaceBackupJson(reader.result);
                        };
                        reader.readAsText(file);
                        e.target.value = '';
                      }}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => triggerSystemBackup(currentStore.name)}
                    className="py-3 px-4 rounded-xl border border-[#EAE6DC] bg-white dark:bg-slate-900 hover:border-[#D5B46B] text-[#14243E] dark:text-white text-xs font-black flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Database className="w-4 h-4 text-[#92743A]" />
                    <span>{isAr ? 'حفظ نقطة استعادة في السجل' : 'Save Audit Snapshot'}</span>
                  </button>
                </div>
              </div>

              {/* Separate Sole Owner (Anwar Al-Ghazali) & Client Role Permissions */}
              <div className="bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#92743A]" />
                    <h3 className="text-base font-black text-[#14243E] dark:text-white">
                      {isAr ? 'صلاحيات المالك الوحيد والوصول للنظام' : 'Sole Owner Authority & Access Control'}
                    </h3>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#14243E] text-[#D5B46B] text-[11px] font-black self-start">
                    {isAr ? 'المالك الوحيد: أنور الغزالي' : 'Sole Owner: Anwar Al-Ghazali'}
                  </span>
                </div>

                {!isOwner ? (
                  <div className="p-4 rounded-2xl bg-[#FBFAF6] dark:bg-slate-900/70 border border-[#D5B46B]/50 text-xs space-y-1.5">
                    <div className="font-black text-[#14243E] dark:text-[#D5B46B]">
                      {isAr ? `أهلاً بك ${user.name} — وضع حساب العميل` : `Welcome ${user.name} — Client Account`}
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {isAr
                        ? 'حسابك مخصص لمتابعة طلباتك، شركاتك الدولية، متاجرك، مستنداتك، وفواتيرك. إعدادات الإدارة المركزية وبوابات الدفع والصلاحيات خاصة بالمالك الوحيد للمنصة: أنور الغزالي (Super Admin).'
                        : 'Your client workspace focuses on tracking your orders, companies, stores, documents, and invoices. Platform-wide admin controls are restricted to Sole Owner Anwar Al-Ghazali.'}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="p-4 rounded-2xl bg-[#14243E] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="font-black text-[#D5B46B]">
                          {isAr ? 'أنور الغزالي — المالك والمدير العام الوحيد (Super Admin)' : 'Anwar Al-Ghazali — Sole Owner & Super Admin'}
                        </div>
                        <div className="text-[11px] text-[#EAE6DC] mt-0.5">
                          {isAr
                            ? 'صلاحية كاملة وغير مقيدة على جميع المتاجر، تأسيس الشركات، الموافقات، وإعدادات بوابات الدفع — بدون أي موظفين وهميين.'
                            : 'Unrestricted sole owner authority across all stores, formations, approvals, and gateways — zero mock staff.'}
                        </div>
                      </div>
                      <span className="font-mono text-[11px] px-2.5 py-1 rounded bg-white/10 text-[#F3E5AB] self-start">
                        {staff.length} {isAr ? 'موظف مضاف' : 'Added Staff'}
                      </span>
                    </div>

                    <form
                      onSubmit={e => {
                        e.preventDefault();
                        if (!staffName.trim()) return;
                        addStaff({
                          name: staffName.trim(),
                          email: staffEmail.trim() || 'staff@qabs1.store',
                          role: 'support_agent',
                          departmentAr: `فريق تشغيل متجر (${currentStore.name})`,
                          departmentEn: `Store Operations (${currentStore.name})`,
                          permissions: newStaffPerms.length > 0 ? newStaffPerms : ['inventory_update_only']
                        });
                        setStaffName('');
                        setStaffEmail('');
                      }}
                      className="p-4 rounded-2xl bg-[#FBFAF6] dark:bg-slate-900/70 border border-[#EAE6DC] dark:border-slate-800 space-y-3"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                          type="text"
                          required
                          placeholder={isAr ? 'اسم الموظف الجديد *' : 'New Staff Name *'}
                          value={staffName}
                          onChange={e => setStaffName(e.target.value)}
                          className="rounded-xl border border-[#EAE6DC] dark:border-slate-700 bg-white dark:bg-[#071D2B] px-3 py-2 text-xs"
                        />
                        <input
                          type="email"
                          placeholder={isAr ? 'البريد الإلكتروني' : 'Staff Email'}
                          value={staffEmail}
                          onChange={e => setStaffEmail(e.target.value)}
                          className="rounded-xl border border-[#EAE6DC] dark:border-slate-700 bg-white dark:bg-[#071D2B] px-3 py-2 text-xs"
                        />
                        <button
                          type="submit"
                          className="rounded-xl bg-[#14243E] hover:bg-[#1d3559] text-white text-xs font-black py-2 px-4 cursor-pointer"
                        >
                          {isAr ? '+ إضافة موظف حقيقي' : '+ Add Staff Member'}
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-[11px]">
                        <span className="font-bold text-slate-500">{isAr ? 'الصلاحيات المبدئية:' : 'Initial Permissions:'}</span>
                        {([
                          'all_stores_control',
                          'payment_gateway_verify',
                          'inventory_update_only',
                          'orders_fulfillment',
                          'billing_manage',
                          'ai_commands_exec'
                        ]).map(perm => {
                          const selected = newStaffPerms.includes(perm);
                          return (
                            <button
                              key={perm}
                              type="button"
                              onClick={() =>
                                setNewStaffPerms(prev =>
                                  prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
                                )
                              }
                              className={`px-2.5 py-1 rounded-lg font-mono font-bold cursor-pointer border transition-colors ${
                                selected
                                  ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                                  : 'bg-white border-[#EAE6DC] text-slate-500'
                              }`}
                            >
                              {selected ? '✓ ' : '+ '}
                              {perm}
                            </button>
                          );
                        })}
                      </div>
                    </form>

                    {staff.length === 0 ? (
                      <div className="p-6 rounded-2xl border border-dashed border-[#D5B46B]/60 bg-[#FBFAF6] dark:bg-slate-900/40 text-center text-xs text-slate-500 font-bold">
                        {isAr
                          ? 'لا يوجد أي موظفين مسجلين حالياً — النظام يعمل بحساب المالك الوحيد (أنور الغزالي).'
                          : 'No staff members added — operating exclusively under Sole Owner Anwar Al-Ghazali.'}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {staff.map(member => {
                          const allPerms = [
                            'all_stores_control',
                            'payment_gateway_verify',
                            'inventory_update_only',
                            'orders_fulfillment',
                            'billing_manage',
                            'ai_commands_exec'
                          ];
                          const customPerms = member.permissions.filter(p => !allPerms.includes(p));
                          const displayPerms = [...allPerms, ...customPerms];
                          return (
                            <div
                              key={member.id}
                              className="p-4 rounded-2xl bg-[#F8F7F2] dark:bg-slate-900 border border-[#EAE6DC] dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-black text-[#14243E] dark:text-white">{member.name}</span>
                                  <span className="text-[10px] font-mono text-slate-500">{member.email}</span>
                                </div>
                                <div className="text-[11px] text-slate-500 mt-0.5">
                                  {isAr ? member.departmentAr || member.department : member.departmentEn || member.department}
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-1.5">
                                {displayPerms.map(perm => {
                                  const active = member.permissions.includes(perm);
                                  return (
                                    <button
                                      key={perm}
                                      type="button"
                                      onClick={() => {
                                        const nextPerms = active
                                          ? member.permissions.filter(p => p !== perm)
                                          : [...member.permissions, perm];
                                        updateStaffPermissions(member.id, nextPerms);
                                      }}
                                      title={isAr ? 'اضغط لتفعيل أو إلغاء الصلاحية' : 'Click to toggle permission'}
                                      className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-black cursor-pointer border transition-colors ${
                                        active
                                          ? 'bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300'
                                          : 'bg-white dark:bg-[#071D2B] border-[#EAE6DC] dark:border-slate-700 text-slate-400 hover:text-[#14243E]'
                                      }`}
                                    >
                                      {active ? '✓ ' : ''}
                                      {perm}
                                    </button>
                                  );
                                })}
                                <button
                                  type="button"
                                  onClick={() => removeStaff(member.id)}
                                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer ms-1"
                                  title={isAr ? 'إزالة العضو' : 'Remove member'}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* REQUESTS VIEW (/requests) */}
          {activeTab === 'requests' && (
            <div className="space-y-5">
              <div className="bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-[#14243E] dark:text-white">
                    {isAr ? 'طلبات خدمات قبس وطلبات المتجر' : 'QABS Service & Store Requests'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {isAr
                      ? 'يمكنك إدارة جميع طلبات المتجر، الفواتير، والشحن من صفحة الطلبات المستقلة'
                      : 'Manage all store orders, fulfillment and invoices from the dedicated Orders page'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => navigateToTab('orders')}
                    className="px-4 py-2.5 rounded-xl bg-[#14243E] text-white text-xs font-black cursor-pointer"
                  >
                    {isAr ? 'فتح صفحة الطلبات الكاملة ←' : 'Open Orders Page →'}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateToTab('orders_settings')}
                    className="px-3.5 py-2.5 rounded-xl border border-[#D5B46B] bg-[#FBFAF6] text-[#14243E] text-xs font-black cursor-pointer"
                  >
                    {isAr ? '⚙️ إعدادات الطلبات' : '⚙️ Orders Settings'}
                  </button>
                </div>
              </div>
              {renderOrdersWorkspace()}
            </div>
          )}

          {/* SECTION 3: DOCUMENTS (/documents) */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-black text-[#14243E] dark:text-white">
                      {isAr ? 'خزينة المستندات الرسمية والأرشفة' : 'Official Documents Vault & Archive'}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isAr
                        ? `القالب المعتمد: ${sectionSettings.documents.officialTemplateStyle} • صيغ التصدير المفعلة: ${sectionSettings.documents.allowedExportFormats.join(', ')} • الأرشفة التلقائية للفواتير: ${sectionSettings.documents.autoArchiveIssuedInvoices ? 'مفعّلة' : 'متوقفة'}`
                        : `Template: ${sectionSettings.documents.officialTemplateStyle} • Formats: ${sectionSettings.documents.allowedExportFormats.join(', ')}`}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 self-start">
                    <button
                      type="button"
                      onClick={() => navigateToTab('documents_settings')}
                      className="px-4 py-2.5 rounded-xl border border-[#D5B46B] bg-[#FBFAF6] hover:bg-[#F5F1E6] text-[#14243E] text-xs font-black cursor-pointer"
                    >
                      {isAr ? '⚙️ إعدادات المستندات' : '⚙️ Documents Settings'}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigateToTab('company_formation')}
                      className="px-4 py-2.5 rounded-xl bg-[#14243E] text-white text-xs font-black cursor-pointer"
                    >
                      {isAr ? 'ملفات التأسيس الكاملة' : 'Corporate Entities'}
                    </button>
                  </div>
                </div>

                {/* Branding Stamp Status Preview */}
                <div className="p-4 rounded-2xl bg-[#FBFAF6] dark:bg-slate-900 border border-[#EAE6DC] dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {sectionSettings.documents.logoDataUrl ? (
                      <img src={sectionSettings.documents.logoDataUrl} alt="Logo" className="w-10 h-10 rounded-xl object-contain bg-white border border-[#EAE6DC] p-1" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-[#14243E] text-[#D5B46B] flex items-center justify-center">
                        <FileCheck className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <div className="text-xs font-black text-[#14243E] dark:text-white">
                        {sectionSettings.documents.companyStampText}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {isAr ? 'الختم والشعار الرسمي المطبق على كافة الفواتير والشهادات الصادرة' : 'Official seal & branding applied to invoices and certificates'}
                      </div>
                    </div>
                  </div>
                  {sectionSettings.documents.stampDataUrl && (
                    <img src={sectionSettings.documents.stampDataUrl} alt="Official Stamp" className="h-10 w-auto rounded-lg object-contain border border-[#D5B46B]/50 bg-white p-1" />
                  )}
                </div>

                {/* Add New Document Form */}
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    if (!newDocName.trim() || !companies.length) return;
                    addCompanyDocument(newDocCompanyId || companies[0].id, newDocName.trim(), newDocType);
                    setNewDocName('');
                  }}
                  className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-[#EAE6DC] dark:border-slate-800"
                >
                  <input
                    type="text"
                    required
                    value={newDocName}
                    onChange={e => setNewDocName(e.target.value)}
                    placeholder={isAr ? 'اسم المستند (مثال: قرار مجلس الإدارة 2026)' : 'Document Title'}
                    className="rounded-xl border border-[#EAE6DC] dark:border-slate-700 bg-[#F8F7F2] dark:bg-slate-900 px-3 py-2 text-xs"
                  />
                  <select
                    value={newDocCompanyId || companies[0]?.id || ''}
                    onChange={e => setNewDocCompanyId(e.target.value)}
                    className="rounded-xl border border-[#EAE6DC] dark:border-slate-700 bg-[#F8F7F2] dark:bg-slate-900 px-3 py-2 text-xs font-bold"
                  >
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.companyName}</option>
                    ))}
                  </select>
                  <select
                    value={newDocType}
                    onChange={e => setNewDocType(e.target.value as CompanyFormation['documents'][number]['type'])}
                    className="rounded-xl border border-[#EAE6DC] dark:border-slate-700 bg-[#F8F7F2] dark:bg-slate-900 px-3 py-2 text-xs font-bold"
                  >
                    <option value="resolution">{isAr ? 'قرار إداري / عقد تأسيس' : 'Resolution'}</option>
                    <option value="certificate">{isAr ? 'شهادة تسجيل رسمية' : 'Certificate'}</option>
                    <option value="ein_letter">{isAr ? 'خطاب ضريبي EIN' : 'EIN Letter'}</option>
                    <option value="operating_agreement">{isAr ? 'اتفاقية تشغيل' : 'Operating Agreement'}</option>
                  </select>
                  <button
                    type="submit"
                    className="rounded-xl bg-[#14243E] hover:bg-[#1d3559] text-white text-xs font-black py-2 px-4 cursor-pointer"
                  >
                    {isAr ? '+ أرشفة مستند رسمي' : '+ Archive Document'}
                  </button>
                </form>

                {/* Corporate Documents List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {companies.flatMap(comp =>
                    comp.documents.map((doc, idx) => ({
                      ...doc,
                      comp,
                      key: `${comp.id}_${idx}`
                    }))
                  ).map(item => (
                    <div
                      key={item.key}
                      className="p-4 rounded-2xl border border-[#EAE6DC] dark:border-slate-800 bg-white dark:bg-[#061824] flex flex-col justify-between gap-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-sm font-black text-[#14243E] dark:text-white">{item.name}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {item.comp.companyName} • <span className="font-mono">{item.date}</span>
                          </div>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black shrink-0">
                          {item.status === 'ready' ? (isAr ? 'معتمد' : 'Certified') : isAr ? 'قيد الإعداد' : 'Pending'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#EAE6DC]/60 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() =>
                            setViewingDoc({
                              docName: item.name,
                              companyName: item.comp.companyName,
                              type: item.type,
                              date: item.date,
                              jurisdiction: item.comp.jurisdiction,
                              ein: item.comp.ein,
                              fileNumber: item.comp.stateFileNumber || item.comp.crn
                            })
                          }
                          className="px-3 py-1.5 rounded-lg bg-[#F8F7F2] border border-[#EAE6DC] hover:border-[#D5B46B] text-[#14243E] text-[11px] font-bold cursor-pointer flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#92743A]" />
                          <span>{isAr ? 'معاينة' : 'Preview'}</span>
                        </button>

                        <div className="flex flex-wrap items-center gap-1.5">
                          {sectionSettings.documents.allowedExportFormats.map(fmt => (
                            <button
                              key={fmt}
                              type="button"
                              onClick={() => {
                                if (fmt === 'PDF') {
                                  setViewingDoc({
                                    docName: item.name,
                                    companyName: item.comp.companyName,
                                    type: item.type,
                                    date: item.date,
                                    jurisdiction: item.comp.jurisdiction,
                                    ein: item.comp.ein,
                                    fileNumber: item.comp.stateFileNumber || item.comp.crn
                                  });
                                } else if (fmt === 'JSON') {
                                  triggerTextDownload(
                                    `${item.comp.companyName.replace(/\s+/g, '_')}-${item.type}.json`,
                                    JSON.stringify({ document: item.name, company: item.comp.companyName, date: item.date, ein: item.comp.ein, fileNumber: item.comp.stateFileNumber || item.comp.crn, stamp: sectionSettings.documents.companyStampText }, null, 2),
                                    'application/json'
                                  );
                                } else if (fmt === 'CSV') {
                                  triggerTextDownload(
                                    `${item.type}-${item.date}.csv`,
                                    `Document,Company,Date,EIN,Stamp\n"${item.name}","${item.comp.companyName}","${item.date}","${item.comp.ein || ''}","${sectionSettings.documents.companyStampText}"`,
                                    'text/csv'
                                  );
                                } else {
                                  triggerTextDownload(
                                    `${item.type}-${item.date}.doc`,
                                    `${item.name}\nCompany: ${item.comp.companyName}\nDate: ${item.date}\n${sectionSettings.documents.companyStampText}`,
                                    'application/msword'
                                  );
                                }
                              }}
                              className="px-2 py-1 rounded-lg bg-[#14243E] text-white text-[10px] font-mono font-bold cursor-pointer hover:bg-[#1d3559]"
                            >
                              {fmt}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Auto-Archived Invoices */}
                {sectionSettings.documents.autoArchiveIssuedInvoices && (
                  <div className="pt-4 border-t border-[#EAE6DC] dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black text-[#14243E] dark:text-white">
                        {isAr ? 'أرشيف الفواتير الصادرة تلقائياً' : 'Auto-Archived Issued Invoices'}
                      </h3>
                      <span className="text-[11px] font-bold text-[#92743A]">
                        {invoices.length} {isAr ? 'فاتورة مؤرشفة' : 'Archived Invoices'}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {invoices.map(inv => (
                        <div key={inv.id} className="p-3.5 rounded-xl border border-[#EAE6DC] dark:border-slate-800 bg-[#FBFAF6] dark:bg-slate-900 flex items-center justify-between gap-2 text-xs">
                          <div>
                            <div className="font-mono font-black text-[#14243E] dark:text-[#D5B46B]">{inv.invoiceNumber}</div>
                            <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">{inv.clientName}</div>
                            <div className="text-[10px] text-slate-400">{inv.date} • {inv.amount.toLocaleString()} {inv.currency}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setViewingInvoice(inv)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#14243E] text-white text-[11px] font-bold cursor-pointer shrink-0"
                          >
                            {isAr ? 'عرض' : 'View'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION 5: SUBSCRIPTIONS & BILLING (/billing) */}
          {activeTab === 'subscriptions' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-black text-[#14243E] dark:text-white">
                      {isAr ? 'الاشتراكات والفواتير وبوابات الدفع' : 'Subscriptions, Tax Invoices & Payment Gateways'}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isAr
                        ? `الرقم الضريبي: ${sectionSettings.billing.taxNumber} • نسبة الضريبة المطبقة: ${currentStore.taxRate ?? 15}%`
                        : `Tax ID: ${sectionSettings.billing.taxNumber} • Tax Rate: ${currentStore.taxRate ?? 15}%`}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 self-start">
                    <button
                      type="button"
                      onClick={() => navigateToTab('billing_settings')}
                      className="px-4 py-2.5 rounded-xl border border-[#D5B46B] bg-[#FBFAF6] hover:bg-[#F5F1E6] text-[#14243E] text-xs font-black cursor-pointer"
                    >
                      {isAr ? '⚙️ إعدادات الاشتراكات والفواتير' : '⚙️ Billing Settings'}
                    </button>
                  </div>
                </div>

                {/* Live Gateway & Tax Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-4 rounded-xl bg-[#FBFAF6] dark:bg-slate-900 border border-[#EAE6DC] dark:border-slate-800">
                    <div className="text-[11px] text-slate-500 font-bold">{isAr ? 'الباقة النشطة' : 'Active Plan'}</div>
                    <div className="text-base font-black text-[#14243E] dark:text-white mt-1 uppercase">{subscription.planId}</div>
                    <div className="text-[11px] text-[#92743A] font-bold mt-1">{subscription.currentPrice} SAR / {subscription.billingCycle}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-[#FBFAF6] dark:bg-slate-900 border border-[#EAE6DC] dark:border-slate-800">
                    <div className="text-[11px] text-slate-500 font-bold">{isAr ? 'الضريبة والفوترة' : 'Tax & VAT'}</div>
                    <div className="text-base font-black text-[#14243E] dark:text-white mt-1">{currentStore.taxRate ?? 15}%</div>
                    <div className="text-[10px] font-mono text-slate-500 mt-1">{sectionSettings.billing.taxNumber}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-[#FBFAF6] dark:bg-slate-900 border border-[#EAE6DC] dark:border-slate-800">
                    <div className="text-[11px] text-slate-500 font-bold">{isAr ? 'بوابات الدفع المفعلة' : 'Enabled Gateways'}</div>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {sectionSettings.billing.enableMoyasarTap && <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black">Moyasar/Tap</span>}
                      {sectionSettings.billing.enableStripe && <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black">Stripe</span>}
                      {sectionSettings.billing.enablePayPal && <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black">PayPal</span>}
                      {sectionSettings.billing.enableBankTransfer && <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black">{isAr ? 'تحويل بنكي' : 'Bank'}</span>}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-[#FBFAF6] dark:bg-slate-900 border border-[#EAE6DC] dark:border-slate-800">
                    <div className="text-[11px] text-slate-500 font-bold">{isAr ? 'رصيد قبس AI' : 'AI Credits Balance'}</div>
                    <div className="text-base font-black text-[#14243E] dark:text-white mt-1">{user.credits} {isAr ? 'رصيد' : 'credits'}</div>
                    <button
                      type="button"
                      onClick={() => topUpCredits(50)}
                      className="text-[11px] font-black text-[#92743A] hover:underline mt-1 cursor-pointer"
                    >
                      {isAr ? '+ شحن 50 رصيد فوري' : '+ Top up 50 credits'}
                    </button>
                  </div>
                </div>

                {/* Plans Switcher */}
                <div className="flex items-center justify-between pt-2">
                  <h3 className="text-sm font-black text-[#14243E] dark:text-white">
                    {isAr ? 'ترقية أو تعديل باقة الاشتراك' : 'Subscription Plans'}
                  </h3>
                  <div className="inline-flex rounded-xl bg-[#F8F7F2] p-1 border border-[#EAE6DC] text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setBillingCycle('monthly')}
                      className={`px-3 py-1 rounded-lg cursor-pointer ${billingCycle === 'monthly' ? 'bg-[#14243E] text-white' : 'text-slate-600'}`}
                    >
                      {isAr ? 'شهري' : 'Monthly'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setBillingCycle('annual')}
                      className={`px-3 py-1 rounded-lg cursor-pointer ${billingCycle === 'annual' ? 'bg-[#14243E] text-white' : 'text-slate-600'}`}
                    >
                      {isAr ? 'سنوي' : 'Annual'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {SUBSCRIPTION_PLANS.map(plan => {
                    const isCurrent = subscription.planId === plan.id;
                    const price = billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly;
                    return (
                      <div
                        key={plan.id}
                        className={`p-5 rounded-2xl border-2 flex flex-col justify-between space-y-4 ${
                          isCurrent ? 'border-[#D5B46B] bg-[#FBFAF6] dark:bg-slate-900' : 'border-[#EAE6DC] dark:border-slate-800'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-base font-black text-[#14243E] dark:text-white">{isAr ? plan.nameAr : plan.nameEn}</span>
                            {isCurrent && <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">{isAr ? 'الحالية' : 'Current'}</span>}
                          </div>
                          <div className="text-2xl font-black text-[#92743A] mt-2">
                            {price} <span className="text-xs text-slate-500">SAR / {billingCycle === 'annual' ? (isAr ? 'سنة' : 'yr') : (isAr ? 'شهر' : 'mo')}</span>
                          </div>
                          <ul className="mt-3 space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                            {(isAr ? plan.featuresAr : plan.featuresEn).slice(0, 4).map((f, idx) => (
                              <li key={idx} className="flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>{f}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <button
                          type="button"
                          onClick={() => changeSubscriptionPlan(plan.id as 'starter' | 'growth' | 'enterprise', billingCycle)}
                          className={`w-full py-2.5 rounded-xl text-xs font-black cursor-pointer ${
                            isCurrent ? 'bg-[#F5F1E6] text-[#92743A]' : 'bg-[#14243E] hover:bg-[#1d3559] text-white'
                          }`}
                        >
                          {isCurrent ? (isAr ? 'مفعّلة حالياً ✓' : 'Active Plan ✓') : isAr ? 'تفعيل هذه الباقة' : 'Switch to Plan'}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Invoices Table */}
                <div className="overflow-x-auto rounded-2xl border border-[#EAE6DC] dark:border-slate-800">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-[#F8F7F2] dark:bg-slate-900 font-black text-[#14243E] dark:text-slate-200 border-b border-[#EAE6DC]">
                      <tr>
                        <th className="p-3.5">{isAr ? 'رقم الفاتورة' : 'Invoice #'}</th>
                        <th className="p-3.5">{isAr ? 'التاريخ' : 'Date'}</th>
                        <th className="p-3.5">{isAr ? 'البيان' : 'Description'}</th>
                        <th className="p-3.5">{isAr ? 'المبلغ' : 'Amount'}</th>
                        <th className="p-3.5">{isAr ? 'الحالة' : 'Status'}</th>
                        <th className="p-3.5">{isAr ? 'معاينة' : 'View'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAE6DC]/60 dark:divide-slate-800">
                      {invoices.map(invoice => (
                        <tr key={invoice.id} className="hover:bg-[#FBFAF6] dark:hover:bg-slate-900/40">
                          <td className="p-3.5 font-mono font-bold text-[#14243E] dark:text-[#D5B46B]">{invoice.invoiceNumber}</td>
                          <td className="p-3.5 font-mono text-slate-500">{invoice.date}</td>
                          <td className="p-3.5">{isAr ? invoice.descriptionAr : invoice.descriptionEn}</td>
                          <td className="p-3.5 font-black">{invoice.amount.toLocaleString()} {invoice.currency}</td>
                          <td className="p-3.5">
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                              {invoice.status}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <button
                              type="button"
                              onClick={() => setViewingInvoice(invoice)}
                              className="px-3 py-1 rounded-lg bg-[#14243E] text-white text-[11px] font-bold cursor-pointer"
                            >
                              {isAr ? 'عرض / طباعة' : 'Preview'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 6: QABS AI & CREDITS (/qabs-ai) */}
          {activeTab === 'qabs_ai' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#14243E] text-[#D5B46B] flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-[#14243E] dark:text-white">
                        {isAr ? 'محرك قبس AI والأرصدة التفاعلي' : 'QABS AI Store Command Engine & Credits'}
                      </h2>
                      <p className="text-xs text-slate-500">
                        {isAr
                          ? `الرصيد المتاح: ${user.credits} / ${sectionSettings.qabsAi.monthlyCreditLimit} • التنفيذ التلقائي: ${sectionSettings.qabsAi.autoExecuteEnabled ? 'مفعّل' : 'متوقف'}`
                          : `Credits: ${user.credits} / ${sectionSettings.qabsAi.monthlyCreditLimit}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 self-start">
                    <button
                      type="button"
                      onClick={() => navigateToTab('qabs_ai_settings')}
                      className="px-4 py-2.5 rounded-xl border border-[#D5B46B] bg-[#FBFAF6] hover:bg-[#F5F1E6] text-[#14243E] text-xs font-black cursor-pointer"
                    >
                      {isAr ? '⚙️ إعدادات قبس AI والأرصدة' : '⚙️ QABS AI Settings'}
                    </button>
                    <button
                      type="button"
                      onClick={() => topUpCredits(50)}
                      className="px-4 py-2.5 rounded-xl bg-[#14243E] text-white text-xs font-black cursor-pointer"
                    >
                      {isAr ? '+ شحن 50 رصيد' : '+ Add 50 Credits'}
                    </button>
                  </div>
                </div>

                {/* Credit Meter & Low Credit Warning */}
                <div className="p-4 rounded-2xl bg-[#FBFAF6] dark:bg-slate-900 border border-[#EAE6DC] dark:border-slate-800 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-black text-[#14243E] dark:text-white">
                      {isAr ? `استهلاك الرصيد الشهري (${user.credits} من ${sectionSettings.qabsAi.monthlyCreditLimit})` : `Monthly Credits (${user.credits} / ${sectionSettings.qabsAi.monthlyCreditLimit})`}
                    </span>
                    <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
                      <span className={`px-2 py-0.5 rounded-full ${sectionSettings.qabsAi.allowPriceModification ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                        {isAr ? 'تعديل الأسعار:' : 'Price Edits:'} {sectionSettings.qabsAi.allowPriceModification ? '✓' : '✕'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full ${sectionSettings.qabsAi.allowOrderFulfillment ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                        {isAr ? 'تجهيز الطلبات:' : 'Fulfillment:'} {sectionSettings.qabsAi.allowOrderFulfillment ? '✓' : '✕'}
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-[#EAE6DC] dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#14243E] to-[#D5B46B] transition-all"
                      style={{ width: `${Math.min(100, Math.round((user.credits / Math.max(1, sectionSettings.qabsAi.monthlyCreditLimit)) * 100))}%` }}
                    />
                  </div>
                  {user.credits <= sectionSettings.qabsAi.lowCreditAlertThreshold && (
                    <div className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 flex items-center gap-2">
                      <Bell className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        {isAr
                          ? `تنبيه انخفاض الرصيد: رصيدك (${user.credits}) وصل للحد التنبيهي (${sectionSettings.qabsAi.lowCreditAlertThreshold}).`
                          : `Low credit alert: balance (${user.credits}) is at or below threshold (${sectionSettings.qabsAi.lowCreditAlertThreshold}).`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Quick Commands */}
                <div className="flex flex-wrap gap-2">
                  {[
                    isAr ? 'تلخيص المبيعات والمخزون الحالي' : 'Summarize store sales and inventory',
                    isAr ? 'رفع أسعار المنتجات بنسبة 10%' : 'Increase product prices by 10%',
                    isAr ? 'تجهيز الطلبات المعلقة الآن' : 'Process and ship pending orders',
                    isAr ? 'إنشاء كود خصم VIP25 بنسبة 25%' : 'Create coupon VIP25 for 25%'
                  ].map(cmd => (
                    <button
                      key={cmd}
                      type="button"
                      onClick={() => setAiPromptInput(cmd)}
                      className="px-3 py-1.5 rounded-xl bg-[#F8F7F2] dark:bg-slate-900 border border-[#EAE6DC] dark:border-slate-700 hover:border-[#D5B46B] text-xs font-bold text-[#14243E] dark:text-slate-200 cursor-pointer"
                    >
                      {cmd}
                    </button>
                  ))}
                </div>

                {/* Command Prompt Box */}
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    const p = aiPromptInput.trim();
                    if (!p) return;
                    if (!sectionSettings.qabsAi.autoExecuteEnabled) {
                      showToast(isAr ? 'التنفيذ التلقائي متوقف في إعدادات قبس AI — فعّله للمتابعة' : 'Auto-execution is disabled in QABS AI Settings');
                      return;
                    }
                    const isPriceCmd = /سعر|اسعار|أسعار|price|discount|خصم/i.test(p);
                    const isOrderCmd = /طلب|تجهيز|شحن|order|ship|fulfill/i.test(p);
                    if (isPriceCmd && !sectionSettings.qabsAi.allowPriceModification) {
                      showToast(isAr ? 'صلاحية تعديل الأسعار بالذكاء الاصطناعي معطّلة من الإعدادات' : 'AI price modification is disabled in Settings');
                      return;
                    }
                    if (isOrderCmd && !sectionSettings.qabsAi.allowOrderFulfillment) {
                      showToast(isAr ? 'صلاحية تجهيز الطلبات بالذكاء الاصطناعي معطّلة من الإعدادات' : 'AI order fulfillment is disabled in Settings');
                      return;
                    }
                    executeAICommand(p, currentStore.id);
                    setAiPromptInput('');
                  }}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <input
                    type="text"
                    value={aiPromptInput}
                    onChange={e => setAiPromptInput(e.target.value)}
                    placeholder={isAr ? 'اكتب أمراً لقبس AI (مثال: تجهيز الطلبات المعلقة أو رفع الأسعار 10%)...' : 'Enter a store command for QABS AI...'}
                    className="flex-1 rounded-xl border border-[#EAE6DC] dark:border-slate-700 bg-[#F8F7F2] dark:bg-slate-900 px-4 py-3 text-xs font-bold"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-[#14243E] hover:bg-[#1d3559] text-white text-xs font-black cursor-pointer flex items-center justify-center gap-2 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5 text-[#D5B46B]" />
                    <span>{isAr ? 'تنفيذ الأمر (1 رصيد)' : 'Execute Command'}</span>
                  </button>
                </form>

                {/* Command History */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">
                    {isAr ? 'سجل الأوامر المنفذة' : 'Executed AI Commands History'}
                  </h3>
                  {aiHistory.length === 0 ? (
                    <div className="p-8 rounded-2xl border border-dashed border-[#EAE6DC] text-center text-xs text-slate-400">
                      {isAr ? 'لم يتم تنفيذ أي أمر نصي بعد — اختر أمراً سريعاً أو اكتب طلبك أعلاه' : 'No AI commands executed yet'}
                    </div>
                  ) : (
                    aiHistory.map(item => (
                      <div key={item.id} className="p-4 rounded-2xl border border-[#EAE6DC] dark:border-slate-800 bg-[#FBFAF6] dark:bg-slate-900 space-y-2 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-black text-[#14243E] dark:text-[#D5B46B]">&gt; {item.prompt}</span>
                          <span className="text-[10px] font-mono text-slate-400">{item.timestamp}</span>
                        </div>
                        <div className="whitespace-pre-line text-slate-700 dark:text-slate-200 leading-relaxed">
                          {isAr ? item.responseAr : item.responseEn}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 7: DIGITAL CURRENCIES (/crypto) */}
          {activeTab === 'digital_currencies' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-black text-[#14243E] dark:text-white">
                      {isAr ? 'محافظ العملات الرقمية وتسوية المدفوعات' : 'Digital Currencies & Crypto Checkout'}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isAr
                        ? `الحد الأدنى للتحويل: ${sectionSettings.crypto.minTransferUsd} USD • الشبكات المفعلة: ${sectionSettings.crypto.enabledNetworks.join(' • ')}`
                        : `Min transfer: $${sectionSettings.crypto.minTransferUsd} • Networks: ${sectionSettings.crypto.enabledNetworks.join(' • ')}`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigateToTab('crypto_settings')}
                    className="px-4 py-2.5 rounded-xl border border-[#D5B46B] bg-[#FBFAF6] hover:bg-[#F5F1E6] text-[#14243E] text-xs font-black cursor-pointer self-start"
                  >
                    {isAr ? '⚙️ إعدادات العملات الرقمية' : '⚙️ Crypto Settings'}
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-[#FBFAF6] dark:bg-slate-900 border border-[#EAE6DC] dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-black text-[#14243E] dark:text-white">
                      {isAr ? `الدفع بالعملات الرقمية لمتجر (${currentStore.name}):` : `Store Crypto Checkout (${currentStore.name}):`}
                    </span>{' '}
                    <span className={currentStore.cryptoSettlementEnabled ? 'text-emerald-600 font-black' : 'text-amber-600 font-black'}>
                      {currentStore.cryptoSettlementEnabled ? (isAr ? 'مفعّل ✓' : 'Enabled ✓') : isAr ? 'غير مفعّل' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {sectionSettings.crypto.enabledNetworks.map(net => (
                      <span key={net} className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-black">
                        {net} ACTIVE
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: 'USDT (TRC20)', addr: sectionSettings.crypto.usdtTrc20Address, net: 'TRC20' as const },
                    { label: 'USDT (ERC20)', addr: sectionSettings.crypto.usdtErc20Address, net: 'ERC20' as const },
                    { label: 'Bitcoin (BTC)', addr: sectionSettings.crypto.btcAddress, net: 'BTC' as const }
                  ].map(w => {
                    const enabled = sectionSettings.crypto.enabledNetworks.includes(w.net);
                    return (
                      <div key={w.label} className={`p-5 rounded-2xl border space-y-3 ${enabled ? 'border-[#D5B46B] bg-white dark:bg-[#061824]' : 'border-[#EAE6DC] bg-slate-50 opacity-60'}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-black text-[#14243E] dark:text-white">{w.label}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                            {enabled ? (isAr ? 'مفعّلة' : 'Enabled') : isAr ? 'معطلة' : 'Disabled'}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[#F8F7F2] dark:bg-slate-900 font-mono text-[11px] break-all text-slate-700 dark:text-slate-300 border border-[#EAE6DC] dark:border-slate-800">
                          {w.addr}
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(w.addr, w.net)}
                          className="w-full py-2 rounded-xl bg-[#14243E] text-white text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Copy className="w-3.5 h-3.5 text-[#D5B46B]" />
                          <span>{copiedText === w.net ? (isAr ? 'تم النسخ ✓' : 'Copied ✓') : isAr ? 'نسخ عنوان الاستلام' : 'Copy Address'}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 8: SUPPORT (/support) */}
          {activeTab === 'support' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-black text-[#14243E] dark:text-white">
                      {isAr ? 'مركز الدعم الفني وخدمة العملاء' : 'Support Center & Customer Care'}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isAr ? 'افتح تذكرة دعم أو تواصل مباشرة مع فريق قبس عبر القنوات الرسمية' : 'Open a support ticket or reach the QABS team'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigateToTab('support_settings')}
                    className="px-4 py-2.5 rounded-xl border border-[#D5B46B] bg-[#FBFAF6] hover:bg-[#F5F1E6] text-[#14243E] text-xs font-black cursor-pointer self-start"
                  >
                    {isAr ? '⚙️ إعدادات الدعم والتواصل' : '⚙️ Support Settings'}
                  </button>
                </div>

                {/* Official Contact Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl bg-[#FBFAF6] dark:bg-slate-900 border border-[#EAE6DC] dark:border-slate-800 flex items-center gap-3">
                    <Phone className="w-4 h-4 text-[#92743A] shrink-0" />
                    <div>
                      <div className="text-[11px] text-slate-500 font-bold">{isAr ? 'الهاتف الرسمي' : 'Official Phone'}</div>
                      <div className="text-xs font-mono font-black text-[#14243E] dark:text-white" dir="ltr">{sectionSettings.support.officialPhone}</div>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-[#FBFAF6] dark:bg-slate-900 border border-[#EAE6DC] dark:border-slate-800 flex items-center gap-3">
                    <Mail className="w-4 h-4 text-[#92743A] shrink-0" />
                    <div>
                      <div className="text-[11px] text-slate-500 font-bold">{isAr ? 'البريد الرسمي للدعم' : 'Support Email'}</div>
                      <div className="text-xs font-mono font-black text-[#14243E] dark:text-white">{sectionSettings.support.officialEmail}</div>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-[#FBFAF6] dark:bg-slate-900 border border-[#EAE6DC] dark:border-slate-800 flex items-center gap-3">
                    <Clock className="w-4 h-4 text-[#92743A] shrink-0" />
                    <div>
                      <div className="text-[11px] text-slate-500 font-bold">{isAr ? 'ساعات العمل' : 'Working Hours'}</div>
                      <div className="text-xs font-bold text-[#14243E] dark:text-white">{isAr ? sectionSettings.support.workingHoursAr : sectionSettings.support.workingHoursEn}</div>
                    </div>
                  </div>
                </div>

                {lastAutoReplyNote && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-bold">{lastAutoReplyNote}</span>
                    </div>
                    <button type="button" onClick={() => setLastAutoReplyNote(null)} className="text-emerald-700 cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Open Ticket Form */}
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    if (!ticketSubject.trim()) return;
                    addTicket({
                      storeId: currentStore.id,
                      subject: ticketSubject.trim(),
                      subjectAr: ticketSubject.trim(),
                      subjectEn: ticketSubject.trim(),
                      category: ticketCategory,
                      priority: ticketPriority,
                      clientName: user.name,
                      lastMessage: ticketMessage.trim() || ticketSubject.trim()
                    });
                    if (sectionSettings.support.autoReplyEnabled) {
                      setLastAutoReplyNote(sectionSettings.support.autoReplyMessageAr);
                    }
                    setTicketSubject('');
                    setTicketMessage('');
                  }}
                  className="p-4 rounded-2xl bg-[#F8F7F2] dark:bg-slate-900 border border-[#EAE6DC] dark:border-slate-800 space-y-3 text-xs"
                >
                  <h3 className="font-black text-[#14243E] dark:text-white">{isAr ? '+ فتح تذكرة دعم جديدة' : '+ Open New Support Ticket'}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      required
                      value={ticketSubject}
                      onChange={e => setTicketSubject(e.target.value)}
                      placeholder={isAr ? 'عنوان التذكرة *' : 'Ticket Subject *'}
                      className="rounded-xl border border-[#EAE6DC] dark:border-slate-700 bg-white dark:bg-[#071D2B] px-3 py-2"
                    />
                    <select
                      value={ticketCategory}
                      onChange={e => setTicketCategory(e.target.value as typeof ticketCategory)}
                      className="rounded-xl border border-[#EAE6DC] dark:border-slate-700 bg-white dark:bg-[#071D2B] px-3 py-2 font-bold"
                    >
                      <option value="store">{isAr ? 'إدارة المتاجر' : 'Store'}</option>
                      <option value="payments">{isAr ? 'بوابات الدفع' : 'Payments'}</option>
                      <option value="billing">{isAr ? 'الفواتير والاشتراكات' : 'Billing'}</option>
                      <option value="formation">{isAr ? 'تأسيس الشركات' : 'Formation'}</option>
                      <option value="technical">{isAr ? 'دعم تقني' : 'Technical'}</option>
                    </select>
                    <select
                      value={ticketPriority}
                      onChange={e => setTicketPriority(e.target.value as typeof ticketPriority)}
                      className="rounded-xl border border-[#EAE6DC] dark:border-slate-700 bg-white dark:bg-[#071D2B] px-3 py-2 font-bold"
                    >
                      <option value="low">{isAr ? 'أولوية عادية' : 'Low'}</option>
                      <option value="medium">{isAr ? 'متوسطة' : 'Medium'}</option>
                      <option value="high">{isAr ? 'عالية' : 'High'}</option>
                      <option value="urgent">{isAr ? 'عاجلة' : 'Urgent'}</option>
                    </select>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={ticketMessage}
                      onChange={e => setTicketMessage(e.target.value)}
                      placeholder={isAr ? 'تفاصيل الاستفسار...' : 'Describe your request...'}
                      className="flex-1 rounded-xl border border-[#EAE6DC] dark:border-slate-700 bg-white dark:bg-[#071D2B] px-3 py-2"
                    />
                    <button type="submit" className="px-5 py-2.5 rounded-xl bg-[#14243E] text-white font-black cursor-pointer">
                      {isAr ? 'إرسال التذكرة' : 'Submit Ticket'}
                    </button>
                  </div>
                </form>

                {/* Tickets List */}
                <div className="flex items-center gap-2">
                  {(['all', 'open', 'resolved'] as const).map(tf => (
                    <button
                      key={tf}
                      type="button"
                      onClick={() => setTicketFilter(tf)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                        ticketFilter === tf ? 'bg-[#14243E] text-white' : 'bg-[#F8F7F2] text-slate-600 border border-[#EAE6DC]'
                      }`}
                    >
                      {tf === 'all' ? (isAr ? 'الكل' : 'All') : tf === 'open' ? (isAr ? 'مفتوحة' : 'Open') : (isAr ? 'محلولة' : 'Resolved')}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {tickets
                    .filter(t => (ticketFilter === 'all' ? true : ticketFilter === 'resolved' ? t.status === 'resolved' : t.status !== 'resolved'))
                    .map(ticket => (
                      <div key={ticket.id} className="p-4 rounded-2xl border border-[#EAE6DC] dark:border-slate-800 bg-white dark:bg-[#061824] space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-[#92743A]">{ticket.ticketNumber}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${ticket.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                            {ticket.status}
                          </span>
                        </div>
                        <div className="text-sm font-black text-[#14243E] dark:text-white">{isAr ? ticket.subjectAr || ticket.subject : ticket.subjectEn || ticket.subject}</div>
                        <p className="text-slate-500">{ticket.lastMessage}</p>
                        <div className="flex items-center justify-between pt-2 border-t border-[#EAE6DC]/60">
                          <span className="text-[10px] font-mono text-slate-400">{ticket.createdAt}</span>
                          {ticket.status !== 'resolved' && (
                            <button
                              type="button"
                              onClick={() => resolveTicket(ticket.id)}
                              className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
                            >
                              {isAr ? 'تحديد كمحلولة ✓' : 'Mark Resolved ✓'}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cards' && (
            <section className="space-y-4">
              <div className="rounded-2xl border border-[#EAE6DC] bg-white dark:bg-[#071D2B] p-6">
                <h2 className="text-lg font-black text-[#14243E] dark:text-white">{isAr ? 'بطاقات الأعمال' : 'Business Cards'}</h2>
                <p className="mt-1 text-xs text-slate-500">{isAr ? 'إدارة بطاقات الصرف للشركة عند ربط المزود المالي.' : 'Corporate cards management via linked banking providers.'}</p>
              </div>
            </section>
          )}

          {activeTab === 'bank_accounts' && (
            <section className="space-y-4">
              <div className="rounded-2xl border border-[#EAE6DC] bg-white dark:bg-[#071D2B] p-6">
                <h2 className="text-lg font-black text-[#14243E] dark:text-white">{isAr ? 'الحسابات البنكية والتجارية' : 'Business Bank Accounts'}</h2>
                <div className="grid gap-3 sm:grid-cols-2 mt-4">
                  {banking.map(account => (
                    <div key={account.id} className="rounded-xl border border-[#EAE6DC] bg-[#FBFAF6] dark:bg-slate-900 p-4 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-[#14243E] dark:text-white">{account.provider}</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">{account.status}</span>
                      </div>
                      <div className="mt-2 text-slate-500">{account.accountName}</div>
                      <div className="mt-1 font-mono font-bold text-[#14243E] dark:text-[#D5B46B]">{account.accountNumberMasked}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ===================================================================== */}
          {/* 8 DEDICATED FULL-PAGE SECTION SETTINGS VIEWS (/.../settings)           */}
          {/* ===================================================================== */}

          {/* SETTINGS PAGE 1: /overview/settings */}
          {activeTab === 'overview_settings' && (
            <div className="space-y-6">
              {renderSettingsPageHeader('overview', 'نظرة عامة', 'Overview', () => {
                updateSectionSettings('overview', ovDraft);
              })}
              <div className="bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-xs">
                <h2 className="text-lg font-black text-[#14243E] dark:text-white">
                  {isAr ? 'إعدادات صفحة نظرة عامة' : 'Overview Page Configuration'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <label className="p-4 rounded-xl border border-[#EAE6DC] bg-[#FBFAF6] dark:bg-slate-900 flex items-center justify-between gap-3 cursor-pointer">
                    <div>
                      <div className="font-black text-[#14243E] dark:text-white">{isAr ? 'إظهار بطاقات الإحصائيات العلوية (KPIs)' : 'Show Top KPI Cards'}</div>
                      <div className="text-slate-500 mt-0.5">{isAr ? 'التحكم في ظهور أو إخفاء مؤشرات المبيعات والطلبات والمخزون' : 'Show or hide sales, orders and stock metrics'}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={ovDraft.showKpiCards}
                      onChange={e => setOvDraft(d => ({ ...d, showKpiCards: e.target.checked }))}
                      className="w-4 h-4 accent-[#14243E]"
                    />
                  </label>

                  <label className="p-4 rounded-xl border border-[#EAE6DC] bg-[#FBFAF6] dark:bg-slate-900 flex items-center justify-between gap-3 cursor-pointer">
                    <div>
                      <div className="font-black text-[#14243E] dark:text-white">{isAr ? 'إظهار شريط/بانر وضع المعاينة أو الإنتاج' : 'Show Workspace Mode Banner'}</div>
                      <div className="text-slate-500 mt-0.5">{isAr ? 'إظهار أو إخفاء البانر التعريفي أعلى لوحة التحكم' : 'Toggle top status banner visibility'}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={ovDraft.showPreviewBanner}
                      onChange={e => setOvDraft(d => ({ ...d, showPreviewBanner: e.target.checked }))}
                      className="w-4 h-4 accent-[#14243E]"
                    />
                  </label>

                  <label className="p-4 rounded-xl border border-[#EAE6DC] bg-[#FBFAF6] dark:bg-slate-900 flex items-center justify-between gap-3 cursor-pointer">
                    <div>
                      <div className="font-black text-[#14243E] dark:text-white">{isAr ? 'إظهار خطوات الإعداد الأربع التفاعلية' : 'Show 4-Step Setup Checklist'}</div>
                      <div className="text-slate-500 mt-0.5">{isAr ? 'عرض متابعة تجهيز المتجر على الصفحة الرئيسية' : 'Display 4-step readiness checklist'}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={ovDraft.showSetupChecklist}
                      onChange={e => setOvDraft(d => ({ ...d, showSetupChecklist: e.target.checked }))}
                      className="w-4 h-4 accent-[#14243E]"
                    />
                  </label>

                  <div className="p-4 rounded-xl border border-[#EAE6DC] bg-[#FBFAF6] dark:bg-slate-900 space-y-2">
                    <label className="block font-black text-[#14243E] dark:text-white">
                      {isAr ? 'العملة الافتراضية للمؤشرات والمتجر' : 'Default Dashboard Currency'}
                    </label>
                    <select
                      value={ovDraft.defaultCurrency}
                      onChange={e => setOvDraft(d => ({ ...d, defaultCurrency: e.target.value as 'SAR' | 'USD' | 'AED' }))}
                      className="w-full rounded-xl border border-[#EAE6DC] bg-white dark:bg-[#071D2B] px-3 py-2 font-bold"
                    >
                      <option value="SAR">SAR — الريال السعودي</option>
                      <option value="USD">USD — الدولار الأمريكي</option>
                      <option value="AED">AED — الدرهم الإماراتي</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS PAGE 2: /orders/settings */}
          {activeTab === 'orders_settings' && (
            <div className="space-y-6">
              {renderSettingsPageHeader('orders', 'الطلبات', 'Orders', () => {
                updateSectionSettings('orders', ordDraft);
              })}
              <div className="bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-xs text-xs">
                <h2 className="text-lg font-black text-[#14243E] dark:text-white">
                  {isAr ? 'إعدادات الطلبات، المخزون، وشركات الشحن' : 'Orders, Inventory Deduction & Carriers Settings'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">{isAr ? 'بادئة ترقيم الطلبات (Prefix)' : 'Order Number Prefix'}</label>
                    <input
                      type="text"
                      value={ordDraft.orderPrefix}
                      onChange={e => setOrdDraft(d => ({ ...d, orderPrefix: e.target.value }))}
                      placeholder="QBS-"
                      className="w-full rounded-xl border border-[#EAE6DC] bg-[#F8F7F2] dark:bg-slate-900 px-3 py-2.5 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">{isAr ? 'شركة الشحن الافتراضية' : 'Default Carrier'}</label>
                    <input
                      type="text"
                      value={ordDraft.defaultCarrier}
                      onChange={e => setOrdDraft(d => ({ ...d, defaultCarrier: e.target.value }))}
                      className="w-full rounded-xl border border-[#EAE6DC] bg-[#F8F7F2] dark:bg-slate-900 px-3 py-2.5 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">{isAr ? `سعر الشحن الافتراضي (${currentStore.currency})` : 'Default Shipping Rate'}</label>
                    <input
                      type="number"
                      value={ordDraft.defaultShippingRate}
                      onChange={e => setOrdDraft(d => ({ ...d, defaultShippingRate: Number(e.target.value) || 0 }))}
                      className="w-full rounded-xl border border-[#EAE6DC] bg-[#F8F7F2] dark:bg-slate-900 px-3 py-2.5 font-bold"
                    />
                  </div>
                </div>

                <label className="p-4 rounded-xl border border-[#EAE6DC] bg-[#FBFAF6] dark:bg-slate-900 flex items-center justify-between gap-3 cursor-pointer">
                  <div>
                    <div className="font-black text-[#14243E] dark:text-white">{isAr ? 'خصم المخزون تلقائياً عند إنشاء طلب جديد' : 'Auto-Deduct Inventory on New Order'}</div>
                    <div className="text-slate-500 mt-0.5">{isAr ? 'يخصم الكمية المطلوبة من رصيد المنتج فور تأكيد الطلب' : 'Automatically reduces product stock upon order creation'}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={ordDraft.autoDeductInventory}
                    onChange={e => setOrdDraft(d => ({ ...d, autoDeductInventory: e.target.checked }))}
                    className="w-4 h-4 accent-[#14243E]"
                  />
                </label>

                <div className="space-y-2">
                  <div className="font-black text-[#14243E] dark:text-white">{isAr ? 'حالات الطلب المفعلة في الجدول والفلاتر:' : 'Enabled Order Statuses:'}</div>
                  <div className="flex flex-wrap gap-2">
                    {(['paid', 'processing', 'shipped', 'delivered', 'refunded'] as const).map(st => {
                      const active = ordDraft.enabledStatuses.includes(st);
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() =>
                            setOrdDraft(d => ({
                              ...d,
                              enabledStatuses: active
                                ? d.enabledStatuses.filter(item => item !== st)
                                : [...d.enabledStatuses, st]
                            }))
                          }
                          className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer border ${
                            active ? 'bg-[#14243E] text-white border-[#14243E]' : 'bg-[#F8F7F2] text-slate-500 border-[#EAE6DC]'
                          }`}
                        >
                          {active ? '✓ ' : ''}
                          {isAr ? `${statusLabelAr[st]} (${st})` : st}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Shipping Zones Manager */}
                <div className="pt-4 border-t border-[#EAE6DC] space-y-3">
                  <div className="font-black text-[#14243E] dark:text-white">{isAr ? 'مناطق الشحن والأسعار المستقلة للمتجر:' : 'Shipping Zones & Rates:'}</div>
                  <div className="flex flex-wrap gap-2">
                    {storeShipping.map(z => (
                      <span key={z.id} className="px-3 py-1.5 rounded-xl bg-[#FBFAF6] border border-[#EAE6DC] font-bold">
                        {isAr ? z.regionNameAr : z.regionNameEn} — {z.carrier} ({z.rate} {currentStore.currency})
                      </span>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
                    <input type="text" placeholder={isAr ? 'المنطقة (مثال: دول الخليج)' : 'Region'} value={shipRegionAr} onChange={e => setShipRegionAr(e.target.value)} className="rounded-xl border border-[#EAE6DC] bg-[#F8F7F2] px-3 py-2" />
                    <input type="text" placeholder={isAr ? 'شركة الشحن' : 'Carrier'} value={shipCarrier} onChange={e => setShipCarrier(e.target.value)} className="rounded-xl border border-[#EAE6DC] bg-[#F8F7F2] px-3 py-2" />
                    <input type="number" placeholder={isAr ? 'التكلفة' : 'Rate'} value={shipRate} onChange={e => setShipRate(e.target.value)} className="rounded-xl border border-[#EAE6DC] bg-[#F8F7F2] px-3 py-2" />
                    <button
                      type="button"
                      onClick={() => {
                        if (!shipRegionAr.trim()) return;
                        addShippingZone({ storeId: currentStore.id, regionNameAr: shipRegionAr, regionNameEn: shipRegionAr, carrier: shipCarrier, rate: Number(shipRate) || 25, deliveryTimeAr: shipTime, deliveryTimeEn: shipTime, active: true });
                        setShipRegionAr('');
                      }}
                      className="rounded-xl bg-[#14243E] text-white font-black py-2 px-3 cursor-pointer"
                    >
                      {isAr ? '+ إضافة منطقة شحن' : '+ Add Zone'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS PAGE 3: /documents/settings */}
          {activeTab === 'documents_settings' && (
            <div className="space-y-6">
              {renderSettingsPageHeader('documents', 'المستندات', 'Documents', () => {
                updateSectionSettings('documents', docDraft);
              })}
              <div className="bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-xs text-xs">
                <h2 className="text-lg font-black text-[#14243E] dark:text-white">
                  {isAr ? 'إعدادات القوالب الرسمية والختم وصيغ التصدير' : 'Document Templates, Branding Stamp & Export Formats'}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {([
                    { id: 'executive_gold' as const, titleAr: 'القالب التنفيذي الذهبي (Executive Gold)', descAr: 'إطار كحلي وذهبي فاخر للفواتير الرسمية' },
                    { id: 'modern_clean' as const, titleAr: 'القالب العصري الواضح (Modern Clean)', descAr: 'تصميم نظيف ومتوازن للشهادات' },
                    { id: 'minimal_legal' as const, titleAr: 'القالب القانوني الرسمي (Minimal Legal)', descAr: 'تنسيق عقود ومستندات رسمية كلاسيكي' }
                  ]).map(tpl => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => setDocDraft(d => ({ ...d, officialTemplateStyle: tpl.id }))}
                      className={`p-4 rounded-xl border-2 text-right cursor-pointer ${
                        docDraft.officialTemplateStyle === tpl.id ? 'border-[#D5B46B] bg-[#FBFAF6]' : 'border-[#EAE6DC]'
                      }`}
                    >
                      <div className="font-black text-[#14243E]">{isAr ? tpl.titleAr : tpl.id}</div>
                      <div className="text-[11px] text-slate-500 mt-1">{tpl.descAr}</div>
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">{isAr ? 'نص الختم والتوقيع الرسمي على المستندات' : 'Company Stamp Text'}</label>
                  <input
                    type="text"
                    value={docDraft.companyStampText}
                    onChange={e => setDocDraft(d => ({ ...d, companyStampText: e.target.value }))}
                    className="w-full rounded-xl border border-[#EAE6DC] bg-[#F8F7F2] dark:bg-slate-900 px-3 py-2.5 font-bold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-[#EAE6DC] bg-[#FBFAF6] space-y-2">
                    <div className="font-black text-[#14243E]">{isAr ? 'شعار الشركة المرفوع للمستندات' : 'Official Document Logo'}</div>
                    {docDraft.logoDataUrl && <img src={docDraft.logoDataUrl} alt="Logo preview" className="h-12 object-contain rounded bg-white p-1 border" />}
                    <div className="flex items-center gap-2">
                      <label className="px-3 py-1.5 rounded-lg bg-[#14243E] text-white font-bold cursor-pointer">
                        {isAr ? 'رفع صورة الشعار' : 'Upload Logo'}
                        <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) readImageAsDataUrl(f, url => setDocDraft(d => ({ ...d, logoDataUrl: url }))); }} />
                      </label>
                      {docDraft.logoDataUrl && (
                        <button type="button" onClick={() => setDocDraft(d => ({ ...d, logoDataUrl: '' }))} className="px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-600 font-bold cursor-pointer">
                          {isAr ? 'حذف' : 'Clear'}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-[#EAE6DC] bg-[#FBFAF6] space-y-2">
                    <div className="font-black text-[#14243E]">{isAr ? 'صورة الختم الرسمي' : 'Official Company Seal'}</div>
                    {docDraft.stampDataUrl && <img src={docDraft.stampDataUrl} alt="Stamp preview" className="h-12 object-contain rounded bg-white p-1 border" />}
                    <div className="flex items-center gap-2">
                      <label className="px-3 py-1.5 rounded-lg bg-[#14243E] text-white font-bold cursor-pointer">
                        {isAr ? 'رفع صورة الختم' : 'Upload Stamp'}
                        <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) readImageAsDataUrl(f, url => setDocDraft(d => ({ ...d, stampDataUrl: url }))); }} />
                      </label>
                      {docDraft.stampDataUrl && (
                        <button type="button" onClick={() => setDocDraft(d => ({ ...d, stampDataUrl: '' }))} className="px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-600 font-bold cursor-pointer">
                          {isAr ? 'حذف' : 'Clear'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="font-black text-[#14243E] dark:text-white">{isAr ? 'صيغ التصدير والأرشفة المسموح بها:' : 'Allowed Export Formats:'}</div>
                  <div className="flex flex-wrap gap-2">
                    {(['PDF', 'JSON', 'CSV', 'DOCX'] as const).map(fmt => {
                      const active = docDraft.allowedExportFormats.includes(fmt);
                      return (
                        <button
                          key={fmt}
                          type="button"
                          onClick={() =>
                            setDocDraft(d => ({
                              ...d,
                              allowedExportFormats: active ? d.allowedExportFormats.filter(f => f !== fmt) : [...d.allowedExportFormats, fmt]
                            }))
                          }
                          className={`px-3 py-1.5 rounded-xl font-mono font-bold cursor-pointer border ${active ? 'bg-[#14243E] text-white border-[#14243E]' : 'bg-[#F8F7F2] text-slate-500 border-[#EAE6DC]'}`}
                        >
                          {active ? '✓ ' : ''}
                          {fmt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <label className="p-4 rounded-xl border border-[#EAE6DC] bg-[#FBFAF6] flex items-center justify-between gap-3 cursor-pointer">
                  <div>
                    <div className="font-black text-[#14243E]">{isAr ? 'أرشفة الفواتير الصادرة تلقائياً في خزينة المستندات' : 'Auto-Archive Issued Invoices'}</div>
                    <div className="text-slate-500 mt-0.5">{isAr ? 'حفظ نسخة من كل فاتورة يتم إصدارها داخل قسم المستندات' : 'Display every issued invoice in Documents archive'}</div>
                  </div>
                  <input type="checkbox" checked={docDraft.autoArchiveIssuedInvoices} onChange={e => setDocDraft(d => ({ ...d, autoArchiveIssuedInvoices: e.target.checked }))} className="w-4 h-4 accent-[#14243E]" />
                </label>
              </div>
            </div>
          )}

          {/* SETTINGS PAGE 4: /stores/settings */}
          {activeTab === 'stores_settings' && (
            <div className="space-y-6">
              {renderSettingsPageHeader('my_stores', 'متاجري', 'My Stores', () => {
                updateStoreDetails(currentStore.id, {
                  name: storeNameDraft.trim() || currentStore.name,
                  activityAr: storeActivityDraft.trim() || currentStore.activityAr
                });
                showToast(isAr ? 'تم حفظ إعدادات المتجر وتطبيقها فوراً ✓' : 'Store settings saved ✓');
              })}
              <div className="bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-xs text-xs">
                <h2 className="text-lg font-black text-[#14243E] dark:text-white">
                  {isAr ? `إعدادات المتجر النشط (${currentStore.name})` : `Store Settings (${currentStore.name})`}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">{isAr ? 'اسم المتجر الرسمي' : 'Store Name'}</label>
                    <input
                      type="text"
                      value={storeNameDraft}
                      onChange={e => setStoreNameDraft(e.target.value)}
                      placeholder="قبس للكشري الساعات والجلديات | QABS Elite Lux"
                      className="w-full rounded-xl border border-[#EAE6DC] bg-[#F8F7F2] dark:bg-slate-900 px-3 py-2.5 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">{isAr ? 'النشاط التجاري' : 'Business Activity'}</label>
                    <input
                      type="text"
                      value={storeActivityDraft}
                      onChange={e => setStoreActivityDraft(e.target.value)}
                      className="w-full rounded-xl border border-[#EAE6DC] bg-[#F8F7F2] dark:bg-slate-900 px-3 py-2.5"
                    />
                  </div>
                </div>

                {/* Custom Domain Connect */}
                <div className="p-4 rounded-xl bg-[#FBFAF6] dark:bg-slate-900 border border-[#EAE6DC] space-y-2">
                  <div className="font-black text-[#14243E] dark:text-white">{isAr ? 'ربط النطاق المخصص (Custom Domain)' : 'Custom Domain & DNS'}</div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={domainInput}
                      onChange={e => setDomainInput(e.target.value)}
                      placeholder="shop.yourbrand.com"
                      className="flex-1 rounded-xl border border-[#EAE6DC] bg-white dark:bg-[#071D2B] px-3 py-2 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => domainInput.trim() && requestDomainVerification(currentStore.id, domainInput.trim())}
                      className="px-4 py-2 rounded-xl bg-[#14243E] text-white font-black cursor-pointer"
                    >
                      {isAr ? 'ربط وفحص DNS' : 'Connect & Verify'}
                    </button>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {isAr ? `النطاق الفرعي: ${currentStore.subdomain}` : `Subdomain: ${currentStore.subdomain}`}
                    {currentStore.customDomain && ` • ${currentStore.customDomain} (${currentStore.domainVerified ? 'SSL Active' : 'Pending Verification'})`}
                  </div>
                </div>

                {/* Quick Colors & Approval / Production */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-[#EAE6DC] space-y-2">
                    <div className="font-black text-[#14243E]">{isAr ? 'الألوان والخطوط' : 'Colors & Font'}</div>
                    <div className="flex items-center gap-3">
                      <input type="color" value={currentStore.primaryColor || '#14243E'} onChange={e => updateStoreDetails(currentStore.id, { primaryColor: e.target.value })} className="w-8 h-8 rounded cursor-pointer" />
                      <input type="color" value={currentStore.accentColor || '#D5B46B'} onChange={e => updateStoreDetails(currentStore.id, { accentColor: e.target.value })} className="w-8 h-8 rounded cursor-pointer" />
                      <button type="button" onClick={() => navigateToTab('store_design')} className="text-[#92743A] font-black hover:underline cursor-pointer">
                        {isAr ? 'محرر القوالب ←' : 'Templates →'}
                      </button>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border border-[#EAE6DC] space-y-2">
                    <div className="font-black text-[#14243E]">{isAr ? 'حالة النشر وموافقة قبس' : 'Publication & Approval'}</div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-emerald-700">{currentStore.approvalStatus || 'draft'}</span>
                      <button type="button" onClick={() => submitStoreForApproval(currentStore.id)} className="px-3 py-1.5 rounded-lg bg-[#14243E] text-white font-bold cursor-pointer">
                        {isAr ? 'طلب اعتماد ونشر' : 'Submit Review'}
                      </button>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border border-[#EAE6DC] space-y-2">
                    <div className="font-black text-[#14243E]">{isAr ? 'وضع التشغيل الفعلي' : 'Live Production Status'}</div>
                    <button type="button" onClick={() => activateProductionMode(currentStore.id)} className="w-full py-2 rounded-lg bg-emerald-700 text-white font-black cursor-pointer">
                      {isProductionMode ? (isAr ? 'وضع الإنتاج مفعّل ✓' : 'Production Active ✓') : isAr ? 'اعتماد الدفع والشحن الآن' : 'Approve & Go Live'}
                    </button>
                  </div>
                </div>

                {renderShopifyIntegrationCard()}
              </div>
            </div>
          )}

          {/* SETTINGS PAGE 5: /billing/settings */}
          {activeTab === 'billing_settings' && (
            <div className="space-y-6">
              {renderSettingsPageHeader('subscriptions', 'الاشتراكات والفواتير', 'Subscriptions & Billing', () => {
                updateSectionSettings('billing', billDraft);
                updateStoreDetails(currentStore.id, { taxRate: Number(billTaxRateDraft) || 0 });
              })}
              <div className="bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-xs text-xs">
                <h2 className="text-lg font-black text-[#14243E] dark:text-white">
                  {isAr ? 'إعدادات الضرائب والفوترة وبوابات الدفع المستقلة' : 'Tax, VAT & Payment Gateways Settings'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">{isAr ? 'نسبة الضريبة للدولة (%)' : 'Country Tax Rate (%)'}</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={billTaxRateDraft}
                      onChange={e => setBillTaxRateDraft(Number(e.target.value))}
                      className="w-full rounded-xl border border-[#EAE6DC] bg-[#F8F7F2] px-3 py-2.5 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">{isAr ? 'الرقم الضريبي (Tax ID / VAT)' : 'Tax Registration Number'}</label>
                    <input
                      type="text"
                      value={billDraft.taxNumber}
                      onChange={e => setBillDraft(d => ({ ...d, taxNumber: e.target.value }))}
                      className="w-full rounded-xl border border-[#EAE6DC] bg-[#F8F7F2] px-3 py-2.5 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">{isAr ? 'حساب التحويل البنكي (IBAN)' : 'Bank Transfer IBAN'}</label>
                    <input
                      type="text"
                      value={billDraft.bankIban}
                      onChange={e => setBillDraft(d => ({ ...d, bankIban: e.target.value }))}
                      className="w-full rounded-xl border border-[#EAE6DC] bg-[#F8F7F2] px-3 py-2.5 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {([
                    { key: 'enableMoyasarTap' as const, label: 'Moyasar / Tap Payments' },
                    { key: 'enableStripe' as const, label: 'Stripe Global' },
                    { key: 'enablePayPal' as const, label: 'PayPal Business' },
                    { key: 'enableBankTransfer' as const, label: isAr ? 'التحويل البنكي المباشر' : 'Bank Transfer' }
                  ]).map(gw => (
                    <label key={gw.key} className="p-4 rounded-xl border border-[#EAE6DC] bg-[#FBFAF6] flex items-center justify-between gap-2 cursor-pointer">
                      <span className="font-black text-[#14243E]">{gw.label}</span>
                      <input
                        type="checkbox"
                        checked={billDraft[gw.key]}
                        onChange={e => setBillDraft(d => ({ ...d, [gw.key]: e.target.checked }))}
                        className="w-4 h-4 accent-[#14243E]"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS PAGE 6: /qabs-ai/settings */}
          {activeTab === 'qabs_ai_settings' && (
            <div className="space-y-6">
              {renderSettingsPageHeader('qabs_ai', 'قبس AI والأرصدة', 'QABS AI & Credits', () => {
                updateSectionSettings('qabsAi', aiDraft);
              })}
              <div className="bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-xs text-xs">
                <h2 className="text-lg font-black text-[#14243E] dark:text-white">
                  {isAr ? 'إعدادات صلاحيات قبس AI وسقف الأرصدة والتنبيهات' : 'QABS AI Execution Permissions & Credit Alerts'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="p-4 rounded-xl border border-[#EAE6DC] bg-[#FBFAF6] flex items-center justify-between gap-3 cursor-pointer">
                    <div>
                      <div className="font-black text-[#14243E]">{isAr ? 'تفعيل التنفيذ التلقائي للأوامر' : 'Enable AI Auto-Execution'}</div>
                      <div className="text-slate-500 mt-0.5">{isAr ? 'السماح لمحرك AI بتنفيذ التعديلات مباشرة' : 'Allow AI commands to execute changes'}</div>
                    </div>
                    <input type="checkbox" checked={aiDraft.autoExecuteEnabled} onChange={e => setAiDraft(d => ({ ...d, autoExecuteEnabled: e.target.checked }))} className="w-4 h-4 accent-[#14243E]" />
                  </label>
                  <label className="p-4 rounded-xl border border-[#EAE6DC] bg-[#FBFAF6] flex items-center justify-between gap-3 cursor-pointer">
                    <div>
                      <div className="font-black text-[#14243E]">{isAr ? 'صلاحية تعديل الأسعار والخصومات' : 'Allow Price Modification'}</div>
                      <div className="text-slate-500 mt-0.5">{isAr ? 'السماح برفع أو خفض الأسعار نصياً' : 'Permit AI pricing updates'}</div>
                    </div>
                    <input type="checkbox" checked={aiDraft.allowPriceModification} onChange={e => setAiDraft(d => ({ ...d, allowPriceModification: e.target.checked }))} className="w-4 h-4 accent-[#14243E]" />
                  </label>
                  <label className="p-4 rounded-xl border border-[#EAE6DC] bg-[#FBFAF6] flex items-center justify-between gap-3 cursor-pointer">
                    <div>
                      <div className="font-black text-[#14243E]">{isAr ? 'صلاحية تجهيز وشحن الطلبات' : 'Allow Order Fulfillment'}</div>
                      <div className="text-slate-500 mt-0.5">{isAr ? 'السماح بتجهيز وشحن الطلبات المعلقة' : 'Permit AI order fulfillment'}</div>
                    </div>
                    <input type="checkbox" checked={aiDraft.allowOrderFulfillment} onChange={e => setAiDraft(d => ({ ...d, allowOrderFulfillment: e.target.checked }))} className="w-4 h-4 accent-[#14243E]" />
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">{isAr ? 'الحد الأقصى للرصيد الشهري (Credit Limit)' : 'Monthly Credit Limit'}</label>
                    <input
                      type="number"
                      min="10"
                      value={aiDraft.monthlyCreditLimit}
                      onChange={e => setAiDraft(d => ({ ...d, monthlyCreditLimit: Number(e.target.value) || 100 }))}
                      className="w-full rounded-xl border border-[#EAE6DC] bg-[#F8F7F2] px-3 py-2.5 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">{isAr ? 'عتبة تنبيه انخفاض الرصيد (Low Credit Threshold)' : 'Low Credit Alert Threshold'}</label>
                    <input
                      type="number"
                      min="1"
                      value={aiDraft.lowCreditAlertThreshold}
                      onChange={e => setAiDraft(d => ({ ...d, lowCreditAlertThreshold: Number(e.target.value) || 10 }))}
                      className="w-full rounded-xl border border-[#EAE6DC] bg-[#F8F7F2] px-3 py-2.5 font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS PAGE 7: /crypto/settings */}
          {activeTab === 'crypto_settings' && (
            <div className="space-y-6">
              {renderSettingsPageHeader('digital_currencies', 'العملات الرقمية', 'Digital Currencies', () => {
                updateSectionSettings('crypto', cryptoDraft);
                updateStoreDetails(currentStore.id, { cryptoSettlementEnabled: cryptoEnabledInput });
              })}
              <div className="bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-xs text-xs">
                <h2 className="text-lg font-black text-[#14243E] dark:text-white">
                  {isAr ? 'إعدادات محافظ الاستلام والشبكات الرقمية المفعلة' : 'Crypto Wallet Addresses, Networks & Checkout Toggle'}
                </h2>

                <label className="p-4 rounded-xl border border-[#EAE6DC] bg-[#FBFAF6] flex items-center justify-between gap-3 cursor-pointer">
                  <div>
                    <div className="font-black text-[#14243E]">{isAr ? 'تفعيل الدفع بالعملات الرقمية في المتجر النشط' : 'Enable Crypto Checkout in Store'}</div>
                    <div className="text-slate-500 mt-0.5">{isAr ? 'إظهار خيار السداد بالعملات الرقمية لعملاء المتجر' : 'Allow customers to pay via crypto'}</div>
                  </div>
                  <input type="checkbox" checked={cryptoEnabledInput} onChange={e => setCryptoEnabledInput(e.target.checked)} className="w-4 h-4 accent-[#14243E]" />
                </label>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">USDT TRC20 Address</label>
                    <input type="text" value={cryptoDraft.usdtTrc20Address} onChange={e => setCryptoDraft(d => ({ ...d, usdtTrc20Address: e.target.value }))} className="w-full rounded-xl border border-[#EAE6DC] bg-[#F8F7F2] px-3 py-2.5 font-mono text-[11px]" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">USDT ERC20 Address</label>
                    <input type="text" value={cryptoDraft.usdtErc20Address} onChange={e => setCryptoDraft(d => ({ ...d, usdtErc20Address: e.target.value }))} className="w-full rounded-xl border border-[#EAE6DC] bg-[#F8F7F2] px-3 py-2.5 font-mono text-[11px]" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Bitcoin (BTC) Address</label>
                    <input type="text" value={cryptoDraft.btcAddress} onChange={e => setCryptoDraft(d => ({ ...d, btcAddress: e.target.value }))} className="w-full rounded-xl border border-[#EAE6DC] bg-[#F8F7F2] px-3 py-2.5 font-mono text-[11px]" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                  <div className="space-y-2">
                    <div className="font-black text-[#14243E]">{isAr ? 'الشبكات المفعلة:' : 'Enabled Networks:'}</div>
                    <div className="flex flex-wrap gap-2">
                      {(['TRC20', 'ERC20', 'BTC', 'Solana'] as const).map(net => {
                        const active = cryptoDraft.enabledNetworks.includes(net);
                        return (
                          <button
                            key={net}
                            type="button"
                            onClick={() =>
                              setCryptoDraft(d => ({
                                ...d,
                                enabledNetworks: active ? d.enabledNetworks.filter(n => n !== net) : [...d.enabledNetworks, net]
                              }))
                            }
                            className={`px-3 py-1.5 rounded-xl font-mono font-bold cursor-pointer border ${active ? 'bg-[#14243E] text-white border-[#14243E]' : 'bg-[#F8F7F2] text-slate-500 border-[#EAE6DC]'}`}
                          >
                            {active ? '✓ ' : ''}
                            {net}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">{isAr ? 'الحد الأدنى للتحويل (USD)' : 'Minimum Transfer Amount (USD)'}</label>
                    <input
                      type="number"
                      min="1"
                      value={cryptoDraft.minTransferUsd}
                      onChange={e => setCryptoDraft(d => ({ ...d, minTransferUsd: Number(e.target.value) || 10 }))}
                      className="w-full rounded-xl border border-[#EAE6DC] bg-[#F8F7F2] px-3 py-2.5 font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS PAGE 8: /support/settings */}
          {activeTab === 'support_settings' && (
            <div className="space-y-6">
              {renderSettingsPageHeader('support', 'الدعم', 'Support', () => {
                updateSectionSettings('support', supDraft);
              })}
              <div className="bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-xs text-xs">
                <h2 className="text-lg font-black text-[#14243E] dark:text-white">
                  {isAr ? 'إعدادات قنوات التواصل الرسمية والرد التلقائي' : 'Official Support Contact & Auto-Reply Settings'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">{isAr ? 'رقم الهاتف الرسمي للدعم' : 'Official Contact Phone'}</label>
                    <input type="text" value={supDraft.officialPhone} onChange={e => setSupDraft(d => ({ ...d, officialPhone: e.target.value }))} className="w-full rounded-xl border border-[#EAE6DC] bg-[#F8F7F2] px-3 py-2.5 font-mono" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">{isAr ? 'البريد الإلكتروني الرسمي للدعم' : 'Official Support Email'}</label>
                    <input type="email" value={supDraft.officialEmail} onChange={e => setSupDraft(d => ({ ...d, officialEmail: e.target.value }))} className="w-full rounded-xl border border-[#EAE6DC] bg-[#F8F7F2] px-3 py-2.5 font-mono" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">{isAr ? 'ساعات العمل (عربي)' : 'Working Hours (AR)'}</label>
                    <input type="text" value={supDraft.workingHoursAr} onChange={e => setSupDraft(d => ({ ...d, workingHoursAr: e.target.value }))} className="w-full rounded-xl border border-[#EAE6DC] bg-[#F8F7F2] px-3 py-2.5" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">{isAr ? 'ساعات العمل (إنجليزي)' : 'Working Hours (EN)'}</label>
                    <input type="text" value={supDraft.workingHoursEn} onChange={e => setSupDraft(d => ({ ...d, workingHoursEn: e.target.value }))} className="w-full rounded-xl border border-[#EAE6DC] bg-[#F8F7F2] px-3 py-2.5" />
                  </div>
                </div>

                <label className="p-4 rounded-xl border border-[#EAE6DC] bg-[#FBFAF6] flex items-center justify-between gap-3 cursor-pointer">
                  <div>
                    <div className="font-black text-[#14243E]">{isAr ? 'تفعيل الرد التلقائي الفوري عند فتح تذكرة جديدة' : 'Enable Auto-Reply on New Ticket'}</div>
                    <div className="text-slate-500 mt-0.5">{isAr ? 'إرسال رسالة تأكيد فورية للعميل فور تسجيل تذكرة الدعم' : 'Send immediate confirmation note upon ticket submission'}</div>
                  </div>
                  <input type="checkbox" checked={supDraft.autoReplyEnabled} onChange={e => setSupDraft(d => ({ ...d, autoReplyEnabled: e.target.checked }))} className="w-4 h-4 accent-[#14243E]" />
                </label>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">{isAr ? 'نص رسالة الرد التلقائي' : 'Auto-Reply Message'}</label>
                  <textarea rows={2} value={supDraft.autoReplyMessageAr} onChange={e => setSupDraft(d => ({ ...d, autoReplyMessageAr: e.target.value }))} className="w-full rounded-xl border border-[#EAE6DC] bg-[#F8F7F2] px-3 py-2.5" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'company_formation' && (() => {
            const cfCfg = sectionSettings.companyFormation;
            const jurisdictionCatalog: {
              id: 'US_KENTUCKY' | 'US_WYOMING' | 'US_DELAWARE' | 'US_NEW_MEXICO' | 'UK_LTD';
              nameAr: string;
              nameEn: string;
              countryLabelAr: string;
              fee: number;
              defaultSuffix: 'LLC' | 'INC' | 'LTD' | 'C-CORP';
              agentLabel: string;
              addressLabel: string;
            }[] = [
              {
                id: 'US_KENTUCKY',
                nameAr: 'كنتاكي (Kentucky LLC)',
                nameEn: 'Kentucky, USA',
                countryLabelAr: 'الولايات المتحدة',
                fee: cfCfg.stateFees.US_KENTUCKY,
                defaultSuffix: 'LLC',
                agentLabel: 'QABS Kentucky Registered Agent Services',
                addressLabel: '400 W Market St Ste 1800, Louisville, KY 40202, USA'
              },
              {
                id: 'US_WYOMING',
                nameAr: 'وايومنغ (Wyoming LLC)',
                nameEn: 'Wyoming, USA',
                countryLabelAr: 'الولايات المتحدة',
                fee: cfCfg.stateFees.US_WYOMING,
                defaultSuffix: 'LLC',
                agentLabel: 'Northwest Registered Agent LLC (Cheyenne, WY)',
                addressLabel: '30 N Gould St Ste R, Sheridan, WY 82801, USA'
              },
              {
                id: 'US_DELAWARE',
                nameAr: 'ديلاوير (Delaware LLC / C-Corp)',
                nameEn: 'Delaware, USA',
                countryLabelAr: 'الولايات المتحدة',
                fee: cfCfg.stateFees.US_DELAWARE,
                defaultSuffix: 'LLC',
                agentLabel: 'The Corporation Trust Company (Wilmington, DE)',
                addressLabel: '1209 N Orange St, Wilmington, DE 19801, USA'
              },
              {
                id: 'US_NEW_MEXICO',
                nameAr: 'نيو مكسيكو (New Mexico LLC)',
                nameEn: 'New Mexico, USA',
                countryLabelAr: 'الولايات المتحدة',
                fee: cfCfg.stateFees.US_NEW_MEXICO,
                defaultSuffix: 'LLC',
                agentLabel: 'QABS New Mexico Statutory Agent LLC',
                addressLabel: '1209 Mountain Rd Pl NE, Albuquerque, NM 87110, USA'
              },
              {
                id: 'UK_LTD',
                nameAr: 'بريطانيا (UK Private Limited - LTD)',
                nameEn: 'United Kingdom (Companies House)',
                countryLabelAr: 'المملكة المتحدة',
                fee: cfCfg.stateFees.UK_LTD,
                defaultSuffix: 'LTD',
                agentLabel: 'QABS UK Company Secretarial & Registered Office',
                addressLabel: '71-75 Shelton Street, Covent Garden, London, WC2H 9JQ, UK'
              }
            ];

            const selectedJurisdiction = jurisdictionCatalog.find(j => j.id === cfJurisdiction) || jurisdictionCatalog[1];
            const einAddonCost = cfAddonEin ? cfCfg.einFeeUsd : 0;
            const agentAddonCost = cfAddonAgent ? cfCfg.registeredAgentFeeUsd : 0;
            const bankAddonCost = cfAddonBank ? 75 : 0;
            const gatewaysAddonCost = cfAddonGateways ? 49 : 0;
            const calculatedTotalUsd =
              cfCfg.baseServiceFeeUsd +
              selectedJurisdiction.fee +
              einAddonCost +
              agentAddonCost +
              bankAddonCost +
              gatewaysAddonCost;

            const stageLabels = [
              { step: 1, titleAr: '1. مراجعة الاسم والوثائق', titleEn: '1. Name & Docs Review' },
              { step: 2, titleAr: '2. التوثيق لدى سجل الولاية', titleEn: '2. Secretary of State Filing' },
              { step: 3, titleAr: '3. استخراج Articles of Organization', titleEn: '3. Articles Issued' },
              { step: 4, titleAr: '4. إصدار EIN من الـ IRS', titleEn: '4. IRS EIN Issued' },
              { step: 5, titleAr: '5. تسليم الحقيبة في المستندات', titleEn: '5. Legal Kit Delivered' }
            ];

            const requiredDocLabels: Record<'passport' | 'proof_of_address' | 'business_plan' | 'source_of_funds', { ar: string; en: string }> = {
              passport: { ar: 'صورة جواز سفر ساري المفعول', en: 'Valid Passport Copy' },
              proof_of_address: { ar: 'إثبات عنوان سكني حديث', en: 'Recent Proof of Address' },
              business_plan: { ar: 'ملخص خطة العمل والنشاط', en: 'Business Activity Summary' },
              source_of_funds: { ar: 'إقرار مصدر الأموال للبنك', en: 'Source of Funds Declaration' }
            };

            const handleSubmitNewFormation = (e: React.FormEvent) => {
              e.preventDefault();
              setCfFormError(null);
              if (!cfProposedName.trim()) {
                setCfFormError(isAr ? 'يرجى إدخال الاسم المقترح للشركة قبل الإرسال' : 'Please enter the proposed company name');
                return;
              }
              if (cfCfg.requiredDocuments.includes('passport') && !cfPassportFile) {
                setCfFormError(isAr ? 'رفع صورة جواز السفر إلزامي حسب إعدادات القسم الحالية' : 'Passport upload is mandatory per current section settings');
                return;
              }
              const otherReqs = cfCfg.requiredDocuments.filter(d => d !== 'passport');
              const missingExtra = otherReqs.filter(req => !cfExtraDocsConfirmed.includes(req));
              if (missingExtra.length > 0) {
                setCfFormError(
                  isAr
                    ? `يرجى تأكيد إرفاق المستندات الإلزامية المطلوبة: ${missingExtra.map(m => requiredDocLabels[m].ar).join('، ')}`
                    : `Please confirm all required documents: ${missingExtra.map(m => requiredDocLabels[m].en).join(', ')}`
                );
                return;
              }

              const finalSuffix = cfJurisdiction === 'UK_LTD' ? 'LTD' : cfSuffix === 'C-CORP' ? 'C-CORP' : cfSuffix === 'INC' ? 'INC' : 'LLC';
              const cleanBase = cfProposedName.trim().toUpperCase();
              const fullName = cleanBase.endsWith(finalSuffix) ? cleanBase : `${cleanBase} ${finalSuffix}`;

              addCompany({
                companyName: fullName,
                jurisdiction: cfJurisdiction,
                entityType: finalSuffix === 'LTD' ? 'LTD' : finalSuffix === 'C-CORP' || finalSuffix === 'INC' ? 'C-CORP' : 'LLC',
                registeredAgent: selectedJurisdiction.agentLabel,
                registeredAddress: selectedJurisdiction.addressLabel,
                renewalDueDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                activity: cfActivity,
                ownerName: cfOwnerName.trim() || user.name,
                ownerEmail: cfOwnerEmail.trim() || user.email,
                passportUploaded: !!cfPassportFile,
                passportFileName: cfPassportFile,
                passportPreviewUrl: cfPassportPreview,
                packagePriceUsd: calculatedTotalUsd,
                addons: {
                  ein: cfAddonEin,
                  physicalAddressAgent: cfAddonAgent,
                  businessBank: cfAddonBank,
                  stripePayPal: cfAddonGateways
                },
                formationStage: 1,
                bankReady: false,
                gatewaysReady: false,
                notes: `${cfCfg.operatingAgreementTemplate.slice(0, 140)}`
              });

              setCfProposedName('');
              setCfPassportFile('');
              setCfPassportPreview('');
              setCfExtraDocsConfirmed([]);
              setCfWizardOpen(false);
            };

            const activeCompaniesCount = companies.filter(c => c.status === 'approved').length;
            const inProgressCompaniesCount = companies.filter(c => c.status !== 'approved').length;
            const issuedEinCount = companies.filter(c => !!c.ein).length;
            const readyGatewaysCount = companies.filter(c => c.bankReady || c.gatewaysReady || c.status === 'approved').length;

            return (
              <div className="space-y-6">
                {/* Top Header */}
                <div className="bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-xs">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-black text-[#92743A] uppercase tracking-wider">
                          {isAr ? 'الخدمات القانونية والتجارية الدولية' : 'International Corporate Formation'}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#F5F1E6] text-[#14243E] border border-[#D5B46B]/50">
                          US LLC & UK LTD
                        </span>
                      </div>
                      <h2 className="text-lg sm:text-xl font-black text-[#14243E] dark:text-white mt-1">
                        {isAr ? 'تأسيس وإدارة الشركات الدولية (US LLC & UK LTD)' : 'International Company Formation (US LLC & UK LTD)'}
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {isAr
                          ? 'احسب رسوم الولاية، قدّم طلب التأسيس، وتابع المراحل الخمس حتى استلام الحقيبة القانونية وربط المتجر والحساب البنكي'
                          : 'Calculate state fees, submit formation filings, and track all 5 legal milestones through EIN and store launch'}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
                      <button
                        type="button"
                        onClick={() => navigateToTab('company_formation_settings')}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[#D5B46B] bg-[#FBFAF6] hover:bg-[#F5F1E6] text-[#14243E] px-4 py-2.5 text-xs font-black cursor-pointer"
                      >
                        <span>{isAr ? '⚙️ إعدادات تأسيس الشركات' : '⚙️ Formation Settings'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCfWizardOpen(v => !v)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#14243E] hover:bg-[#1d3559] text-white px-4 py-2.5 text-xs font-black cursor-pointer shadow-xs"
                      >
                        <Plus className="w-4 h-4 text-[#D5B46B]" />
                        <span>{isAr ? '+ طلب تأسيس شركة جديدة' : '+ Request New Formation'}</span>
                      </button>
                    </div>
                  </div>

                  {/* 4 Top KPI Status Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-[#F8F7F2] dark:bg-slate-900 border border-[#EAE6DC] dark:border-slate-800">
                      <div className="text-xs text-slate-500 font-bold">{isAr ? 'الشركات النشطة' : 'Active Companies'}</div>
                      <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono mt-1">{activeCompaniesCount}</div>
                      <div className="text-[11px] text-emerald-600 font-bold mt-1">
                        {isAr ? `من أصل ${companies.length} شركة مسجلة` : `Out of ${companies.length} total entities`}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#F8F7F2] dark:bg-slate-900 border border-[#EAE6DC] dark:border-slate-800">
                      <div className="text-xs text-slate-500 font-bold">{isAr ? 'طلبات التأسيس قيد الإجراء' : 'Filings In Progress'}</div>
                      <div className="text-2xl font-black text-[#92743A] font-mono mt-1">{inProgressCompaniesCount}</div>
                      <div className="text-[11px] text-slate-500 font-bold mt-1">
                        {isAr ? 'قيد المراجعة الحكومية / IRS' : 'State / IRS Review'}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#F8F7F2] dark:bg-slate-900 border border-[#EAE6DC] dark:border-slate-800">
                      <div className="text-xs text-slate-500 font-bold">{isAr ? 'حالة الرقم الضريبي EIN' : 'IRS Federal EIN Status'}</div>
                      <div className="text-2xl font-black text-[#14243E] dark:text-white font-mono mt-1">{issuedEinCount}</div>
                      <div className="text-[11px] text-[#92743A] font-bold mt-1">
                        {isAr ? `${issuedEinCount} صادرة • ${Math.max(0, companies.length - issuedEinCount)} بانتظار IRS` : `${issuedEinCount} issued`}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#F8F7F2] dark:bg-slate-900 border border-[#EAE6DC] dark:border-slate-800">
                      <div className="text-xs text-slate-500 font-bold">{isAr ? 'الحسابات البنكية وبوابات الدفع' : 'Banking & Payment Gateways'}</div>
                      <div className="text-2xl font-black text-[#14243E] dark:text-[#D5B46B] font-mono mt-1">{readyGatewaysCount}</div>
                      <div className="text-[11px] text-emerald-700 font-bold mt-1">
                        {isAr ? `${banking.length} حساب Mercury/Wise • Stripe جاهز` : `${banking.length} Bank Accounts • Stripe Ready`}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interactive Formation Wizard & Pricing Calculator */}
                {cfWizardOpen && (
                  <form
                    onSubmit={handleSubmitNewFormation}
                    className="bg-white dark:bg-[#071D2B] border-2 border-[#D5B46B]/60 rounded-2xl p-6 space-y-5 shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#EAE6DC] dark:border-slate-800">
                      <div>
                        <h3 className="text-base font-black text-[#14243E] dark:text-white">
                          {isAr ? 'نموذج وحاسبة تأسيس شركة دولية جديدة' : 'Interactive Formation Wizard & Pricing Calculator'}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {isAr
                            ? 'يتم احتساب الرسوم تلقائياً وفق تسعيرة الولايات في إعدادات القسم، مع إصدار فاتورة فورية في الاشتراكات والفواتير'
                            : 'Pricing updates live from section settings and generates an invoice upon submission'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCfWizardOpen(false)}
                        className="text-xs font-bold text-slate-500 hover:text-[#14243E] self-start cursor-pointer"
                      >
                        {isAr ? 'طي الحاسبة' : 'Collapse'}
                      </button>
                    </div>

                    {/* Step 1: Country & State Jurisdiction Selector */}
                    <div className="space-y-2.5">
                      <label className="block text-xs font-black text-[#14243E] dark:text-white">
                        {isAr ? '1. اختر دولة التأسيس والولاية (مع رسوم الولاية المحدثة):' : '1. Select Country & State Jurisdiction:'}
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                        {jurisdictionCatalog.map(j => {
                          const selected = cfJurisdiction === j.id;
                          return (
                            <button
                              key={j.id}
                              type="button"
                              onClick={() => {
                                setCfJurisdiction(j.id);
                                setCfSuffix(j.defaultSuffix);
                              }}
                              className={`p-3.5 rounded-xl border-2 text-right transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                                selected
                                  ? 'border-[#14243E] bg-[#FBFAF6] dark:bg-slate-900 shadow-xs'
                                  : 'border-[#EAE6DC] dark:border-slate-800 hover:border-[#D5B46B]'
                              }`}
                            >
                              <div className="text-[10px] font-bold text-[#92743A]">{j.countryLabelAr}</div>
                              <div className="text-xs font-black text-[#14243E] dark:text-white">{isAr ? j.nameAr : j.nameEn}</div>
                              <div className="text-xs font-mono font-black text-emerald-700 dark:text-emerald-400">
                                {isAr ? `رسوم الولاية: $${j.fee}` : `State Fee: $${j.fee}`}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Step 2: Company & Owner Info + Passport Upload */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      <div className="lg:col-span-2">
                        <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                          {isAr ? 'الاسم المقترح للشركة' : 'Proposed Company Name'}
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            required
                            value={cfProposedName}
                            onChange={e => setCfProposedName(e.target.value)}
                            placeholder="QABS DIGITAL VENTURES"
                            className="flex-1 rounded-xl border border-[#EAE6DC] dark:border-slate-700 bg-[#F8F7F2] dark:bg-slate-900 px-3 py-2.5 font-mono"
                          />
                          <select
                            value={cfJurisdiction === 'UK_LTD' ? 'LTD' : cfSuffix}
                            onChange={e => setCfSuffix(e.target.value as 'LLC' | 'INC' | 'LTD' | 'C-CORP')}
                            disabled={cfJurisdiction === 'UK_LTD'}
                            className="rounded-xl border border-[#EAE6DC] dark:border-slate-700 bg-[#F8F7F2] dark:bg-slate-900 px-3 py-2.5 font-black text-[#14243E] dark:text-white"
                          >
                            <option value="LLC">LLC</option>
                            <option value="INC">INC</option>
                            <option value="C-CORP">C-CORP</option>
                            <option value="LTD">LTD</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                          {isAr ? 'نشاط الشركة' : 'Business Activity'}
                        </label>
                        <input
                          type="text"
                          value={cfActivity}
                          onChange={e => setCfActivity(e.target.value)}
                          className="w-full rounded-xl border border-[#EAE6DC] dark:border-slate-700 bg-[#F8F7F2] dark:bg-slate-900 px-3 py-2.5"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                          {isAr ? 'اسم المالك / الأعضاء' : 'Owner / Members Name'}
                        </label>
                        <input
                          type="text"
                          value={cfOwnerName}
                          onChange={e => setCfOwnerName(e.target.value)}
                          className="w-full rounded-xl border border-[#EAE6DC] dark:border-slate-700 bg-[#F8F7F2] dark:bg-slate-900 px-3 py-2.5"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                          {isAr ? 'البريد الرسمي للتأسيس' : 'Owner Email'}
                        </label>
                        <input
                          type="email"
                          value={cfOwnerEmail}
                          onChange={e => setCfOwnerEmail(e.target.value)}
                          className="w-full rounded-xl border border-[#EAE6DC] dark:border-slate-700 bg-[#F8F7F2] dark:bg-slate-900 px-3 py-2.5 font-mono"
                        />
                      </div>

                      <div className="lg:col-span-3">
                        <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                          {isAr ? 'رفع صورة جواز السفر (مطلوب للتحقق KYC)' : 'Upload Passport Copy (KYC)'}
                          {cfCfg.requiredDocuments.includes('passport') && (
                            <span className="text-rose-600 ms-1">* ({isAr ? 'إلزامي' : 'Required'})</span>
                          )}
                        </label>
                        <div className="flex flex-wrap items-center gap-3">
                          <label className="inline-flex items-center gap-2 rounded-xl border border-[#D5B46B] bg-[#FBFAF6] hover:bg-[#F5F1E6] px-4 py-2 text-xs font-black text-[#14243E] cursor-pointer">
                            <Upload className="w-3.5 h-3.5 text-[#92743A]" />
                            <span>{cfPassportFile ? cfPassportFile : isAr ? 'اختيار ملف جواز السفر (صورة / PDF)' : 'Choose Passport File'}</span>
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              className="hidden"
                              onChange={e => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                setCfPassportFile(file.name);
                                readImageAsDataUrl(file, url => setCfPassportPreview(url));
                              }}
                            />
                          </label>
                          {cfPassportFile && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {isAr ? 'تم إرفاق الوثيقة بنجاح' : 'Document attached'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Additional required documents from settings */}
                    {cfCfg.requiredDocuments.filter(d => d !== 'passport').length > 0 && (
                      <div className="p-3.5 rounded-xl bg-[#FBFAF6] dark:bg-slate-900 border border-[#EAE6DC] dark:border-slate-800 space-y-2 text-xs">
                        <div className="font-black text-[#14243E] dark:text-white">
                          {isAr ? 'المستندات الإلزامية الإضافية المحددة في إعدادات القسم:' : 'Additional Required Documents from Settings:'}
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {cfCfg.requiredDocuments
                            .filter(d => d !== 'passport')
                            .map(req => {
                              const checked = cfExtraDocsConfirmed.includes(req);
                              return (
                                <label key={req} className="inline-flex items-center gap-2 font-bold cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() =>
                                      setCfExtraDocsConfirmed(prev =>
                                        checked ? prev.filter(item => item !== req) : [...prev, req]
                                      )
                                    }
                                  />
                                  <span>{isAr ? requiredDocLabels[req].ar : requiredDocLabels[req].en}</span>
                                </label>
                              );
                            })}
                        </div>
                      </div>
                    )}

                    {/* Step 3: Additional Services */}
                    <div className="space-y-2.5">
                      <div className="text-xs font-black text-[#14243E] dark:text-white">
                        {isAr ? '2. اختر الخدمات الإضافية للتأسيس:' : '2. Select Additional Formation Services:'}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                        <label className="p-3 rounded-xl border border-[#EAE6DC] dark:border-slate-800 bg-[#F8F7F2] dark:bg-slate-900 flex items-start gap-2.5 cursor-pointer">
                          <input type="checkbox" checked={cfAddonEin} onChange={e => setCfAddonEin(e.target.checked)} className="mt-0.5" />
                          <div>
                            <div className="font-black text-[#14243E] dark:text-white">{isAr ? 'الرقم الضريبي الفيدرالي EIN' : 'Federal IRS EIN'}</div>
                            <div className="text-[11px] font-mono text-[#92743A] font-bold">+${cfCfg.einFeeUsd}</div>
                          </div>
                        </label>

                        <label className="p-3 rounded-xl border border-[#EAE6DC] dark:border-slate-800 bg-[#F8F7F2] dark:bg-slate-900 flex items-start gap-2.5 cursor-pointer">
                          <input type="checkbox" checked={cfAddonAgent} onChange={e => setCfAddonAgent(e.target.checked)} className="mt-0.5" />
                          <div>
                            <div className="font-black text-[#14243E] dark:text-white">{isAr ? 'عنوان أمريكي ووكيل مسجل' : 'Physical Address & Registered Agent'}</div>
                            <div className="text-[11px] font-mono text-[#92743A] font-bold">+${cfCfg.registeredAgentFeeUsd}</div>
                          </div>
                        </label>

                        <label className="p-3 rounded-xl border border-[#EAE6DC] dark:border-slate-800 bg-[#F8F7F2] dark:bg-slate-900 flex items-start gap-2.5 cursor-pointer">
                          <input type="checkbox" checked={cfAddonBank} onChange={e => setCfAddonBank(e.target.checked)} className="mt-0.5" />
                          <div>
                            <div className="font-black text-[#14243E] dark:text-white">{isAr ? 'فتح حساب بنكي (Mercury / Relay)' : 'Mercury / Relay Business Bank'}</div>
                            <div className="text-[11px] font-mono text-[#92743A] font-bold">+$75</div>
                          </div>
                        </label>

                        <label className="p-3 rounded-xl border border-[#EAE6DC] dark:border-slate-800 bg-[#F8F7F2] dark:bg-slate-900 flex items-start gap-2.5 cursor-pointer">
                          <input type="checkbox" checked={cfAddonGateways} onChange={e => setCfAddonGateways(e.target.checked)} className="mt-0.5" />
                          <div>
                            <div className="font-black text-[#14243E] dark:text-white">{isAr ? 'تجهيز ربط Stripe و PayPal' : 'Stripe & PayPal Setup'}</div>
                            <div className="text-[11px] font-mono text-[#92743A] font-bold">+$49</div>
                          </div>
                        </label>
                      </div>
                    </div>

                    {cfFormError && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{cfFormError}</span>
                      </div>
                    )}

                    {/* Pricing Summary & Submit Bar */}
                    <div className="p-4 rounded-2xl bg-[#14243E] text-white flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="text-[11px] text-[#D5B46B] font-bold">
                          {isAr ? 'ملخص التسعيرة التلقائية الحية:' : 'Live Formation Fee Breakdown:'}
                        </div>
                        <div className="text-xs text-slate-200 flex flex-wrap items-center gap-3">
                          <span>{isAr ? `أتعاب التأسيس: $${cfCfg.baseServiceFeeUsd}` : `Base Fee: $${cfCfg.baseServiceFeeUsd}`}</span>
                          <span>•</span>
                          <span>{isAr ? `رسوم ${selectedJurisdiction.nameAr}: $${selectedJurisdiction.fee}` : `State: $${selectedJurisdiction.fee}`}</span>
                          <span>•</span>
                          <span>{isAr ? `الإضافات: $${einAddonCost + agentAddonCost + bankAddonCost + gatewaysAddonCost}` : `Add-ons: $${einAddonCost + agentAddonCost + bankAddonCost + gatewaysAddonCost}`}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4">
                        <div className="text-right">
                          <div className="text-2xl font-black text-[#D5B46B] font-mono">${calculatedTotalUsd} USD</div>
                          <div className="text-[11px] text-slate-300 font-mono">≈ {Math.round(calculatedTotalUsd * 3.75).toLocaleString()} SAR</div>
                        </div>
                        <button
                          type="submit"
                          className="px-5 py-3 rounded-xl bg-[#D5B46B] hover:bg-[#c5a155] text-[#14243E] text-xs font-black cursor-pointer shadow-sm"
                        >
                          {isAr ? 'إرسال طلب التأسيس وإصدار الفاتورة ←' : 'Submit Formation Request →'}
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* Filter Tabs */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 rounded-2xl p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCompanyFilter('all')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                        companyFilter === 'all' ? 'bg-[#14243E] text-white' : 'bg-[#F8F7F2] text-slate-600'
                      }`}
                    >
                      {isAr ? 'جميع الشركات' : 'All Companies'} ({companies.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setCompanyFilter('approved')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                        companyFilter === 'approved' ? 'bg-[#14243E] text-white' : 'bg-[#F8F7F2] text-slate-600'
                      }`}
                    >
                      {isAr ? 'المكتملة والمعتمدة' : 'Approved'} ({activeCompaniesCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setCompanyFilter('in_progress')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                        companyFilter === 'in_progress' ? 'bg-[#14243E] text-white' : 'bg-[#F8F7F2] text-slate-600'
                      }`}
                    >
                      {isAr ? 'قيد الإجراء والمتابعة' : 'In Progress'} ({inProgressCompaniesCount})
                    </button>
                  </div>
                  <div className="text-[11px] font-bold text-[#92743A]">
                    {cfCfg.autoAnnualReportReminder
                      ? isAr
                        ? `تنبيه التجديد السنوي مفعّل قبل ${cfCfg.annualRenewalAlertDays} يوماً`
                        : `Annual alert: ${cfCfg.annualRenewalAlertDays} days prior`
                      : isAr
                      ? 'التنبيه الآلي متوقف'
                      : 'Auto alert off'}
                  </div>
                </div>

                {/* Companies Formation Tracker & Cards */}
                <div className="space-y-5">
                  {companies
                    .filter(comp => {
                      if (companyFilter === 'approved') return comp.status === 'approved';
                      if (companyFilter === 'in_progress') return comp.status !== 'approved';
                      return true;
                    })
                    .map(comp => {
                      const stage = comp.formationStage ?? (comp.status === 'approved' ? 5 : comp.status === 'submitted_to_state' ? 2 : 1);
                      const stagePct = Math.round((stage / 5) * 100);
                      return (
                        <div
                          key={comp.id}
                          className="bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5"
                        >
                          {/* Company Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EAE6DC] dark:border-slate-800">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-2xl bg-[#14243E] text-[#D5B46B] font-black flex items-center justify-center shrink-0">
                                <Building2 className="w-6 h-6" />
                              </div>
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="text-base sm:text-lg font-black text-[#14243E] dark:text-white">
                                    {comp.companyName}
                                  </h3>
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#F5F1E6] text-[#92743A]">
                                    {comp.entityType}
                                  </span>
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                    {comp.jurisdiction.replace('US_', '').replace('_', ' ')}
                                  </span>
                                </div>
                                <div className="text-xs text-slate-500 mt-0.5">
                                  {isAr ? 'تاريخ التقديم:' : 'Filed:'} <span className="font-mono">{comp.filingDate}</span>
                                  {comp.packagePriceUsd ? ` • $${comp.packagePriceUsd} USD` : ''}
                                  {comp.ownerName ? ` • ${comp.ownerName}` : ''}
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-black ${
                                  comp.status === 'approved'
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                }`}
                              >
                                {comp.status === 'approved'
                                  ? isAr
                                    ? 'مكتملة ومعتمدة رسمياً ✓'
                                    : 'Completed & Active ✓'
                                  : isAr
                                  ? `المرحلة ${stage} من 5 — قيد التنفيذ`
                                  : `Stage ${stage}/5 — In Progress`}
                              </span>
                              {stage < 5 && (
                                <button
                                  type="button"
                                  onClick={() => advanceCompanyStage(comp.id)}
                                  className="px-3.5 py-1.5 rounded-xl bg-[#14243E] hover:bg-[#1d3559] text-white text-xs font-black cursor-pointer"
                                >
                                  {isAr ? 'ترقية المرحلة التالية ←' : 'Advance Stage →'}
                                </button>
                              )}
                            </div>
                          </div>

                          {/* 5-Stage Interactive Formation Progress Tracker */}
                          <div className="p-4 rounded-2xl bg-[#FBFAF6] dark:bg-slate-900 border border-[#EAE6DC] dark:border-slate-800 space-y-3">
                            <div className="flex items-center justify-between text-xs font-black text-[#14243E] dark:text-white">
                              <span>{isAr ? 'جدول متابعة مراحل التأسيس الخمس' : '5-Stage Formation Progress Tracker'}</span>
                              <span className="font-mono text-[#92743A]">{stagePct}%</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-[#EAE6DC] dark:bg-slate-800 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[#14243E] to-[#D5B46B] transition-all duration-300"
                                style={{ width: `${stagePct}%` }}
                              />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                              {stageLabels.map(st => {
                                const done = stage >= st.step;
                                const isCurrent = stage === st.step;
                                return (
                                  <button
                                    key={st.step}
                                    type="button"
                                    onClick={() => advanceCompanyStage(comp.id, st.step as 1 | 2 | 3 | 4 | 5)}
                                    className={`p-2.5 rounded-xl border text-right text-[11px] font-bold transition-all cursor-pointer flex items-center gap-2 ${
                                      done
                                        ? 'border-emerald-300 bg-emerald-50/70 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200'
                                        : isCurrent
                                        ? 'border-[#D5B46B] bg-white text-[#14243E]'
                                        : 'border-[#EAE6DC] bg-white/70 text-slate-400'
                                    }`}
                                  >
                                    {done ? (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    ) : (
                                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    )}
                                    <span className="leading-tight">{isAr ? st.titleAr : st.titleEn}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Official Registration Data Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-[#F8F7F2] dark:bg-slate-900 border border-[#EAE6DC] dark:border-slate-800 text-xs">
                            <div>
                              <span className="text-slate-400 block text-[11px]">{isAr ? 'رقم قيد الولاية / CRN' : 'State File / CRN'}</span>
                              <span className="font-mono font-bold text-[#14243E] dark:text-[#D5B46B] mt-0.5 block">
                                {comp.stateFileNumber || comp.crn || (isAr ? 'قيد الإصدار' : 'Pending')}
                              </span>
                            </div>

                            <div>
                              <div className="flex items-center justify-between">
                                <span className="text-slate-400 text-[11px]">{isAr ? 'الرقم الضريبي الفيدرالي EIN' : 'IRS Federal EIN'}</span>
                                {comp.ein && (
                                  <button
                                    type="button"
                                    onClick={() => copyToClipboard(comp.ein!, comp.id + '_ein')}
                                    className="text-[10px] text-[#92743A] hover:underline flex items-center gap-1 cursor-pointer"
                                  >
                                    <Copy className="w-3 h-3" />
                                    <span>{copiedText === comp.id + '_ein' ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ' : 'Copy')}</span>
                                  </button>
                                )}
                              </div>
                              <span className="font-mono font-bold text-[#14243E] dark:text-[#D5B46B] mt-0.5 block">
                                {comp.ein || (isAr ? 'بانتظار خطاب IRS' : 'Pending CP575')}
                              </span>
                            </div>

                            <div>
                              <span className="text-slate-400 block text-[11px]">{isAr ? 'الوكيل المسجل والعنوان' : 'Registered Agent'}</span>
                              <span className="font-medium text-slate-700 dark:text-slate-300 mt-0.5 block truncate" title={comp.registeredAddress}>
                                {comp.registeredAddress}
                              </span>
                            </div>

                            <div>
                              <span className="text-slate-400 block text-[11px]">{isAr ? 'موعد التجديد السنوي' : 'Annual Renewal Due'}</span>
                              <span className="font-mono font-bold text-[#92743A] mt-0.5 block">{comp.renewalDueDate}</span>
                            </div>
                          </div>

                          {/* Official Documents Vault Preview */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-black text-[#14243E] dark:text-white flex items-center gap-1.5">
                                <FileCheck className="w-4 h-4 text-[#92743A]" />
                                <span>{isAr ? 'الحقيبة القانونية ووثائق الشركة' : 'Legal Documents Kit'}</span>
                              </h4>
                              <button
                                type="button"
                                onClick={() => navigateToTab('documents')}
                                className="text-[11px] font-black text-[#92743A] hover:underline cursor-pointer"
                              >
                                {isAr ? 'عرض كل الملفات في قسم المستندات ←' : 'Open in Documents →'}
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                              {comp.documents.map((doc, dIdx) => (
                                <div
                                  key={dIdx}
                                  className="p-3 rounded-xl border border-[#EAE6DC] dark:border-slate-800 bg-white dark:bg-[#061824] flex items-center justify-between gap-2"
                                >
                                  <div className="min-w-0">
                                    <div className="text-xs font-bold text-[#14243E] dark:text-white truncate">{doc.name}</div>
                                    <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                                      {doc.status === 'ready' ? (isAr ? 'جاهز ✓' : 'Ready ✓') : (isAr ? 'قيد الإصدار' : 'Pending')}
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setViewingDoc({
                                        docName: doc.name,
                                        companyName: comp.companyName,
                                        type: doc.type,
                                        date: doc.date,
                                        jurisdiction: comp.jurisdiction,
                                        ein: comp.ein,
                                        fileNumber: comp.stateFileNumber || comp.crn
                                      })
                                    }
                                    className="px-2.5 py-1.5 rounded-lg bg-[#F5F1E6] text-[#14243E] text-[11px] font-bold shrink-0 cursor-pointer"
                                  >
                                    {isAr ? 'معاينة' : 'View'}
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Linked Store & Banking Footer */}
                          <div className="pt-3 border-t border-[#EAE6DC] dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{comp.bankReady || comp.status === 'approved' ? 'Mercury / Relay Ready' : 'Mercury / Relay Pending'}</span>
                              </span>
                              <span className="px-2.5 py-1 rounded-lg bg-[#F5F1E6] text-[#92743A] font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{comp.gatewaysReady || comp.status === 'approved' ? 'Stripe & PayPal Ready' : 'Gateways Pending'}</span>
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => navigateToTab('my_stores')}
                              className="px-3 py-1.5 rounded-lg bg-[#14243E] text-white font-bold text-xs cursor-pointer hover:bg-[#1d3559]"
                            >
                              {comp.linkedStoreId
                                ? isAr ? 'فتح المتجر المرتبط تلقائياً ←' : 'Open Linked Store →'
                                : isAr ? 'ربط بمتجر في متاجري ←' : 'Link in My Stores →'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            );
          })()}

          {activeTab === 'company_formation_settings' && (
            <div className="space-y-6">
              {renderSettingsPageHeader('company_formation', 'تأسيس الشركات', 'Company Formation', () => {
                updateSectionSettings('companyFormation', cfDraft);
              })}

              {/* Card 1: Pricing & State Fees */}
              <div className="bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-xs">
                <div>
                  <h3 className="text-base font-black text-[#14243E] dark:text-white">
                    {isAr ? 'رسوم التأسيس الأساسية ورسوم كل ولاية ($ USD)' : 'Base Formation & State Filing Fees ($ USD)'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isAr
                      ? 'أي تعديل هنا يتحدث فوراً في حاسبة تأسيس الشركة وفي صفحة طلب التأسيس'
                      : 'Changes immediately update the formation wizard and pricing calculator'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">{isAr ? 'أتعاب التأسيس الأساسية ($)' : 'Base Service Fee ($)'}</label>
                    <input
                      type="number"
                      min={0}
                      value={cfDraft.baseServiceFeeUsd}
                      onChange={e => setCfDraft(d => ({ ...d, baseServiceFeeUsd: Math.max(0, Number(e.target.value) || 0) }))}
                      className="w-full rounded-xl border border-[#EAE6DC] bg-[#F8F7F2] px-3 py-2.5 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">{isAr ? 'رسوم إصدار EIN ($)' : 'EIN Add-on Fee ($)'}</label>
                    <input
                      type="number"
                      min={0}
                      value={cfDraft.einFeeUsd}
                      onChange={e => setCfDraft(d => ({ ...d, einFeeUsd: Math.max(0, Number(e.target.value) || 0) }))}
                      className="w-full rounded-xl border border-[#EAE6DC] bg-[#F8F7F2] px-3 py-2.5 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">{isAr ? 'رسوم الوكيل المسجل والعنوان ($)' : 'Registered Agent Fee ($)'}</label>
                    <input
                      type="number"
                      min={0}
                      value={cfDraft.registeredAgentFeeUsd}
                      onChange={e => setCfDraft(d => ({ ...d, registeredAgentFeeUsd: Math.max(0, Number(e.target.value) || 0) }))}
                      className="w-full rounded-xl border border-[#EAE6DC] bg-[#F8F7F2] px-3 py-2.5 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">{isAr ? 'التنبيه قبل التجديد (يوم)' : 'Renewal Alert Lead (Days)'}</label>
                    <input
                      type="number"
                      min={1}
                      value={cfDraft.annualRenewalAlertDays}
                      onChange={e => setCfDraft(d => ({ ...d, annualRenewalAlertDays: Math.max(1, Number(e.target.value) || 30) }))}
                      className="w-full rounded-xl border border-[#EAE6DC] bg-[#F8F7F2] px-3 py-2.5 font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs pt-2 border-t border-[#EAE6DC]">
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Kentucky ($)</label>
                    <input
                      type="number"
                      min={0}
                      value={cfDraft.stateFees.US_KENTUCKY}
                      onChange={e => setCfDraft(d => ({ ...d, stateFees: { ...d.stateFees, US_KENTUCKY: Math.max(0, Number(e.target.value) || 0) } }))}
                      className="w-full rounded-xl border border-[#EAE6DC] bg-[#F8F7F2] px-3 py-2 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Wyoming ($)</label>
                    <input
                      type="number"
                      min={0}
                      value={cfDraft.stateFees.US_WYOMING}
                      onChange={e => setCfDraft(d => ({ ...d, stateFees: { ...d.stateFees, US_WYOMING: Math.max(0, Number(e.target.value) || 0) } }))}
                      className="w-full rounded-xl border border-[#EAE6DC] bg-[#F8F7F2] px-3 py-2 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Delaware ($)</label>
                    <input
                      type="number"
                      min={0}
                      value={cfDraft.stateFees.US_DELAWARE}
                      onChange={e => setCfDraft(d => ({ ...d, stateFees: { ...d.stateFees, US_DELAWARE: Math.max(0, Number(e.target.value) || 0) } }))}
                      className="w-full rounded-xl border border-[#EAE6DC] bg-[#F8F7F2] px-3 py-2 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">New Mexico ($)</label>
                    <input
                      type="number"
                      min={0}
                      value={cfDraft.stateFees.US_NEW_MEXICO}
                      onChange={e => setCfDraft(d => ({ ...d, stateFees: { ...d.stateFees, US_NEW_MEXICO: Math.max(0, Number(e.target.value) || 0) } }))}
                      className="w-full rounded-xl border border-[#EAE6DC] bg-[#F8F7F2] px-3 py-2 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">UK LTD ($)</label>
                    <input
                      type="number"
                      min={0}
                      value={cfDraft.stateFees.UK_LTD}
                      onChange={e => setCfDraft(d => ({ ...d, stateFees: { ...d.stateFees, UK_LTD: Math.max(0, Number(e.target.value) || 0) } }))}
                      className="w-full rounded-xl border border-[#EAE6DC] bg-[#F8F7F2] px-3 py-2 font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Annual Renewals, Required Documents & Auto-Linking */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-xs text-xs">
                  <h3 className="text-base font-black text-[#14243E] dark:text-white">
                    {isAr ? 'التجديد السنوي والربط التلقائي عند الاكتمال' : 'Annual Reminders & Completion Automation'}
                  </h3>

                  <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#F8F7F2] border border-[#EAE6DC] cursor-pointer">
                    <span className="font-bold text-[#14243E]">{isAr ? 'تنبيه آلي بموعد التقرير السنوي للولاية (Annual Report)' : 'Auto Annual Report Filing Reminder'}</span>
                    <input type="checkbox" checked={cfDraft.autoAnnualReportReminder} onChange={e => setCfDraft(d => ({ ...d, autoAnnualReportReminder: e.target.checked }))} />
                  </label>

                  <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#F8F7F2] border border-[#EAE6DC] cursor-pointer">
                    <span className="font-bold text-[#14243E]">{isAr ? 'تنبيه آلي بتجديد الوكيل المسجل (Registered Agent)' : 'Auto Registered Agent Renewal Reminder'}</span>
                    <input type="checkbox" checked={cfDraft.autoAgentRenewalReminder} onChange={e => setCfDraft(d => ({ ...d, autoAgentRenewalReminder: e.target.checked }))} />
                  </label>

                  <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#FBFAF6] border border-[#D5B46B]/60 cursor-pointer">
                    <span className="font-bold text-[#14243E]">{isAr ? 'إنشاء متجر تلقائي في "متاجري" فور اكتمال تأسيس الشركة' : 'Auto-create Store in My Stores upon completion'}</span>
                    <input type="checkbox" checked={cfDraft.autoCreateStoreOnCompletion} onChange={e => setCfDraft(d => ({ ...d, autoCreateStoreOnCompletion: e.target.checked }))} />
                  </label>

                  <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#FBFAF6] border border-[#D5B46B]/60 cursor-pointer">
                    <span className="font-bold text-[#14243E]">{isAr ? 'توليد مجلد وثائق رسمي في "المستندات" تلقائياً' : 'Auto-generate Legal Kit Folder in Documents'}</span>
                    <input type="checkbox" checked={cfDraft.autoCreateDocsFolderOnCompletion} onChange={e => setCfDraft(d => ({ ...d, autoCreateDocsFolderOnCompletion: e.target.checked }))} />
                  </label>
                </div>

                <div className="bg-white dark:bg-[#071D2B] border border-[#EAE6DC] dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-xs text-xs">
                  <h3 className="text-base font-black text-[#14243E] dark:text-white">
                    {isAr ? 'المستندات الإلزامية وقالب عقد التأسيس (Operating Agreement)' : 'Required KYC Documents & Operating Agreement'}
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {([
                      { id: 'passport', labelAr: 'صورة جواز السفر', labelEn: 'Passport Copy' },
                      { id: 'proof_of_address', labelAr: 'إثبات العنوان السكني', labelEn: 'Proof of Address' },
                      { id: 'business_plan', labelAr: 'خطة العمل', labelEn: 'Business Plan' },
                      { id: 'source_of_funds', labelAr: 'إقرار مصدر الأموال', labelEn: 'Source of Funds' }
                    ] as const).map(docOpt => {
                      const active = cfDraft.requiredDocuments.includes(docOpt.id);
                      return (
                        <button
                          key={docOpt.id}
                          type="button"
                          onClick={() =>
                            setCfDraft(d => ({
                              ...d,
                              requiredDocuments: active
                                ? d.requiredDocuments.filter(item => item !== docOpt.id)
                                : [...d.requiredDocuments, docOpt.id]
                            }))
                          }
                          className={`px-3 py-2 rounded-xl border font-bold cursor-pointer ${
                            active ? 'bg-[#14243E] text-white border-[#14243E]' : 'bg-[#F8F7F2] text-slate-600 border-[#EAE6DC]'
                          }`}
                        >
                          {active ? '✓ ' : ''}{isAr ? docOpt.labelAr : docOpt.labelEn}
                        </button>
                      );
                    })}
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 mb-1">
                      {isAr ? 'نص قالب عقد التأسيس الافتراضي (Operating Agreement Template)' : 'Operating Agreement Template'}
                    </label>
                    <textarea
                      rows={4}
                      value={cfDraft.operatingAgreementTemplate}
                      onChange={e => setCfDraft(d => ({ ...d, operatingAgreementTemplate: e.target.value }))}
                      className="w-full rounded-xl border border-[#EAE6DC] bg-[#F8F7F2] px-3 py-2.5 leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DOCUMENT PREVIEW MODAL */}
          {viewingDoc && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
              <div className={`bg-white dark:bg-[#071D2B] border-2 ${sectionSettings.documents.officialTemplateStyle === 'executive_gold' ? 'border-[#D5B46B]' : sectionSettings.documents.officialTemplateStyle === 'modern_clean' ? 'border-[#14243E]' : 'border-slate-400'} rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative`}>
                <button
                  onClick={() => setViewingDoc(null)}
                  className="absolute top-5 left-5 rtl:left-auto rtl:right-5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Certificate Header */}
                <div className="text-center space-y-2 border-b-2 border-[#D5B46B]/40 pb-5">
                  {sectionSettings.documents.logoDataUrl ? (
                    <img src={sectionSettings.documents.logoDataUrl} alt="Company Logo" className="h-14 mx-auto object-contain mb-1" />
                  ) : (
                    <div className="inline-block p-3 rounded-2xl bg-[#14243E] text-[#D5B46B] font-mono shadow-md mb-1">
                      <ShieldCheck className="w-8 h-8" />
                    </div>
                  )}
                  <div className="text-xs uppercase font-extrabold tracking-widest text-[#92743A]">
                    Official Certified Corporate Document ({sectionSettings.documents.officialTemplateStyle})
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-[#14243E] dark:text-white">
                    {viewingDoc.docName}
                  </h3>
                  <div className="text-xs text-slate-500 font-mono">
                    Jurisdiction: {viewingDoc.jurisdiction || 'US / UK Registry'}
                  </div>
                </div>

                {/* Certificate Body */}
                <div className="p-6 rounded-2xl bg-[#FBFAF6] dark:bg-slate-900/80 border border-[#EAE6DC] dark:border-slate-800 space-y-4 text-xs font-mono leading-relaxed">
                  <div className="flex items-center justify-between border-b border-[#EAE6DC] pb-2">
                    <span className="font-bold text-slate-500">ENTITY LEGAL NAME:</span>
                    <span className="font-black text-[#14243E] dark:text-[#D5B46B]">{viewingDoc.companyName}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#EAE6DC] pb-2">
                    <span className="font-bold text-slate-500">REGISTRATION FILE NUMBER:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{viewingDoc.fileNumber || 'QBS-REG-2026'}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#EAE6DC] pb-2">
                    <span className="font-bold text-slate-500">IRS FEDERAL EIN:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{viewingDoc.ein || 'Applied / Pending'}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#EAE6DC] pb-2">
                    <span className="font-bold text-slate-500">DATE OF CERTIFICATION:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{viewingDoc.date}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-500">OFFICIAL SEAL:</span>
                    <span className="font-bold text-emerald-700">{sectionSettings.documents.companyStampText}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                  <div className="flex items-center gap-2">
                    {sectionSettings.documents.stampDataUrl && (
                      <img src={sectionSettings.documents.stampDataUrl} alt="Official Stamp" className="h-10 object-contain rounded border p-0.5" />
                    )}
                    <span className="text-[11px] text-slate-400 font-mono">
                      {sectionSettings.documents.companyStampText}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {sectionSettings.documents.allowedExportFormats.includes('PDF') && (
                      <button
                        onClick={() => window.print()}
                        className="px-4 py-2 rounded-xl bg-[#F8F7F2] border border-[#EAE6DC] text-[#14243E] text-xs font-bold cursor-pointer flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5 text-[#92743A]" />
                        <span>{isAr ? 'طباعة / PDF' : 'Print / PDF'}</span>
                      </button>
                    )}
                    <button
                      onClick={() => setViewingDoc(null)}
                      className="px-5 py-2 rounded-xl bg-[#14243E] text-white text-xs font-black cursor-pointer hover:bg-[#1d3559]"
                    >
                      {isAr ? 'إغلاق' : 'Close'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PRODUCT ADD / EDIT MODAL */}
          {productModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
              <div className="bg-white dark:bg-[#071D2B] border border-[#D5B46B] rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-[#EAE6DC] dark:border-slate-800 pb-3">
                  <h3 className="text-base font-black text-[#14243E] dark:text-white">
                    {editingProduct
                      ? isAr
                        ? 'تعديل بيانات المنتج والمخزون'
                        : 'Edit Product & Inventory'
                      : isAr
                      ? '+ إضافة منتج جديد للمتجر'
                      : '+ Add New Store Product'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setProductModalOpen(false)}
                    className="p-1.5 rounded-lg bg-[#F8F7F2] text-slate-500 hover:text-[#14243E] cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleProductModalSubmit} className="space-y-3.5 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-600 mb-1">{isAr ? 'اسم المنتج (عربي) *' : 'Product Name (AR) *'}</label>
                      <input
                        type="text"
                        required
                        value={prodNameAr}
                        onChange={e => setProdNameAr(e.target.value)}
                        placeholder={isAr ? 'مثال: عطر العود الملكي' : 'Royal Oud Perfume'}
                        className="w-full rounded-xl border border-[#EAE6DC] dark:border-slate-700 bg-[#F8F7F2] dark:bg-slate-900 px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-600 mb-1">{isAr ? 'اسم المنتج (إنجليزي)' : 'Product Name (EN)'}</label>
                      <input
                        type="text"
                        value={prodNameEn}
                        onChange={e => setProdNameEn(e.target.value)}
                        placeholder="Royal Oud Edition"
                        className="w-full rounded-xl border border-[#EAE6DC] dark:border-slate-700 bg-[#F8F7F2] dark:bg-slate-900 px-3 py-2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-600 mb-1">{isAr ? `السعر (${currentStore.currency}) *` : `Price (${currentStore.currency}) *`}</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={prodPrice}
                        onChange={e => setProdPrice(e.target.value)}
                        className="w-full rounded-xl border border-[#EAE6DC] dark:border-slate-700 bg-[#F8F7F2] dark:bg-slate-900 px-3 py-2 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-600 mb-1">{isAr ? 'كمية المخزون *' : 'Stock Quantity *'}</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={prodStock}
                        onChange={e => setProdStock(e.target.value)}
                        className="w-full rounded-xl border border-[#EAE6DC] dark:border-slate-700 bg-[#F8F7F2] dark:bg-slate-900 px-3 py-2 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-600 mb-1">{isAr ? 'حالة المنتج' : 'Status'}</label>
                      <select
                        value={prodStatus}
                        onChange={e => setProdStatus(e.target.value as 'active' | 'draft' | 'out_of_stock')}
                        className="w-full rounded-xl border border-[#EAE6DC] dark:border-slate-700 bg-[#F8F7F2] dark:bg-slate-900 px-3 py-2 font-bold"
                      >
                        <option value="active">{isAr ? 'نشط (active)' : 'Active'}</option>
                        <option value="draft">{isAr ? 'مسودة (draft)' : 'Draft'}</option>
                        <option value="out_of_stock">{isAr ? 'نفد المخزون' : 'Out of stock'}</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-600 mb-1">{isAr ? 'التكلفة' : 'Cost'}</label>
                      <input
                        type="number"
                        value={prodCost}
                        onChange={e => setProdCost(e.target.value)}
                        className="w-full rounded-xl border border-[#EAE6DC] dark:border-slate-700 bg-[#F8F7F2] dark:bg-slate-900 px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-600 mb-1">SKU</label>
                      <input
                        type="text"
                        value={prodSku}
                        onChange={e => setProdSku(e.target.value)}
                        className="w-full rounded-xl border border-[#EAE6DC] dark:border-slate-700 bg-[#F8F7F2] dark:bg-slate-900 px-3 py-2 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-600 mb-1">{isAr ? 'التصنيف' : 'Category'}</label>
                      <input
                        type="text"
                        value={prodCategory}
                        onChange={e => setProdCategory(e.target.value)}
                        className="w-full rounded-xl border border-[#EAE6DC] dark:border-slate-700 bg-[#F8F7F2] dark:bg-slate-900 px-3 py-2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 mb-1">{isAr ? 'رابط صورة المنتج' : 'Product Image URL'}</label>
                    <input
                      type="text"
                      value={prodImage}
                      onChange={e => setProdImage(e.target.value)}
                      className="w-full rounded-xl border border-[#EAE6DC] dark:border-slate-700 bg-[#F8F7F2] dark:bg-slate-900 px-3 py-2 font-mono text-[11px]"
                    />
                    <div className="flex items-center gap-2 mt-2">
                      {[
                        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80',
                        'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=400&q=80',
                        'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=400&q=80',
                        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400&q=80'
                      ].map(url => (
                        <button
                          key={url}
                          type="button"
                          onClick={() => setProdImage(url)}
                          className={`w-10 h-10 rounded-lg overflow-hidden border-2 cursor-pointer ${prodImage === url ? 'border-[#14243E]' : 'border-transparent'}`}
                        >
                          <img src={url} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EAE6DC] dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setProductModalOpen(false)}
                      className="px-4 py-2 rounded-xl border border-[#EAE6DC] text-slate-600 font-bold cursor-pointer"
                    >
                      {isAr ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-[#14243E] text-white font-black cursor-pointer hover:bg-[#1d3559]"
                    >
                      {editingProduct ? (isAr ? 'حفظ التعديلات' : 'Save Changes') : isAr ? 'حفظ وإضافة المنتج' : 'Save Product'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* NEW ORDER MODAL (AUTO STOCK DEDUCTION) */}
          {newOrderModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
              <div className="bg-white dark:bg-[#071D2B] border border-[#D5B46B] rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-[#EAE6DC] dark:border-slate-800 pb-3">
                  <h3 className="text-base font-black text-[#14243E] dark:text-white">
                    {isAr ? '+ إنشاء طلب جديد (يخصم المخزون تلقائياً)' : '+ Create New Order (Auto-Deduct Stock)'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setNewOrderModalOpen(false)}
                    className="p-1.5 rounded-lg bg-[#F8F7F2] text-slate-500 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleNewOrderSubmit} className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-600 mb-1">{isAr ? 'اسم العميل *' : 'Customer Name *'}</label>
                      <input
                        type="text"
                        required
                        value={newOrdCustomerName}
                        onChange={e => setNewOrdCustomerName(e.target.value)}
                        placeholder={isAr ? 'مثال: خالد الدوسري' : 'Customer Name'}
                        className="w-full rounded-xl border border-[#EAE6DC] bg-[#F8F7F2] dark:bg-slate-900 px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-600 mb-1">{isAr ? 'بريد العميل' : 'Customer Email'}</label>
                      <input
                        type="email"
                        value={newOrdCustomerEmail}
                        onChange={e => setNewOrdCustomerEmail(e.target.value)}
                        placeholder="client@domain.com"
                        className="w-full rounded-xl border border-[#EAE6DC] bg-[#F8F7F2] dark:bg-slate-900 px-3 py-2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 mb-1">{isAr ? 'اختر المنتج *' : 'Select Product *'}</label>
                    <select
                      value={newOrdProductId}
                      onChange={e => setNewOrdProductId(e.target.value)}
                      className="w-full rounded-xl border border-[#EAE6DC] bg-[#F8F7F2] dark:bg-slate-900 px-3 py-2.5 font-bold"
                    >
                      {storeProducts.map(p => (
                        <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                          {(isAr ? p.nameAr || p.titleAr : p.nameEn || p.titleEn)} — {p.price} {currentStore.currency} ({isAr ? `متوفر: ${p.stock}` : `Stock: ${p.stock}`})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-600 mb-1">{isAr ? 'الكمية' : 'Quantity'}</label>
                      <input
                        type="number"
                        min="1"
                        value={newOrdQuantity}
                        onChange={e => setNewOrdQuantity(e.target.value)}
                        className="w-full rounded-xl border border-[#EAE6DC] bg-[#F8F7F2] dark:bg-slate-900 px-3 py-2 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-600 mb-1">{isAr ? 'بوابة الدفع' : 'Payment Gateway'}</label>
                      <select
                        value={newOrdGateway}
                        onChange={e => setNewOrdGateway(e.target.value as StoreOrder['paymentGateway'])}
                        className="w-full rounded-xl border border-[#EAE6DC] bg-[#F8F7F2] dark:bg-slate-900 px-3 py-2 font-bold"
                      >
                        <option value="Tap">Tap Payments</option>
                        <option value="Moyasar">Moyasar</option>
                        <option value="Stripe">Stripe</option>
                        <option value="COD">COD</option>
                      </select>
                    </div>
                  </div>

                  {(() => {
                    const p = storeProducts.find(item => item.id === newOrdProductId);
                    const total = p ? p.price * Math.max(1, Number(newOrdQuantity) || 1) : 0;
                    return (
                      <div className="rounded-xl bg-[#FBFAF6] border border-[#EAE6DC] p-3 flex items-center justify-between font-black text-[#14243E]">
                        <span>{isAr ? 'إجمالي الطلب:' : 'Order Total:'}</span>
                        <span className="text-base">{total.toLocaleString()} {currentStore.currency}</span>
                      </div>
                    );
                  })()}

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setNewOrderModalOpen(false)}
                      className="px-4 py-2 rounded-xl border border-[#EAE6DC] text-slate-600 font-bold cursor-pointer"
                    >
                      {isAr ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-[#14243E] text-white font-black cursor-pointer"
                    >
                      {isAr ? 'إنشاء الطلب وخصم المخزون' : 'Create Order'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ORDER DETAILS & ISSUE INVOICE MODAL */}
          {selectedOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
              <div className="bg-white dark:bg-[#071D2B] border border-[#D5B46B] rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-[#EAE6DC] dark:border-slate-800 pb-3">
                  <div>
                    <div className="text-[11px] font-bold text-[#92743A]">{isAr ? 'تفاصيل الطلب وإدارة الحالة' : 'Order Details & Fulfillment'}</div>
                    <h3 className="text-lg font-black font-mono text-[#14243E] dark:text-white">{selectedOrder.orderNumber}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="p-1.5 rounded-lg bg-[#F8F7F2] text-slate-500 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs bg-[#FBFAF6] dark:bg-slate-900 p-4 rounded-2xl border border-[#EAE6DC] dark:border-slate-800">
                  <div>
                    <div className="text-slate-400">{isAr ? 'العميل:' : 'Customer:'}</div>
                    <div className="font-black text-[#14243E] dark:text-white">{selectedOrder.customerName}</div>
                    <div className="text-[11px] text-slate-500">{selectedOrder.customerEmail}</div>
                  </div>
                  <div>
                    <div className="text-slate-400">{isAr ? 'الإجمالي والدفع:' : 'Total & Payment:'}</div>
                    <div className="font-black text-[#14243E] dark:text-[#D5B46B]">
                      {selectedOrder.total.toLocaleString()} {selectedOrder.currency || currentStore.currency}
                    </div>
                    <div className="text-[11px] text-slate-500">{selectedOrder.paymentGateway || 'Tap'} • {selectedOrder.date}</div>
                  </div>
                </div>

                {selectedOrder.items && selectedOrder.items.length > 0 && (
                  <div className="rounded-2xl border border-[#EAE6DC] dark:border-slate-800 p-3 space-y-2 text-xs">
                    <div className="font-black text-[#14243E] dark:text-white">{isAr ? 'المنتجات المطلوبة:' : 'Order Items:'}</div>
                    {selectedOrder.items.map((it, idx) => (
                      <div key={idx} className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                        <span>{it.productName} × {it.quantity}</span>
                        <span className="font-bold">{(it.unitPrice * it.quantity).toLocaleString()} {selectedOrder.currency || currentStore.currency}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-2 text-xs">
                  <label className="block font-bold text-slate-600">{isAr ? 'رقم التتبع (Tracking Number)' : 'Tracking Number'}</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={orderTrackingInput}
                      onChange={e => setOrderTrackingInput(e.target.value)}
                      placeholder="DHL-90124567"
                      className="flex-1 rounded-xl border border-[#EAE6DC] bg-[#F8F7F2] dark:bg-slate-900 px-3 py-2 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        updateOrderStatus(
                          selectedOrder.id,
                          'shipped',
                          orderTrackingInput.trim() || `DHL-${Math.floor(10000000 + Math.random() * 89999999)}`
                        )
                      }
                      className="px-4 py-2 rounded-xl bg-[#14243E] text-white font-bold cursor-pointer"
                    >
                      {isAr ? 'حفظ وشحن' : 'Save & Ship'}
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="font-bold text-slate-600">{isAr ? 'تحديث حالة الطلب:' : 'Update Order Status:'}</div>
                  <div className="flex flex-wrap gap-2">
                    {sectionSettings.orders.enabledStatuses.map(st => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => updateOrderStatus(selectedOrder.id, st, orderTrackingInput || selectedOrder.trackingNumber)}
                        className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer ${
                          selectedOrder.status === st
                            ? 'bg-[#14243E] text-white'
                            : 'bg-[#F8F7F2] border border-[#EAE6DC] text-[#14243E] hover:border-[#D5B46B]'
                        }`}
                      >
                        {isAr ? `${statusLabelAr[st]} (${st})` : st}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#EAE6DC] dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      issueRefund(selectedOrder.orderNumber, selectedOrder.total, 'طلب استرجاع من العميل', 'Customer refund');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold cursor-pointer"
                  >
                    {isAr ? 'استرجاع المبلغ' : 'Issue Refund'}
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const inv = issueOrderInvoice(selectedOrder.id);
                        if (inv) {
                          setSelectedOrder(null);
                          setViewingInvoice(inv);
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-[#14243E] text-white text-xs font-black cursor-pointer flex items-center gap-1.5"
                    >
                      <Receipt className="w-3.5 h-3.5 text-[#D5B46B]" />
                      <span>{isAr ? 'إصدار فاتورة' : 'Issue Invoice'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* INVOICE PREVIEW & PRINT MODAL */}
          {viewingInvoice && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
              <div className="bg-white dark:bg-[#071D2B] border-2 border-[#D5B46B] rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
                <button
                  type="button"
                  onClick={() => setViewingInvoice(null)}
                  className="absolute top-4 left-4 rtl:left-4 ltr:right-4 p-2 rounded-xl bg-[#F8F7F2] text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="text-center space-y-1 border-b border-[#EAE6DC] pb-4">
                  {sectionSettings.documents.logoDataUrl ? (
                    <img src={sectionSettings.documents.logoDataUrl} alt="Logo" className="h-12 mx-auto object-contain mb-1" />
                  ) : (
                    <div className="inline-flex p-2.5 rounded-2xl bg-[#14243E] text-[#D5B46B] mb-1">
                      <Receipt className="w-6 h-6" />
                    </div>
                  )}
                  <div className="text-[11px] font-black text-[#92743A] uppercase">QABS OFFICIAL TAX INVOICE</div>
                  <h3 className="text-xl font-black font-mono text-[#14243E] dark:text-white">{viewingInvoice.invoiceNumber}</h3>
                  <div className="text-xs text-slate-500">{viewingInvoice.date} • {isAr ? `الرقم الضريبي: ${sectionSettings.billing.taxNumber}` : `VAT ID: ${sectionSettings.billing.taxNumber}`}</div>
                </div>

                <div className="space-y-3 text-xs bg-[#FBFAF6] dark:bg-slate-900 p-4 rounded-2xl border border-[#EAE6DC] dark:border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-500">{isAr ? 'العميل:' : 'Client:'}</span>
                    <span className="font-black text-[#14243E] dark:text-white">{viewingInvoice.clientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{isAr ? 'الوصف:' : 'Description:'}</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{isAr ? viewingInvoice.descriptionAr : viewingInvoice.descriptionEn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{isAr ? 'الضريبة المطبقة:' : 'Tax Rate:'}</span>
                    <span className="font-bold">{currentStore.taxRate ?? 15}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{isAr ? 'الحالة:' : 'Status:'}</span>
                    <span className="font-black text-emerald-600 uppercase">{viewingInvoice.status}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[#EAE6DC] text-sm font-black text-[#14243E] dark:text-[#D5B46B]">
                    <span>{isAr ? 'الإجمالي المستحق:' : 'Total Amount:'}</span>
                    <span>{viewingInvoice.amount.toLocaleString()} {viewingInvoice.currency}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-[#92743A]">{sectionSettings.documents.companyStampText}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-4 py-2 rounded-xl bg-[#F8F7F2] border border-[#EAE6DC] text-[#14243E] text-xs font-bold cursor-pointer flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#92743A]" />
                      <span>{isAr ? 'طباعة / PDF' : 'Print / PDF'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewingInvoice(null)}
                      className="px-5 py-2 rounded-xl bg-[#14243E] text-white text-xs font-black cursor-pointer"
                    >
                      {isAr ? 'إغلاق' : 'Close'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};