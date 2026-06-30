import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { ApiError } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest): Promise<Response> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json(
      { error: 'Unauthorized', code: 'UNAUTHENTICATED' } satisfies ApiError,
      { status: 401 }
    );
  }

  const transfers = await prisma.transfer.findMany({
    where: { userId: user.id },
    include: { payout: { select: { status: true, failureReason: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const body = transfers.map(t => ({
    transferId: t.id,
    recipientName: t.recipientName,
    sendAmount: Number(t.sendAmount),
    sendCurrency: t.sendCurrency,
    receiveAmount: Number(t.receiveAmount),
    receiveCurrency: t.receiveCurrency,
    status: t.status,
    deliveryMethod: t.payout ? undefined : undefined,
    payoutStatus: t.payout?.status ?? null,
    createdAt: t.createdAt.toISOString(),
  }));

  return Response.json(body);
}
