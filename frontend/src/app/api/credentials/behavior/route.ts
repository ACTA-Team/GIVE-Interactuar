import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createImpactMeasurementRepository } from '@/features/impact-measurement/repositories/impactMeasurementRepository';
import { isValidUuid, badRequest, notFound, serverError, validatePaginationParams } from '@/lib/api/errors';
import { transformKeys } from '@/lib/api/transform';
import { parsePagination, buildMeta, paginationRange } from '@/lib/api/pagination';

/**
 * GET /api/credentials/behavior?entrepreneur_id=<uuid>&year=<optional>&financial_trend=<filter>&operating_capacity=<filter>&page=<num>&page_size=<num>
 *
 * Behavior Credential: Does the entrepreneur show financial stability
 * and payment capacity?
 *
 * - With entrepreneur_id: returns a single credential object (no pagination/filters).
 * - Without entrepreneur_id: returns paginated list with optional filters.
 *
 * Filters:
 *   financial_trend: positive|neutral|negative|insufficient_data
 *   operating_capacity: high|medium|low|insufficient_data
 *   leverage_level: healthy|moderate|high|insufficient_data
 *   credit_active: true|false
 *   has_financial_data: true (all critical fields present)
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
      const data = await repo.getBehaviorCredential(entrepreneurId, year);
      if (!data) {
        return notFound('Entrepreneur or measurement data not found');
      }
      return Response.json({ data: transformKeys(data) });
    }

    // List with filters and pagination
    const pErr = validatePaginationParams(searchParams);
    if (pErr) return badRequest(pErr);

    const financialTrend = searchParams.get('financial_trend') ?? undefined;
    const operatingCapacity = searchParams.get('operating_capacity') ?? undefined;
    const leverageLevel = searchParams.get('leverage_level') ?? undefined;
    const creditActive = searchParams.get('credit_active');
    const hasFinancialData = searchParams.get('has_financial_data') === 'true';
    const pagination = parsePagination(searchParams);

    let all = await repo.getAllBehaviorCredentials(year);

    // Apply filters
    if (financialTrend) all = all.filter((r: any) => r.financialTrend === financialTrend);
    if (operatingCapacity) all = all.filter((r: any) => r.estimatedOperatingCapacity === operatingCapacity);
    if (leverageLevel) all = all.filter((r: any) => r.leverageLevel === leverageLevel);
    if (creditActive === 'true') all = all.filter((r: any) => r.creditActive12m === true);
    if (creditActive === 'false') all = all.filter((r: any) => r.creditActive12m === false);
    if (hasFinancialData) {
      all = all.filter(
        (r: any) =>
          r.avgMonthlySales != null &&
          r.totalAssets != null &&
          r.estimatedOperatingMargin != null,
      );
    }

    const { from, to } = paginationRange(pagination);
    const data = all.slice(from, to + 1);
    return Response.json({ data: transformKeys(data), meta: buildMeta(all.length, pagination) });
  } catch (err) {
    console.error('[credentials/behavior] Error:', err);
    return serverError();
  }
}
