import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<Response> {
  if (!await requireAdmin()) return Response.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = request.nextUrl;
  const page    = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const limit   = 25;
  const status  = searchParams.get('status') ?? undefined;
  const search  = searchParams.get('q')?.trim() ?? '';

  const where = {
    ...(status ? { status: status as never } : {}),
    ...(search ? {
      OR: [
        { recipientName: { contains: search, mode: 'insensitive' as const } },
        { id: { contains: search, mode: 'insensitive' as const } },
      ],
    } : {}),
  };

  const [transfers, total] = await Promise.all([
    prisma.transfer.findMany({
      where,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true } },
        payout: { select: { status: true, failureReason: true, pawapayDepositId: true } },
        stripePayment: { select: { stripeSessionId: true, stripePaymentIntent: true } },
      },
    }),
    prisma.transfer.count({ where }),
  ]);

  return Response.json({
    transfers: transfers.map(t => ({
      id: t.id,
      userEmail: t.user.email,
      recipientName: t.recipientName,
      sendAmount: Number(t.sendAmount),
      sendCurrency: t.sendCurrency,
      receiveAmount: Number(t.receiveAmount),
      receiveCurrency: t.receiveCurrency,
      fee: Number(t.fee),
      exchangeRate: Number(t.exchangeRate),
      status: t.status,
      idempotencyKey: t.idempotencyKey,
      payout: t.payout,
      stripe: t.stripePayment,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    })),
    total,
    page,
    pages: Math.ceil(total / limit),
  });
}
