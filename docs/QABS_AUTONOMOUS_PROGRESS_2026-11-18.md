# QABS Autonomous Completion — Baseline & Resume Log
Date: 2026-11-18
Branch: `autonomous/qabs-baseline-audit-20261118`
Baseline: `main` at `bc1d6ff25a9afdf0947ea564b2326ad99bd8b934`

> This is an evidence log, not a completion certificate. Only read-only inspection and this isolated documentation commit have been performed in this run. No production routes, DNS, Shopify, payments, customer data, or database contents were changed.

## 1. Repository inventory

| Repository | Observed contents | Current assessment |
|---|---|---|
| `velouraa12-design/QABS-` | Vite/React workspace + landing/service pages; Express/SQLite candidate under `server/`; D1 schema/migration files; `qabsApi` and `qabsStudioApi`; route checker; auth/tenant-isolation tests; Wrangler preview template. | Richest current engineering candidate. Not yet proven to be the formally designated source of truth. |
| `velouraa12-design/Qabs-123` | Vite/React UI, similar assets, mock-data context, API contract and architecture docs; no backend runtime in the inspected main tree. | Older frontend/template candidate. Its own source-of-truth document currently calls this the main frontend repository. |
| `velouraa12-design/-qwer` | Express/Node server, JSON file persistence at `data/qabs_storage.json`, seeded demo data, and test/docs. | Do not deploy or reuse as production API. The code includes a deterministic fallback vault-encryption key when `VAULT_ENCRYPTION_SECRET` is absent and uses local JSON persistence. |
| `velouraa12-design/-Qabs1.store-` | Similar Vite/React source and shared documentation/assets; fewer backend/test files than `QABS-`. | Related snapshot/variant; not automatically mergeable. |
| `velouraa12-design/qabs-unified-dashboard-template` | README, archive directory, restore script. | Archive/restore helper, not the active application runtime. |

Several repositories share identical architecture, schema, README, and asset blob SHAs. This indicates copied snapshots, not proof of a safe merge. Preserve each repository and its history.

## 2. Reference preview

Inspected:
`https://pr-2.qabs-workspace-reference-preview.pages.dev/?workspacePreview=1#/overview`

- HTTP 200; Arabic RTL workspace and navy/gold identity are visible.
- The page explicitly labels itself as a local interactive demo; changes are local only and real payments/shipping/production activation are unavailable.
- Visible overview includes store metrics, setup checklist, orders, products and inventory.
- The preview response did not enumerate all hash routes; full route coverage remains NOT VERIFIED.
- Demo records must not be presented as customer or production records.

## 3. Cloudflare read-only observations

Authenticated account: one account was returned. No secret values were read.

Observed Workers and bindings:
- `qabs-auth-staging-20261115` → D1 `qabs-auth-staging-20261115`; `APP_ENV=staging`; `APP_ORIGIN=https://preview.qabs1.store`; secret binding names for mail/Resend.
- `qabs-stores-acceptance-preview` → D1 `qabs-stores-acceptance-preview`; `APP_BASEPATH=/studio`; origin is its workers.dev URL. Registration and project/store-link flags are on, while email verification, password recovery, formation details/uploads, Google login, and payments are off.
- `qabs-unified-workspace-staging` has service binding `API` → `qabs-stores-acceptance-preview`.
- `qabs-stores` → D1 `qabs-stores-db`, R2 images bucket and bindings for formation/Studio services plus secret names for commerce, mail, document encryption, Shopify and Stripe. Do not modify or call financial operations.
- `qabs-digital-portal-staging` → D1 `qabs-digital-portal-staging-db`, private formation R2 and AI binding. Its observed `APP_ORIGIN` is `https://portal.qabs1.store` and its `COMMERCE` service binding points to `qabs-stores`. This is a critical environment-boundary concern: the Worker listing also shows its route pattern as `portal.qabs1.store/studio*`; the more-specific `qabs-company-formation-page` route is `portal.qabs1.store/studio/formation*`. Despite the staging name/tag, this Worker is associated with the live portal hostname and references the commerce Worker. Treat it as production-connected; do not deploy, route, or mutate it until ownership and invocation boundaries are independently proven.
- `qabs-forms` remains separately bound to `qabs-forms-db` and notification secrets.

Read-only D1 `sqlite_master` queries confirmed that the auth, Studio acceptance, stores, forms and portal databases contain different table families. No schema/data migrations or writes were run. Database listing metadata reports `num_tables=0` even though read-only sqlite_master queries returned tables; use the actual query result rather than that metadata field.

Cloudflare Pages inventory was subsequently retrieved with the API's accepted pagination (`page=1, per_page=10`). Project `qabs-workspace-reference-preview` exists; latest preview deployment is `f8e83ae5` at `https://f8e83ae5.qabs-workspace-reference-preview.pages.dev`, alias `https://4-merge.qabs-workspace-reference-preview.pages.dev`. It is an isolated preview deployment and `uses_functions=false` (static Pages only).

## 4. HTTP smoke probes

| Target | Result | Meaning |
|---|---|---|
| Auth staging `/healthz` | PASS — HTTP 200, `status=ok`, `environment=staging`, version `0.2.0`. | Health endpoint only; not an auth acceptance test. |
| Acceptance Worker `/studio/api/config` | PASS — HTTP 200. | Confirms preview config; it reports `emailVerification=false`, `passwordRecovery=false`, `formationDetails=false`, `privateDocuments=false`, `payments=false`. |
| Acceptance Worker `/studio/api/me` without a session | PASS — HTTP 401 `authentication_required`. | Unauthenticated route fails closed. Does not prove cross-tenant isolation. |

## 5. Integration blockers found

