import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

const ALLOWED_STATUS_TRANSITIONS: Record<string, string[]> = {
  MANUAL_REVIEW: ['COMPLETED', 'FAILED'],
  PAYOUT_INITIATED: ['COMPLETED', 'MANUAL_REVIEW', 'FAILED'],
  PAYMENT_CAPTURED: ['PAYOUT_INITIATED', 'MANUAL_REVIEW', 'FAILED'],
};

const PatchSchema = z.object({
  status: z.enum(['COMPLETED', 'FAILED', 'MANUAL_REVIEW', 'PAYOUT_INITIATED', 'PAYMENT_CAPTURED']),
  note: z.string().max(500).optional(),
});

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<'/api/admin/transfers/[id]'>
): Promise<Response> {
  const adminId = await requireAdmin();
  if (!adminId) return Response.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await ctx.params;

  const body = await request.json();
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { status: newStatus, note } = parsed.data;

  const transfer = await prisma.transfer.findUnique({ where: { id } });
  if (!transfer) return Response.json({ error: 'Transfer not found' }, { status: 404 });

  const allowed = ALLOWED_STATUS_TRANSITIONS[transfer.status] ?? [];
  if (!allowed.includes(newStatus)) {
    return Response.json(
      { error: `Cannot transition from ${transfer.status} to ${newStatus}` },
      { status: 422 }
    );
  }

  await prisma.transfer.update({ where: { id }, data: { status: newStatus as never } });

  await logAuditEvent({
    transferId: id,
    event: 'STATUS_CHANGED',
    fromStatus: transfer.status,
    toStatus: newStatus,
    metadata: { adminId, note: note ?? 'Manual override by admin' },
  });

  return Response.json({ id, status: newStatus });
}

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<'/api/admin/transfers/[id]'>
): Promise<Response> {
  if (!await requireAdmin()) return Response.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await ctx.params;

  const transfer = await prisma.transfer.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, email: true, fullName: true, kycStatus: true } },
      payout: true,
      stripePayment: true,
      logs: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!transfer) return Response.json({ error: 'Transfer not found' }, { status: 404 });

  return Response.json({
    id: transfer.id,
    user: transfer.user,
    recipientName: transfer.recipientName,
    sendAmount: Number(transfer.sendAmount),
    sendCurrency: transfer.sendCurrency,
    receiveAmount: Number(transfer.receiveAmount),
    receiveCurrency: transfer.receiveCurrency,
    fee: Number(transfer.fee),
    exchangeRate: Number(transfer.exchangeRate),
    status: transfer.status,
    idempotencyKey: transfer.idempotencyKey,
    payout: transfer.payout ? {
      ...transfer.payout,
      amount: Number(transfer.payout.amount),
    } : null,
    stripe: transfer.stripePayment ? {
      ...transfer.stripePayment,
      amountCharged: Number(transfer.stripePayment.amountCharged),
    } : null,
    logs: transfer.logs.map(l => ({
      id: l.id,
      event: l.event,
      fromStatus: l.fromStatus,
      toStatus: l.toStatus,
      metadata: l.metadata,
      createdAt: l.createdAt.toISOString(),
    })),
    createdAt: transfer.createdAt.toISOString(),
    updatedAt: transfer.updatedAt.toISOString(),
  });
}
