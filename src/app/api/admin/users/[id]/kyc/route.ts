import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const PatchSchema = z.object({
  status: z.enum(['VERIFIED', 'REJECTED']),
  note: z.string().max(500).optional(),
});

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<'/api/admin/users/[id]/kyc'>
): Promise<Response> {
  if (!await requireAdmin()) return Response.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await ctx.params;

  const parsed = PatchSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return Response.json({ error: 'User not found' }, { status: 404 });

  if (!['SUBMITTED', 'PENDING'].includes(user.kycStatus)) {
    return Response.json(
      { error: `Cannot update KYC for user with status ${user.kycStatus}` },
      { status: 422 }
    );
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { kycStatus: parsed.data.status },
  });

  return Response.json({ id, kycStatus: updated.kycStatus });
}
