import './globals.css';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ReactNode } from 'react';
import { Analytics } from '@vercel/analytics/next';
import { env } from '../src/config/env';

export const metadata: Metadata = {
  title: '801 Outlet — Premium Furniture Deals in Utah',
  description:
    'Sofas, beds, recliners and more. Utah-only delivery. Browse products and shop online.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-dvh">
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </div>
        <Analytics />
      </body>
    </html>
  );
}

function SiteHeader() {
  const SHOPIFY_URL = env.getShopifyUrl();
  const phoneHref = env.getPhoneHref();

  const btnBase =
    'inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold ' +
    'transition will-change-transform focus-visible:outline-none focus-visible:ring-2 ' +
    'focus-visible:ring-[rgb(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg))]';

  const btnLift = 'hover:-translate-y-[1px] hover:shadow-sm active:translate-y-0';

  const navLink =
    'rounded-md px-2 py-1 text-sm font-medium text-[rgb(var(--fg))] transition ' +
    'hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 ' +
    'focus-visible:ring-[rgb(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg))]';

  return (
    <header className="sticky top-0 z-50 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg))]/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative size-9 overflow-hidden rounded-full border border-[rgb(var(--border))] bg-white">
            <Image
              src="/brand/icon-512x512.png"
              alt="801 Outlet"
              fill
              className="object-contain p-1"
              priority
            />
          </div>

          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">801 Outlet</div>
            <div className="text-xs text-[rgb(var(--muted))]">Utah • Furniture Deals</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-3 md:flex">
          <Link className={navLink} href="/products">
            Products
          </Link>
          <Link className={navLink} href="/delivery">
            Delivery
          </Link>
          <Link className={navLink} href="/about">
            About
          </Link>

          <a
            className={
              btnBase +
              ' ml-2 border border-[rgb(var(--border))] bg-white text-[rgb(var(--fg))] hover:bg-neutral-50 ' +
              btnLift
            }
            href={SHOPIFY_URL}
            target="_blank"
            rel="noreferrer"
          >
            Shop
          </a>
        </nav>

        {/* Primary CTA: Call Now */}
        <a
          className={btnBase + ' bg-[rgb(var(--fg))] text-white hover:opacity-95 ' + btnLift}
          href={phoneHref}
        >
          Call Now
        </a>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-[rgb(var(--border))]">
      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-semibold">801 Outlet</div>
            <div className="text-sm text-[rgb(var(--muted))]">
              Premium furniture deals. Delivery available in Utah only.
            </div>
          </div>

          <div className="flex gap-6 text-sm text-[rgb(var(--muted))]">
            <Link className="hover:text-[rgb(var(--fg))]" href="/privacy">
              Privacy
            </Link>
            <Link className="hover:text-[rgb(var(--fg))]" href="/terms">
              Terms
            </Link>
            <Link className="hover:text-[rgb(var(--fg))]" href="/contact">
              Contact
            </Link>
            <Link className="hover:text-[rgb(var(--fg))]" href="/about">
              About
            </Link>
            <Link className="hover:text-[rgb(var(--fg))]" href="/delivery">
              Delivery
            </Link>
          </div>
        </div>

        <div className="mt-8 text-xs text-[rgb(var(--muted))]">
          © {new Date().getFullYear()} 801 Outlet. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
