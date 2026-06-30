import { NextRequest } from 'next/server';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/lib/prisma';
import { getStripe } from '@/lib/stripe';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { logAuditEvent } from '@/lib/audit';
import type { CreateTransferResponse, ApiError } from '@/lib/types';

export const dynamic = 'force-dynamic';

// ── In-process rate limiter: max 5 transfer attempts per user per minute ──────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

const RATE_TTL_MS = 60_000;
const rateCache: { [key: string]: { rate: number; fetchedAt: number } } = {};

async function getLiveRate(currency: 'GBP' | 'EUR'): Promise<number> {
  const cached = rateCache[currency];
  if (cached && Date.now() - cached.fetchedAt < RATE_TTL_MS) return cached.rate;

  try {
    const res = await fetch(`https://api.frankfurter.app/latest?from=${currency}&to=RWF`);
    const data = await res.json();
    rateCache[currency] = { rate: data.rates?.RWF ?? 1634.5, fetchedAt: Date.now() };
  } catch {
    rateCache[currency] ??= { rate: 1634.5, fetchedAt: Date.now() };
  }

  return rateCache[currency].rate;
}

function calculateFee(sendAmount: number): number {
  return sendAmount >= 500 ? 0 : 1.55;
}

function getAppUrl(request: NextRequest): string {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (configuredUrl) return configuredUrl.replace(/\/$/, '');

  const origin = request.nextUrl.origin;
  if (origin && origin !== 'null') return origin;

  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  const protocol = request.headers.get('x-forwarded-proto') ?? 'https';
  if (host) return `${protocol}://${host}`;

  throw new Error('Missing NEXT_PUBLIC_APP_URL environment variable');
}

const BodySchema = z.object({
  sendAmount: z.number().positive().max(10_000),
  sendCurrency: z.enum(['GBP', 'EUR']).default('GBP'),
  recipientName: z.string().min(2).max(120),
  recipientPhone: z.string().regex(/^\+\d{9,15}$/, 'Phone must be in E.164 format'),
  deliveryMethod: z.enum(['MTN_MOMO', 'AIRTEL_MONEY', 'BANK_DEPOSIT']),
  recipientId: z.string().uuid().optional(),
});

export async function POST(request: NextRequest): Promise<Response> {
  // ── 1. Authenticate ──────────────────────────────────────────────────────
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return Response.json(
      { error: 'Unauthorized', code: 'UNAUTHENTICATED' } satisfies ApiError,
      { status: 401 }
    );
  }

  // ── 2. Parse & validate body ─────────────────────────────────────────────
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return Response.json(
      { error: 'Invalid JSON body', code: 'INVALID_BODY' } satisfies ApiError,
      { status: 400 }
    );
  }

  const parsed = BodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0].message, code: 'VALIDATION_ERROR' } satisfies ApiError,
      { status: 400 }
    );
  }

  const body = parsed.data;

  // ── 3. KYC gate ──────────────────────────────────────────────────────────
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });

  if (!dbUser) {
    return Response.json(
      { error: 'User profile not found. Please complete registration.', code: 'USER_NOT_FOUND' } satisfies ApiError,
      { status: 404 }
    );
  }

  if (!checkRateLimit(user.id)) {
    return Response.json(
      { error: 'Too many requests. Please wait a minute before trying again.', code: 'RATE_LIMITED' } satisfies ApiError,
      { status: 429 }
    );
  }

  if (dbUser.kycStatus !== 'VERIFIED') {
    return Response.json(
      { error: `KYC verification required. Current status: ${dbUser.kycStatus}`, code: 'KYC_NOT_VERIFIED' } satisfies ApiError,
      { status: 403 }
    );
  }

  // ── 4. Calculate amounts ─────────────────────────────────────────────────
  const exchangeRate = await getLiveRate(body.sendCurrency);
  const fee = calculateFee(body.sendAmount);
  const receiveAmount = Math.round((body.sendAmount - fee) * exchangeRate);
  const idempotencyKey = uuidv4();

  // ── 5. Prisma transaction: create Transfer + Stripe session atomically ────
  let transferId: string;
  let checkoutUrl: string;

  try {
    const stripe = getStripe();
    const appUrl = getAppUrl(request);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await prisma.$transaction(async (tx: any) => {
      // Create the Transfer record
      const transfer = await tx.transfer.create({
        data: {
          id: uuidv4(),
          userId: user.id,
          recipientId: body.recipientId ?? null,
          sendAmount: body.sendAmount,
          sendCurrency: body.sendCurrency,
          receiveAmount,
          receiveCurrency: 'RWF',
          exchangeRate,
          fee,
          recipientName: body.recipientName,
          status: 'PENDING',
          idempotencyKey,
        },
      });

      // Create Stripe Checkout session
      // idempotencyKey is passed to Stripe to prevent duplicate sessions
      const session = await stripe.checkout.sessions.create(
        {
          mode: 'payment',
          line_items: [
            {
              quantity: 1,
              price_data: {
                currency: body.sendCurrency.toLowerCase(),
                unit_amount: Math.round(body.sendAmount * 100), // Stripe uses smallest unit
                product_data: {
                  name: `Send ${body.sendAmount} ${body.sendCurrency} to Rwanda`,
                  description: `Recipient: ${body.recipientName} · ${body.deliveryMethod.replace('_', ' ')}`,
                },
              },
            },
            // Fee as separate line item for transparency
            ...(fee > 0
              ? [
                  {
                    quantity: 1,
                    price_data: {
                      currency: body.sendCurrency.toLowerCase(),
                      unit_amount: Math.round(fee * 100),
                      product_data: { name: 'Transfer fee' },
                    },
                  },
                ]
              : []),
          ],
          metadata: {
            transferId: transfer.id,
            idempotencyKey,
            recipientPhone: body.recipientPhone,
            deliveryMethod: body.deliveryMethod,
            recipientName: body.recipientName,
          },
          success_url: `${appUrl}/success?transferId=${transfer.id}`,
          cancel_url: `${appUrl}/?cancelled=true`,
        },
        {
          // Stripe idempotency key prevents duplicate sessions on retry
          idempotencyKey,
        }
      );

      if (!session.url) throw new Error('Stripe did not return a checkout URL');

      // Persist the Stripe session record
      await tx.stripePayment.create({
        data: {
          transferId: transfer.id,
          stripeSessionId: session.id,
          amountCharged: body.sendAmount + fee,
          currency: body.sendCurrency.toLowerCase(),
          status: 'created',
        },
      });

      return { transfer, sessionUrl: session.url };
    });

    transferId = result.transfer.id;
    checkoutUrl = result.sessionUrl;
  } catch (err) {
    console.error('[POST /api/transfers] transaction failed:', err);
    return Response.json(
      { error: 'Failed to create transfer. Please try again.', code: 'TRANSFER_CREATION_FAILED' } satisfies ApiError,
      { status: 500 }
    );
  }

  // Audit log outside the transaction (non-critical, best-effort)
  await logAuditEvent({
    transferId,
    event: 'TRANSFER_CREATED',
    toStatus: 'PENDING',
    metadata: {
      userId: user.id,
      sendAmount: body.sendAmount,
      sendCurrency: body.sendCurrency,
      deliveryMethod: body.deliveryMethod,
    },
  }).catch(console.error);

  const response: CreateTransferResponse = { transferId, checkoutUrl, idempotencyKey };
  return Response.json(response, { status: 201 });
}
