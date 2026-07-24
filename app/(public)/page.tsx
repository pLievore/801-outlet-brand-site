import Link from 'next/link';
import { CalendarDays, Clock, MapPin } from 'lucide-react';

import HeroVideo from '../components/herovideo';
import { CatalogProductCard } from '../components/catalog-product-card';
import { ReviewsSection } from '../components/reviews-section';
import { env } from '../../src/config/env';
import { MODE_LABEL, SHOWROOM_HOURS } from '../../src/lib/content/hours';
import { getProducts } from '../../src/lib/shopify';
import { adaptProductCard } from '../../src/lib/shopify/adapters/products';
import { FadeIn, FadeMount, StaggerGrid, StaggerItem } from '../components/motion';
import { ButtonLink } from '../components/ui/button';
import { Container } from '../components/ui/container';
import { Section } from '../components/ui/section';

export const revalidate = 60;

export default async function HomePage() {
  const phoneHref = env.getPhoneHref();
  const featured = (await getProducts({ first: 4 })).nodes.map(
    adaptProductCard
  );

  return (
    <main>
      {/* HERO */}
      <section className="mx-auto max-w-6xl px-5 pt-12 pb-4 md:pt-16">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
          {/* Left */}
          <div>
            <FadeMount delay={0.05}>
              <div className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--muted))]">
                801 OUTLET · UTAH DELIVERY
              </div>
            </FadeMount>

            <FadeMount delay={0.12}>
              <h1 className="mt-4 font-display text-5xl font-medium leading-[0.95] tracking-tight md:text-7xl">
                Premium comfort.
                <br />
                <span className="italic text-[rgb(var(--accent))]">Outlet prices.</span>
              </h1>
            </FadeMount>

            <FadeMount delay={0.2}>
              <p className="mt-5 max-w-xl text-sm leading-relaxed text-[rgb(var(--muted))]">
                Discover sofas, sectionals, recliners and more — curated deals ready for delivery
                across Utah.
              </p>
            </FadeMount>

            <FadeMount delay={0.28}>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center rounded-full bg-[rgb(var(--fg))] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-[1px] hover:shadow-md active:translate-y-0"
                >
                  Browse products
                </Link>

                <a
                  href={phoneHref}
                  className="inline-flex items-center justify-center rounded-full border border-[rgb(var(--border))] bg-white px-6 py-3 text-sm font-semibold text-[rgb(var(--fg))] transition hover:-translate-y-[1px] hover:bg-neutral-50 hover:shadow-sm active:translate-y-0"
                >
                  Call us
                </a>
              </div>

              <div className="mt-4 text-xs text-[rgb(var(--muted))]">
                Delivery available in Utah only. Scheduling confirmed after purchase.
              </div>
            </FadeMount>
          </div>

          {/* Right */}
          <FadeMount delay={0.1} distance={32}>
            <div className="relative">
              <div className="relative aspect-4/5 overflow-hidden rounded-3xl border border-[rgb(var(--border))] bg-white shadow-lg">
                <HeroVideo />
                <div className="absolute inset-0 bg-linear-to-t from-black/35 via-black/0 to-black/0" />
                <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.25)]" />
                <div className="absolute bottom-5 left-5 right-5">
                  <div className="rounded-2xl bg-white/85 p-4 backdrop-blur">
                    <div className="text-sm font-semibold">Fast Utah delivery</div>
                    <div className="mt-1 text-xs text-[rgb(var(--muted))]">
                      We&apos;ll contact you to schedule a delivery window.
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-[rgb(var(--muted))]">
                <span>Clean. Modern. Reliable.</span>
                <span className="font-semibold text-[rgb(var(--accent))]">801 Outlet</span>
              </div>
            </div>
          </FadeMount>
        </div>
      </section>

      {/* TRUST STRIP */}
      <TrustStrip />

      {/* FEATURED PRODUCTS */}
      {featured.length > 0 ? (
        <section className="mx-auto max-w-6xl px-5 pt-16 pb-4">
          <FadeIn>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--muted))]">
                  FEATURED PRODUCTS
                </p>
                <h2 className="mt-3 font-display text-3xl font-medium tracking-tight md:text-4xl">
                  Just <span className="italic">landed</span>
                </h2>
              </div>
              <Link
                href="/products"
                className="hidden text-sm font-semibold text-[rgb(var(--accent))] transition hover:opacity-80 md:inline-block"
              >
                See all →
              </Link>
            </div>
          </FadeIn>

          <StaggerGrid className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {featured.map((product) => (
              <StaggerItem key={product.id}>
                <CatalogProductCard product={product} />
              </StaggerItem>
            ))}
          </StaggerGrid>

          <div className="mt-5 md:hidden">
            <Link
              href="/products"
              className="inline-block text-sm font-semibold text-[rgb(var(--accent))] transition hover:opacity-80"
            >
              See all →
            </Link>
          </div>
        </section>
      ) : null}

      {/* CATEGORIES */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <FadeIn>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--muted))]">
                CURATED CATEGORIES
              </p>
              <h2 className="mt-3 font-display text-3xl font-medium tracking-tight md:text-4xl">
                Find your <span className="italic">style</span>
              </h2>
            </div>
            <Link
              href="/products"
              className="hidden text-sm font-semibold text-[rgb(var(--accent))] transition hover:opacity-80 md:inline-block"
            >
              Browse all →
            </Link>
          </div>
        </FadeIn>

        <StaggerGrid className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {[
            { n: '01', title: 'Sectionals', href: '/products?q=Sectional', desc: 'Space to stretch out' },
            { n: '02', title: 'Sleeper sofas', href: '/products?q=Sleeper', desc: 'Comfort that converts' },
            { n: '03', title: 'Leather', href: '/products?q=Leather', desc: 'Durable, timeless comfort' },
            { n: '04', title: 'In stock', href: '/products?availability=available', desc: 'Available right now' },
          ].map((c) => (
            <StaggerItem key={c.title}>
              <Link
                href={c.href}
                className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-[rgb(var(--border))] bg-white p-6 transition will-change-transform hover:-translate-y-[2px] hover:border-[rgb(var(--accent))]/50 hover:shadow-[0_10px_32px_rgba(0,0,0,0.07)]"
              >
                <span className="font-display text-3xl italic text-[rgb(var(--accent))]">
                  {c.n}
                </span>
                <span
                  aria-hidden="true"
                  className="absolute right-5 top-6 h-px w-12 bg-[rgb(var(--border))] transition group-hover:bg-[rgb(var(--accent))]/40"
                />
                <div className="mt-6 text-base font-semibold tracking-tight">{c.title}</div>
                <div className="mt-1 text-xs text-[rgb(var(--muted))]">{c.desc}</div>
                <div className="mt-6 inline-flex items-center gap-1 text-xs font-semibold text-[rgb(var(--accent))] transition group-hover:translate-x-0.5">
                  Browse
                  <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerGrid>

        <div className="mt-6 md:hidden">
          <Link
            href="/products"
            className="inline-block text-sm font-semibold text-[rgb(var(--accent))] transition hover:opacity-80"
          >
            Browse all →
          </Link>
        </div>
      </section>

      {/* EDITORIAL VALUE PROP */}
      <FadeIn>
        <section className="border-y border-[rgb(var(--border))] bg-[rgb(var(--sage-soft))]">
          <Container size="narrow" className="py-16 text-center md:py-20">
            <p className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--sage-ink))]">
              WHY 801 OUTLET
            </p>
            <h2 className="mt-4 font-display text-3xl leading-tight tracking-tight text-[rgb(var(--sage-ink))] md:text-5xl">
              Quality furniture at outlet pricing,
              <br className="hidden md:block" /> with{' '}
              <span className="italic">personal service</span>.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[rgb(var(--sage-ink))]">
              Every piece is hand-picked, priced below retail, and backed by our
              team in South Salt Lake — from your first question to delivery at
              your door.
            </p>
          </Container>
        </section>
      </FadeIn>

      {/* REVIEWS */}
      <ReviewsSection />

      {/* SHOWROOM */}
      <FadeIn>
        <Section spacing="sm">
          <Container>
            <div className="grid overflow-hidden rounded-3xl border border-[rgb(var(--border))] bg-white lg:grid-cols-2">
              <div className="flex flex-col justify-center p-8 md:p-12">
                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[rgb(var(--sage-soft))] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[rgb(var(--sage-ink))]">
                  <CalendarDays aria-hidden="true" className="size-4" />
                  Open weekends · weekdays by appointment
                </span>
                <h2 className="mt-5 font-display text-3xl tracking-tight md:text-4xl">
                  Visit our <span className="italic">showroom</span>
                </h2>
                <p className="mt-4 max-w-md text-sm leading-6 text-[rgb(var(--muted))]">
                  See and feel available pieces in person, and get help finding
                  the right fit for your home.
                </p>
                <div className="mt-6">
                  <ButtonLink href="/showroom#plan-your-visit" variant="sage" size="lg">
                    Schedule a visit
                  </ButtonLink>
                </div>
              </div>
              <div className="flex flex-col justify-center gap-4 border-t border-[rgb(var(--border))] bg-[rgb(var(--surface-muted))] p-8 md:p-12 lg:border-l lg:border-t-0">
                <div className="flex items-start gap-3">
                  <MapPin
                    aria-hidden="true"
                    className="mt-0.5 size-5 shrink-0 text-[rgb(var(--sage-ink))]"
                  />
                  <p className="text-sm leading-6">
                    <span className="font-semibold">801 Outlet showroom</span>
                    <br />
                    2251 South 400 East
                    <br />
                    South Salt Lake, UT 84115
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Clock
                    aria-hidden="true"
                    className="mt-0.5 size-5 shrink-0 text-[rgb(var(--sage-ink))]"
                  />
                  <div className="text-sm leading-6">
                    <p className="font-semibold">Hours</p>
                    {SHOWROOM_HOURS.map((entry) => (
                      <p key={entry.days}>
                        {entry.days}: {entry.time} ·{' '}
                        {MODE_LABEL[entry.mode].toLowerCase()}
                      </p>
                    ))}
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-[rgb(var(--muted))]">
                  Weekday appointments are confirmed by text message or phone
                  call before your visit.
                </p>
              </div>
            </div>
          </Container>
        </Section>
      </FadeIn>

      {/* FINAL CTA */}
      <FadeIn>
        <Section aria-labelledby="final-cta-heading">
          <Container size="narrow" className="text-center">
            <h2
              id="final-cta-heading"
              className="font-display text-4xl leading-tight tracking-tight md:text-5xl"
            >
              Ready to find <span className="italic">your piece</span>?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[rgb(var(--muted))]">
              Browse what&apos;s in stock today — new deals land every week.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <ButtonLink href="/products" variant="primary" size="lg">
                Browse products
              </ButtonLink>
              <ButtonLink href="/showroom" variant="secondary" size="lg">
                Plan a showroom visit
              </ButtonLink>
            </div>
          </Container>
        </Section>
      </FadeIn>
    </main>
  );
}

