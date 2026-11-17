# QABS Authentication and Tenant-Isolation Hardening

Status: implementation gate / staging-only plan. No production resources are changed by this document.

## Verified current architecture

- The frontend has two distinct clients:
  - `src/services/qabsApi.ts`: configurable API origin, Bearer token in sessionStorage, legacy `/api/auth/*` contract.
  - `src/services/qabsStudioApi.ts`: same-origin `/studio/api/*`, HttpOnly session cookie, CSRF token, and same-origin credentials.
- `qabsStudioApi.ts` explicitly documents that it is not wired into AppContext until authenticated ownership and tenant-isolation tests pass.
- The public Pages preview is a separate origin and is not suitable for testing the portal's SameSite=Strict session cookie.
- Cloudflare staging has two separate D1 databases and Workers. The auth database contains users, sessions, tenants, tenant memberships, stores, products, orders, service requests, and audit events. The workspace database contains its own users/sessions and project/workspace membership tables.
- The preview route currently displays local demo data. It is not evidence of persistence or tenant isolation.

## Required architecture decision

Do not merge the two session systems by copying tokens into browser storage. Use one same-origin session boundary for the portal:
1. Browser authenticates only against the portal same-origin API.
2. Session cookie remains HttpOnly, Secure, SameSite, host-only.
3. Mutating requests require CSRF validation.
4. Server resolves user identity from the session; never trust client-supplied user_id, tenant_id, role, or store ownership.
5. Each resource query is scoped through active membership and resource ownership in the database.
6. Keep the legacy Bearer client disabled for authenticated workspace data until its contract is either removed or securely proxied.

## Acceptance tests required before wiring AppContext

### Authentication
- Unauthenticated `GET /studio/api/me` returns 401.
- Valid login creates a server-side session and does not expose a session token to JavaScript.
- Invalid credentials fail without revealing whether an email exists.
- Logout revokes the session; replaying the old cookie returns 401.
- Expired, revoked, and malformed sessions return 401.
- Every state-changing request rejects missing/invalid CSRF tokens.
- Registration, email verification, and password recovery remain disabled until delivery, token expiry, rate limits, and single-use behavior are tested.

### Tenant isolation
Create two disposable test users and two tenants in a non-production test database.
- User A can list/read/update only resources belonging to Tenant A.
- User B can list/read/update only resources belonging to Tenant B.
- Changing path IDs, query tenant IDs, body tenant IDs, store IDs, or resource IDs never grants cross-tenant access.
- Store membership roles are enforced server-side (owner/manager/editor/viewer).
- Cross-tenant reads return 404 or 403 consistently without leaking resource metadata.
- Audit events record denied cross-tenant attempts.
- Composite foreign keys enforce tenant/store consistency for stores, orders, customers, and memberships.

### Data persistence
- AppContext reads/writes authenticated workspace data only through the same-origin API.
- localStorage is limited to non-sensitive UI preferences and clearly labelled demo fixtures.
- Reload and re-login preserve server-backed changes.
- No mock data is presented as live customer data.

## Current blockers / evidence gaps

- The frontend API contracts do not yet match one confirmed single backend contract.
- Two independent Worker/D1 identity stores exist; account linking/migration strategy is not yet established.
- The separate-origin Pages preview cannot validate the portal's cookie behavior.
- D1 schema presence does not prove route-level authorization; cross-tenant adversarial tests are still required.
- Email verification and password recovery feature flags are not enabled on the inspected workspace Worker.

## Safe next implementation sequence

1. Inspect the deployed Worker route handlers and document exact request/response schemas.
2. Select the canonical identity/session service; do not merge or migrate existing user records automatically.
3. Add a same-origin proxy for the canonical service and verify cookie + CSRF behavior on the portal host.
4. Add automated auth and cross-tenant tests using disposable fixtures in a dedicated staging database.
5. Only then connect AppContext and remove authenticated local mock fallbacks.
6. Deploy an isolated preview and verify it; do not publish production or modify payment configuration.

## Safety constraints

- No production database writes or migrations.
- No deletion or merging of user records.
- No DNS, Shopify theme, checkout, or payment-key changes.
- No live payment collection.
- Never log credentials, cookies, CSRF tokens, API keys, or personal documents.
