import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createQabsApp } from '../server/app.ts';

describe('Tap sandbox payment API — authenticated tenant invoice flow', () => {
  it('creates a hosted sandbox charge from invoice data and verifies it server-side', async () => {
    const originalFetch = globalThis.fetch;
    const originalEnv = {
      allow: process.env.QABS_ALLOW_SANDBOX_PAYMENTS,
      tap: process.env.TAP_SECRET_KEY,
      origin: process.env.APP_ORIGIN,
      resend: process.env.RESEND_API_KEY
    };
    process.env.QABS_ALLOW_SANDBOX_PAYMENTS = 'true';
    process.env.TAP_SECRET_KEY = 'sk_test_qabs_fake_key';
    process.env.APP_ORIGIN = 'https://preview.qabs1.store';
    delete process.env.RESEND_API_KEY;

    const { app, db } = createQabsApp({ dbPath: ':memory:', exposePreviewTokens: true, rateLimitMax: 100 });
    const server = app.listen(0, '127.0.0.1');
    await new Promise<void>(resolve => server.once('listening', resolve));
    const address = server.address();
    assert.ok(address && typeof address === 'object');
    const baseUrl = `http://127.0.0.1:${address.port}`;

    try {
      const registration = await originalFetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: 'Sandbox Customer',
          email: 'tap.sandbox@example.test',
          password: 'StrongPassword!2026',
          companyName: 'Sandbox Test LLC'
        })
      });
      assert.equal(registration.status, 201);
      const auth = await registration.json() as {
        user: { id: string; tenantId: string; email: string };
        csrfToken: string;
      };
      const cookie = registration.headers.get('set-cookie')?.match(/qabs_session=([^;]+)/)?.[1];
      assert.ok(cookie);
      assert.ok(auth.csrfToken);

      db.prepare(`
        INSERT INTO billing_invoices (
          id, invoice_number, tenant_id, amount, currency, description_ar, description_en,
          invoice_kind, status, issued_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'inv_tap_sandbox_1',
        'INV-TAP-TEST-1',
        auth.user.tenantId,
        349,
        'USD',
        'فاتورة اختبار بوابة Tap',
        'Tap sandbox integration test invoice',
        'service',
        'pending_verification',
        '2026-11-18'
      );

      const tapChargeRequest: { current?: Record<string, any> } = {};
      globalThis.fetch = (async (input: RequestInfo | URL, init: RequestInit = {}) => {
        const url = String(input);
        if (url.endsWith('/v2/charges/') && init.method === 'POST') {
          tapChargeRequest.current = JSON.parse(String(init.body));
          return new Response(JSON.stringify({
            id: 'chg_TapSandbox123',
            status: 'INITIATED',
            live_mode: false,
            transaction: { url: 'https://checkout.tap.company/sandbox/123' }
          }), { status: 200, headers: { 'content-type': 'application/json' } });
        }
        if (url.endsWith('/v2/charges/chg_TapSandbox123') && init.method === 'GET') {
          return new Response(JSON.stringify({
            id: 'chg_TapSandbox123',
            status: 'CAPTURED',
            live_mode: false,
            amount: 349,
            currency: 'USD',
            reference: { transaction: 'inv_tap_sandbox_1', order: 'INV-TAP-TEST-1' }
          }), { status: 200, headers: { 'content-type': 'application/json' } });
        }
        throw new Error('Unexpected outbound request in Tap integration test');
      }) as typeof fetch;

      const headers = {
        cookie: `qabs_session=${cookie}`,
        'content-type': 'application/json',
        'x-csrf-token': auth.csrfToken
      };
      const chargeResponse = await originalFetch(`${baseUrl}/api/payments/tap/charges`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ invoiceId: 'inv_tap_sandbox_1', amount: 1 })
      });
      assert.equal(chargeResponse.status, 201);
      const charge = await chargeResponse.json() as Record<string, any>;
      assert.equal(charge.mode, 'sandbox');
      assert.equal(charge.paymentConfirmed, false);
      assert.equal(charge.redirectUrl, 'https://checkout.tap.company/sandbox/123');
      assert.equal(tapChargeRequest.current?.amount, 349, 'server must use invoice amount, not client amount');
      assert.equal(tapChargeRequest.current?.currency, 'USD');
      assert.equal(tapChargeRequest.current?.save_card, false);

      const beforeVerify = db.prepare('SELECT status, payment_proof_ref FROM billing_invoices WHERE id = ?')
        .get('inv_tap_sandbox_1') as { status: string; payment_proof_ref: string };
      assert.equal(beforeVerify.status, 'pending_verification');
      assert.equal(beforeVerify.payment_proof_ref, 'tap:chg_TapSandbox123');

      const verifyResponse = await originalFetch(`${baseUrl}/api/payments/tap/verify`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ invoiceId: 'inv_tap_sandbox_1', chargeId: 'chg_TapSandbox123' })
      });
      assert.equal(verifyResponse.status, 200);
      const verified = await verifyResponse.json() as Record<string, any>;
      assert.equal(verified.paymentConfirmed, true);
      assert.equal(verified.invoice.status, 'paid');

      const missingCsrf = await originalFetch(`${baseUrl}/api/payments/tap/charges`, {
        method: 'POST',
        headers: { cookie: `qabs_session=${cookie}`, 'content-type': 'application/json' },
        body: JSON.stringify({ invoiceId: 'inv_tap_sandbox_1' })
      });
      assert.equal(missingCsrf.status, 403);
    } finally {
      globalThis.fetch = originalFetch;
      await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
      if (originalEnv.allow === undefined) delete process.env.QABS_ALLOW_SANDBOX_PAYMENTS;
      else process.env.QABS_ALLOW_SANDBOX_PAYMENTS = originalEnv.allow;
      if (originalEnv.tap === undefined) delete process.env.TAP_SECRET_KEY;
      else process.env.TAP_SECRET_KEY = originalEnv.tap;
      if (originalEnv.origin === undefined) delete process.env.APP_ORIGIN;
      else process.env.APP_ORIGIN = originalEnv.origin;
      if (originalEnv.resend === undefined) delete process.env.RESEND_API_KEY;
      else process.env.RESEND_API_KEY = originalEnv.resend;
      db.close();
    }
  });
});
