import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<Response> {
  if (!await requireAdmin()) return Response.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = request.nextUrl;
  const page   = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const limit  = 25;
  const kyc    = searchParams.get('kyc') ?? undefined;
  const search = searchParams.get('q')?.trim() ?? '';

  const where = {
    ...(kyc ? { kycStatus: kyc as never } : {}),
    ...(search ? {
      OR: [
        { email:    { contains: search, mode: 'insensitive' as const } },
        { fullName: { contains: search, mode: 'insensitive' as const } },
      ],
    } : {}),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { transfers: true } } },
    }),
    prisma.user.count({ where }),
  ]);

  return Response.json({
    users: users.map(u => ({
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      country: u.country,
      kycStatus: u.kycStatus,
      kycDocRef: u.kycDocRef,
      transferCount: u._count.transfers,
      createdAt: u.createdAt.toISOString(),
    })),
    total,
    page,
    pages: Math.ceil(total / limit),
  });
}
