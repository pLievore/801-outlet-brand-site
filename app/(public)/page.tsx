import Link from 'next/link';
import HeroVideo from '../components/herovideo';
import { ProductCard } from '../components/product-card';
import { env } from '../../src/config/env';
import { getRecentProducts } from '../../src/lib/products';
import { FadeIn, FadeMount, StaggerGrid, StaggerItem } from '../components/motion';

export const revalidate = 60;

export default async function HomePage() {
  const phoneHref = env.getPhoneHref();
  const featured = await getRecentProducts(4);

  return (
    <main>
      {/* HERO */}
      <section className="mx-auto max-w-6xl px-5 pt-12 pb-4 md:pt-16">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
          {/* Left */}
          <div>
            <FadeMount delay={0.05}>
              <div className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--muted))]">
                801 OUTLET • UTAH ONLY DELIVERY
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
                Discover sofas, beds, recliners and more — curated deals ready for fast delivery
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
            {featured.map((p) => (
              <StaggerItem key={p.slug}>
                <ProductCard p={p} />
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
            { n: '01', title: 'Sofas', href: '/products?category=sofas', desc: 'Plush & modern' },
            { n: '02', title: 'Beds', href: '/products?category=beds', desc: 'Restful nights' },
            { n: '03', title: 'Recliners', href: '/products?category=recliners', desc: 'Ultimate comfort' },
            { n: '04', title: 'Sectionals', href: '/products?category=sectionals', desc: 'Room-fillers' },
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

      {/* TRUST STRIP */}
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
                  sub: 'PCI-safe by Square',
                  icon: (
                    <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V8a4 4 0 118 0v3" />
                      <rect x="5" y="11" width="14" height="9" rx="1.5" strokeLinejoin="round" />
                    </svg>
                  ),
                },
                {
                  label: 'Real humans',
                  sub: 'Call us anytime',
                  icon: (
                    <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h2.5a1 1 0 01.95.68l1.5 4.5a1 1 0 01-.5 1.21l-2 1a11 11 0 005.16 5.16l1-2a1 1 0 011.21-.5l4.5 1.5a1 1 0 01.68.95V19a2 2 0 01-2 2h-1A14 14 0 013 6V5z" />
                    </svg>
                  ),
                },
                {
                  label: 'Curated quality',
                  sub: 'Hand-picked, every piece',
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
    </main>
  );
}

