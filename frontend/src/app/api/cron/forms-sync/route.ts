import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createFormsSyncRepository } from '@/features/forms-sync/repositories/formsSyncRepository';
import { createFormsSyncService } from '@/features/forms-sync/services/formsSyncService';
import { GoogleFormsClient } from '@/lib/services/googleFormsClient';

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

    // TODO: query active form_sources from DB and iterate over each
    const formsClient = new GoogleFormsClient({
      formId: process.env.GOOGLE_FORM_ID!,
      credentials: {
        clientEmail: process.env.GOOGLE_CLIENT_EMAIL!,
        privateKey: process.env.GOOGLE_PRIVATE_KEY!,
      },
    });

    const syncService = createFormsSyncService(syncRepo, formsClient);

    // TODO: replace with dynamic list of form source IDs from DB
    await syncService.syncForm(process.env.GOOGLE_FORM_SOURCE_ID!);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[forms-sync cron] Error:', err);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
