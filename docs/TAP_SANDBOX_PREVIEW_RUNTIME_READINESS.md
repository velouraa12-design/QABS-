# Tap sandbox preview runtime readiness

Date: 2026-11-18
Branch: `autonomous/qabs-baseline-audit-20261118`

## Current code status

The Express implementation in this repository now contains:

- Authenticated tenant-scoped Tap sandbox charge creation.
- Provider-side charge retrieval before browser-return reconciliation.
- Tap `post.url` webhook signature validation using HMAC-SHA256 and constant-time comparison.
- Separate `APP_ORIGIN` and `TAP_WEBHOOK_URL` settings. A payment session cannot be created unless the webhook URL is a public HTTPS endpoint at the exact `/api/payments/tap/webhook` path.
- UI capability status is true only when the sandbox flag, a Tap test key, and the webhook URL are all configured.
- Automated unit and route tests use mocked Tap responses and do not initiate external transactions.

## Read-only runtime audit

The Cloudflare resources currently visible in the connected account show a runtime boundary that prevents safely enabling this integration:

| Resource | Observed state |
|---|---|
| Pages project `qabs-workspace-reference-preview` | Latest isolated preview is `5f872b46`; `uses_functions=false`; no Pages environment variables are configured. |
| Router Worker `qabs-123-preview-c31cc600` | Has a service binding named `API` to `qabs-isolated-staging-worker-staging`. Its frontend origin still points to an older Pages deployment. |
| Bound API Worker | Uses its own D1/R2 staging bindings and a separate `qabs_staging_session` auth cookie. Its observed API contract is the isolated `/api/platform/*` surface, not this repository's Express `/api/auth/*`, `/api/integrations/status`, and `/api/payments/tap/*` contract. |
| D1 | The bound staging database is `qabs-isolated-staging-db-20261110`; it is not proven to be the Express application's `billing_invoices` database. |

Read-only HTTP probes against the router returned:

- `/health`: 200, sanitized staging Worker health.
- `/api/platform/stores`: 401 `AUTH_REQUIRED`, confirming that the isolated platform API route exists and is protected.
- `/api/health`, `/api/auth/session`, and `/api/integrations/status`: 404.
- The static Pages preview serves the frontend but does not route the Express API or Tap webhook.

These observations mean that simply setting `VITE_QABS_API_BASE_URL` to the current staging Worker would be unsafe: its session cookie, API contract, and billing database do not match this repository's Express API.

## Required safe completion path

1. Choose a dedicated non-production Node runtime for this Express application, or deliberately port the complete required API contract to a D1-backed Worker. Do not bridge the existing staging auth/database by assumption.
2. Route the preview frontend's API calls to that same backend using a same-origin reverse proxy or a deliberately designed cross-origin cookie/CSRF policy.
3. Confirm that the backend's invoice table is the same tenant-scoped data source used by the workspace billing UI.
4. Configure `TAP_SECRET_KEY` as a disposable `sk_test_...` secret, `TAP_WEBHOOK_URL` as the publicly reachable backend endpoint, and `QABS_ALLOW_SANDBOX_PAYMENTS=true` only in that isolated runtime.
5. Run an end-to-end sandbox test covering hosted redirect, 3DS, webhook delivery, server retrieval, invoice reconciliation, duplicate webhook handling, and tenant isolation.

## Explicit safety state

- No Tap secret was read, created, or installed.
- `QABS_ALLOW_SANDBOX_PAYMENTS` remains false by default.
- No provider payment request was sent.
- No customer data, D1 records, DNS, Shopify checkout, production Worker, or production Pages deployment was changed.
- Do not report Tap as customer-ready until the runtime and external sandbox acceptance steps above pass.
