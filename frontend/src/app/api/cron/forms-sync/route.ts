import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createFormsSyncRepository } from '@/features/forms-sync/repositories/formsSyncRepository';
import { createFormsSyncService } from '@/features/forms-sync/services/formsSyncService';
import { GoogleFormsClient } from '@/lib/services/googleFormsClient';

interface FormSourceRow {
  id: string;
  active: boolean;
}

// Triggered by Vercel Cron or an external scheduler
// Config in vercel.json:
//   { "crons": [{ "path": "/api/cron/forms-sync", "schedule": "0 * * * *" }] }
export async function POST(request: Request) {
  // TODO: verify CRON_SECRET to prevent unauthorized invocations
  // const authHeader = request.headers.get('Authorization')
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  // }
  void request;

  try {
    const supabase = await createServerSupabaseClient();
    const syncRepo = createFormsSyncRepository(supabase);
    // Fetch all active form sources so we don't depend on a single env ID
    const { data: sources, error: sourcesError } = await supabase
      .from('form_sources')
      .select('id, active')
      .eq('active', true);

    if (sourcesError) {
      console.error('[forms-sync cron] Failed to load form_sources:', sourcesError);
      return NextResponse.json(
        { error: 'Failed to load form sources' },
        { status: 500 },
      );
    }

    if (!sources || sources.length === 0) {
      console.warn('[forms-sync cron] No active form_sources found');
      return NextResponse.json({ ok: true, message: 'No active form sources' });
    }

    // TODO: query active form_sources from DB and iterate over each
    const formsClient = new GoogleFormsClient({
      formId: process.env.GOOGLE_FORM_ID!,
      credentials: {
        clientEmail: process.env.GOOGLE_CLIENT_EMAIL!,
        privateKey: process.env.GOOGLE_PRIVATE_KEY!,
      },
    });

    const syncService = createFormsSyncService(syncRepo, formsClient);

    for (const source of sources as FormSourceRow[]) {
      // For now we reuse the same Google Form client; if you later support
      // multiple Google Forms, instantiate a client per source.
      await syncService.syncForm(source.id as string);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[forms-sync cron] Error:', err);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
