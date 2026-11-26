-- =====================================================================
-- QABS UNIFIED PLATFORM — CLOUDFLARE D1 (SQLITE) SCHEMA
-- Full parity with server/db.ts for `wrangler d1 execute`
-- Keeps R2 private vault reference key compatible alongside SQLite BLOBs
-- =====================================================================

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
  r2_object_key TEXT,
  content_base64 TEXT NOT NULL DEFAULT '',
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

CREATE TABLE IF NOT EXISTS refund_requests (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL,
  amount REAL NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  reason_ar TEXT NOT NULL,
  reason_en TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'requested'
    CHECK (status IN ('requested', 'approved', 'rejected')),
  admin_notes TEXT,
  reviewed_by TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
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
CREATE INDEX IF NOT EXISTS idx_refunds_tenant ON refund_requests(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_ledger_tenant ON credit_ledger(tenant_id);
CREATE INDEX IF NOT EXISTS idx_notifications_tenant ON notifications(tenant_id, is_read);
CREATE INDEX IF NOT EXISTS idx_tickets_tenant ON support_tickets(tenant_id, status);
