import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createImpactMeasurementRepository } from '@/features/impact-measurement/repositories/impactMeasurementRepository';
import {
  isValidUuid,
  badRequest,
  notFound,
  serverError,
  validatePaginationParams,
} from '@/lib/api/errors';
import { transformKeys } from '@/lib/api/transform';
import {
  parsePagination,
  buildMeta,
  paginationRange,
} from '@/lib/api/pagination';

/**
 * GET /api/credentials/impact?entrepreneur_id=<uuid>&year=<optional>&verdict=<filter>&has_sales=<filter>&page=<num>&page_size=<num>
 *
 * Impact Credential: Does the business grow, sustain, or deteriorate?
 *
 * - With entrepreneur_id: returns a single credential object (no pagination/filters).
 * - Without entrepreneur_id: returns paginated list with optional filters.
 *
 * Filters:
 *   verdict: growing|sustaining|deteriorating|insufficient_data
 *   has_business: true|false
 *   has_sales: true|false
 *   has_employees: true|false
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const entrepreneurId = searchParams.get('entrepreneur_id');
  const year = searchParams.get('year')
    ? parseInt(searchParams.get('year')!, 10)
    : undefined;

  if (entrepreneurId && !isValidUuid(entrepreneurId)) {
    return badRequest('entrepreneur_id must be a valid UUID');
  }

  try {
    const supabase = await createServerSupabaseClient();
    const repo = createImpactMeasurementRepository(supabase);

    // Single record (no pagination/filters)
    if (entrepreneurId) {
      const data = await repo.getImpactCredential(entrepreneurId, year);
      if (!data) {
        return notFound('Entrepreneur or measurement data not found');
      }
      return Response.json({ data: transformKeys(data) });
    }

    // List with filters and pagination
    const pErr = validatePaginationParams(searchParams);
    if (pErr) return badRequest(pErr);

    const verdict = searchParams.get('verdict') ?? undefined;
    const hasBusiness = searchParams.get('has_business');
    const hasSales = searchParams.get('has_sales');
    const hasEmployees = searchParams.get('has_employees');
    const pagination = parsePagination(searchParams);

    let all = await repo.getAllImpactCredentials(year);

    // Apply filters
    if (verdict) all = all.filter((r: any) => r.verdict === verdict);
    if (hasBusiness === 'true')
      all = all.filter((r: any) => r.businessName != null);
    if (hasBusiness === 'false')
      all = all.filter((r: any) => r.businessName == null);
    if (hasSales === 'true')
      all = all.filter((r: any) => r.totalSalesCurrentYear != null);
    if (hasSales === 'false')
      all = all.filter((r: any) => r.totalSalesCurrentYear == null);
    if (hasEmployees === 'true')
      all = all.filter((r: any) => r.currentFullTimeEmployees != null);
    if (hasEmployees === 'false')
      all = all.filter((r: any) => r.currentFullTimeEmployees == null);

    const { from, to } = paginationRange(pagination);
    const data = all.slice(from, to + 1);
    return Response.json({
      data: transformKeys(data),
      meta: buildMeta(all.length, pagination),
    });
  } catch (err) {
    console.error('[credentials/impact] Error:', err);
    return serverError();
  }
}
