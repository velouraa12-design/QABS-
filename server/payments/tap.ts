export interface TapSandboxChargeInput {
  amount: number;
  currency: string;
  description: string;
  invoiceId: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  redirectUrl: string;
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
      redirect: { url: input.redirectUrl }
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
