import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { CookieToSet } from '@/lib/supabase/types';
import type { Database } from './database.types';
import { supabaseUrl, supabaseKey, supabaseRoleKey } from '@/lib/constants/env';

// IMPORTANT: service role key bypasses RLS — use only in server-side admin contexts (cron, edge functions)
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

// Session-aware client using anon key + cookie forwarding (respects RLS)
export async function createSessionServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl!, supabaseKey!, {
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
