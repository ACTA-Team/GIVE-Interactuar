import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createFormsSyncRepository } from '@/features/forms-sync/repositories/formsSyncRepository';
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
    const repo = createFormsSyncRepository(supabase);
    const data = await repo.findSubmissionById(id);
    if (!data) {
      return notFound('Form submission not found');
    }
    return Response.json({ data: transformKeys(data) });
  } catch (err) {
    console.error('[form-submissions/:id] Error:', err);
    return serverError();
  }
}
