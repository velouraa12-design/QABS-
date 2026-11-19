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
    const rawStock = Number(req.body?.stock ?? req.body?.stockQuantity ?? 0);
    const stock = Math.floor(rawStock);
    const categoryId = req.body?.categoryId ? sanitizeId(req.body.categoryId) : null;
    if (!titleAr || !sku || !Number.isFinite(price) || price < 0 ||
        !Number.isFinite(cost) || cost < 0 || !Number.isSafeInteger(stock) || stock < 0) {
      res.status(400).json({ error: 'Valid product title, price, cost and non-negative integer stock are required.', code: 'INVALID_PRODUCT' });
      return;
    }
    if (categoryId) {
      const category = db.prepare(
        'SELECT id FROM store_categories WHERE id = ? AND store_id = ? AND tenant_id = ?'
      ).get(categoryId, storeId, String(check.store.tenant_id));
      if (!category) {
        res.status(400).json({ error: 'Category must belong to this store.', code: 'INVALID_PRODUCT_CATEGORY' });
        return;
      }
    }
    const duplicateSku = db.prepare(
      'SELECT id FROM store_products WHERE store_id = ? AND tenant_id = ? AND sku = ?'
    ).get(storeId, String(check.store.tenant_id), sku);
    if (duplicateSku) {
      res.status(409).json({ error: 'Product SKU already exists in this store.', code: 'PRODUCT_SKU_TAKEN' });
      return;
    }

    const prodId = `prod_${generateToken(6)}`;
    db.exec('BEGIN IMMEDIATE');
    try {
      db.prepare(
        `INSERT INTO store_products (
          id, store_id, tenant_id, category_id, title_ar, title_en, sku, product_type,
          retail_price, cost_price, stock_quantity, category_ar, category_en, status, sales_count
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`
      ).run(
        prodId,
        storeId,
        String(check.store.tenant_id),
        categoryId,
        titleAr,
        titleEn,
        sku,
        req.body?.productType === 'digital' ? 'digital' : 'physical',
        price,
        cost,
        stock,
        sanitizeText(req.body?.categoryAr || 'عام', 80),
        sanitizeText(req.body?.categoryEn || 'General', 80),
        req.body?.status === 'draft' ? 'draft' : stock === 0 ? 'out_of_stock' : 'active'
      );
      if (stock > 0) {
        db.prepare(
          `INSERT INTO store_inventory_movements (
            id, store_id, tenant_id, product_id, actor_user_id,
            quantity_delta, balance_after, reason, reference_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 'initial_stock', ?)`
        ).run(`mov_${generateToken(8)}`, storeId, String(check.store.tenant_id),
          prodId, actor.userId, stock, stock, prodId);
      }
      db.exec('COMMIT');
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }

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
    const price = req.body?.price !== undefined ? Number(req.body.price) : Number(existing.retail_price);
    if (req.body?.stock !== undefined && Number(req.body.stock) !== Number(existing.stock_quantity)) {
      res.status(400).json({ error: 'Use the inventory adjustment endpoint to change stock so the ledger stays accurate.', code: 'INVENTORY_ADJUSTMENT_REQUIRED' });
      return;
    }
    const stock = Number(existing.stock_quantity);
    const titleAr = req.body?.titleAr ? sanitizeText(req.body.titleAr, 200) : String(existing.title_ar);
    const allowedProductStatuses = new Set(['active', 'draft', 'out_of_stock', 'archived']);
    const status = req.body?.status !== undefined ? sanitizeText(req.body.status, 32) :
      stock === 0 ? 'out_of_stock' : String(existing.status);
    if (!titleAr || !Number.isFinite(price) || price < 0 || !Number.isSafeInteger(stock) || stock < 0 ||
        !allowedProductStatuses.has(status)) {
      res.status(400).json({ error: 'Invalid product update.', code: 'INVALID_PRODUCT' });
      return;
    }

    db.prepare(
      `UPDATE store_products SET title_ar = ?, retail_price = ?, stock_quantity = ?, status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND store_id = ?`
    ).run(titleAr, price, stock, status, productId, storeId);

    res.json({ product: db.prepare('SELECT * FROM store_products WHERE id = ?').get(productId) });
  });

  router.delete('/api/stores/:storeId/products/:productId', requireAuth, (req: AuthedRequest, res: Response) => {
    const actor = req.actor!;
    const storeId = sanitizeId(req.params.storeId);
    const productId = sanitizeId(req.params.productId);
    const check = getOwnedStore(db, storeId, actor);
    if (!check.ok) {
      res.status(check.status).json({ error: check.message, code: check.code });
      return;
    }
    const product = db.prepare(
      'SELECT id, title_ar FROM store_products WHERE id = ? AND store_id = ? AND tenant_id = ?'
    ).get(productId, storeId, String(check.store.tenant_id)) as { id: string; title_ar: string } | undefined;
    if (!product) {
      res.status(404).json({ error: 'Product not found in this store.', code: 'PRODUCT_NOT_FOUND' });
      return;
    }
    const hasHistory = Number((db.prepare(
      'SELECT COUNT(*) AS count FROM store_order_items WHERE product_id = ? AND store_id = ?'
    ).get(productId, storeId) as { count: number }).count) > 0 ||
      Number((db.prepare(
        'SELECT COUNT(*) AS count FROM store_inventory_movements WHERE product_id = ? AND store_id = ?'
      ).get(productId, storeId) as { count: number }).count) > 0;

    if (hasHistory) {
      db.prepare(
        `UPDATE store_products SET status = 'archived', updated_at = CURRENT_TIMESTAMP
         WHERE id = ? AND store_id = ? AND tenant_id = ?`
      ).run(productId, storeId, String(check.store.tenant_id));
    } else {
      db.prepare(
        'DELETE FROM store_products WHERE id = ? AND store_id = ? AND tenant_id = ?'
      ).run(productId, storeId, String(check.store.tenant_id));
    }
    logAudit(db, actor.tenantId, actor.userId, actor.name,
      `أرشفة أو حذف منتج (${product.title_ar})`, `Archived or removed product (${product.title_ar})`, productId);
    res.json({ ok: true, archived: hasHistory });
  });

  // Product variants and an auditable stock ledger.
  router.get('/api/stores/:storeId/products/:productId/variants', requireAuth, (req: AuthedRequest, res: Response) => {
    const storeId = sanitizeId(req.params.storeId);
    const productId = sanitizeId(req.params.productId);
    const check = getOwnedStore(db, storeId, req.actor!);
    if (!check.ok) {
      res.status(check.status).json({ error: check.message, code: check.code });
      return;
    }
    const product = db.prepare('SELECT id FROM store_products WHERE id = ? AND store_id = ? AND tenant_id = ?')
      .get(productId, storeId, String(check.store.tenant_id));
    if (!product) {
      res.status(404).json({ error: 'Product not found in this store.', code: 'PRODUCT_NOT_FOUND' });
      return;
    }
    const variants = db.prepare(
      'SELECT * FROM store_product_variants WHERE product_id = ? AND store_id = ? ORDER BY created_at ASC'
    ).all(productId, storeId);
    res.json({ variants });
  });

  router.post('/api/stores/:storeId/products/:productId/variants', requireAuth, (req: AuthedRequest, res: Response) => {
    const actor = req.actor!;
    const storeId = sanitizeId(req.params.storeId);
    const productId = sanitizeId(req.params.productId);
    const check = getOwnedStore(db, storeId, actor);
    if (!check.ok) {
      res.status(check.status).json({ error: check.message, code: check.code });
      return;
    }
    const product = db.prepare(
      'SELECT * FROM store_products WHERE id = ? AND store_id = ? AND tenant_id = ?'
    ).get(productId, storeId, String(check.store.tenant_id)) as Record<string, unknown> | undefined;
    if (!product) {
      res.status(404).json({ error: 'Product not found in this store.', code: 'PRODUCT_NOT_FOUND' });
      return;
    }

    const title = sanitizeText(req.body?.title, 120);
    const sku = sanitizeText(req.body?.sku || `VAR-${generateToken(4).toUpperCase()}`, 64);
    const options = req.body?.options;
    const price = Number(req.body?.price ?? product.retail_price);
    const compareAtRaw = req.body?.compareAtPrice;
    const compareAt = compareAtRaw === undefined || compareAtRaw === null || compareAtRaw === ''
      ? null : Number(compareAtRaw);
    const existingVariantCount = Number((db.prepare(
      'SELECT COUNT(*) AS count FROM store_product_variants WHERE product_id = ? AND store_id = ?'
    ).get(productId, storeId) as { count: number }).count);
    const parentStock = Number(product.stock_quantity);
    // When converting an existing simple product to variants, carry its current
    // stock into the first variant unless an exact reconciliation is supplied.
    const stock = req.body?.stock === undefined
      ? (existingVariantCount === 0 ? parentStock : 0)
      : Number(req.body.stock);
    const status = ['active', 'draft', 'archived'].includes(req.body?.status) ? req.body.status : 'active';

    if (!title || !sku || !options || typeof options !== 'object' || Array.isArray(options) ||
        !Number.isFinite(price) || price < 0 ||
        (compareAt !== null && (!Number.isFinite(compareAt) || compareAt < 0)) ||
        !Number.isSafeInteger(stock) || stock < 0) {
      res.status(400).json({ error: 'Valid variant title, options, price and non-negative integer stock are required.', code: 'INVALID_VARIANT' });
      return;
    }
    if (existingVariantCount === 0 && parentStock > 0 && req.body?.stock !== undefined && stock !== parentStock) {
      res.status(409).json({
        error: 'Reconcile the existing product stock into its first variant to avoid losing inventory.',
        code: 'INVENTORY_RECONCILIATION_REQUIRED'
      });
      return;
    }
    const duplicate = db.prepare('SELECT id FROM store_product_variants WHERE store_id = ? AND sku = ?')
      .get(storeId, sku);
    if (duplicate) {
      res.status(409).json({ error: 'Variant SKU already exists in this store.', code: 'VARIANT_SKU_TAKEN' });
      return;
    }

    const variantId = `var_${generateToken(8)}`;
    db.exec('BEGIN IMMEDIATE');
    try {
      db.prepare(
        `INSERT INTO store_product_variants (
          id, store_id, tenant_id, product_id, title, sku, options_json,
          retail_price, compare_at_price, stock_quantity, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        variantId, storeId, String(check.store.tenant_id), productId, title, sku,
        JSON.stringify(options), price, compareAt, stock, status
      );
      if (stock > 0) {
        db.prepare(
          `INSERT INTO store_inventory_movements (
            id, store_id, tenant_id, product_id, variant_id, actor_user_id,
            quantity_delta, balance_after, reason, reference_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'initial_stock', ?)`
        ).run(`mov_${generateToken(8)}`, storeId, String(check.store.tenant_id), productId,
          variantId, actor.userId, stock, stock, variantId);
      }
      db.prepare(
        `UPDATE store_products SET stock_quantity = (
          SELECT COALESCE(SUM(stock_quantity), 0) FROM store_product_variants
          WHERE product_id = ? AND store_id = ?
        ), updated_at = CURRENT_TIMESTAMP WHERE id = ? AND store_id = ?`
      ).run(productId, storeId, productId, storeId);
      db.exec('COMMIT');
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }

    logAudit(db, actor.tenantId, actor.userId, actor.name, `إضافة متغير منتج (${title})`,
      `Added product variant (${title})`, variantId);
    res.status(201).json({ variant: db.prepare('SELECT * FROM store_product_variants WHERE id = ?').get(variantId) });
  });

  router.patch('/api/stores/:storeId/products/:productId/variants/:variantId', requireAuth, (req: AuthedRequest, res: Response) => {
    const storeId = sanitizeId(req.params.storeId);
    const productId = sanitizeId(req.params.productId);
    const variantId = sanitizeId(req.params.variantId);
    const check = getOwnedStore(db, storeId, req.actor!);
    if (!check.ok) {
      res.status(check.status).json({ error: check.message, code: check.code });
      return;
    }
    const existing = db.prepare(
      'SELECT * FROM store_product_variants WHERE id = ? AND product_id = ? AND store_id = ? AND tenant_id = ?'
    ).get(variantId, productId, storeId, String(check.store.tenant_id)) as Record<string, unknown> | undefined;
    if (!existing) {
      res.status(404).json({ error: 'Variant not found in this store.', code: 'VARIANT_NOT_FOUND' });
      return;
    }

    const title = req.body?.title === undefined ? String(existing.title) : sanitizeText(req.body.title, 120);
    const sku = req.body?.sku === undefined ? String(existing.sku) : sanitizeText(req.body.sku, 64);
    const price = req.body?.price === undefined ? Number(existing.retail_price) : Number(req.body.price);
    const compareAtRaw = req.body?.compareAtPrice === undefined ? existing.compare_at_price : req.body.compareAtPrice;
    const compareAt = compareAtRaw === null || compareAtRaw === '' ? null : Number(compareAtRaw);
    const options = req.body?.options === undefined ? String(existing.options_json) : JSON.stringify(req.body.options);
    const status = req.body?.status === undefined ? String(existing.status) :
      (['active', 'draft', 'archived'].includes(req.body.status) ? req.body.status : '');
    if (!title || !sku || !Number.isFinite(price) || price < 0 ||
        (compareAt !== null && (!Number.isFinite(compareAt) || compareAt < 0)) ||
        !status || (req.body?.options !== undefined &&
          (!req.body.options || typeof req.body.options !== 'object' || Array.isArray(req.body.options)))) {
      res.status(400).json({ error: 'Invalid variant update.', code: 'INVALID_VARIANT' });
      return;
    }
    const duplicate = db.prepare(
      'SELECT id FROM store_product_variants WHERE store_id = ? AND sku = ? AND id != ?'
    ).get(storeId, sku, variantId);
    if (duplicate) {
      res.status(409).json({ error: 'Variant SKU already exists in this store.', code: 'VARIANT_SKU_TAKEN' });
      return;
    }
    db.prepare(
      `UPDATE store_product_variants SET title = ?, sku = ?, options_json = ?,
        retail_price = ?, compare_at_price = ?, status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND product_id = ? AND store_id = ? AND tenant_id = ?`
    ).run(title, sku, options, price, compareAt, status, variantId, productId, storeId, String(check.store.tenant_id));
    res.json({ variant: db.prepare('SELECT * FROM store_product_variants WHERE id = ?').get(variantId) });
  });

  router.post('/api/stores/:storeId/products/:productId/inventory-adjustments', requireAuth, (req: AuthedRequest, res: Response) => {
    const actor = req.actor!;
    const storeId = sanitizeId(req.params.storeId);
    const productId = sanitizeId(req.params.productId);
    const check = getOwnedStore(db, storeId, actor);
    if (!check.ok) {
      res.status(check.status).json({ error: check.message, code: check.code });
      return;
    }
    const product = db.prepare(
      'SELECT * FROM store_products WHERE id = ? AND store_id = ? AND tenant_id = ?'
    ).get(productId, storeId, String(check.store.tenant_id)) as Record<string, unknown> | undefined;
    if (!product) {
      res.status(404).json({ error: 'Product not found in this store.', code: 'PRODUCT_NOT_FOUND' });
      return;
    }

    const delta = Number(req.body?.quantityDelta);
    const variantId = req.body?.variantId ? sanitizeId(req.body.variantId) : null;
    const reason = sanitizeText(req.body?.reason, 64);
    const referenceId = sanitizeText(req.body?.referenceId, 120) || null;
    const allowedReasons = new Set(['restock', 'manual_adjustment', 'correction', 'damaged', 'returned']);
    if (!Number.isSafeInteger(delta) || delta === 0 || !allowedReasons.has(reason)) {
      res.status(400).json({ error: 'A non-zero integer quantityDelta and valid reason are required.', code: 'INVALID_INVENTORY_ADJUSTMENT' });
      return;
    }

    const variantCount = Number((db.prepare(
      'SELECT COUNT(*) AS count FROM store_product_variants WHERE product_id = ? AND store_id = ?'
    ).get(productId, storeId) as { count: number }).count);
    if (variantCount > 0 && !variantId) {
      res.status(400).json({ error: 'Select a product variant for inventory changes.', code: 'VARIANT_REQUIRED' });
      return;
    }

    db.exec('BEGIN IMMEDIATE');
    try {
      let balanceAfter: number;
      if (variantId) {
        const variant = db.prepare(
          'SELECT stock_quantity FROM store_product_variants WHERE id = ? AND product_id = ? AND store_id = ? AND tenant_id = ?'
        ).get(variantId, productId, storeId, String(check.store.tenant_id)) as { stock_quantity: number } | undefined;
        if (!variant) {
          db.exec('ROLLBACK');
          res.status(404).json({ error: 'Variant not found in this store.', code: 'VARIANT_NOT_FOUND' });
          return;
        }
        const changed = db.prepare(
          `UPDATE store_product_variants SET stock_quantity = stock_quantity + ?, updated_at = CURRENT_TIMESTAMP
           WHERE id = ? AND product_id = ? AND store_id = ? AND tenant_id = ? AND stock_quantity + ? >= 0`
        ).run(delta, variantId, productId, storeId, String(check.store.tenant_id), delta);
        if (Number(changed.changes) !== 1) {
          db.exec('ROLLBACK');
          res.status(409).json({ error: 'Inventory cannot become negative.', code: 'INSUFFICIENT_STOCK' });
          return;
        }
        balanceAfter = Number((db.prepare(
          'SELECT stock_quantity FROM store_product_variants WHERE id = ?'
        ).get(variantId) as { stock_quantity: number }).stock_quantity);
        db.prepare(
          `UPDATE store_products SET stock_quantity = (
            SELECT COALESCE(SUM(stock_quantity), 0) FROM store_product_variants
            WHERE product_id = ? AND store_id = ?
          ), updated_at = CURRENT_TIMESTAMP WHERE id = ? AND store_id = ?`
        ).run(productId, storeId, productId, storeId);
      } else {
        const changed = db.prepare(
          `UPDATE store_products SET stock_quantity = stock_quantity + ?, updated_at = CURRENT_TIMESTAMP
           WHERE id = ? AND store_id = ? AND tenant_id = ? AND stock_quantity + ? >= 0`
        ).run(delta, productId, storeId, String(check.store.tenant_id), delta);
        if (Number(changed.changes) !== 1) {
          db.exec('ROLLBACK');
          res.status(409).json({ error: 'Inventory cannot become negative.', code: 'INSUFFICIENT_STOCK' });
          return;
        }
        balanceAfter = Number((db.prepare(
          'SELECT stock_quantity FROM store_products WHERE id = ? AND store_id = ?'
        ).get(productId, storeId) as { stock_quantity: number }).stock_quantity);
      }

      db.prepare(
        `INSERT INTO store_inventory_movements (
          id, store_id, tenant_id, product_id, variant_id, actor_user_id,
          quantity_delta, balance_after, reason, reference_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(`mov_${generateToken(8)}`, storeId, String(check.store.tenant_id), productId,
        variantId, actor.userId, delta, balanceAfter, reason, referenceId);
      db.exec('COMMIT');
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }

    logAudit(db, actor.tenantId, actor.userId, actor.name, 'تعديل مخزون المنتج',
      'Adjusted product inventory', variantId || productId);
    const current = db.prepare('SELECT stock_quantity FROM store_products WHERE id = ?').get(productId) as { stock_quantity: number };
    const movements = db.prepare(
      'SELECT * FROM store_inventory_movements WHERE product_id = ? AND store_id = ? ORDER BY created_at DESC, rowid DESC LIMIT 50'
    ).all(productId, storeId);
    res.status(201).json({ productId, variantId, stockQuantity: current.stock_quantity, movements });
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
    const customerEmail = sanitizeText(req.body?.customerEmail, 160).toLowerCase();
    const customerCountry = sanitizeText(req.body?.customerCountry || 'SA', 32);
    const suppliedItems = req.body?.items;
    const hasLineItems = suppliedItems !== undefined;
    if (!customerName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail) ||
        (hasLineItems && (!Array.isArray(suppliedItems) || suppliedItems.length < 1 || suppliedItems.length > 100))) {
      res.status(400).json({ error: 'Valid customer details and up to 100 order items are required.', code: 'INVALID_ORDER' });
      return;
    }

    const orderLines: Array<{
      productId: string; variantId: string | null; title: string; sku: string;
      quantity: number; unitPrice: number; lineTotal: number;
    }> = [];
    let totalAmount = 0;
    if (hasLineItems) {
      for (const item of suppliedItems as Array<Record<string, unknown>>) {
        const productId = sanitizeId(item?.productId);
        const variantId = item?.variantId ? sanitizeId(item.variantId) : null;
        const quantity = Number(item?.quantity);
        if (!productId || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 100000) {
          res.status(400).json({ error: 'Each order line needs a valid product and positive integer quantity.', code: 'INVALID_ORDER_ITEM' });
          return;
        }
        const product = db.prepare(
          'SELECT * FROM store_products WHERE id = ? AND store_id = ? AND tenant_id = ?'
        ).get(productId, storeId, String(check.store.tenant_id)) as Record<string, unknown> | undefined;
        if (!product || String(product.status) === 'archived') {
          res.status(400).json({ error: 'An order product is unavailable in this store.', code: 'ORDER_PRODUCT_UNAVAILABLE' });
          return;
        }
        let unitPrice = Number(product.retail_price);
        let sku = String(product.sku);
        let title = String(product.title_ar);
        let stock = Number(product.stock_quantity);
        if (variantId) {
          const variant = db.prepare(
            'SELECT * FROM store_product_variants WHERE id = ? AND product_id = ? AND store_id = ? AND tenant_id = ? AND status = ?'
          ).get(variantId, productId, storeId, String(check.store.tenant_id), 'active') as Record<string, unknown> | undefined;
          if (!variant) {
            res.status(400).json({ error: 'An order variant is unavailable in this store.', code: 'ORDER_VARIANT_UNAVAILABLE' });
            return;
          }
          unitPrice = Number(variant.retail_price);
          sku = String(variant.sku);
          title = `${title} — ${String(variant.title)}`;
          stock = Number(variant.stock_quantity);
        } else {
          const variants = Number((db.prepare(
            'SELECT COUNT(*) AS count FROM store_product_variants WHERE product_id = ? AND store_id = ?'
          ).get(productId, storeId) as { count: number }).count);
          if (variants > 0) {
            res.status(400).json({ error: 'Choose a variant for this product.', code: 'ORDER_VARIANT_REQUIRED' });
            return;
          }
        }
        if (stock < quantity) {
          res.status(409).json({ error: 'Insufficient stock for an order item.', code: 'INSUFFICIENT_STOCK' });
          return;
        }
        const lineTotal = Math.round(unitPrice * quantity * 100) / 100;
        totalAmount = Math.round((totalAmount + lineTotal) * 100) / 100;
        orderLines.push({ productId, variantId, title, sku, quantity, unitPrice, lineTotal });
      }
    } else {
      totalAmount = Number(req.body?.total ?? 0);
      if (!Number.isFinite(totalAmount) || totalAmount < 0) {
        res.status(400).json({ error: 'A non-negative manual order total is required.', code: 'INVALID_ORDER' });
        return;
      }
    }

    const orderId = `sord_${generateToken(6)}`;
    const orderNumber = `ORD-${generateToken(5).toUpperCase()}`;
    db.exec('BEGIN IMMEDIATE');
    try {
      // Re-check and reserve stock inside the write transaction to avoid overselling.
      for (const line of orderLines) {
        if (line.variantId) {
          const changed = db.prepare(
            `UPDATE store_product_variants SET stock_quantity = stock_quantity - ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ? AND product_id = ? AND store_id = ? AND tenant_id = ? AND stock_quantity >= ?`
          ).run(line.quantity, line.variantId, line.productId, storeId, String(check.store.tenant_id), line.quantity);
          if (Number(changed.changes) !== 1) throw new Error('ORDER_STOCK_CONFLICT');
          const balance = Number((db.prepare('SELECT stock_quantity FROM store_product_variants WHERE id = ?')
            .get(line.variantId) as { stock_quantity: number }).stock_quantity);
          db.prepare(
            `UPDATE store_products SET stock_quantity = (
              SELECT COALESCE(SUM(stock_quantity), 0) FROM store_product_variants
              WHERE product_id = ? AND store_id = ?
            ), updated_at = CURRENT_TIMESTAMP WHERE id = ? AND store_id = ?`
          ).run(line.productId, storeId, line.productId, storeId);
          db.prepare(
            `INSERT INTO store_inventory_movements (
              id, store_id, tenant_id, product_id, variant_id, actor_user_id,
              quantity_delta, balance_after, reason, reference_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'order_reserved', ?)`
          ).run(`mov_${generateToken(8)}`, storeId, String(check.store.tenant_id), line.productId,
            line.variantId, actor.userId, -line.quantity, balance, orderId);
        } else {
          const changed = db.prepare(
            `UPDATE store_products SET stock_quantity = stock_quantity - ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ? AND store_id = ? AND tenant_id = ? AND stock_quantity >= ?`
          ).run(line.quantity, line.productId, storeId, String(check.store.tenant_id), line.quantity);
          if (Number(changed.changes) !== 1) throw new Error('ORDER_STOCK_CONFLICT');
          const balance = Number((db.prepare('SELECT stock_quantity FROM store_products WHERE id = ?')
            .get(line.productId) as { stock_quantity: number }).stock_quantity);
          db.prepare(
            `INSERT INTO store_inventory_movements (
              id, store_id, tenant_id, product_id, actor_user_id,
              quantity_delta, balance_after, reason, reference_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'order_reserved', ?)`
          ).run(`mov_${generateToken(8)}`, storeId, String(check.store.tenant_id), line.productId,
            actor.userId, -line.quantity, balance, orderId);
        }
      }

      db.prepare(
        `INSERT INTO store_orders (
          id, store_id, tenant_id, order_number, customer_name, customer_email, customer_country,
          items_count, total_amount, currency, payment_gateway, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', 'processing')`
      ).run(orderId, storeId, String(check.store.tenant_id), orderNumber, customerName, customerEmail,
        customerCountry, orderLines.length ? orderLines.reduce((sum, line) => sum + line.quantity, 0) :
          Math.max(1, Math.floor(Number(req.body?.itemsCount ?? 1))),
        totalAmount, String(check.store.currency));

      for (const line of orderLines) {
        db.prepare(
          `INSERT INTO store_order_items (
            id, store_id, tenant_id, order_id, product_id, variant_id,
            product_title, sku, quantity, unit_price, line_total
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).run(`soi_${generateToken(8)}`, storeId, String(check.store.tenant_id), orderId,
          line.productId, line.variantId, line.title, line.sku, line.quantity, line.unitPrice, line.lineTotal);
      }

      const existingCustomer = db.prepare(
        'SELECT id FROM store_customers WHERE store_id = ? AND tenant_id = ? AND lower(email) = ? ORDER BY rowid LIMIT 1'
      ).get(storeId, String(check.store.tenant_id), customerEmail) as { id: string } | undefined;
      if (existingCustomer) {
        db.prepare(
          `UPDATE store_customers SET name = ?, country = ?, orders_count = orders_count + 1,
            total_spent = total_spent + ?, last_order_date = ? WHERE id = ? AND store_id = ? AND tenant_id = ?`
        ).run(customerName, customerCountry, totalAmount, new Date().toISOString().split('T')[0],
          existingCustomer.id, storeId, String(check.store.tenant_id));
      } else {
        db.prepare(
          `INSERT INTO store_customers (id, store_id, tenant_id, name, email, country, orders_count, total_spent, last_order_date)
           VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)`
        ).run(`scust_${generateToken(6)}`, storeId, String(check.store.tenant_id), customerName,
          customerEmail, customerCountry, totalAmount, new Date().toISOString().split('T')[0]);
      }
      db.exec('COMMIT');
    } catch (error) {
      db.exec('ROLLBACK');
      if (error instanceof Error && error.message === 'ORDER_STOCK_CONFLICT') {
        res.status(409).json({ error: 'Stock changed while creating this order. Refresh and try again.', code: 'INSUFFICIENT_STOCK' });
        return;
      }
      throw error;
    }

    logAudit(db, actor.tenantId, actor.userId, actor.name, `إنشاء طلب متجر (${orderNumber})`,
      `Created store order (${orderNumber})`, orderId);
    const order = db.prepare('SELECT * FROM store_orders WHERE id = ? AND store_id = ? AND tenant_id = ?')
      .get(orderId, storeId, String(check.store.tenant_id));
    const items = db.prepare('SELECT * FROM store_order_items WHERE order_id = ? AND store_id = ? ORDER BY rowid')
      .all(orderId, storeId);
    res.status(201).json({ order, items });
  });

  router.get('/api/stores/:storeId/orders/:orderId', requireAuth, (req: AuthedRequest, res: Response) => {
    const storeId = sanitizeId(req.params.storeId);
    const orderId = sanitizeId(req.params.orderId);
    const check = getOwnedStore(db, storeId, req.actor!);
    if (!check.ok) {
      res.status(check.status).json({ error: check.message, code: check.code });
      return;
    }
    const order = db.prepare(
      'SELECT * FROM store_orders WHERE id = ? AND store_id = ? AND tenant_id = ?'
    ).get(orderId, storeId, String(check.store.tenant_id));
    if (!order) {
      res.status(404).json({ error: 'Store order not found.', code: 'ORDER_NOT_FOUND' });
      return;
    }
    const items = db.prepare(
      'SELECT * FROM store_order_items WHERE order_id = ? AND store_id = ? AND tenant_id = ? ORDER BY rowid'
    ).all(orderId, storeId, String(check.store.tenant_id));
    res.json({ order, items });
  });

  router.patch('/api/stores/:storeId/orders/:orderId', requireAuth, (req: AuthedRequest, res: Response) => {
    const actor = req.actor!;
    const storeId = sanitizeId(req.params.storeId);
    const orderId = sanitizeId(req.params.orderId);
    const check = getOwnedStore(db, storeId, actor);
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
    const existing = db.prepare(
      'SELECT * FROM store_orders WHERE id = ? AND store_id = ? AND tenant_id = ?'
    ).get(orderId, storeId, String(check.store.tenant_id)) as Record<string, unknown> | undefined;
    if (!existing) {
      res.status(404).json({ error: 'Store order not found.', code: 'ORDER_NOT_FOUND' });
      return;
    }
    if (String(existing.status) === 'cancelled' && status !== 'cancelled') {
      res.status(409).json({ error: 'A cancelled order cannot be reopened; create a new order instead.', code: 'ORDER_ALREADY_CANCELLED' });
      return;
    }

    if (status === 'cancelled' && String(existing.status) !== 'cancelled') {
      const items = db.prepare(
        'SELECT * FROM store_order_items WHERE order_id = ? AND store_id = ? AND tenant_id = ?'
      ).all(orderId, storeId, String(check.store.tenant_id)) as Array<Record<string, unknown>>;
      db.exec('BEGIN IMMEDIATE');
      try {
        for (const item of items) {
          const quantity = Number(item.quantity);
          const productId = String(item.product_id);
          const variantId = item.variant_id ? String(item.variant_id) : null;
          if (variantId) {
            db.prepare(
              `UPDATE store_product_variants SET stock_quantity = stock_quantity + ?, updated_at = CURRENT_TIMESTAMP
               WHERE id = ? AND product_id = ? AND store_id = ? AND tenant_id = ?`
            ).run(quantity, variantId, productId, storeId, String(check.store.tenant_id));
            const balance = Number((db.prepare(
              'SELECT stock_quantity FROM store_product_variants WHERE id = ?'
            ).get(variantId) as { stock_quantity: number }).stock_quantity);
            db.prepare(
              `UPDATE store_products SET stock_quantity = (
                SELECT COALESCE(SUM(stock_quantity), 0) FROM store_product_variants
                WHERE product_id = ? AND store_id = ?
              ), updated_at = CURRENT_TIMESTAMP WHERE id = ? AND store_id = ? AND tenant_id = ?`
            ).run(productId, storeId, productId, storeId, String(check.store.tenant_id));
            db.prepare(
              `INSERT INTO store_inventory_movements (
                id, store_id, tenant_id, product_id, variant_id, actor_user_id,
                quantity_delta, balance_after, reason, reference_id
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'order_cancelled_restock', ?)`
            ).run(`mov_${generateToken(8)}`, storeId, String(check.store.tenant_id), productId,
              variantId, actor.userId, quantity, balance, orderId);
          } else {
            db.prepare(
              `UPDATE store_products SET stock_quantity = stock_quantity + ?, updated_at = CURRENT_TIMESTAMP
               WHERE id = ? AND store_id = ? AND tenant_id = ?`
            ).run(quantity, productId, storeId, String(check.store.tenant_id));
            const balance = Number((db.prepare(
              'SELECT stock_quantity FROM store_products WHERE id = ? AND store_id = ?'
            ).get(productId, storeId) as { stock_quantity: number }).stock_quantity);
            db.prepare(
              `INSERT INTO store_inventory_movements (
                id, store_id, tenant_id, product_id, actor_user_id,
                quantity_delta, balance_after, reason, reference_id
              ) VALUES (?, ?, ?, ?, ?, ?, ?, 'order_cancelled_restock', ?)`
            ).run(`mov_${generateToken(8)}`, storeId, String(check.store.tenant_id), productId,
              actor.userId, quantity, balance, orderId);
          }
        }
        db.prepare(
          `UPDATE store_customers
           SET orders_count = MAX(0, orders_count - 1),
               total_spent = MAX(0, ROUND(total_spent - ?, 2))
           WHERE store_id = ? AND tenant_id = ? AND lower(email) = lower(?)`
        ).run(Number(existing.total_amount), storeId, String(check.store.tenant_id), String(existing.customer_email));
        db.prepare(
          'UPDATE store_orders SET status = ?, tracking_number = COALESCE(?, tracking_number) WHERE id = ? AND store_id = ? AND tenant_id = ?'
        ).run(status, trackingNumber, orderId, storeId, String(check.store.tenant_id));
        db.exec('COMMIT');
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
    } else {
      db.prepare(
        'UPDATE store_orders SET status = ?, tracking_number = COALESCE(?, tracking_number) WHERE id = ? AND store_id = ? AND tenant_id = ?'
      ).run(status, trackingNumber, orderId, storeId, String(check.store.tenant_id));
    }

    logAudit(db, actor.tenantId, actor.userId, actor.name, `تحديث حالة الطلب (${orderId}) إلى ${status}`,
      `Updated order status (${orderId}) to ${status}`, orderId);
    res.json({ order: db.prepare('SELECT * FROM store_orders WHERE id = ? AND store_id = ?').get(orderId, storeId) });
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

  router.post('/api/stores/:storeId/customers', requireAuth, (req: AuthedRequest, res: Response) => {
    const actor = req.actor!;
    const storeId = sanitizeId(req.params.storeId);
    const check = getOwnedStore(db, storeId, actor);
    if (!check.ok) {
      res.status(check.status).json({ error: check.message, code: check.code });
      return;
    }
    const name = sanitizeText(req.body?.name, 160);
    const email = sanitizeText(req.body?.email, 160).toLowerCase();
    const phone = sanitizeText(req.body?.phone || '', 64);
    const country = sanitizeText(req.body?.country || 'SA', 32);
    if (!name || !email) {
      res.status(400).json({ error: 'Customer name and email are required.', code: 'INVALID_CUSTOMER' });
      return;
    }
    const custId = `scust_${generateToken(6)}`;
    const today = new Date().toISOString().split('T')[0];
    db.prepare(
      `INSERT INTO store_customers (id, store_id, tenant_id, name, email, phone, country, orders_count, total_spent, last_order_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, ?)`
    ).run(custId, storeId, String(check.store.tenant_id), name, email, phone, country, today);

    logAudit(db, String(check.store.tenant_id), actor.userId, actor.name, `إضافة عميل للمتجر (${name})`, `Added store customer (${email})`, custId);
    res.status(201).json({ customer: db.prepare('SELECT * FROM store_customers WHERE id = ?').get(custId) });
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
