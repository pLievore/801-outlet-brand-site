import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import {
  MAINTENANCE_BYPASS_COOKIE,
  MAINTENANCE_BYPASS_PARAM,
  MAINTENANCE_PATH,
  MAINTENANCE_RETRY_AFTER_SECONDS,
  isMaintenanceEnabled,
  isPathAlwaysAllowed,
  matchesBypassToken,
} from './src/lib/content/maintenance';

/**
 * Maintenance gate: while `MAINTENANCE_MODE` is on, every public route serves
 * the maintenance page with HTTP 503 so nothing of the storefront loads. See
 * `src/lib/content/maintenance.ts` for why the status code matters to SEO.
 *
 * Returns `null` when the request should carry on to the storefront.
 */
function maintenanceGate(
  request: NextRequest,
  requestHeaders: Headers
): NextResponse | null {
  if (!isMaintenanceEnabled()) return null;

  const { pathname, searchParams } = request.nextUrl;
  if (isPathAlwaysAllowed(pathname)) return null;

  // `?preview=<token>` unlocks the site and remembers the choice in a cookie,
  // so the operator can click through the storefront while it is gated.
  const tokenFromQuery = searchParams.get(MAINTENANCE_BYPASS_PARAM);
  if (matchesBypassToken(tokenFromQuery)) {
    const cleanUrl = request.nextUrl.clone();
    cleanUrl.searchParams.delete(MAINTENANCE_BYPASS_PARAM);
    const response = NextResponse.redirect(cleanUrl);
    response.cookies.set(MAINTENANCE_BYPASS_COOKIE, tokenFromQuery as string, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
    return response;
  }

  if (matchesBypassToken(request.cookies.get(MAINTENANCE_BYPASS_COOKIE)?.value)) {
    return null;
  }

  return NextResponse.rewrite(new URL(MAINTENANCE_PATH, request.url), {
    request: { headers: requestHeaders },
    status: 503,
    headers: {
      'Retry-After': String(MAINTENANCE_RETRY_AFTER_SECONDS),
      'Cache-Control': 'no-store, must-revalidate',
    },
  });
}

/**
 * Fast-path guard for the premium admin panel (D-013). Only checks that the
 * panel session cookie exists; the signed value is fully verified in the
 * admin layout server component, where node crypto is available.
 */
function adminGuard(
  request: NextRequest,
  requestHeaders: Headers
): NextResponse {
  const { pathname } = request.nextUrl;

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

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  const gated = maintenanceGate(request, requestHeaders);
  if (gated) return gated;

  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return adminGuard(request, requestHeaders);
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    /*
     * Everything except Next.js internals, the crawler files and static
     * assets. `robots.txt` and `sitemap.xml` deliberately stay outside the
     * gate: a 503 on robots.txt makes Google pause crawling the whole site.
     * Asset requests are matched by extension, which also covers the files
     * the maintenance page itself needs (logo, fonts, styles).
     */
    '/((?!_next/static|_next/image|robots\\.txt|sitemap\\.xml|.*\\.(?:png|jpe?g|gif|webp|avif|svg|ico|mp4|webm|css|js|map|txt|xml|woff2?|ttf)$).*)',
  ],
};
