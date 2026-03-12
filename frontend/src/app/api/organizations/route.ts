import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createOrganizationRepository } from '@/features/organizations/repositories/organizationRepository';
import {
  parsePagination,
  buildMeta,
  paginationRange,
} from '@/lib/api/pagination';
import {
  badRequest,
  serverError,
  validatePaginationParams,
} from '@/lib/api/errors';
import { transformKeys } from '@/lib/api/transform';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const pErr = validatePaginationParams(searchParams);
  if (pErr) return badRequest(pErr);

  const active = searchParams.get('active');
  const pagination = parsePagination(searchParams);

  try {
    const supabase = await createServerSupabaseClient();
    const repo = createOrganizationRepository(supabase);
    const all = await repo.findAll({
      active: active !== null ? active === 'true' : undefined,
    });
    const { from, to } = paginationRange(pagination);
    const data = all.slice(from, to + 1);
    return NextResponse.json({
      data: transformKeys(data),
      meta: buildMeta(all.length, pagination),
    });
  } catch (err) {
    console.error('[organizations] Error:', err);
    return serverError();
  }
}
