import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createCredentialRepository } from '@/features/credentials/repositories/credentialRepository';
import {
  parsePagination,
  buildMeta,
  paginationRange,
} from '@/lib/api/pagination';
import {
  badRequest,
  serverError,
  validatePaginationParams,
  validateUuidParam,
} from '@/lib/api/errors';
import { transformKeys } from '@/lib/api/transform';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pErr = validatePaginationParams(searchParams);
  if (pErr) return badRequest(pErr);
  const uErr = validateUuidParam(searchParams, 'organization_id');
  if (uErr) return badRequest(uErr);
  const organizationId = searchParams.get('organization_id') ?? undefined;
  const credentialType = searchParams.get('credential_type') ?? undefined;
  const active = searchParams.get('active');
  const pagination = parsePagination(searchParams);

  try {
    const supabase = await createServerSupabaseClient();
    const repo = createCredentialRepository(supabase);
    const all = await repo.findAllTemplates({
      organizationId,
      credentialType,
      active: active !== null ? active === 'true' : undefined,
    });
    const { from, to } = paginationRange(pagination);
    const data = all.slice(from, to + 1);
    return NextResponse.json({
      data: transformKeys(data),
      meta: buildMeta(all.length, pagination),
    });
  } catch (err) {
    console.error('[credential-templates] Error:', err);
    return serverError();
  }
}
