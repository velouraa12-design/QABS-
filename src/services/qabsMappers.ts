import {
  AuditLogItem,
  CompanyFormation,
  CreditLedgerItem,
  Invoice,
  NotificationItem,
  RequestDocumentMeta,
  StoreCategoryItem,
  StoreCustomer,
  StoreDiscount,
  StoreInstance,
  StoreOrder,
  StorePageItem,
  StoreProduct,
  StoreShippingZone,
  StoreTeamMemberItem,
  SubscriptionHistoryItem,
  SupportTicket,
  UserProfile,
  UserRole,
  UserSubscription,
  WorkspaceBackupItem
} from '../types/index.ts';
import { ServiceOrderStatus, SubmittedServiceOrder } from '../types/pages.ts';
import { DEFAULT_STORE_SECTIONS } from '../data/mockData.ts';
import type { ApiUserSnapshot } from './qabsApi.ts';

function safeJsonParse<T>(raw: unknown, fallback: T): T {
  if (typeof raw !== 'string' || !raw.trim()) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function mapApiUserToProfile(u: ApiUserSnapshot): UserProfile {
  return {
    id: u.id,
    tenantId: u.tenantId,
    name: u.name,
    email: u.email,
    role: (u.role || 'customer') as UserRole,
    avatar: '',
    companyName: u.companyName || '',
    credits: Number(u.credits || 0),
    emailVerified: Boolean(u.emailVerified)
  };
}

export function mapDbCompany(row: Record<string, unknown>, docs: RequestDocumentMeta[] = []): CompanyFormation {
  const companyId = String(row.id);
  const matchingDocs = docs
    .filter(d => d.formationId === companyId)
    .map(d => ({
      name: d.documentName,
      type: (d.documentType === 'ein_letter' ||
      d.documentType === 'operating_agreement' ||
      d.documentType === 'certificate_of_inc' ||
      d.documentType === 'resolution'
        ? d.documentType
        : 'articles') as CompanyFormation['documents'][number]['type'],
      status: 'ready' as const,
      date: String(d.createdAt || '').slice(0, 10)
    }));

  return {
    id: companyId,
    companyName: String(row.company_name || ''),
    jurisdiction: String(row.jurisdiction || 'US_WYOMING'),
    entityType: (String(row.entity_type || 'LLC') as CompanyFormation['entityType']),
    stateFileNumber: row.state_file_number ? String(row.state_file_number) : undefined,
    ein: row.ein ? String(row.ein) : undefined,
    registeredAgent: String(row.registered_agent || 'QABS Statutory Agent LLC'),
    registeredAddress: String(row.registered_address || '30 N Gould St Ste R, Sheridan, WY 82801'),
    filingDate: String(row.filing_date || '').slice(0, 10),
    renewalDueDate: String(row.renewal_due_date || '').slice(0, 10),
    status: (String(row.status || 'under_review') as CompanyFormation['status']),
    formationStage: Number(row.formation_stage || 1) as 1 | 2 | 3 | 4 | 5,
    notes: row.notes ? String(row.notes) : undefined,
    documents: matchingDocs
  };
}

export function mapDbStore(
  row: Record<string, unknown>,
  productsCount = 0,
  ordersCount = 0
): StoreInstance {
  const settings = safeJsonParse<Record<string, unknown>>(row.settings_json, {});
  const domainStatus = String(row.domain_status || 'none') as StoreInstance['domainStatus'];
  return {
    id: String(row.id),
    ownerId: row.tenant_id ? String(row.tenant_id) : undefined,
    ownerName: row.owner_name ? String(row.owner_name) : undefined,
    ownerEmail: row.owner_email ? String(row.owner_email) : undefined,
    name: String(row.name || 'Store'),
    activityAr: String(settings.activityAr || 'متجر إلكتروني مستقل'),
    activityEn: String(settings.activityEn || 'Independent Storefront'),
    country: String(settings.country || 'SA'),
    defaultLanguage: (settings.defaultLanguage as 'ar' | 'en' | 'both') || 'both',
    subdomain: String(row.subdomain || 'store.qabs1.store'),
    customDomain: row.custom_domain ? String(row.custom_domain) : undefined,
    domainStatus,
    domainVerified: domainStatus === 'verified_active',
    currency: String(row.currency || 'SAR'),
    theme: (String(row.theme_preset || 'gold_executive') as StoreInstance['theme']),
    templateId: 'tpl_luxury_gold',
    primaryColor: '#14243E',
    accentColor: '#D5B46B',
    fontFamily: 'Cairo',
    productsCount,
    ordersCount,
    totalRevenue: Number(row.total_revenue || 0),
    status: (String(row.status || 'draft') as StoreInstance['status']),
    approvalStatus: (String(row.approval_status || 'draft') as StoreInstance['approvalStatus']),
    adminFeedback: row.admin_feedback ? String(row.admin_feedback) : undefined,
    paymentConnected: Boolean(row.payment_connected),
    paymentApprovalStatus: (String(row.payment_approval_status || 'unconfigured') as StoreInstance['paymentApprovalStatus']),
    gatewayType: (String(row.gateway_type || 'Tap') as StoreInstance['gatewayType']),
    paymentSandbox: (settings.paymentSandbox as StoreInstance['paymentSandbox']) || undefined,
    shopifyDomain: typeof settings.shopifyDomain === 'string' ? settings.shopifyDomain : undefined,
    shopifyWebhooksConnected: Boolean(settings.shopifyWebhooksConnected),
    taxRate: Number(settings.taxRate ?? 15),
    sections: DEFAULT_STORE_SECTIONS.map(s => ({ ...s })),
    createdAt: String(row.created_at || '').slice(0, 10)
  };
}

export function mapDbProduct(row: Record<string, unknown>): StoreProduct {
  const stock = Number(row.stock_quantity ?? 0);
  const price = Number(row.retail_price ?? 0);
  const cost = Number(row.cost_price ?? 0);
  return {
    id: String(row.id),
    storeId: String(row.store_id),
    titleAr: String(row.title_ar || ''),
    titleEn: String(row.title_en || row.title_ar || ''),
    nameAr: String(row.title_ar || ''),
    nameEn: String(row.title_en || row.title_ar || ''),
    sku: String(row.sku || ''),
    productType: row.product_type === 'digital' ? 'digital' : 'physical',
    price,
    cost,
    costPrice: cost,
    stock,
    category: String(row.category_ar || 'عام'),
    categoryAr: String(row.category_ar || 'عام'),
    categoryEn: String(row.category_en || 'General'),
    status: (String(row.status || (stock === 0 ? 'out_of_stock' : 'active')) as StoreProduct['status']),
    salesCount: Number(row.sales_count || 0),
    image:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80',
    imageUrl:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80'
  };
}

export function mapDbOrder(row: Record<string, unknown>): StoreOrder {
  return {
    id: String(row.id),
    storeId: String(row.store_id),
    orderNumber: String(row.order_number || ''),
    customerName: String(row.customer_name || ''),
    customerEmail: String(row.customer_email || ''),
    customerCountry: row.customer_country ? String(row.customer_country) : 'SA',
    itemsCount: Number(row.items_count || 1),
    total: Number(row.total_amount || 0),
    currency: String(row.currency || 'SAR'),
    status: (String(row.status || 'processing') as StoreOrder['status']),
    date: String(row.created_at || '').slice(0, 10),
    createdAt: String(row.created_at || ''),
    paymentGateway: (String(row.payment_gateway || 'Stripe') as StoreOrder['paymentGateway']),
    trackingNumber: row.tracking_number ? String(row.tracking_number) : undefined
  };
}

export function mapDbCustomer(row: Record<string, unknown>): StoreCustomer {
  return {
    id: String(row.id),
    storeId: String(row.store_id),
    name: String(row.name || ''),
    email: String(row.email || ''),
    phone: row.phone ? String(row.phone) : '',
    country: row.country ? String(row.country) : 'SA',
    ordersCount: Number(row.orders_count || 0),
    totalSpent: Number(row.total_spent || 0),
    lastOrderDate: String(row.last_order_date || '').slice(0, 10)
  };
}

export function mapDbCategory(row: Record<string, unknown>): StoreCategoryItem {
  return {
    id: String(row.id),
    storeId: String(row.store_id),
    nameAr: String(row.name_ar || ''),
    nameEn: String(row.name_en || row.name_ar || ''),
    slug: String(row.slug || ''),
    createdAt: String(row.created_at || '')
  };
}

export function mapDbStoreTeamMember(row: Record<string, unknown>): StoreTeamMemberItem {
  return {
    id: String(row.id),
    storeId: String(row.store_id),
    name: String(row.name || ''),
    email: String(row.email || ''),
    role: (String(row.role || 'staff') as StoreTeamMemberItem['role']),
    permissions: safeJsonParse<string[]>(row.permissions_json, []),
    status: row.status === 'suspended' ? 'suspended' : 'active',
    createdAt: String(row.created_at || '')
  };
}

export function mapDbServiceRequest(
  row: Record<string, unknown>,
  docs: RequestDocumentMeta[] = []
): SubmittedServiceOrder {
  const reqId = String(row.id);
  const attached = docs.find(d => d.requestId === reqId);
  return {
    id: reqId,
    referenceCode: String(row.reference_code || ''),
    serviceSlug: String(row.service_slug || ''),
    servicePath: String(row.service_path || ''),
    serviceTitleAr: String(row.service_title_ar || ''),
    serviceTitleEn: String(row.service_title_en || ''),
    packageId: row.package_id ? String(row.package_id) : undefined,
    packageNameAr: row.package_name_ar ? String(row.package_name_ar) : undefined,
    packageNameEn: row.package_name_en ? String(row.package_name_en) : undefined,
    priceUsd: Number(row.price_usd || 0),
    customerName: String(row.customer_name || ''),
    customerEmail: String(row.customer_email || ''),
    customerPhone: String(row.customer_phone || ''),
    companyOrStoreName: row.company_or_store_name ? String(row.company_or_store_name) : undefined,
    customFields: safeJsonParse<Record<string, string>>(row.custom_fields_json, {}),
    notes: row.notes ? String(row.notes) : undefined,
    adminNotes: row.admin_notes ? String(row.admin_notes) : undefined,
    assignedStaffId: row.assigned_staff_id ? String(row.assigned_staff_id) : undefined,
    attachedDocumentId: attached?.id,
    attachedDocumentName: attached?.documentName,
    status: (String(row.status || 'new') as ServiceOrderStatus),
    createdAt: String(row.created_at || '').replace('T', ' ').slice(0, 16)
  };
}

export function mapDbDocument(row: Record<string, unknown>): RequestDocumentMeta {
  return {
    id: String(row.id),
    tenantId: row.tenant_id ? String(row.tenant_id) : undefined,
    requestId: row.request_id ? String(row.request_id) : null,
    formationId: row.formation_id ? String(row.formation_id) : null,
    documentName: String(row.document_name || ''),
    documentType: String(row.document_type || 'kyc'),
    mimeType: String(row.mime_type || 'application/octet-stream'),
    sizeBytes: Number(row.size_bytes || 0),
    sha256Hash: row.sha256_hash ? String(row.sha256_hash) : undefined,
    status: String(row.status || 'uploaded'),
    createdAt: String(row.created_at || '')
  };
}

export function mapDbSubscription(row: Record<string, unknown> | null): UserSubscription {
  if (!row) {
    return {
      planId: 'starter',
      billingCycle: 'monthly',
      renewalDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      status: 'trial',
      currentPrice: 0
    };
  }
  return {
    planId: (String(row.plan_tier || 'starter') as UserSubscription['planId']),
    billingCycle: row.billing_cycle === 'annual' ? 'annual' : 'monthly',
    renewalDate: String(row.renewal_date || '').slice(0, 10),
    status: (String(row.status || 'active') as UserSubscription['status']),
    currentPrice: Number(row.current_price || 0)
  };
}

export function mapDbInvoice(row: Record<string, unknown>): Invoice {
  return {
    id: String(row.id),
    invoiceNumber: String(row.invoice_number || ''),
    date: String(row.issued_date || '').slice(0, 10),
    amount: Number(row.amount || 0),
    currency: String(row.currency || 'USD'),
    status: (String(row.status || 'pending_verification') as Invoice['status']),
    descriptionAr: String(row.description_ar || ''),
    descriptionEn: String(row.description_en || ''),
    clientName: String(row.tenant_id || 'Client'),
    paymentProofRef: row.payment_proof_ref ? String(row.payment_proof_ref) : undefined,
    invoiceKind: row.invoice_kind ? String(row.invoice_kind) : undefined,
    creditGrantAmount: Number(row.credit_grant_amount || 0)
  };
}

export function mapDbCreditLedger(row: Record<string, unknown>): CreditLedgerItem {
  return {
    id: String(row.id),
    delta: Number(row.delta || 0),
    balanceAfter: Number(row.balance_after || 0),
    reason: String(row.reason || ''),
    referenceId: row.reference_id ? String(row.reference_id) : undefined,
    createdAt: String(row.created_at || '').replace('T', ' ').slice(0, 16)
  };
}

export function mapDbSubscriptionHistory(row: Record<string, unknown>): SubscriptionHistoryItem {
  return {
    id: String(row.id),
    planTier: String(row.plan_tier || ''),
    billingCycle: String(row.billing_cycle || ''),
    price: Number(row.price || 0),
    status: String(row.status || ''),
    note: row.note ? String(row.note) : undefined,
    createdAt: String(row.created_at || '').replace('T', ' ').slice(0, 16)
  };
}

export function mapDbNotification(row: Record<string, unknown>): NotificationItem {
  return {
    id: String(row.id),
    tenantId: row.tenant_id ? String(row.tenant_id) : undefined,
    titleAr: String(row.title_ar || ''),
    titleEn: String(row.title_en || ''),
    bodyAr: String(row.body_ar || ''),
    bodyEn: String(row.body_en || ''),
    category: String(row.category || 'system'),
    isRead: Boolean(row.is_read),
    linkPath: row.link_path ? String(row.link_path) : undefined,
    createdAt: String(row.created_at || '').replace('T', ' ').slice(0, 16)
  };
}

export function mapDbTicket(row: Record<string, unknown>): SupportTicket {
  return {
    id: String(row.id),
    ticketNumber: String(row.ticket_number || ''),
    subject: String(row.subject || ''),
    category: (String(row.category || 'technical') as SupportTicket['category']),
    priority: (String(row.priority || 'medium') as SupportTicket['priority']),
    status: (String(row.status || 'open') as SupportTicket['status']),
    createdAt: String(row.created_at || '').replace('T', ' ').slice(0, 16),
    updatedAt: String(row.updated_at || '').replace('T', ' ').slice(0, 16),
    clientName: String(row.client_name || ''),
    lastMessage: row.last_message ? String(row.last_message) : undefined
  };
}

export function mapDbAuditLog(row: Record<string, unknown>): AuditLogItem {
  return {
    id: String(row.id),
    timestamp: String(row.created_at || '').replace('T', ' ').slice(0, 16),
    actor: String(row.actor_name || 'System'),
    actionAr: String(row.action_ar || ''),
    actionEn: String(row.action_en || ''),
    target: String(row.target_entity || ''),
    status: (String(row.status || 'info') as AuditLogItem['status'])
  };
}

export function mapDbDiscount(row: Record<string, unknown>): StoreDiscount {
  return {
    id: String(row.id),
    storeId: String(row.store_id),
    code: String(row.code || ''),
    type: row.discount_type === 'fixed' ? 'fixed' : 'percentage',
    value: Number(row.value || 0),
    minOrderAmount: 0,
    usedCount: Number(row.used_count || 0),
    usageCount: Number(row.used_count || 0),
    maxUses: Number(row.usage_limit || 100),
    expiresAt: '2026-12-31',
    status: row.status === 'expired' ? 'expired' : 'active'
  };
}

export function mapDbShippingZone(row: Record<string, unknown>): StoreShippingZone {
  return {
    id: String(row.id),
    storeId: String(row.store_id),
    regionNameAr: String(row.region_name_ar || ''),
    regionNameEn: String(row.region_name_en || row.region_name_ar || ''),
    carrier: String(row.carrier || 'DHL Express'),
    rate: Number(row.rate || 0),
    deliveryTimeAr: String(row.delivery_time_ar || '2 - 5 أيام عمل'),
    deliveryTimeEn: String(row.delivery_time_en || '2 - 5 Business Days'),
    active: Boolean(row.active ?? 1),
    status: row.active === 0 ? 'paused' : 'active'
  };
}

export function mapDbStorePage(row: Record<string, unknown>): StorePageItem {
  return {
    id: String(row.id),
    storeId: String(row.store_id),
    slug: String(row.slug || 'custom'),
    titleAr: String(row.title_ar || ''),
    titleEn: String(row.title_en || row.title_ar || ''),
    type: 'custom',
    contentAr: String(row.content_ar || ''),
    contentEn: String(row.content_en || row.content_ar || ''),
    published: Boolean(row.published ?? 1),
    updatedAt: String(row.updated_at || '').slice(0, 10)
  };
}

export function mapDbWorkspaceBackup(row: Record<string, unknown>): WorkspaceBackupItem {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id || ''),
    label: String(row.label || 'Workspace Backup'),
    sizeBytes: Number(row.size_bytes || 0),
    createdAt: String(row.created_at || '').replace('T', ' ').slice(0, 16)
  };
}
