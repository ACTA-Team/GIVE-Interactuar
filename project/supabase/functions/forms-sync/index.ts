// Supabase Edge Function — forms-sync
// Deno runtime (not Node.js). Uses Deno APIs and esm.sh imports.
//
// Deploy: supabase functions deploy forms-sync
// Invoke manually: supabase functions invoke forms-sync --no-verify-jwt
// Schedule via pg_cron or Supabase Dashboard → Edge Functions → Schedules
//
// TODO: implement full sync logic (mirrors api/cron/forms-sync/route.ts but runs on the edge)
// TODO: consider whether to keep both the Next.js cron route AND this edge function,
//       or consolidate to one. Edge functions run closer to the DB; Next.js route is simpler to test.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Types mirrored from features/forms-sync — cannot import from src/ in edge functions
interface FormSource {
  id: string
  external_form_id: string
  name: string
  active: boolean
}

Deno.serve(async (req: Request) => {
  // TODO: verify Authorization header with SUPABASE_FUNCTIONS_SECRET or a custom CRON_SECRET
  // const authHeader = req.headers.get('Authorization')
  // if (authHeader !== `Bearer ${Deno.env.get('CRON_SECRET')}`) {
  //   return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  // }
  void req

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Fetch all active form sources for the organisation
    const { data: sources, error: sourcesError } = await supabase
      .from('form_sources')
      .select('id, external_form_id, name, active')
      .eq('active', true)

    if (sourcesError) throw sourcesError

    const results: Array<{ formSourceId: string; status: string; error?: string }> = []

    for (const source of (sources ?? []) as FormSource[]) {
      try {
        // TODO: instantiate GoogleFormsClient with credentials from env
        // TODO: call syncService.syncForm(source.id)
        // Placeholder — log intent
        console.log(`[forms-sync] Would sync form: ${source.name} (${source.external_form_id})`)
        results.push({ formSourceId: source.id, status: 'skipped — not implemented' })
      } catch (err) {
        console.error(`[forms-sync] Failed for source ${source.id}:`, err)
        results.push({ formSourceId: source.id, status: 'error', error: String(err) })
      }
    }

    return new Response(JSON.stringify({ ok: true, results }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[forms-sync] Fatal error:', err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
