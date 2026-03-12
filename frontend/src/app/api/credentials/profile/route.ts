import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createImpactMeasurementRepository } from '@/features/impact-measurement/repositories/impactMeasurementRepository';
import { isValidUuid, badRequest, notFound, serverError, validatePaginationParams } from '@/lib/api/errors';
import { transformKeys } from '@/lib/api/transform';
import { parsePagination, buildMeta, paginationRange } from '@/lib/api/pagination';

/**
 * GET /api/credentials/profile?entrepreneur_id=<uuid>&is_formalized=<filter>&identity_validated=<filter>&page=<num>&page_size=<num>
 *
 * Profile & Formalization Credential: How formal, stable, and traceable
 * is the applicant and their business?
 *
 * - With entrepreneur_id: returns a single credential object (no pagination/filters).
 * - Without entrepreneur_id: returns paginated list with optional filters.
 *
 * Filters:
 *   is_formalized: true|false
 *   identity_validated: true|false
 *   has_internet: true|false
 *   contributes_pension: true|false
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const entrepreneurId = searchParams.get('entrepreneur_id');

  if (entrepreneurId && !isValidUuid(entrepreneurId)) {
    return badRequest('entrepreneur_id must be a valid UUID');
  }

  try {
    const supabase = await createServerSupabaseClient();
    const repo = createImpactMeasurementRepository(supabase);

    // Single record (no pagination/filters)
    if (entrepreneurId) {
      const data = await repo.getProfileCredential(entrepreneurId);
      if (!data) {
        return notFound('Entrepreneur not found');
      }
      return Response.json({ data: transformKeys(data) });
    }

    // List with filters and pagination
    const pErr = validatePaginationParams(searchParams);
    if (pErr) return badRequest(pErr);

    const isFormalized = searchParams.get('is_formalized');
    const identityValidated = searchParams.get('identity_validated');
    const hasInternet = searchParams.get('has_internet');
    const contributesPension = searchParams.get('contributes_pension');
    const pagination = parsePagination(searchParams);

    let all = await repo.getAllProfileCredentials();

    // Apply filters
    if (isFormalized === 'true') all = all.filter((r: any) => r.businessFormalized === true);
    if (isFormalized === 'false') all = all.filter((r: any) => r.businessFormalized === false);
    if (identityValidated === 'true') all = all.filter((r: any) => r.identityValidated === true);
    if (identityValidated === 'false') all = all.filter((r: any) => r.identityValidated === false);
    if (hasInternet === 'true') all = all.filter((r: any) => r.hasInternet === true);
    if (hasInternet === 'false') all = all.filter((r: any) => r.hasInternet === false);
    if (contributesPension === 'true') all = all.filter((r: any) => r.contributesPension === true);
    if (contributesPension === 'false') all = all.filter((r: any) => r.contributesPension === false);

    const { from, to } = paginationRange(pagination);
    const data = all.slice(from, to + 1);
    return Response.json({ data: transformKeys(data), meta: buildMeta(all.length, pagination) });
  } catch (err) {
    console.error('[credentials/profile] Error:', err);
    return serverError();
  }
}
