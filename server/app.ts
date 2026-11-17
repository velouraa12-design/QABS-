import express, { type Request, type Response, type NextFunction, type Express } from 'express';
import os from 'node:os';
import path from 'node:path';
import type { DatabaseSync } from 'node:sqlite';
import { createDatabase } from './db.ts';
import {
  canManageTickets,
  canReviewOrders,
  generateToken,
  hashPassword,
  isPrivilegedRole,
  isStrongPassword,
  isValidEmail,
  normalizeRole,
  ORDER_STATUSES,
  type OrderStatus,
  ORDER_STATUS_LABELS,
  parseCookies,
  sanitizeId,
  sanitizeText,
  sha256Hex,
  validateUploadedDocument,
  verifyPassword
} from './security.ts';
import { type AuthedRequest, createNotification, logAudit, registerStoreRoutes } from './routes/stores.ts';
import { registerAdminRoutes } from './routes/admin.ts';

export interface CreateServerOptions {
  dbPath?: string;
  exposePreviewTokens?: boolean;
  rateLimitMax?: number;
}

const SESSION_COOKIE_NAME = 'qabs_session';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function createQabsApp(options: CreateServerOptions = {}): {
  app: Express;
  db: DatabaseSync;
} {
  const dbPath =
    options.dbPath || process.env.QABS_DB_PATH || path.join(os.tmpdir(), 'qabs_preview.sqlite');
  const exposePreviewTokens =
    options.exposePreviewTokens ?? (process.env.NODE_ENV !== 'production' && !process.env.K_SERVICE);
  const rateLimitMax = options.rateLimitMax ?? 40;

  const db = createDatabase(dbPath);
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '12mb' }));

  // Basic security headers on API responses
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    next();
  });

  // Resolve authenticated session from HttpOnly cookie
  app.use((req: AuthedRequest, _res: Response, next: NextFunction) => {
    const cookies = parseCookies(req.headers.cookie);
    const sessionId = cookies[SESSION_COOKIE_NAME] || cookies['__Host-qdp_session'];
    if (!sessionId) {
      next();
      return;
    }

    const row = db
      .prepare(
        `SELECT s.id AS session_id, s.csrf_token, s.expires_at, s.revoked_at,
                u.id AS user_id, u.tenant_id, u.email, u.name, u.role, u.email_verified, u.status
         FROM sessions s
         JOIN users u ON u.id = s.user_id
         WHERE s.id = ?`
      )
      .get(sessionId) as Record<string, unknown> | undefined;

    if (
      row &&
      !row.revoked_at &&
      row.status === 'active' &&
      new Date(String(row.expires_at)).getTime() > Date.now()
    ) {
      req.actor = {
        sessionId: String(row.session_id),
        userId: String(row.user_id),
        tenantId: String(row.tenant_id),
        email: String(row.email),
        name: String(row.name),
        role: normalizeRole(String(row.role)),
        csrfToken: String(row.csrf_token),
        emailVerified: Boolean(row.email_verified)
      };
    }
    next();
  });

  // CSRF check for all authenticated mutating requests (POST, PUT, PATCH, DELETE)
  app.use((req: AuthedRequest, res: Response, next: NextFunction) => {
    const isApi = req.path.startsWith('/api/') || req.path.startsWith('/studio/api/');
    const isMutating = !['GET', 'HEAD', 'OPTIONS'].includes(req.method.toUpperCase());
    const authBypassPaths = new Set([
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/forgot-password',
      '/api/auth/reset-password',
      '/api/auth/verify-email',
      '/studio/api/auth/login',
      '/studio/api/auth/register'
    ]);

    if (isApi && isMutating && req.actor && !authBypassPaths.has(req.path)) {
      const providedCsrf = req.headers['x-csrf-token'];
      if (typeof providedCsrf !== 'string' || providedCsrf !== req.actor.csrfToken) {
        res.status(403).json({
          error: 'Invalid or missing CSRF token.',
          code: 'CSRF_TOKEN_INVALID'
        });
        return;
      }
    }
    next();
  });

  const requireAuth = (req: AuthedRequest, res: Response, next: () => void) => {
    if (!req.actor) {
      res.status(401).json({
        error: 'Authentication required.',
        code: 'UNAUTHENTICATED'
      });
      return;
    }
    next();
  };

  function checkRateLimit(key: string): boolean {
    const now = Date.now();
    const row = db.prepare('SELECT count, reset_at FROM rate_limits WHERE rate_key = ?').get(key) as
      | { count: number; reset_at: number }
      | undefined;
    if (!row || row.reset_at < now) {
      db.prepare(
        `INSERT INTO rate_limits (rate_key, count, reset_at) VALUES (?, 1, ?)
         ON CONFLICT(rate_key) DO UPDATE SET count = 1, reset_at = excluded.reset_at`
      ).run(key, now + 60_000);
      return true;
    }
    if (row.count >= rateLimitMax) {
      return false;
    }
    db.prepare('UPDATE rate_limits SET count = count + 1 WHERE rate_key = ?').run(key);
    return true;
  }

  function setSessionCookie(req: Request, res: Response, sessionId: string) {
    const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
    const parts = [
      `${SESSION_COOKIE_NAME}=${encodeURIComponent(sessionId)}`,
      'HttpOnly',
      'Path=/',
      'SameSite=Lax',
      `Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`
    ];
    if (isHttps) parts.push('Secure');
    res.setHeader('Set-Cookie', parts.join('; '));
  }

  function clearSessionCookie(res: Response) {
    res.setHeader('Set-Cookie', `${SESSION_COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`);
  }

  function issueSession(req: Request, res: Response, userId: string, tenantId: string) {
    const sessionId = generateToken(32);
    const csrfToken = generateToken(24);
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
    db.prepare(
      `INSERT INTO sessions (id, user_id, tenant_id, csrf_token, expires_at, user_agent)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(sessionId, userId, tenantId, csrfToken, expiresAt, sanitizeText(req.headers['user-agent'] || '', 200));
    setSessionCookie(req, res, sessionId);
    return { sessionId, csrfToken };
  }

  function loadSafeUserSnapshot(userId: string, tenantId: string) {
    const userRow = db
      .prepare('SELECT id, tenant_id, name, email, role, email_verified, status FROM users WHERE id = ?')
      .get(userId) as Record<string, unknown>;
    const tenantRow = db
      .prepare('SELECT id, company_legal_name, credits_balance FROM tenants WHERE id = ?')
      .get(tenantId) as Record<string, unknown>;
    return {
      id: String(userRow.id),
      tenantId: String(userRow.tenant_id),
      name: String(userRow.name),
      email: String(userRow.email),
      role: normalizeRole(String(userRow.role)),
      emailVerified: Boolean(userRow.email_verified),
      companyName: String(tenantRow?.company_legal_name || ''),
      credits: Number(tenantRow?.credits_balance || 0)
    };
  }

  // ==================== HEALTH & CONFIG ====================
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'qabs-preview-api',
      database: 'sqlite',
      paymentsEnabled: false,
      environment: 'preview'
    });
  });

  app.get('/studio/api/config', (_req: Request, res: Response) => {
    res.json({
      stage: 'preview-isolated',
      payments: false,
      registration: true,
      emailVerification: true,
      passwordRecovery: true,
      emailCodeLogin: false,
      googleSignIn: false
    });
  });

  // ==================== AUTHENTICATION & SESSIONS ====================
  app.get('/api/auth/session', (req: AuthedRequest, res: Response) => {
    if (!req.actor) {
      res.json({ authenticated: false, user: null, csrfToken: null });
      return;
    }
    res.json({
      authenticated: true,
      user: loadSafeUserSnapshot(req.actor.userId, req.actor.tenantId),
      csrfToken: req.actor.csrfToken
    });
  });

  app.get('/api/auth/me', requireAuth, (req: AuthedRequest, res: Response) => {
    res.json({
      user: loadSafeUserSnapshot(req.actor!.userId, req.actor!.tenantId),
      csrfToken: req.actor!.csrfToken
    });
  });

  app.get('/studio/api/me', (req: AuthedRequest, res: Response) => {
    if (!req.actor) {
      res.status(401).json({ error: 'authentication_required', code: 'UNAUTHENTICATED' });
      return;
    }
    res.json({
      id: req.actor.userId,
      email: req.actor.email,
      role: req.actor.role,
      emailVerified: req.actor.emailVerified,
      csrf: req.actor.csrfToken
    });
  });

  const handleRegister = (req: Request, res: Response) => {
    const ipKey = `reg:${req.ip || 'local'}`;
    if (!checkRateLimit(ipKey)) {
      res.status(429).json({ error: 'Too many registration attempts.', code: 'RATE_LIMITED' });
      return;
    }

    const email = sanitizeText(req.body?.email, 200).toLowerCase();
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    const name = sanitizeText(req.body?.name || email.split('@')[0], 120);
    const companyName = sanitizeText(req.body?.companyName || '', 160);

    if (!isValidEmail(email) || !isStrongPassword(password)) {
      res.status(400).json({
        error: 'Valid email and password (8+ characters) are required.',
        code: 'INVALID_CREDENTIALS_FORMAT'
      });
      return;
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      res.status(409).json({ error: 'Email already registered.', code: 'EMAIL_EXISTS' });
      return;
    }

    const tenantId = `tenant_${generateToken(8)}`;
    const userId = `usr_${generateToken(8)}`;
    const verifyToken = generateToken(24);
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    db.exec('BEGIN IMMEDIATE');
    try {
      db.prepare(
        `INSERT INTO tenants (id, owner_name, email, company_legal_name, role, credits_balance)
         VALUES (?, ?, ?, ?, 'customer', 50)`
      ).run(tenantId, name, email, companyName);

      // Security rule: public registration ALWAYS assigns 'customer' role, ignoring any client role field.
      db.prepare(
        `INSERT INTO users (id, tenant_id, name, email, password_hash, role, email_verified, status)
         VALUES (?, ?, ?, ?, ?, 'customer', 0, 'active')`
      ).run(userId, tenantId, name, email, hashPassword(password));

      db.prepare(
        `INSERT INTO credit_ledger (id, tenant_id, actor_user_id, delta, balance_after, reason, reference_id)
         VALUES (?, ?, ?, 50, 50, 'New account preview allocation', ?)`
      ).run(`led_${generateToken(6)}`, tenantId, userId, userId);

      db.prepare(
        `INSERT INTO user_subscriptions (id, tenant_id, plan_tier, billing_cycle, renewal_date, current_price, status)
         VALUES (?, ?, 'starter', 'monthly', ?, 0, 'trial')`
      ).run(`sub_${generateToken(6)}`, tenantId, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

      db.prepare(
        `INSERT INTO auth_tokens (id, user_id, purpose, token_hash, expires_at)
         VALUES (?, ?, 'email_verify', ?, ?)`
      ).run(`tok_${generateToken(6)}`, userId, sha256Hex(verifyToken), expires);

      db.exec('COMMIT');
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }

    const { csrfToken } = issueSession(req, res, userId, tenantId);
    createNotification(
      db,
      tenantId,
      'أهلاً بك في قبس — يرجى تأكيد بريدك الإلكتروني',
      'Welcome to QABS — Please verify your email',
      'تم إنشاء مساحتك المعزولة بنجاح.',
      'Your isolated workspace has been provisioned.',
      'auth',
      '/settings',
      userId
    );
    logAudit(db, tenantId, userId, name, `تسجيل حساب عميل جديد (${email})`, `Registered new customer (${email})`, userId);

    res.status(201).json({
      ok: true,
      authenticated: true,
      user: loadSafeUserSnapshot(userId, tenantId),
      csrfToken,
      ...(exposePreviewTokens ? { previewEmailVerifyToken: verifyToken } : {})
    });
  };

  app.post('/api/auth/register', handleRegister);
  app.post('/studio/api/auth/register', handleRegister);

  const handleLogin = (req: Request, res: Response) => {
    const email = sanitizeText(req.body?.email, 200).toLowerCase();
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!checkRateLimit(`login:${email || req.ip}`)) {
      res.status(429).json({ error: 'Too many login attempts. Try again later.', code: 'RATE_LIMITED' });
      return;
    }

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.', code: 'MISSING_CREDENTIALS' });
      return;
    }

    const userRow = db
      .prepare('SELECT id, tenant_id, name, email, password_hash, role, status FROM users WHERE email = ?')
      .get(email) as Record<string, unknown> | undefined;

    if (!userRow || !verifyPassword(password, String(userRow.password_hash))) {
      res.status(401).json({ error: 'Invalid email or password.', code: 'INVALID_CREDENTIALS' });
      return;
    }
    if (userRow.status !== 'active') {
      res.status(403).json({ error: 'Account is suspended.', code: 'ACCOUNT_SUSPENDED' });
      return;
    }

    const { csrfToken } = issueSession(req, res, String(userRow.id), String(userRow.tenant_id));
    logAudit(
      db,
      String(userRow.tenant_id),
      String(userRow.id),
      String(userRow.name),
      `تسجيل دخول ناجح (${email})`,
      `Successful login (${email})`,
      String(userRow.id)
    );

    res.json({
      ok: true,
      authenticated: true,
      user: loadSafeUserSnapshot(String(userRow.id), String(userRow.tenant_id)),
      csrfToken
    });
  };

  app.post('/api/auth/login', handleLogin);
  app.post('/studio/api/auth/login', handleLogin);

  const handleLogout = (req: AuthedRequest, res: Response) => {
    if (req.actor) {
      db.prepare('UPDATE sessions SET revoked_at = CURRENT_TIMESTAMP WHERE id = ?').run(req.actor.sessionId);
      logAudit(db, req.actor.tenantId, req.actor.userId, req.actor.name, 'تسجيل خروج من الجلسة', 'Logged out session', req.actor.sessionId);
    }
    clearSessionCookie(res);
    res.json({ ok: true, authenticated: false });
  };

  app.post('/api/auth/logout', handleLogout);
  app.post('/studio/api/auth/logout', handleLogout);

  app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
    const email = sanitizeText(req.body?.email, 200).toLowerCase();
    if (!checkRateLimit(`forgot:${email || req.ip}`)) {
      res.status(429).json({ error: 'Too many recovery requests.', code: 'RATE_LIMITED' });
      return;
    }
    const userRow = db.prepare('SELECT id, tenant_id, name FROM users WHERE email = ?').get(email) as
      | { id: string; tenant_id: string; name: string }
      | undefined;

    let resetToken: string | undefined;
    if (userRow) {
      resetToken = generateToken(24);
      const expires = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      db.prepare(
        `INSERT INTO auth_tokens (id, user_id, purpose, token_hash, expires_at)
         VALUES (?, ?, 'password_reset', ?, ?)`
      ).run(`tok_${generateToken(6)}`, userRow.id, sha256Hex(resetToken), expires);
      logAudit(db, userRow.tenant_id, userRow.id, userRow.name, 'طلب استعادة كلمة المرور', 'Requested password recovery token', userRow.id);
    }

    // Never leak whether email exists when exposePreviewTokens is false
    res.json({
      ok: true,
      message: 'If the email exists, password reset instructions have been issued.',
      ...(exposePreviewTokens && resetToken ? { previewResetToken: resetToken } : {})
    });
  });

  app.post('/api/auth/reset-password', (req: Request, res: Response) => {
    const token = sanitizeText(req.body?.token, 160);
    const newPassword = typeof req.body?.newPassword === 'string' ? req.body.newPassword : '';
    if (!token || !isStrongPassword(newPassword)) {
      res.status(400).json({ error: 'Valid reset token and 8+ character new password required.', code: 'INVALID_RESET_PAYLOAD' });
      return;
    }
    const tokRow = db
      .prepare(
        `SELECT t.id, t.user_id, t.expires_at, t.used_at, u.tenant_id, u.name
         FROM auth_tokens t JOIN users u ON u.id = t.user_id
         WHERE t.token_hash = ? AND t.purpose = 'password_reset'`
      )
      .get(sha256Hex(token)) as Record<string, unknown> | undefined;

    if (!tokRow || tokRow.used_at || new Date(String(tokRow.expires_at)).getTime() <= Date.now()) {
      res.status(400).json({ error: 'Reset token is invalid or expired.', code: 'INVALID_OR_EXPIRED_TOKEN' });
      return;
    }

    db.exec('BEGIN IMMEDIATE');
    try {
      db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hashPassword(newPassword), String(tokRow.user_id));
      db.prepare('UPDATE auth_tokens SET used_at = CURRENT_TIMESTAMP WHERE id = ?').run(String(tokRow.id));
      db.prepare('UPDATE sessions SET revoked_at = CURRENT_TIMESTAMP WHERE user_id = ?').run(String(tokRow.user_id));
      db.exec('COMMIT');
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }

    logAudit(
      db,
      String(tokRow.tenant_id),
      String(tokRow.user_id),
      String(tokRow.name),
      'إعادة تعيين كلمة المرور وإلغاء الجلسات السابقة',
      'Reset password and revoked old sessions',
      String(tokRow.user_id)
    );
    res.json({ ok: true });
  });

  app.post('/api/auth/verify-email', (req: Request, res: Response) => {
    const token = sanitizeText(req.body?.token, 160);
    if (!token) {
      res.status(400).json({ error: 'Verification token required.', code: 'TOKEN_REQUIRED' });
      return;
    }
    const tokRow = db
      .prepare(
        `SELECT t.id, t.user_id, t.expires_at, t.used_at, u.tenant_id, u.name
         FROM auth_tokens t JOIN users u ON u.id = t.user_id
         WHERE t.token_hash = ? AND t.purpose = 'email_verify'`
      )
      .get(sha256Hex(token)) as Record<string, unknown> | undefined;

    if (!tokRow || tokRow.used_at || new Date(String(tokRow.expires_at)).getTime() <= Date.now()) {
      res.status(400).json({ error: 'Verification token is invalid or expired.', code: 'INVALID_OR_EXPIRED_TOKEN' });
      return;
    }

    db.exec('BEGIN IMMEDIATE');
    try {
      db.prepare('UPDATE users SET email_verified = 1 WHERE id = ?').run(String(tokRow.user_id));
      db.prepare('UPDATE auth_tokens SET used_at = CURRENT_TIMESTAMP WHERE id = ?').run(String(tokRow.id));
      db.exec('COMMIT');
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }

    logAudit(
      db,
      String(tokRow.tenant_id),
      String(tokRow.user_id),
      String(tokRow.name),
      'تأكيد البريد الإلكتروني للحساب',
      'Verified account email',
      String(tokRow.user_id)
    );
    res.json({ ok: true, emailVerified: true });
  });

  // ==================== WORKSPACE BOOTSTRAP (TENANT ISOLATED) ====================
  app.get('/api/workspace/bootstrap', requireAuth, (req: AuthedRequest, res: Response) => {
    const actor = req.actor!;
    const tenantId = actor.tenantId;
    const isAdminOrStaff = isPrivilegedRole(actor.role);

    const companies = isAdminOrStaff
      ? db.prepare('SELECT * FROM company_formations ORDER BY created_at DESC').all()
      : db.prepare('SELECT * FROM company_formations WHERE tenant_id = ? ORDER BY created_at DESC').all(tenantId);

    const stores = isAdminOrStaff
      ? db.prepare('SELECT * FROM store_instances ORDER BY created_at DESC').all()
      : db.prepare('SELECT * FROM store_instances WHERE tenant_id = ? ORDER BY created_at DESC').all(tenantId);

    const products = isAdminOrStaff
      ? db.prepare('SELECT * FROM store_products ORDER BY updated_at DESC').all()
      : db.prepare('SELECT * FROM store_products WHERE tenant_id = ? ORDER BY updated_at DESC').all(tenantId);

    const orders = isAdminOrStaff
      ? db.prepare('SELECT * FROM store_orders ORDER BY created_at DESC').all()
      : db.prepare('SELECT * FROM store_orders WHERE tenant_id = ? ORDER BY created_at DESC').all(tenantId);

    const customers = isAdminOrStaff
      ? db.prepare('SELECT * FROM store_customers').all()
      : db.prepare('SELECT * FROM store_customers WHERE tenant_id = ?').all(tenantId);

    const categories = isAdminOrStaff
      ? db.prepare('SELECT * FROM store_categories').all()
      : db.prepare('SELECT * FROM store_categories WHERE tenant_id = ?').all(tenantId);

    const teamMembers = isAdminOrStaff
      ? db.prepare('SELECT * FROM store_team_members').all()
      : db.prepare('SELECT * FROM store_team_members WHERE tenant_id = ?').all(tenantId);

    const serviceRequests = isAdminOrStaff
      ? db.prepare('SELECT * FROM service_requests ORDER BY created_at DESC').all()
      : db.prepare('SELECT * FROM service_requests WHERE tenant_id = ? ORDER BY created_at DESC').all(tenantId);

    const documents = isAdminOrStaff
      ? db.prepare('SELECT id, tenant_id, request_id, formation_id, document_name, document_type, mime_type, size_bytes, sha256_hash, status, created_at FROM request_documents ORDER BY created_at DESC').all()
      : db.prepare('SELECT id, tenant_id, request_id, formation_id, document_name, document_type, mime_type, size_bytes, sha256_hash, status, created_at FROM request_documents WHERE tenant_id = ? ORDER BY created_at DESC').all(tenantId);

    const subscription = db.prepare('SELECT * FROM user_subscriptions WHERE tenant_id = ?').get(tenantId) || null;
    const subscriptionHistory = db.prepare('SELECT * FROM subscription_history WHERE tenant_id = ? ORDER BY created_at DESC').all(tenantId);
    const invoices = isAdminOrStaff
      ? db.prepare('SELECT * FROM billing_invoices ORDER BY issued_date DESC').all()
      : db.prepare('SELECT * FROM billing_invoices WHERE tenant_id = ? ORDER BY issued_date DESC').all(tenantId);
    const creditLedger = db.prepare('SELECT * FROM credit_ledger WHERE tenant_id = ? ORDER BY created_at DESC LIMIT 50').all(tenantId);
    const notifications = db.prepare('SELECT * FROM notifications WHERE tenant_id = ? ORDER BY created_at DESC LIMIT 50').all(tenantId);
    const tickets = isAdminOrStaff
      ? db.prepare('SELECT * FROM support_tickets ORDER BY created_at DESC').all()
      : db.prepare('SELECT * FROM support_tickets WHERE tenant_id = ? ORDER BY created_at DESC').all(tenantId);
    const auditLogs = isAdminOrStaff
      ? db.prepare('SELECT * FROM security_audit_logs ORDER BY created_at DESC LIMIT 100').all()
      : db.prepare('SELECT * FROM security_audit_logs WHERE tenant_id = ? ORDER BY created_at DESC LIMIT 50').all(tenantId);

    res.json({
      user: loadSafeUserSnapshot(actor.userId, tenantId),
      companies,
      stores,
      categories,
      products,
      orders,
      customers,
      teamMembers,
      serviceRequests,
      documents,
      subscription,
      subscriptionHistory,
      invoices,
      creditLedger,
      notifications,
      tickets,
      auditLogs
    });
  });

  // ==================== SERVICE REQUESTS (8-STATUS LIFECYCLE) ====================
  app.get('/api/service-requests', requireAuth, (req: AuthedRequest, res: Response) => {
    const actor = req.actor!;
    const rows = isPrivilegedRole(actor.role)
      ? db.prepare('SELECT * FROM service_requests ORDER BY created_at DESC').all()
      : db.prepare('SELECT * FROM service_requests WHERE tenant_id = ? ORDER BY created_at DESC').all(actor.tenantId);
    res.json({ requests: rows });
  });

  app.post('/api/service-requests', (req: AuthedRequest, res: Response) => {
    const actor = req.actor;
    const serviceSlug = sanitizeText(req.body?.serviceSlug, 64);
    const servicePath = sanitizeText(req.body?.servicePath || `/services/${serviceSlug}`, 128);
    const serviceTitleAr = sanitizeText(req.body?.serviceTitleAr, 200);
    const serviceTitleEn = sanitizeText(req.body?.serviceTitleEn, 200);
    const customerName = sanitizeText(req.body?.customerName, 160);
    const customerEmail = sanitizeText(req.body?.customerEmail, 160).toLowerCase();
    const customerPhone = sanitizeText(req.body?.customerPhone, 64);
    const initialStatus: OrderStatus = req.body?.status === 'draft' ? 'draft' : 'new';

    if (!serviceSlug || !customerName || !isValidEmail(customerEmail) || !customerPhone) {
      res.status(400).json({
        error: 'Service slug, customer name, valid email, and phone are required.',
        code: 'INVALID_REQUEST_DATA'
      });
      return;
    }

    // Derive tenant ONLY from session if signed in; if public guest submission, bind to isolated guest intake tenant (never another customer's tenant)
    let targetTenantId = actor?.tenantId;
    if (!targetTenantId) {
      targetTenantId = 'tenant_public_intake';
      db.prepare(
        `INSERT OR IGNORE INTO tenants (id, owner_name, email, company_legal_name, role, credits_balance)
         VALUES ('tenant_public_intake', 'Public Intake', 'intake@qabs1.store', 'Public Forms', 'customer', 0)`
      ).run();
    }

    // Validate optional attached document before inserting
    const docPayload = req.body?.document as
      | { name?: string; mimeType?: string; base64?: string; type?: string }
      | undefined;
    let validatedDoc:
      | {
          name: string;
          type: string;
          mimeType: string;
          buffer: Buffer;
          sizeBytes: number;
          sha256Hash: string;
        }
      | undefined;

    if (docPayload && docPayload.base64) {
      const docCheck = validateUploadedDocument(docPayload.mimeType || '', docPayload.base64);
      if (!docCheck.ok) {
        res.status(400).json({ error: docCheck.message, code: docCheck.code });
        return;
      }
      validatedDoc = {
        name: sanitizeText(docPayload.name || 'supporting-document', 180),
        type: sanitizeText(docPayload.type || 'supporting_doc', 64),
        ...docCheck.data
      };
    }

    // Look up catalog price if present so client cannot tamper price below catalog starting fee unless custom
    const catRow = db.prepare('SELECT starting_price_usd FROM services_catalog WHERE slug = ?').get(serviceSlug) as
      | { starting_price_usd: number }
      | undefined;
    const requestedPrice = Number(req.body?.priceUsd ?? catRow?.starting_price_usd ?? 0);
    const safePrice = Number.isFinite(requestedPrice) && requestedPrice >= 0 ? requestedPrice : 0;

    const reqId = `sreq_${generateToken(8)}`;
    const referenceCode = `QBS-${Math.floor(100000 + Math.random() * 899999)}`;

    db.exec('BEGIN IMMEDIATE');
    try {
      db.prepare(
        `INSERT INTO service_requests (
          id, reference_code, tenant_id, user_id, service_slug, service_path,
          service_title_ar, service_title_en, package_id, package_name_ar, package_name_en,
          price_usd, customer_name, customer_email, customer_phone, company_or_store_name,
          custom_fields_json, notes, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        reqId,
        referenceCode,
        targetTenantId,
        actor?.userId || null,
        serviceSlug,
        servicePath,
        serviceTitleAr || serviceSlug,
        serviceTitleEn || serviceSlug,
        req.body?.packageId ? sanitizeText(req.body.packageId, 64) : null,
        req.body?.packageNameAr ? sanitizeText(req.body.packageNameAr, 160) : null,
        req.body?.packageNameEn ? sanitizeText(req.body.packageNameEn, 160) : null,
        safePrice,
        customerName,
        customerEmail,
        customerPhone,
        req.body?.companyOrStoreName ? sanitizeText(req.body.companyOrStoreName, 160) : null,
        JSON.stringify(req.body?.customFields && typeof req.body.customFields === 'object' ? req.body.customFields : {}),
        req.body?.notes ? sanitizeText(req.body.notes, 1500) : null,
        initialStatus
      );

      if (validatedDoc) {
        db.prepare(
          `INSERT INTO request_documents (
            id, tenant_id, uploaded_by, request_id, document_name, document_type,
            mime_type, size_bytes, sha256_hash, content_base64, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'uploaded')`
        ).run(
          `doc_${generateToken(8)}`,
          targetTenantId,
          actor?.userId || null,
          reqId,
          validatedDoc.name,
          validatedDoc.type,
          validatedDoc.mimeType,
          validatedDoc.sizeBytes,
          validatedDoc.sha256Hash,
          validatedDoc.buffer.toString('base64')
        );
      }

      db.exec('COMMIT');
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }

    if (actor) {
      createNotification(
        db,
        actor.tenantId,
        `تم تسجيل طلبك ${referenceCode}`,
        `Service Request Recorded: ${referenceCode}`,
        `حالة الطلب الحالية: ${ORDER_STATUS_LABELS[initialStatus].ar}`,
        `Current status: ${ORDER_STATUS_LABELS[initialStatus].en}`,
        'order',
        '/requests',
        actor.userId
      );
    }
    logAudit(
      db,
      targetTenantId,
      actor?.userId || null,
      actor?.name || customerName,
      `إنشاء طلب خدمة (${serviceSlug}) بحالة ${initialStatus}`,
      `Created service request (${serviceSlug}) status=${initialStatus}`,
      referenceCode
    );

    const created = db.prepare('SELECT * FROM service_requests WHERE id = ?').get(reqId);
    res.status(201).json({ request: created });
  });

  app.get('/api/service-requests/:id', requireAuth, (req: AuthedRequest, res: Response) => {
    const actor = req.actor!;
    const id = sanitizeId(req.params.id);
    const row = db.prepare('SELECT * FROM service_requests WHERE id = ?').get(id) as
      | Record<string, unknown>
      | undefined;
    if (!row) {
      res.status(404).json({ error: 'Service request not found.', code: 'REQUEST_NOT_FOUND' });
      return;
    }
    if (row.tenant_id !== actor.tenantId && !isPrivilegedRole(actor.role)) {
      res.status(403).json({ error: 'Access denied to another customer request.', code: 'FORBIDDEN_TENANT_ACCESS' });
      return;
    }
    const docs = db
      .prepare('SELECT id, document_name, document_type, mime_type, size_bytes, status, created_at FROM request_documents WHERE request_id = ?')
      .all(id);
    res.json({ request: row, documents: docs });
  });

  app.patch('/api/service-requests/:id', requireAuth, (req: AuthedRequest, res: Response) => {
    const actor = req.actor!;
    const id = sanitizeId(req.params.id);
    const row = db.prepare('SELECT * FROM service_requests WHERE id = ?').get(id) as
      | Record<string, unknown>
      | undefined;
    if (!row) {
      res.status(404).json({ error: 'Service request not found.', code: 'REQUEST_NOT_FOUND' });
      return;
    }

    const isOwnerTenant = row.tenant_id === actor.tenantId;
    const isReviewer = canReviewOrders(actor.role);
    if (!isOwnerTenant && !isReviewer) {
      res.status(403).json({ error: 'Access denied.', code: 'FORBIDDEN_TENANT_ACCESS' });
      return;
    }

    const nextStatus = sanitizeText(req.body?.status, 32) as OrderStatus;
    if (!ORDER_STATUSES.includes(nextStatus)) {
      res.status(400).json({ error: 'Invalid order status.', code: 'INVALID_STATUS' });
      return;
    }

    // Customers can only submit drafts ('new') or cancel ('cancelled') their own requests
    if (!isReviewer && !['new', 'cancelled', 'draft'].includes(nextStatus)) {
      res.status(403).json({ error: 'Only staff/admin can set review or fulfillment statuses.', code: 'FORBIDDEN_STATUS_TRANSITION' });
      return;
    }

    const adminNotes = isReviewer && req.body?.adminNotes !== undefined
      ? sanitizeText(req.body.adminNotes, 1000)
      : (row.admin_notes as string | null);
    const assignedStaffId = isReviewer && req.body?.assignedStaffId
      ? sanitizeId(req.body.assignedStaffId)
      : (row.assigned_staff_id as string | null);

    db.prepare(
      `UPDATE service_requests
       SET status = ?, admin_notes = ?, assigned_staff_id = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    ).run(nextStatus, adminNotes, assignedStaffId, id);

    createNotification(
      db,
      String(row.tenant_id),
      `تحديث حالة الطلب ${row.reference_code}`,
      `Order Status Update: ${row.reference_code}`,
      `الحالة الجديدة: ${ORDER_STATUS_LABELS[nextStatus].ar}${adminNotes ? ` — ${adminNotes}` : ''}`,
      `New status: ${ORDER_STATUS_LABELS[nextStatus].en}${adminNotes ? ` — ${adminNotes}` : ''}`,
      'order',
      '/requests',
      row.user_id ? String(row.user_id) : null
    );
    logAudit(
      db,
      String(row.tenant_id),
      actor.userId,
      actor.name,
      `تحديث حالة الطلب ${row.reference_code} إلى ${ORDER_STATUS_LABELS[nextStatus].ar}`,
      `Updated request ${row.reference_code} status=${nextStatus}`,
      String(row.reference_code)
    );

    res.json({ request: db.prepare('SELECT * FROM service_requests WHERE id = ?').get(id) });
  });

  // ==================== PRIVATE DOCUMENT VAULT ====================
  app.get('/api/documents', requireAuth, (req: AuthedRequest, res: Response) => {
    const actor = req.actor!;
    const rows = isPrivilegedRole(actor.role)
      ? db.prepare('SELECT id, tenant_id, request_id, formation_id, document_name, document_type, mime_type, size_bytes, sha256_hash, status, created_at FROM request_documents ORDER BY created_at DESC').all()
      : db.prepare('SELECT id, tenant_id, request_id, formation_id, document_name, document_type, mime_type, size_bytes, sha256_hash, status, created_at FROM request_documents WHERE tenant_id = ? ORDER BY created_at DESC').all(actor.tenantId);
    res.json({ documents: rows });
  });

  app.post('/api/documents', requireAuth, (req: AuthedRequest, res: Response) => {
    const actor = req.actor!;
    const requestId = req.body?.requestId ? sanitizeId(req.body.requestId) : null;
    const formationId = req.body?.formationId ? sanitizeId(req.body.formationId) : null;
    const docName = sanitizeText(req.body?.name, 180);
    const docType = sanitizeText(req.body?.type || 'kyc', 64);

    if (!docName || !req.body?.base64 || !req.body?.mimeType) {
      res.status(400).json({ error: 'Document name, mimeType, and base64 payload required.', code: 'INVALID_UPLOAD' });
      return;
    }

    if (requestId) {
      const parentReq = db.prepare('SELECT tenant_id FROM service_requests WHERE id = ?').get(requestId) as
        | { tenant_id: string }
        | undefined;
      if (!parentReq || (parentReq.tenant_id !== actor.tenantId && !isPrivilegedRole(actor.role))) {
        res.status(403).json({ error: 'Cannot attach document to another tenant request.', code: 'FORBIDDEN_TENANT_ACCESS' });
        return;
      }
    }
    if (formationId) {
      const parentForm = db.prepare('SELECT tenant_id FROM company_formations WHERE id = ?').get(formationId) as
        | { tenant_id: string }
        | undefined;
      if (!parentForm || (parentForm.tenant_id !== actor.tenantId && !isPrivilegedRole(actor.role))) {
        res.status(403).json({ error: 'Cannot attach document to another tenant company.', code: 'FORBIDDEN_TENANT_ACCESS' });
        return;
      }
    }

    const check = validateUploadedDocument(String(req.body.mimeType), String(req.body.base64));
    if (!check.ok) {
      res.status(400).json({ error: check.message, code: check.code });
      return;
    }

    const docId = `doc_${generateToken(8)}`;
    db.prepare(
      `INSERT INTO request_documents (
        id, tenant_id, uploaded_by, request_id, formation_id, document_name, document_type,
        mime_type, size_bytes, sha256_hash, content_base64, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'uploaded')`
    ).run(
      docId,
      actor.tenantId,
      actor.userId,
      requestId,
      formationId,
      docName,
      docType,
      check.data.mimeType,
      check.data.sizeBytes,
      check.data.sha256Hash,
      check.data.buffer.toString('base64')
    );

    logAudit(db, actor.tenantId, actor.userId, actor.name, `رفع مستند آمن (${docName})`, `Uploaded private document (${docName})`, docId);
    const saved = db
      .prepare('SELECT id, tenant_id, request_id, formation_id, document_name, document_type, mime_type, size_bytes, sha256_hash, status, created_at FROM request_documents WHERE id = ?')
      .get(docId);
    res.status(201).json({ document: saved });
  });

  app.get('/api/documents/:id/download', requireAuth, (req: AuthedRequest, res: Response) => {
    const actor = req.actor!;
    const docId = sanitizeId(req.params.id);
    const doc = db.prepare('SELECT * FROM request_documents WHERE id = ?').get(docId) as
      | Record<string, unknown>
      | undefined;
    if (!doc) {
      res.status(404).json({ error: 'Document not found.', code: 'DOCUMENT_NOT_FOUND' });
      return;
    }
    if (doc.tenant_id !== actor.tenantId && !isPrivilegedRole(actor.role)) {
      res.status(403).json({ error: 'Access denied to another tenant document.', code: 'FORBIDDEN_TENANT_ACCESS' });
      return;
    }

    const buf = Buffer.from(String(doc.content_base64), 'base64');
    res.setHeader('Content-Type', String(doc.mime_type));
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(String(doc.document_name))}"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.send(buf);
  });

  // ==================== COMPANY FORMATIONS ====================
  app.get('/api/formations', requireAuth, (req: AuthedRequest, res: Response) => {
    const actor = req.actor!;
    const rows = isPrivilegedRole(actor.role)
      ? db.prepare('SELECT * FROM company_formations ORDER BY created_at DESC').all()
      : db.prepare('SELECT * FROM company_formations WHERE tenant_id = ? ORDER BY created_at DESC').all(actor.tenantId);
    res.json({ formations: rows });
  });

  app.post('/api/formations', requireAuth, (req: AuthedRequest, res: Response) => {
    const actor = req.actor!;
    const companyName = sanitizeText(req.body?.companyName, 200);
    const jurisdiction = sanitizeText(req.body?.jurisdiction || 'US_WYOMING', 64);
    const entityType = sanitizeText(req.body?.entityType || 'LLC', 32);
    if (!companyName) {
      res.status(400).json({ error: 'Company name is required.', code: 'INVALID_COMPANY' });
      return;
    }
    const id = `comp_${generateToken(8)}`;
    const today = new Date().toISOString().split('T')[0];
    const renewal = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    db.prepare(
      `INSERT INTO company_formations (
        id, tenant_id, company_name, jurisdiction, entity_type, registered_agent,
        registered_address, filing_date, renewal_due_date, status, formation_stage, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'under_review', 1, ?)`
    ).run(
      id,
      actor.tenantId,
      companyName,
      jurisdiction,
      entityType,
      sanitizeText(req.body?.registeredAgent || 'QABS Statutory Agent LLC', 200),
      sanitizeText(req.body?.registeredAddress || '30 N Gould St Ste R, Sheridan, WY 82801', 300),
      today,
      renewal,
      sanitizeText(req.body?.notes || '', 500)
    );
    logAudit(db, actor.tenantId, actor.userId, actor.name, `طلب تأسيس كيان (${companyName})`, `Created formation (${companyName})`, id);
    res.status(201).json({ formation: db.prepare('SELECT * FROM company_formations WHERE id = ?').get(id) });
  });

  app.get('/api/formations/:id', requireAuth, (req: AuthedRequest, res: Response) => {
    const actor = req.actor!;
    const id = sanitizeId(req.params.id);
    const row = db.prepare('SELECT * FROM company_formations WHERE id = ?').get(id) as
      | Record<string, unknown>
      | undefined;
    if (!row) {
      res.status(404).json({ error: 'Company formation not found.', code: 'NOT_FOUND' });
      return;
    }
    if (row.tenant_id !== actor.tenantId && !isPrivilegedRole(actor.role)) {
      res.status(403).json({ error: 'Access denied to another tenant company.', code: 'FORBIDDEN_TENANT_ACCESS' });
      return;
    }
    res.json({ formation: row });
  });

  // ==================== STORES & STUDIO BRIDGE ====================
  registerStoreRoutes(app, db, requireAuth);

  app.get('/studio/api/requests', requireAuth, (req: AuthedRequest, res: Response) => {
    const actor = req.actor!;
    const rows = isPrivilegedRole(actor.role)
      ? db.prepare('SELECT id, service_slug AS entity, company_or_store_name AS company_name, status, created_at, updated_at FROM service_requests ORDER BY created_at DESC').all()
      : db.prepare('SELECT id, service_slug AS entity, company_or_store_name AS company_name, status, created_at, updated_at FROM service_requests WHERE tenant_id = ? ORDER BY created_at DESC').all(actor.tenantId);
    res.json({ requests: rows });
  });

  app.get('/studio/api/project-workspaces', requireAuth, (req: AuthedRequest, res: Response) => {
    const actor = req.actor!;
    const tenant = db.prepare('SELECT id, company_legal_name, owner_name FROM tenants WHERE id = ?').get(actor.tenantId) as
      | Record<string, unknown>
      | undefined;
    res.json({
      workspaces: tenant
        ? [
            {
              id: String(tenant.id),
              name: String(tenant.company_legal_name || tenant.owner_name),
              role: actor.role,
              display_name: String(tenant.owner_name)
            }
          ]
        : []
    });
  });

  app.get('/studio/api/workspace-stores', requireAuth, (req: AuthedRequest, res: Response) => {
    const actor = req.actor!;
    const workspaceId = sanitizeId(req.query.workspace_id);
    if (!workspaceId) {
      res.status(400).json({ error: 'workspace_id_required', code: 'workspace_id_required' });
      return;
    }
    if (workspaceId !== actor.tenantId && !isPrivilegedRole(actor.role)) {
      res.status(403).json({ error: 'Access denied to workspace.', code: 'FORBIDDEN_TENANT_ACCESS' });
      return;
    }
    const stores = db.prepare('SELECT * FROM store_instances WHERE tenant_id = ?').all(workspaceId);
    res.json({
      stores,
      next_offset: null,
      counts: { total: stores.length },
      canonical_source: 'qabs_sqlite_preview',
      operational_commerce_migrated: false
    });
  });

  // ==================== SUBSCRIPTIONS, INVOICES & IMMUTABLE AI CREDITS ====================
  app.get('/api/billing/overview', requireAuth, (req: AuthedRequest, res: Response) => {
    const actor = req.actor!;
    const subscription = db.prepare('SELECT * FROM user_subscriptions WHERE tenant_id = ?').get(actor.tenantId) || null;
    const history = db.prepare('SELECT * FROM subscription_history WHERE tenant_id = ? ORDER BY created_at DESC').all(actor.tenantId);
    const invoices = db.prepare('SELECT * FROM billing_invoices WHERE tenant_id = ? ORDER BY issued_date DESC').all(actor.tenantId);
    const tenant = db.prepare('SELECT credits_balance FROM tenants WHERE id = ?').get(actor.tenantId) as { credits_balance: number };
    const creditLedger = db.prepare('SELECT * FROM credit_ledger WHERE tenant_id = ? ORDER BY created_at DESC LIMIT 50').all(actor.tenantId);

    res.json({
      subscription,
      history,
      invoices,
      creditsBalance: Number(tenant?.credits_balance || 0),
      creditLedger
    });
  });

  // Request plan change (creates UNPAID / pending_verification invoice; NEVER auto-marks paid)
  app.post('/api/billing/subscription-change', requireAuth, (req: AuthedRequest, res: Response) => {
    const actor = req.actor!;
    const planId = sanitizeText(req.body?.planId, 32);
    const cycle = req.body?.billingCycle === 'annual' ? 'annual' : 'monthly';
    const planPrices: Record<string, { monthly: number; annual: number; labelAr: string; labelEn: string }> = {
      starter: { monthly: 29, annual: 23, labelAr: 'باقة البداية', labelEn: 'Starter Plan' },
      growth: { monthly: 79, annual: 63, labelAr: 'باقة النمو', labelEn: 'Growth Plan' },
      enterprise: { monthly: 199, annual: 159, labelAr: 'باقة المؤسسات', labelEn: 'Enterprise Plan' }
    };
    const plan = planPrices[planId];
    if (!plan) {
      res.status(400).json({ error: 'Invalid subscription plan.', code: 'INVALID_PLAN' });
      return;
    }

    const totalAmount = cycle === 'annual' ? plan.annual * 12 : plan.monthly;
    const invId = `inv_${generateToken(6)}`;
    const invNum = `INV-2026-${Math.floor(1000 + Math.random() * 8999)}`;

    db.exec('BEGIN IMMEDIATE');
    try {
      db.prepare(
        `INSERT INTO subscription_history (id, tenant_id, plan_tier, billing_cycle, price, status, note)
         VALUES (?, ?, ?, ?, ?, 'pending_verification', ?)`
      ).run(`subh_${generateToken(6)}`, actor.tenantId, planId, cycle, totalAmount, `Requested switch to ${plan.labelEn} (${cycle})`);

      db.prepare(
        `INSERT INTO billing_invoices (
          id, invoice_number, tenant_id, amount, currency, description_ar, description_en,
          invoice_kind, target_plan_tier, target_billing_cycle, status, issued_date
        ) VALUES (?, ?, ?, ?, 'USD', ?, ?, 'subscription', ?, ?, 'pending_verification', ?)`
      ).run(
        invId,
        invNum,
        actor.tenantId,
        totalAmount,
        `طلب ترقية الاشتراك: ${plan.labelAr} (${cycle === 'annual' ? 'سنوي' : 'شهري'}) — بانتظار التحقق`,
        `Subscription upgrade request: ${plan.labelEn} (${cycle}) — Pending Verification`,
        planId,
        cycle,
        new Date().toISOString().split('T')[0]
      );
      db.exec('COMMIT');
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }

    logAudit(db, actor.tenantId, actor.userId, actor.name, `طلب تغيير الاشتراك (${plan.labelAr}) — فاتورة ${invNum} بانتظار التحقق`, `Subscription change request ${invNum} (pending verification)`, invNum);
    res.status(201).json({
      invoice: db.prepare('SELECT * FROM billing_invoices WHERE id = ?').get(invId)
    });
  });

  // Request AI Credit Top-up (NEVER grants credits until admin verifies invoice proof!)
  app.post('/api/billing/credits/request-topup', requireAuth, (req: AuthedRequest, res: Response) => {
    const actor = req.actor!;
    const amountUsd = Number(req.body?.amountUsd ?? 0);
    if (!Number.isFinite(amountUsd) || amountUsd < 10 || amountUsd > 10000) {
      res.status(400).json({ error: 'Top-up amount must be between $10 and $10,000.', code: 'INVALID_TOPUP_AMOUNT' });
      return;
    }

    const creditGrant = Math.round(amountUsd * 10);
    const invId = `inv_${generateToken(6)}`;
    const invNum = `INV-CRD-${Math.floor(1000 + Math.random() * 8999)}`;

    db.prepare(
      `INSERT INTO billing_invoices (
        id, invoice_number, tenant_id, amount, currency, description_ar, description_en,
        invoice_kind, credit_grant_amount, status, issued_date
      ) VALUES (?, ?, ?, ?, 'USD', ?, ?, 'credit_topup', ?, 'pending_verification', ?)`
    ).run(
      invId,
      invNum,
      actor.tenantId,
      amountUsd,
      `طلب شحن ${creditGrant} رصيد ذكاء اصطناعي — بانتظار التحقق المرجعي`,
      `AI Credit Pack Request (${creditGrant} credits) — Pending Verification`,
      creditGrant,
      new Date().toISOString().split('T')[0]
    );

    logAudit(db, actor.tenantId, actor.userId, actor.name, `طلب شحن رصيد AI (+${creditGrant}) — بانتظار التحقق`, `Credit top-up request (+${creditGrant}) pending verification`, invNum);
    res.status(201).json({
      invoice: db.prepare('SELECT * FROM billing_invoices WHERE id = ?').get(invId)
    });
  });

  app.get('/api/invoices/:id', requireAuth, (req: AuthedRequest, res: Response) => {
    const actor = req.actor!;
    const id = sanitizeId(req.params.id);
    const inv = db.prepare('SELECT * FROM billing_invoices WHERE id = ?').get(id) as
      | Record<string, unknown>
      | undefined;
    if (!inv) {
      res.status(404).json({ error: 'Invoice not found.', code: 'INVOICE_NOT_FOUND' });
      return;
    }
    if (inv.tenant_id !== actor.tenantId && !isPrivilegedRole(actor.role)) {
      res.status(403).json({ error: 'Access denied to another tenant invoice.', code: 'FORBIDDEN_TENANT_ACCESS' });
      return;
    }
    res.json({ invoice: inv });
  });

  // Execute QABS AI Command (atomic credit deduction via immutable ledger)
  app.post('/api/ai/execute', requireAuth, (req: AuthedRequest, res: Response) => {
    const actor = req.actor!;
    const prompt = sanitizeText(req.body?.prompt, 500);
    const storeId = sanitizeId(req.body?.storeId);
    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required.', code: 'EMPTY_PROMPT' });
      return;
    }

    let storeRow: Record<string, unknown> | undefined;
    if (storeId) {
      storeRow = db.prepare('SELECT * FROM store_instances WHERE id = ?').get(storeId) as Record<string, unknown> | undefined;
      if (!storeRow || (storeRow.tenant_id !== actor.tenantId && !isPrivilegedRole(actor.role))) {
        res.status(403).json({ error: 'Access denied to store for AI execution.', code: 'FORBIDDEN_TENANT_ACCESS' });
        return;
      }
    }

    const tenant = db.prepare('SELECT credits_balance FROM tenants WHERE id = ?').get(actor.tenantId) as { credits_balance: number };
    const currentCredits = Number(tenant?.credits_balance || 0);
    if (currentCredits < 1) {
      res.status(402).json({ error: 'Insufficient AI credits.', code: 'INSUFFICIENT_CREDITS' });
      return;
    }

    const nextBal = currentCredits - 1;
    const prodAgg = storeId
      ? (db.prepare('SELECT COUNT(*) AS cnt, COALESCE(SUM(stock_quantity), 0) AS stk FROM store_products WHERE store_id = ?').get(storeId) as { cnt: number; stk: number })
      : { cnt: 0, stk: 0 };

    db.exec('BEGIN IMMEDIATE');
    try {
      db.prepare('UPDATE tenants SET credits_balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(nextBal, actor.tenantId);
      db.prepare(
        `INSERT INTO credit_ledger (id, tenant_id, actor_user_id, delta, balance_after, reason, reference_id)
         VALUES (?, ?, ?, -1, ?, ?, ?)`
      ).run(`led_${generateToken(6)}`, actor.tenantId, actor.userId, nextBal, `AI Execution: ${prompt.slice(0, 60)}`, storeId || 'workspace');
      db.exec('COMMIT');
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }

    const storeLabel = storeRow ? String(storeRow.name) : 'Workspace';
    res.json({
      creditsBalance: nextBal,
      result: {
        id: `ai_${generateToken(6)}`,
        prompt,
        responseAr: `تم تحليل "${storeLabel}" (${prodAgg.cnt} منتج / ${prodAgg.stk} قطعة مخزون) وخصم وحدة رصيد واحدة عبر السجل المالي الموثق.`,
        responseEn: `Analyzed "${storeLabel}" (${prodAgg.cnt} products / ${prodAgg.stk} units) and debited 1 credit in the ledger.`,
        timestamp: new Date().toISOString()
      }
    });
  });

  // ==================== NOTIFICATIONS & SUPPORT TICKETS ====================
  app.get('/api/notifications', requireAuth, (req: AuthedRequest, res: Response) => {
    const actor = req.actor!;
    const notifications = db
      .prepare('SELECT * FROM notifications WHERE tenant_id = ? ORDER BY created_at DESC LIMIT 50')
      .all(actor.tenantId);
    res.json({ notifications });
  });

  app.patch('/api/notifications/:id/read', requireAuth, (req: AuthedRequest, res: Response) => {
    const actor = req.actor!;
    const id = sanitizeId(req.params.id);
    const notif = db.prepare('SELECT tenant_id FROM notifications WHERE id = ?').get(id) as
      | { tenant_id: string }
      | undefined;
    if (!notif) {
      res.status(404).json({ error: 'Notification not found.', code: 'NOT_FOUND' });
      return;
    }
    if (notif.tenant_id !== actor.tenantId && !isPrivilegedRole(actor.role)) {
      res.status(403).json({ error: 'Access denied.', code: 'FORBIDDEN_TENANT_ACCESS' });
      return;
    }
    db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(id);
    res.json({ ok: true });
  });

  app.post('/api/notifications/read-all', requireAuth, (req: AuthedRequest, res: Response) => {
    db.prepare('UPDATE notifications SET is_read = 1 WHERE tenant_id = ?').run(req.actor!.tenantId);
    res.json({ ok: true });
  });

  app.get('/api/tickets', requireAuth, (req: AuthedRequest, res: Response) => {
    const actor = req.actor!;
    const rows = canManageTickets(actor.role)
      ? db.prepare('SELECT * FROM support_tickets ORDER BY created_at DESC').all()
      : db.prepare('SELECT * FROM support_tickets WHERE tenant_id = ? ORDER BY created_at DESC').all(actor.tenantId);
    res.json({ tickets: rows });
  });

  app.post('/api/tickets', requireAuth, (req: AuthedRequest, res: Response) => {
    const actor = req.actor!;
    const subject = sanitizeText(req.body?.subject, 200);
    const category = sanitizeText(req.body?.category || 'technical', 32);
    const priority = ['low', 'medium', 'high', 'urgent'].includes(req.body?.priority) ? req.body.priority : 'medium';
    const message = sanitizeText(req.body?.lastMessage || '', 1500);
    if (!subject) {
      res.status(400).json({ error: 'Ticket subject required.', code: 'INVALID_TICKET' });
      return;
    }
    const id = `tkt_${generateToken(6)}`;
    const ticketNumber = `TKT-${Math.floor(1000 + Math.random() * 8999)}`;
    db.prepare(
      `INSERT INTO support_tickets (id, tenant_id, user_id, ticket_number, subject, category, priority, status, client_name, last_message)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'open', ?, ?)`
    ).run(id, actor.tenantId, actor.userId, ticketNumber, subject, category, priority, actor.name, message);

    logAudit(db, actor.tenantId, actor.userId, actor.name, `فتح تذكرة دعم ${ticketNumber}`, `Opened ticket ${ticketNumber}`, ticketNumber);
    res.status(201).json({ ticket: db.prepare('SELECT * FROM support_tickets WHERE id = ?').get(id) });
  });

  app.patch('/api/tickets/:id', requireAuth, (req: AuthedRequest, res: Response) => {
    const actor = req.actor!;
    const id = sanitizeId(req.params.id);
    const tkt = db.prepare('SELECT * FROM support_tickets WHERE id = ?').get(id) as Record<string, unknown> | undefined;
    if (!tkt) {
      res.status(404).json({ error: 'Ticket not found.', code: 'NOT_FOUND' });
      return;
    }
    if (tkt.tenant_id !== actor.tenantId && !canManageTickets(actor.role)) {
      res.status(403).json({ error: 'Access denied to another tenant ticket.', code: 'FORBIDDEN_TENANT_ACCESS' });
      return;
    }
    const status = ['open', 'in_progress', 'waiting_on_client', 'resolved'].includes(req.body?.status)
      ? req.body.status
      : String(tkt.status);
    db.prepare('UPDATE support_tickets SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, id);
    res.json({ ticket: db.prepare('SELECT * FROM support_tickets WHERE id = ?').get(id) });
  });

  // ==================== ADMIN ROUTES (RBAC PROTECTED) ====================
  registerAdminRoutes(app, db, requireAuth);

  // Sanitized API error handler (never exposes stack traces)
  app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/studio/api/')) {
      res.status(500).json({
        error: 'Internal server error.',
        code: 'INTERNAL_ERROR'
      });
      return;
    }
    res.status(500).send('Internal Server Error');
  });

  return { app, db };
}
