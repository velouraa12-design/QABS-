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
