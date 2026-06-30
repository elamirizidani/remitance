import crypto from 'crypto';

// ─── Types ────────────────────────────────────────────────────────────────────

export type PawapayDepositRequest = {
  depositId: string;       // Our idempotency key (UUID)
  amount: string;          // e.g. "163450"
  currency: string;        // "RWF"
  correspondent: string;   // e.g. "MTN_MOMO_RWF"
  payer: {
    type: 'MSISDN';
    address: { value: string }; // phone in E.164 without +
  };
  customerTimestamp: string; // ISO 8601
  statementDescription: string;
};

export type PawapayDepositResponse = {
  depositId: string;
  status: 'ACCEPTED' | 'DUPLICATE_IGNORED' | 'REJECTED';
  rejectionReason?: { rejectionCode: string; rejectionMessage: string };
};

export type PawapayWebhookPayload = {
  depositId: string;
  status: 'COMPLETED' | 'FAILED';
  amount: string;
  currency: string;
  failureReason?: { failureCode: string; failureMessage: string };
};

// ─── Correspondent mapping ────────────────────────────────────────────────────

export const DELIVERY_METHOD_TO_CORRESPONDENT: Record<string, string> = {
  MTN_MOMO:     'MTN_MOMO_RWF',
  AIRTEL_MONEY: 'AIRTEL_MONEY_RWF',
  BANK_DEPOSIT: 'BANK_RWF', // adjust to your Pawapay correspondent code
};

// ─── Client ───────────────────────────────────────────────────────────────────

const BASE_URL = process.env.PAWAPAY_BASE_URL ?? 'https://api.sandbox.pawapay.io';
const API_TOKEN = process.env.PAWAPAY_API_TOKEN ?? '';

export async function initiateDeposit(
  payload: PawapayDepositRequest
): Promise<PawapayDepositResponse> {
  const res = await fetch(`${BASE_URL}/deposits`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pawapay deposit request failed: ${res.status} ${text}`);
  }

  return res.json() as Promise<PawapayDepositResponse>;
}

// ─── Webhook signature verification ──────────────────────────────────────────

export function verifyPawapaySignature(
  rawBody: string,
  signatureHeader: string | null
): boolean {
  const secret = process.env.PAWAPAY_WEBHOOK_SECRET;
  if (!secret || !signatureHeader) return false;

  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  // timingSafeEqual throws if lengths differ — check first
  const sigBuf = Buffer.from(signatureHeader, 'hex');
  const expectedBuf = Buffer.from(expected, 'hex');
  if (sigBuf.length !== expectedBuf.length) return false;
  return crypto.timingSafeEqual(sigBuf, expectedBuf);
}
