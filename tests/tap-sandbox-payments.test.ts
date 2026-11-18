import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createTapSandboxCharge, isTapTestSecret, retrieveTapSandboxCharge } from '../server/payments/tap.ts';

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

  it('retrieves a Tap charge and normalizes the verification fields', async () => {
    let requestUrl = '';
    const fakeFetch = (async (url: string | URL | Request) => {
      requestUrl = String(url);
      return new Response(JSON.stringify({
        id: 'chg_test_123',
        status: 'CAPTURED',
        live_mode: false,
        amount: 349,
        currency: 'USD',
        reference: { transaction: 'inv_test_1', order: 'INV-TEST-1' }
      }), { status: 200, headers: { 'content-type': 'application/json' } });
    }) as typeof fetch;
    const charge = await retrieveTapSandboxCharge('chg_test_123', 'sk_test_123', fakeFetch);
    assert.equal(requestUrl, 'https://api.tap.company/v2/charges/chg_test_123');
    assert.deepEqual(charge, {
      id: 'chg_test_123',
      status: 'CAPTURED',
      liveMode: false,
      amount: 349,
      currency: 'USD',
      transactionReference: 'inv_test_1',
      orderReference: 'INV-TEST-1'
    });
  });

  it('rejects malformed charge ids and never accepts live-mode credentials', async () => {
    let calls = 0;
    const fakeFetch = (async () => {
      calls += 1;
      return new Response('{}', { status: 200 });
    }) as typeof fetch;
    await assert.rejects(() => retrieveTapSandboxCharge('not-a-charge', 'sk_test_123', fakeFetch), /INVALID_TAP_CHARGE_ID/);
    await assert.rejects(() => retrieveTapSandboxCharge('chg_test_123', 'sk_live_123', fakeFetch), /TAP_SANDBOX_KEY_REQUIRED/);
    assert.equal(calls, 0);
  });
});
