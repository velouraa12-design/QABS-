import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { studioApi } from '../src/services/qabsStudioApi.ts';

describe('QABS Studio API client contract', () => {
  it('uses the same-origin Studio prefix, HttpOnly-cookie credentials, and CSRF on writes', async () => {
    const originalFetch = globalThis.fetch;
    const calls: Array<{ url: string; method: string; headers: Headers; body: unknown; credentials?: RequestCredentials }> = [];
    globalThis.fetch = (async (input: RequestInfo | URL, init: RequestInit = {}) => {
      const headers = new Headers(init.headers);
      calls.push({
        url: String(input),
        method: String(init.method || 'GET'),
        headers,
        body: init.body,
        credentials: init.credentials
      });
      const response = calls.length === 1
        ? { id: 'synthetic-user-a', email: 'alpha@example.test', role: 'client', emailVerified: true, csrf: 'csrf-alpha-only' }
        : calls.length === 2
          ? { id: 'draft-a', status: 'draft', published: false, payments: false }
          : { request: { id: 'request-a', service: 'formation', title: 'Synthetic request', status: 'draft', payload: {} } };
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }) as typeof fetch;

    try {
      await studioApi.me();
      await studioApi.createStoreDraft({
        attempt_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        template_key: 'classic-store',
        name: 'Synthetic Alpha Store'
      });
      await studioApi.createServiceRequest({
        service: 'formation',
        title: 'Synthetic formation request',
        payload: { state: 'WY', company_name: 'Synthetic Alpha LLC' },
        attempt_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
      });

      assert.equal(calls[0].url, '/studio/api/me');
      assert.equal(calls[0].method, 'GET');
      assert.equal(calls[0].credentials, 'same-origin');
      assert.equal(calls[1].url, '/studio/api/store-drafts');
      assert.equal(calls[1].method, 'POST');
      assert.equal(calls[1].credentials, 'same-origin');
      assert.equal(calls[1].headers.get('X-CSRF-Token'), 'csrf-alpha-only');
      assert.deepEqual(JSON.parse(String(calls[1].body)), {
        attempt_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        template_key: 'classic-store',
        name: 'Synthetic Alpha Store'
      });
      assert.equal(calls[2].url, '/studio/api/services/requests');
      assert.equal(calls[2].method, 'POST');
      assert.equal(calls[2].headers.get('X-CSRF-Token'), 'csrf-alpha-only');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('does not expose payment activation in the service catalogue contract', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () => new Response(JSON.stringify({
      services: [],
      statusLabels: {},
      statusLabelsEn: {},
      payments: false,
      externalExecution: 'manual_after_approval',
      attachments: { enabled: true, maxBytes: 262144, sensitiveDocumentsAllowed: false, malwareScanning: false },
      preview: true
    }), { status: 200, headers: { 'Content-Type': 'application/json' } })) as typeof fetch;
    try {
      const catalog = await studioApi.servicesCatalog();
      assert.equal(catalog.payments, false);
      assert.equal(catalog.externalExecution, 'manual_after_approval');
      assert.equal(catalog.attachments.sensitiveDocumentsAllowed, false);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
