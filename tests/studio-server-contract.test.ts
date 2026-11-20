import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createQabsApp } from '../server/app.ts';

type Json = Record<string, any>;

class StudioClient {
  cookie = '';
  csrf = '';
  constructor(readonly baseUrl: string) {}

  async request(method: string, path: string, body?: Json): Promise<{ status: number; json: Json }> {
    const headers: Record<string, string> = { accept: 'application/json' };
    if (this.cookie) headers.cookie = this.cookie;
    if (body !== undefined) headers['content-type'] = 'application/json';
    if (this.csrf && !['GET', 'HEAD', 'OPTIONS'].includes(method)) headers['x-csrf-token'] = this.csrf;
    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    const setCookie = response.headers.get('set-cookie');
    const match = setCookie?.match(/qabs_session=([^;]+)/);
    if (match) this.cookie = match[1] ? `qabs_session=${match[1]}` : '';
    const json = await response.json().catch(() => ({})) as Json;
    if (typeof json.csrfToken === 'string') this.csrf = json.csrfToken;
    if (typeof json.csrf === 'string') this.csrf = json.csrf;
    return { status: response.status, json };
  }

  async register(email: string) {
    return this.request('POST', '/studio/api/auth/register', {
      name: email.split('@')[0],
      email,
      password: 'SyntheticStrong!2026',
      companyName: 'Synthetic Studio Tenant'
    });
  }
}