1. `src/services/qabsApi.ts` calls generic `/api/*` endpoints. `src/services/qabsStudioApi.ts` calls `/studio/api/*` with same-origin cookies and CSRF. These are different contracts and must not be mixed.
2. The inspected `AppContext` imports the generic `qabsApi`; the Studio client is documented as not wired into AppContext pending ownership/isolation tests.
3. The PR-2 reference page is a local mock/demo. It is not evidence that the API or persistent storage is connected.
4. The separate auth Worker and Studio acceptance Worker use different session systems. No SSO/session bridge is verified.
5. The acceptance preview has critical auth and document features disabled by configuration. Do not infer they work because corresponding UI exists.
6. The current preview workflow and open draft PRs are infrastructure/safety work, not platform completion.

## 6. Existing GitHub work (not merged)

- Draft PR #3: preview workflow safety and removal of access-history artifacts from generated preview output. Its description states that it does not unify the Express/SQLite backend with Workers/D1.
- Draft PR #4: fixes GitHub Actions secret-condition handling for the preview workflow. The observed PR workflow run `44226926881` completed with conclusion `success`; this validates that workflow run, not the application.
- Branch `integration/qabs-auth-tenant-hardening-20261118` is diverged from main (17 commits ahead, 5 behind). Do not merge/cherry-pick without reviewing the full divergent history and conflicts.

## 7. Status matrix

| Area | Status | Evidence / next proof required |
|---|---|---|
| Repository inventory | PASS (partial scope) | Five owner repositories listed; other org/user repositories may exist outside this list. |
| PR-2 overview reference | PASS | HTTP 200; demo-only notice observed. |
| Full PR-2 route coverage | NOT VERIFIED | Enumerate and visit every route at desktop/mobile sizes. |
| Auth staging health | PASS | `/healthz` HTTP 200. |
| Unauthenticated Studio gate | PASS | `/studio/api/me` HTTP 401. |
| Email verification and password recovery on acceptance preview | BLOCKED | Feature flags are false. |
| Real private document upload/storage | BLOCKED | Feature flags are false; R2/authorization tests needed. |
| Real payment collection | BLOCKED | Payments disabled; no real transactions authorized. |
| Tenant/store isolation in deployed Workers | NOT VERIFIED | Run synthetic two-user/two-store adversarial API tests against a dedicated isolated acceptance database. |
| Frontend-to-canonical-API integration | FAIL (contract mismatch) | Select one API authority and write contract tests before connecting AppContext. |
| Pages project inventory/deployment history | PASS (inventory) | Pages project and latest preview deployment retrieved with valid pagination; static-only deployment (`uses_functions=false`). |
| Staging/live environment separation | FAIL (risk identified) | Staging-named portal Worker has live portal origin and a service binding to `qabs-stores`; isolate/verify before use. |
| Production deployment / DNS / checkout / payment mutation | NOT AUTHORIZED | Explicitly out of scope. |

## 8. Next execution sequence

1. Inspect the current `main` commit, open PR diffs, workflow jobs and the 17-commit divergent auth branch; do not merge.
2. Inspect every Worker route, service binding, D1 binding and environment variable name (never secret values); prove staging has no path to production services.
3. Identify the canonical staging auth authority and API gateway. Contract-test health, signup/login/me/logout, CSRF, email verification, recovery, requests, stores, invoices, subscriptions and support.
4. Wire a frontend adapter only after endpoint and cookie-origin contracts are proven. Keep preview fallback visibly labelled and fail closed.
5. Run local unit/build/lint/route checks in an isolated environment; run adversarial two-user/two-store tests with synthetic identities and data.
6. Create a separate preview artifact/deployment only after the project identity and secret isolation are verified. Do not replace prior previews.
7. Continue module-by-module (formation/documents, stores/catalog/orders, billing/payments, AI credits, support, staff/RBAC, notifications, reports), recording PASS/FAIL/NOT VERIFIED/BLOCKED with evidence.

## 9. Safety boundary

No production deploy, PR merge, DNS change, Shopify checkout/theme change, payment key change, real payment, customer email, database migration, data deletion, account migration or external purchase was performed or authorized.


## 10. New isolated preview deployment and CI evidence

GitHub Actions run `44226926881` for draft PR #4 completed successfully. The observed job steps all completed successfully:
- TypeScript check (`npm run lint`).
- API/security and route tests: 10 tests passed, 0 failed.
- Workspace route checker: 34 tabs had sidebar entries, unique URL slugs and page renderers.
- Vite static build succeeded.
- Public preview artifact scan removed/excluded AI Studio access-history JSON.
- Preview artifact upload succeeded.
- Cloudflare Pages deploy succeeded.

Run log warnings:
- Vite reports use of `__dirname` in `vite.config.ts` is unsupported by the future native config loader.
- Main JS chunk is approximately 1.225 MB (302 KB gzip), above the 500 KB advisory threshold.
- The deployment reports a dirty working tree in its checkout.
These are warnings, not failed steps; they remain cleanup items.

New preview:
- `https://4-merge.qabs-workspace-reference-preview.pages.dev`
- Immutable deployment URL: `https://f8e83ae5.qabs-workspace-reference-preview.pages.dev`
- Cloudflare project: `qabs-workspace-reference-preview`
- Deployment environment: `preview`; `uses_functions=false`.

Live scrape checks on the new deployment:
- Root homepage: HTTP 200; Arabic marketing landing page rendered.
- `/services/company-formation`: HTTP 200; standalone service page rendered.
- Mobile viewport scrape: HTTP 200; same page content returned. Screenshot was generated, but no pixel-by-pixel visual QA was completed.
- `#/overview`, `#/workspace`, `#/workspace/overview`, `#/login`, `#/portal`, and `?workspacePreview=1#/overview` all returned the marketing landing page in the Firecrawl scrape. The customer workspace therefore remains NOT VERIFIED on this Pages preview; the route may require a browser interaction or a different host/route. The preview reference link from PR-2 remains a separate demo environment.

