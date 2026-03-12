import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createVerificationRepository } from '@/features/verification/repositories/verificationRepository';
import {
  badRequest,
  notFound,
  serverError,
  isValidUuid,
} from '@/lib/api/errors';
import { transformKeys } from '@/lib/api/transform';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!isValidUuid(id)) return badRequest('id must be a valid UUID');

  try {
    const supabase = await createServerSupabaseClient();
    const repo = createVerificationRepository(supabase);
    const data = await repo.findById(id);
    if (!data) {
      return notFound('Verification record not found');
    }
    return Response.json({ data: transformKeys(data) });
  } catch (err) {
    console.error('[verification-records/:id] Error:', err);
    return serverError();
  }
}
