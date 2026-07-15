import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, ShoppingBag } from 'lucide-react';

import { env } from '../../src/config/env';
import type { NavigationLink } from '../../src/lib/navigation/types';
import { getMainNavigation } from '../../src/lib/shopify/navigation';
import { MobileNav } from '../components/mobile-nav';
import { buttonStyles } from '../components/ui/button';
import { Container } from '../components/ui/container';

export default async function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  const navigation = await getMainNavigation();
  const phoneHref = env.getPhoneHref();

  return (
    <div className="min-h-dvh">
      <a
        href="#main-content"
        className="fixed left-4 top-3 z-[100] -translate-y-24 rounded-full bg-[rgb(var(--fg))] px-5 py-3 text-sm font-semibold text-white transition focus:translate-y-0"
      >
        Skip to content
      </a>
      <AnnouncementBar />
      <SiteHeader navigation={navigation} phoneHref={phoneHref} />
      <div id="main-content" tabIndex={-1}>
        {children}
      </div>
      <SiteFooter />
    </div>
  );
}

function AnnouncementBar() {
  return (
    <div className="bg-[rgb(var(--sage-ink))] text-white">
      <Container className="flex min-h-9 items-center justify-center py-2 text-center text-xs font-semibold tracking-wide">
        Utah delivery available · Showroom visits by appointment
      </Container>
    </div>
  );
}

function SiteHeader({
  navigation,
  phoneHref,
}: {
  navigation: NavigationLink[];
  phoneHref: string;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg))]/95 backdrop-blur-xl">
      <Container size="wide" className="flex min-h-20 items-center gap-4 py-3">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-3 rounded-xl"
          aria-label="801 Outlet home"
        >
          <span className="relative size-11 overflow-hidden rounded-xl border border-[rgb(var(--border))] bg-white">
            <Image
              src="/brand/icon-512x512.png"
              alt=""
              fill
              sizes="44px"
              className="object-contain p-1"
              priority
            />
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block text-sm font-bold tracking-tight">801 Outlet</span>
            <span className="block text-[11px] text-[rgb(var(--muted))]">
              Best Furniture Store
            </span>
          </span>
        </Link>

        <nav
          className="ml-3 hidden items-center gap-1 lg:flex"
          aria-label="Main navigation"
        >
          {navigation.map((link) => (
            <NavigationItem key={link.id} link={link} />
          ))}
        </nav>

        <form action="/products" className="ml-auto hidden w-full max-w-xs md:block">
          <label htmlFor="site-search" className="sr-only">
            Search furniture
          </label>
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[rgb(var(--muted))]"
            />
            <input
              id="site-search"
              name="q"
              type="search"
              placeholder="Search furniture"
              className="min-h-11 w-full rounded-full border border-[rgb(var(--border-strong))] bg-white py-2 pl-11 pr-4 text-sm outline-none transition placeholder:text-[rgb(var(--muted))] focus:border-[rgb(var(--accent))] focus:ring-2 focus:ring-[rgb(var(--accent))]/15"
            />
          </div>
        </form>

        <button
          type="button"
          disabled
          className={buttonStyles({ variant: 'ghost', size: 'icon' })}
          aria-label="Cart is coming in the Shopify checkout phase"
          title="Cart is coming in the Shopify checkout phase"
        >
          <ShoppingBag aria-hidden="true" className="size-5" />
        </button>

        <a
          href={phoneHref}
          className={buttonStyles({
            variant: 'sage',
            size: 'md',
            className: 'hidden xl:inline-flex',
          })}
        >
          Call now
        </a>

        <MobileNav phoneHref={phoneHref} links={navigation} />
      </Container>
    </header>
  );
}

function NavigationItem({ link }: { link: NavigationLink }) {
  const className =
    'rounded-full px-3 py-2 text-sm font-semibold text-[rgb(var(--fg))] transition hover:bg-[rgb(var(--surface-muted))]';

  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noreferrer" className={className}>
        {link.label}
      </a>
    );
  }

  return (
    <Link href={link.href} className={className}>
      {link.label}
    </Link>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-[rgb(var(--border))] bg-[rgb(var(--surface))]">
      <Container size="wide" className="py-14 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr] lg:gap-16">
          <div>
            <div className="flex items-center gap-3">
              <span className="relative size-12 overflow-hidden rounded-xl border border-[rgb(var(--border))] bg-white">
                <Image
                  src="/brand/icon-512x512.png"
                  alt=""
                  fill
                  sizes="48px"
                  className="object-contain p-1"
                />
              </span>
              <div>
                <p className="font-bold tracking-tight">801 Outlet</p>
                <p className="text-xs text-[rgb(var(--muted))]">
                  Best Furniture Store
                </p>
              </div>
            </div>
            <p className="mt-5 max-w-md text-sm leading-6 text-[rgb(var(--muted))]">
              Quality furniture at outlet pricing, with delivery throughout Utah and
              personal service from our South Salt Lake showroom.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-bold">Explore</h2>
            <ul className="mt-4 space-y-3 text-sm text-[rgb(var(--muted))]">
              <li>
                <Link className="hover:text-[rgb(var(--fg))]" href="/products">
                  Catalog
                </Link>
              </li>
              <li>
                <Link className="hover:text-[rgb(var(--fg))]" href="/showroom">
                  Showroom
                </Link>
              </li>
              <li>
                <Link className="hover:text-[rgb(var(--fg))]" href="/delivery">
                  Delivery
                </Link>
              </li>
              <li>
                <Link className="hover:text-[rgb(var(--fg))]" href="/about">
                  About us
                </Link>
              </li>
              <li>
                <Link className="hover:text-[rgb(var(--fg))]" href="/contact">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div className="rounded-3xl bg-[rgb(var(--sage-soft))] p-6">
            <h2 className="text-sm font-bold text-[rgb(var(--sage-ink))]">
              Visit by appointment
            </h2>
            <p className="mt-3 text-sm leading-6 text-[rgb(var(--sage-ink))]">
              2251 South 400 East
              <br />
              South Salt Lake, UT 84115
            </p>
            <div className="mt-4 space-y-2 text-sm font-semibold">
              <a className="block hover:underline" href="tel:+18018546060">
                (801) 854-6060
              </a>
              <a
                className="block hover:underline"
                href="https://wa.me/13852016328"
              >
                WhatsApp: +1 (385) 201-6328
              </a>
              <a
                className="block break-all hover:underline"
                href="mailto:support@801outlet.com"
              >
                support@801outlet.com
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-5 border-t border-[rgb(var(--border))] pt-8 text-xs text-[rgb(var(--muted))] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} 801 Outlet. All rights reserved.</p>
          <div className="flex gap-5">
            <Link className="hover:text-[rgb(var(--fg))]" href="/privacy">
              Privacy
            </Link>
            <Link className="hover:text-[rgb(var(--fg))]" href="/terms">
              Terms
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
