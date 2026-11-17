import crypto from 'node:crypto';

export type PlatformRole = 'super_admin' | 'admin' | 'staff' | 'support' | 'customer';

export const ORDER_STATUSES = [
  'draft',
  'new',
  'under_review',
  'needs_info',
  'in_progress',
  'completed',
  'rejected',
  'cancelled'
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, { ar: string; en: string }> = {
  draft: { ar: 'مسودة', en: 'Draft' },
  new: { ar: 'جديد', en: 'New' },
  under_review: { ar: 'قيد المراجعة', en: 'Under Review' },
  needs_info: { ar: 'يحتاج معلومات إضافية', en: 'Needs Info' },
  in_progress: { ar: 'قيد التنفيذ', en: 'In Progress' },
  completed: { ar: 'مكتمل', en: 'Completed' },
  rejected: { ar: 'مرفوض', en: 'Rejected' },
  cancelled: { ar: 'ملغي', en: 'Cancelled' }
};

export function normalizeRole(role?: string | null): PlatformRole {
  if (role === 'super_admin' || role === 'admin' || role === 'staff' || role === 'support') {
    return role;
  }
  return 'customer';
}

export function isPrivilegedRole(role: PlatformRole): boolean {
  return role === 'super_admin' || role === 'admin' || role === 'staff' || role === 'support';
}

export function canReviewOrders(role: PlatformRole): boolean {
  return role === 'super_admin' || role === 'admin' || role === 'staff';
}

export function canVerifyFinancials(role: PlatformRole): boolean {
  return role === 'super_admin' || role === 'admin';
}

export function canManageStaff(role: PlatformRole): boolean {
  return role === 'super_admin' || role === 'admin';
}

export function canManageTickets(role: PlatformRole): boolean {
  return role === 'super_admin' || role === 'admin' || role === 'support' || role === 'staff';
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const [, salt, expectedHex] = parts;
  const derived = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHex, 'hex');
  if (derived.length !== expected.length) return false;
  return crypto.timingSafeEqual(derived, expected);
}

export function generateToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

export function sha256Hex(input: string | Buffer): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

export function parseCookies(cookieHeader?: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (!key) continue;
    try {
      cookies[key] = decodeURIComponent(val);
    } catch {
      cookies[key] = val;
    }
  }
  return cookies;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && email.trim().length <= 254;
}

export function isStrongPassword(password: string): boolean {
  return typeof password === 'string' && password.length >= 8 && password.length <= 128;
}

export function sanitizeText(value: unknown, maxLen = 500): string {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, maxLen);
}

export function sanitizeId(value: unknown, maxLen = 64): string {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, maxLen);
}

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp'
]);

const MAX_DOCUMENT_BYTES = 5 * 1024 * 1024; // 5 MB

export interface ValidatedUpload {
  mimeType: string;
  buffer: Buffer;
  sizeBytes: number;
  sha256Hash: string;
}

function matchesMagicBytes(mimeType: string, buf: Buffer): boolean {
  if (buf.length < 4) return false;
  if (mimeType === 'application/pdf') {
    return buf.subarray(0, 5).toString('ascii') === '%PDF-';
  }
  if (mimeType === 'image/png') {
    return buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
  }
  if (mimeType === 'image/jpeg') {
    return buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  }
  if (mimeType === 'image/webp') {
    return (
      buf.length >= 12 &&
      buf.subarray(0, 4).toString('ascii') === 'RIFF' &&
      buf.subarray(8, 12).toString('ascii') === 'WEBP'
    );
  }
  return false;
}

export function validateUploadedDocument(
  mimeTypeRaw: string,
  base64Raw: string
): { ok: true; data: ValidatedUpload } | { ok: false; code: string; message: string } {
  const mimeType = sanitizeText(mimeTypeRaw, 128).toLowerCase();
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    return {
      ok: false,
      code: 'UNSUPPORTED_FILE_TYPE',
      message: 'Only PDF, PNG, JPG, and WEBP documents are permitted.'
    };
  }

  const stripped = base64Raw.includes(',') ? base64Raw.split(',')[1] : base64Raw;
  if (!stripped || stripped.length > MAX_DOCUMENT_BYTES * 1.45) {
    return {
      ok: false,
      code: 'FILE_TOO_LARGE',
      message: 'Document must be non-empty and under 5 MB.'
    };
  }

  let buffer: Buffer;
  try {
    buffer = Buffer.from(stripped, 'base64');
  } catch {
    return {
      ok: false,
      code: 'INVALID_BASE64',
      message: 'Invalid file encoding.'
    };
  }

  if (buffer.length === 0 || buffer.length > MAX_DOCUMENT_BYTES) {
    return {
      ok: false,
      code: 'FILE_SIZE_INVALID',
      message: 'Document must be between 1 byte and 5 MB.'
    };
  }

  if (!matchesMagicBytes(mimeType, buffer)) {
    return {
      ok: false,
      code: 'FILE_SIGNATURE_MISMATCH',
      message: 'File signature does not match declared MIME type.'
    };
  }

  return {
    ok: true,
    data: {
      mimeType,
      buffer,
      sizeBytes: buffer.length,
      sha256Hash: sha256Hex(buffer)
    }
  };
}