describe('QABS Studio server contract (isolated SQLite)', () => {
  it('authenticates through Studio aliases and enforces workspace tenant boundaries', async () => {
    const originalFetch = globalThis.fetch;
    const originalEnv = {
      registration: process.env.QABS_REGISTRATION_ENABLED,
      verification: process.env.QABS_EMAIL_VERIFICATION_ENABLED,
      resend: process.env.RESEND_API_KEY
    };
    process.env.QABS_REGISTRATION_ENABLED = 'true';
    process.env.QABS_EMAIL_VERIFICATION_ENABLED = 'true';
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
    const { app } = createQabsApp({ dbPath: ':memory:', exposePreviewTokens: true, rateLimitMax: 100 });
    const server = app.listen(0, '127.0.0.1');
    await new Promise<void>(resolve => server.once('listening', resolve));
    const address = server.address();
    assert.ok(address && typeof address === 'object');
    const baseUrl = `http://127.0.0.1:${address.port}`;
    const alpha = new StudioClient(baseUrl);
    const beta = new StudioClient(baseUrl);

    try {
      const config = await alpha.request('GET', '/studio/api/config');
      assert.equal(config.status, 200);
      assert.equal(config.json.payments, false);
      assert.equal(config.json.registration, true);
      assert.equal(config.json.emailVerification, true);
      assert.equal(config.json.passwordRecovery, false);
      assert.equal(config.json.formationDetails, false);
      assert.equal(config.json.documents, false);
      assert.equal(config.json.privateDocuments, false);
      assert.equal(config.json.googleSignIn, false);

      const alphaReg = await alpha.register('studio.alpha@example.test');
      assert.equal(alphaReg.status, 201);
      assert.equal(alphaReg.json.user.role, 'customer');
      assert.ok(alpha.cookie);

      const betaReg = await beta.register('studio.beta@example.test');
      assert.equal(betaReg.status, 201);
      assert.ok(beta.cookie);

      // Workspace APIs are available only after the mailbox has been verified.
      const alphaVerified = await alpha.request('POST', '/api/auth/verify-email', {
        token: alphaReg.json.previewEmailVerifyToken
      });
      assert.equal(alphaVerified.status, 200);
      const betaVerified = await beta.request('POST', '/api/auth/verify-email', {
        token: betaReg.json.previewEmailVerifyToken
      });
      assert.equal(betaVerified.status, 200);

      const alphaMe = await alpha.request('GET', '/studio/api/me');
      assert.equal(alphaMe.status, 200);
      assert.equal(alphaMe.json.id, alphaReg.json.user.id);
      assert.equal(typeof alphaMe.json.csrf, 'string');

      const workspaces = await alpha.request('GET', '/studio/api/project-workspaces');
      assert.equal(workspaces.status, 200);
      assert.equal(workspaces.json.workspaces.length, 1);
      const alphaWorkspaceId = workspaces.json.workspaces[0].id;

      const ownStores = await alpha.request(
        'GET',
        `/studio/api/workspace-stores?workspace_id=${encodeURIComponent(alphaWorkspaceId)}`
      );
      assert.equal(ownStores.status, 200);
      assert.equal(ownStores.json.operational_commerce_migrated, false);

      const catalog = await alpha.request('GET', '/studio/api/services/catalog');
      assert.equal(catalog.status, 200);
      assert.equal(catalog.json.payments, false);
      assert.equal(catalog.json.externalExecution, 'manual_review_only');

      const createRequest = await alpha.request('POST', '/studio/api/services/requests', {
        service: 'company-formation',
        title: 'Synthetic formation assessment',
        attempt_id: 'alpha-attempt-0001',
        workspace_id: alphaWorkspaceId,
        payload: { companyName: 'Synthetic Alpha LLC', purpose: 'tenant isolation test' }
      });
      assert.equal(createRequest.status, 201);
      assert.equal(createRequest.json.request.status, 'new');
      assert.equal(createRequest.json.request.payload.includes('Synthetic Alpha LLC'), true);
      assert.equal(createRequest.json.replayed, false);

      const replayRequest = await alpha.request('POST', '/studio/api/services/requests', {
        service: 'company-formation',
        title: 'Changed title must not create a duplicate',
        attempt_id: 'alpha-attempt-0001',
        workspace_id: alphaWorkspaceId,
        payload: { companyName: 'Changed Synthetic Name' }
      });
      assert.equal(replayRequest.status, 200);
      assert.equal(replayRequest.json.replayed, true);
      assert.equal(replayRequest.json.request.id, createRequest.json.request.id);

      const alphaServiceRequests = await alpha.request('GET', '/studio/api/services/requests');
      assert.equal(alphaServiceRequests.status, 200);
      assert.equal(alphaServiceRequests.json.requests.length, 1);
      assert.equal(alphaServiceRequests.json.requests[0].id, createRequest.json.request.id);

      const betaServiceRequests = await beta.request('GET', '/studio/api/services/requests');
      assert.equal(betaServiceRequests.status, 200);
      assert.equal(betaServiceRequests.json.requests.length, 0);

      const crossTenantRequest = await beta.request('POST', '/studio/api/services/requests', {
        service: 'company-formation',
        title: 'Cross-tenant attempt',
        attempt_id: 'beta-attempt-0001',
        workspace_id: alphaWorkspaceId,
        payload: { companyName: 'Must Not Be Created' }
      });
      assert.equal(crossTenantRequest.status, 403);
      assert.equal(crossTenantRequest.json.code, 'FORBIDDEN_TENANT_ACCESS');

      const crossTenant = await beta.request(
        'GET',
        `/studio/api/workspace-stores?workspace_id=${encodeURIComponent(alphaWorkspaceId)}`
      );
      assert.equal(crossTenant.status, 403);
      assert.equal(crossTenant.json.code, 'FORBIDDEN_TENANT_ACCESS');

      const logout = await alpha.request('POST', '/studio/api/auth/logout', {});
      assert.equal(logout.status, 200);
      const afterLogout = await alpha.request('GET', '/studio/api/me');
      assert.equal(afterLogout.status, 401);
    } finally {
      await new Promise<void>((resolve, reject) =>
        server.close(error => error ? reject(error) : resolve())
      );
      globalThis.fetch = originalFetch;
      if (originalEnv.registration === undefined) delete process.env.QABS_REGISTRATION_ENABLED;
      else process.env.QABS_REGISTRATION_ENABLED = originalEnv.registration;
      if (originalEnv.verification === undefined) delete process.env.QABS_EMAIL_VERIFICATION_ENABLED;
      else process.env.QABS_EMAIL_VERIFICATION_ENABLED = originalEnv.verification;
      if (originalEnv.resend === undefined) delete process.env.RESEND_API_KEY;
      else process.env.RESEND_API_KEY = originalEnv.resend;
    }
  });

  it('blocks password login until the registered email has been verified', async () => {
    const originalFetch = globalThis.fetch;
    const originalEnv = {
      registration: process.env.QABS_REGISTRATION_ENABLED,
      verification: process.env.QABS_EMAIL_VERIFICATION_ENABLED,
      resend: process.env.RESEND_API_KEY
    };
    process.env.QABS_REGISTRATION_ENABLED = 'true';
    process.env.QABS_EMAIL_VERIFICATION_ENABLED = 'true';
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

    const { app } = createQabsApp({ dbPath: ':memory:', exposePreviewTokens: true, rateLimitMax: 100 });
    const server = app.listen(0, '127.0.0.1');
    await new Promise<void>(resolve => server.once('listening', resolve));
    const address = server.address();
    assert.ok(address && typeof address === 'object');
    const baseUrl = `http://127.0.0.1:${address.port}`;

    try {
      const registration = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: 'Verification Gate',
          email: 'verify.gate@example.test',
          password: 'SyntheticStrong!2026',
          companyName: 'Verification Gate LLC'
        })
      });
      assert.equal(registration.status, 201);
      const registered = await registration.json() as Json;
      assert.equal(registered.user.emailVerified, false);
      assert.equal(typeof registered.previewEmailVerifyToken, 'string');

      const blockedLogin = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'verify.gate@example.test', password: 'SyntheticStrong!2026' })
      });
      assert.equal(blockedLogin.status, 403);
      assert.equal((await blockedLogin.json() as Json).code, 'EMAIL_NOT_VERIFIED');

      const verify = await fetch(`${baseUrl}/api/auth/verify-email`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token: registered.previewEmailVerifyToken })
      });
      assert.equal(verify.status, 200);

      const allowedLogin = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'verify.gate@example.test', password: 'SyntheticStrong!2026' })
      });
      assert.equal(allowedLogin.status, 200);
      assert.equal((await allowedLogin.json() as Json).user.emailVerified, true);
    } finally {
      await new Promise<void>((resolve, reject) =>
        server.close(error => error ? reject(error) : resolve())
      );
      globalThis.fetch = originalFetch;
      if (originalEnv.registration === undefined) delete process.env.QABS_REGISTRATION_ENABLED;
      else process.env.QABS_REGISTRATION_ENABLED = originalEnv.registration;
      if (originalEnv.verification === undefined) delete process.env.QABS_EMAIL_VERIFICATION_ENABLED;
      else process.env.QABS_EMAIL_VERIFICATION_ENABLED = originalEnv.verification;
      if (originalEnv.resend === undefined) delete process.env.RESEND_API_KEY;
      else process.env.RESEND_API_KEY = originalEnv.resend;
    }
  });

  it('does not silently advertise payment activation on the Studio config endpoint', async () => {
    const { app } = createQabsApp({ dbPath: ':memory:' });
    const server = app.listen(0, '127.0.0.1');
    await new Promise<void>(resolve => server.once('listening', resolve));
    const address = server.address();
    assert.ok(address && typeof address === 'object');
    try {
      const response = await fetch(`http://127.0.0.1:${address.port}/studio/api/config`);
      const config = await response.json() as Json;
      assert.equal(response.status, 200);
      assert.equal(config.payments, false);
      assert.equal(config.googleSignIn, false);
      const blockedRegistration = await fetch(`http://127.0.0.1:${address.port}/studio/api/auth/register`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'blocked@example.test', password: 'SyntheticStrong!2026' })
      });
      assert.equal(blockedRegistration.status, 503);
      const blockedPayload = await blockedRegistration.json() as Json;
      assert.equal(blockedPayload.code, 'REGISTRATION_DISABLED');
      const blockedForgot = await fetch(`http://127.0.0.1:${address.port}/api/auth/forgot-password`, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'blocked@example.test' })
      });
      assert.equal(blockedForgot.status, 503);
      assert.equal((await blockedForgot.json() as Json).code, 'PASSWORD_RECOVERY_DISABLED');
      const blockedReset = await fetch(`http://127.0.0.1:${address.port}/api/auth/reset-password`, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token: 'synthetic-token', newPassword: 'SyntheticStrong!2026' })
      });
      assert.equal(blockedReset.status, 503);
      assert.equal((await blockedReset.json() as Json).code, 'PASSWORD_RECOVERY_DISABLED');
      const blockedVerify = await fetch(`http://127.0.0.1:${address.port}/api/auth/verify-email`, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token: 'synthetic-token' })
      });
      assert.equal(blockedVerify.status, 503);
      assert.equal((await blockedVerify.json() as Json).code, 'EMAIL_VERIFICATION_DISABLED');
    } finally {
      await new Promise<void>((resolve, reject) =>
        server.close(error => error ? reject(error) : resolve())
      );
    }
  });
});