The newly deployed preview visibly contains prices and marketing claims (including an EIN success-rate claim). Those are content, not verified service outcomes or approved current pricing; review them before any public release.


### Workspace interaction and backend-route verification

A live browser interaction clicked the visible `مساحة العمل` control. It opened the secure-login modal; it did not enter a customer dashboard. No credentials were entered and no form was submitted. This is a useful fail-closed UI observation, but it does not validate a real login.

On the same Pages preview:
- `/api/health` returned HTTP 200 with `text/html` containing the application's not-found page, not JSON health output.
- `/studio/api/config` returned HTTP 200 with `text/html` containing the application's not-found page, not a Studio API response.
This is consistent with the Cloudflare Pages project reporting `uses_functions=false`: the preview is static-only and has no deployed backend Functions/API. Do not wire this Pages origin to real customer operations or treat HTTP 200 on these fallback pages as API success.


## 11. Isolated two-user security exercise — 2026-11-18

Target: `qabs-stores-acceptance-preview` Worker + its dedicated D1 `qabs-stores-acceptance-preview`. Worker settings showed no service binding to the commerce/production Worker; the only database binding was the acceptance-preview D1. No emails, payments, DNS, customer services, or production endpoints were invoked.

Synthetic fixtures created (not cleaned up, because destructive cleanup is outside the authorized scope):
- Accounts: `qabs.audit.alpha.20261118@qabs.invalid` and `qabs.audit.beta.20261118@qabs.invalid`.
- Workspaces: `Synthetic Alpha Workspace` and `Synthetic Beta Workspace`.
- One draft only: `Synthetic Alpha Isolated Draft` using the preview catalog template `qabs-fashion`.
- No passwords or session cookies were saved in this repository/log.

Observed test results:
| Test | Result |
|---|---|
| Register Alpha and Beta | PASS — both returned HTTP 201; sessions established. |
| Read own session/profile | PASS — both returned HTTP 200, role `client`, CSRF value present. |
| Create separate personal workspaces | PASS — both returned HTTP 201. |
| List personal workspaces | PASS — each account saw exactly one workspace. |
| Beta reads Alpha workspace stores by substituting Alpha workspace ID | PASS — HTTP 404 `workspace_not_found`. |
| Beta reads Alpha projects by substituting Alpha workspace ID | PASS — HTTP 404 `workspace_not_found`. |
| Beta reads own workspace stores/projects | PASS — HTTP 200, empty lists. |
| Create Alpha store draft | PASS — HTTP 201. |
| Alpha vs Beta store-draft lists | PASS — Alpha saw 1 draft; Beta saw 0. |
| Alpha logout then reuse old session | PASS — logout HTTP 200; subsequent `/api/me` HTTP 401 `authentication_required`. |

Scope limitation: this proves the tested workspace membership gates and owner-filtered draft listing for two synthetic users in this one acceptance Worker. It does NOT prove every store/product/order/customer/document/domain endpoint is isolated, nor does it prove the separate auth Worker and live `qabs-stores` service are safe. Email verification is disabled in this acceptance preview, so this registration test is not an approval to onboard real users.

A subsequent cross-tenant project-creation attempt was not executed because the browser tool's safety layer blocked that request. No result is claimed for cross-tenant write attempts on the project API.


## 12. Authentication and private-document feature-gate checks

Read-only inspection of the acceptance Worker settings confirms the D1 binding points to database UUID `bd839609-07d8-4155-ae5c-d7bbcf9f0ade`, whose exact database name is `qabs-stores-acceptance-preview`. The Worker has an `APP_ORIGIN` equal to its workers.dev origin and no listed Service Binding. Relevant feature flags:
- `REGISTRATION_ENABLED=true`, `PROJECTS_ENABLED=true`, `WORKSPACE_STORES_ENABLED=true`, `STORE_LINKS_ENABLED=true`.
- `EMAIL_LOGIN_ENABLED=false`, `GOOGLE_LOGIN_ENABLED=false`, `PASSWORD_RECOVERY_ENABLED=false`.
- `FORMATION_DETAILS_ENABLED=false`, `FORMATION_UPLOAD_ENABLED=false`.
- No `FORMATION_DOCUMENTS` R2 binding is present in the returned settings; the required formation-data key is not listed as a plain-text setting (secret values are not disclosed).

Live, unauthenticated, non-destructive endpoint probes against the acceptance Worker:
| Probe | Result |
|---|---|
| `GET /studio/api/me` | PASS — 401 `authentication_required` |
| `POST /studio/api/auth/email/start` | PASS — 503 `email_login_not_configured`; no email sent |
| `POST /studio/api/auth/google/start` | PASS — 503 `google_login_not_configured` |
| `POST /studio/api/auth/password/forgot` | PASS — 503 `password_recovery_unavailable`; no reset email sent |
| `GET /studio/api/formation-documents?request=<synthetic UUID>` | PASS — 503 `private_upload_unavailable` |
| `POST /studio/api/formation-documents` without a session | PASS — 401 `authentication_required`; no upload accepted |

Code/schema inspection:
- Users are constrained to `client` or `admin` roles at the database level; registrations write `client`.
- Session records store a hash, CSRF value and expiry; session cookie code uses `Secure; HttpOnly; SameSite=Strict; Path=/`.
- Password reset stores token hashes with expiry and the code performs a transactional password/session update when enabled.
- Private formation documents are owner-bound in D1, encrypted in R2 with AES-GCM and request/user metadata as associated data; however the upload path explicitly reports `malwareScanned:false`. Do not enable private uploads until malware scanning/quarantine and the required R2/key bindings are provided and tested.
- Project membership roles are constrained to owner/admin/editor/viewer; project rows have a composite foreign key to the creator's workspace membership.

Important status distinction: these endpoint probes PASS as negative/closed-gate security tests. They do NOT mean email login, Google login, password recovery, or document upload are operational; those capabilities are deliberately BLOCKED by configuration.


