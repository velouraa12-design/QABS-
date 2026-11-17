# QABS Unified Platform — Master Module Register

> This register defines the single QABS workspace scope. It is a product/integration contract, not a claim that every service is live. The preview must label demo data and blocked integrations honestly.

## Product shell
- One Arabic-first workspace with RTL Arabic and LTR English, responsive desktop/mobile navigation, QABS navy/gold identity, shared profile, notifications, help center and audit trail.
- One customer identity and tenant boundary across all QABS services.
- Separate staff/admin workspaces with server-enforced RBAC; hiding a menu item is not authorization.
- Every module has explicit state: `demo`, `preview`, `connected`, `blocked`, or `not_started`.

## Customer workspace modules

| Module | Scope to include | Safe preview state / acceptance |
|---|---|---|
| Overview | Business summary, recent activity, pending actions, service status | Demo metrics visibly marked as sample |
| Requests & orders | Unified intake, request number, status timeline, assigned team, comments | Create/edit only in isolated preview storage |
| Company formation | US LLC/C-Corp and UK LTD intake, jurisdiction, package, quote, EIN/CRN milestones, state filing status | No state filing or legal representation implied; manual review gate |
| Compliance | Annual report/renewals, registered agent dates, tax/compliance calendar, reminders, document checklist | Dates are reminders until verified against official records |
| Document vault | Upload/list/download, document type, ownership, checksum, access log, expiring links | Encrypted server-side storage required; never expose private documents in public preview |
| My stores | Multiple independent stores, per-store switcher, status, domain, language, currency | Draft by default; store data isolated by tenant and store |
| Store builder | Themes, sections, pages, navigation, branding, SEO, preview, version snapshots/restore | Changes remain draft until store owner publishes |
| Commerce | Products, variants, categories, inventory, customers, orders, fulfillment, shipping zones, discounts, returns | Test orders only; no real checkout or payment capture |
| Domains | Subdomain allocation, custom-domain request, DNS instructions, verification status | Manual verification workflow; no DNS changes by this project |
| Payment connections | Stripe, PayPal, Payoneer, MyFatoorah, Tap/Moyasar and other supported providers | Application/status tracker only; activation and key changes are blocked pending explicit approval |
| Business accounts | Mercury/Wise and other business-account application tracking | No automatic account opening or KYC submission |
| Plans & subscriptions | Monthly/annual plans, card-required trial configuration, invoices, renewal/cancellation requests | Do not change existing prices or collect real payment without approval |
| AI Studio | Business assistant, content/product copy, marketing drafts, usage history | Monthly subscription includes usage credits; optional prepaid top-ups; server-side provider key only; show cost/credit confirmation before deductions |
| Branding & creative | Brand identity, logo/assets, store design presets, marketing content | Draft assets only; no publishing to external channels |
| Marketing & growth | Campaign planner, SEO checklist, analytics summaries, merchant education | No ad spend or external campaign launch |
| Support & consulting | Tickets, categories, SLA/status, attachments, consultation requests | Isolated preview tickets until backend is connected |
| Profile & security | Profile, password/session management, language, notifications, access history | Real auth must be server-side; no role-switch simulation in production |
| Wallet & billing | Quotes, invoices, credit ledger, top-ups, refunds, tax/fee breakdown | Ledger must be immutable/audited; no live charge or refund without approval |

## Internal operations modules
1. Tenant/customer management and onboarding review.
2. Formation review queue and compliance operations.
3. Store approval, change requests, publishing gate and domain review.
4. Payment-connection review (never self-activate live gateways).
5. Plans, invoices, quote approvals and refund requests.
6. Document review with least-privilege access and access logging.
7. Support inbox, assignment, escalation and response history.
8. Staff accounts, role matrix and session revocation.
9. Audit log, security events and integration health.
10. Platform configuration, feature flags and preview/prod environment separation.
11. Reporting: customers, stores, requests, revenue only from verified transactions, subscriptions, AI credits and support.
12. Content/knowledge center, FAQs, policies and bilingual CMS.

## Required service architecture
- **Frontend:** the Qabs-123 React/Vite application remains the single UI source.
- **API boundary:** `src/services/qabsApi.ts` is the only browser API client. Keep provider secrets out of `VITE_*` variables.
- **Backend candidate:** `velouraa12-design/-qwer` is currently an Express/Node application with file-backed JSON persistence at `data/qabs_storage.json`. It is not a Cloudflare Worker/D1 deployment as-is.
- **Edge target:** implement a separate Cloudflare Worker adapter with D1 migrations and explicit bindings in a preview-only environment. Do not point the UI at production `qabs-stores` until parity, authorization and tenant-isolation tests pass.
- **Persistence:** no browser localStorage for authoritative customer, payment, formation, invoice or document records. It may hold non-sensitive preferences only.
- **Authentication:** verify credentials and sessions server-side; use secure, HttpOnly cookies or a documented bearer-token flow, CSRF protections where cookie auth is used, rate limits and session expiry.
- **Tenant isolation:** every query and mutation must derive tenant identity from the authenticated session, never trust a client-supplied tenant ID. Store-scoped data must also validate store ownership.
- **RBAC:** enforce permissions on every server route; admin writes remain disabled until an approved identity provider and audit controls are in place.
- **Observability:** health endpoint, structured redacted logs, error IDs, integration status, migration version and audit events.

## Known integration facts to preserve
- The Express candidate exposes `GET /api/health` and `GET /health`; its health response identifies itself as staging.
- It has server-side authentication middleware and tenant-filtered data access, but its current persistence is a local JSON file, not D1.
- Its integration status intentionally reports live Shopify and live payment integrations as blocked.
- The frontend API client currently expects routes such as `/api/auth/session`, `/api/auth/login`, `/api/auth/register`, `/api/stores`, and `/api/invoices`. These must be verified and mapped before enabling the client; do not assume route parity from names alone.
- The current preview UI still contains mock/sample state. Never present it as customer production data.

## Release gates (must all pass before a production connection)
- [ ] Build and type-check pass.
- [ ] Unit/integration tests pass for authentication, authorization, tenant isolation and store isolation.
- [ ] D1 migrations tested against an isolated preview database with rollback/backup plan.
- [ ] No secret, token, personal document or customer record appears in client bundles or logs.
- [ ] API contract tests cover every enabled frontend endpoint and error state.
- [ ] Mobile and desktop smoke tests pass for each workspace module.
- [ ] Demo/sample data is clearly labeled and cannot mix with live tenant records.
- [ ] Payment capture, payout changes, gateway activation, domain/DNS changes, Shopify checkout changes and production publishing remain disabled unless separately approved.
- [ ] User reviews the preview before any production promotion.

## Implementation rule
Add all modules to the unified product register and workspace navigation progressively, but mark each honestly. A visible module is not considered operational until its API, persistence, permissions, tests and user-facing workflow are complete.
