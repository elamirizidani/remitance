import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { ApiError } from '@/lib/types';

export const dynamic = 'force-dynamic';

const BodySchema = z.object({
  fullName: z.string().min(2).max(120).optional(),
  phone: z.string().regex(/^\+\d{9,15}$/).optional(),
  deliveryMethod: z.enum(['MTN_MOMO', 'AIRTEL_MONEY', 'BANK_DEPOSIT']).optional(),
  bankAccount: z.string().optional(),
});

async function getAuthedRecipient(userId: string, recipientId: string) {
  const r = await prisma.recipient.findUnique({ where: { id: recipientId } });
  if (!r) return null;
  if (r.userId !== userId) return null;
  return r;
}

export async function PUT(
  request: NextRequest,
  ctx: RouteContext<'/api/recipients/[id]'>
): Promise<Response> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' } satisfies ApiError, { status: 401 });

  const { id } = await ctx.params;
  const recipient = await getAuthedRecipient(user.id, id);
  if (!recipient) return Response.json({ error: 'Not found' } satisfies ApiError, { status: 404 });

  const parsed = BodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0].message } satisfies ApiError, { status: 400 });
  }

  const updated = await prisma.recipient.update({
    where: { id },
    data: parsed.data,
  });

  return Response.json({
    id: updated.id,
    fullName: updated.fullName,
    phone: updated.phone,
    deliveryMethod: updated.deliveryMethod,
    bankAccount: updated.bankAccount,
  });
}

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<'/api/recipients/[id]'>
): Promise<Response> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' } satisfies ApiError, { status: 401 });

  const { id } = await ctx.params;
  const recipient = await getAuthedRecipient(user.id, id);
  if (!recipient) return Response.json({ error: 'Not found' } satisfies ApiError, { status: 404 });

  await prisma.recipient.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
