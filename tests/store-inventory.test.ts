import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createQabsApp } from '../server/app.ts';

class ApiClient {
  private cookie = '';
  private csrf = '';

  constructor(private readonly baseUrl: string) {}

  async request(method: string, path: string, body?: Record<string, unknown>) {
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
    const session = setCookie?.match(/qabs_session=([^;]+)/);
    if (session?.[1]) this.cookie = `qabs_session=${session[1]}`;
    const json = await response.json().catch(() => ({})) as Record<string, any>;
    if (typeof json.csrfToken === 'string') this.csrf = json.csrfToken;
    return { status: response.status, json };
  }

  login(email: string) {
    return this.request('POST', '/api/auth/login', { email, password: 'QabsPreview!2026' });
  }
}

describe('QABS store variants and inventory ledger', () => {
  it('persists variant stock changes atomically and isolates every operation by tenant', async () => {
    const { app } = createQabsApp({ dbPath: ':memory:' });
    const server = app.listen(0, '127.0.0.1');
    await new Promise<void>(resolve => server.once('listening', resolve));
    const address = server.address();
    assert.ok(address && typeof address === 'object');
    const baseUrl = `http://127.0.0.1:${address.port}`;
    const owner = new ApiClient(baseUrl);
    const otherTenant = new ApiClient(baseUrl);

    try {
      assert.equal((await owner.login('client@qabs1.store')).status, 200);
      assert.equal((await otherTenant.login('merchant2@qabs1.store')).status, 200);

      const store = await owner.request('POST', '/api/stores', { name: 'Inventory Test Store' });
      assert.equal(store.status, 201);
      const storeId = store.json.store.id;

      const product = await owner.request('POST', `/api/stores/${storeId}/products`, {
        titleAr: 'قميص تجريبي',
        titleEn: 'Test Shirt',
        sku: 'SHIRT-BASE',
        price: 20,
        stock: 0
      });
      assert.equal(product.status, 201);
      const productId = product.json.product.id;

      const otherStore = await otherTenant.request('POST', '/api/stores', { name: 'Other Tenant Store' });
      const otherCategory = await otherTenant.request('POST', `/api/stores/${otherStore.json.store.id}/categories`, {
        nameAr: 'فئة خارجية', nameEn: 'Foreign Category'
      });
      const crossTenantCategoryProduct = await owner.request('POST', `/api/stores/${storeId}/products`, {
        titleAr: 'منتج غير مسموح', sku: 'FOREIGN-CAT', price: 5, categoryId: otherCategory.json.category.id
      });
      assert.equal(crossTenantCategoryProduct.status, 400);
      assert.equal(crossTenantCategoryProduct.json.code, 'INVALID_PRODUCT_CATEGORY');

      const duplicateSku = await owner.request('POST', `/api/stores/${storeId}/products`, {
        titleAr: 'منتج مكرر', sku: 'SHIRT-BASE', price: 5
      });
      assert.equal(duplicateSku.status, 409);
      assert.equal(duplicateSku.json.code, 'PRODUCT_SKU_TAKEN');

      const variant = await owner.request('POST', `/api/stores/${storeId}/products/${productId}/variants`, {
        title: 'أسود / كبير',
        sku: 'SHIRT-BLK-L',
        options: { color: 'black', size: 'L' },
        price: 22,
        compareAtPrice: 29,
        stock: 3
      });
      assert.equal(variant.status, 201);
      const variantId = variant.json.variant.id;
      assert.equal(variant.json.variant.stock_quantity, 3);

      const initialList = await owner.request('GET', `/api/stores/${storeId}/products/${productId}/variants`);
      assert.equal(initialList.status, 200);
      assert.equal(initialList.json.variants.length, 1);

      const restock = await owner.request('POST', `/api/stores/${storeId}/products/${productId}/inventory-adjustments`, {
        variantId,
        quantityDelta: 5,
        reason: 'restock',
        referenceId: 'PO-1001'
      });
      assert.equal(restock.status, 201);
      assert.equal(restock.json.stockQuantity, 8);
      assert.equal(restock.json.movements.length, 2);

      const damaged = await owner.request('POST', `/api/stores/${storeId}/products/${productId}/inventory-adjustments`, {
        variantId,
        quantityDelta: -2,
        reason: 'damaged'
      });
      assert.equal(damaged.status, 201);
      assert.equal(damaged.json.stockQuantity, 6);

      const underflow = await owner.request('POST', `/api/stores/${storeId}/products/${productId}/inventory-adjustments`, {
        variantId,
        quantityDelta: -7,
        reason: 'manual_adjustment'
      });
      assert.equal(underflow.status, 409);
      assert.equal(underflow.json.code, 'INSUFFICIENT_STOCK');

      const variantRequired = await owner.request('POST', `/api/stores/${storeId}/products/${productId}/inventory-adjustments`, {
        quantityDelta: 1,
        reason: 'restock'
      });
      assert.equal(variantRequired.status, 400);
      assert.equal(variantRequired.json.code, 'VARIANT_REQUIRED');

      const updated = await owner.request('PATCH', `/api/stores/${storeId}/products/${productId}/variants/${variantId}`, {
        title: 'أسود / كبير معدل',
        price: 24,
        options: { color: 'black', size: 'L' }
      });
      assert.equal(updated.status, 200);
      assert.equal(updated.json.variant.stock_quantity, 6);
      assert.equal(updated.json.variant.retail_price, 24);

      assert.equal((await otherTenant.request('GET', `/api/stores/${storeId}/products/${productId}/variants`)).status, 403);
      assert.equal((await otherTenant.request('POST', `/api/stores/${storeId}/products/${productId}/inventory-adjustments`, {
        variantId, quantityDelta: 100, reason: 'restock'
      })).status, 403);
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close(error => error ? reject(error) : resolve());
      });
    }
  });

  it('supports product-level inventory only when the product has no variants', async () => {
    const { app } = createQabsApp({ dbPath: ':memory:' });
    const server = app.listen(0, '127.0.0.1');
    await new Promise<void>(resolve => server.once('listening', resolve));
    const address = server.address();
    assert.ok(address && typeof address === 'object');
    const client = new ApiClient(`http://127.0.0.1:${address.port}`);

    try {
      assert.equal((await client.login('client@qabs1.store')).status, 200);
      const store = await client.request('POST', '/api/stores', { name: 'Simple Stock Store' });
      const storeId = store.json.store.id;
      const product = await client.request('POST', `/api/stores/${storeId}/products`, {
        titleAr: 'منتج بلا متغيرات',
        sku: 'SIMPLE-1',
        price: 10,
        stock: 4
      });
      const productId = product.json.product.id;
      const directStockEdit = await client.request('PATCH', `/api/stores/${storeId}/products/${productId}`, {
        stock: 99
      });
      assert.equal(directStockEdit.status, 400);
      assert.equal(directStockEdit.json.code, 'INVENTORY_ADJUSTMENT_REQUIRED');
      const adjustment = await client.request('POST', `/api/stores/${storeId}/products/${productId}/inventory-adjustments`, {
        quantityDelta: -1,
        reason: 'manual_adjustment'
      });
      assert.equal(adjustment.status, 201);
      assert.equal(adjustment.json.stockQuantity, 3);
      assert.equal(adjustment.json.movements.length, 2);
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close(error => error ? reject(error) : resolve());
      });
    }
  });
  it('prices order lines from the catalogue and reserves stock atomically', async () => {
    const { app } = createQabsApp({ dbPath: ':memory:' });
    const server = app.listen(0, '127.0.0.1');
    await new Promise<void>(resolve => server.once('listening', resolve));
    const address = server.address();
    assert.ok(address && typeof address === 'object');
    const client = new ApiClient(`http://127.0.0.1:${address.port}`);

    try {
      assert.equal((await client.login('client@qabs1.store')).status, 200);
      const store = await client.request('POST', '/api/stores', { name: 'Order Ledger Store' });
      const storeId = store.json.store.id;
      const product = await client.request('POST', `/api/stores/${storeId}/products`, {
        titleAr: 'حقيبة', titleEn: 'Bag', sku: 'BAG-01', price: 35, stock: 5
      });
      const productId = product.json.product.id;

      const order = await client.request('POST', `/api/stores/${storeId}/orders`, {
        customerName: 'Test Buyer',
        customerEmail: 'buyer@example.test',
        total: 0.01,
        items: [{ productId, quantity: 2, unitPrice: 0.01 }]
      });
      assert.equal(order.status, 201);
      assert.equal(order.json.order.total_amount, 70);
      assert.equal(order.json.items.length, 1);
      assert.equal(order.json.items[0].unit_price, 35);
      assert.equal(order.json.items[0].line_total, 70);

      const productAfter = await client.request('GET', `/api/stores/${storeId}/products/${productId}`);
      assert.equal(productAfter.json.product.stock_quantity, 3);

      const detail = await client.request('GET', `/api/stores/${storeId}/orders/${order.json.order.id}`);
      assert.equal(detail.status, 200);
      assert.equal(detail.json.items.length, 1);

      const insufficient = await client.request('POST', `/api/stores/${storeId}/orders`, {
        customerName: 'Another Buyer',
        customerEmail: 'another@example.test',
        items: [{ productId, quantity: 4 }]
      });
      assert.equal(insufficient.status, 409);
      assert.equal(insufficient.json.code, 'INSUFFICIENT_STOCK');

      const afterFailure = await client.request('GET', `/api/stores/${storeId}/products/${productId}`);
      assert.equal(afterFailure.json.product.stock_quantity, 3);
      const orders = await client.request('GET', `/api/stores/${storeId}/orders`);
      assert.equal(orders.json.orders.length, 1);

      const cancelled = await client.request('PATCH', `/api/stores/${storeId}/orders/${order.json.order.id}`, {
        status: 'cancelled'
      });
      assert.equal(cancelled.status, 200);
      const restored = await client.request('GET', `/api/stores/${storeId}/products/${productId}`);
      assert.equal(restored.json.product.stock_quantity, 5);

      const repeatedCancel = await client.request('PATCH', `/api/stores/${storeId}/orders/${order.json.order.id}`, {
        status: 'cancelled'
      });
      assert.equal(repeatedCancel.status, 200);
      const afterRepeatedCancel = await client.request('GET', `/api/stores/${storeId}/products/${productId}`);
      assert.equal(afterRepeatedCancel.json.product.stock_quantity, 5);

      const reopen = await client.request('PATCH', `/api/stores/${storeId}/orders/${order.json.order.id}`, {
        status: 'processing'
      });
      assert.equal(reopen.status, 409);
      assert.equal(reopen.json.code, 'ORDER_ALREADY_CANCELLED');

      const archived = await client.request('DELETE', `/api/stores/${storeId}/products/${productId}`);
      assert.equal(archived.status, 200);
      assert.equal(archived.json.archived, true);
      const archivedProduct = await client.request('GET', `/api/stores/${storeId}/products/${productId}`);
      assert.equal(archivedProduct.json.product.status, 'archived');
      const preservedOrder = await client.request('GET', `/api/stores/${storeId}/orders/${order.json.order.id}`);
      assert.equal(preservedOrder.json.items.length, 1);
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close(error => error ? reject(error) : resolve());
      });
    }
  });

});
