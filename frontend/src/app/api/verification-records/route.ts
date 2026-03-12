import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createVerificationRepository } from '@/features/verification/repositories/verificationRepository';
import { parsePagination, buildMeta, paginationRange } from '@/lib/api/pagination';
import { badRequest, serverError, validatePaginationParams, validateUuidParam } from '@/lib/api/errors';
import { transformKeys } from '@/lib/api/transform';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pErr = validatePaginationParams(searchParams);
  if (pErr) return badRequest(pErr);
  const uErr = validateUuidParam(searchParams, 'credential_id');
  if (uErr) return badRequest(uErr);
  const credentialId = searchParams.get('credential_id') ?? undefined;
  const verificationResult = searchParams.get('verification_result') ?? undefined;
  const pagination = parsePagination(searchParams);

  try {
    const supabase = await createServerSupabaseClient();
    const repo = createVerificationRepository(supabase);
    const all = await repo.findAll({ credentialId, verificationResult });
    const { from, to } = paginationRange(pagination);
    const data = all.slice(from, to + 1);
    return NextResponse.json({ data: transformKeys(data), meta: buildMeta(all.length, pagination) });
  } catch (err) {
    console.error('[verification-records] Error:', err);
    return serverError();
  }
}
