import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { TransferStatusResponse, ApiError } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  ctx: RouteContext<'/api/transfers/[id]'>
): Promise<Response> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json(
      { error: 'Unauthorized', code: 'UNAUTHENTICATED' } satisfies ApiError,
      { status: 401 }
    );
  }

  const { id } = await ctx.params;

  const transfer = await prisma.transfer.findUnique({
    where: { id },
    include: { payout: true },
  });

  if (!transfer) {
    return Response.json(
      { error: 'Transfer not found', code: 'NOT_FOUND' } satisfies ApiError,
      { status: 404 }
    );
  }

  // Users may only view their own transfers
  if (transfer.userId !== user.id) {
    return Response.json(
      { error: 'Forbidden', code: 'FORBIDDEN' } satisfies ApiError,
      { status: 403 }
    );
  }

  const body: TransferStatusResponse = {
    transferId: transfer.id,
    status: transfer.status,
    sendAmount: Number(transfer.sendAmount),
    sendCurrency: transfer.sendCurrency,
    receiveAmount: Number(transfer.receiveAmount),
    receiveCurrency: transfer.receiveCurrency,
    exchangeRate: Number(transfer.exchangeRate),
    fee: Number(transfer.fee),
    recipientName: transfer.recipientName,
    payout: transfer.payout
      ? {
          status: transfer.payout.status,
          pawapayDepositId: transfer.payout.pawapayDepositId,
          failureReason: transfer.payout.failureReason ?? undefined,
        }
      : null,
    createdAt: transfer.createdAt.toISOString(),
    updatedAt: transfer.updatedAt.toISOString(),
  };

  return Response.json(body);
}
