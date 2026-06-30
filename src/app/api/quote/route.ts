import { NextRequest } from 'next/server';
import { z } from 'zod';
import type { QuoteResponse, ApiError } from '@/lib/types';

export const dynamic = 'force-dynamic';

const RATE_CACHE: { rate: number; fetchedAt: number } = { rate: 1634.5, fetchedAt: 0 };
const RATE_TTL_MS = 60_000; // Refresh rate every 60 seconds

async function getLiveRate(currency: 'GBP' | 'EUR'): Promise<number> {
  const now = Date.now();
  if (now - RATE_CACHE.fetchedAt < RATE_TTL_MS) return RATE_CACHE.rate;

  try {
    const res = await fetch(
      `https://api.frankfurter.app/latest?from=${currency}&to=RWF`,
      { next: { revalidate: 60 } }
    );
    const data = await res.json();
    RATE_CACHE.rate = data.rates?.RWF ?? RATE_CACHE.rate;
    RATE_CACHE.fetchedAt = now;
  } catch {
    // Keep previous cached rate on network failure
  }

  return RATE_CACHE.rate;
}

function calculateFee(sendAmount: number): number {
  if (sendAmount >= 500) return 0;
  return 1.55;
}

const QuerySchema = z.object({
  sendAmount: z.coerce.number().positive().max(10_000),
  sendCurrency: z.enum(['GBP', 'EUR']).default('GBP'),
});

export async function GET(request: NextRequest): Promise<Response> {
  const { searchParams } = request.nextUrl;

  const parsed = QuerySchema.safeParse({
    sendAmount: searchParams.get('sendAmount'),
    sendCurrency: searchParams.get('sendCurrency'),
  });

  if (!parsed.success) {
    return Response.json(
      { error: 'Invalid query parameters', code: 'VALIDATION_ERROR' } satisfies ApiError,
      { status: 400 }
    );
  }

  const { sendAmount, sendCurrency } = parsed.data;
  const exchangeRate = await getLiveRate(sendCurrency);
  const fee = calculateFee(sendAmount);
  const receiveAmount = Math.round((sendAmount - fee) * exchangeRate);

  const body: QuoteResponse = {
    sendAmount,
    sendCurrency,
    receiveAmount,
    receiveCurrency: 'RWF',
    exchangeRate,
    fee,
    totalCharged: sendAmount,
    rateExpiresAt: new Date(Date.now() + RATE_TTL_MS).toISOString(),
  };

  return Response.json(body);
}