## 13. Cloudflare Worker/API topology expansion

Read-only inventory returned 22 Worker scripts. Key binding graph (only resource names/types; no secret values):
- `qabs-digital-portal-staging` -> D1 `qabs-digital-portal-staging-db` (`cb88d911-8b7f-45d3-b361-37d88f402333`), R2 `qabs-formation-private-staging`, AI binding, and Service Binding `COMMERCE -> qabs-stores`. Its `APP_ORIGIN` is `https://portal.qabs1.store`.
- `qabs-stores` -> D1 `qabs-stores-db` (`26464e53-52d2-45e1-8fa8-c3fd64dab074`), R2 `qabs-stores-images`, formation Service Binding, and Service Binding `STUDIO -> qabs-digital-portal-staging`. Its `APP_ORIGIN` is also `https://portal.qabs1.store`.
- These two Workers form a bidirectional Service Binding relationship. This can be an intentional proxy arrangement, but it is a circular cross-service topology that needs route-by-route invocation tracing and must not be mistaken for isolated staging.
- `qabs-auth-staging-20261115` -> separate D1 `qabs-auth-staging-20261115` (`3c377d25-40c6-423c-8efb-6073e242547f`), separate auth implementation, `APP_ENV=staging`, `APP_ORIGIN=https://preview.qabs1.store`, Resend secret binding, and no service binding. It is not wired into either portal or commerce Worker.
- `qabs-stores-acceptance-preview` -> only its own acceptance D1 and secret binding; no service binding.
- `qabs-unified-workspace-staging` -> service binding to `qabs-stores-acceptance-preview`.
- `qabs-isolated-staging-worker-staging` -> its own staging D1 and R2 artifacts bucket.
- Recovered commerce/dashboard Workers use separate D1/R2 resources and have payment/Shopify flags false in the recovered commerce Worker.

Live zone route inventory for `qabs1.store`:
- `portal.qabs1.store/studio*` -> `qabs-digital-portal-staging`.
- More-specific `portal.qabs1.store/studio/formation*` -> `qabs-company-formation-page`.
- `portal.qabs1.store/reference-store*` -> `qabs-reference-public`.
- `portal.qabs1.store/` -> `qabs-portal-home-20261111`.
- `staging.qabs1.store/*` -> `qabs-isolated-staging-worker-staging`, with more-specific recovered formation/dashboard/commerce paths mapped to their corresponding recovered Workers.

Standalone auth Worker endpoint smoke checks (workers.dev; no signup, login, email, or state-changing request was sent):
- `GET /healthz`: HTTP 200, JSON `service=qabs-worker-api, status=ok, environment=staging, version=0.2.0`.
- `GET /api/v1/health`: same HTTP 200 health response.
- `GET /api/v1/auth/me`: HTTP 401 `UNAUTHENTICATED`.
- `GET /api/v1/requests`: HTTP 401 `UNAUTHENTICATED`.
- Earlier `/api/me` and `/api/health` probes returned 404 because this Worker uses the `/api/v1/*` contract, not the portal Worker contract.

Architecture finding: there are at least two distinct authentication implementations and databases: the portal Worker implements `/api/auth/*` with `__Host-qdp_session` and its own D1, while the standalone auth Worker implements `/api/v1/auth/*` with `__Host-qabs_session` and its own D1. The standalone auth Worker currently has no Service Binding or zone route. Do not select it as the canonical auth service or migrate accounts until a compatibility design, data ownership, session migration, email verification, and complete authorization contract are proven. This is currently BLOCKED as an architecture decision, not a reason to connect them by guesswork.


## 14. Implemented isolated workspace preview API-bridge repair

The original `qabs-unified-workspace-staging` Worker was inspected and found to have two integration defects:
1. It proxied only `/api/*`, while the actual Studio client uses `/studio/api/*`; the proxy also forwarded the legacy path without the configured `/studio` base path.
2. Its static-page Content-Security-Policy set `connect-src 'none'`, preventing browser fetch/XHR even to the same origin.

To preserve the previous preview, I created a NEW Worker rather than overwriting the old one:
- Worker: `qabs-unified-workspace-staging-v2`
- Deployment ID: `54569a033a7f46f8bd89dbdb0e45d284`
- Version tag: `b6e7611928f241a8a1dbba2298a4fcf4`
- URL: `https://qabs-unified-workspace-staging-v2.qabs1store.workers.dev`
- Only binding: `API -> qabs-stores-acceptance-preview`.
- workers.dev enabled; preview URLs disabled; no custom zone route or DNS change.
- The original `qabs-unified-workspace-staging` Worker remains intact as rollback/reference.

Code changes in v2:
- Proxy `/studio/api/*` to the acceptance API without stripping its configured base path.
- Keep legacy `/api/*` compatibility by rewriting it to `/studio/api/*`.
- Change static CSP from `connect-src 'none'` to `connect-src 'self'` so same-origin API calls are permitted.
- Preserve embedded static assets and the existing acceptance API service binding.

Post-deployment live checks:
| Check | Result |
|---|---|
| `/_qabs_staging_health` | PASS — HTTP 200, staging health JSON |
| Root HTML | PASS — HTTP 200, Arabic QABS landing shell |
| CSP | PASS — `connect-src 'self'` |
| `/studio/api/me` without session | PASS — proxied JSON 401 `authentication_required` |
| `/studio/api/config` | PASS — proxied JSON 200 |
| Legacy `/api/me` | PASS — rewritten and proxied JSON 401 `authentication_required` |
| Hash route `#/workspace/overview` | PASS — dedicated demo workspace screen rendered and clearly marked offline/sample |
| Hash route `#/services/formation` | PASS — service detail page rendered; no real submission |
| Hash route `#/services/stores` | PASS — service detail page rendered; no real store creation |
| Hash route `#/services/advisor` | PASS — AI service information page rendered; no AI execution |

