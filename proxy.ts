import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Fast-path guard for the premium admin panel (D-013). Only checks that the
 * panel session cookie exists; the signed value is fully verified in the
 * admin layout server component, where node crypto is available.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  if (pathname === '/admin/login') {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const hasSession = Boolean(request.cookies.get('panel_session')?.value);
  if (!hasSession) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/admin/:path*'],
};
