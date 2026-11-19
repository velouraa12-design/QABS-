import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createQabsApp } from '../server/app.ts';

interface HttpResult {
  status: number;
  json: Record<string, any>;
  headers: Headers;
  rawText: string;
}

class TestClient {
  baseUrl: string;
  cookie = '';
  csrfToken = '';

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async req(
    method: string,
    path: string,
    body?: Record<string, unknown>,
    opts: { omitCsrf?: boolean; rawCsrf?: string } = {}
  ): Promise<HttpResult> {
    const headers: Record<string, string> = {};
    if (this.cookie) headers['cookie'] = this.cookie;
    if (body !== undefined) headers['content-type'] = 'application/json';
    if (!opts.omitCsrf && method !== 'GET' && method !== 'HEAD') {
      const tok = opts.rawCsrf !== undefined ? opts.rawCsrf : this.csrfToken;
      if (tok) headers['x-csrf-token'] = tok;
    }

    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined
    });

    const setCookie = res.headers.get('set-cookie');
    if (setCookie) {
      const m = setCookie.match(/qabs_session=([^;]+)/);
      if (m) {
        if (m[1] === '') this.cookie = '';
        else this.cookie = `qabs_session=${m[1]}`;
      }
    }

    const rawText = await res.text();
    let json: Record<string, any> = {};
    try {
      json = JSON.parse(rawText);
    } catch {
      // non-json response (e.g. file download)
    }
    if (json && typeof json.csrfToken === 'string') {
      this.csrfToken = json.csrfToken;
    }
    return { status: res.status, json, headers: res.headers, rawText };
  }
}

