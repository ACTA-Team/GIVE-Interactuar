import { auth } from '@/lib/auth';

const PROTECTED_PREFIXES = ['/dashboard', '/profile'];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    nextUrl.pathname.startsWith(prefix),
  );

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL('/login', nextUrl);
    return Response.redirect(loginUrl);
  }
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
