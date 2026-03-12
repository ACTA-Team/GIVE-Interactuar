import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createFormsSyncRepository } from '@/features/forms-sync/repositories/formsSyncRepository';
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
  const uErr = validateUuidParam(searchParams, 'form_source_id');
  if (uErr) return badRequest(uErr);
  const formSourceId = searchParams.get('form_source_id') ?? undefined;
  const status = searchParams.get('status') ?? undefined;
  const pagination = parsePagination(searchParams);

  try {
    const supabase = await createServerSupabaseClient();
    const repo = createFormsSyncRepository(supabase);
    const all = await repo.findAllSyncRuns({ formSourceId, status });
    const { from, to } = paginationRange(pagination);
    const data = all.slice(from, to + 1);
    return NextResponse.json({
      data: transformKeys(data),
      meta: buildMeta(all.length, pagination),
    });
  } catch (err) {
    console.error('[form-sync-runs] Error:', err);
    return serverError();
  }
}