Desktop and mobile scrapes both returned HTTP 200. This is a content-level responsive smoke check; full visual interaction and device-width pixel QA remain NOT VERIFIED.

Attempted a synthetic authenticated end-to-end login through the new same-origin Worker using the already-created Alpha test account, but the browser tool's safety layer blocked the request. No login or logout result is claimed for v2. The previously completed two-user tests remain direct tests against the acceptance Worker, not the new proxy path.

Important: the v2 preview now has a working API bridge, but its rendered workspace remains explicitly a disconnected demo shell. The React app's existing `qabsStudioApi.ts` adapter is not yet wired into `AppContext`; the API bridge repair alone does not connect the customer UI to authenticated backend data.


## 15. Additional isolated commerce preview review

Target: `qabs-commerce-tenant-isolation-preview-20261107`, its dedicated D1 `qabs-commerce-tenant-isolation-preview-20261107` (`2d25e890-671a-4a32-91da-69446f7fef27`), workers.dev only. No Service Binding is configured on this Worker; only `APP_ORIGIN` and its own D1 are present.

Live read-only results:
- `GET /health`: HTTP 200, release `staging-0.8`, `productionReady=false`.
- `GET /api/auth/me` without a session: HTTP 401 `authentication_required`.
- `GET /api/config`: HTTP 200; `authenticationReady=false`, `passwordLoginReady=true`, `uploadsReady=false`, `subscriptionPaymentReady=false`, `storefrontCheckoutReady=false`, `customDomainsReady=false`, `domainPurchaseReady=false`, `partnershipFinancialReady=false`. One synthetic plan and three templates are advertised.
- `GET /api/identity-link`: HTTP 200 `enabled=false`, `linked=false`, `identity_link_not_enabled`.

Source/schema observations:
- Store ownership helper queries `qs_stores` with both store ID and authenticated `owner_id`; products reference a store ID. This is a positive source-level control but not a completed cross-tenant penetration test.
- Identity-link module explicitly prohibits automatic email matching and requires an explicit link/confirmation flow. However this preview has no `STUDIO` Service Binding and identity linking is disabled, so the flow cannot be accepted as end-to-end tested here.
- This commerce preview has its own D1, separate from the acceptance Studio D1 and the live commerce D1. Do not merge or copy account/store data between them.

Conclusion: useful isolated commerce code/reference, not a production-ready commerce backend and not currently a unified auth+commerce staging environment.


## 16. Frontend offline-authentication hardening and CI

On this isolated development branch, `src/context/AppContext.tsx` was hardened to fail closed when the backend is disconnected:
- Offline role switching no longer creates a Super Admin or client identity.
- Offline login and registration return failure and do not set `isAuthenticated`.
- Offline password-reset and email-verification paths no longer return synthetic success tokens or mark an email verified.
- Static/offline startup no longer restores a cached user/session or customer workspace records from localStorage.
- Offline customer data and pending service orders are cleared; workspace state is no longer persisted as an offline authenticated session.

