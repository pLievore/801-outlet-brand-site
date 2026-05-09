import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Lightweight admin auth check (Next 16 proxy convention — replaces middleware).
 * Full role verification (admin_users table lookup) happens in the layout server component.
 * Here we only check that a Supabase auth cookie exists — fast path to protect the route.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always forward pathname so the admin layout can read it
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  // Skip the admin login page itself
  if (pathname === '/admin/login') {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Check for any Supabase auth token cookie
  const cookies = request.cookies.getAll();
  const hasAuth = cookies.some((c) => c.name.endsWith('-auth-token') && c.value.length > 0);

  if (!hasAuth) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/admin/:path*'],
};
