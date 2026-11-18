const API_ORIGIN = 'https://qabs-stores-acceptance-preview.qabs1store.workers.dev';
const UPSTREAM_ORIGIN = 'https://qabs-unified-workspace-staging-v2.qabs1store.workers.dev';

interface Env {
  QABS_STUDIO_API: {
    fetch(request: Request): Promise<Response>;
  };
}

interface PagesRequestContext {
  request: Request;
  env: Env;
}

/**
 * Same-origin bridge from the isolated Pages preview to the existing QABS
 * Studio API. The upstream Origin is rewritten only after validating that the
 * browser request originated from this Pages deployment. Session cookies and
 * CSRF headers are forwarded unchanged; no credentials are stored here.
 */
export async function onRequest({ request, env }: PagesRequestContext): Promise<Response> {
  const method = request.method.toUpperCase();
  if (!['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'].includes(method)) {
    return Response.json({ error: 'method_not_allowed' }, { status: 405 });
  }

  const incomingUrl = new URL(request.url);
  const isMutation = !['GET', 'HEAD', 'OPTIONS'].includes(method);
  if (isMutation && request.headers.get('Origin') !== incomingUrl.origin) {
    return Response.json({ error: 'origin_rejected' }, { status: 403 });
  }

  const target = new URL(incomingUrl.pathname + incomingUrl.search, UPSTREAM_ORIGIN);
  const upstream = new Request(target, request);
  const headers = new Headers(upstream.headers);
  headers.set('Origin', API_ORIGIN);
  headers.delete('Host');

  return env.QABS_STUDIO_API.fetch(new Request(upstream, { headers }));
}
