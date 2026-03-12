import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createCredentialRepository } from '@/features/credentials/repositories/credentialRepository';
import { parsePagination, buildMeta, paginationRange } from '@/lib/api/pagination';
import { badRequest, serverError, validatePaginationParams, validateUuidParam } from '@/lib/api/errors';
import { transformKeys } from '@/lib/api/transform';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pErr = validatePaginationParams(searchParams);
  if (pErr) return badRequest(pErr);
  const uErr = validateUuidParam(searchParams, 'entrepreneur_id');
  if (uErr) return badRequest(uErr);
  const entrepreneurId = searchParams.get('entrepreneur_id') ?? undefined;
  const status = searchParams.get('status') ?? undefined;
  const credentialType = searchParams.get('credential_type') ?? undefined;
  const pagination = parsePagination(searchParams);

  try {
    const supabase = await createServerSupabaseClient();
    const repo = createCredentialRepository(supabase);
    const all = await repo.findAll({ entrepreneurId, status, credentialType } as Parameters<typeof repo.findAll>[0]);
    const { from, to } = paginationRange(pagination);
    const data = all.slice(from, to + 1);
    return NextResponse.json({ data: transformKeys(data), meta: buildMeta(all.length, pagination) });
  } catch (err) {
    console.error('[credentials] Error:', err);
    return serverError();
  }
}
