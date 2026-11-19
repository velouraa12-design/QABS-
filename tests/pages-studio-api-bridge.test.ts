import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { onRequest } from '../functions/studio/api/[[path]].ts';
import { readFileSync } from 'node:fs';

const API_ORIGIN = 'https://qabs-stores-acceptance-preview.qabs1store.workers.dev';
const UPSTREAM_ORIGIN = 'https://qabs-unified-workspace-staging-v2.qabs1store.workers.dev';

describe('QABS Pages preview Studio API bridge', () => {
  it('forwards same-origin mutations, cookies, CSRF and request body to the isolated API binding', async () => {
    const forwarded: Request[] = [];
    const env = {
      QABS_STUDIO_API: {
        fetch: async (request: Request) => {
          forwarded.push(request);
          return new Response(JSON.stringify({ ok: true }), {
            headers: { 'Content-Type': 'application/json', 'Set-Cookie': '__Host-qdp_session=synthetic; Secure; HttpOnly; SameSite=Strict; Path=/' }
          });
        }
      }
    };
    const request = new Request('https://preview.example.test/studio/api/auth/login?source=ci', {
      method: 'POST',
      headers: {
        Origin: 'https://preview.example.test',
        Cookie: '__Host-qdp_session=synthetic',
        'X-CSRF-Token': 'synthetic-csrf',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: 'ci@example.test', password: 'synthetic-only' })
    });

    const response = await onRequest({ request, env });
    assert.equal(response.status, 200);
    assert.equal(forwarded.length, 1);
    const forwardedRequest = forwarded[0]!;
    assert.equal(forwardedRequest.url, UPSTREAM_ORIGIN + '/studio/api/auth/login?source=ci');
    assert.equal(forwardedRequest.headers.get('Origin'), API_ORIGIN);
    assert.equal(forwardedRequest.headers.get('Cookie'), '__Host-qdp_session=synthetic');
    assert.equal(forwardedRequest.headers.get('X-CSRF-Token'), 'synthetic-csrf');
    assert.deepEqual(await forwardedRequest.json(), { email: 'ci@example.test', password: 'synthetic-only' });
    assert.match(response.headers.get('Set-Cookie') || '', /HttpOnly/);
  });

  it('rejects cross-origin state-changing requests before calling the API binding', async () => {
    let called = false;
    const env = {
      QABS_STUDIO_API: {
        fetch: async () => {
          called = true;
          return new Response('{}');
        }
      }
    };
    const request = new Request('https://preview.example.test/studio/api/project-workspaces', {
      method: 'POST',
      headers: { Origin: 'https://attacker.example', 'Content-Type': 'application/json' },
      body: '{}'
    });

    const response = await onRequest({ request, env });
    assert.equal(response.status, 403);
    assert.equal(called, false);
    assert.deepEqual(await response.json(), { error: 'origin_rejected' });
  });


  it('binds the staging API in both deployment environments of the isolated Pages project', () => {
    const config = JSON.parse(readFileSync(new URL('../wrangler.jsonc', import.meta.url), 'utf8')) as {
      env?: {
        preview?: { services?: Array<{ binding: string; service: string }> };
        production?: { services?: Array<{ binding: string; service: string }> };
      };
    };
    for (const environment of [config.env?.preview, config.env?.production]) {
      const binding = environment?.services?.find(service => service.binding === 'QABS_STUDIO_API');
      assert.equal(binding?.service, 'qabs-unified-workspace-staging-v2');
    }
  });

  it('allows anonymous read-only config requests without an Origin header', async () => {
    let forwardedUrl = '';
    const env = {
      QABS_STUDIO_API: {
        fetch: async (request: Request) => {
          forwardedUrl = request.url;
          return Response.json({ registration: true, payments: false });
        }
      }
    };
    const request = new Request('https://preview.example.test/studio/api/config');
    const response = await onRequest({ request, env });
    assert.equal(response.status, 200);
    assert.equal(forwardedUrl, UPSTREAM_ORIGIN + '/studio/api/config');
    assert.deepEqual(await response.json(), { registration: true, payments: false });
  });
});
