/**
 * QABS unified API client.
 *
 * Uses same-origin HttpOnly session cookies (`credentials: 'include'`) and
 * `X-CSRF-Token` headers on all authenticated mutating requests. When running on
 * a static CDN without `/api/health`, callers detect unreachable backend cleanly
 * and switch to explicit preview-only local fallback.
 */
export type ApiError = Error & { status?: number; code?: string };

export interface StoreProductVariant {
  id: string;
  product_id: string;
  store_id: string;
  title: string;
  sku: string;
  options_json: string;
  retail_price: number;
  compare_at_price: number | null;
  stock_quantity: number;
  status: 'active' | 'draft' | 'archived';
}

const API_BASE = (import.meta.env.VITE_QABS_API_BASE_URL || '').replace(/\/$/, '');

let currentCsrfToken: string | null = null;

export function setCsrfToken(token: string | null): void {
  currentCsrfToken = token;
}

export function getCsrfToken(): string | null {
  return currentCsrfToken;
}

function buildHeaders(method: string, extra: HeadersInit = {}): Headers {
  const result = new Headers(extra);
  if (!result.has('Accept')) result.set('Accept', 'application/json');
  const isMutating = !['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase());
  if (isMutating && currentCsrfToken && !result.has('X-CSRF-Token')) {
    result.set('X-CSRF-Token', currentCsrfToken);
  }
  return result;
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method || 'GET').toUpperCase();
  const url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      credentials: 'include',
      headers: buildHeaders(method, init.headers)
    });
  } catch (err) {
    const error = new Error(err instanceof Error ? err.message : 'NETWORK_UNREACHABLE') as ApiError;
    error.code = 'NETWORK_UNREACHABLE';
    throw error;
  }

  const contentType = response.headers.get('content-type') || '';
  const payload =
    response.status === 204
      ? null
      : contentType.includes('application/json')
      ? await response.json().catch(() => null)
      : null;

  if (!response.ok) {
    const error = new Error(payload?.error || payload?.message || `HTTP_${response.status}`) as ApiError;
    error.status = response.status;
    error.code = payload?.code || payload?.error || `HTTP_${response.status}`;
    throw error;
  }

  if (payload && typeof payload === 'object' && 'csrfToken' in payload && typeof payload.csrfToken === 'string') {
    currentCsrfToken = payload.csrfToken;
  }
  return payload as T;
}

export interface ApiUserSnapshot {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'staff' | 'support' | 'customer';
  emailVerified: boolean;
  companyName?: string;
  credits: number;
}

export interface AuthSessionResponse {
  authenticated: boolean;
  user: ApiUserSnapshot | null;
  csrfToken: string | null;
  previewEmailVerifyToken?: string;
}

export interface BootstrapResponse {
  user: ApiUserSnapshot;
  companies: Record<string, unknown>[];
  stores: Record<string, unknown>[];
  categories: Record<string, unknown>[];
  products: Record<string, unknown>[];
  orders: Record<string, unknown>[];
  customers: Record<string, unknown>[];
  teamMembers: Record<string, unknown>[];
  discounts: Record<string, unknown>[];
  shippingZones: Record<string, unknown>[];
  storePages: Record<string, unknown>[];
  backups: Record<string, unknown>[];
  serviceRequests: Record<string, unknown>[];
  documents: Record<string, unknown>[];
  subscription: Record<string, unknown> | null;
  subscriptionHistory: Record<string, unknown>[];
  invoices: Record<string, unknown>[];
  creditLedger: Record<string, unknown>[];
  notifications: Record<string, unknown>[];
  tickets: Record<string, unknown>[];
  auditLogs: Record<string, unknown>[];
}

export interface AdminOverviewResponse {
  actorRole: string;
  clients: Record<string, unknown>[];
  staff: Record<string, unknown>[];
  servicesCatalog: Record<string, unknown>[];
  serviceRequests: Record<string, unknown>[];
  formations: Record<string, unknown>[];
  documents: Record<string, unknown>[];
  stores: Record<string, unknown>[];
  products: Record<string, unknown>[];
  subscriptions: Record<string, unknown>[];
  invoices: Record<string, unknown>[];
  tickets: Record<string, unknown>[];
  notifications: Record<string, unknown>[];
  auditLogs: Record<string, unknown>[];
  errorLogs?: Record<string, unknown>[];
  backups?: Record<string, unknown>[];
  platformSettings: Record<string, unknown>;
}

