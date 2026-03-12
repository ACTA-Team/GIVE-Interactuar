import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAnalyticsRepository } from '@/features/analytics/repositories/analyticsRepository';
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pErr = validatePaginationParams(searchParams);
  if (pErr) return badRequest(pErr);
  const program = searchParams.get('program') ?? undefined;
  const gender = searchParams.get('gender') ?? undefined;
  const requestedCredit = searchParams.get('requested_credit') ?? undefined;
  const overdue = searchParams.get('overdue') ?? undefined;
  const pagination = parsePagination(searchParams, {
    pageSize: 100,
    maxPageSize: 500,
  });

  try {
    const supabase = await createServerSupabaseClient();
    const repo = createAnalyticsRepository(supabase);
    const all = await repo.getEntrepreneurs({
      program,
      gender,
      requestedCredit,
      overdue,
    });
    const { from, to } = paginationRange(pagination);
    const data = all.slice(from, to + 1);
    return NextResponse.json({ data, meta: buildMeta(all.length, pagination) });
  } catch (err) {
    console.error('[analytics/entrepreneurs] Error:', err);
    return serverError();
  }
}
