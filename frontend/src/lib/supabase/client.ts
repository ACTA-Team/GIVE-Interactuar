import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database.types';
import { supabaseUrl, supabaseKey } from '@/lib/constants/env';

// TODO: ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local
// Usage: only in Client Components ('use client')
export function createClient() {
  return createBrowserClient<Database>(supabaseUrl!, supabaseKey!);
}
