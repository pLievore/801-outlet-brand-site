export default function HomePage() {
  const SHOPIFY_URL =
    'https://your-shopify-store.com/?utm_source=brand_site&utm_medium=hero&utm_campaign=shop_redirect';

  const btnBase =
    'inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold ' +
    'transition will-change-transform focus-visible:outline-none focus-visible:ring-2 ' +
    'focus-visible:ring-[rgb(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg))]';

  const btnLift = 'hover:-translate-y-[1px] hover:shadow-sm active:translate-y-0';

  const cardBase =
    'group rounded-2xl border border-[rgb(var(--border))] bg-white p-5 transition ' +
    'hover:-translate-y-[1px] hover:shadow-sm';

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-[0.18]" />
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-5 py-16 md:grid-cols-2 md:py-24">
          <div className="flex flex-col justify-center">
            <p className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--muted))]">
              801 OUTLET • UTAH ONLY DELIVERY
            </p>

            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[rgb(var(--fg))] md:text-6xl">
              Premium comfort.
              <span className="block">Outlet prices.</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-[rgb(var(--muted))]">
              Discover sofas, beds, recliners and more — curated deals ready for fast delivery
              across Utah. Browse the collection here, then complete your purchase on our Shopify
              store.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                className={btnBase + ' bg-[rgb(var(--fg))] text-white hover:opacity-95 ' + btnLift}
                href="/products"
              >
                Browse products
              </a>

              <a
                className={
                  btnBase +
                  ' border border-[rgb(var(--border))] bg-white text-[rgb(var(--fg))] hover:bg-neutral-50 ' +
                  btnLift
                }
                href={SHOPIFY_URL}
                target="_blank"
                rel="noreferrer"
              >
                Shop online
              </a>
            </div>

            <div className="mt-6 text-xs text-[rgb(var(--muted))]">
              Delivery available in Utah only. Scheduling confirmed after purchase.
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-4/5 overflow-hidden rounded-3xl border border-[rgb(var(--border))] bg-white shadow-sm">
              <video
                className="h-full w-full object-cover"
                autoPlay
                muted
                playsInline
                loop
                preload="metadata"
                poster="/brand/hero-poster.jpg"
              >
                <source src="/brand/hero.mp4" type="video/mp4" />
              </video>

              <div className="absolute inset-0 bg-linear-to-t from-black/35 via-black/0 to-black/0" />
              <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.25)]" />

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
              <span className="text-[rgb(var(--accent))]">801 Outlet</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { name: 'Sofas', href: '/products?category=sofas' },
            { name: 'Beds', href: '/products?category=beds' },
            { name: 'Recliners', href: '/products?category=recliners' },
            { name: 'Sectionals', href: '/products?category=sectionals' },
          ].map((c) => (
            <a key={c.name} href={c.href} className={cardBase}>
              <div className="text-sm font-semibold">{c.name}</div>
              <div className="mt-1 text-xs text-[rgb(var(--muted))]">Browse selection</div>
              <div className="mt-4 text-xs font-semibold text-[rgb(var(--accent))]">
                View →
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
