# QABS isolated Node preview runtime

The Express API is a Node runtime, not a Pages Functions bundle. It imports `node:sqlite` and uses the `qabs_session` cookie plus the QABS tenant-scoped SQLite schema. Do not point the frontend at the existing `/api/platform/*` staging Worker: that Worker has a different API/auth contract and database.

## Container

- `Dockerfile`: Node 22.18 runtime, builds the SPA, runs the existing Express API, and exposes `/api/health`.
- `.dockerignore`: excludes local environment files, databases, and build artifacts.
- Mount a persistent volume at `/data`; SQLite is configured at `/data/qabs.sqlite`.

Build and smoke-test locally:

```sh
docker build -t qabs-preview .
docker run --rm -p 3000:3000 -v qabs-preview-data:/data \
  -e NODE_ENV=production \
  -e QABS_DB_PATH=/data/qabs.sqlite \
  -e QABS_ALLOW_SANDBOX_PAYMENTS=false \
  qabs-preview
curl -fsS http://127.0.0.1:3000/api/health
```

## Required isolated deployment settings

Set these only in the preview service secret/environment manager:

- `NODE_ENV=production`
- `QABS_DB_PATH=/data/qabs.sqlite`
- `QABS_ALLOW_SANDBOX_PAYMENTS=false` until API/auth/invoice tests pass.
- `APP_ORIGIN` to the exact preview origin. The Render Blueprint maps this to Render's generated `RENDER_EXTERNAL_URL`, so the SPA and API remain same-origin.
- `TAP_SECRET_KEY` only if a disposable Tap test key is approved.
- `TAP_WEBHOOK_URL` to the public HTTPS URL ending exactly in `/api/payments/tap/webhook`.
- Enable `QABS_ALLOW_SANDBOX_PAYMENTS=true` only after isolated runtime, persistent storage, authentication, tenant isolation, invoice reconciliation, and webhook reachability are verified.
- Store email credentials in the provider secret manager; never commit them.

## Deployment gate

This change does not create a hosting service, attach a paid persistent disk, configure secrets, alter DNS, or deploy anything. Those actions require an explicitly selected/authorized hosting target and credentials. Do not use the existing Cloudflare staging Worker as a substitute. Keep production payments disabled.

## Acceptance checklist

1. Confirm a durable persistent volume at `/data`; a container filesystem alone is not durable.
2. Confirm `GET /api/health` reports the preview API.
3. Confirm `GET /api/auth/session` returns unauthenticated safely.
4. Register a dedicated test tenant; verify the `qabs_session` HttpOnly cookie and CSRF flow.
5. Confirm a second tenant cannot read or mutate the first tenant's stores, requests, documents, or invoices.
6. Confirm invoice reads and updates are tenant-scoped.
7. Keep Tap disabled until the previous checks pass; then use Tap test mode and verify the signed webhook end-to-end.
8. Confirm restart persistence, rate limiting, backup/restore, and logs do not expose secrets or private documents.
9. Do not merge this PR or deploy to production without explicit approval.

## Optional free preview blueprint (non-durable acceptance only)

The root `render.yaml` defines a free Docker web service with payments disabled, auto-deploy disabled, and no custom domain. It maps `APP_ORIGIN` to the service's generated HTTPS `RENDER_EXTERNAL_URL`. It is suitable only for temporary API/authentication smoke tests. Render free services spin down after inactivity and their local filesystem is ephemeral; the configured SQLite file under `/tmp` can be lost on restart, spin-down, or redeploy. Do not store real customer records or documents there, do not enable Tap, and do not treat this as production or durable staging.

To create it, the repository owner must import the existing GitHub repository into Render and explicitly create the Blueprint. This repository change alone does not create the service. A durable environment requires a paid persistent disk or migration to a managed persistent database; no paid resource is provisioned by this change.

Render documents these free-tier limits and disk requirements:
- Free web service limitations: https://render.com/docs/free
- Persistent disks: https://render.com/docs/disks
