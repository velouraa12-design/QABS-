# QABS Cloudflare Preview API Bridge

The isolated Pages preview uses a same-origin Functions bridge for the existing Studio API. The bridge is intentionally limited to the Pages **preview** environment.

## Request path

`Browser → qabs-workspace-reference-preview Pages Function → QABS_STUDIO_API service binding → qabs-unified-workspace-staging-v2 → API service binding → qabs-stores-acceptance-preview → isolated D1`

- Pages Function route: `/studio/api/*`.
- Preview binding: `QABS_STUDIO_API`.
- Router Worker: `qabs-unified-workspace-staging-v2`.
- API Worker: `qabs-stores-acceptance-preview`.
- The Pages Function forwards the request body, HttpOnly session cookie, CSRF header, and response Set-Cookie header.
- State-changing requests require the browser Origin to equal the Pages request origin. The bridge then rewrites Origin to the API's configured `APP_ORIGIN`, because the API validates that origin itself.
- No API key or other secret is embedded in the Pages Function or browser bundle.

## Isolation

- The service binding is configured only under Pages `deployment_configs.preview.services`.
- The production Pages configuration has no `QABS_STUDIO_API` binding.
- The existing API Worker continues using its existing staging D1 database. The Express API and its `qabs_session` cookie are separate contracts; do not merge them or point the frontend at the Express API without a tested migration.
- The preview remains non-payment: API config reports `payments:false`.
- No live payment, Shopify checkout, domain, or production setting is enabled by this bridge.

## Verification

The branch CI tests the Function's request forwarding, cookie and CSRF preservation, and cross-origin mutation rejection. The deployed preview's public config endpoint returns 200; unauthenticated `/studio/api/me`, `/studio/api/auth/session`, and protected workspace/service endpoints return 401 as expected.

## Features that remain gated by API environment

The API currently reports registration enabled, but email verification, password recovery, email-code login, Google sign-in, formation details, and private documents are not ready in this staging Worker. Keep those controls disabled until the required mail provider settings, encryption key, document storage binding, and end-to-end tests are available. Payment remains disabled. Do not copy secrets from another Worker or reuse a different D1 database to bypass these gates.
