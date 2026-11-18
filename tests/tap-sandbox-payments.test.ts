import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createTapSandboxCharge, isTapTestSecret } from '../server/payments/tap.ts';

describe('Tap sandbox payment adapter', () => {
  const input = {
    amount: 349,
    currency: 'USD',
    description: 'QABS service invoice INV-TEST-1',
    invoiceId: 'inv_test_1',
    invoiceNumber: 'INV-TEST-1',
    customerName: 'QABS Test Customer',
    customerEmail: 'customer@example.test',
    redirectUrl: 'https://preview.qabs1.store/payment/return?invoice=inv_test_1'
  };

  it('accepts only Tap test-mode secret keys', () => {
    assert.equal(isTapTestSecret('sk_test_123'), true);
    assert.equal(isTapTestSecret('sk_live_123'), false);
    assert.equal(isTapTestSecret(undefined), false);
  });

  it('refuses live or missing credentials before making a network request', async () => {
    let calls = 0;
    const fakeFetch = (async () => {
      calls += 1;
      return new Response('{}', { status: 200 });
    }) as typeof fetch;
    await assert.rejects(() => createTapSandboxCharge(input, 'sk_live_do_not_use', fakeFetch), /TAP_SANDBOX_KEY_REQUIRED/);
    await assert.rejects(() => createTapSandboxCharge(input, undefined, fakeFetch), /TAP_SANDBOX_KEY_REQUIRED/);
    assert.equal(calls, 0);
  });

  it('rejects invalid amount, currency and non-HTTPS redirect', async () => {
    const fakeFetch = (async () => new Response('{}', { status: 200 })) as typeof fetch;
    await assert.rejects(() => createTapSandboxCharge({ ...input, amount: 0 }, 'sk_test_123', fakeFetch), /INVALID_PAYMENT_AMOUNT/);
    await assert.rejects(() => createTapSandboxCharge({ ...input, currency: 'US' }, 'sk_test_123', fakeFetch), /INVALID_PAYMENT_CURRENCY/);
    await assert.rejects(() => createTapSandboxCharge({ ...input, redirectUrl: 'http://example.test' }, 'sk_test_123', fakeFetch), /INVALID_PAYMENT_CONTEXT/);
  });

  it('creates a Tap hosted sandbox charge and returns only the redirect details', async () => {
    let requestUrl = '';
    let requestInit: RequestInit | undefined;
    const fakeFetch = (async (url: string | URL | Request, init?: RequestInit) => {
      requestUrl = String(url);
      requestInit = init;
      return new Response(JSON.stringify({
        id: 'chg_test_123',
        status: 'INITIATED',
        transaction: { url: 'https://checkout.tap.company/pay/chg_test_123' }
      }), { status: 200, headers: { 'content-type': 'application/json' } });
    }) as typeof fetch;

    const result = await createTapSandboxCharge(input, 'sk_test_123', fakeFetch);
    assert.equal(requestUrl, 'https://api.tap.company/v2/charges/');
    assert.equal(result.id, 'chg_test_123');
    assert.equal(result.status, 'INITIATED');
    assert.equal(result.redirectUrl, 'https://checkout.tap.company/pay/chg_test_123');
    assert.equal(new Headers(requestInit?.headers).get('authorization'), 'Bearer sk_test_123');
    const body = JSON.parse(String(requestInit?.body));
    assert.equal(body.amount, 349);
    assert.equal(body.currency, 'USD');
    assert.equal(body.source.id, 'src_all');
    assert.equal(body.save_card, false);
    assert.equal(body.threeDSecure, true);
  });

  it('does not leak Tap error response bodies to callers', async () => {
    const fakeFetch = (async () => new Response(JSON.stringify({ secret: 'provider-private-detail' }), { status: 401 })) as typeof fetch;
    await assert.rejects(
      () => createTapSandboxCharge(input, 'sk_test_123', fakeFetch),
      error => error instanceof Error && error.message === 'TAP_SANDBOX_AUTH_FAILED'
    );
  });
});
