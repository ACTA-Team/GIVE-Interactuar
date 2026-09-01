import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createSessionServerClient } from '@/lib/supabase/server';

/**
 * GET /auth/callback
 *
 * Exchanges a Supabase Auth code for a session — used by both email+
 * password signup confirmation and password-recovery links (Supabase
 * emails a link that lands here in both cases). An optional `next` param
 * picks the post-exchange destination (e.g. /auth/reset-password for the
 * recovery flow); defaults to the main app for signup confirmation. No
 * wallet-setup check needed here: course_completion issuance runs
 * server-side (COURSE_ISSUER_SECRET_KEY), not via the staff's own passkey
 * wallet — see /setup-wallet, only relevant to the legacy
 * impact/behavior/profile/mba flow.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next');
  // Only ever redirect to a same-app relative path — never follow an
  // arbitrary `next` value, which would be an open redirect.
  const destination = next?.startsWith('/') ? next : '/dashboard/certificados';

  if (!code) {
    return NextResponse.redirect(`${origin}/?error=auth_callback_failed`);
  }

  const supabase = await createSessionServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/?error=auth_callback_failed`);
  }

  return NextResponse.redirect(`${origin}${destination}`);
}
