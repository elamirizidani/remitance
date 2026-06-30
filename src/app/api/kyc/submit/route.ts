import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { ApiError } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest): Promise<Response> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json(
      { error: 'Unauthorized', code: 'UNAUTHENTICATED' } satisfies ApiError,
      { status: 401 }
    );
  }

  const form = await request.formData();
  const docType  = form.get('docType')?.toString();
  const front    = form.get('front');
  const selfie   = form.get('selfie');

  if (!docType || !front || !selfie) {
    return Response.json(
      { error: 'Missing required fields: docType, front, selfie', code: 'VALIDATION_ERROR' } satisfies ApiError,
      { status: 400 }
    );
  }

  // In production: upload files to Supabase Storage and store the object paths.
  // For now we record the submission and move status to SUBMITTED.
  // A compliance officer will manually review and set status to VERIFIED via
  // the Supabase dashboard or an admin panel.
  const docRef = `${docType}:${Date.now()}`;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      kycStatus: 'SUBMITTED',
      kycDocRef: docRef,
    },
  });

  return Response.json({ status: 'SUBMITTED' }, { status: 200 });
}