A draft PR was opened for review (PR #5; not merged).
GitHub Actions run `44231080195` completed with SUCCESS:
- TypeScript/lint: PASS.
- Vite build: PASS.
- Secret scan: PASS.

The repository's current `ci.yml` does not run `npm test` or `check:routes`; those remain NOT VERIFIED in this run. This is not a full regression-test pass.


## 17. Expanded CI regression suite — verified

Updated `.github/workflows/ci.yml`:
- Node runtime moved from 20 to 22 for compatibility with the test server's built-in `node:sqlite`.
- CI now runs `npm test` and `npm run check:routes` in addition to TypeScript/lint, Vite build and secret scan.

GitHub Actions run `44231386861` for commit `f9de0eabc375d20df0b8a3db69be44f7d288ff59` completed SUCCESS:
| Step | Result |
|---|---|
| Dependency install | PASS |
| TypeScript / lint | PASS |
| API/auth/tenant-isolation tests | PASS |
| Workspace route checker | PASS |
| Vite build | PASS |
| Secret scan | PASS |

The test suite covers local Express preview API behavior including registration role injection, CSRF, session revocation, cross-tenant/cross-store access, RBAC, billing gates, credit ledger and document vault paths. These are local test-harness results, not proof that the separate Cloudflare Workers expose the same routes or are production-ready.

The separate `workspace-preview.yml` generated failure-status run records with zero jobs and no job logs for the branch pushes; no Pages build/deploy is claimed from those records. Cause remains NOT VERIFIED. The independently deployed Worker preview v2 remains the available preview link.


## 18. Second repository pass, API contract mismatch, and fresh Pages preview

### Repository boundaries (read-only comparison)
- `velouraa12-design/QABS-`: current working frontend/API candidate. Contains `src/services/qabsApi.ts` (legacy `/api/*` contract) and `src/services/qabsStudioApi.ts` (same-origin `/studio/api/*`, HttpOnly `__Host-qdp_session`, CSRF) but the latter is intentionally not wired into `AppContext`.
- `velouraa12-design/Qabs-123`: separate Vite/React template repository. Its own source-of-truth and contract docs say the UI uses `mockData.ts` and React state, while `DATABASE_SCHEMA.sql` is a target schema, not a connected runtime. No changes made.
- `velouraa12-design/-Qabs1.store-`: another separate template copy with additional module and backend audit docs. It also says the frontend state is mock/local and its `qabsApi.ts` assumptions do not match the deployed Studio API. No changes made.
- `velouraa12-design/-qwer`: Express/Node candidate previously audited; JSON-file persistence and seeded/dev-only fallbacks make it a local test harness, not a Worker/D1 deployment target without a separate redesign.
- No repository, branch, history, or user data was merged or deleted.

### Live API contract checks on the new Worker preview
Target: `qabs-unified-workspace-staging-v2.qabs1store.workers.dev`.
- Worker Service Binding `API` points to `qabs-stores-acceptance-preview`.
- `/_qabs_staging_health`: HTTP 200, `apiBridge=configured`.
- `/studio/api/config`: HTTP 200.
- `/studio/api/me`: HTTP 401 without session (expected protection).
- `/api/health`, `/api/auth/session`, `/api/workspace/bootstrap`, `/api/integrations/status`: HTTP 401 from the proxied Studio API, not the legacy payload shape expected by `qabsApi.ts`.
- Therefore the bridge itself is live, but the current React `qabsApi.ts` and the deployed Studio API contract are not yet compatible. The existing `qabsStudioApi.ts` is the correct same-origin cookie/CSRF client direction, but currently covers only a subset (config, me, login/register/logout, requests, project workspaces, workspace stores). Do not mark the customer workspace backend-integrated or wire only the login methods while the rest of the UI still relies on incompatible calls.

### Preview workflow repaired and new preview deployed
- Added the autonomous branch to `.github/workflows/workspace-preview.yml`.
- Fixed secret guards to use the job-level `env` context rather than referencing `secrets` directly in step `if` expressions.
- GitHub Actions CI run `44231866808`: SUCCESS — TypeScript/lint, API tests, route checks, build, secret scan.
- Workspace preview run `44231862380`: SUCCESS — dependency install, lint, API tests, route checks, static build, artifact upload, Cloudflare Pages deploy.
- Cloudflare Pages deployment ID `8ec711a0-857a-4695-af8b-d8fd8bcc5841`, environment `preview`, branch `autonomous/qabs-baseline-audit-20261118`, commit `5d14284afc159f724af9228d86f51b58b6166601`.
- Fresh branch preview alias: `https://autonomous-qabs-baseline-aud.qabs-workspace-reference-preview.pages.dev`.
- Root and selected hash URLs returned HTTP 200 in content-level scrape checks. Firecrawl does not execute the React app's client-side router, so those hash-route scrapes do NOT prove the routed page rendered; browser interaction/pixel QA remains NOT VERIFIED.
- Existing PR-2 alias `https://pr-2.qabs-workspace-reference-preview.pages.dev` remains a separate deployment; no prior deployment was overwritten. No production branch or custom domain was changed.

### Additional frontend auth handling
- Browser UI no longer returns preview password-reset or email-verification tokens, even if a backend responds with them; recovery/verification instructions must be delivered by configured mail.
- Logout always clears local UI state but now reports honestly if server-side session revocation could not be confirmed.
- Latest commit includes these changes; CI on the latest commit must be confirmed separately before considering this exact commit validated.


## 19. Fail-closed operational controls, authentication capability gate, and browser QA

### Offline write paths hardened
Added a shared `requireConnectedBackend()` guard and applied it to 44 workspace operations. The following now refuse to create synthetic local success while the backend is disconnected:
- Formation and company status/stage changes.
- Store creation, theme/details, approvals, payment activation, categories, team, products, orders, customers, discounts, shipping, pages, and sections.
- Service orders, status changes, document metadata, support tickets, notifications, and staff changes.
- Subscriptions, renewal, invoice proof verification, credit top-ups, and refunds.
- Store snapshots/restores, app installation toggles, domain verification, and system backups.
- Business-account creation and local-only formation documents.

Some capabilities with no server API at all (staff provisioning, banking, refunds, invoice generation, snapshots, template persistence, and local domain verification) are explicitly blocked even if a legacy API status later reports connected; they need their own server contracts first.

### Checkout and AI safety
- Checkout is now hard-disabled: the preview cannot create a subscription, store, invoice, payment, or credit top-up by selecting a payment method.
- Payment-method choices and the checkout action are disabled in the UI with an explicit no-charge/no-invoice notice.
- Public service-order forms show a view-only/offline notice and disable both draft-save and submit buttons. The context throws rather than inventing a local order reference.
- Formation wizard submission is disabled while the backend is disconnected; the form explicitly says no application or request is created.
- QABS AI no longer claims a connected Gemini/SQLite engine in offline preview. It clearly says prompts are not executed and credits are not deducted. Credit top-up is blocked offline.

### Auth capability gate
The AuthModal now fetches the public same-origin Studio API config and enables account actions only when:
- the legacy backend connection is healthy,
- registration is enabled,
- email verification is enabled,
- password recovery is enabled,
- and the capability check has completed.

Live read-only `GET /studio/api/config` from the isolated Worker returned HTTP 200 with:
- `registration=true`
- `emailVerification=false`
- `passwordRecovery=false`
- `formationDetails=false`
- `documents=false`
- `privateDocuments=false`
- `payments=false`
- `stage=isolated-preview`
- optional 2FA flag enabled for Studio account scope.

Therefore sign-in, registration, verification, and recovery remain disabled. The UI does not infer readiness from a login page or a successful config fetch.

### Service API client expansion
Expanded `src/services/qabsStudioApi.ts` with typed contracts for:
- services catalog and service requests,
- store drafts,
- project catalog and project workspaces,
- workspace-store options, creation, detail, and activity,
- settings read/update,
- formation-selection drafts.

Added `tests/studio-api-contract.test.ts` verifying same-origin `/studio/api` requests, `credentials: same-origin`, CSRF headers on writes, and the no-payment service-catalog contract. This client is still NOT wired into `AppContext`; partial auth-only wiring would be unsafe because the rest of the app still expects the incompatible legacy `qabsApi` contract.

### Pricing, legal, and marketing accuracy
- Removed unsupported formation volume/success/turnaround metrics from the landing page.
- Qualified non-resident eligibility and IRS EIN timing language.
- Removed claims that formation documents guarantee bank-account or payment-provider approval.
- Replaced unqualified state tax, privacy, annual-fee, and UK confirmation-statement fee claims with jurisdiction-specific caveats and official-fee verification language.
- Removed unverified "popular" and "zero-tax" state ranking filters.
- Marked state filing fees as indicative and subject to change; added general legal/tax disclaimers.

### CI and browser verification
Latest commit validated: `f802c1bea2dfe8932796fc9b58e17104dadaa319` (documentation-only follow-up after the same code passed CI).
- GitHub Actions CI run `44235610640`: SUCCESS — TypeScript/lint, API tests (12 tests, 0 failures), route/safety contract checks, build, secret scan.
- Workspace preview run `44235603874`: SUCCESS — install, lint, tests, route/safety checks, build, artifact upload, isolated Cloudflare Pages deploy.
- Pages deployment `262097a7-b4d9-4a9f-841c-374294e1e5c2` on branch `autonomous/qabs-baseline-audit-20261118`, alias `https://autonomous-qabs-baseline-aud.qabs-workspace-reference-preview.pages.dev`.
- Browser checks on the deployed branch preview: `/login`, `/signup`, `/forgot-password`, `/verify-email`, `/workspace/overview`, `/workspace/requests`, `/studio#/home`, and `/order` returned without 404. Auth forms were disabled with an explicit offline/capability notice. Public service-order draft and submit buttons were disabled. No unverified stats remained on the landing page. At 390px viewport width, document width was 375px (no horizontal overflow).
- Browser QA could not enter the authenticated workspace because auth is correctly gated; all post-login page interactions remain NOT VERIFIED.

### Current blockers — do not bypass
1. The frontend `qabsApi.ts` expects a legacy `/api/*` contract. The live isolated Studio Worker exposes `/studio/api/*`; the two are not yet unified. `qabsStudioApi.ts` covers only a subset of the total workspace operations.
2. Email verification and password recovery are disabled on the Studio Worker; documents/private documents, formation details, and payments are also disabled.
3. The acceptance Worker has no AI execution module/contract; QABS AI engine execution is NOT VERIFIED and remains disabled.
4. No real payment provider transaction, customer email, file upload, production write, or DNS change was attempted.
5. Cross-tenant tests passed in the local Express test harness, but a two-user/two-store authenticated penetration test against the Cloudflare Studio Worker remains NOT VERIFIED because no approved synthetic credentials are provisioned.

No production environment, Shopify theme/checkout, DNS, payment keys, or customer data were changed.


## 20. Authentication and document feature-flag root cause

Read-only Cloudflare Worker settings review of `qabs-stores-acceptance-preview` confirmed:
- `EMAIL_LOGIN_ENABLED=false`
- `PASSWORD_RECOVERY_ENABLED=false`
- `FORMATION_UPLOAD_ENABLED=false`
- `FORMATION_DETAILS_ENABLED=false`
- `REGISTRATION_ENABLED=true`
- `PROJECTS_ENABLED=true`
- `STORE_LINKS_ENABLED=true`
- `WORKSPACE_STORES_ENABLED=true`
- `CONSOLE_ENABLED=true`
- `GOOGLE_LOGIN_ENABLED=false`

Required email-provider bindings are absent:
- `RESEND_API_KEY`: not bound to this Worker.
- `MAIL_FROM`: not bound to this Worker.
- `EMAIL_LOGIN_ENABLED` and `PASSWORD_RECOVERY_ENABLED` are false.

The deployed Worker contains email-code login and password-recovery modules, but their readiness checks require the Resend key, sender identity, and explicit feature flags. The password recovery implementation uses a single-use short-lived token and session invalidation; it remains disabled. Do not copy secrets from another Worker, enable flags, or send test/customer emails without explicit authorization and a safe test recipient.

Formation document upload is disabled by `FORMATION_UPLOAD_ENABLED=false`; the service catalog also reports sensitive-document uploads disallowed and malware scanning unavailable. Keep uploads disabled until a server-side document vault, access checks, retention rules, and malware scanning are verified.


## 12. Studio API server contract exercise — 2026-11-18

A new isolated integration test was added at `tests/studio-server-contract.test.ts` (commit `0b07770245aafee706071d218a55c7874267f404`). It boots the Express candidate against an in-memory SQLite database and uses synthetic `.example.test` accounts only.

The test exercises:
- Studio config advertises payments and Google sign-in as disabled.
- Registration, session cookie, and `/studio/api/me` response shape.
- Per-tenant workspace discovery and workspace-store read.
- A second synthetic tenant attempting to read the first tenant's workspace receives HTTP 403 `FORBIDDEN_TENANT_ACCESS`.
- Studio logout revokes the session; the next `/studio/api/me` returns 401.

This is a source-level Express candidate test, **not** a test of the deployed Cloudflare acceptance Worker or production. CI has not yet been observed for this commit at the time this log was updated.

### Confirmed API contract gap

The inspected Express candidate currently implements Studio endpoints for config, me, login/register/logout, requests, project-workspaces, and workspace-stores (GET). The frontend Studio client additionally exposes store-draft creation, service catalogue/requests, project-workspace creation, workspace-store creation/update/activity, settings, and formation-selection endpoints. Those additional operations were not found as matching Express routes in the inspected source. The deployed acceptance Worker remains a separate implementation and must be tested independently.

Therefore:
- `qabsStudioApi` remains intentionally unwired into `AppContext`.
- The legacy `qabsApi` and Studio API must not be mixed; their session and endpoint contracts differ.
- The new test increases confidence in the subset that exists; it does not close the frontend/backend parity gap or establish Cloudflare tenant isolation.
- No live Worker, database, DNS, Shopify, payment, or production resource was changed.


## 13. Marketing capability and service-scope corrections — 2026-11-18

The public isolated preview was reviewed page-by-page. Additional unsupported or overly certain statements were replaced with eligibility-, provider-, registry-, and scope-dependent wording.

Updated areas:
- Landing page store plans are now assessment-only options. They no longer show recurring prices, product/store quotas, gateway badges, or a purchase action. The page explicitly says no subscription, payment, domain, gateway activation, or store publication is activated there.
- QABS AI cards no longer advertise 500/1,500/5,000-credit purchases, instant top-ups, or automated fulfilment. They are marked as in preparation, with no purchasable credits or active automated execution.
- Company-formation page now distinguishes QABS document/filing coordination from the registry's authority to accept filings and issue official records. Operating agreements and banking resolutions are described as drafts only when included in a confirmed scope. Packages and prices are indicative.
- EIN page now describes application-preparation assistance, not guaranteed issuance. Fixed 4–10-day and 24-hour claims, guaranteed SSN/ITIN assumptions, bank/payment eligibility claims, and automatic document-vault delivery were removed or qualified.
- Registered-agent page now conditions state coverage, address assignment, mail scanning/forwarding, commercial mail, reminders, renewal, and change-of-agent support on the selected provider's confirmed terms and availability. It no longer promises all-state coverage or same-day/instant scanning.
- US LLC page now describes selected-jurisdiction review, not universal 50-state formation availability. Tax treatment, liability separation, registry timing, EIN assistance, bank access, and provider acceptance are explicitly qualified.
- Landing, company-formation, and US LLC fee-guide labels now distinguish indicative fee references from a promise that QABS can perform a filing in every jurisdiction.
- Customizer/security copy no longer claims the highest encryption standard or strict tenant isolation as already delivered; it describes controls under development and requires technical verification before operational availability.

### Verification

- Studio server integration tests: 14 tests passed, including synthetic-account registration, Studio session/me, workspace-store access, cross-tenant workspace denial (403), logout, and payment-disabled configuration.
- Latest verified CI run before this documentation update: run 44241710903, commit `24ad77d48624584c8008132280e1f5b3634acd8c`, all steps passed (TypeScript, API tests, route/marketing checks, build, secret scan).
- Latest verified isolated Pages preview: `https://10b36908.qabs-workspace-reference-preview.pages.dev`; Firecrawl returned the home page and the company-formation, EIN, registered-agent, and US LLC pages successfully.
- The preview still contains a formation calculator and indicative price references; the checkout path remains disabled in this preview, and no payment is collected.
- `npm install` reports 3 high-severity dependency advisories. Exact affected packages and safe upgrade paths have not yet been established; do not run a blanket `npm audit fix --force`.

### Still not complete / blocked

- The Studio API is not wired into `AppContext`; the client and the Express candidate have partial endpoint parity, while the Cloudflare acceptance Worker is a separate runtime.
- Worker feature flags still disable important email verification/recovery, document, and other operational paths; these must be verified per environment before enabling.
- No end-to-end test has established full production-grade tenant isolation, file upload security, billing/subscription lifecycle, custom domains, domain purchase, store publication, or live checkout.
- No live production deployment, DNS change, Shopify theme change, payment activation, or customer communication was performed.
- Dependency advisory triage remains open.


## 14. Dependency audit and development-server hardening — 2026-11-18

- Moved `vite`, `@vitejs/plugin-react`, and `@tailwindcss/vite` into `devDependencies`; pinned the Vite toolchain floor to Vite `^8.3.8` and React plugin `^6.3.0`.
- Changed the Vite development server from `0.0.0.0` to `127.0.0.1` and removed `allowedHosts: true`. Added a route/safety check that fails if the dev server binds to all interfaces or allows every host.
- Replaced the misleading CI message “100% clean” with an explicit statement that the secret-pattern scan is limited and is not a complete security audit.
- Added a non-blocking full dependency audit and a separate production-only audit to CI.

### Dependency audit result (run 44242536778, commit `e1927f13e3a968a74a05a6757becec94d9a7b87c`)

- Full dependency tree: 5 high findings, 0 critical/moderate/low.
- Production-only dependency tree: 0 findings at all severities.
- The five high entries all trace through the Vite build-tool dependency chain to Picomatch's ReDoS advisory GHSA-fc5q-39xc-vjpf. The advisory is unreviewed and currently lists no supported package/fixed-version metadata. A suggested npm downgrade to Vite 6.2.7 is a major downgrade and was not applied.
- The Vite 8.3.8 baseline is above the Vite advisory's patched release 8.3.7 for GHSA-p4f5-76q4-ffq7. The dev server is also loopback-only now.
- This does **not** mean the full development dependency tree is vulnerability-free. Keep the Picomatch advisory open for reassessment when upstream publishes a fix or reliable affected-version metadata. Do not expose the Vite dev server to the public network.

CI run 44242536778 completed successfully (TypeScript, tests, route/marketing checks, build, secret scan, and both audit reports). The audit step is informational/non-blocking; the five development-tool findings remain visible.


## 14. Studio capability-advertisement hardening — 2026-11-18

A concrete backend/frontend capability mismatch was found: the Express Studio /studio/api/config endpoint advertised email verification and password recovery as enabled even when the isolated Cloudflare acceptance Worker had those flows disabled and no mail credentials configured. This could make the UI offer actions the runtime cannot reliably complete.

Changes committed on the isolated branch:
- Email verification and password recovery now default to disabled.
- Each can be enabled only when its explicit opt-in environment flag (QABS_EMAIL_VERIFICATION_ENABLED=true or QABS_PASSWORD_RECOVERY_ENABLED=true) is set AND RESEND_API_KEY is present.
- Formation details, document upload, and private-document capabilities are explicitly reported disabled in this Express preview contract until implemented and independently verified.
- The Studio server contract test now asserts these capabilities remain disabled under the default test environment.

This is a fail-closed capability-advertisement correction only. It does not configure mail, enable authentication flows, add file storage, or alter any Cloudflare Worker. CI has not yet been observed for these new commits; the changes are not considered verified until the workflow passes.
