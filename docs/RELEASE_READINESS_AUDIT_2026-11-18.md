# QABS Release Readiness Audit — 2026-11-18

Status: BLOCKED for production release. This is an evidence-based audit of the current preview branch and deployed staging configuration. No production data, Worker, DNS, payment setting, or Shopify theme was changed.

## Confirmed frontend blockers

1. `src/context/AppContext.tsx` initializes the workspace from `src/data/mockData.ts`, persists the workspace under `qabs_workspace_state_v1` in browser localStorage, and exposes client-side state mutation methods. This is demo state, not a multi-tenant server data layer.
2. The same context exposes role switching and local login/register methods. Client-side role state must never be treated as authorization.
3. `src/services/qabsApi.ts` stores a bearer token in sessionStorage and accepts a configurable API base URL. It is not the same contract as the Studio cookie/CSRF client.
4. `src/services/qabsStudioApi.ts` uses same-origin `/studio/api`, HttpOnly-cookie credentials and a CSRF header, but is explicitly not wired into AppContext pending security acceptance tests.
5. `DEFAULT_SECTION_SETTINGS` contains hard-coded billing identifiers, IBAN-like data, crypto wallet strings, support contact details, and tax data. These values must be treated as unverified demo/configuration values, not verified company/payment credentials. Do not enable payment collection based on them.

## Confirmed deployment/configuration risk

The inspected `qabs-digital-portal-staging` Worker settings include:
- `APP_ORIGIN=https://portal.qabs1.store`
- a service binding named `COMMERCE` targeting `qabs-stores` with environment `production`
- D1 binding `DB` to database `cb88d911-8b7f-45d3-b361-37d88f402333`
- registration, email login, Google login, password recovery, email change, formation details/upload and store-link feature flags set to true.

The inspected `qabs-stores-acceptance-preview` Worker uses a separate D1 database `bd839609-07d8-4155-ae5c-d7bbcf9f0ade` and has email login, Google login, password recovery, formation details/upload disabled. Its registration and workspace/store flags are enabled.

This proves the two Workers have different configuration and database bindings. It does not prove all runtime service-binding traffic is isolated. The staging portal's COMMERCE binding explicitly names the production environment; do not assume it is harmless because the Worker name contains "staging".

## Release gates — must pass before production

### P0 — isolate staging
- Replace any staging-to-production service binding with an explicitly isolated acceptance-preview target, after confirming its API contract and compatibility.
- Confirm every Worker D1/R2/KV/service binding and environment. Verify no preview route can write to production.
- Keep signup, email verification, password recovery, Google login, formation uploads and store linking disabled until their end-to-end controls and email delivery are tested.

### P0 — real server-side authorization
- Select one canonical identity/session authority; do not merge user records or copy bearer tokens into browser storage.
- Route portal mutations through same-origin session + CSRF validation.
- Enforce user, tenant, store membership and role checks inside every handler and every resource query.
- Add adversarial tests for cross-user and cross-tenant reads/writes, guessed IDs, role escalation, revoked/expired sessions and CSRF failures.

### P0 — replace demo state safely
- Keep local demo data visibly labelled and isolated from authenticated mode.
- Do not connect customer accounts to AppContext until server-backed CRUD and persistence tests pass.
- Preserve all existing user records; any migration requires a separately reviewed, reversible plan and backup verification.

### P1 — functional acceptance
- Test services, formation, compliance, stores, catalog, orders, subscriptions, credits, support, files, notifications and responsive navigation.
- Verify every displayed price, legal promise, company identifier, bank detail, tax identifier and payment destination against authoritative owner-provided configuration before presenting it as live.
- Payment collection and gateway activation remain disabled until separately tested and verified.

### P2 — release process
- Run lint, route checks, build, secret scanning, automated auth/tenant tests and browser smoke tests.
- Deploy to isolated preview and verify its origin and backend bindings.
- Production release only after all P0 gates pass and rollback is prepared.

## Scope and safety
No production writes, migrations, merges, Worker deployments, DNS changes, Shopify theme edits, payment activation, checkout changes, or customer-data access were performed by this audit.
