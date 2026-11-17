# QABS API Contract Map — Staging Read-only Audit

Date: 2026-11-16
Target branch: `unified-template-preview-20261116`

## Integration decision

Do not connect the workspace using the current `src/services/qabsApi.ts` assumptions. That client expects generic `/api/auth/session`, `/api/auth/profile`, `/api/stores`, `/api/subscriptions`, `/api/notifications` routes and a Bearer token in sessionStorage. The deployed Studio API does not use that contract.

Use `qabs-stores-acceptance-preview` as the Studio API gateway for the isolated preview. Keep `qabs-auth-staging-20261115` separate; do not bridge the two session systems without a designed and tested shared-session mechanism.

## Verified Cloudflare topology

- `qabs-auth-staging-20261115`: D1 binding `DB`; independent auth API.
- `qabs-stores-acceptance-preview`: D1 binding `DB`; `APP_BASEPATH=/studio`; `APP_ORIGIN=https://qabs-stores-acceptance-preview.qabs1store.workers.dev`.
- `qabs-unified-workspace-staging`: service binding `API` → `qabs-stores-acceptance-preview`.

No secret values were read. Only binding names and non-secret plain-text configuration were inspected.

## Authentication contract observed in deployed source

Studio uses an HttpOnly `__Host-qdp_session` cookie (Secure, SameSite=Strict, Path=/), not a Bearer token. `GET /studio/api/me` returns the current account and a CSRF value. Mutating authenticated requests use `X-CSRF-Token`. Login and registration are `POST /studio/api/auth/login` and `POST /studio/api/auth/register`; logout is `POST /studio/api/auth/logout`.

The separate auth worker exposes `/api/v1/auth/signup`, `/api/v1/auth/login`, `/api/v1/auth/me`, `/api/v1/auth/logout`, and `/api/v1/health`. These are not interchangeable with the Studio cookie routes.

## Read-only live probes

| Endpoint | Result |
|---|---|
| Auth worker `/healthz` | 200, status ok, environment staging |
| Auth worker `/api/v1/health` | 200, status ok, environment staging |
| Auth worker `/api/v1/auth/me` without session | 401 UNAUTHENTICATED |
| Studio `/studio/api/me` without session | 401 authentication_required |
| Studio `/studio/api/config` | 200 |
| Studio `/studio/api/workspace-store-options` without session | 401 |
| Studio `/studio/api/workspace-stores` without session | 401 |
| Studio `/studio/api/project-workspaces` without session | 401 |
| Studio `/studio/api/requests` without session | 401 |
| Studio `/studio/api/services/catalog` without session | 401 |
| Studio `/studio/api/store-workspace` without session | 401 |

The same tested Studio paths without the `/studio` prefix returned 404. All probes were GET-only; no data was changed. A 401 confirms a protected route exists but does not prove authenticated workflows.

## Route families in the acceptance worker source

- Auth: `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/me`, MFA and session controls.
- Requests: `/api/requests`, `/api/admin/requests`, `/api/services/requests`.
- Stores: `/api/workspace-stores`, `/api/workspace-store-options`, `/api/store-drafts`, `/api/store-workspace`, `/api/stores/*`.
- Projects: `/api/project-workspaces`, `/api/projects`, `/api/project-catalog`.
- Formation: `/api/formation-documents`, `/api/formation-selections`.
- Services/admin: `/api/services/catalog`, `/api/services/admin/workspaces`, `/api/services/team`.
- Settings: `/api/settings/*`.

All are under the deployed `/studio` base path.

## Feature flags observed

Registration, workspace stores, store links and projects are enabled. Email login, Google login, password recovery, formation details and formation upload are disabled. Do not present disabled features as operational.

## Required next integration steps

1. Build a dedicated same-origin Studio API adapter using `/studio/api`, `credentials: 'same-origin'`, HttpOnly session cookies and CSRF from `/studio/api/me` for authenticated mutations.
2. Add contract tests for login, logout, /me, requests, stores, tenant/store ownership, CSRF rejection and CORS/preflight.
3. Verify authenticated reads with a dedicated synthetic staging account before wiring AppContext.
4. Connect read-only endpoints first; retain explicitly labelled demo fallback until tests pass.

## Not tested / not authorized

No authenticated account was used or created. No POST/PUT/PATCH/DELETE requests were sent. CORS/preflight, tenant-isolation attacks, cross-store authorization, production Workers, live customer data, payment processing, Shopify, DNS and production databases were not changed.

## Adapter added after source-level contract inspection

`src/services/qabsStudioApi.ts` now implements the observed cookie/CSRF contract separately from the legacy Bearer client:

- `GET /studio/api/config` and `GET /studio/api/me`.
- `POST /studio/api/auth/login`, `/auth/register`, `/auth/logout`.
- `GET /studio/api/requests`.
- `GET /studio/api/project-workspaces` (returns `workspaces`).
- `GET /studio/api/workspace-stores?workspace_id=...` with validated list filters.

The stores endpoint requires a workspace ID and returns paginated stores plus counts. The adapter deliberately exposes no financial or irreversible mutations.

## Preview-origin limitation

The Cloudflare Pages preview URL and `portal.qabs1.store/studio` are different origins. The Studio session cookie is `__Host-`, Secure and SameSite=Strict, so the Pages preview cannot use the portal session cookie. The adapter therefore targets same-origin `/studio/api` and must not be wired into the Pages preview AppContext or pointed cross-origin at workers.dev. A future unified preview must be hosted behind the existing portal route or use a separately reviewed staging origin and cookie design.

The live read-only check of `/studio/api/config` currently reports `stage=production-limited` and `payments=false`. This is a feature/config response only; it does not authorize enabling payment features.

## Current integration status

- API adapter: added and aligned to inspected request/response contracts.
- Preview deployment: isolated Pages deployment; adapter file is included in the source build but is not connected to the demo AppContext.
- Authenticated login, CSRF enforcement, CORS, tenant isolation and cross-store ownership: not exercised because no synthetic staging account was created or used.
- Do not claim that customer records, stores, requests or subscriptions are integrated until those tests pass.