# QABS Cloudflare Preview API Bridge

The isolated Pages project uses a same-origin Functions bridge for the existing Studio API. Its `production` and `preview` Pages deployment environments both point only to the dedicated QABS staging API; this Pages project's production label is not the QABS customer production site.

## Request path

`Browser → qabs-workspace-reference-preview Pages Function → QABS_STUDIO_API service binding → qabs-unified-workspace-staging-v2 → API service binding → qabs-stores-acceptance-preview → isolated D1`

- Pages Function route: `/studio/api/*`.
- Pages bindings: `QABS_STUDIO_API` in both `env.preview` and `env.production` of the isolated `qabs-workspace-reference-preview` project.
- Router Worker: `qabs-unified-workspace-staging-v2`.
- API Worker: `qabs-stores-acceptance-preview`.
- The Pages Function forwards the request body, HttpOnly session cookie, CSRF header, and response Set-Cookie header.
- State-changing requests require the browser Origin to equal the Pages request origin. The bridge then rewrites Origin to the API's configured `APP_ORIGIN`, because the API validates that origin itself.
- No API key or other secret is embedded in the Pages Function or browser bundle.

## Isolation

- The `QABS_STUDIO_API` service binding is configured in both `env.preview.services` and `env.production.services` of this dedicated Pages project. Its `production` label is isolated to this preview project and is not the real QABS production site.
- The existing API Worker continues using its existing staging D1 database. The Express API and its `qabs_session` cookie are separate contracts; do not merge them or point the frontend at the Express API without a tested migration.
- The preview remains non-payment: API config reports `payments:false`.
- No live payment, Shopify checkout, domain, or production setting is enabled by this bridge.

## Verification

The branch CI tests the Function's request forwarding, cookie and CSRF preservation, and cross-origin mutation rejection. After deployment, the workflow smoke-tests the stable `https://studio-preview.qabs1.store` alias (not a stale preview-branch alias), requiring the public config endpoint to return 200, unauthenticated `/studio/api/me` to return 401, and cross-origin mutations to return 403.

## Features that remain gated by API environment

The staging Worker does not have a configured transactional email provider (`RESEND_API_KEY` and `MAIL_FROM`), so email verification and password recovery are unavailable. `REGISTRATION_ENABLED` is explicitly set to `false` on `qabs-stores-acceptance-preview`; the Pages bridge independently rejects direct `/studio/api/auth/register` calls and masks any stale registration flag in the public config response. The effective preview config must report `registration:false`, `emailVerification:false`, and `passwordRecovery:false`. Email-code login, Google sign-in, formation details, and private documents also remain disabled until their required settings, bindings, and end-to-end tests are available. Payment remains disabled. Do not copy secrets from another Worker or reuse a different D1 database to bypass these gates.
