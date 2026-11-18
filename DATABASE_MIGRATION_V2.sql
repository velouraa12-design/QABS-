-- =====================================================================
-- QABS UNIFIED PLATFORM — AUDITED SCHEMA MIGRATION V2 (NON-DESTRUCTIVE)
-- Complements DATABASE_SCHEMA.sql with Identity, RBAC, 8-Status Orders,
-- Private Document Vault, Store Isolation, Notifications & Credit Ledger
-- NOTE: Do NOT execute against any production DB without a full backup.
-- =====================================================================

-- 1. Platform Users & Roles (super_admin, admin, staff, support, customer)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'customer'
        CHECK (role IN ('super_admin', 'admin', 'staff', 'support', 'customer')),
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(32) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. HttpOnly Cookie Sessions & CSRF State
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(128) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    csrf_token VARCHAR(128) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked_at TIMESTAMP WITH TIME ZONE,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Single-Use Auth Tokens (Password Reset & Email Verification)
CREATE TABLE IF NOT EXISTS auth_tokens (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    purpose VARCHAR(32) NOT NULL CHECK (purpose IN ('password_reset', 'email_verify')),
    token_hash VARCHAR(128) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Services Catalog Governance
CREATE TABLE IF NOT EXISTS services_catalog (
    slug VARCHAR(64) PRIMARY KEY,
    category VARCHAR(32) NOT NULL,
    title_ar VARCHAR(255) NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    starting_price_usd NUMERIC(10, 2) NOT NULL CHECK (starting_price_usd >= 0),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Service Requests (8-Status Workflow + Tenant Ownership)
CREATE TABLE IF NOT EXISTS service_requests (
    id VARCHAR(64) PRIMARY KEY,
    reference_code VARCHAR(32) UNIQUE NOT NULL,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    service_slug VARCHAR(64) NOT NULL,
    service_path VARCHAR(128) NOT NULL,
    service_title_ar VARCHAR(255) NOT NULL,
    service_title_en VARCHAR(255) NOT NULL,
    package_id VARCHAR(64),
    package_name_ar VARCHAR(255),
    package_name_en VARCHAR(255),
    price_usd NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (price_usd >= 0),
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(64) NOT NULL,
    company_or_store_name VARCHAR(255),
    custom_fields_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    notes TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'new'
        CHECK (status IN ('draft', 'new', 'under_review', 'needs_info', 'in_progress', 'completed', 'rejected', 'cancelled')),
    assigned_staff_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Private Encrypted/Authorized Document Vault (No public URLs)
CREATE TABLE IF NOT EXISTS request_documents (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    uploaded_by VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    request_id VARCHAR(64) REFERENCES service_requests(id) ON DELETE CASCADE,
    formation_id VARCHAR(64) REFERENCES company_formations(id) ON DELETE CASCADE,
    document_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(64) NOT NULL,
    mime_type VARCHAR(128) NOT NULL,
    size_bytes INT NOT NULL CHECK (size_bytes > 0 AND size_bytes <= 5242880),
    sha256_hash VARCHAR(64) NOT NULL,
    storage_key TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'uploaded'
        CHECK (status IN ('uploaded', 'verified', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Store Categories & Store Team Isolation
CREATE TABLE IF NOT EXISTS store_categories (
    id VARCHAR(64) PRIMARY KEY,
    store_id VARCHAR(64) NOT NULL REFERENCES store_instances(id) ON DELETE CASCADE,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name_ar VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    slug VARCHAR(128) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS store_customers (
    id VARCHAR(64) PRIMARY KEY,
    store_id VARCHAR(64) NOT NULL REFERENCES store_instances(id) ON DELETE CASCADE,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(64),
    country VARCHAR(64),
    orders_count INT NOT NULL DEFAULT 0 CHECK (orders_count >= 0),
    total_spent NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (total_spent >= 0),
    last_order_date DATE
);

CREATE TABLE IF NOT EXISTS store_team_members (
    id VARCHAR(64) PRIMARY KEY,
    store_id VARCHAR(64) NOT NULL REFERENCES store_instances(id) ON DELETE CASCADE,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL CHECK (role IN ('admin', 'staff', 'support')),
    permissions_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    status VARCHAR(32) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Immutable AI & Wallet Credit Ledger + Subscription History
CREATE TABLE IF NOT EXISTS credit_ledger (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    actor_user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    delta NUMERIC(12, 2) NOT NULL,
    balance_after NUMERIC(12, 2) NOT NULL CHECK (balance_after >= 0),
    reason VARCHAR(255) NOT NULL,
    reference_id VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subscription_history (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    plan_tier VARCHAR(32) NOT NULL,
    billing_cycle VARCHAR(16) NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    status VARCHAR(32) NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Notifications & Support Tickets
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    title_ar VARCHAR(255) NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    body_ar TEXT NOT NULL,
    body_en TEXT NOT NULL,
    category VARCHAR(32) NOT NULL DEFAULT 'system',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    link_path VARCHAR(128),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS support_tickets (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    ticket_number VARCHAR(32) UNIQUE NOT NULL,
    subject VARCHAR(255) NOT NULL,
    category VARCHAR(32) NOT NULL,
    priority VARCHAR(16) NOT NULL DEFAULT 'medium',
    status VARCHAR(32) NOT NULL DEFAULT 'open'
        CHECK (status IN ('open', 'in_progress', 'waiting_on_client', 'resolved')),
    last_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS platform_settings (
    key VARCHAR(64) PRIMARY KEY,
    value_json JSONB NOT NULL,
    updated_by VARCHAR(64),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Store Discounts, Shipping Zones, Store Pages, Server Backups & Error Telemetry
CREATE TABLE IF NOT EXISTS store_discounts (
    id VARCHAR(64) PRIMARY KEY,
    store_id VARCHAR(64) NOT NULL REFERENCES store_instances(id) ON DELETE CASCADE,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    code VARCHAR(64) NOT NULL,
    discount_type VARCHAR(16) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    value NUMERIC(10, 2) NOT NULL CHECK (value >= 0),
    used_count INT NOT NULL DEFAULT 0,
    usage_limit INT NOT NULL DEFAULT 100,
    status VARCHAR(16) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS store_shipping_zones (
    id VARCHAR(64) PRIMARY KEY,
    store_id VARCHAR(64) NOT NULL REFERENCES store_instances(id) ON DELETE CASCADE,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    region_name_ar VARCHAR(160) NOT NULL,
    region_name_en VARCHAR(160) NOT NULL,
    carrier VARCHAR(120) NOT NULL,
    rate NUMERIC(10, 2) NOT NULL CHECK (rate >= 0),
    delivery_time_ar VARCHAR(80) NOT NULL,
    delivery_time_en VARCHAR(80) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS store_pages (
    id VARCHAR(64) PRIMARY KEY,
    store_id VARCHAR(64) NOT NULL REFERENCES store_instances(id) ON DELETE CASCADE,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    slug VARCHAR(128) NOT NULL,
    title_ar VARCHAR(255) NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    content_ar TEXT NOT NULL,
    content_en TEXT NOT NULL,
    published BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workspace_backups (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    actor_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    label VARCHAR(160) NOT NULL,
    snapshot_json JSONB NOT NULL,
    size_bytes INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS system_error_logs (
    id VARCHAR(64) PRIMARY KEY,
    route VARCHAR(160) NOT NULL,
    method VARCHAR(16) NOT NULL,
    status_code INT NOT NULL,
    error_code VARCHAR(64) NOT NULL,
    message TEXT NOT NULL,
    tenant_id VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Non-Destructive Tenant & Integrity Indexes
ALTER TABLE billing_invoices ALTER COLUMN status SET DEFAULT 'unpaid';
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_tenant ON service_requests(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_request_documents_tenant ON request_documents(tenant_id, request_id);
CREATE INDEX IF NOT EXISTS idx_discounts_store ON store_discounts(store_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_shipping_store ON store_shipping_zones(store_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_pages_store ON store_pages(store_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_backups_tenant ON workspace_backups(tenant_id);
CREATE INDEX IF NOT EXISTS idx_credit_ledger_tenant ON credit_ledger(tenant_id, created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_tenant ON notifications(tenant_id, is_read);
CREATE INDEX IF NOT EXISTS idx_tickets_tenant ON support_tickets(tenant_id, status);

