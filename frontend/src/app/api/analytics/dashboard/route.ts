import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAnalyticsRepository } from '@/features/analytics/repositories/analyticsRepository';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const repo = createAnalyticsRepository(supabase);
    const data = await repo.getDashboard();
    return NextResponse.json(data);
  } catch (err) {
    console.error('[analytics/dashboard] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
