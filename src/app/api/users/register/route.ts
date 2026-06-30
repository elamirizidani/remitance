import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { ApiError } from '@/lib/types';

export const dynamic = 'force-dynamic';

const BodySchema = z.object({
  fullName: z.string().min(2).max(120),
  country: z.enum(['GB', 'BE']).default('GB'),
});

export async function POST(request: NextRequest): Promise<Response> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json(
      { error: 'Unauthorized', code: 'UNAUTHENTICATED' } satisfies ApiError,
      { status: 401 }
    );
  }

  const parsed = BodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0].message, code: 'VALIDATION_ERROR' } satisfies ApiError,
      { status: 400 }
    );
  }

  const { fullName, country } = parsed.data;

  // Upsert so re-registering is safe
  const dbUser = await prisma.user.upsert({
    where: { id: user.id },
    update: { fullName, country },
    create: {
      id: user.id,
      email: user.email!,
      fullName,
      country,
      kycStatus: 'PENDING',
    },
  });

  return Response.json({ id: dbUser.id, kycStatus: dbUser.kycStatus }, { status: 201 });
}
