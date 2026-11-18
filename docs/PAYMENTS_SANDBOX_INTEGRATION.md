# QABS payment gateway — Tap sandbox integration

Status: implemented in the isolated development branch; not enabled on the preview or production runtime.

## What is implemented

- Server-side Tap hosted checkout creation through `POST /api/payments/tap/charges`.
- The request accepts only an invoice ID. Amount, currency, invoice number and customer identity are loaded from the authenticated tenant's own invoice and session.
- The adapter refuses missing or live Tap keys. Only a key beginning with `sk_test` is accepted.
- The hosted checkout uses `src_all`, 3-D Secure, and `save_card=false`.
- The provider redirect is HTTPS and is derived from the configured `APP_ORIGIN`; callers cannot supply an arbitrary return URL.
- Server-side reconciliation through `POST /api/payments/tap/verify`. The browser redirect alone is not trusted.
- The invoice is marked paid only when the provider lookup reports `CAPTURED`, `live_mode=false`, and the amount, currency, invoice ID and invoice number all match.
- The payment reference is tenant-scoped and duplicate attempts are rejected while an earlier Tap reference is attached.
- Provider error bodies and secret keys are never returned to the client.

## Explicit enablement for a disposable preview

Configure these only in a non-production preview environment:

```env
APP_ORIGIN=https://preview.qabs1.store
QABS_ALLOW_SANDBOX_PAYMENTS=true
TAP_SECRET_KEY=sk_test_...
```

Do not configure `sk_live_...` in this integration. `QABS_ALLOW_SANDBOX_PAYMENTS` defaults to false. Production payment collection remains disabled.

## API flow

1. Authenticated client sends `POST /api/payments/tap/charges` with `{ "invoiceId": "..." }` and the normal session cookie + CSRF token.
2. API returns a Tap hosted `redirectUrl` and a `chargeId`; it does not mark the invoice paid.
3. After the customer returns, the authenticated client sends `POST /api/payments/tap/verify` with `{ "invoiceId": "...", "chargeId": "chg_..." }`.
4. The server fetches the charge directly from Tap and reconciles it against the invoice. Only a captured sandbox charge can change the preview invoice to paid.

## Not yet complete

- The customer-facing checkout UI and `/payment/return` page are not yet wired to these endpoints.
- Tap webhook hash-string verification and asynchronous event handling are not yet implemented.
- Moyasar, Stripe and PayPal remain status-only/gated; this commit does not enable them.
- No live keys, live charges, refunds, payouts, payment-account activation or production changes are included.
- Provider sandbox credentials are not present in this repository and no external payment request was made by CI.

## Validation

The Tap adapter tests mock the provider transport and cover test-key enforcement, input validation, hosted checkout payload, safe provider errors, charge retrieval and normalized verification fields. They do not represent a live provider acceptance test.
