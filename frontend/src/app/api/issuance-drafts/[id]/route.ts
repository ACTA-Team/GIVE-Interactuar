import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createCredentialRepository } from '@/features/credentials/repositories/credentialRepository';
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
    const repo = createCredentialRepository(supabase);
    const data = await repo.findDraftById(id);
    if (!data) {
      return notFound('Issuance draft not found');
    }
    return Response.json({ data: transformKeys(data) });
  } catch (err) {
    console.error('[issuance-drafts/:id] Error:', err);
    return serverError();
  }
}
