import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Instagram } from 'lucide-react';

import { env } from '../../src/config/env';
import {
  MODE_LABEL,
  SHOWROOM_HOURS,
  SHOWROOM_HOURS_SCHEMA,
} from '../../src/lib/content/hours';
import {
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
  SOCIAL_PROFILES,
} from '../../src/lib/content/social';
import type { NavigationLink } from '../../src/lib/navigation/types';
import { getMainNavigation } from '../../src/lib/shopify/navigation';
import { CartProvider } from '../components/cart/cart-provider';
import { CartButton, MiniCart } from '../components/cart/mini-cart';
import { MobileNav } from '../components/mobile-nav';
import { PredictiveSearch } from '../components/predictive-search';
import { TrackEvent } from '../components/track-event';
import { buttonStyles } from '../components/ui/button';
import { Container } from '../components/ui/container';

export default async function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  const navigation = await getMainNavigation();
  const phoneHref = env.getPhoneHref();

  // Identity for search engines: name, logo and storefront details. Google
  // uses this (plus the favicon) to render the brand in results.
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'FurnitureStore',
    '@id': `${env.siteUrl}/#store`,
    name: '801 Outlet',
    description:
      'Furniture outlet in South Salt Lake — sofas, sectionals, recliners and more, with delivery across Utah.',
    url: env.siteUrl,
    logo: `${env.siteUrl}/icon.png`,
    image: `${env.siteUrl}/opengraph-image.png`,
    telephone: env.phoneE164,
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '2251 South 400 East',
      addressLocality: 'South Salt Lake',
      addressRegion: 'UT',
      postalCode: '84115',
      addressCountry: 'US',
    },
    openingHoursSpecification: SHOWROOM_HOURS_SCHEMA.map((entry) => ({
      '@type': 'OpeningHoursSpecification',
      ...entry,
    })),
    areaServed: ['Utah', 'Wyoming', 'Idaho', 'Nevada'],
    sameAs: SOCIAL_PROFILES,
  };

  return (
    <CartProvider>
      <div className="min-h-dvh">
        <script
          type="application/ld+json"
          // Serialized server-side from constants above — no user input.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <TrackEvent />
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
        <MiniCart />
      </div>
    </CartProvider>
  );
}

function AnnouncementBar() {
  return (
    <div className="bg-[rgb(var(--sage-ink))] text-white">
      <Container className="flex min-h-9 items-center justify-center py-2 text-center text-xs font-semibold tracking-wide">
        Utah delivery available · Showroom open weekends for walk-ins
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

        {/* Everything from here sits flush right — the search is hidden on
            small screens, so the auto margin has to live on the group. */}
        <div className="ml-auto flex items-center gap-3 md:w-full md:max-w-xs md:flex-1 xl:max-w-sm">
          <PredictiveSearch className="hidden w-full md:block" />

          <CartButton />

          <a
            href={phoneHref}
            className={buttonStyles({
              variant: 'sage',
              size: 'md',
              className: 'hidden shrink-0 xl:inline-flex',
            })}
          >
            Call now
          </a>

          <MobileNav phoneHref={phoneHref} links={navigation} />
        </div>
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
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-[rgb(var(--border-strong))] px-4 py-2 text-sm font-semibold transition hover:border-[rgb(var(--fg))]"
            >
              <Instagram aria-hidden="true" className="size-4" />
              {INSTAGRAM_HANDLE}
            </a>
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
              Visit our showroom
            </h2>
            <p className="mt-3 text-sm leading-6 text-[rgb(var(--sage-ink))]">
              2251 South 400 East
              <br />
              South Salt Lake, UT 84115
            </p>
            <div className="mt-3 text-sm leading-6 text-[rgb(var(--sage-ink))]">
              {SHOWROOM_HOURS.map((entry) => (
                <p key={entry.days}>
                  {entry.days}: {entry.time} (
                  {MODE_LABEL[entry.mode].toLowerCase()})
                </p>
              ))}
            </div>
            <div className="mt-4 space-y-2 text-sm font-semibold">
              <a className="block hover:underline" href="tel:+18018546060">
                Call or text: (801) 854-6060
              </a>
              <a
                className="block hover:underline"
                href="https://wa.me/18018546060"
              >
                WhatsApp: (801) 854-6060
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
