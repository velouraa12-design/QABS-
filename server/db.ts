import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { generateToken, hashPassword, type PlatformRole } from './security.ts';

export function createDatabase(dbPath: string): DatabaseSync {
  if (dbPath !== ':memory:') {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  }
  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('PRAGMA journal_mode = WAL;');

  db.exec(`
    CREATE TABLE IF NOT EXISTS tenants (
      id TEXT PRIMARY KEY,
      owner_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      company_legal_name TEXT DEFAULT '',
      role TEXT DEFAULT 'customer',
      credits_balance REAL NOT NULL DEFAULT 0 CHECK (credits_balance >= 0),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer'
        CHECK (role IN ('super_admin', 'admin', 'staff', 'support', 'customer')),
      email_verified INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'suspended')),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      csrf_token TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      revoked_at TEXT,
      user_agent TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS auth_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      purpose TEXT NOT NULL CHECK (purpose IN ('password_reset', 'email_verify')),
      token_hash TEXT UNIQUE NOT NULL,
      expires_at TEXT NOT NULL,
      used_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS rate_limits (
      rate_key TEXT PRIMARY KEY,
      count INTEGER NOT NULL DEFAULT 0,
      reset_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS studio_request_attempts (
      tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      attempt_id TEXT NOT NULL,
      request_id TEXT NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (tenant_id, attempt_id)
    );

    CREATE TABLE IF NOT EXISTS services_catalog (
      slug TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      title_ar TEXT NOT NULL,
      title_en TEXT NOT NULL,
      starting_price_usd REAL NOT NULL CHECK (starting_price_usd >= 0),
      active INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS service_requests (
      id TEXT PRIMARY KEY,
      reference_code TEXT UNIQUE NOT NULL,
      tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      service_slug TEXT NOT NULL,
      service_path TEXT NOT NULL,
      service_title_ar TEXT NOT NULL,
      service_title_en TEXT NOT NULL,
      package_id TEXT,
      package_name_ar TEXT,
      package_name_en TEXT,
      price_usd REAL NOT NULL DEFAULT 0 CHECK (price_usd >= 0),
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      company_or_store_name TEXT,
      custom_fields_json TEXT NOT NULL DEFAULT '{}',
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'new'
        CHECK (status IN ('draft', 'new', 'under_review', 'needs_info', 'in_progress', 'completed', 'rejected', 'cancelled')),
      assigned_staff_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      admin_notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS company_formations (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      company_name TEXT NOT NULL,
      jurisdiction TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      state_file_number TEXT,
      ein TEXT,
      crn TEXT,
      registered_agent TEXT NOT NULL,
      registered_address TEXT NOT NULL,
      filing_date TEXT NOT NULL,
      renewal_due_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      formation_stage INTEGER NOT NULL DEFAULT 1,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS request_documents (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      uploaded_by TEXT REFERENCES users(id) ON DELETE SET NULL,
      request_id TEXT REFERENCES service_requests(id) ON DELETE CASCADE,
      formation_id TEXT REFERENCES company_formations(id) ON DELETE CASCADE,
      document_name TEXT NOT NULL,
      document_type TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size_bytes INTEGER NOT NULL CHECK (size_bytes > 0 AND size_bytes <= 5242880),
      sha256_hash TEXT NOT NULL,
      content_base64 TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'uploaded'
        CHECK (status IN ('uploaded', 'verified', 'rejected')),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS store_instances (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      subdomain TEXT UNIQUE NOT NULL,
      custom_domain TEXT,
      domain_status TEXT NOT NULL DEFAULT 'none',
      currency TEXT NOT NULL DEFAULT 'SAR',
      theme_preset TEXT NOT NULL DEFAULT 'gold_executive',
      status TEXT NOT NULL DEFAULT 'draft',
      approval_status TEXT NOT NULL DEFAULT 'draft'
        CHECK (approval_status IN ('draft', 'pending_review', 'approved_published', 'changes_requested', 'rejected')),
      payment_connected INTEGER NOT NULL DEFAULT 0,
      payment_approval_status TEXT NOT NULL DEFAULT 'unconfigured'
        CHECK (payment_approval_status IN ('unconfigured', 'pending_admin_approval', 'approved_active')),
      gateway_type TEXT NOT NULL DEFAULT 'Stripe',
      settings_json TEXT NOT NULL DEFAULT '{}',
      admin_feedback TEXT,
      total_revenue REAL NOT NULL DEFAULT 0 CHECK (total_revenue >= 0),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS store_categories (
      id TEXT PRIMARY KEY,
      store_id TEXT NOT NULL REFERENCES store_instances(id) ON DELETE CASCADE,
      tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      name_ar TEXT NOT NULL,
      name_en TEXT NOT NULL,
      slug TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS store_products (
      id TEXT PRIMARY KEY,
      store_id TEXT NOT NULL REFERENCES store_instances(id) ON DELETE CASCADE,
      tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      category_id TEXT REFERENCES store_categories(id) ON DELETE SET NULL,
      title_ar TEXT NOT NULL,
      title_en TEXT NOT NULL,
      sku TEXT NOT NULL,
      product_type TEXT NOT NULL DEFAULT 'physical',
      retail_price REAL NOT NULL CHECK (retail_price >= 0),
      cost_price REAL NOT NULL DEFAULT 0 CHECK (cost_price >= 0),
      stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
      category_ar TEXT,
      category_en TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      sales_count INTEGER NOT NULL DEFAULT 0 CHECK (sales_count >= 0),
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS store_product_variants (
      id TEXT PRIMARY KEY,
      store_id TEXT NOT NULL REFERENCES store_instances(id) ON DELETE CASCADE,
      tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL REFERENCES store_products(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      sku TEXT NOT NULL,
      options_json TEXT NOT NULL DEFAULT '{}',
      retail_price REAL NOT NULL CHECK (retail_price >= 0),
      compare_at_price REAL CHECK (compare_at_price IS NULL OR compare_at_price >= 0),
      stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (store_id, sku)
    );

    CREATE TABLE IF NOT EXISTS store_inventory_movements (
      id TEXT PRIMARY KEY,
      store_id TEXT NOT NULL REFERENCES store_instances(id) ON DELETE CASCADE,
      tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL REFERENCES store_products(id) ON DELETE CASCADE,
      variant_id TEXT REFERENCES store_product_variants(id) ON DELETE SET NULL,
      actor_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      quantity_delta INTEGER NOT NULL CHECK (quantity_delta != 0),
      balance_after INTEGER NOT NULL CHECK (balance_after >= 0),
      reason TEXT NOT NULL,
      reference_id TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_variants_product ON store_product_variants(store_id, tenant_id, product_id);
    CREATE INDEX IF NOT EXISTS idx_inventory_product ON store_inventory_movements(store_id, tenant_id, product_id, created_at);

    CREATE TABLE IF NOT EXISTS store_orders (
      id TEXT PRIMARY KEY,
      store_id TEXT NOT NULL REFERENCES store_instances(id) ON DELETE CASCADE,
      tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      order_number TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_country TEXT DEFAULT 'SA',
      items_count INTEGER NOT NULL DEFAULT 1,
      total_amount REAL NOT NULL CHECK (total_amount >= 0),
      currency TEXT NOT NULL DEFAULT 'SAR',
      payment_gateway TEXT NOT NULL DEFAULT 'Pending',
      tracking_number TEXT,
      status TEXT NOT NULL DEFAULT 'processing',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS store_order_items (
      id TEXT PRIMARY KEY,
      store_id TEXT NOT NULL REFERENCES store_instances(id) ON DELETE CASCADE,
      tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      order_id TEXT NOT NULL REFERENCES store_orders(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL REFERENCES store_products(id) ON DELETE RESTRICT,
      variant_id TEXT REFERENCES store_product_variants(id) ON DELETE RESTRICT,
      product_title TEXT NOT NULL,
      sku TEXT NOT NULL,
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      unit_price REAL NOT NULL CHECK (unit_price >= 0),
      line_total REAL NOT NULL CHECK (line_total >= 0),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_order_items_order ON store_order_items(store_id, tenant_id, order_id);

    CREATE TABLE IF NOT EXISTS store_customers (
      id TEXT PRIMARY KEY,
      store_id TEXT NOT NULL REFERENCES store_instances(id) ON DELETE CASCADE,
      tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT DEFAULT '',
      country TEXT DEFAULT 'SA',
      orders_count INTEGER NOT NULL DEFAULT 0 CHECK (orders_count >= 0),
      total_spent REAL NOT NULL DEFAULT 0 CHECK (total_spent >= 0),
      last_order_date TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS store_team_members (
      id TEXT PRIMARY KEY,
      store_id TEXT NOT NULL REFERENCES store_instances(id) ON DELETE CASCADE,
      tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'staff', 'support')),
      permissions_json TEXT NOT NULL DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_subscriptions (
      id TEXT PRIMARY KEY,
      tenant_id TEXT UNIQUE NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      plan_tier TEXT NOT NULL,
      billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'annual')),
      renewal_date TEXT NOT NULL,
      current_price REAL NOT NULL CHECK (current_price >= 0),
      status TEXT NOT NULL DEFAULT 'active',
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS subscription_history (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      plan_tier TEXT NOT NULL,
      billing_cycle TEXT NOT NULL,
      price REAL NOT NULL CHECK (price >= 0),
      status TEXT NOT NULL,
      note TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS billing_invoices (
      id TEXT PRIMARY KEY,
      invoice_number TEXT UNIQUE NOT NULL,
      tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      amount REAL NOT NULL CHECK (amount >= 0),
      currency TEXT NOT NULL DEFAULT 'USD',
      description_ar TEXT NOT NULL,
      description_en TEXT NOT NULL,
      invoice_kind TEXT NOT NULL DEFAULT 'service',
      credit_grant_amount REAL NOT NULL DEFAULT 0 CHECK (credit_grant_amount >= 0),
      target_plan_tier TEXT,
      target_billing_cycle TEXT,
      status TEXT NOT NULL DEFAULT 'unpaid'
        CHECK (status IN ('draft', 'unpaid', 'pending_verification', 'paid', 'cancelled')),
      payment_proof_ref TEXT,
      issued_date TEXT NOT NULL,
      verified_at TEXT
    );

    CREATE TABLE IF NOT EXISTS credit_ledger (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      actor_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      delta REAL NOT NULL,
      balance_after REAL NOT NULL CHECK (balance_after >= 0),
      reason TEXT NOT NULL,
      reference_id TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      title_ar TEXT NOT NULL,
      title_en TEXT NOT NULL,
      body_ar TEXT NOT NULL,
      body_en TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'system',
      is_read INTEGER NOT NULL DEFAULT 0,
      link_path TEXT DEFAULT '/overview',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS support_tickets (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      ticket_number TEXT UNIQUE NOT NULL,
      subject TEXT NOT NULL,
      category TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'medium',
      status TEXT NOT NULL DEFAULT 'open'
        CHECK (status IN ('open', 'in_progress', 'waiting_on_client', 'resolved')),
      client_name TEXT NOT NULL,
      last_message TEXT DEFAULT '',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS security_audit_logs (
      id TEXT PRIMARY KEY,
      tenant_id TEXT,
      actor_id TEXT,
      actor_name TEXT NOT NULL,
      action_ar TEXT NOT NULL,
      action_en TEXT NOT NULL,
      target_entity TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'success',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS platform_settings (
      key TEXT PRIMARY KEY,
      value_json TEXT NOT NULL,
      updated_by TEXT,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS store_discounts (
      id TEXT PRIMARY KEY,
      store_id TEXT NOT NULL REFERENCES store_instances(id) ON DELETE CASCADE,
      tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      code TEXT NOT NULL,
      discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
      value REAL NOT NULL CHECK (value >= 0),
      used_count INTEGER NOT NULL DEFAULT 0,
      usage_limit INTEGER NOT NULL DEFAULT 100,
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired')),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS store_shipping_zones (
      id TEXT PRIMARY KEY,
      store_id TEXT NOT NULL REFERENCES store_instances(id) ON DELETE CASCADE,
      tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      region_name_ar TEXT NOT NULL,
      region_name_en TEXT NOT NULL,
      carrier TEXT NOT NULL,
      rate REAL NOT NULL CHECK (rate >= 0),
      delivery_time_ar TEXT NOT NULL,
      delivery_time_en TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS store_pages (
      id TEXT PRIMARY KEY,
      store_id TEXT NOT NULL REFERENCES store_instances(id) ON DELETE CASCADE,
      tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      slug TEXT NOT NULL,
      title_ar TEXT NOT NULL,
      title_en TEXT NOT NULL,
      content_ar TEXT NOT NULL,
      content_en TEXT NOT NULL,
      published INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS workspace_backups (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      actor_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      label TEXT NOT NULL,
      snapshot_json TEXT NOT NULL,
      size_bytes INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS system_error_logs (
      id TEXT PRIMARY KEY,
      route TEXT NOT NULL,
      method TEXT NOT NULL,
      status_code INTEGER NOT NULL,
      error_code TEXT NOT NULL,
      message TEXT NOT NULL,
      tenant_id TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_requests_tenant ON service_requests(tenant_id, status);
    CREATE INDEX IF NOT EXISTS idx_docs_tenant ON request_documents(tenant_id, request_id);
    CREATE INDEX IF NOT EXISTS idx_stores_tenant ON store_instances(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_products_store ON store_products(store_id, tenant_id);
    CREATE INDEX IF NOT EXISTS idx_orders_store ON store_orders(store_id, tenant_id);
    CREATE INDEX IF NOT EXISTS idx_discounts_store ON store_discounts(store_id, tenant_id);
    CREATE INDEX IF NOT EXISTS idx_shipping_store ON store_shipping_zones(store_id, tenant_id);
    CREATE INDEX IF NOT EXISTS idx_pages_store ON store_pages(store_id, tenant_id);
    CREATE INDEX IF NOT EXISTS idx_backups_tenant ON workspace_backups(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_invoices_tenant ON billing_invoices(tenant_id, status);
    CREATE INDEX IF NOT EXISTS idx_ledger_tenant ON credit_ledger(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_tenant ON notifications(tenant_id, is_read);
    CREATE INDEX IF NOT EXISTS idx_tickets_tenant ON support_tickets(tenant_id, status);
  `);

  seedInitialPreviewData(db);
  return db;
}

