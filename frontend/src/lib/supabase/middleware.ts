import { createServerClient } from '@supabase/ssr';
import type { NextRequest, NextResponse } from 'next/server';
import type { CookieToSet } from '@/@types/supabase';
import type { Database } from './database.types';
import { supabaseUrl, supabaseKey } from '@/lib/constants/env';

// TODO: wire this up in project/src/middleware.ts to refresh sessions on every request
// Example:
//   import { createMiddlewareClient } from '@/lib/supabase/middleware'
//   export async function middleware(request: NextRequest) {
//     const response = NextResponse.next({ request })
//     const supabase = createMiddlewareClient(request, response)
//     await supabase.auth.getUser()
//     return response
//   }
export function createMiddlewareClient(
  request: NextRequest,
  response: NextResponse,
) {
  return createServerClient<Database>(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(
        cookiesToSet: CookieToSet<
          Parameters<NextResponse['cookies']['set']>[2]
        >[],
      ) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });
}
