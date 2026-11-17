/**
 * QABS Studio API client for the deployed /studio route.
 * Studio uses an HttpOnly __Host-qdp_session cookie and CSRF token.
 * It does not use the legacy Bearer-token client in qabsApi.ts.
 *
 * IMPORTANT: the public Pages preview is a different origin and cannot use
 * the portal's SameSite=Strict cookie. Use only from portal.qabs1.store/studio.
 * This client is not wired into AppContext until authenticated ownership and
 * tenant-isolation tests pass. No financial or irreversible writes are exposed.
 */
export type StudioApiError = Error & { status?: number; code?: string };

export interface StudioUser {
  id: string;
  email: string;
  role: string;
  emailVerified: boolean;
  csrf: string;
}
export interface StudioConfig {
  states?: string[];
  entities?: string[];
  registration?: boolean;
  emailVerification?: boolean;
  passwordRecovery?: boolean;
  emailCodeLogin?: boolean;
  googleSignIn?: boolean;
  payments?: boolean;
  stage?: string;
  [key: string]: unknown;
}
export interface StudioRequest {
  id: string;
  entity: string;
  state: string;
  company_name: string;
  status: string;
  payment_status: string;
  revision: number;
  created_at: string;
  updated_at: string;
}
export interface StudioProjectWorkspace {
  id: string;
  name: string;
  role: string;
  display_name?: string;
}
export interface StudioWorkspaceStore {
  id: string;
  name: string;
  [key: string]: unknown;
}
export interface WorkspaceStoreFilters {
  status?: 'active' | 'archived';
  lifecycle?: 'all' | 'setup_draft' | 'configured_draft';
  kind?: 'all' | 'physical' | 'digital' | 'mixed';
  q?: string;
  offset?: number;
}

const API_PREFIX = '/studio/api';
let csrfToken: string | null = null;

function endpoint(path: string): string {
  return `${API_PREFIX}${path.startsWith('/') ? path : `/${path}`}`;
}
async function request<T>(path: string, init: RequestInit = {}, requireCsrf = false): Promise<T> {
  const method = (init.method || 'GET').toUpperCase();
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (init.body !== undefined && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  if (requireCsrf && !['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    if (!csrfToken) csrfToken = (await studioApi.me()).csrf;
    headers.set('X-CSRF-Token', csrfToken);
  }

  const response = await fetch(endpoint(path), {
    ...init, method, headers, credentials: 'same-origin', cache: 'no-store'
  });
  const payload = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401) csrfToken = null;
    const error = new Error(payload?.error || payload?.message || `HTTP_${response.status}`) as StudioApiError;
    error.status = response.status;
    error.code = payload?.code || payload?.error;
    throw error;
  }
  return payload as T;
}
function queryString(values: Record<string, string | number | undefined>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value !== '') params.set(key, String(value));
  }
  const query = params.toString();
  return query ? `?${query}` : '';
}

export const studioApi = {
  config: () => request<StudioConfig>('/config'),
  me: async () => {
    const session = await request<StudioUser>('/me');
    csrfToken = session.csrf;
    return session;
  },
  login: async (email: string, password: string) => {
    csrfToken = null;
    return request<{ ok: boolean }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  },
  register: async (email: string, password: string) => {
    csrfToken = null;
    return request<{ ok: boolean }>('/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) });
  },
  logout: async () => {
    const result = await request<{ ok: boolean }>('/auth/logout', { method: 'POST' }, true);
    csrfToken = null;
    return result;
  },
  requests: () => request<{ requests: StudioRequest[] }>('/requests'),
  projectWorkspaces: () => request<{ workspaces: StudioProjectWorkspace[] }>('/project-workspaces'),
  workspaceStores: (workspaceId: string, filters: WorkspaceStoreFilters = {}) => {
    if (!workspaceId) {
      const error = new Error('workspace_id_required') as StudioApiError;
      error.code = 'workspace_id_required';
      throw error;
    }
    return request<{
      stores: StudioWorkspaceStore[];
      next_offset: number | null;
      counts: Record<string, number | boolean>;
      canonical_source: string;
      operational_commerce_migrated: boolean;
    }>(`/workspace-stores${queryString({
      workspace_id: workspaceId,
      status: filters.status,
      lifecycle: filters.lifecycle,
      kind: filters.kind,
      q: filters.q,
      offset: filters.offset
    })}`);
  }
};
