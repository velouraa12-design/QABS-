# QABS payment gateway — Tap sandbox integration

Status: implemented in the isolated development branch; not enabled on the preview or production runtime.

## What is implemented

- Server-side Tap hosted checkout creation through `POST /api/payments/tap/charges`.
- The request accepts only an invoice ID. Amount, currency, invoice number and customer identity are loaded from the authenticated tenant's own invoice and session.
- The adapter refuses missing or live Tap keys. Only a key beginning with `sk_test` is accepted.
- The hosted checkout uses `src_all`, 3-D Secure, and `save_card=false`.
- The provider redirect is HTTPS and is derived from the configured `APP_ORIGIN`; callers cannot supply an arbitrary return URL.
- The Tap `post.url` is configured independently through `TAP_WEBHOOK_URL`; it must be an HTTPS URL with the exact `/api/payments/tap/webhook` path. Payment initiation and the UI capability flag remain disabled until this endpoint is configured.
- Server-side reconciliation through `POST /api/payments/tap/verify`. The browser redirect alone is not trusted.
- Signed Tap server-to-server webhook endpoint at `POST /api/payments/tap/webhook`, configured as the charge `post.url` and verified with Tap's HMAC-SHA256 `hashstring` header using constant-time comparison.
- Webhook invoice reconciliation is idempotent and requires the charge ID, invoice ID, invoice number, amount, currency, captured status, and sandbox `live_mode=false` to match.
- The invoice is marked paid only when the provider lookup reports `CAPTURED`, `live_mode=false`, and the amount, currency, invoice ID and invoice number all match.
- The payment reference is tenant-scoped and duplicate attempts are rejected while an earlier Tap reference is attached.
- Provider error bodies and secret keys are never returned to the client.

## Explicit enablement for a disposable preview

Configure these only in a non-production preview environment:

```env
APP_ORIGIN=https://preview.qabs1.store
QABS_ALLOW_SANDBOX_PAYMENTS=true
TAP_SECRET_KEY=sk_test_...
TAP_WEBHOOK_URL=https://<public-api-host>/api/payments/tap/webhook
```

Do not configure `sk_live_...` in this integration. `QABS_ALLOW_SANDBOX_PAYMENTS` defaults to false. Production payment collection remains disabled.

## API flow

1. Authenticated client sends `POST /api/payments/tap/charges` with `{ "invoiceId": "..." }` and the normal session cookie + CSRF token.
2. API returns a Tap hosted `redirectUrl` and a `chargeId`; it does not mark the invoice paid.
3. Tap redirects the customer to `/payment/return?invoice=...&tap_id=...`; the React return page calls the authenticated verification endpoint and refreshes the invoice list.
4. Tap also posts asynchronously to `/api/payments/tap/webhook`; the server verifies `hashstring` before reconciling the invoice.
5. The verification endpoint fetches the charge directly from Tap. Both browser-return verification and signed webhook reconciliation require a captured sandbox charge and exact invoice binding before marking it paid.

## Remaining acceptance work

- The UI and webhook implementation are committed to the isolated branch, but have not yet been run against Tap's external sandbox with provider credentials.
- Configure a disposable `sk_test_...` key, `TAP_WEBHOOK_URL` pointing to the publicly reachable API runtime, and `QABS_ALLOW_SANDBOX_PAYMENTS=true` only in the isolated preview secret store after an authorized operator confirms the account and test window. Do not point `TAP_WEBHOOK_URL` at the static Pages frontend unless that host actually routes the webhook path to the API.
- Moyasar, Stripe and PayPal remain status-only/gated; this commit does not enable them.
- No live keys, live charges, refunds, payouts, payment-account activation or production changes are included.
- Provider sandbox credentials are not present in this repository and no external payment request was made by CI.

## Validation

The Tap adapter tests mock the provider transport and cover test-key enforcement, input validation, hosted checkout payload, safe provider errors, charge retrieval, HMAC hashstring verification and normalized verification fields. Route tests cover authenticated charge creation, amount derivation from the tenant invoice, signed webhook reconciliation, invalid signature rejection, CSRF enforcement and browser-return verification. They do not represent a live provider acceptance test.
