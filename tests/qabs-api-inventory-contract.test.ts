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
  it('exposes typed order list, detail, and catalogue-priced creation contracts', async () => {
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
        ? { orders: [] }
        : calls.length === 2
          ? { order: { id: 'order_1', total_amount: 70 }, items: [{ id: 'item_1', quantity: 2, unit_price: 35 }] }
          : { order: { id: 'order_2', total_amount: 35 }, items: [{ id: 'item_2', quantity: 1, unit_price: 35 }] };
      return Response.json(payload);
    }) as typeof fetch;

    try {
      setCsrfToken('csrf-order-test');
      assert.deepEqual((await qabsApi.listStoreOrders('store-1')).orders, []);
      const detail = await qabsApi.getStoreOrder('store-1', 'order-1');
      assert.equal(detail.items[0].line_total, undefined);
      assert.equal(detail.items[0].quantity, 2);
      const created = await qabsApi.createOrder('store-1', {
        customerName: 'Buyer',
        customerEmail: 'buyer@example.test',
        items: [{ productId: 'product-1', quantity: 1 }]
      });
      assert.equal(created.items[0].unit_price, 35);

      assert.equal(calls[0].url, '/api/stores/store-1/orders');
      assert.equal(calls[0].method, 'GET');
      assert.equal(calls[1].url, '/api/stores/store-1/orders/order-1');
      assert.equal(calls[1].method, 'GET');
      assert.equal(calls[2].method, 'POST');
      assert.equal(calls[2].headers.get('X-CSRF-Token'), 'csrf-order-test');
      assert.deepEqual(JSON.parse(String(calls[2].body)), {
        customerName: 'Buyer',
        customerEmail: 'buyer@example.test',
        items: [{ productId: 'product-1', quantity: 1 }]
      });
    } finally {
      setCsrfToken(null);
      globalThis.fetch = originalFetch;
    }
  });

});
