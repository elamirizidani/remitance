import { NextRequest } from 'next/server';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/lib/prisma';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { ApiError } from '@/lib/types';

export const dynamic = 'force-dynamic';

const BodySchema = z.object({
  fullName: z.string().min(2).max(120),
  phone: z.string().regex(/^\+\d{9,15}$/, 'Phone must be in E.164 format'),
  deliveryMethod: z.enum(['MTN_MOMO', 'AIRTEL_MONEY', 'BANK_DEPOSIT']),
  bankAccount: z.string().optional(),
});

export async function GET(): Promise<Response> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' } satisfies ApiError, { status: 401 });

  const recipients = await prisma.recipient.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  return Response.json(recipients.map(r => ({
    id: r.id,
    fullName: r.fullName,
    phone: r.phone,
    deliveryMethod: r.deliveryMethod,
    bankAccount: r.bankAccount,
    createdAt: r.createdAt.toISOString(),
  })));
}

export async function POST(request: NextRequest): Promise<Response> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' } satisfies ApiError, { status: 401 });

  const parsed = BodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0].message } satisfies ApiError,
      { status: 400 }
    );
  }

  const r = await prisma.recipient.create({
    data: {
      id: uuidv4(),
      userId: user.id,
      fullName: parsed.data.fullName,
      phone: parsed.data.phone,
      deliveryMethod: parsed.data.deliveryMethod,
      bankAccount: parsed.data.bankAccount ?? null,
    },
  });

  return Response.json({
    id: r.id,
    fullName: r.fullName,
    phone: r.phone,
    deliveryMethod: r.deliveryMethod,
    bankAccount: r.bankAccount,
    createdAt: r.createdAt.toISOString(),
  }, { status: 201 });
}