describe('QABS Backend Security, Auth, Tenant Isolation, Billing Gate & Vault API', () => {
  let server: http.Server;
  let baseUrl: string;
  let originalFetch: typeof fetch;
  const originalEnv: Record<string, string | undefined> = {};

  before(async () => {
    originalFetch = globalThis.fetch;
    for (const key of ['QABS_REGISTRATION_ENABLED', 'QABS_EMAIL_VERIFICATION_ENABLED', 'QABS_PASSWORD_RECOVERY_ENABLED', 'RESEND_API_KEY']) {
      originalEnv[key] = process.env[key];
    }
    process.env.QABS_REGISTRATION_ENABLED = 'true';
    process.env.QABS_EMAIL_VERIFICATION_ENABLED = 'true';
    process.env.QABS_PASSWORD_RECOVERY_ENABLED = 'true';
    process.env.RESEND_API_KEY = 're_synthetic_test_only';
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      if (url === 'https://api.resend.com/emails') {
        return new Response(JSON.stringify({ id: 'synthetic-email' }), {
          status: 200, headers: { 'content-type': 'application/json' }
        });
      }
      return originalFetch(input, init);
    }) as typeof fetch;
    const { app } = createQabsApp({
      dbPath: ':memory:',
      exposePreviewTokens: true,
      rateLimitMax: 500
    });
    await new Promise<void>(resolve => {
      server = app.listen(0, '127.0.0.1', () => {
        const addr = server.address();
        if (addr && typeof addr === 'object') {
          baseUrl = `http://127.0.0.1:${addr.port}`;
        }
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close(err => (err ? reject(err) : resolve()));
    });
    globalThis.fetch = originalFetch;
    for (const [key, value] of Object.entries(originalEnv)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  it('health endpoint reports payments disabled and sqlite preview environment', async () => {
    const anon = new TestClient(baseUrl);
    const res = await anon.req('GET', '/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.json.status, 'ok');
    assert.equal(res.json.paymentsEnabled, false);
    assert.equal(res.json.database, 'sqlite');
  });

  it('public registration ignores injected super_admin role, sets HttpOnly cookie, enforces CSRF, and supports email verification', async () => {
    const clientA = new TestClient(baseUrl);
    const reg = await clientA.req('POST', '/api/auth/register', {
      name: 'Customer Alpha',
      email: 'alpha.isolation@example.com',
      password: 'StrongPassword!2026',
      companyName: 'Alpha Trading LLC',
      role: 'super_admin'
    });
    assert.equal(reg.status, 201);
    assert.equal(reg.json.user.role, 'customer');
    assert.equal(reg.json.user.emailVerified, false);
    assert.ok(reg.headers.get('set-cookie')?.includes('HttpOnly'));
    assert.ok(reg.json.previewEmailVerifyToken);

    // Duplicate registration blocked with 409
    const dup = await new TestClient(baseUrl).req('POST', '/api/auth/register', {
      name: 'Dup Alpha',
      email: 'alpha.isolation@example.com',
      password: 'StrongPassword!2026'
    });
    assert.equal(dup.status, 409);

    // Missing CSRF header on mutating request blocked with 403
    const noCsrf = await clientA.req(
      'POST',
      '/api/stores',
      { name: 'Alpha Unprotected Store' },
      { omitCsrf: true }
    );
    assert.equal(noCsrf.status, 403);
    assert.equal(noCsrf.json.code, 'CSRF_TOKEN_INVALID');

    // An unverified registration session must not read tenant workspace data.
    const blockedWorkspace = await clientA.req('GET', '/api/workspace/bootstrap');
    assert.equal(blockedWorkspace.status, 403);
    assert.equal(blockedWorkspace.json.code, 'EMAIL_NOT_VERIFIED');

    // The same session may still inspect verification status and request a fresh token.
    const pendingMe = await clientA.req('GET', '/api/auth/me');
    assert.equal(pendingMe.status, 200);
    assert.equal(pendingMe.json.user.emailVerified, false);
    const resent = await clientA.req('POST', '/api/auth/resend-verification', {});
    assert.equal(resent.status, 200);
    assert.equal(resent.json.emailDispatched, true);
    assert.ok(resent.json.previewEmailVerifyToken);

    // Verify email token succeeds once and fails reuse
    const ver1 = await clientA.req('POST', '/api/auth/verify-email', {
      token: reg.json.previewEmailVerifyToken
    });
    assert.equal(ver1.status, 200);
    assert.equal(ver1.json.emailVerified, true);

    const verReuse = await clientA.req('POST', '/api/auth/verify-email', {
      token: reg.json.previewEmailVerifyToken
    });
    assert.equal(verReuse.status, 400);
  });

  it('password recovery resets credentials, revokes prior sessions, and logout invalidates cookie', async () => {
    const user = new TestClient(baseUrl);
    await user.req('POST', '/api/auth/register', {
      name: 'Recovery Tester',
      email: 'recover.user@example.com',
      password: 'InitialPassword!2026',
      companyName: 'Recover Co'
    });

    const forgot = await user.req('POST', '/api/auth/forgot-password', {
      email: 'recover.user@example.com'
    });
    assert.equal(forgot.status, 200);
    assert.ok(forgot.json.previewResetToken);

    const reset = await user.req('POST', '/api/auth/reset-password', {
      token: forgot.json.previewResetToken,
      newPassword: 'RotatedPassword!2026'
    });
    assert.equal(reset.status, 200);

    // Prior session must be revoked after password reset
    const meOldSession = await user.req('GET', '/api/auth/me');
    assert.equal(meOldSession.status, 401);

    // Old password rejected
    const oldLogin = await new TestClient(baseUrl).req('POST', '/api/auth/login', {
      email: 'recover.user@example.com',
      password: 'InitialPassword!2026'
    });
    assert.equal(oldLogin.status, 401);

    // New password works and logout revokes session
    const freshLogin = new TestClient(baseUrl);
    const okLogin = await freshLogin.req('POST', '/api/auth/login', {
      email: 'recover.user@example.com',
      password: 'RotatedPassword!2026'
    });
    assert.equal(okLogin.status, 200);

    const out = await freshLogin.req('POST', '/api/auth/logout', {});
    assert.equal(out.status, 200);
    const afterOut = await freshLogin.req('GET', '/api/auth/me');
    assert.equal(afterOut.status, 401);
  });

  it('enforces strict cross-tenant and cross-store isolation across requests, formations, docs, stores, products, and invoices', async () => {
    const tenantA = new TestClient(baseUrl);
    await tenantA.req('POST', '/api/auth/login', {
      email: 'client@qabs1.store',
      password: 'QabsPreview!2026'
    });

    const tenantB = new TestClient(baseUrl);
    await tenantB.req('POST', '/api/auth/login', {
      email: 'merchant2@qabs1.store',
      password: 'QabsPreview!2026'
    });

    // Tenant A creates service request + PDF document
    const validPdfBase64 = Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF').toString('base64');
    const reqCreate = await tenantA.req('POST', '/api/service-requests', {
      serviceSlug: 'ein',
      serviceTitleAr: 'طلب EIN معزول',
      serviceTitleEn: 'Isolated EIN Request',
      customerName: 'Tenant A',
      customerEmail: 'client@qabs1.store',
      customerPhone: '+966500000001',
      status: 'draft',
      document: {
        name: 'passport-a.pdf',
        mimeType: 'application/pdf',
        base64: validPdfBase64
      }
    });
    assert.equal(reqCreate.status, 201);
    const reqAId = reqCreate.json.request.id;
    assert.equal(reqCreate.json.request.status, 'draft');

    // Tenant A creates standalone store (must stay draft & payment_connected=0 even if tampered)
    const storeCreate = await tenantA.req('POST', '/api/stores', {
      name: 'Tenant A Luxury Store',
      subdomain: 'tenanta-lux',
      status: 'active',
      paymentConnected: true
    });
    assert.equal(storeCreate.status, 201);
    const storeAId = storeCreate.json.store.id;
    assert.equal(storeCreate.json.store.status, 'draft');
    assert.equal(storeCreate.json.store.approval_status, 'draft');
    assert.equal(storeCreate.json.store.payment_connected, 0);

    // Tenant A creates product inside storeA
    const prodCreate = await tenantA.req('POST', `/api/stores/${storeAId}/products`, {
      titleAr: 'ساعة فاخرة معزولة',
      sku: 'ISO-WATCH-1',
      price: 499,
      stock: 10
    });
    assert.equal(prodCreate.status, 201);
    const prodAId = prodCreate.json.product.id;

    // Upload an extra private document for Tenant A
    const docUp = await tenantA.req('POST', '/api/documents', {
      name: 'secret-kyc.pdf',
      mimeType: 'application/pdf',
      base64: validPdfBase64,
      requestId: reqAId
    });
    assert.equal(docUp.status, 201);
    const docAId = docUp.json.document.id;

    // Cross-tenant blocking: Tenant B MUST receive 403 on all direct ID accesses belonging to Tenant A
    assert.equal((await tenantB.req('GET', `/api/service-requests/${reqAId}`)).status, 403);
    assert.equal((await tenantB.req('PATCH', `/api/service-requests/${reqAId}`, { status: 'cancelled' })).status, 403);
    assert.equal((await tenantB.req('GET', `/api/documents/${docAId}/download`)).status, 403);
    assert.equal((await tenantB.req('GET', `/api/stores/${storeAId}`)).status, 403);
    assert.equal((await tenantB.req('PATCH', `/api/stores/${storeAId}`, { name: 'UnauthorizedRename' })).status, 403);
    assert.equal((await tenantB.req('GET', `/api/stores/${storeAId}/products`)).status, 403);
    assert.equal((await tenantB.req('GET', `/api/stores/${storeAId}/products/${prodAId}`)).status, 403);
    assert.equal((await tenantB.req('PATCH', `/api/stores/${storeAId}/products/${prodAId}`, { price: 1 })).status, 403);
    assert.equal((await tenantB.req('DELETE', `/api/stores/${storeAId}/products/${prodAId}`)).status, 403);
    assert.equal((await tenantB.req('GET', `/api/stores/${storeAId}/orders`)).status, 403);
    assert.equal((await tenantB.req('GET', `/api/stores/${storeAId}/reports`)).status, 403);
    const formCreate = await tenantA.req('POST', '/api/formations', {
      companyName: 'Tenant A Isolated Holdings LLC',
      jurisdiction: 'US_WYOMING',
      entityType: 'LLC'
    });
    assert.equal(formCreate.status, 201);
    const formAId = formCreate.json.formation.id;
    assert.equal((await tenantB.req('GET', `/api/formations/${formAId}`)).status, 403);
    assert.equal((await tenantB.req('GET', `/api/formations/comp_atlas_1`)).status, 403);

    // Owner download succeeds cleanly with exact PDF header bytes
    const ownerDl = await tenantA.req('GET', `/api/documents/${docAId}/download`);
    assert.equal(ownerDl.status, 200);
    assert.ok(ownerDl.rawText.startsWith('%PDF-1.4'));

    // Non-PDF bytes claiming application/pdf must be rejected with 400 FILE_SIGNATURE_MISMATCH
    const invalidSig = await tenantA.req('POST', '/api/documents', {
      name: 'invalid-header.pdf',
      mimeType: 'application/pdf',
      base64: Buffer.from('PLAIN_TEXT_INVALID_PDF_HEADER').toString('base64')
    });
    assert.equal(invalidSig.status, 400);
    assert.equal(invalidSig.json.code, 'FILE_SIGNATURE_MISMATCH');
  });

  it('enforces RBAC roles, 8-status lifecycle notifications, invoice proof gate, and atomic AI credit ledger', async () => {
    const customer = new TestClient(baseUrl);
    await customer.req('POST', '/api/auth/login', {
      email: 'client@qabs1.store',
      password: 'QabsPreview!2026'
    });

    const staff = new TestClient(baseUrl);
    await staff.req('POST', '/api/auth/login', {
      email: 'staff@qabs1.store',
      password: 'QabsPreview!2026'
    });

    const support = new TestClient(baseUrl);
    await support.req('POST', '/api/auth/login', {
      email: 'support@qabs1.store',
      password: 'QabsPreview!2026'
    });

    const admin = new TestClient(baseUrl);
    await admin.req('POST', '/api/auth/login', {
      email: 'admin@qabs1.store',
      password: 'QabsPreview!2026'
    });

    const superAdmin = new TestClient(baseUrl);
    await superAdmin.req('POST', '/api/auth/login', {
      email: 'anwar@qabs1.store',
      password: 'QabsPreview!2026'
    });

    // Customer blocked from /api/admin/*
    assert.equal((await customer.req('GET', '/api/admin/overview')).status, 403);

    // Customer cannot self-mark order as completed (403), must stay within draft/new/cancelled
    const custReq = await customer.req('POST', '/api/service-requests', {
      serviceSlug: 'company-formation',
      serviceTitleAr: 'تأسيس شركة وايومنج',
      serviceTitleEn: 'Wyoming LLC',
      customerName: 'Merchant Customer',
      customerEmail: 'client@qabs1.store',
      customerPhone: '+966500000010',
      status: 'new'
    });
    const reqId = custReq.json.request.id;
    assert.equal((await customer.req('PATCH', `/api/service-requests/${reqId}`, { status: 'completed' })).status, 403);

    // Staff advances request through review statuses and adds adminNotes -> auto customer notification
    const stepReview = await staff.req('PATCH', `/api/service-requests/${reqId}`, {
      status: 'under_review',
      adminNotes: 'Passport checked by staff'
    });
    assert.equal(stepReview.status, 200);
    assert.equal(stepReview.json.request.status, 'under_review');

    const stepDone = await staff.req('PATCH', `/api/service-requests/${reqId}`, {
      status: 'completed',
      adminNotes: 'Filing approved'
    });
    assert.equal(stepDone.status, 200);

    const notifs = await customer.req('GET', '/api/notifications');
    assert.ok(notifs.json.notifications.some((n: any) => String(n.body_en).includes('Filing approved')));

    // Customer credit top-up creates pending_verification invoice and grants ZERO credits until admin verifies proof
    const bootBefore = await customer.req('GET', '/api/workspace/bootstrap');
    const creditsBefore = Number(bootBefore.json.user.credits);

    const topupReq = await customer.req('POST', '/api/billing/credits/request-topup', { amountUsd: 10 });
    assert.equal(topupReq.status, 201);
    assert.equal(topupReq.json.invoice.status, 'pending_verification');
    const invId = topupReq.json.invoice.id;

    const bootPending = await customer.req('GET', '/api/workspace/bootstrap');
    assert.equal(Number(bootPending.json.user.credits), creditsBefore);

    // Staff & Support blocked from verifying financial invoices (403)
    assert.equal(
      (await staff.req('PATCH', `/api/admin/invoices/${invId}/verify`, { paymentProofRef: 'WIRE-1234' })).status,
      403
    );
    assert.equal(
      (await support.req('PATCH', `/api/admin/invoices/${invId}/verify`, { paymentProofRef: 'WIRE-1234' })).status,
      403
    );

    // Admin blocked from verifying without paymentProofRef (400)
    assert.equal(
      (await admin.req('PATCH', `/api/admin/invoices/${invId}/verify`, { paymentProofRef: '' })).status,
      400
    );

    // Admin verifies invoice with proof reference -> marks paid, credits +100 atomically, logs ledger
    const verified = await admin.req('PATCH', `/api/admin/invoices/${invId}/verify`, {
      paymentProofRef: 'WIRE-994021'
    });
    assert.equal(verified.status, 200);
    assert.equal(verified.json.invoice.status, 'paid');

    const bootAfter = await customer.req('GET', '/api/workspace/bootstrap');
    assert.equal(Number(bootAfter.json.user.credits), creditsBefore + 100);

    // Atomic AI execution consumes 1 credit and records credit_ledger
    const aiExec = await customer.req('POST', '/api/ai/execute', { prompt: 'تحليل مبيعات المتجر' });
    assert.equal(aiExec.status, 200);
    assert.equal(Number(aiExec.json.creditsBalance), creditsBefore + 99);

    // Admin cannot escalate to super_admin (403); Super Admin can manage admin users (201)
    const adminEscalate = await admin.req('POST', '/api/admin/staff', {
      name: 'Blocked Super Admin',
      email: 'blocked.super@example.com',
      password: 'StrongPassword!2026',
      role: 'super_admin'
    });
    assert.equal(adminEscalate.status, 403);

    const superCreate = await superAdmin.req('POST', '/api/admin/staff', {
      name: 'Second Admin',
      email: 'second.admin@example.com',
      password: 'StrongPassword!2026',
      role: 'admin'
    });
    assert.equal(superCreate.status, 201);
    assert.equal(superCreate.json.user.role, 'admin');

    // Integration readiness endpoint is auth-gated, reports Tap/Moyasar GCC priority, and keeps paymentsEnabled=false
    const unauthInteg = await new TestClient(baseUrl).req('GET', '/api/integrations/status');
    assert.equal(unauthInteg.status, 401);

    const integ = await customer.req('GET', '/api/integrations/status');
    assert.equal(integ.status, 200);
    assert.equal(integ.json.paymentsEnabled, false);
    assert.equal(integ.json.integrations.tap.region, 'GCC');
    assert.equal(integ.json.integrations.moyasar.region, 'SA / GCC');

    // Merchant requests Tap/Moyasar GCC sandbox config; client secret keys are strictly rejected & payment_connected stays 0
    const custStore = await customer.req('POST', '/api/stores', { name: 'Riyadh Luxury Atelier', currency: 'SAR' });
    assert.equal(custStore.status, 201);
    const storeId = custStore.json.store.id;

    const rejectSecret = await customer.req('POST', `/api/stores/${storeId}/payment-request`, {
      gatewayType: 'Moyasar',
      secretKey: 'sk_test_should_never_be_sent'
    });
    assert.equal(rejectSecret.status, 400);
    assert.equal(rejectSecret.json.code, 'CLIENT_SECRET_NOT_ALLOWED');

    const tapReq = await customer.req('POST', `/api/stores/${storeId}/payment-request`, {
      gatewayType: 'Tap',
      sandboxConfig: { madaEnabled: true, applePayEnabled: true, merchantReference: 'gcc-merch-01' }
    });
    assert.equal(tapReq.status, 200);
    assert.equal(tapReq.json.store.gateway_type, 'Tap');
    assert.equal(tapReq.json.store.payment_connected, 0);
    assert.equal(tapReq.json.store.payment_approval_status, 'pending_admin_approval');

    const moyasarReq = await customer.req('POST', `/api/stores/${storeId}/payment-request`, {
      gatewayType: 'Moyasar',
      sandboxConfig: { madaEnabled: true, sadadEnabled: true, stcPayEnabled: true }
    });
    assert.equal(moyasarReq.status, 200);
    assert.equal(moyasarReq.json.store.gateway_type, 'Moyasar');
    assert.equal(moyasarReq.json.store.payment_connected, 0);

    // Admin reviews sandbox readiness while keeping live payment_connected strictly 0
    const adminReview = await admin.req('PATCH', `/api/admin/stores/${storeId}/payment-approval`, {
      decision: 'sandbox_verified'
    });
    assert.equal(adminReview.status, 200);
    assert.equal(adminReview.json.store.payment_connected, 0);
  });

  it('persists discounts, shipping zones, store pages, supplier imports, resend verification, subscription lifecycle, server backups, public CMS, and error telemetry with tenant & RBAC isolation', async () => {
    const tenantA = new TestClient(baseUrl);
    await tenantA.req('POST', '/api/auth/login', {
      email: 'client@qabs1.store',
      password: 'QabsPreview!2026'
    });

    const tenantB = new TestClient(baseUrl);
    await tenantB.req('POST', '/api/auth/login', {
      email: 'merchant2@qabs1.store',
      password: 'QabsPreview!2026'
    });

    const admin = new TestClient(baseUrl);
    await admin.req('POST', '/api/auth/login', {
      email: 'admin@qabs1.store',
      password: 'QabsPreview!2026'
    });

    // 1. Authenticated resend verification issues preview token & verifies
    const resendReg = new TestClient(baseUrl);
    await resendReg.req('POST', '/api/auth/register', {
      name: 'Resend Tester',
      email: 'resend.tester@example.com',
      password: 'StrongPassword!2026',
      companyName: 'Resend LLC'
    });
    const resendRes = await resendReg.req('POST', '/api/auth/resend-verification', {});
    assert.equal(resendRes.status, 200);
    assert.ok(resendRes.json.previewEmailVerifyToken);
    const verifyRes = await resendReg.req('POST', '/api/auth/verify-email', {
      token: resendRes.json.previewEmailVerifyToken
    });
    assert.equal(verifyRes.status, 200);
    assert.equal(verifyRes.json.emailVerified, true);

    // 2. Store-scoped Discounts, Shipping Zones, Store Pages & Supplier Import + Tenant B 403 isolation
    const storeRes = await tenantA.req('POST', '/api/stores', { name: 'GCC Flagship', currency: 'SAR' });
    assert.equal(storeRes.status, 201);
    const storeId = storeRes.json.store.id;

    const dscCreate = await tenantA.req('POST', `/api/stores/${storeId}/discounts`, {
      code: 'GCC25',
      type: 'percentage',
      value: 25,
      usageLimit: 50
    });
    assert.equal(dscCreate.status, 201);
    const dscId = dscCreate.json.discount.id;
    assert.equal(dscCreate.json.discount.code, 'GCC25');

    const dscToggle = await tenantA.req('PATCH', `/api/stores/${storeId}/discounts/${dscId}`, {});
    assert.equal(dscToggle.status, 200);
    assert.equal(dscToggle.json.discount.status, 'expired');

    const shpCreate = await tenantA.req('POST', `/api/stores/${storeId}/shipping-zones`, {
      regionNameAr: 'المنطقة الوسطى - الرياض',
      regionNameEn: 'Central Region - Riyadh',
      carrier: 'Aramex',
      rate: 22
    });
    assert.equal(shpCreate.status, 201);
    assert.equal(shpCreate.json.shippingZone.carrier, 'Aramex');

    const pgCreate = await tenantA.req('POST', `/api/stores/${storeId}/pages`, {
      slug: 'shipping-policy',
      titleAr: 'سياسة الشحن',
      titleEn: 'Shipping Policy',
      contentAr: 'شحن خلال يومين',
      contentEn: '2-day delivery',
      published: true
    });
    assert.equal(pgCreate.status, 201);
    const pgId = pgCreate.json.page.id;

    const supImport = await tenantA.req('POST', `/api/stores/${storeId}/supplier-import`, {
      supplierName: 'CJ Dropshipping',
      titleAr: 'سماعة ذكية مستوردة',
      titleEn: 'Imported Smart Buds',
      retailPrice: 180,
      costPrice: 70,
      stock: 40
    });
    assert.equal(supImport.status, 201);
    assert.equal(supImport.json.product.title_ar, 'سماعة ذكية مستوردة');

    // Cross-tenant blocking on all new store sub-routes
    assert.equal((await tenantB.req('GET', `/api/stores/${storeId}/discounts`)).status, 403);
    assert.equal((await tenantB.req('POST', `/api/stores/${storeId}/discounts`, { code: 'HACK', value: 90 })).status, 403);
    assert.equal((await tenantB.req('PATCH', `/api/stores/${storeId}/discounts/${dscId}`, { status: 'active' })).status, 403);
    assert.equal((await tenantB.req('GET', `/api/stores/${storeId}/shipping-zones`)).status, 403);
    assert.equal((await tenantB.req('POST', `/api/stores/${storeId}/shipping-zones`, { regionNameAr: 'Hack', rate: 0 })).status, 403);
    assert.equal((await tenantB.req('GET', `/api/stores/${storeId}/pages`)).status, 403);
    assert.equal((await tenantB.req('DELETE', `/api/stores/${storeId}/pages/${pgId}`)).status, 403);
    assert.equal((await tenantB.req('POST', `/api/stores/${storeId}/supplier-import`, { titleAr: 'Hack', retailPrice: 10 })).status, 403);

    // Bootstrap includes newly persisted items
    const bootA = await tenantA.req('GET', '/api/workspace/bootstrap');
    assert.equal(bootA.status, 200);
    assert.ok(bootA.json.discounts.some((d: any) => d.id === dscId));
    assert.ok(bootA.json.shippingZones.some((z: any) => z.carrier === 'Aramex'));
    assert.ok(bootA.json.storePages.some((p: any) => p.id === pgId));

    // Owner delete page cleans up
    assert.equal((await tenantA.req('DELETE', `/api/stores/${storeId}/pages/${pgId}`)).status, 200);

    // 3. Subscription renew (always pending_verification) & cancel
    const renewRes = await tenantA.req('POST', '/api/billing/subscription-renew', {
      planId: 'growth',
      billingCycle: 'monthly'
    });
    assert.equal(renewRes.status, 201);
    assert.equal(renewRes.json.invoice.status, 'pending_verification');
    assert.equal(renewRes.json.invoice.invoice_kind, 'subscription_renewal');

    const cancelRes = await tenantA.req('POST', '/api/billing/subscription-cancel', {
      reason: 'Testing pause'
    });
    assert.equal(cancelRes.status, 200);
    assert.equal(cancelRes.json.subscription.status, 'cancelled');

    // 4. Server-side Workspace Backup + cross-tenant isolation
    const bakRes = await tenantA.req('POST', '/api/workspace/backup', { label: 'Tenant A Snap' });
    assert.equal(bakRes.status, 201);
    const bakId = bakRes.json.backup.id;
    assert.ok(bakRes.json.backup.size_bytes > 20);

    const listBakA = await tenantA.req('GET', '/api/workspace/backups');
    assert.equal(listBakA.status, 200);
    assert.ok(listBakA.json.backups.some((b: any) => b.id === bakId));

    const listBakB = await tenantB.req('GET', '/api/workspace/backups');
    assert.equal(listBakB.status, 200);
    assert.ok(!listBakB.json.backups.some((b: any) => b.id === bakId));

    // 5. Public CMS site-content read & Admin-only write
    assert.equal(
      (await tenantA.req('PATCH', '/api/admin/site-content', { siteContent: { heroTitleAr: 'اختراق' } })).status,
      403
    );
    const cmsWrite = await admin.req('PATCH', '/api/admin/site-content', {
      siteContent: { heroTitleAr: 'منصة قبس المحدثة', heroTitleEn: 'QABS Updated Platform' }
    });
    assert.equal(cmsWrite.status, 200);
    const cmsPublic = await new TestClient(baseUrl).req('GET', '/api/site-content');
    assert.equal(cmsPublic.status, 200);
    assert.equal(cmsPublic.json.siteContent.heroTitleEn, 'QABS Updated Platform');

    // 6. Admin error logs RBAC & integrations cloudflare/email metadata
    assert.equal((await tenantA.req('GET', '/api/admin/error-logs')).status, 403);
    const errLogsRes = await admin.req('GET', '/api/admin/error-logs');
    assert.equal(errLogsRes.status, 200);
    assert.ok(Array.isArray(errLogsRes.json.errorLogs));

    const integRes = await tenantA.req('GET', '/api/integrations/status');
    assert.equal(integRes.status, 200);
    assert.equal(integRes.json.paymentsEnabled, false);
    assert.equal(integRes.json.integrations.cloudflare.workersReady, true);
    assert.ok(typeof integRes.json.integrations.email.provider === 'string');
  });

  it('persists store customers, design sections/checklist settings, support tickets, and dispatches Resend emails when RESEND_API_KEY is set', async () => {
    const tenantA = new TestClient(baseUrl);
    await tenantA.req('POST', '/api/auth/login', {
      email: 'client@qabs1.store',
      password: 'QabsPreview!2026'
    });

    const tenantB = new TestClient(baseUrl);
    await tenantB.req('POST', '/api/auth/login', {
      email: 'merchant2@qabs1.store',
      password: 'QabsPreview!2026'
    });

    // 1. Store customers creation & tenant isolation
    const storeRes = await tenantA.req('POST', '/api/stores', { name: 'Saudi Heritage Atelier', currency: 'SAR' });
    assert.equal(storeRes.status, 201);
    const storeId = storeRes.json.store.id;

    const custRes = await tenantA.req('POST', `/api/stores/${storeId}/customers`, {
      name: 'سلطان العتيبي',
      email: 'sultan.customer@example.com',
      phone: '+966550011223',
      country: 'SA'
    });
    assert.equal(custRes.status, 201);
    assert.equal(custRes.json.customer.email, 'sultan.customer@example.com');
    assert.equal(
      (await tenantB.req('POST', `/api/stores/${storeId}/customers`, { name: 'Intruder', email: 'hack@example.com' })).status,
      403
    );

    // 2. Store design sections & setupStepsCompleted persistence
    const patchStore = await tenantA.req('PATCH', `/api/stores/${storeId}`, {
      settings: {
        setupStepsCompleted: ['brand_identity', 'first_product'],
        sections: [{ id: 'sec_hero', type: 'hero', titleAr: 'رئيسية مخصصة', titleEn: 'Custom Hero', visible: true }]
      }
    });
    assert.equal(patchStore.status, 200);
    const parsedSettings = JSON.parse(String(patchStore.json.store.settings_json || '{}'));
    assert.deepEqual(parsedSettings.setupStepsCompleted, ['brand_identity', 'first_product']);
    assert.equal(parsedSettings.sections[0].titleEn, 'Custom Hero');

    // 3. Support ticket creation, resolution & cross-tenant block
    const tktRes = await tenantA.req('POST', '/api/tickets', {
      subject: 'استفسار ربط الدفع الخليجي',
      category: 'billing',
      priority: 'high',
      lastMessage: 'يرجى تأكيد إعدادات Tap'
    });
    assert.equal(tktRes.status, 201);
    const tktId = tktRes.json.ticket.id;
    assert.equal((await tenantB.req('PATCH', `/api/tickets/${tktId}`, { status: 'resolved' })).status, 403);
    const tktResolve = await tenantA.req('PATCH', `/api/tickets/${tktId}`, { status: 'resolved' });
    assert.equal(tktResolve.status, 200);
    assert.equal(tktResolve.json.ticket.status, 'resolved');

    // 4. Resend email dispatch when RESEND_API_KEY is configured
    const origFetch = globalThis.fetch;
    const origResendKey = process.env.RESEND_API_KEY;
    const resendCalls: { url: string; auth?: string; body: any }[] = [];
    try {
      process.env.RESEND_API_KEY = 're_test_sandbox_verification_stub';
      globalThis.fetch = (async (input: any, init?: any) => {
        const url = typeof input === 'string' ? input : input?.url || '';
        if (url === 'https://api.resend.com/emails') {
          resendCalls.push({
            url,
            auth: init?.headers?.Authorization || init?.headers?.authorization,
            body: JSON.parse(String(init?.body || '{}'))
          });
          return new Response(JSON.stringify({ id: 'email_test_123' }), {
            status: 200,
            headers: { 'content-type': 'application/json' }
          });
        }
        return origFetch(input, init);
      }) as typeof fetch;

      const resendDispatch = await tenantA.req('POST', '/api/auth/resend-verification', {});
      assert.equal(resendDispatch.status, 200);
      assert.equal(resendDispatch.json.emailProvider, 'resend');
      assert.equal(resendDispatch.json.emailDispatched, true);
      assert.equal(resendCalls.length, 1);
      assert.equal(resendCalls[0].body.to[0], 'client@qabs1.store');
    } finally {
      globalThis.fetch = origFetch;
      if (origResendKey === undefined) delete process.env.RESEND_API_KEY;
      else process.env.RESEND_API_KEY = origResendKey;
    }
  });
});