export interface IntegrationsStatusResponse {
  paymentsEnabled: boolean;
  environment: string;
  integrations: {
    tap: { configured: boolean; sandboxConfigured?: boolean; secretConfigured?: boolean; region: string; methods: string[]; mode: string };
    moyasar: { configured: boolean; sandboxConfigured?: boolean; secretConfigured?: boolean; region: string; methods: string[]; mode: string };
    stripe: { configured: boolean; secretConfigured: boolean; region: string; methods: string[]; mode: string };
    shopify: { configured: boolean; mode: string };
    gemini: { configured: boolean; model: string };
    email?: { configured: boolean; provider: string };
    cloudflare: { configured: boolean; workersReady?: boolean; d1SchemaParity?: boolean; r2Configured?: boolean; dnsLocked: boolean };
    database: { engine: string; connected: boolean };
  };
}

export const qabsApi = {
  health: () =>
    apiRequest<{
      status: string;
      service?: string;
      database?: string;
      paymentsEnabled?: boolean;
      environment?: string;
    }>('/api/health'),
  getIntegrationsStatus: () => apiRequest<IntegrationsStatusResponse>('/api/integrations/status'),

  // Auth & Recovery
  session: async (): Promise<AuthSessionResponse> => {
    const res = await apiRequest<AuthSessionResponse>('/api/auth/session');
    currentCsrfToken = res.csrfToken || null;
    return res;
  },
  login: async (email: string, password: string): Promise<AuthSessionResponse> => {
    const res = await apiRequest<AuthSessionResponse>('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    currentCsrfToken = res.csrfToken || null;
    return res;
  },
  register: async (input: {
    name: string;
    email: string;
    password: string;
    companyName?: string;
  }): Promise<AuthSessionResponse> => {
    const res = await apiRequest<AuthSessionResponse>('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });
    currentCsrfToken = res.csrfToken || null;
    return res;
  },
  logout: async () => {
    const res = await apiRequest<{ ok: boolean }>('/api/auth/logout', { method: 'POST' });
    currentCsrfToken = null;
    return res;
  },
  forgotPassword: (email: string) =>
    apiRequest<{ ok: boolean; message: string; previewResetToken?: string }>('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    }),
  resetPassword: (token: string, newPassword: string) =>
    apiRequest<{ ok: boolean }>('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword })
    }),
  verifyEmail: (token: string) =>
    apiRequest<{ ok: boolean; emailVerified: boolean }>('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    }),
  resendVerification: () =>
    apiRequest<{ ok: boolean; emailVerified: boolean; previewEmailVerifyToken?: string }>('/api/auth/resend-verification', {
      method: 'POST'
    }),

  // Public & CMS site content
  getSiteContent: () => apiRequest<{ siteContent: Record<string, unknown> | null }>('/api/site-content'),

  // Workspace bootstrap & backups
  bootstrap: () => apiRequest<BootstrapResponse>('/api/workspace/bootstrap'),
  listWorkspaceBackups: () => apiRequest<{ backups: Record<string, unknown>[] }>('/api/workspace/backups'),
  createWorkspaceBackup: (label?: string) =>
    apiRequest<{ backup: Record<string, unknown>; snapshot: Record<string, unknown> }>('/api/workspace/backup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label })
    }),

  // Service Requests (8-status lifecycle)
  listServiceRequests: () => apiRequest<{ requests: Record<string, unknown>[] }>('/api/service-requests'),
  createServiceRequest: (input: {
    serviceSlug: string;
    servicePath: string;
    serviceTitleAr: string;
    serviceTitleEn: string;
    packageId?: string;
    packageNameAr?: string;
    packageNameEn?: string;
    priceUsd: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    companyOrStoreName?: string;
    customFields: Record<string, string>;
    notes?: string;
    status?: 'draft' | 'new';
    document?: { name: string; mimeType: string; base64: string; type?: string };
  }) =>
    apiRequest<{ request: Record<string, unknown> }>('/api/service-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    }),
  updateServiceRequest: (
    id: string,
    input: { status: string; adminNotes?: string; assignedStaffId?: string }
  ) =>
    apiRequest<{ request: Record<string, unknown> }>(`/api/service-requests/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    }),

  // Documents vault (private authenticated upload/download)
  listDocuments: () => apiRequest<{ documents: Record<string, unknown>[] }>('/api/documents'),
  uploadDocument: (input: {
    name: string;
    type?: string;
    mimeType: string;
    base64: string;
    requestId?: string;
    formationId?: string;
  }) =>
    apiRequest<{ document: Record<string, unknown> }>('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    }),
  getDocumentDownloadUrl: (docId: string) =>
    `${API_BASE}/api/documents/${encodeURIComponent(docId)}/download`,

  // Formations
  createFormation: (input: {
    companyName: string;
    jurisdiction: string;
    entityType: string;
    registeredAgent?: string;
    registeredAddress?: string;
    notes?: string;
  }) =>
    apiRequest<{ formation: Record<string, unknown> }>('/api/formations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    }),

  // Multi-Tenant Stores
  createStore: (input: Record<string, unknown>) =>
    apiRequest<{ store: Record<string, unknown> }>('/api/stores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    }),
  updateStore: (storeId: string, input: Record<string, unknown>) =>
    apiRequest<{ store: Record<string, unknown> }>(`/api/stores/${encodeURIComponent(storeId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    }),
  submitStoreReview: (storeId: string) =>
    apiRequest<{ store: Record<string, unknown> }>(`/api/stores/${encodeURIComponent(storeId)}/submit-review`, {
      method: 'POST'
    }),
  requestStorePayment: (
    storeId: string,
    input: {
      gatewayType: 'Tap' | 'Moyasar' | 'Stripe' | 'PayPal';
      sandboxConfig?: {
        madaEnabled?: boolean;
        applePayEnabled?: boolean;
        sadadEnabled?: boolean;
        stcPayEnabled?: boolean;
        merchantReference?: string;
      };
    }
  ) =>
    apiRequest<{ store: Record<string, unknown> }>(
      `/api/stores/${encodeURIComponent(storeId)}/payment-request`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      }
    ),
  listCategories: (storeId: string) =>
    apiRequest<{ categories: Record<string, unknown>[] }>(`/api/stores/${encodeURIComponent(storeId)}/categories`),
  createCategory: (storeId: string, input: { nameAr: string; nameEn?: string; slug?: string }) =>
    apiRequest<{ category: Record<string, unknown> }>(`/api/stores/${encodeURIComponent(storeId)}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    }),
  createProduct: (storeId: string, input: Record<string, unknown>) =>
    apiRequest<{ product: Record<string, unknown> }>(`/api/stores/${encodeURIComponent(storeId)}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    }),
  updateProduct: (storeId: string, productId: string, input: Record<string, unknown>) =>
    apiRequest<{ product: Record<string, unknown> }>(
      `/api/stores/${encodeURIComponent(storeId)}/products/${encodeURIComponent(productId)}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      }
    ),
  listProductVariants: (storeId: string, productId: string) =>
    apiRequest<{ variants: StoreProductVariant[] }>(
      `/api/stores/${encodeURIComponent(storeId)}/products/${encodeURIComponent(productId)}/variants`
    ),
  createProductVariant: (storeId: string, productId: string, input: {
    title: string;
    sku?: string;
    options: Record<string, string>;
    price?: number;
    compareAtPrice?: number | null;
    stock?: number;
    status?: 'active' | 'draft' | 'archived';
  }) =>
    apiRequest<{ variant: StoreProductVariant }>(
      `/api/stores/${encodeURIComponent(storeId)}/products/${encodeURIComponent(productId)}/variants`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) }
    ),
  updateProductVariant: (storeId: string, productId: string, variantId: string, input: {
    title?: string;
    sku?: string;
    options?: Record<string, string>;
    price?: number;
    compareAtPrice?: number | null;
    status?: 'active' | 'draft' | 'archived';
  }) =>
    apiRequest<{ variant: StoreProductVariant }>(
      `/api/stores/${encodeURIComponent(storeId)}/products/${encodeURIComponent(productId)}/variants/${encodeURIComponent(variantId)}`,
      { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) }
    ),
  adjustProductInventory: (storeId: string, productId: string, input: {
    quantityDelta: number;
    reason: 'restock' | 'manual_adjustment' | 'correction' | 'damaged' | 'returned';
    variantId?: string;
    referenceId?: string;
  }) =>
    apiRequest<{ productId: string; variantId: string | null; stockQuantity: number; movements: Record<string, unknown>[] }>(
      `/api/stores/${encodeURIComponent(storeId)}/products/${encodeURIComponent(productId)}/inventory-adjustments`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) }
    ),
  deleteProduct: (storeId: string, productId: string) =>
    apiRequest<{ ok: boolean }>(
      `/api/stores/${encodeURIComponent(storeId)}/products/${encodeURIComponent(productId)}`,
      { method: 'DELETE' }
    ),
  createOrder: (storeId: string, input: Record<string, unknown>) =>
    apiRequest<{ order: Record<string, unknown> }>(`/api/stores/${encodeURIComponent(storeId)}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    }),
  updateOrderStatus: (storeId: string, orderId: string, input: { status: string; trackingNumber?: string }) =>
    apiRequest<{ order: Record<string, unknown> }>(
      `/api/stores/${encodeURIComponent(storeId)}/orders/${encodeURIComponent(orderId)}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      }
    ),
  createCustomer: (storeId: string, input: { name: string; email: string; phone?: string; country?: string }) =>
    apiRequest<{ customer: Record<string, unknown> }>(`/api/stores/${encodeURIComponent(storeId)}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    }),
  listStoreTeam: (storeId: string) =>
    apiRequest<{ members: Record<string, unknown>[] }>(`/api/stores/${encodeURIComponent(storeId)}/team`),
  addStoreTeamMember: (
    storeId: string,
    input: { name: string; email: string; role: 'admin' | 'staff' | 'support'; permissions?: string[] }
  ) =>
    apiRequest<{ member: Record<string, unknown> }>(`/api/stores/${encodeURIComponent(storeId)}/team`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    }),
  getStoreReports: (storeId: string) =>
    apiRequest<{
      storeId: string;
      currency: string;
      totalProducts: number;
      totalStock: number;
      totalOrders: number;
      grossOrderValue: number;
      totalCustomers: number;
    }>(`/api/stores/${encodeURIComponent(storeId)}/reports`),
  createDiscount: (storeId: string, input: { code: string; type: 'percentage' | 'fixed'; value: number; usageLimit?: number }) =>
    apiRequest<{ discount: Record<string, unknown> }>(`/api/stores/${encodeURIComponent(storeId)}/discounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    }),
  toggleDiscount: (storeId: string, discountId: string, status?: 'active' | 'expired') =>
    apiRequest<{ discount: Record<string, unknown> }>(
      `/api/stores/${encodeURIComponent(storeId)}/discounts/${encodeURIComponent(discountId)}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      }
    ),
  createShippingZone: (
    storeId: string,
    input: {
      regionNameAr: string;
      regionNameEn?: string;
      carrier?: string;
      rate: number;
      deliveryTimeAr?: string;
      deliveryTimeEn?: string;
      active?: boolean;
    }
  ) =>
    apiRequest<{ shippingZone: Record<string, unknown> }>(`/api/stores/${encodeURIComponent(storeId)}/shipping-zones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    }),
  saveStorePage: (
    storeId: string,
    input: {
      id?: string;
      slug?: string;
      titleAr: string;
      titleEn?: string;
      contentAr?: string;
      contentEn?: string;
      published?: boolean;
    }
  ) =>
    apiRequest<{ page: Record<string, unknown> }>(`/api/stores/${encodeURIComponent(storeId)}/pages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    }),
  deleteStorePage: (storeId: string, pageId: string) =>
    apiRequest<{ ok: boolean }>(`/api/stores/${encodeURIComponent(storeId)}/pages/${encodeURIComponent(pageId)}`, {
      method: 'DELETE'
    }),
  importSupplierProduct: (
    storeId: string,
    input: {
      supplierName: string;
      titleAr: string;
      titleEn?: string;
      sku?: string;
      retailPrice: number;
      costPrice?: number;
      stock?: number;
    }
  ) =>
    apiRequest<{ product: Record<string, unknown> }>(`/api/stores/${encodeURIComponent(storeId)}/supplier-import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    }),

  // Tap hosted checkout — test-mode only; server derives amount and tenant from invoice.
  createTapSandboxCharge: (invoiceId: string) =>
    apiRequest<{
      provider: 'tap';
      mode: 'sandbox';
      invoiceId: string;
      chargeId: string;
      providerStatus: string;
      redirectUrl: string;
      paymentConfirmed: false;
    }>('/api/payments/tap/charges', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoiceId })
    }),
  verifyTapSandboxPayment: (invoiceId: string, chargeId: string) =>
    apiRequest<{
      provider: 'tap';
      mode: 'sandbox';
      providerStatus: string;
      paymentConfirmed: boolean;
      invoice: Record<string, unknown>;
    }>('/api/payments/tap/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoiceId, chargeId })
    }),

  // Billing, Invoices, Subscriptions & AI Credits
  billingOverview: () =>
    apiRequest<{
      subscription: Record<string, unknown> | null;
      history: Record<string, unknown>[];
      invoices: Record<string, unknown>[];
      creditsBalance: number;
      creditLedger: Record<string, unknown>[];
    }>('/api/billing/overview'),
  requestSubscriptionChange: (planId: 'starter' | 'growth' | 'enterprise', billingCycle: 'monthly' | 'annual') =>
    apiRequest<{ invoice: Record<string, unknown> }>('/api/billing/subscription-change', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId, billingCycle })
    }),
  cancelSubscription: (reason?: string) =>
    apiRequest<{ subscription: Record<string, unknown> }>('/api/billing/subscription-cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    }),
  renewSubscription: (planId?: 'starter' | 'growth' | 'enterprise', billingCycle?: 'monthly' | 'annual') =>
    apiRequest<{ invoice: Record<string, unknown> }>('/api/billing/subscription-renew', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId, billingCycle })
    }),
  requestCreditTopup: (amountUsd: number) =>
    apiRequest<{ invoice: Record<string, unknown> }>('/api/billing/credits/request-topup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amountUsd })
    }),
  executeAI: (prompt: string, storeId?: string, mode: 'chat' | 'workspace_command' = 'workspace_command', language: 'ar' | 'en' = 'ar') =>
    apiRequest<{
      creditsBalance: number;
      provider?: string;
      result: { id: string; prompt: string; provider?: string; responseAr: string; responseEn: string; timestamp: string };
    }>('/api/ai/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, storeId, mode, language })
    }),

  // Notifications & Support Tickets
  listNotifications: () => apiRequest<{ notifications: Record<string, unknown>[] }>('/api/notifications'),
  markNotificationRead: (id: string) =>
    apiRequest<{ ok: boolean }>(`/api/notifications/${encodeURIComponent(id)}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () =>
    apiRequest<{ ok: boolean }>('/api/notifications/read-all', { method: 'POST' }),
  createTicket: (input: { subject: string; category?: string; priority?: string; lastMessage?: string }) =>
    apiRequest<{ ticket: Record<string, unknown> }>('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    }),
  resolveTicket: (id: string) =>
    apiRequest<{ ticket: Record<string, unknown> }>(`/api/tickets/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'resolved' })
    }),

  // Admin Governance (RBAC protected)
  adminOverview: () => apiRequest<AdminOverviewResponse>('/api/admin/overview'),
  adminCreateStaff: (input: { name: string; email: string; password: string; role: string }) =>
    apiRequest<{ user: Record<string, unknown> }>('/api/admin/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    }),
  adminUpdateStaff: (userId: string, input: { role?: string; status?: 'active' | 'suspended' }) =>
    apiRequest<{ user: Record<string, unknown> }>(`/api/admin/staff/${encodeURIComponent(userId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    }),
  adminUpdateService: (slug: string, input: { startingPriceUsd?: number; active?: boolean }) =>
    apiRequest<{ service: Record<string, unknown> }>(`/api/admin/services/${encodeURIComponent(slug)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    }),
  adminReviewStore: (
    storeId: string,
    decision: 'approved_published' | 'changes_requested' | 'rejected',
    feedback?: string
  ) =>
    apiRequest<{ store: Record<string, unknown> }>(`/api/admin/stores/${encodeURIComponent(storeId)}/approval`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision, feedback })
    }),
  adminVerifyStoreDomain: (storeId: string, verified: boolean) =>
    apiRequest<{ store: Record<string, unknown> }>(`/api/admin/stores/${encodeURIComponent(storeId)}/domain`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verified })
    }),
  adminReviewStorePayment: (storeId: string, decision: 'pending_admin_approval' | 'unconfigured' | 'sandbox_verified') =>
    apiRequest<{ store: Record<string, unknown> }>(`/api/admin/stores/${encodeURIComponent(storeId)}/payment-approval`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision })
    }),
  adminVerifyInvoice: (invoiceId: string, paymentProofRef: string) =>
    apiRequest<{ invoice: Record<string, unknown> }>(`/api/admin/invoices/${encodeURIComponent(invoiceId)}/verify`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentProofRef })
    }),
  adminSendNotification: (input: {
    tenantId?: string;
    titleAr: string;
    titleEn?: string;
    bodyAr: string;
    bodyEn?: string;
    linkPath?: string;
  }) =>
    apiRequest<{ sentCount: number }>('/api/admin/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    }),
  adminUpdateSettings: (settings: Record<string, unknown>) =>
    apiRequest<{ platformSettings: Record<string, unknown> }>('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    }),
  adminUpdateSiteContent: (siteContent: Record<string, unknown>) =>
    apiRequest<{ siteContent: Record<string, unknown> }>('/api/admin/site-content', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteContent })
    }),
  adminErrorLogs: () => apiRequest<{ errorLogs: Record<string, unknown>[] }>('/api/admin/error-logs')
};
