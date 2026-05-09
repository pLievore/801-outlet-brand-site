import Image from 'next/image';
import Link from 'next/link';
import { ReactNode } from 'react';
import { env } from '../../src/config/env';
import { MiniCart } from '../components/mini-cart';
import { MobileNav } from '../components/mobile-nav';
import { NewsletterSignup } from '../components/newsletter-signup';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
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
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/account"
            className="hidden md:inline-flex items-center justify-center rounded-full p-2 transition hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg))]"
            aria-label="My account"
          >
            <svg className="size-5 text-[rgb(var(--fg))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </Link>

          <MiniCart />

          <a
            className={btnBase + ' hidden md:inline-flex bg-[rgb(var(--fg))] text-white hover:opacity-95 ' + btnLift}
            href={phoneHref}
          >
            Call Now
          </a>

          <MobileNav phoneHref={phoneHref} />
        </div>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-[rgb(var(--border))] bg-[rgb(var(--bg))]">
      <div className="mx-auto max-w-6xl px-5 py-14">
        {/* Top: brand statement + newsletter */}
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr] md:gap-16">
          <div>
            <div className="font-display text-3xl tracking-tight md:text-4xl">
              Made for living.
              <br />
              <span className="italic text-[rgb(var(--accent))]">Built to last.</span>
            </div>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-[rgb(var(--muted))]">
              Premium furniture, outlet pricing. Delivery available throughout Utah —
              we&apos;ll bring it home.
            </p>
          </div>

          <NewsletterSignup />
        </div>

        {/* Divider */}
        <div className="my-12 h-px bg-[rgb(var(--border))]" />

        {/* Bottom: links + copyright */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-semibold tracking-tight">801 Outlet</div>
            <div className="mt-1 text-xs text-[rgb(var(--muted))]">
              Utah, USA · Furniture for the long way home.
            </div>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[rgb(var(--muted))]">
            <Link className="transition hover:text-[rgb(var(--fg))]" href="/about">
              About
            </Link>
            <Link className="transition hover:text-[rgb(var(--fg))]" href="/delivery">
              Delivery
            </Link>
            <Link className="transition hover:text-[rgb(var(--fg))]" href="/contact">
              Contact
            </Link>
            <Link className="transition hover:text-[rgb(var(--fg))]" href="/privacy">
              Privacy
            </Link>
            <Link className="transition hover:text-[rgb(var(--fg))]" href="/terms">
              Terms
            </Link>
          </div>
        </div>

        <div className="mt-8 text-xs text-[rgb(var(--muted))]">
          © {new Date().getFullYear()} 801 Outlet. Crafted in Utah.
        </div>
      </div>
    </footer>
  );
}
