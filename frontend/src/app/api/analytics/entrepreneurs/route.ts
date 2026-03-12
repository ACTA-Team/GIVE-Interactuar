import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAnalyticsRepository } from '@/features/analytics/repositories/analyticsRepository';
import { parsePagination, buildMeta, paginationRange } from '@/lib/api/pagination';
import { badRequest, serverError, validatePaginationParams } from '@/lib/api/errors';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pErr = validatePaginationParams(searchParams);
  if (pErr) return badRequest(pErr);
  const programa = searchParams.get('programa') ?? undefined;
  const genero = searchParams.get('genero') ?? undefined;
  const solicitoCredito = searchParams.get('solicito_credito') ?? undefined;
  const enMora = searchParams.get('en_mora') ?? undefined;
  const pagination = parsePagination(searchParams, { pageSize: 100, maxPageSize: 500 });

  try {
    const supabase = await createServerSupabaseClient();
    const repo = createAnalyticsRepository(supabase);
    const all = await repo.getEmpresarios({
      programa,
      genero,
      solicitoCredito,
      enMora,
    });
    const { from, to } = paginationRange(pagination);
    const data = all.slice(from, to + 1);
    return NextResponse.json({ data, meta: buildMeta(all.length, pagination) });
  } catch (err) {
    console.error('[analytics/entrepreneurs] Error:', err);
    return serverError();
  }
}
