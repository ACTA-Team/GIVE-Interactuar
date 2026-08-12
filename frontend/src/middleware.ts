import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@/lib/supabase/middleware';

const PROTECTED_ROUTES = ['/dashboard', '/setup-wallet'];

// TODO: remove — temporary bypass to unblock local development.
// Set NEXT_PUBLIC_DISABLE_AUTH=true in .env to skip the auth gate.
const AUTH_DISABLED = process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });
  const supabase = createMiddlewareClient(request, response);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  if (!AUTH_DISABLED && !user && isProtected) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Authenticated users on the login page → certificate upload flow
  // But not if they're coming from setup-wallet (handled by callback)
  if (user && pathname === '/') {
    return NextResponse.redirect(
      new URL('/dashboard/certificados', request.url),
    );
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
