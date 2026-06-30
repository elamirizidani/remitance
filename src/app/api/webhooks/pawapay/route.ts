import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAuditEvent } from '@/lib/audit';
import { verifyPawapaySignature, type PawapayWebhookPayload } from '@/lib/pawapay';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest): Promise<Response> {
  const rawBody = await request.text();
  const signature = request.headers.get('x-pawapay-signature') ?? null;

  // ── Signature verification ────────────────────────────────────────────────
  if (!verifyPawapaySignature(rawBody, signature)) {
    console.error('[Pawapay webhook] signature verification failed');
    return new Response('Invalid signature', { status: 400 });
  }

  let payload: PawapayWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const { depositId, status, failureReason } = payload;

  // ── Find the payout record ────────────────────────────────────────────────
  const payout = await prisma.payout.findUnique({
    where: { pawapayDepositId: depositId },
    include: { transfer: true },
  });

  if (!payout) {
    // Could be a webhook for an unknown deposit — log and acknowledge
    console.warn(`[Pawapay webhook] unknown depositId: ${depositId}`);
    return new Response('ok', { status: 200 });
  }

  // ── Idempotency: skip if already in a terminal state ─────────────────────
  if (payout.status === 'COMPLETED' || payout.status === 'FAILED') {
    console.log(`[Pawapay webhook] duplicate event for depositId ${depositId}, already ${payout.status}`);
    return new Response('ok', { status: 200 });
  }

  const transferId = payout.transferId;
  const prevTransferStatus = payout.transfer.status;

  if (status === 'COMPLETED') {
    await prisma.$transaction(// eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (tx: any) => {
      await tx.payout.update({
        where: { pawapayDepositId: depositId },
        data: { status: 'COMPLETED' },
      });
      await tx.transfer.update({
        where: { id: transferId },
        data: { status: 'COMPLETED' },
      });
    });

    await logAuditEvent({
      transferId,
      event: 'PAYOUT_STATUS_UPDATED',
      fromStatus: prevTransferStatus,
      toStatus: 'COMPLETED',
      metadata: { depositId, pawapayStatus: status },
    });
  } else if (status === 'FAILED') {
    await prisma.$transaction(// eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (tx: any) => {
      await tx.payout.update({
        where: { pawapayDepositId: depositId },
        data: {
          status: 'FAILED',
          failureReason: failureReason?.failureMessage ?? 'Unknown failure',
        },
      });
      // Flag for manual review so ops team can investigate and refund
      await tx.transfer.update({
        where: { id: transferId },
        data: { status: 'MANUAL_REVIEW' },
      });
    });

    await logAuditEvent({
      transferId,
      event: 'PAYOUT_STATUS_UPDATED',
      fromStatus: prevTransferStatus,
      toStatus: 'MANUAL_REVIEW',
      metadata: {
        depositId,
        pawapayStatus: status,
        failureCode: failureReason?.failureCode,
        failureMessage: failureReason?.failureMessage,
      },
    });
  }

  return new Response('ok', { status: 200 });
}
