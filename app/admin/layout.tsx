import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { ExternalLink, LineChart, LogOut, Package } from 'lucide-react';

import { hasValidPanelSession } from '../../src/lib/panel/session';
import { logoutAction } from './login/actions';

export const metadata: Metadata = {
  title: '801 Outlet — Panel',
  robots: { index: false, follow: false },
};

const NAV = [
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/sales', label: 'Sales', icon: LineChart },
];

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const headerList = await headers();
  const pathname = headerList.get('x-invoke-path') ?? '';
  const isLogin = pathname === '/admin/login';

  const authenticated = await hasValidPanelSession();
  if (!authenticated && !isLogin) {
    // The proxy already redirects cookie-less requests; this covers
    // invalid/expired signatures.
    redirect('/admin/login');
  }

  if (!authenticated) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-dvh bg-[rgb(var(--bg))]">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-[rgb(var(--border))] bg-white lg:flex">
        <div className="flex items-center gap-3 px-5 py-6">
          <span className="relative size-10 overflow-hidden rounded-xl border border-[rgb(var(--border))]">
            <Image
              src="/brand/icon-512x512.png"
              alt=""
              fill
              sizes="40px"
              className="object-contain p-1"
            />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-bold tracking-tight">801 Outlet</p>
            <p className="text-[11px] text-[rgb(var(--muted))]">Panel</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3" aria-label="Panel navigation">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[rgb(var(--fg))] transition hover:bg-[rgb(var(--surface-muted))]"
            >
              <item.icon aria-hidden="true" className="size-4 text-[rgb(var(--sage-ink))]" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="space-y-1 border-t border-[rgb(var(--border))] p-3">
          <a
            href="https://801outlet.vercel.app"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[rgb(var(--muted))] transition hover:bg-[rgb(var(--surface-muted))] hover:text-[rgb(var(--fg))]"
          >
            <ExternalLink aria-hidden="true" className="size-4" />
            View storefront
          </a>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[rgb(var(--muted))] transition hover:bg-[rgb(var(--surface-muted))] hover:text-[rgb(var(--fg))]"
            >
              <LogOut aria-hidden="true" className="size-4" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="flex items-center justify-between border-b border-[rgb(var(--border))] bg-white px-5 py-3 lg:hidden">
          <p className="text-sm font-bold">801 Outlet — Panel</p>
          <nav className="flex gap-4 text-sm font-semibold">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="hover:underline">
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        {children}
      </div>
    </div>
  );
}