function TrustStrip() {
  return (
    <FadeIn>
      <section className="border-y border-[rgb(var(--border))] bg-white/50">
        <div className="mx-auto max-w-6xl px-5 py-10">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {[
              {
                label: 'Utah delivery',
                sub: 'Fast & local',
                icon: (
                  <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h11v9H3zM14 11h4l3 3v2h-7M5.5 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm12 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                  </svg>
                ),
              },
              {
                label: 'Secure checkout',
                sub: 'Secure Shopify checkout',
                icon: (
                  <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V8a4 4 0 118 0v3" />
                    <rect x="5" y="11" width="14" height="9" rx="1.5" strokeLinejoin="round" />
                  </svg>
                ),
              },
              {
                label: 'Personal support',
                sub: 'Talk with our team',
                icon: (
                  <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h2.5a1 1 0 01.95.68l1.5 4.5a1 1 0 01-.5 1.21l-2 1a11 11 0 005.16 5.16l1-2a1 1 0 011.21-.5l4.5 1.5a1 1 0 01.68.95V19a2 2 0 01-2 2h-1A14 14 0 013 6V5z" />
                  </svg>
                ),
              },
              {
                label: 'Showroom visits',
                sub: 'Walk in on weekends',
                icon: (
                  <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ),
              },
            ].map((t) => (
              <div key={t.label} className="flex items-start gap-3">
                <div className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--accent-soft))] text-[rgb(var(--accent))]">
                  {t.icon}
                </div>
                <div>
                  <div className="text-xs font-semibold">{t.label}</div>
                  <div className="mt-0.5 text-xs text-[rgb(var(--muted))]">{t.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </FadeIn>
  );
}
