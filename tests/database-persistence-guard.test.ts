import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createQabsApp } from '../server/app.ts';

describe('QABS production database durability guard', () => {
  it('refuses to start the Node API on ephemeral /tmp SQLite in production', () => {
    const previousNodeEnv = process.env.NODE_ENV;
    const previousDbPath = process.env.QABS_DB_PATH;
    const previousKService = process.env.K_SERVICE;
    try {
      process.env.NODE_ENV = 'production';
      delete process.env.QABS_DB_PATH;
      delete process.env.K_SERVICE;
      assert.throws(
        () => createQabsApp(),
        /QABS_DB_PATH is required.*Refusing ephemeral \/tmp SQLite storage/
      );
    } finally {
      if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
      else process.env.NODE_ENV = previousNodeEnv;
      if (previousDbPath === undefined) delete process.env.QABS_DB_PATH;
      else process.env.QABS_DB_PATH = previousDbPath;
      if (previousKService === undefined) delete process.env.K_SERVICE;
      else process.env.K_SERVICE = previousKService;
    }
  });

  it('allows an explicitly configured in-memory database for isolated tests', () => {
    const previousNodeEnv = process.env.NODE_ENV;
    try {
      process.env.NODE_ENV = 'production';
      assert.doesNotThrow(() => createQabsApp({ dbPath: ':memory:' }));
    } finally {
      if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
      else process.env.NODE_ENV = previousNodeEnv;
    }
  });
});
