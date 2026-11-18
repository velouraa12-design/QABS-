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

      const alphaReg = await alpha.register('studio.alpha@example.test');
      assert.equal(alphaReg.status, 201);
      assert.equal(alphaReg.json.user.role, 'customer');
      assert.ok(alpha.cookie);

      const betaReg = await beta.register('studio.beta@example.test');
      assert.equal(betaReg.status, 201);
      assert.ok(beta.cookie);

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
    } finally {
      await new Promise<void>((resolve, reject) =>
        server.close(error => error ? reject(error) : resolve())
      );
    }
  });
});
