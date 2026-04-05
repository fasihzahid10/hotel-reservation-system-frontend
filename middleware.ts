import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = process.env.COOKIE_NAME ?? 'hrs_access_token';

export function middleware(request: NextRequest) {
  const hasSession = Boolean(request.cookies.get(COOKIE_NAME)?.value);
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/dashboard') && !hasSession) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (pathname === '/login' && hasSession) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
