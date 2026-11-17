import type { Router, Response } from 'express';
import type { DatabaseSync } from 'node:sqlite';
import {
  canManageStaff,
  canVerifyFinancials,
  generateToken,
  hashPassword,
  isPrivilegedRole,
  isStrongPassword,
  isValidEmail,
  normalizeRole,
  PlatformRole,
  sanitizeId,
  sanitizeText
} from '../security.ts';
import { AuthedRequest, createNotification, logAudit } from './stores.ts';

export function registerAdminRoutes(
  router: Router,
  db: DatabaseSync,
  requireAuth: (req: AuthedRequest, res: Response, next: () => void) => void
): void {
  const requirePrivileged = (req: AuthedRequest, res: Response, next: () => void) => {
    requireAuth(req, res, () => {
      if (!isPrivilegedRole(req.actor!.role)) {
        res.status(403).json({
          error: 'Privileged staff, support, admin, or super_admin role required.',
          code: 'FORBIDDEN_ADMIN_ACCESS'
        });
        return;
      }
      next();
    });
  };

  // Unified Admin Governance Overview (13 sections)
  router.get('/api/admin/overview', requirePrivileged, (req: AuthedRequest, res: Response) => {
    const clients = db
      .prepare(
        `SELECT u.id, u.tenant_id, u.name, u.email, u.role, u.email_verified, u.status, u.created_at,
                t.company_legal_name, t.credits_balance
         FROM users u
         JOIN tenants t ON t.id = u.tenant_id
         WHERE u.role = 'customer'
         ORDER BY u.created_at DESC`
      )
      .all();

    const staff = db
      .prepare(
        `SELECT id, tenant_id, name, email, role, email_verified, status, created_at
         FROM users
         WHERE role IN ('super_admin', 'admin', 'staff', 'support')
         ORDER BY created_at DESC`
      )
      .all();

    const servicesCatalog = db.prepare('SELECT * FROM services_catalog ORDER BY category, slug').all();
    const serviceRequests = db.prepare('SELECT * FROM service_requests ORDER BY created_at DESC').all();
    const formations = db.prepare('SELECT * FROM company_formations ORDER BY created_at DESC').all();
    const documents = db
      .prepare(
        `SELECT id, tenant_id, uploaded_by, request_id, formation_id, document_name, document_type,
                mime_type, size_bytes, sha256_hash, status, created_at
         FROM request_documents
         ORDER BY created_at DESC`
      )
      .all();
    const stores = db.prepare('SELECT * FROM store_instances ORDER BY created_at DESC').all();
    const products = db.prepare('SELECT * FROM store_products ORDER BY updated_at DESC').all();
    const subscriptions = db.prepare('SELECT * FROM user_subscriptions ORDER BY updated_at DESC').all();
    const invoices = db.prepare('SELECT * FROM billing_invoices ORDER BY issued_date DESC').all();
    const tickets = db.prepare('SELECT * FROM support_tickets ORDER BY created_at DESC').all();
    const notifications = db.prepare('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 100').all();
    const auditLogs = db.prepare('SELECT * FROM security_audit_logs ORDER BY created_at DESC LIMIT 150').all();
    const settingsRow = db.prepare("SELECT value_json FROM platform_settings WHERE key = 'global_governance'").get() as
      | { value_json: string }
      | undefined;

    res.json({
      actorRole: req.actor!.role,
      clients,
      staff,
      servicesCatalog,
      serviceRequests,
      formations,
      documents,
      stores,
      products,
      subscriptions,
      invoices,
      tickets,
      notifications,
      auditLogs,
      platformSettings: settingsRow ? JSON.parse(settingsRow.value_json) : {}
    });
  });

  // Create Staff / Admin User (only super_admin or admin)
  router.post('/api/admin/staff', requirePrivileged, (req: AuthedRequest, res: Response) => {
    const actor = req.actor!;
    if (!canManageStaff(actor.role)) {
      res.status(403).json({ error: 'Only admin or super_admin can manage staff.', code: 'FORBIDDEN_ROLE' });
      return;
    }

    const name = sanitizeText(req.body?.name, 120);
    const email = sanitizeText(req.body?.email, 200).toLowerCase();
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    const requestedRole = normalizeRole(req.body?.role);

    if (!name || !isValidEmail(email) || !isStrongPassword(password)) {
      res.status(400).json({ error: 'Valid name, email, and 8+ char password required.', code: 'INVALID_INPUT' });
      return;
    }
    if ((requestedRole === 'super_admin' || requestedRole === 'admin') && actor.role !== 'super_admin') {
      res.status(403).json({ error: 'Only super_admin can create admin accounts.', code: 'FORBIDDEN_ESCALATION' });
      return;
    }

    const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (exists) {
      res.status(409).json({ error: 'Email already registered.', code: 'EMAIL_EXISTS' });
      return;
    }

    const userId = `usr_${generateToken(8)}`;
    db.prepare(
      `INSERT INTO users (id, tenant_id, name, email, password_hash, role, email_verified, status)
       VALUES (?, 'tenant_qabs_hq', ?, ?, ?, ?, 1, 'active')`
    ).run(userId, name, email, hashPassword(password), requestedRole);

    logAudit(db, 'tenant_qabs_hq', actor.userId, actor.name, `إضافة موظف (${name}) بصلاحية ${requestedRole}`, `Created ${requestedRole} user (${email})`, userId);
    res.status(201).json({
      user: { id: userId, name, email, role: requestedRole, status: 'active' }
    });
  });

  // Update Staff Role / Status
  router.patch('/api/admin/staff/:userId', requirePrivileged, (req: AuthedRequest, res: Response) => {
    const actor = req.actor!;
    if (!canManageStaff(actor.role)) {
      res.status(403).json({ error: 'Only admin or super_admin can update staff roles.', code: 'FORBIDDEN_ROLE' });
      return;
    }
    const targetId = sanitizeId(req.params.userId);
    const target = db.prepare('SELECT id, email, role, status FROM users WHERE id = ?').get(targetId) as
      | { id: string; email: string; role: PlatformRole; status: string }
      | undefined;
    if (!target) {
      res.status(404).json({ error: 'User not found.', code: 'USER_NOT_FOUND' });
      return;
    }
    const nextRole = req.body?.role ? normalizeRole(req.body.role) : target.role;
    if ((nextRole === 'super_admin' || nextRole === 'admin' || target.role === 'super_admin') && actor.role !== 'super_admin') {
      res.status(403).json({ error: 'Only super_admin can modify admin/super_admin roles.', code: 'FORBIDDEN_ESCALATION' });
      return;
    }
    const nextStatus = req.body?.status === 'suspended' ? 'suspended' : 'active';
    db.prepare('UPDATE users SET role = ?, status = ? WHERE id = ?').run(nextRole, nextStatus, targetId);
    logAudit(db, 'tenant_qabs_hq', actor.userId, actor.name, `تحديث صلاحيات ${target.email} إلى ${nextRole}`, `Updated user ${target.email} role=${nextRole} status=${nextStatus}`, targetId);
    res.json({ user: { id: targetId, email: target.email, role: nextRole, status: nextStatus } });
  });

  // Update Service Catalog Price / Active state
  router.patch('/api/admin/services/:slug', requirePrivileged, (req: AuthedRequest, res: Response) => {
    const actor = req.actor!;
    if (!canManageStaff(actor.role)) {
      res.status(403).json({ error: 'Admin role required.', code: 'FORBIDDEN_ROLE' });
      return;
    }
    const slug = sanitizeText(req.params.slug, 64);
    const row = db.prepare('SELECT * FROM services_catalog WHERE slug = ?').get(slug) as Record<string, unknown> | undefined;
    if (!row) {
      res.status(404).json({ error: 'Service not found.', code: 'SERVICE_NOT_FOUND' });
      return;
    }
    const price =
      req.body?.startingPriceUsd !== undefined
        ? Math.max(0, Number(req.body.startingPriceUsd))
        : Number(row.starting_price_usd);
    const active = req.body?.active !== undefined ? (req.body.active ? 1 : 0) : Number(row.active);
    db.prepare('UPDATE services_catalog SET starting_price_usd = ?, active = ?, updated_at = CURRENT_TIMESTAMP WHERE slug = ?').run(
      price,
      active,
      slug
    );
    logAudit(db, 'tenant_qabs_hq', actor.userId, actor.name, `تحديث تسعير خدمة ${slug}`, `Updated service ${slug} price=$${price}`, slug);
    res.json({ service: db.prepare('SELECT * FROM services_catalog WHERE slug = ?').get(slug) });
  });

  // Review & Approve/Reject Store
  router.patch('/api/admin/stores/:storeId/approval', requirePrivileged, (req: AuthedRequest, res: Response) => {
    const actor = req.actor!;
    const storeId = sanitizeId(req.params.storeId);
    const decision = sanitizeText(req.body?.decision, 32);
    const feedback = sanitizeText(req.body?.feedback || '', 400);
    if (!['approved_published', 'changes_requested', 'rejected'].includes(decision)) {
      res.status(400).json({ error: 'Invalid approval decision.', code: 'INVALID_DECISION' });
      return;
    }
    const store = db.prepare('SELECT * FROM store_instances WHERE id = ?').get(storeId) as Record<string, unknown> | undefined;
    if (!store) {
      res.status(404).json({ error: 'Store not found.', code: 'STORE_NOT_FOUND' });
      return;
    }
    const nextStatus = decision === 'approved_published' ? 'active' : 'setup';
    db.prepare('UPDATE store_instances SET approval_status = ?, status = ?, admin_feedback = ? WHERE id = ?').run(
      decision,
      nextStatus,
      feedback || null,
      storeId
    );
    createNotification(
      db,
      String(store.tenant_id),
      `تحديث مراجعة متجر "${store.name}"`,
      `Store Review Update: "${store.name}"`,
      `حالة المراجعة الجديدة: ${decision}${feedback ? ` — ${feedback}` : ''}`,
      `New review status: ${decision}${feedback ? ` — ${feedback}` : ''}`,
      'store',
      '/stores'
    );
    logAudit(db, String(store.tenant_id), actor.userId, actor.name, `قرار مراجعة المتجر ${store.name}: ${decision}`, `Store approval decision=${decision}`, storeId);
    res.json({ store: db.prepare('SELECT * FROM store_instances WHERE id = ?').get(storeId) });
  });

  // Verify Custom Domain (no DNS modification, DB state only)
  router.patch('/api/admin/stores/:storeId/domain', requirePrivileged, (req: AuthedRequest, res: Response) => {
    const actor = req.actor!;
    const storeId = sanitizeId(req.params.storeId);
    const verified = Boolean(req.body?.verified);
    const store = db.prepare('SELECT * FROM store_instances WHERE id = ?').get(storeId) as Record<string, unknown> | undefined;
    if (!store) {
      res.status(404).json({ error: 'Store not found.', code: 'STORE_NOT_FOUND' });
      return;
    }
    db.prepare('UPDATE store_instances SET domain_status = ? WHERE id = ?').run(
      verified ? 'verified_active' : 'pending_verification',
      storeId
    );
    logAudit(db, String(store.tenant_id), actor.userId, actor.name, `تحديث توثيق نطاق المتجر ${store.name}`, `Updated store domain verification`, storeId);
    res.json({ store: db.prepare('SELECT * FROM store_instances WHERE id = ?').get(storeId) });
  });

  // Verify Offline / Manual Invoice with Proof Reference (Never live card charging!)
  router.patch('/api/admin/invoices/:invoiceId/verify', requirePrivileged, (req: AuthedRequest, res: Response) => {
    const actor = req.actor!;
    if (!canVerifyFinancials(actor.role)) {
      res.status(403).json({
        error: 'Only admin or super_admin can verify invoice settlement references.',
        code: 'FORBIDDEN_FINANCIAL_ACTION'
      });
      return;
    }
    const invoiceId = sanitizeId(req.params.invoiceId);
    const proofRef = sanitizeText(req.body?.paymentProofRef, 120);
    if (!proofRef || proofRef.length < 4) {
      res.status(400).json({
        error: 'Verified external payment proof reference (min 4 chars) is required before marking invoice paid.',
        code: 'PAYMENT_PROOF_REQUIRED'
      });
      return;
    }

    const inv = db.prepare('SELECT * FROM billing_invoices WHERE id = ?').get(invoiceId) as Record<string, unknown> | undefined;
    if (!inv) {
      res.status(404).json({ error: 'Invoice not found.', code: 'INVOICE_NOT_FOUND' });
      return;
    }
    if (inv.status === 'paid') {
      res.status(409).json({ error: 'Invoice is already verified and paid.', code: 'ALREADY_PAID' });
      return;
    }

    db.exec('BEGIN IMMEDIATE');
    try {
      db.prepare(
        `UPDATE billing_invoices SET status = 'paid', payment_proof_ref = ?, verified_at = CURRENT_TIMESTAMP WHERE id = ?`
      ).run(proofRef, invoiceId);

      // Apply verified credit grant via immutable ledger if credit invoice
      const creditGrant = Number(inv.credit_grant_amount || 0);
      if (creditGrant > 0) {
        const tenant = db.prepare('SELECT credits_balance FROM tenants WHERE id = ?').get(String(inv.tenant_id)) as {
          credits_balance: number;
        };
        const nextBal = Number(tenant.credits_balance) + creditGrant;
        db.prepare('UPDATE tenants SET credits_balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(
          nextBal,
          String(inv.tenant_id)
        );
        db.prepare(
          `INSERT INTO credit_ledger (id, tenant_id, actor_user_id, delta, balance_after, reason, reference_id)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).run(
          `led_${generateToken(6)}`,
          String(inv.tenant_id),
          actor.userId,
          creditGrant,
          nextBal,
          `Verified credit pack invoice ${inv.invoice_number}`,
          proofRef
        );
      }

      // Activate target subscription tier if subscription invoice
      if (inv.target_plan_tier && inv.target_billing_cycle) {
        const renewalDate = new Date(
          Date.now() + (inv.target_billing_cycle === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000
        )
          .toISOString()
          .split('T')[0];
        db.prepare(
          `INSERT INTO user_subscriptions (id, tenant_id, plan_tier, billing_cycle, renewal_date, current_price, status)
           VALUES (?, ?, ?, ?, ?, ?, 'active')
           ON CONFLICT(tenant_id) DO UPDATE SET
             plan_tier = excluded.plan_tier,
             billing_cycle = excluded.billing_cycle,
             renewal_date = excluded.renewal_date,
             current_price = excluded.current_price,
             status = 'active',
             updated_at = CURRENT_TIMESTAMP`
        ).run(
          `sub_${generateToken(6)}`,
          String(inv.tenant_id),
          String(inv.target_plan_tier),
          String(inv.target_billing_cycle),
          renewalDate,
          Number(inv.amount)
        );
      }

      db.exec('COMMIT');
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }

    createNotification(
      db,
      String(inv.tenant_id),
      `تأكيد سداد الفاتورة ${inv.invoice_number}`,
      `Invoice Verified: ${inv.invoice_number}`,
      `تم اعتماد مرجع السداد (${proofRef}) وتحديث الفاتورة إلى مدفوعة.`,
      `Payment proof (${proofRef}) verified and applied.`,
      'billing',
      '/billing'
    );
    logAudit(db, String(inv.tenant_id), actor.userId, actor.name, `توثيق الفاتورة ${inv.invoice_number} بالمرجع ${proofRef}`, `Verified invoice ${inv.invoice_number} ref=${proofRef}`, invoiceId);
    res.json({ invoice: db.prepare('SELECT * FROM billing_invoices WHERE id = ?').get(invoiceId) });
  });

  // Send Notification to Tenant
  router.post('/api/admin/notifications', requirePrivileged, (req: AuthedRequest, res: Response) => {
    const actor = req.actor!;
    const tenantId = sanitizeId(req.body?.tenantId);
    const titleAr = sanitizeText(req.body?.titleAr, 200);
    const titleEn = sanitizeText(req.body?.titleEn || titleAr, 200);
    const bodyAr = sanitizeText(req.body?.bodyAr, 1000);
    const bodyEn = sanitizeText(req.body?.bodyEn || bodyAr, 1000);
    if (!titleAr || !bodyAr) {
      res.status(400).json({ error: 'Title and body are required.', code: 'INVALID_NOTIFICATION' });
      return;
    }
    const targets = tenantId
      ? [{ id: tenantId }]
      : (db.prepare("SELECT DISTINCT tenant_id AS id FROM users WHERE role = 'customer'").all() as { id: string }[]);

    for (const t of targets) {
      createNotification(db, t.id, titleAr, titleEn, bodyAr, bodyEn, 'admin_notice', sanitizeText(req.body?.linkPath || '/overview', 120));
    }
    logAudit(db, tenantId || 'all', actor.userId, actor.name, `إرسال إشعار إداري (${titleAr})`, `Sent admin notification (${titleEn})`, tenantId || 'broadcast');
    res.status(201).json({ sentCount: targets.length });
  });

  // Update Platform Governance Settings (keeps paymentsEnabled gated false)
  router.patch('/api/admin/settings', requirePrivileged, (req: AuthedRequest, res: Response) => {
    const actor = req.actor!;
    if (!canManageStaff(actor.role)) {
      res.status(403).json({ error: 'Admin role required.', code: 'FORBIDDEN_ROLE' });
      return;
    }
    const row = db.prepare("SELECT value_json FROM platform_settings WHERE key = 'global_governance'").get() as
      | { value_json: string }
      | undefined;
    const current = row ? JSON.parse(row.value_json) : {};
    const next = {
      ...current,
      ...req.body,
      // Safety gate: never auto-enable live payments or auto-publish stores via API patch
      paymentsEnabled: false,
      autoPublishStores: false
    };
    db.prepare(
      `INSERT INTO platform_settings (key, value_json, updated_by, updated_at)
       VALUES ('global_governance', ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json, updated_by = excluded.updated_by, updated_at = CURRENT_TIMESTAMP`
    ).run(JSON.stringify(next), actor.userId);
    logAudit(db, 'tenant_qabs_hq', actor.userId, actor.name, 'تحديث إعدادات المنصة العامة', 'Updated platform governance settings', 'global_governance');
    res.json({ platformSettings: next });
  });
}
