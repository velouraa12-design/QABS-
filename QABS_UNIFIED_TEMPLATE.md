# QABS Unified Template — Working Baseline

## Canonical source
This repository is the canonical **frontend and workspace template** for QABS:
- React 19 + Vite + TypeScript.
- Arabic-first RTL with English LTR.
- Navy / warm-gold visual identity.
- One workspace shell for formation, compliance, stores, billing, AI, and support.
- One API boundary at `src/services/qabsApi.ts`.
- Complete scope and release gates: see `QABS_PLATFORM_MODULES.md`.

## Current implementation truth
- The workspace UI is present and the approved layout is available on the preview branch.
- The current `AppContext` still initializes most business entities from `src/data/mockData.ts` and keeps mutations in browser memory. It is therefore a **visual / interaction preview**, not yet a production-connected dashboard.
- `velouraa12-design/-qwer` contains a separate Express API implementation. It currently persists to a local JSON file (`data/qabs_storage.json`), so it is not a Cloudflare Worker/D1 deployment and must not be deployed as one without adaptation.
- The API client deliberately requires `VITE_QABS_API_BASE_URL`. With no URL configured, it fails closed instead of pretending that local demo data was saved remotely.
- The API client route names are a proposed frontend contract and must be verified against the Express/Worker routes before enabling the connection.
- Payment collection, gateway activation, Shopify credentials, DNS, and production routing are out of scope for this preview.

## Unified product scope
The master register includes the customer workspace, multi-store commerce, company formation, compliance, document vault, domains, payment-connection tracking, business-account applications, subscriptions, billing and credits, AI Studio, branding, marketing, support, and internal operations/admin. Each feature must show its real readiness state; a menu item does not mean its backend is operational.

## Runtime configuration
Set `VITE_QABS_API_BASE_URL` only to a tested staging API origin. Do not put API keys, database credentials, or other secrets in Vite variables: values prefixed with `VITE_` are public in the browser bundle.

## Preview acceptance checklist
1. Build completes without errors.
2. Direct hash routes under `#/workspace/*` load and browser back/forward works.
3. Arabic RTL and English LTR render correctly.
4. Mobile layout has no horizontal overflow.
5. API health/session calls are tested against a staging service before switching the UI off mock data.
6. Tenant isolation, role permissions, document vault, and persistence pass backend tests before any live use.
7. D1 migrations and Worker bindings are tested on isolated preview resources.
8. Payment, Shopify checkout, payout, DNS and production-publish actions remain blocked pending separate approval.

## Related source
- Frontend: `velouraa12-design/Qabs-123`
- Backend candidate for review/adaptation: `velouraa12-design/-qwer`
- Existing workspace reference PR: #44
- Unified template/API boundary PR: #46
