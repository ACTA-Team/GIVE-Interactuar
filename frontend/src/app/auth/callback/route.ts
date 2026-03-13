import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createSessionServerClient } from '@/lib/supabase/server';

/**
 * GET /auth/callback
 *
 * Exchanges the OAuth code for a session, then redirects to /setup-wallet
 * with query params that tell the client what still needs to be done:
 *
 *   - No wallet row          → /setup-wallet            (full setup)
 *   - Wallet + vault done    → /setup-wallet?reconnect=1 (passkey only)
 *   - Wallet + vault pending → /setup-wallet?reconnect=1&setup_vault=1
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: walletRow } = await (supabase as any)
      .from('user_wallets')
      .select('id, vault_initialized')
      .eq('user_id', user.id)
      .maybeSingle();

    const setupUrl = new URL(`${origin}/setup-wallet`);

    if (walletRow) {
      setupUrl.searchParams.set('reconnect', '1');
      if (!walletRow.vault_initialized) {
        setupUrl.searchParams.set('setup_vault', '1');
      }
    }

    return NextResponse.redirect(setupUrl.toString());
  }

  return NextResponse.redirect(`${origin}/setup-wallet`);
}
