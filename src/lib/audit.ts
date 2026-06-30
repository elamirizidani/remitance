import { prisma } from './prisma';

type AuditEvent =
  | 'TRANSFER_CREATED'
  | 'STATUS_CHANGED'
  | 'STRIPE_SESSION_CREATED'
  | 'WEBHOOK_RECEIVED'
  | 'PAYOUT_INITIATED'
  | 'PAYOUT_INITIATION_FAILED'
  | 'PAYOUT_REJECTED'
  | 'PAYOUT_STATUS_UPDATED';

export async function logAuditEvent({
  transferId,
  event,
  fromStatus,
  toStatus,
  metadata = {},
}: {
  transferId: string;
  event: AuditEvent;
  fromStatus?: string;
  toStatus?: string;
  metadata?: Record<string, unknown>;
}) {
  await prisma.transactionLog.create({
    data: {
      transferId,
      event,
      fromStatus: fromStatus ?? null,
      toStatus: toStatus ?? null,
      metadata: metadata as object,
    },
  });
}
