# QABS Backend Integration & Security Audit
Date: 2026-11-16
Scope: read-only review of the frontend, Express candidate, and existing Cloudflare staging resources. No production resources, secrets, routes, DNS, or payment settings were changed.

## Executive result
QABS already has a better Cloudflare-native staging foundation than the Express candidate:
- `qabs-auth-staging-20261115` is a Cloudflare Worker backed by D1 `qabs-auth-staging-20261115`.
- `qabs-stores-acceptance-preview` is a Cloudflare Worker backed by D1 `qabs-stores-acceptance-preview`.
- `qabs-unified-workspace-staging` has a service binding named `API` to `qabs-stores-acceptance-preview`.
- The acceptance-preview D1 schema contains users, sessions, tenants, tenant memberships, service requests, formation details/documents, projects, store drafts, store links, support tickets/posts, MFA, rate limits and audit events.
- The auth-staging D1 schema contains users, tenants, tenant memberships, sessions, platform roles, service requests, stores, products, orders, subscriptions, credit ledger, and audit events.

These resources are staging/preview candidates. Their existence and schema do not by themselves prove all endpoints are enabled, correctly authorized, or production-ready.

## Critical frontend integration mismatch
The frontend `src/services/qabsApi.ts` currently expects:
- `/api/health`
- `/api/auth/session`, `/api/auth/login`, `/api/auth/register`, `/api/auth/logout`, `/api/auth/profile`
- `/api/formations`, `/api/stores`, `/api/subscriptions`, `/api/invoices`, `/api/notifications`, `/api/support/tickets`

The Cloudflare auth Worker exposes a versioned contract including:
- `/healthz`, `/api/v1/health`
- `/api/v1/auth/signup`, `/api/v1/auth/login`, `/api/v1/auth/me`, `/api/v1/auth/logout`
- `/api/v1/auth/verify-email`, `/api/v1/auth/verification/resend`
- `/api/v1/auth/password/forgot`, `/api/v1/auth/password/reset`
- `/api/v1/requests`

The acceptance-preview Worker exposes a different contract, including:
- `/api/auth/login`, `/api/auth/register`, `/api/auth/logout`
- `/api/auth/password/forgot`, `/api/auth/password/reset`
- `/api/requests`, `/api/admin/requests`
- `/api/services/requests`, `/api/services/requests/:id` (route family)
- `/api/stores`, `/api/workspace-stores`, `/api/store-drafts`
- `/api/projects`, `/api/project-workspaces`
- `/api/formation-documents`, `/api/formation-selections`
- `/api/invoices`
- `/api/store-workspace`

Do not point the current API client at either service until request/response payloads, auth cookies/CSRF behavior, CORS/origin, and tenant authorization are contract-tested. The two Workers use different route conventions and auth flows.

## Express candidate: do not deploy as a Cloudflare Worker unchanged
The `velouraa12-design/-qwer` repository is an Express + Node app. It uses:
- `fs` and `path` for JSON file persistence in `data/qabs_storage.json`.
- Node `crypto`, including scrypt and AES-256-GCM.
- a deterministic development fallback for the document vault encryption key if `VAULT_ENCRYPTION_SECRET` is absent.
- built-in seed accounts and seed sessions for tests/demo.
- a default document-vault key fallback and seed credentials/tokens in source.

This implementation is not edge-runtime compatible as-is, and the fallback/seed material is unsafe for any publicly reachable environment. Do not reuse the seed identities, passwords, tokens, or fallback encryption key outside an isolated test harness. Do not migrate any seeded demo records into a live tenant database.

## Frontend actions that are simulations today
The reviewed `AppContext` currently changes local React state for many operations, including:
- role switching and login/register/logout,
- adding products, customers, orders, discounts, pages and support tickets,
- changing subscriptions and creating invoices,
- recording refunds and top-ups,
- marking bank accounts verified,
- recording a “backup completed” audit event without creating a real backup.

These are visual/demo interactions, not durable backend transactions. In particular, a locally generated invoice with status `paid`, a processed refund, a verified bank account, or a completed backup must never be represented as a real financial or operational event.

## Security and product gates
1. Keep the Express candidate isolated; do not expose it publicly until seed/default secrets and persistence are redesigned.
2. Select one Cloudflare-native API contract as the canonical staging API. Prefer the existing Worker + D1 foundation only after endpoint-level verification.
3. Use one authentication authority. Do not mix the auth Worker session cookie with the acceptance Worker auth mechanism without a documented SSO/session bridge.
4. Confirm CORS/origin and CSRF rules for the actual preview origin before browser integration.
5. Verify that all customer-facing reads and writes derive tenant identity from the authenticated session. Reject client-supplied tenant IDs.
6. Verify store ownership on every store-scoped product, order, customer, file and domain operation.
7. Keep document bytes in private R2/D1-backed storage with server-side encryption and authorization; never use public URLs for private customer documents.
8. Use immutable/audited credit ledger entries; do not let the browser directly increment balances.
9. Treat invoices, payment status, refunds, bank verification and backups as server-only facts.
10. Do not enable real payment collection, provider activation, Shopify checkout, payout changes, DNS, or production routing in this integration phase.

## Next implementation sequence
- [ ] Capture and test exact API request/response contracts for health, signup/login/me/logout, requests, stores, invoices, subscriptions and support.
- [ ] Pick one staging Worker as the single API gateway and document the service bindings.
- [ ] Add contract tests for auth/session/CSRF/CORS and tenant/store isolation.
- [ ] Add a frontend adapter for the selected contract; do not use guessed endpoint names.
- [ ] Replace local mock mutations module-by-module, retaining a clearly labelled preview fallback.
- [ ] Add integration-status labels for every module.
- [ ] Run desktop/mobile smoke tests and verify that demo records cannot be mistaken for real customer records.
- [ ] Obtain user review before any production promotion.

## Resources deliberately left unchanged
- `qabs-stores` and its D1 database.
- `qabs-auth-staging-20261115`, `qabs-stores-acceptance-preview`, and `qabs-unified-workspace-staging`.
- Existing routes, custom domains, DNS, Shopify, Stripe, Resend secrets, and production payment settings.
