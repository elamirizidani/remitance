import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';
import type { PayoutStatus, Prisma, TransferStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

type RecentTransfer = {
  id: string;
  recipientName: string;
  sendAmount: Prisma.Decimal;
  sendCurrency: string;
  receiveAmount: Prisma.Decimal;
  status: TransferStatus;
  payout: { status: PayoutStatus } | null;
  createdAt: Date;
};

type StatusBreakdown = {
  status: TransferStatus;
  _count: { id: number };
};

export async function GET(): Promise<Response> {
  if (!await requireAdmin()) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const [
    totalTransfers,
    completedTransfers,
    pendingReview,
    totalUsers,
    pendingKyc,
    volumeResult,
    revenueResult,
    recentTransfers,
    statusBreakdown,
  ] = await Promise.all([
    prisma.transfer.count(),
    prisma.transfer.count({ where: { status: 'COMPLETED' } }),
    prisma.transfer.count({ where: { status: 'MANUAL_REVIEW' } }),
    prisma.user.count(),
    prisma.user.count({ where: { kycStatus: 'SUBMITTED' } }),
    prisma.transfer.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { sendAmount: true },
    }),
    prisma.transfer.aggregate({
      where: { status: { in: ['COMPLETED', 'PAYOUT_INITIATED', 'PAYMENT_CAPTURED'] } },
      _sum: { fee: true },
    }),
    prisma.transfer.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { payout: { select: { status: true } } },
    }),
    prisma.transfer.groupBy({
      by: ['status'],
      _count: { id: true },
    }),
  ]);

  return Response.json({
    totalTransfers,
    completedTransfers,
    pendingReview,
    totalUsers,
    pendingKyc,
    totalVolume: Number(volumeResult._sum.sendAmount ?? 0),
    totalRevenue: Number(revenueResult._sum.fee ?? 0),
    recentTransfers: recentTransfers.map((t: RecentTransfer) => ({
      id: t.id,
      recipientName: t.recipientName,
      sendAmount: Number(t.sendAmount),
      sendCurrency: t.sendCurrency,
      receiveAmount: Number(t.receiveAmount),
      status: t.status,
      payoutStatus: t.payout?.status ?? null,
      createdAt: t.createdAt.toISOString(),
    })),
    statusBreakdown: statusBreakdown.map((s: StatusBreakdown) => ({
      status: s.status,
      count: s._count.id,
    })),
  });
}
