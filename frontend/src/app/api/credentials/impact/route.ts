import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createImpactMeasurementRepository } from '@/features/impact-measurement/repositories/impactMeasurementRepository';

/**
 * GET /api/credentials/impact?entrepreneurId=<uuid>&year=<optional>
 *
 * Impact Credential: Does the business grow, sustain, or deteriorate?
 *
 * - With entrepreneurId: returns a single credential object.
 * - Without entrepreneurId: returns an array of all credentials.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const entrepreneurId = searchParams.get('entrepreneurId');
  const year = searchParams.get('year')
    ? parseInt(searchParams.get('year')!, 10)
    : undefined;

  try {
    const supabase = await createServerSupabaseClient();
    const repo = createImpactMeasurementRepository(supabase);

    if (entrepreneurId) {
      const data = await repo.getImpactCredential(entrepreneurId, year);
      if (!data) {
        return NextResponse.json(
          { error: 'Entrepreneur or measurement data not found' },
          { status: 404 },
        );
      }
      return NextResponse.json({ data });
    }

    const data = await repo.getAllImpactCredentials(year);
    return NextResponse.json({ data });
  } catch (err) {
    console.error('[credentials/impact] Error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
