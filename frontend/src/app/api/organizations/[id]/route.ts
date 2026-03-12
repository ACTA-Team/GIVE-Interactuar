import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createOrganizationRepository } from '@/features/organizations/repositories/organizationRepository';
import { badRequest, notFound, serverError, isValidUuid } from '@/lib/api/errors';
import { transformKeys } from '@/lib/api/transform';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!isValidUuid(id)) return badRequest('id must be a valid UUID');

  try {
    const supabase = await createServerSupabaseClient();
    const repo = createOrganizationRepository(supabase);
    const data = await repo.findById(id);
    if (!data) {
      return notFound('Organization not found');
    }
    return Response.json({ data: transformKeys(data) });
  } catch (err) {
    console.error('[organizations/:id] Error:', err);
    return serverError();
  }
}
