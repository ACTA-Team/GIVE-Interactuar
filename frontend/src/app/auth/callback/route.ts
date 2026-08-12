import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createSessionServerClient } from '@/lib/supabase/server';

/**
 * GET /auth/callback
 *
 * Exchanges the signup-confirmation code for a session (email+password
 * signup — Supabase emails a link that lands here), then redirects to the
 * main flow. No wallet-setup check needed here: course_completion
 * issuance runs server-side (COURSE_ISSUER_SECRET_KEY), not via the
 * staff's own passkey wallet — see /setup-wallet, only relevant to the
 * legacy impact/behavior/profile/mba flow.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(`${origin}/?error=auth_callback_failed`);
  }

  const supabase = await createSessionServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/?error=auth_callback_failed`);
  }

  return NextResponse.redirect(`${origin}/dashboard/certificados`);
}
