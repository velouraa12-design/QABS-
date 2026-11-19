# QABS Platform Architecture and Completion Gates

Status: implementation contract for the isolated development branch  
Canonical engineering workspace: `velouraa12-design/QABS-`  
Protected baseline: `main`  
Development branch: `autonomous/qabs-baseline-audit-20261118`

## Product target

QABS is an Arabic-first business operations platform for entrepreneurs. It combines:
- Public service storefront and guided applications for company formation, EIN assistance, registered-agent/compliance services, payment onboarding assistance, branding, development, consulting and digital services.
- Customer workspace for profile, organizations, service requests, documents, invoices, subscriptions, notifications, support and activity.
- Multi-store SaaS workspace for creating independent draft stores, managing catalogues, variants, inventory, orders, customers, discounts, shipping, pages, themes, apps, domains and team access.
- Platform administration for tenants, staff, roles, approvals, service catalogue, subscriptions, invoices, support, audit events, settings and operational reporting.
- AI tools with tenant-scoped usage accounting, quotas and explicit approval before consequential actions.
- Integrations layer for email, payments, commerce providers, domains, file storage and automation.

The platform must not represent a UI mock, local state, preview token, or unverified external response as a completed customer operation.

## Source-of-truth policy

1. This repository is the active integration workspace because it contains the richest current frontend, Express candidate API, Cloudflare Pages Studio bridge, D1 schema, tests and CI.
2. Other QABS repositories are reference sources, not branches to merge wholesale. Reuse a module only after reviewing its license, dependencies, security posture, data model, tenancy model and compatibility.
3. Keep `main` and production resources unchanged until the isolated branch passes acceptance tests and the owner explicitly approves promotion.
4. Keep the React application, API contracts, database migrations and deployment configuration versioned together where possible.
5. Do not run two competing sources of truth for the same business entity. Each domain entity must have one authoritative persistence service and an explicit adapter for other runtimes.

## Runtime boundaries discovered

- The `/studio` route renders `StudioWorkspaceView`, which uses `src/services/qabsStudioApi.ts` and the same-origin `/studio/api` contract.
- The rest of the application uses `AppContext` and `src/services/qabsApi.ts`, which call the generic `/api/*` contract.
- The repository's Express candidate in `server/app.ts` exposes both legacy `/api/*` routes and a smaller set of `/studio/api/*` aliases.
- The Pages function `functions/studio/api/[[path]].ts` proxies the Studio API through the `QABS_STUDIO_API` service binding. It validates mutation origin and blocks registration in the isolated Pages preview.
- The Studio client includes operations for project catalogues, store drafts, settings and formation selections that are not all present in the Express Studio route list. Those operations must be proven against the actual bound Worker contract; do not assume the Express candidate is a drop-in replacement.
- The two API clients and their cookie/CSRF/session contracts are not interchangeable. Do not point one client at the other API or combine their cookies.

## Completion gates

### Gate A — Frontend and navigation
- Preserve all existing public pages and the 34 workspace routes.
- Verify direct URL loads, browser back/forward, refresh, RTL, keyboard access and mobile layouts.
- Remove dead controls, misleading success states, mock-only writes and duplicate navigation.
- Use concise Arabic-first UI; let layout and hierarchy communicate, retaining essential validation, accessibility and safety text.

### Gate B — Identity and tenancy
- One canonical identity/session authority for the customer workspace.
- Server-side role and permission enforcement on every protected operation.
- Tenant and workspace scoping on every read, write, file, invoice, event and background job.
- Synthetic two-tenant adversarial tests for IDOR, cross-store access, role escalation, CSRF, session fixation, replay and logout.
- Email verification, recovery and registration remain fail-closed until configured and end-to-end tested.

### Gate C — Commerce and stores
- Persist store drafts, settings, products, variants, categories, inventory, orders, customers, discounts, shipping, pages, themes, apps and team permissions.
- Enforce tenant/store ownership and immutable audit events.
- Import products through reviewed adapters with validation, deduplication and safe media handling.
- Domain connection, publication and payment activation remain approval-gated external actions.

### Gate D — Services and documents
- Persist service catalogue versions, applications, status history, assignments, notes, evidence and approvals.
- Validate uploads by size, MIME, signature, ownership and malware-scanning status; use private object storage and short-lived authorized downloads.
- Never claim official filing, EIN issuance, banking approval or provider activation without verified evidence.

### Gate E — Billing and AI usage
- Separate subscription entitlement, invoice, payment attempt, confirmed payment and credit ledger.
- Idempotent webhook processing and provider-side reconciliation before marking invoices paid.
- No live collection, payout changes, automatic renewal or credit purchase in preview.
- AI usage is tenant-metered, quota-enforced and auditable; consequential actions require explicit user confirmation.

### Gate F — Operations and governance
- Admin RBAC, staff lifecycle, support queues, notifications, audit trail, system health and operational reports.
- Backups must be restorable and tested; never expose private backups to public preview.
- Rate limits, structured logs, request IDs, error monitoring and retention policies.
- No secret values in logs, source, artifacts or client bundles.

### Gate G — Release
- TypeScript, lint, unit, API contract, route, tenant-isolation, upload, migration, dependency and build checks.
- Deploy only to a newly verified isolated preview environment.
- Smoke-test all routes and core flows with synthetic data.
- Production, DNS, Shopify, payment activation, customer emails and destructive migrations require separate explicit approval.

## Known integration blocker to resolve before wiring

`AppContext` currently calls a broad legacy API surface (including stores, products, orders, billing, documents, notifications, staff and AI), while `StudioWorkspaceView` uses a separate Studio API. The Studio Worker route contract and Express API do not have complete endpoint parity. The next implementation step is a method-by-method contract inventory and a canonical domain/API decision, followed by adapter tests. A blanket import or endpoint rewrite would risk silently breaking existing workflows and is prohibited.

## External project reuse policy

Import only a focused component when it demonstrably closes a gap (for example, a mature editor, import pipeline, queue, or analytics module). Prefer maintained projects with compatible licenses, active security maintenance, clear tenant boundaries and a modular integration surface. Do not adopt an entire e-commerce platform or replace the current QABS identity/data model merely because it resembles Shopify. Record provenance, license, pinned version, security review and upgrade owner for every imported component.
