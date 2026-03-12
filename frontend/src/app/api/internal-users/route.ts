import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createOrganizationRepository } from '@/features/organizations/repositories/organizationRepository';
import { parsePagination, buildMeta, paginationRange } from '@/lib/api/pagination';
import { badRequest, serverError, validatePaginationParams, validateUuidParam } from '@/lib/api/errors';
import { transformKeys } from '@/lib/api/transform';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pErr = validatePaginationParams(searchParams);
  if (pErr) return badRequest(pErr);
  const uErr = validateUuidParam(searchParams, 'organization_id');
  if (uErr) return badRequest(uErr);
  const organizationId = searchParams.get('organization_id') ?? undefined;
  const active = searchParams.get('active');
  const role = searchParams.get('role') ?? undefined;
  const pagination = parsePagination(searchParams);

  try {
    const supabase = await createServerSupabaseClient();
    const repo = createOrganizationRepository(supabase);
    const all = await repo.findAllInternalUsers({
      organizationId,
      active: active !== null ? active === 'true' : undefined,
      role,
    });
    const { from, to } = paginationRange(pagination);
    const data = all.slice(from, to + 1);
    return NextResponse.json({ data: transformKeys(data), meta: buildMeta(all.length, pagination) });
  } catch (err) {
    console.error('[internal-users] Error:', err);
    return serverError();
  }
}
