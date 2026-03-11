import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { CookieToSet } from '@/lib/supabase/types';
import type { Database } from './database.types';
import { supabaseUrl, supabaseRoleKey } from '@/lib/constants/env';

// TODO: ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local
// IMPORTANT: service role key bypasses RLS — use only in server-side admin contexts (cron, edge functions)
// For user-session-aware RSC, use the anon key + cookie forwarding instead
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl!, supabaseRoleKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        cookiesToSet: CookieToSet<Parameters<typeof cookieStore.set>[2]>[],
      ) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Server Component — cookie mutations are ignored here
        }
      },
    },
  });
}
