import { createHmac, timingSafeEqual } from 'node:crypto';

export interface TapSandboxChargeInput {
  amount: number;
  currency: string;
  description: string;
  invoiceId: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  redirectUrl: string;
  webhookUrl?: string;
}

export interface TapSandboxChargeResult {
  id: string;
  status: string;
  redirectUrl: string;
}

type FetchLike = typeof fetch;

export function isTapTestSecret(secretKey: string | undefined): boolean {
  return Boolean(secretKey && secretKey.startsWith('sk_test'));
}

export async function createTapSandboxCharge(
  input: TapSandboxChargeInput,
  secretKey: string | undefined,
  fetchImpl: FetchLike = fetch
): Promise<TapSandboxChargeResult> {
  if (!isTapTestSecret(secretKey)) {
    throw new Error('TAP_SANDBOX_KEY_REQUIRED');
  }
  if (!Number.isFinite(input.amount) || input.amount <= 0 || input.amount > 1000000) {
    throw new Error('INVALID_PAYMENT_AMOUNT');
  }
  if (!/^[A-Z]{3}$/.test(input.currency)) {
    throw new Error('INVALID_PAYMENT_CURRENCY');
  }
  if (!input.invoiceId || !input.invoiceNumber || !input.customerEmail || !input.redirectUrl.startsWith('https://')) {
    throw new Error('INVALID_PAYMENT_CONTEXT');
  }

  const nameParts = input.customerName.trim().split(/\\s+/).filter(Boolean);
  const firstName = nameParts[0] || 'QABS';
  const lastName = nameParts.slice(1).join(' ') || 'Customer';
  const response = await fetchImpl('https://api.tap.company/v2/charges/', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
      accept: 'application/json',
      lang_code: 'en'
    },
    body: JSON.stringify({
      amount: input.amount,
      currency: input.currency,
      customer_initiated: true,
      threeDSecure: true,
      save_card: false,
      description: input.description.slice(0, 120),
      reference: {
        transaction: input.invoiceId,
        order: input.invoiceNumber
      },
      customer: {
        first_name: firstName,
        last_name: lastName,
        email: input.customerEmail
      },
      source: { id: 'src_all' },
      redirect: { url: input.redirectUrl },
      ...(input.webhookUrl ? { post: { url: input.webhookUrl } } : {})
    })
  });

  const payload = await response.json().catch(() => ({})) as Record<string, any>;
  if (!response.ok) {
    // Never forward provider response bodies: they may contain account or payment metadata.
    throw new Error(response.status === 401 || response.status === 403 ? 'TAP_SANDBOX_AUTH_FAILED' : 'TAP_SANDBOX_REQUEST_FAILED');
  }

  const id = typeof payload.id === 'string' ? payload.id : '';
  const redirectUrl = typeof payload.transaction?.url === 'string'
    ? payload.transaction.url
    : typeof payload.redirect?.url === 'string'
      ? payload.redirect.url
      : '';
  if (!id || !redirectUrl.startsWith('https://')) {
    throw new Error('TAP_SANDBOX_INVALID_RESPONSE');
  }
  return {
    id,
    status: typeof payload.status === 'string' ? payload.status : 'INITIATED',
    redirectUrl
  };
}

export interface TapSandboxVerifiedCharge {
  id: string;
  status: string;
  liveMode: boolean;
  amount: number;
  currency: string;
  transactionReference: string;
  orderReference: string;
}

export async function retrieveTapSandboxCharge(
  chargeId: string,
  secretKey: string | undefined,
  fetchImpl: FetchLike = fetch
): Promise<TapSandboxVerifiedCharge> {
  if (!isTapTestSecret(secretKey)) {
    throw new Error('TAP_SANDBOX_KEY_REQUIRED');
  }
  if (!/^chg_[A-Za-z0-9]+$/.test(chargeId)) {
    throw new Error('INVALID_TAP_CHARGE_ID');
  }
  const response = await fetchImpl(`https://api.tap.company/v2/charges/${encodeURIComponent(chargeId)}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      accept: 'application/json'
    }
  });
  const payload = await response.json().catch(() => ({})) as Record<string, any>;
  if (!response.ok) {
    throw new Error(response.status === 401 || response.status === 403 ? 'TAP_SANDBOX_AUTH_FAILED' : 'TAP_SANDBOX_REQUEST_FAILED');
  }
  if (payload.id !== chargeId || typeof payload.status !== 'string') {
    throw new Error('TAP_SANDBOX_INVALID_RESPONSE');
  }
  return {
    id: payload.id,
    status: payload.status,
    liveMode: payload.live_mode === true,
    amount: Number(payload.amount),
    currency: String(payload.currency || '').toUpperCase(),
    transactionReference: String(payload.reference?.transaction || ''),
    orderReference: String(payload.reference?.order || '')
  };
}


export interface TapWebhookPayload {
  id?: unknown;
  object?: unknown;
  live_mode?: unknown;
  status?: unknown;
  amount?: unknown;
  currency?: unknown;
  reference?: { gateway?: unknown; payment?: unknown; transaction?: unknown; order?: unknown };
  transaction?: { created?: unknown };
}

function tapCurrencyMinorUnits(currency: string): number {
  return ['BHD', 'IQD', 'JOD', 'KWD', 'OMR', 'TND'].includes(currency.toUpperCase()) ? 3 : 2;
}

export function verifyTapWebhookHashstring(
  payload: TapWebhookPayload,
  receivedHash: string | undefined,
  secretKey: string | undefined
): boolean {
  if (!isTapTestSecret(secretKey) || !receivedHash || !/^[a-f0-9]{64}$/i.test(receivedHash)) return false;
  if (typeof payload.id !== 'string' || typeof payload.status !== 'string' ||
      typeof payload.currency !== 'string' || !Number.isFinite(Number(payload.amount)) ||
      typeof payload.transaction?.created !== 'string' && typeof payload.transaction?.created !== 'number') return false;
  const currency = payload.currency.toUpperCase();
  const amount = Number(payload.amount).toFixed(tapCurrencyMinorUnits(currency));
  const reference = payload.reference || {};
  const hashInput =
    'x_id' + payload.id +
    'x_amount' + amount +
    'x_currency' + currency +
    'x_gateway_reference' + String(reference.gateway || '') +
    'x_payment_reference' + String(reference.payment || '') +
    'x_status' + payload.status +
    'x_created' + String(payload.transaction?.created);
  const expected = createHmac('sha256', secretKey).update(hashInput, 'utf8').digest();
  const received = Buffer.from(receivedHash, 'hex');
  return received.length === expected.length && timingSafeEqual(received, expected);
}
