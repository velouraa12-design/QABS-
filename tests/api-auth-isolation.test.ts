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

  before(async () => {
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
  });
});
