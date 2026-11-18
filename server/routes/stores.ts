import type { Router, Request, Response } from 'express';
import type { DatabaseSync } from 'node:sqlite';
import {
  generateToken,
  isPrivilegedRole,
  type PlatformRole,
  sanitizeId,
  sanitizeText
} from '../security.ts';

export interface SessionActor {
  sessionId: string;
  userId: string;
  tenantId: string;
  email: string;
  name: string;
  role: PlatformRole;
  csrfToken: string;
  emailVerified: boolean;
}

export type AuthedRequest = Request & { actor?: SessionActor };

export function logAudit(
  db: DatabaseSync,
  tenantId: string | null,
  actorId: string | null,
  actorName: string,
  actionAr: string,
  actionEn: string,
  targetEntity: string,
  status: 'success' | 'warning' | 'info' = 'success'
): void {
  db.prepare(
    `INSERT INTO security_audit_logs (id, tenant_id, actor_id, actor_name, action_ar, action_en, target_entity, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(`aud_${generateToken(8)}`, tenantId, actorId, actorName, actionAr, actionEn, targetEntity, status);
}

export function createNotification(
  db: DatabaseSync,
  tenantId: string,
  titleAr: string,
  titleEn: string,
  bodyAr: string,
  bodyEn: string,
  category = 'system',
  linkPath = '/overview',
  userId: string | null = null
): void {
  db.prepare(
    `INSERT INTO notifications (id, tenant_id, user_id, title_ar, title_en, body_ar, body_en, category, is_read, link_path)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`
  ).run(`notif_${generateToken(8)}`, tenantId, userId, titleAr, titleEn, bodyAr, bodyEn, category, linkPath);
}

function getOwnedStore(
  db: DatabaseSync,
  storeId: string,
  actor: SessionActor
): { ok: true; store: Record<string, unknown> } | { ok: false; status: number; code: string; message: string } {
  const store = db.prepare('SELECT * FROM store_instances WHERE id = ?').get(storeId) as
    | Record<string, unknown>
    | undefined;
  if (!store) {
    return { ok: false, status: 404, code: 'STORE_NOT_FOUND', message: 'Store not found.' };
  }
  if (store.tenant_id !== actor.tenantId && !isPrivilegedRole(actor.role)) {
    return { ok: false, status: 403, code: 'FORBIDDEN_TENANT_ACCESS', message: 'Access denied to another tenant store.' };
  }
  return { ok: true, store };
}

export function registerStoreRoutes(
  router: Router,
  db: DatabaseSync,
  requireAuth: (req: AuthedRequest, res: Response, next: () => void) => void
): void {
  // List stores (tenant-scoped unless privileged)
  router.get('/api/stores', requireAuth, (req: AuthedRequest, res: Response) => {
    const actor = req.actor!;
    const rows = isPrivilegedRole(actor.role)
      ? db.prepare('SELECT * FROM store_instances ORDER BY created_at DESC').all()
      : db.prepare('SELECT * FROM store_instances WHERE tenant_id = ? ORDER BY created_at DESC').all(actor.tenantId);
    res.json({ stores: rows });
  });

  // Create isolated store (starts strictly as draft / unconfigured payment gateway)
  router.post('/api/stores', requireAuth, (req: AuthedRequest, res: Response) => {
    const actor = req.actor!;
    const name = sanitizeText(req.body?.name, 120);
    if (!name || name.length < 2) {
      res.status(400).json({ error: 'Store name is required (min 2 chars).', code: 'INVALID_STORE_NAME' });
      return;
    }

    const rawSlug = sanitizeText(req.body?.subdomain, 64)
      .toLowerCase()
      .replace(/\.qabs1\.store$/, '')
      .replace(/[^a-z0-9-]/g, '');
    const slug = rawSlug || `store-${generateToken(3)}`;
    const subdomain = `${slug}.qabs1.store`;

    const existing = db.prepare('SELECT id FROM store_instances WHERE subdomain = ?').get(subdomain);
    if (existing) {
      res.status(409).json({ error: 'Subdomain already reserved.', code: 'SUBDOMAIN_TAKEN' });
      return;
    }

    const storeId = `store_${generateToken(8)}`;
    const currency = sanitizeText(req.body?.currency || 'SAR', 8) || 'SAR';
    const themePreset = sanitizeText(req.body?.theme || 'gold_executive', 64) || 'gold_executive';
    const gatewayType = sanitizeText(req.body?.gatewayType || 'Stripe', 32) || 'Stripe';
    const settingsJson = JSON.stringify({
      country: sanitizeText(req.body?.country || 'SA', 8),
      activityAr: sanitizeText(req.body?.activityAr || 'متجر إلكتروني مستقل', 200),
      activityEn: sanitizeText(req.body?.activityEn || 'Independent Storefront', 200),
      defaultLanguage: sanitizeText(req.body?.defaultLanguage || 'both', 16),
      taxRate: Number.isFinite(Number(req.body?.taxRate)) ? Number(req.body.taxRate) : 15
    });

    db.prepare(
      `INSERT INTO store_instances (
        id, tenant_id, name, subdomain, currency, theme_preset, status, approval_status,
        payment_connected, payment_approval_status, gateway_type, settings_json, total_revenue
      ) VALUES (?, ?, ?, ?, ?, ?, 'draft', 'draft', 0, 'unconfigured', ?, ?, 0)`
    ).run(storeId, actor.tenantId, name, subdomain, currency, themePreset, gatewayType, settingsJson);

    logAudit(db, actor.tenantId, actor.userId, actor.name, `إنشاء متجر جديد (${name}) كمسودة`, `Created store (${name}) as draft`, storeId);
    const created = db.prepare('SELECT * FROM store_instances WHERE id = ?').get(storeId);
    res.status(201).json({ store: created });
  });

  // Direct Store ID read (strict tenant check)
  router.get('/api/stores/:storeId', requireAuth, (req: AuthedRequest, res: Response) => {
    const storeId = sanitizeId(req.params.storeId);
    const check = getOwnedStore(db, storeId, req.actor!);
    if (!check.ok) {
      res.status(check.status).json({ error: check.message, code: check.code });
      return;
    }
    res.json({ store: check.store });
  });

  // Update Store settings (strict tenant check, cannot self-approve publication or payment_connected)
  router.patch('/api/stores/:storeId', requireAuth, (req: AuthedRequest, res: Response) => {
    const actor = req.actor!;
    const storeId = sanitizeId(req.params.storeId);
    const check = getOwnedStore(db, storeId, actor);
    if (!check.ok) {
      res.status(check.status).json({ error: check.message, code: check.code });
      return;
    }

    const name = req.body?.name ? sanitizeText(req.body.name, 120) : String(check.store.name);
    const currency = req.body?.currency ? sanitizeText(req.body.currency, 8) : String(check.store.currency);
    const themePreset = req.body?.theme ? sanitizeText(req.body.theme, 64) : String(check.store.theme_preset);
    const customDomain =
      req.body?.customDomain !== undefined ? sanitizeText(req.body.customDomain, 255) : (check.store.custom_domain as string | null);
    const domainStatus =
      req.body?.customDomain && req.body.customDomain !== check.store.custom_domain
        ? 'pending_verification'
        : String(check.store.domain_status);
    const currentSettings = JSON.parse(String(check.store.settings_json || '{}'));
    const incomingSettings =
      req.body?.settings && typeof req.body.settings === 'object' ? { ...(req.body.settings as Record<string, unknown>) } : {};
    delete incomingSettings.shopifyAccessToken;
    delete incomingSettings.secretKey;
    delete incomingSettings.apiKey;
    const nextSettings =
      req.body?.settings && typeof req.body.settings === 'object'
        ? JSON.stringify({ ...currentSettings, ...incomingSettings })
        : String(check.store.settings_json || '{}');

    db.prepare(
      `UPDATE store_instances
       SET name = ?, currency = ?, theme_preset = ?, custom_domain = ?, domain_status = ?, settings_json = ?
       WHERE id = ?`
    ).run(name, currency, themePreset, customDomain, domainStatus, nextSettings, storeId);

    const updated = db.prepare('SELECT * FROM store_instances WHERE id = ?').get(storeId);
    res.json({ store: updated });
  });

  // Request GCC / Global Payment Gateway Sandbox Configuration (keeps payment_connected = 0)
  router.post('/api/stores/:storeId/payment-request', requireAuth, (req: AuthedRequest, res: Response) => {
    const actor = req.actor!;
    const storeId = sanitizeId(req.params.storeId);
    const check = getOwnedStore(db, storeId, actor);
    if (!check.ok) {
      res.status(check.status).json({ error: check.message, code: check.code });
      return;
    }

    const gatewayType = sanitizeText(req.body?.gatewayType, 32);
    const allowedGateways = new Set(['Tap', 'Moyasar', 'Stripe', 'PayPal']);
    if (!allowedGateways.has(gatewayType)) {
      res.status(400).json({ error: 'Unsupported payment gateway type.', code: 'INVALID_GATEWAY' });
      return;
    }

    if (req.body?.secretKey || req.body?.apiKey) {
      res.status(400).json({
        error: 'Client-submitted secret keys are not permitted. Configure gateway secrets strictly on the server.',
        code: 'CLIENT_SECRET_NOT_ALLOWED'
      });
      return;
    }

    const currentSettings = JSON.parse(String(check.store.settings_json || '{}'));
    const sandboxCfg = req.body?.sandboxConfig && typeof req.body.sandboxConfig === 'object' ? req.body.sandboxConfig : {};
    const nextSettings = {
      ...currentSettings,
      paymentSandbox: {
        gatewayType,
        mode: 'sandbox_pending_review',
        region: gatewayType === 'Tap' || gatewayType === 'Moyasar' ? 'GCC' : 'Global',
        madaEnabled: Boolean(sandboxCfg.madaEnabled ?? (gatewayType === 'Tap' || gatewayType === 'Moyasar')),
        applePayEnabled: Boolean(sandboxCfg.applePayEnabled ?? true),
        sadadEnabled: Boolean(sandboxCfg.sadadEnabled ?? gatewayType === 'Moyasar'),
        stcPayEnabled: Boolean(sandboxCfg.stcPayEnabled ?? gatewayType === 'Moyasar'),
        merchantReference: sanitizeText(sandboxCfg.merchantReference || '', 80),
        updatedAt: new Date().toISOString()
      }
    };

    // Strict financial gate: never enable live card charging automatically
    db.prepare(
      `UPDATE store_instances
       SET gateway_type = ?, payment_connected = 0, payment_approval_status = 'pending_admin_approval', settings_json = ?
       WHERE id = ?`
    ).run(gatewayType, JSON.stringify(nextSettings), storeId);

    createNotification(
      db,
      String(check.store.tenant_id),
      `تم تسجيل طلب تفعيل بوابة ${gatewayType}`,
      `${gatewayType} Gateway Activation Requested`,
      `بانتظار المراجعة الإدارية لمتجر "${check.store.name}" — التحصيل الحي معطّل أماناً في بيئة المعاينة.`,
      `Pending admin verification for "${check.store.name}". Live charging stays disabled in preview.`,
      'billing',
      '/payment-gateways'
    );
    logAudit(
      db,
      String(check.store.tenant_id),
      actor.userId,
      actor.name,
      `طلب إعداد بوابة الدفع ${gatewayType} لمتجر ${check.store.name}`,
      `Requested ${gatewayType} sandbox setup for store ${check.store.name}`,
      storeId
    );

    res.json({ store: db.prepare('SELECT * FROM store_instances WHERE id = ?').get(storeId) });
  });

  // Submit store for admin review
  router.post('/api/stores/:storeId/submit-review', requireAuth, (req: AuthedRequest, res: Response) => {
    const actor = req.actor!;
    const storeId = sanitizeId(req.params.storeId);
    const check = getOwnedStore(db, storeId, actor);
    if (!check.ok) {
      res.status(check.status).json({ error: check.message, code: check.code });
      return;
    }

    db.prepare(`UPDATE store_instances SET approval_status = 'pending_review', status = 'setup' WHERE id = ?`).run(storeId);
    logAudit(db, actor.tenantId, actor.userId, actor.name, `إرسال المتجر (${check.store.name}) لمراجعة الإدارة`, `Submitted store (${check.store.name}) for review`, storeId);
    const updated = db.prepare('SELECT * FROM store_instances WHERE id = ?').get(storeId);
    res.json({ store: updated });
  });

  // Categories CRUD (store-scoped)
  router.get('/api/stores/:storeId/categories', requireAuth, (req: AuthedRequest, res: Response) => {
    const storeId = sanitizeId(req.params.storeId);
    const check = getOwnedStore(db, storeId, req.actor!);
    if (!check.ok) {
      res.status(check.status).json({ error: check.message, code: check.code });
      return;
    }
    const categories = db.prepare('SELECT * FROM store_categories WHERE store_id = ? ORDER BY created_at DESC').all(storeId);
    res.json({ categories });
  });

  router.post('/api/stores/:storeId/categories', requireAuth, (req: AuthedRequest, res: Response) => {
    const actor = req.actor!;
    const storeId = sanitizeId(req.params.storeId);
    const check = getOwnedStore(db, storeId, actor);
    if (!check.ok) {
      res.status(check.status).json({ error: check.message, code: check.code });
      return;
    }
    const nameAr = sanitizeText(req.body?.nameAr, 120);
    const nameEn = sanitizeText(req.body?.nameEn || nameAr, 120);
    if (!nameAr) {
      res.status(400).json({ error: 'Category nameAr is required.', code: 'INVALID_CATEGORY' });
      return;
    }
    const slug = (sanitizeText(req.body?.slug || nameEn, 80) || generateToken(3))
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-');
    const id = `cat_${generateToken(6)}`;
    db.prepare(
      `INSERT INTO store_categories (id, store_id, tenant_id, name_ar, name_en, slug) VALUES (?, ?, ?, ?, ?, ?)`
    ).run(id, storeId, String(check.store.tenant_id), nameAr, nameEn, slug);
    res.status(201).json({ category: db.prepare('SELECT * FROM store_categories WHERE id = ?').get(id) });
  });

  // Products CRUD + Direct Product ID isolation
  router.get('/api/stores/:storeId/products', requireAuth, (req: AuthedRequest, res: Response) => {
    const storeId = sanitizeId(req.params.storeId);
    const check = getOwnedStore(db, storeId, req.actor!);
    if (!check.ok) {
      res.status(check.status).json({ error: check.message, code: check.code });
      return;
    }
    const products = db.prepare('SELECT * FROM store_products WHERE store_id = ? ORDER BY updated_at DESC').all(storeId);
    res.json({ products });
  });

  router.post('/api/stores/:storeId/products', requireAuth, (req: AuthedRequest, res: Response) => {
    const actor = req.actor!;
    const storeId = sanitizeId(req.params.storeId);
    const check = getOwnedStore(db, storeId, actor);
    if (!check.ok) {
      res.status(check.status).json({ error: check.message, code: check.code });
      return;
    }

    const titleAr = sanitizeText(req.body?.titleAr || req.body?.nameAr, 200);
    const titleEn = sanitizeText(req.body?.titleEn || req.body?.nameEn || titleAr, 200);
    const sku = sanitizeText(req.body?.sku || `SKU-${generateToken(3).toUpperCase()}`, 64);
    const price = Number(req.body?.price ?? req.body?.retailPrice ?? 0);
    const cost = Number(req.body?.cost ?? req.body?.costPrice ?? 0);
    const stock = Math.max(0, Math.floor(Number(req.body?.stock ?? req.body?.stockQuantity ?? 0)));
    if (!titleAr || !Number.isFinite(price) || price < 0) {
      res.status(400).json({ error: 'Valid product title and non-negative price required.', code: 'INVALID_PRODUCT' });
      return;
    }

    const prodId = `prod_${generateToken(6)}`;
    db.prepare(
      `INSERT INTO store_products (
        id, store_id, tenant_id, category_id, title_ar, title_en, sku, product_type,
        retail_price, cost_price, stock_quantity, category_ar, category_en, status, sales_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`
    ).run(
      prodId,
      storeId,
      String(check.store.tenant_id),
      req.body?.categoryId ? sanitizeId(req.body.categoryId) : null,
      titleAr,
      titleEn,
      sku,
      req.body?.productType === 'digital' ? 'digital' : 'physical',
      price,
      Math.max(0, cost),
      stock,
      sanitizeText(req.body?.categoryAr || 'عام', 80),
      sanitizeText(req.body?.categoryEn || 'General', 80),
      req.body?.status === 'draft' ? 'draft' : stock === 0 ? 'out_of_stock' : 'active'
    );

    logAudit(db, actor.tenantId, actor.userId, actor.name, `إضافة منتج (${titleAr})`, `Added product (${titleEn})`, prodId);
    res.status(201).json({ product: db.prepare('SELECT * FROM store_products WHERE id = ?').get(prodId) });
  });

  router.get('/api/stores/:storeId/products/:productId', requireAuth, (req: AuthedRequest, res: Response) => {
    const storeId = sanitizeId(req.params.storeId);
    const productId = sanitizeId(req.params.productId);
    const check = getOwnedStore(db, storeId, req.actor!);
    if (!check.ok) {
      res.status(check.status).json({ error: check.message, code: check.code });
      return;
    }
    const product = db.prepare('SELECT * FROM store_products WHERE id = ? AND store_id = ?').get(productId, storeId);
    if (!product) {
      res.status(404).json({ error: 'Product not found in this store.', code: 'PRODUCT_NOT_FOUND' });
      return;
    }
    res.json({ product });
  });

  router.patch('/api/stores/:storeId/products/:productId', requireAuth, (req: AuthedRequest, res: Response) => {
    const storeId = sanitizeId(req.params.storeId);
    const productId = sanitizeId(req.params.productId);
    const check = getOwnedStore(db, storeId, req.actor!);
    if (!check.ok) {
      res.status(check.status).json({ error: check.message, code: check.code });
      return;
    }
    const existing = db.prepare('SELECT * FROM store_products WHERE id = ? AND store_id = ?').get(productId, storeId) as
      | Record<string, unknown>
      | undefined;
    if (!existing) {
      res.status(404).json({ error: 'Product not found in this store.', code: 'PRODUCT_NOT_FOUND' });
      return;
    }
    const price = req.body?.price !== undefined ? Math.max(0, Number(req.body.price)) : Number(existing.retail_price);
    const stock = req.body?.stock !== undefined ? Math.max(0, Math.floor(Number(req.body.stock))) : Number(existing.stock_quantity);
    const titleAr = req.body?.titleAr ? sanitizeText(req.body.titleAr, 200) : String(existing.title_ar);
    const status = req.body?.status ? sanitizeText(req.body.status, 32) : stock === 0 ? 'out_of_stock' : String(existing.status);

    db.prepare(
      `UPDATE store_products SET title_ar = ?, retail_price = ?, stock_quantity = ?, status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND store_id = ?`
    ).run(titleAr, price, stock, status, productId, storeId);

    res.json({ product: db.prepare('SELECT * FROM store_products WHERE id = ?').get(productId) });
  });

  router.delete('/api/stores/:storeId/products/:productId', requireAuth, (req: AuthedRequest, res: Response) => {
    const storeId = sanitizeId(req.params.storeId);
    const productId = sanitizeId(req.params.productId);
    const check = getOwnedStore(db, storeId, req.actor!);
    if (!check.ok) {
      res.status(check.status).json({ error: check.message, code: check.code });
      return;
    }
    const result = db.prepare('DELETE FROM store_products WHERE id = ? AND store_id = ?').run(productId, storeId);
    if (result.changes === 0) {
      res.status(404).json({ error: 'Product not found in this store.', code: 'PRODUCT_NOT_FOUND' });
      return;
    }
    res.json({ ok: true });
  });

  // Store Orders CRUD (store-scoped)
  router.get('/api/stores/:storeId/orders', requireAuth, (req: AuthedRequest, res: Response) => {
    const storeId = sanitizeId(req.params.storeId);
    const check = getOwnedStore(db, storeId, req.actor!);
    if (!check.ok) {
      res.status(check.status).json({ error: check.message, code: check.code });
      return;
    }
    const orders = db.prepare('SELECT * FROM store_orders WHERE store_id = ? ORDER BY created_at DESC').all(storeId);
    res.json({ orders });
  });

  router.post('/api/stores/:storeId/orders', requireAuth, (req: AuthedRequest, res: Response) => {
    const actor = req.actor!;
    const storeId = sanitizeId(req.params.storeId);
    const check = getOwnedStore(db, storeId, actor);
    if (!check.ok) {
      res.status(check.status).json({ error: check.message, code: check.code });
      return;
    }
    const customerName = sanitizeText(req.body?.customerName, 160);
    const customerEmail = sanitizeText(req.body?.customerEmail, 160);
    const totalAmount = Number(req.body?.total ?? 0);
    if (!customerName || !customerEmail || !Number.isFinite(totalAmount) || totalAmount < 0) {
      res.status(400).json({ error: 'Customer name, email, and non-negative total are required.', code: 'INVALID_ORDER' });
      return;
    }

    const orderId = `sord_${generateToken(6)}`;
    const orderNumber = `ORD-${Math.floor(10000 + Math.random() * 89999)}`;
    db.prepare(
      `INSERT INTO store_orders (
        id, store_id, tenant_id, order_number, customer_name, customer_email, customer_country,
        items_count, total_amount, currency, payment_gateway, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', 'processing')`
    ).run(
      orderId,
      storeId,
      String(check.store.tenant_id),
      orderNumber,
      customerName,
      customerEmail,
      sanitizeText(req.body?.customerCountry || 'SA', 32),
      Math.max(1, Math.floor(Number(req.body?.itemsCount ?? 1))),
      totalAmount,
      String(check.store.currency)
    );

    const custId = `scust_${generateToken(6)}`;
    db.prepare(
      `INSERT INTO store_customers (id, store_id, tenant_id, name, email, country, orders_count, total_spent, last_order_date)
       VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)`
    ).run(custId, storeId, String(check.store.tenant_id), customerName, customerEmail, sanitizeText(req.body?.customerCountry || 'SA', 32), totalAmount, new Date().toISOString().split('T')[0]);

    res.status(201).json({ order: db.prepare('SELECT * FROM store_orders WHERE id = ?').get(orderId) });
  });

  router.patch('/api/stores/:storeId/orders/:orderId', requireAuth, (req: AuthedRequest, res: Response) => {
    const storeId = sanitizeId(req.params.storeId);
    const orderId = sanitizeId(req.params.orderId);
    const check = getOwnedStore(db, storeId, req.actor!);
    if (!check.ok) {
      res.status(check.status).json({ error: check.message, code: check.code });
      return;
    }
    const status = sanitizeText(req.body?.status, 32);
    const allowed = new Set(['processing', 'shipped', 'delivered', 'cancelled']);
    if (!allowed.has(status)) {
      res.status(400).json({ error: 'Invalid fulfillment status.', code: 'INVALID_STATUS' });
      return;
    }
    const trackingNumber = req.body?.trackingNumber ? sanitizeText(req.body.trackingNumber, 120) : null;
    const result = db
      .prepare('UPDATE store_orders SET status = ?, tracking_number = COALESCE(?, tracking_number) WHERE id = ? AND store_id = ?')
      .run(status, trackingNumber, orderId, storeId);
    if (result.changes === 0) {
      res.status(404).json({ error: 'Store order not found.', code: 'ORDER_NOT_FOUND' });
      return;
    }
    res.json({ order: db.prepare('SELECT * FROM store_orders WHERE id = ?').get(orderId) });
  });

  // Store Customers, Team Members & Reports
  router.get('/api/stores/:storeId/customers', requireAuth, (req: AuthedRequest, res: Response) => {
    const storeId = sanitizeId(req.params.storeId);
    const check = getOwnedStore(db, storeId, req.actor!);
    if (!check.ok) {
      res.status(check.status).json({ error: check.message, code: check.code });
      return;
    }
    const customers = db.prepare('SELECT * FROM store_customers WHERE store_id = ?').all(storeId);
    res.json({ customers });
  });

  router.get('/api/stores/:storeId/team', requireAuth, (req: AuthedRequest, res: Response) => {
    const storeId = sanitizeId(req.params.storeId);
    const check = getOwnedStore(db, storeId, req.actor!);
    if (!check.ok) {
      res.status(check.status).json({ error: check.message, code: check.code });
      return;
    }
    const members = db.prepare('SELECT * FROM store_team_members WHERE store_id = ? ORDER BY created_at DESC').all(storeId);
    res.json({ members });
  });

  router.post('/api/stores/:storeId/team', requireAuth, (req: AuthedRequest, res: Response) => {
    const actor = req.actor!;
    const storeId = sanitizeId(req.params.storeId);
    const check = getOwnedStore(db, storeId, actor);
    if (!check.ok) {
      res.status(check.status).json({ error: check.message, code: check.code });
      return;
    }
    const name = sanitizeText(req.body?.name, 120);
    const email = sanitizeText(req.body?.email, 160).toLowerCase();
    const role = req.body?.role === 'admin' || req.body?.role === 'support' ? req.body.role : 'staff';
    const permissions = Array.isArray(req.body?.permissions) ? req.body.permissions.slice(0, 20) : ['orders', 'products'];
    if (!name || !email) {
      res.status(400).json({ error: 'Name and email are required.', code: 'INVALID_MEMBER' });
      return;
    }
    const id = `stm_${generateToken(6)}`;
    db.prepare(
      `INSERT INTO store_team_members (id, store_id, tenant_id, name, email, role, permissions_json, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active')`
    ).run(id, storeId, String(check.store.tenant_id), name, email, role, JSON.stringify(permissions));
    res.status(201).json({ member: db.prepare('SELECT * FROM store_team_members WHERE id = ?').get(id) });
  });

  router.get('/api/stores/:storeId/reports', requireAuth, (req: AuthedRequest, res: Response) => {
    const storeId = sanitizeId(req.params.storeId);
    const check = getOwnedStore(db, storeId, req.actor!);
    if (!check.ok) {
      res.status(check.status).json({ error: check.message, code: check.code });
      return;
    }
    const prodAgg = db
      .prepare('SELECT COUNT(*) AS totalProducts, COALESCE(SUM(stock_quantity), 0) AS totalStock FROM store_products WHERE store_id = ?')
      .get(storeId) as { totalProducts: number; totalStock: number };
    const orderAgg = db
      .prepare("SELECT COUNT(*) AS totalOrders, COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total_amount ELSE 0 END), 0) AS grossTotal FROM store_orders WHERE store_id = ?")
      .get(storeId) as { totalOrders: number; grossTotal: number };
    const custAgg = db
      .prepare('SELECT COUNT(*) AS totalCustomers FROM store_customers WHERE store_id = ?')
      .get(storeId) as { totalCustomers: number };

    res.json({
      storeId,
      currency: check.store.currency,
      totalProducts: prodAgg.totalProducts,
      totalStock: prodAgg.totalStock,
      totalOrders: orderAgg.totalOrders,
      grossOrderValue: orderAgg.grossTotal,
      totalCustomers: custAgg.totalCustomers
    });
  });

  // ==================== DISCOUNTS, SHIPPING ZONES, STORE PAGES & SUPPLIER IMPORT ====================
  router.get('/api/stores/:storeId/discounts', requireAuth, (req: AuthedRequest, res: Response) => {
    const storeId = sanitizeId(req.params.storeId);
    const check = getOwnedStore(db, storeId, req.actor!);
    if (!check.ok) {
      res.status(check.status).json({ error: check.message, code: check.code });
      return;
    }
    const discounts = db.prepare('SELECT * FROM store_discounts WHERE store_id = ? ORDER BY created_at DESC').all(storeId);
    res.json({ discounts });
  });

  router.post('/api/stores/:storeId/discounts', requireAuth, (req: AuthedRequest, res: Response) => {
    const actor = req.actor!;
    const storeId = sanitizeId(req.params.storeId);
    const check = getOwnedStore(db, storeId, actor);
    if (!check.ok) {
      res.status(check.status).json({ error: check.message, code: check.code });
      return;
    }
    const code = sanitizeText(req.body?.code, 40).toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    const discountType = req.body?.type === 'fixed' ? 'fixed' : 'percentage';
    const value = Number(req.body?.value ?? 0);
    const usageLimit = Math.max(1, Math.floor(Number(req.body?.usageLimit ?? 100)));
    if (!code || !Number.isFinite(value) || value < 0) {
      res.status(400).json({ error: 'Valid coupon code and non-negative value required.', code: 'INVALID_DISCOUNT' });
      return;
    }
    const id = `dsc_${generateToken(6)}`;
    db.prepare(
      `INSERT INTO store_discounts (id, store_id, tenant_id, code, discount_type, value, used_count, usage_limit, status)
       VALUES (?, ?, ?, ?, ?, ?, 0, ?, 'active')`
    ).run(id, storeId, String(check.store.tenant_id), code, discountType, value, usageLimit);
    logAudit(db, String(check.store.tenant_id), actor.userId, actor.name, `إنشاء كود خصم ${code}`, `Created store coupon ${code}`, id);
    res.status(201).json({ discount: db.prepare('SELECT * FROM store_discounts WHERE id = ?').get(id) });
  });

  router.patch('/api/stores/:storeId/discounts/:discountId', requireAuth, (req: AuthedRequest, res: Response) => {
    const storeId = sanitizeId(req.params.storeId);
    const discountId = sanitizeId(req.params.discountId);
    const check = getOwnedStore(db, storeId, req.actor!);
    if (!check.ok) {
      res.status(check.status).json({ error: check.message, code: check.code });
      return;
    }
    const existing = db.prepare('SELECT * FROM store_discounts WHERE id = ? AND store_id = ?').get(discountId, storeId) as
      | Record<string, unknown>
      | undefined;
    if (!existing) {
      res.status(404).json({ error: 'Discount not found in this store.', code: 'DISCOUNT_NOT_FOUND' });
      return;
    }
    const nextStatus =
      req.body?.status === 'active' || req.body?.status === 'expired'
        ? req.body.status
        : existing.status === 'active'
        ? 'expired'
        : 'active';
    db.prepare('UPDATE store_discounts SET status = ? WHERE id = ? AND store_id = ?').run(nextStatus, discountId, storeId);
    res.json({ discount: db.prepare('SELECT * FROM store_discounts WHERE id = ?').get(discountId) });
  });

  router.get('/api/stores/:storeId/shipping-zones', requireAuth, (req: AuthedRequest, res: Response) => {
    const storeId = sanitizeId(req.params.storeId);
    const check = getOwnedStore(db, storeId, req.actor!);
    if (!check.ok) {
      res.status(check.status).json({ error: check.message, code: check.code });
      return;
    }
    const shippingZones = db.prepare('SELECT * FROM store_shipping_zones WHERE store_id = ? ORDER BY created_at DESC').all(storeId);
    res.json({ shippingZones });
  });

  router.post('/api/stores/:storeId/shipping-zones', requireAuth, (req: AuthedRequest, res: Response) => {
    const actor = req.actor!;
    const storeId = sanitizeId(req.params.storeId);
    const check = getOwnedStore(db, storeId, actor);
    if (!check.ok) {
      res.status(check.status).json({ error: check.message, code: check.code });
      return;
    }
    const regionNameAr = sanitizeText(req.body?.regionNameAr, 160);
    const regionNameEn = sanitizeText(req.body?.regionNameEn || regionNameAr, 160);
    const carrier = sanitizeText(req.body?.carrier || 'DHL Express', 120);
    const rate = Number(req.body?.rate ?? 0);
    if (!regionNameAr || !Number.isFinite(rate) || rate < 0) {
      res.status(400).json({ error: 'Region name and non-negative shipping rate required.', code: 'INVALID_SHIPPING_ZONE' });
      return;
    }
    const id = `shp_${generateToken(6)}`;
    db.prepare(
      `INSERT INTO store_shipping_zones (
        id, store_id, tenant_id, region_name_ar, region_name_en, carrier, rate, delivery_time_ar, delivery_time_en, active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      storeId,
      String(check.store.tenant_id),
      regionNameAr,
      regionNameEn,
      carrier,
      rate,
      sanitizeText(req.body?.deliveryTimeAr || '2 - 5 أيام عمل', 80),
      sanitizeText(req.body?.deliveryTimeEn || '2 - 5 Business Days', 80),
      req.body?.active === false ? 0 : 1
    );
    logAudit(db, String(check.store.tenant_id), actor.userId, actor.name, `إضافة منطقة شحن (${regionNameAr})`, `Added shipping zone (${regionNameEn})`, id);
    res.status(201).json({ shippingZone: db.prepare('SELECT * FROM store_shipping_zones WHERE id = ?').get(id) });
  });

  router.get('/api/stores/:storeId/pages', requireAuth, (req: AuthedRequest, res: Response) => {
    const storeId = sanitizeId(req.params.storeId);
    const check = getOwnedStore(db, storeId, req.actor!);
    if (!check.ok) {
      res.status(check.status).json({ error: check.message, code: check.code });
      return;
    }
    const pages = db.prepare('SELECT * FROM store_pages WHERE store_id = ? ORDER BY updated_at DESC').all(storeId);
    res.json({ pages });
  });

  router.post('/api/stores/:storeId/pages', requireAuth, (req: AuthedRequest, res: Response) => {
    const actor = req.actor!;
    const storeId = sanitizeId(req.params.storeId);
    const check = getOwnedStore(db, storeId, actor);
    if (!check.ok) {
      res.status(check.status).json({ error: check.message, code: check.code });
      return;
    }
    const titleAr = sanitizeText(req.body?.titleAr, 160);
    const titleEn = sanitizeText(req.body?.titleEn || titleAr, 160);
    const slug = (sanitizeText(req.body?.slug || titleEn, 80) || generateToken(3))
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-');
    if (!titleAr) {
      res.status(400).json({ error: 'Page titleAr is required.', code: 'INVALID_PAGE' });
      return;
    }
    const pageId = req.body?.id ? sanitizeId(req.body.id) : `pg_${generateToken(6)}`;
    const existing = req.body?.id
      ? db.prepare('SELECT id FROM store_pages WHERE id = ? AND store_id = ?').get(pageId, storeId)
      : null;

    if (existing) {
      db.prepare(
        `UPDATE store_pages
         SET slug = ?, title_ar = ?, title_en = ?, content_ar = ?, content_en = ?, published = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ? AND store_id = ?`
      ).run(
        slug,
        titleAr,
        titleEn,
        sanitizeText(req.body?.contentAr || '', 4000),
        sanitizeText(req.body?.contentEn || '', 4000),
        req.body?.published === false ? 0 : 1,
        pageId,
        storeId
      );
    } else {
      db.prepare(
        `INSERT INTO store_pages (id, store_id, tenant_id, slug, title_ar, title_en, content_ar, content_en, published)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        pageId,
        storeId,
        String(check.store.tenant_id),
        slug,
        titleAr,
        titleEn,
        sanitizeText(req.body?.contentAr || '', 4000),
        sanitizeText(req.body?.contentEn || '', 4000),
        req.body?.published === false ? 0 : 1
      );
    }
    res.status(existing ? 200 : 201).json({ page: db.prepare('SELECT * FROM store_pages WHERE id = ?').get(pageId) });
  });

  router.delete('/api/stores/:storeId/pages/:pageId', requireAuth, (req: AuthedRequest, res: Response) => {
    const storeId = sanitizeId(req.params.storeId);
    const pageId = sanitizeId(req.params.pageId);
    const check = getOwnedStore(db, storeId, req.actor!);
    if (!check.ok) {
      res.status(check.status).json({ error: check.message, code: check.code });
      return;
    }
    const result = db.prepare('DELETE FROM store_pages WHERE id = ? AND store_id = ?').run(pageId, storeId);
    if (result.changes === 0) {
      res.status(404).json({ error: 'Page not found in this store.', code: 'PAGE_NOT_FOUND' });
      return;
    }
    res.json({ ok: true });
  });

  router.post('/api/stores/:storeId/supplier-import', requireAuth, (req: AuthedRequest, res: Response) => {
    const actor = req.actor!;
    const storeId = sanitizeId(req.params.storeId);
    const check = getOwnedStore(db, storeId, actor);
    if (!check.ok) {
      res.status(check.status).json({ error: check.message, code: check.code });
      return;
    }
    const supplierName = sanitizeText(req.body?.supplierName || 'Verified Supplier Feed', 120);
    const titleAr = sanitizeText(req.body?.titleAr || req.body?.nameAr, 200);
    const titleEn = sanitizeText(req.body?.titleEn || req.body?.nameEn || titleAr, 200);
    const retailPrice = Number(req.body?.retailPrice ?? req.body?.price ?? 0);
    const costPrice = Number(req.body?.costPrice ?? Math.round(retailPrice * 0.55));
    const stock = Math.max(0, Math.floor(Number(req.body?.stock ?? 50)));
    if (!titleAr || !Number.isFinite(retailPrice) || retailPrice <= 0) {
      res.status(400).json({ error: 'Valid supplier product title and positive retailPrice required.', code: 'INVALID_SUPPLIER_ITEM' });
      return;
    }
    const prodId = `prod_${generateToken(6)}`;
    const sku = sanitizeText(req.body?.sku || `SUP-${generateToken(3).toUpperCase()}`, 64);
    db.prepare(
      `INSERT INTO store_products (
        id, store_id, tenant_id, category_id, title_ar, title_en, sku, product_type,
        retail_price, cost_price, stock_quantity, category_ar, category_en, status, sales_count
      ) VALUES (?, ?, ?, NULL, ?, ?, ?, 'physical', ?, ?, ?, ?, ?, 'active', 0)`
    ).run(
      prodId,
      storeId,
      String(check.store.tenant_id),
      titleAr,
      titleEn,
      sku,
      retailPrice,
      Math.max(0, costPrice),
      stock,
      `مورد: ${supplierName}`,
      `Supplier: ${supplierName}`
    );
    logAudit(db, String(check.store.tenant_id), actor.userId, actor.name, `استيراد منتج مورد (${titleAr})`, `Imported supplier product (${titleEn}) from ${supplierName}`, prodId);
    res.status(201).json({ product: db.prepare('SELECT * FROM store_products WHERE id = ?').get(prodId) });
  });
}
