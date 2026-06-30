import { NextRequest } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { logAuditEvent } from '@/lib/audit';
import { initiateDeposit, DELIVERY_METHOD_TO_CORRESPONDENT } from '@/lib/pawapay';
import { v4 as uuidv4 } from 'uuid';
import type Stripe from 'stripe';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest): Promise<Response> {
  const rawBody = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return new Response('Missing stripe-signature header', { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('[Stripe webhook] signature verification failed:', err);
    return new Response('Webhook signature verification failed', { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    try {
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
    } catch (err) {
      // Return 500 so Stripe retries — do NOT swallow errors silently
      console.error('[Stripe webhook] handler failed:', err);
      return new Response('Internal error — will retry', { status: 500 });
    }
  }

  return new Response('ok', { status: 200 });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { transferId, idempotencyKey, recipientPhone, deliveryMethod, recipientName } =
    session.metadata ?? {};

  if (!transferId || !idempotencyKey) {
    console.error('[Stripe webhook] session missing required metadata', session.id);
    return;
  }

  // ── Idempotency guard: skip if already processed ─────────────────────────
  const existing = await prisma.payout.findUnique({
    where: { pawapayDepositId: idempotencyKey },
  });
  if (existing) {
    console.log('[Stripe webhook] duplicate event — payout already initiated, skipping');
    return;
  }

  // ── Phase 1: DB transaction — update Transfer status + Stripe record ──────
  // Pawapay HTTP happens OUTSIDE the transaction to avoid holding DB locks
  // during a network call.
  const transfer = await prisma.$transaction(// eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (tx: any) => {
    const t = await tx.transfer.findUnique({ where: { id: transferId } });
    if (!t) throw new Error(`Transfer ${transferId} not found`);
    if (t.status !== 'PENDING') {
      console.log(`[Stripe webhook] transfer ${transferId} already at ${t.status}, skipping`);
      return null;
    }

    await tx.transfer.update({
      where: { id: transferId },
      data: { status: 'PAYMENT_CAPTURED' },
    });

    await tx.stripePayment.update({
      where: { stripeSessionId: session.id },
      data: {
        stripePaymentIntent: (session.payment_intent as string) ?? null,
        status: 'completed',
      },
    });

    return t;
  });

  // Already processed or not found — nothing to do
  if (!transfer) return;

  // ── Phase 2: Pawapay HTTP — outside transaction ───────────────────────────
  let pawapayResponse;
  try {
    pawapayResponse = await initiateDeposit({
      depositId: idempotencyKey,
      amount: String(Math.round(Number(transfer.receiveAmount))),
      currency: 'RWF',
      correspondent:
        DELIVERY_METHOD_TO_CORRESPONDENT[deliveryMethod ?? 'MTN_MOMO'] ?? 'MTN_MOMO_RWF',
      payer: {
        type: 'MSISDN',
        address: { value: (recipientPhone ?? '').replace(/^\+/, '') },
      },
      customerTimestamp: new Date().toISOString(),
      statementDescription: `Fasta Fasta · ${recipientName ?? 'Recipient'}`,
    });
  } catch (err) {
    // HTTP failure — flag for manual review, then let the error propagate
    // so Stripe retries the webhook. If Pawapay already accepted (network
    // timeout on our side), the idempotency key prevents a double-charge.
    await prisma.transfer.update({
      where: { id: transferId },
      data: { status: 'MANUAL_REVIEW' },
    });
    await logAuditEvent({
      transferId,
      event: 'PAYOUT_INITIATION_FAILED',
      fromStatus: 'PAYMENT_CAPTURED',
      toStatus: 'MANUAL_REVIEW',
      metadata: { error: String(err), stripeSessionId: session.id },
    }).catch(() => {});
    throw err;
  }

  // ── Phase 3: Persist payout record based on Pawapay response ─────────────
  if (pawapayResponse.status === 'REJECTED') {
    await prisma.$transaction(// eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (tx: any) => {
      await tx.transfer.update({
        where: { id: transferId },
        data: { status: 'MANUAL_REVIEW' },
      });
      await tx.payout.create({
        data: {
          id: uuidv4(),
          transferId,
          pawapayDepositId: idempotencyKey,
          recipientPhone: recipientPhone ?? '',
          amount: transfer.receiveAmount,
          currency: 'RWF',
          status: 'FAILED',
          failureReason:
            pawapayResponse.rejectionReason?.rejectionMessage ?? 'Pawapay rejected',
        },
      });
    });

    await logAuditEvent({
      transferId,
      event: 'PAYOUT_REJECTED',
      fromStatus: 'PAYMENT_CAPTURED',
      toStatus: 'MANUAL_REVIEW',
      metadata: {
        rejectionReason: pawapayResponse.rejectionReason,
        stripeSessionId: session.id,
      },
    }).catch(() => {});
    return;
  }

  // ACCEPTED or DUPLICATE_IGNORED — payout is in flight
  await prisma.$transaction(// eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (tx: any) => {
    await tx.payout.create({
      data: {
        id: uuidv4(),
        transferId,
        pawapayDepositId: idempotencyKey,
        recipientPhone: recipientPhone ?? '',
        amount: transfer.receiveAmount,
        currency: 'RWF',
        status: 'INITIATED',
      },
    });
    await tx.transfer.update({
      where: { id: transferId },
      data: { status: 'PAYOUT_INITIATED' },
    });
  });

  await logAuditEvent({
    transferId,
    event: 'PAYOUT_INITIATED',
    fromStatus: 'PAYMENT_CAPTURED',
    toStatus: 'PAYOUT_INITIATED',
    metadata: { stripeSessionId: session.id, deliveryMethod, recipientPhone },
  }).catch(() => {});
}
