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
  const routePath = incomingUrl.pathname.replace(/\\/+$/, '');
  const isMutation = !['GET', 'HEAD', 'OPTIONS'].includes(method);
  if (isMutation && request.headers.get('Origin') !== incomingUrl.origin) {
    return Response.json({ error: 'origin_rejected' }, { status: 403 });
  }

  // The preview API currently has no verified-email delivery configured.
  // Never allow direct API callers to create an unverified session through the
  // preview host, even if the upstream Worker has a stale registration flag.
  if (method === 'POST' && routePath === '/studio/api/auth/register') {
    return Response.json({
      error: 'Registration is disabled until email verification is configured.',
      code: 'REGISTRATION_DISABLED'
    }, { status: 503 });
  }

  if (!env?.QABS_STUDIO_API || typeof env.QABS_STUDIO_API.fetch !== 'function') {
    return Response.json({ error: 'preview_api_binding_missing' }, { status: 503 });
  }

  try {
    const target = new URL(incomingUrl.pathname + incomingUrl.search, UPSTREAM_ORIGIN);
    const upstream = new Request(target, request);
    const headers = new Headers(upstream.headers);
    headers.set('Origin', API_ORIGIN);
    headers.delete('Host');
    const response = await env.QABS_STUDIO_API.fetch(new Request(upstream, { headers }));

    // Expose effective preview capabilities, not stale upstream flags.
    if (method === 'GET' && routePath === '/studio/api/config' && response.ok) {
      try {
        const config = await response.clone().json() as Record<string, unknown>;
        if (config.registration === true && config.emailVerification !== true) {
          config.registration = false;
          const responseHeaders = new Headers(response.headers);
          responseHeaders.delete('content-length');
          responseHeaders.delete('content-encoding');
          return new Response(JSON.stringify(config), {
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders
          });
        }
      } catch {
        // Preserve the upstream response if it is not valid JSON.
      }
    }
    return response;
  } catch (error) {
    console.error('QABS preview API proxy failed:', error instanceof Error ? error.name : 'unknown');
    return Response.json({ error: 'preview_api_unavailable' }, { status: 502 });
  }
}