function seedInitialPreviewData(db: DatabaseSync): void {
  const userCountRow = db.prepare('SELECT COUNT(*) AS cnt FROM users').get() as { cnt: number };
  if (userCountRow.cnt > 0) return;

  const seedPass =
    process.env.QABS_PREVIEW_SEED_PASSWORD ||
    (process.env.NODE_ENV === 'production' ? generateToken(24) : 'QabsPreview!2026');
  const defaultHash = hashPassword(seedPass);

  const insertTenant = db.prepare(
    'INSERT INTO tenants (id, owner_name, email, company_legal_name, role, credits_balance) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const insertUser = db.prepare(
    'INSERT INTO users (id, tenant_id, name, email, password_hash, role, email_verified, status) VALUES (?, ?, ?, ?, ?, ?, 1, ?)'
  );

  // HQ Tenant + Staff Roles
  insertTenant.run('tenant_qabs_hq', 'أنور الغزالي', 'anwar@qabs1.store', 'QABS Digital Holding', 'super_admin', 5000);
  const hqUsers: { id: string; name: string; email: string; role: PlatformRole }[] = [
    { id: 'usr_super_admin', name: 'أنور الغزالي', email: 'anwar@qabs1.store', role: 'super_admin' },
    { id: 'usr_admin', name: 'سارة الإدارية', email: 'admin@qabs1.store', role: 'admin' },
    { id: 'usr_staff', name: 'خالد الموظف', email: 'staff@qabs1.store', role: 'staff' },
    { id: 'usr_support', name: 'نورة الدعم', email: 'support@qabs1.store', role: 'support' }
  ];
  for (const u of hqUsers) {
    insertUser.run(u.id, 'tenant_qabs_hq', u.name, u.email, defaultHash, u.role, 'active');
  }

  // Isolated Customer 1
  insertTenant.run('tenant_atlas', 'أحمد السبيعي', 'client@qabs1.store', 'Atlas Global Commerce LLC', 'customer', 250);
  insertUser.run('usr_client_1', 'tenant_atlas', 'أحمد السبيعي', 'client@qabs1.store', defaultHash, 'customer', 'active');

  // Isolated Customer 2 (for strict tenant boundary tests)
  insertTenant.run('tenant_najd', 'ليلى القحطاني', 'merchant2@qabs1.store', 'Najd Ventures LLC', 'customer', 120);
  insertUser.run('usr_client_2', 'tenant_najd', 'ليلى القحطاني', 'merchant2@qabs1.store', defaultHash, 'customer', 'active');

  // Seed initial formation & stores cleanly owned by respective tenants
  db.prepare(`
    INSERT INTO company_formations (
      id, tenant_id, company_name, jurisdiction, entity_type, state_file_number,
      ein, registered_agent, registered_address, filing_date, renewal_due_date, status, formation_stage
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'comp_atlas_1',
    'tenant_atlas',
    'Atlas Global Commerce LLC',
    'US_WYOMING',
    'LLC',
    '2026-00148291',
    '98-1749201',
    'Northwest Registered Agent LLC',
    '30 N Gould St Ste R, Sheridan, WY 82801',
    '2026-02-14',
    '2027-02-14',
    'approved',
    5
  );

  db.prepare(`
    INSERT INTO store_instances (
      id, tenant_id, name, subdomain, currency, theme_preset, status, approval_status, payment_connected, payment_approval_status, gateway_type, total_revenue
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'store_atlas_1',
    'tenant_atlas',
    'متجر أطلس الفاخر',
    'atlas.qabs1.store',
    'SAR',
    'gold_executive',
    'active',
    'approved_published',
    0,
    'unconfigured',
    'Stripe',
    0
  );

  db.prepare(`
    INSERT INTO store_instances (
      id, tenant_id, name, subdomain, currency, theme_preset, status, approval_status, payment_connected, payment_approval_status, gateway_type, total_revenue
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'store_najd_1',
    'tenant_najd',
    'متجر نجد التقني',
    'najd.qabs1.store',
    'USD',
    'aqua_petrol',
    'draft',
    'pending_review',
    0,
    'unconfigured',
    'Stripe',
    0
  );

  db.prepare(`
    INSERT INTO store_categories (id, store_id, tenant_id, name_ar, name_en, slug)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run('cat_atlas_1', 'store_atlas_1', 'tenant_atlas', 'العود والعطور', 'Oud & Fragrances', 'oud-fragrances');

  db.prepare(`
    INSERT INTO store_products (
      id, store_id, tenant_id, category_id, title_ar, title_en, sku, product_type, retail_price, cost_price, stock_quantity, category_ar, category_en, status, sales_count
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'prod_atlas_1',
    'store_atlas_1',
    'tenant_atlas',
    'cat_atlas_1',
    'دهن عود ملكي معتق (ربع تولة)',
    'Royal Aged Oud Oil (Quarter Tola)',
    'ATL-OUD-001',
    'physical',
    450,
    180,
    42,
    'العود والعطور',
    'Oud & Fragrances',
    'active',
    0
  );

  db.prepare(`
    INSERT INTO store_products (
      id, store_id, tenant_id, category_id, title_ar, title_en, sku, product_type, retail_price, cost_price, stock_quantity, category_ar, category_en, status, sales_count
    ) VALUES (?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'prod_najd_1',
    'store_najd_1',
    'tenant_najd',
    'لوحة تحكم نجد الرقمية',
    'Najd Digital Suite',
    'NJD-DIG-01',
    'digital',
    199,
    25,
    100,
    'منتجات رقمية',
    'Digital',
    'active',
    0
  );

  db.prepare(`
    INSERT INTO user_subscriptions (id, tenant_id, plan_tier, billing_cycle, renewal_date, current_price, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run('sub_atlas', 'tenant_atlas', 'growth', 'monthly', '2026-12-17', 79, 'active');

  db.prepare(`
    INSERT INTO user_subscriptions (id, tenant_id, plan_tier, billing_cycle, renewal_date, current_price, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run('sub_najd', 'tenant_najd', 'starter', 'monthly', '2026-12-17', 29, 'active');

  db.prepare(`
    INSERT INTO credit_ledger (id, tenant_id, actor_user_id, delta, balance_after, reason, reference_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run('led_seed_1', 'tenant_atlas', 'usr_super_admin', 250, 250, 'Initial preview credit allocation', 'SEED-INIT');

  db.prepare(`
    INSERT INTO billing_invoices (
      id, invoice_number, tenant_id, amount, currency, description_ar, description_en, invoice_kind, status, issued_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'inv_atlas_1',
    'INV-2026-1001',
    'tenant_atlas',
    79,
    'USD',
    'اشتراك باقة النمو الشهري (بانتظار التحقق)',
    'Growth Plan Monthly Invoice (Pending Verification)',
    'subscription',
    'unpaid',
    '2026-11-17'
  );

  db.prepare(`
    INSERT INTO billing_invoices (
      id, invoice_number, tenant_id, amount, currency, description_ar, description_en, invoice_kind, status, issued_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'inv_najd_1',
    'INV-2026-1002',
    'tenant_najd',
    29,
    'USD',
    'اشتراك باقة البداية الشهري (بانتظار التحقق)',
    'Starter Plan Monthly Invoice (Pending Verification)',
    'subscription',
    'unpaid',
    '2026-11-17'
  );

  db.prepare(`
    INSERT INTO notifications (
      id, tenant_id, user_id, title_ar, title_en, body_ar, body_en, category, is_read, link_path
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
  `).run(
    'notif_atlas_1',
    'tenant_atlas',
    'usr_client_1',
    'مرحباً بك في بيئة المعاينة المعزولة',
    'Welcome to QABS Isolated Preview Workspace',
    'حسابك معزول بالكامل ومربوط بقاعدة البيانات المحلية الآمنة دون أي عمليات تحصيل مالي حقيقية.',
    'Your tenant workspace is isolated and backed by persistent local storage with payment charging safely gated.',
    'system',
    '/overview'
  );

  const defaultCatalog: [string, string, string, string, number][] = [
    ['company-formation', 'formation', 'تأسيس الشركات (أمريكا وبريطانيا)', 'Company Formation (US & UK)', 249],
    ['ein', 'formation', 'استخراج الرقم الضريبي EIN', 'IRS EIN Tax ID', 79],
    ['registered-agent', 'formation', 'الوكيل المسجل والعنوان القانوني', 'Registered Agent & Address', 99],
    ['us-llc', 'formation', 'تأسيس شركة أمريكية (50 ولاية)', 'US LLC (All 50 States)', 189],
    ['compliance', 'compliance', 'إدارة الامتثال القانوني', 'Statutory Compliance', 149],
    ['annual-report', 'compliance', 'تقديم التقرير السنوي', 'Annual State Report Filing', 129],
    ['company-renewal', 'compliance', 'تجديد الشركة و Good Standing', 'Company Renewal & Good Standing', 159],
    ['store-creation', 'stores', 'إنشاء المتاجر المستقلة', 'Standalone Store Creation', 99],
    ['store-management', 'stores', 'إدارة وتشغيل المتاجر', 'Store Management', 199],
    ['multi-store', 'stores', 'منظومة المتاجر المتعددة', 'Multi-Store Suite', 299],
    ['store-development', 'stores', 'تطوير وتخصيص المتاجر', 'Custom Store Development', 399],
    ['payment-gateways', 'payments', 'تجهيز بوابات الدفع', 'Payment Gateway Readiness', 149],
    ['business-accounts', 'payments', 'تجهيز الحسابات البنكية التجارية', 'Business Banking Readiness', 179],
    ['payment-integration', 'payments', 'الربط التقني لبوابات الدفع', 'Payment API Integration', 249],
    ['brand-identity', 'digital', 'تصميم الهوية التجارية', 'Brand Identity System', 349],
    ['logo-design', 'digital', 'تصميم الشعارات الاحترافية', 'Professional Logo Design', 149],
    ['web-development', 'digital', 'تطوير المواقع والمنصات', 'Web & Platform Development', 499],
    ['marketing', 'digital', 'التسويق الرقمي ونمو المبيعات', 'Performance Marketing', 299],
    ['consulting', 'digital', 'استشارات الأعمال والتجارة', 'Business & Commerce Consulting', 99],
    ['ai-solutions', 'digital', 'حلول الذكاء الاصطناعي والأتمتة', 'QABS AI Automation Solutions', 149]
  ];
  const insertSvc = db.prepare(
    'INSERT INTO services_catalog (slug, category, title_ar, title_en, starting_price_usd, active) VALUES (?, ?, ?, ?, ?, 1)'
  );
  for (const row of defaultCatalog) {
    insertSvc.run(...row);
  }

  db.prepare(`
    INSERT INTO store_discounts (id, store_id, tenant_id, code, discount_type, value, used_count, usage_limit, status)
    VALUES (?, ?, ?, ?, ?, ?, 0, 100, 'active')
  `).run('dsc_atlas_1', 'store_atlas_1', 'tenant_atlas', 'QABS10', 'percentage', 10);

  db.prepare(`
    INSERT INTO store_shipping_zones (
      id, store_id, tenant_id, region_name_ar, region_name_en, carrier, rate, delivery_time_ar, delivery_time_en, active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `).run('shp_atlas_1', 'store_atlas_1', 'tenant_atlas', 'السعودية ودول الخليج', 'KSA & GCC Express', 'DHL Express / Aramex', 25, '2 - 4 أيام عمل', '2 - 4 Business Days');

  db.prepare(`
    INSERT INTO store_pages (id, store_id, tenant_id, slug, title_ar, title_en, content_ar, content_en, published)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
  `).run(
    'pg_atlas_1',
    'store_atlas_1',
    'tenant_atlas',
    'shipping-returns',
    'سياسة الشحن والاسترجاع',
    'Shipping & Returns Policy',
    'يتم تجهيز وشحن الطلبات خلال 24-48 ساعة عبر شركائنا المعتمدين مع ضمان الاستبدال والاسترجاع وفق سياسات المتجر.',
    'Orders are fulfilled within 24-48 hours via verified carriers with straightforward returns.',
  );

  db.prepare(
    'INSERT INTO platform_settings (key, value_json, updated_by) VALUES (?, ?, ?)'
  ).run(
    'global_governance',
    JSON.stringify({
      paymentsEnabled: false,
      autoPublishStores: false,
      maintenanceMode: false,
      previewEnvironmentLabel: 'Preview / Sandbox (Non-Production)',
      supportEmail: 'support@qabs1.store',
      workingHoursAr: 'الأحد – الخميس | 09:00 – 18:00 بتوقيت السعودية',
      workingHoursEn: 'Sunday – Thursday | 09:00 – 18:00 AST'
    }),
    'usr_super_admin'
  );
}
