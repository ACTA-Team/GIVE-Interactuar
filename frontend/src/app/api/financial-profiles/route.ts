import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createFinancialProfileRepository } from '@/features/entrepreneurs/repositories/financialProfileRepository';
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
  const creditLevel = searchParams.get('credit_level') ?? undefined;
  const pagination = parsePagination(searchParams);

  try {
    const supabase = await createServerSupabaseClient();
    const repo = createFinancialProfileRepository(supabase);
    const all = await repo.findAll({ entrepreneurId, creditLevel });
    const { from, to } = paginationRange(pagination);
    const data = all.slice(from, to + 1);
    return NextResponse.json({ data: transformKeys(data), meta: buildMeta(all.length, pagination) });
  } catch (err) {
    console.error('[financial-profiles] Error:', err);
    return serverError();
  }
}
