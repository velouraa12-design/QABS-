import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createQabsApp } from '../server/app.ts';

describe('QABS authentication rate limits', () => {
  it('limits login attempts by source even when the caller rotates email addresses', async () => {
    const { app } = createQabsApp({ dbPath: ':memory:', rateLimitMax: 1 });
    const server = app.listen(0, '127.0.0.1');
    await new Promise<void>(resolve => server.once('listening', resolve));
    const address = server.address();
    assert.ok(address && typeof address === 'object');
    const baseUrl = `http://127.0.0.1:${address.port}`;

    try {
      const first = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'unknown-one@example.test', password: 'wrong-password' })
      });
      assert.equal(first.status, 401);
      assert.equal((await first.json()).code, 'INVALID_CREDENTIALS');

      const rotatedAccount = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'unknown-two@example.test', password: 'wrong-password' })
      });
      assert.equal(rotatedAccount.status, 429);
      assert.equal((await rotatedAccount.json()).code, 'RATE_LIMITED');
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close(error => error ? reject(error) : resolve());
      });
    }
  });

  it('limits repeated attempts against one account across distinct source addresses', async () => {
    const { app } = createQabsApp({ dbPath: ':memory:', rateLimitMax: 1 });
    const server = app.listen(0, '127.0.0.1');
    await new Promise<void>(resolve => server.once('listening', resolve));
    const address = server.address();
    assert.ok(address && typeof address === 'object');
    const baseUrl = `http://127.0.0.1:${address.port}`;

    try {
      const first = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-forwarded-for': '198.51.100.10' },
        body: JSON.stringify({ email: 'client@qabs1.store', password: 'wrong-password' })
      });
      assert.equal(first.status, 401);

      const second = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-forwarded-for': '198.51.100.11' },
        body: JSON.stringify({ email: 'client@qabs1.store', password: 'wrong-password' })
      });
      assert.equal(second.status, 429);
      assert.equal((await second.json()).code, 'RATE_LIMITED');
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close(error => error ? reject(error) : resolve());
      });
    }
  });
});
