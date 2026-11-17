/**
 * QABS unified API client.
 *
 * The workspace currently has a local demo data provider. This client is the
 * single typed boundary for the QABS service API when VITE_QABS_API_BASE_URL
 * is configured. It never initiates payments or activates external gateways.
 */
export type ApiError = Error & { status?: number; code?: string };

const API_BASE = (import.meta.env.VITE_QABS_API_BASE_URL || '').replace(/\/$/, '');
const TOKEN_KEY = 'qabs_session_token';

export const qabsApiConfigured = Boolean(API_BASE);

function headers(extra: HeadersInit = {}): Headers {
  const result = new Headers(extra);
  result.set('Accept', 'application/json');
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (token) result.set('Authorization', `Bearer ${token}`);
  return result;
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  if (!API_BASE) {
    const error = new Error('QABS_API_NOT_CONFIGURED') as ApiError;
    error.code = 'QABS_API_NOT_CONFIGURED';
    throw error;
  }

  const response = await fetch(`${API_BASE}${path.startsWith('/') ? path : `/${path}`}`, {
    ...init,
    credentials: 'include',
    headers: headers(init.headers)
  });

  const payload = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(payload?.error || payload?.message || `HTTP_${response.status}`) as ApiError;
    error.status = response.status;
    error.code = payload?.code || payload?.error;
    throw error;
  }
  return payload as T;
}

export interface QabsSession {
  token?: string;
  user: { id: string; name: string; email: string; role: string };
}

export const qabsApi = {
  health: () => apiRequest<{ status: string; service?: string }>('/api/health'),
  session: () => apiRequest<QabsSession>('/api/auth/session'),
  login: (email: string, password: string) =>
    apiRequest<QabsSession>('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    }),
  register: (input: { name: string; email: string; password: string; companyName?: string }) =>
    apiRequest<QabsSession>('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    }),
  logout: () => apiRequest<{ success: boolean }>('/api/auth/logout', { method: 'POST' }),
  profile: () => apiRequest<{ user: QabsSession['user'] }>('/api/auth/profile'),
  formations: () => apiRequest<{ formations: unknown[] }>('/api/formations'),
  stores: () => apiRequest<{ stores: unknown[] }>('/api/stores'),
  subscriptions: () => apiRequest<{ subscriptions: unknown[] }>('/api/subscriptions'),
  invoices: () => apiRequest<{ invoices: unknown[] }>('/api/invoices'),
  notifications: () => apiRequest<{ notifications: unknown[] }>('/api/notifications'),
  supportTickets: () => apiRequest<{ tickets: unknown[] }>('/api/support/tickets')
};
