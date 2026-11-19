import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { qabsApi, setCsrfToken } from '../src/services/qabsApi.ts';

describe('QABS commerce API client', () => {
  it('uses tenant-scoped variant and inventory endpoints with CSRF on writes', async () => {
    const originalFetch = globalThis.fetch;
    const calls: Array<{ url: string; method: string; headers: Headers; body: unknown }> = [];
    globalThis.fetch = (async (input: RequestInfo | URL, init: RequestInit = {}) => {
      calls.push({
        url: String(input),
        method: String(init.method || 'GET'),
        headers: new Headers(init.headers),
        body: init.body
      });
      const payload = calls.length === 1
        ? { variants: [] }
        : calls.length === 2
          ? { variant: { id: 'var_test', sku: 'SKU-TEST', stock_quantity: 4 } }
          : calls.length === 3
            ? { variant: { id: 'var_test', sku: 'SKU-TEST-2', stock_quantity: 4 } }
            : { productId: 'prod_test', variantId: 'var_test', stockQuantity: 7, movements: [] };
      return Response.json(payload);
    }) as typeof fetch;

    try {
      setCsrfToken('csrf-inventory-test');
      const storeId = 'store/a';
      const productId = 'product b';
      const variants = await qabsApi.listProductVariants(storeId, productId);
      assert.deepEqual(variants.variants, []);

      await qabsApi.createProductVariant(storeId, productId, {
        title: 'Black / Large',
        sku: 'SKU-TEST',
        options: { color: 'black', size: 'L' },
        stock: 4
      });
      await qabsApi.updateProductVariant(storeId, productId, 'var/test', {
        sku: 'SKU-TEST-2',
        price: 24
      });
      const adjusted = await qabsApi.adjustProductInventory(storeId, productId, {
        variantId: 'var/test',
        quantityDelta: 3,
        reason: 'restock',
        referenceId: 'PO-1'
      });

      assert.equal(calls[0].url, '/api/stores/store%2Fa/products/product%20b/variants');
      assert.equal(calls[0].method, 'GET');
      assert.equal(calls[1].method, 'POST');
      assert.equal(calls[1].headers.get('X-CSRF-Token'), 'csrf-inventory-test');
      assert.deepEqual(JSON.parse(String(calls[1].body)), {
        title: 'Black / Large',
        sku: 'SKU-TEST',
        options: { color: 'black', size: 'L' },
        stock: 4
      });
      assert.equal(calls[2].url, '/api/stores/store%2Fa/products/product%20b/variants/var%2Ftest');
      assert.equal(calls[2].method, 'PATCH');
      assert.equal(calls[2].headers.get('X-CSRF-Token'), 'csrf-inventory-test');
      assert.equal(calls[3].url, '/api/stores/store%2Fa/products/product%20b/inventory-adjustments');
      assert.equal(calls[3].method, 'POST');
      assert.equal(calls[3].headers.get('X-CSRF-Token'), 'csrf-inventory-test');
      assert.equal(adjusted.stockQuantity, 7);
    } finally {
      setCsrfToken(null);
      globalThis.fetch = originalFetch;
    }
  });
});
