import Link from 'next/link';
import HeroVideo from './components/herovideo';

export default function HomePage() {
  return (
    <main>
      {/* HERO */}
      <section className="mx-auto max-w-6xl px-5 pt-14">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
          {/* Left */}
          <div>
            <div className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--muted))]">
              801 OUTLET • UTAH ONLY DELIVERY
            </div>

            <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">
              Premium comfort.
              <br />
              Outlet prices.
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-relaxed text-[rgb(var(--muted))]">
              Discover sofas, beds, recliners and more — curated deals ready for fast delivery
              across Utah. Browse the collection here, then complete your purchase on our Shopify
              store.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              {/* Internal navigation must use Link */}
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-full bg-[rgb(var(--fg))] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-[1px] hover:shadow-sm active:translate-y-0"
              >
                Browse products
              </Link>

              {/* External link can be <a> */}
              <a
                href="https://801-outlet-furniture.myshopify.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-[rgb(var(--border))] bg-white px-6 py-3 text-sm font-semibold text-[rgb(var(--fg))] transition hover:-translate-y-[1px] hover:bg-neutral-50 hover:shadow-sm active:translate-y-0"
              >
                Shop online
              </a>
            </div>

            <div className="mt-4 text-xs text-[rgb(var(--muted))]">
              Delivery available in Utah only. Scheduling confirmed after purchase.
            </div>
          </div>

          {/* Right */}
          <div className="relative">
            <div className="relative aspect-4/5 overflow-hidden rounded-3xl border border-[rgb(var(--border))] bg-white shadow-sm">
              {/* HERO VIDEO */}
              <HeroVideo />

              {/* overlay premium */}
              <div className="absolute inset-0 bg-linear-to-t from-black/35 via-black/0 to-black/0" />
              <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.25)]" />

              {/* info card */}
              <div className="absolute bottom-5 left-5 right-5">
                <div className="rounded-2xl bg-white/85 p-4 backdrop-blur">
                  <div className="text-sm font-semibold">Fast Utah delivery</div>
                  <div className="mt-1 text-xs text-[rgb(var(--muted))]">
                    We’ll contact you to schedule a delivery window.
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-[rgb(var(--muted))]">
              <span>Clean. Modern. Reliable.</span>
              <span className="font-semibold text-[rgb(var(--accent))]">801 Outlet</span>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-6xl px-5 py-14">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--muted))]">
              CURATED CATEGORIES
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
              Clean. Modern. Reliable.
            </h2>
          </div>

          <Link
            href="/products"
            className="hidden text-sm font-semibold text-[rgb(var(--accent))] transition hover:opacity-80 md:inline-block"
          >
            Browse all →
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: 'Sofas', href: '/products?category=sofas', desc: 'Browse selection' },
            { title: 'Beds', href: '/products?category=beds', desc: 'Browse selection' },
            { title: 'Recliners', href: '/products?category=recliners', desc: 'Browse selection' },
            {
              title: 'Sectionals',
              href: '/products?category=sectionals',
              desc: 'Browse selection',
            },
          ].map((c) => (
            <Link
              key={c.title}
              href={c.href}
              className="rounded-2xl border border-[rgb(var(--border))] bg-white p-5 transition hover:-translate-y-[1px] hover:shadow-sm"
            >
              <div className="text-sm font-semibold">{c.title}</div>
              <div className="mt-1 text-xs text-[rgb(var(--muted))]">{c.desc}</div>
              <div className="mt-4 text-xs font-semibold text-[rgb(var(--accent))]">View →</div>
            </Link>
          ))}
        </div>

        <div className="mt-6 md:hidden">
          <Link
            href="/products"
            className="inline-block text-sm font-semibold text-[rgb(var(--accent))] transition hover:opacity-80"
          >
            Browse all →
          </Link>
        </div>
      </section>
    </main>
  );
}
