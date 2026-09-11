import { type NextRequest, NextResponse } from 'next/server';
import { REFRESH_TOKEN_COOKIE } from '@/features/auth/auth.constants';
import { AUTH_ROUTES, NEXT_PARAM, ROUTES } from '@/lib/constants';

const isAuthRoute = (pathname: string) =>
  AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));

/**
 * Optimistic session check: only looks at cookie presence, never validates the token.
 * The client-side AuthGuard is the second line of defence for expired or revoked sessions.
 */
export const proxy = (request: NextRequest) => {
  const { pathname, search } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(REFRESH_TOKEN_COOKIE)?.value);

  if (isAuthRoute(pathname)) {
    return hasSession ? NextResponse.redirect(new URL(ROUTES.DASHBOARD, request.url)) : NextResponse.next();
  }

  if (!hasSession) {
    const loginUrl = new URL(ROUTES.LOGIN, request.url);
    if (pathname !== ROUTES.HOME) {
      loginUrl.searchParams.set(NEXT_PARAM, `${pathname}${search}`);
    }
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === ROUTES.HOME) {
    return NextResponse.redirect(new URL(ROUTES.DASHBOARD, request.url));
  }

  return NextResponse.next();
};

export const config = {
  // Everything except Next internals and files with an extension (public assets).
  matcher: ['/((?!_next/static|_next/image|.*\\..*).*)'],
};
