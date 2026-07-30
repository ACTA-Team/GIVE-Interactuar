import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createImpactMeasurementRepository } from '@/features/impact-measurement/repositories/impactMeasurementRepository';

/**
 * GET /api/credentials/profile?entrepreneurId=<uuid>
 *
 * Profile & Formalization Credential: How formal, stable, and traceable
 * is the applicant and their business?
 *
 * - With entrepreneurId: returns a single credential object.
 * - Without entrepreneurId: returns an array of all credentials.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const entrepreneurId = searchParams.get('entrepreneurId');

  try {
    const supabase = await createServerSupabaseClient();
    const repo = createImpactMeasurementRepository(supabase);

    if (entrepreneurId) {
      const data = await repo.getProfileCredential(entrepreneurId);
      if (!data) {
        return NextResponse.json(
          { error: 'Entrepreneur not found' },
          { status: 404 },
        );
      }
      return NextResponse.json({ data });
    }

    const data = await repo.getAllProfileCredentials();
    return NextResponse.json({ data });
  } catch (err) {
    console.error('[credentials/profile] Error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
