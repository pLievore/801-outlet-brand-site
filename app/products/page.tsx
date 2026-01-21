import Image from 'next/image';
import Link from 'next/link';
import { categories, products, type Product, type ProductCategory } from '../../src/data/products';

export default function ProductsPage({
  searchParams,
}: {
  searchParams?: { category?: string };
}) {
  const active = ((searchParams?.category || 'all') as string).toLowerCase();

  const filtered: Product[] =
    active === 'all'
      ? products
      : products.filter((p) => p.category === (active as ProductCategory));

  const chipBase =
    'inline-flex items-center rounded-full border px-4 py-2 text-sm font-semibold transition ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg))] ' +
    'hover:-translate-y-[1px] hover:shadow-sm active:translate-y-0';

  return (
    <main>
      <section className="mx-auto max-w-6xl px-5 pt-10 pb-14">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--muted))]">
              801 OUTLET • CATALOG
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">
              Browse products
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[rgb(var(--muted))]">
              Utah-only delivery. Browse here, then complete your purchase on Shopify.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                href="/products"
                className={
                  chipBase +
                  (active === 'all'
                    ? ' border-[rgb(var(--fg))] bg-[rgb(var(--fg))] text-white'
                    : ' border-[rgb(var(--border))] bg-white text-[rgb(var(--fg))] hover:bg-neutral-50')
                }
              >
                All
              </Link>

              {categories
                .filter((c) => ['sofas', 'sectionals', 'recliners', 'beds'].includes(c.key))
                .map((c) => (
                  <Link
                    key={c.key}
                    href={`/products?category=${c.key}`}
                    className={
                      chipBase +
                      (active === c.key
                        ? ' border-[rgb(var(--fg))] bg-[rgb(var(--fg))] text-white'
                        : ' border-[rgb(var(--border))] bg-white text-[rgb(var(--fg))] hover:bg-neutral-50')
                    }
                  >
                    {c.label}
                  </Link>
                ))}
            </div>
          </div>

          <div className="hidden text-xs text-[rgb(var(--muted))] md:block">
            {filtered.length} item{filtered.length === 1 ? '' : 's'} • Utah delivery only
          </div>
        </div>

        {/* Grid */}
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => {
            const primary = p.images?.[0];
            const secondary = p.images?.[1]; // pode ser undefined

            return (
              <Link
                key={p.slug}
                href={`/products/${p.slug}`}
                className="group rounded-2xl border border-[rgb(var(--border))] bg-white p-4 transition hover:-translate-y-[1px] hover:shadow-sm"
              >
                {/* Image area */}
                <div className="relative aspect-4/3 overflow-hidden rounded-xl bg-neutral-100">
                  {/* Primary */}
                  {primary ? (
                    <Image
                      src={primary.src}
                      alt={primary.alt || p.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className={
                        'object-cover transition duration-300 ' +
                        (secondary ? 'opacity-100 group-hover:opacity-0' : 'opacity-100') +
                        ' group-hover:scale-[1.02]'
                      }
                    />
                  ) : null}

                  {/* Secondary (only if exists) */}
                  {secondary ? (
                    <Image
                      src={secondary.src}
                      alt={secondary.alt || p.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover opacity-0 transition duration-300 group-hover:opacity-100 group-hover:scale-[1.02]"
                    />
                  ) : null}

                  {/* Save badge */}
                  {typeof p.compareAtPrice === 'number' && p.compareAtPrice > p.price ? (
                    <div className="absolute left-3 top-3 rounded-full bg-[rgb(var(--fg))] px-3 py-1 text-xs font-semibold text-white">
                      Save ${p.compareAtPrice - p.price}
                    </div>
                  ) : null}
                </div>

                {/* Content */}
                <div className="mt-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold">{p.title}</div>
                    <div className="mt-1 text-xs text-[rgb(var(--muted))]">
                      {p.shortDescription}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-semibold">${p.price}</div>
                    {typeof p.compareAtPrice === 'number' && p.compareAtPrice > p.price ? (
                      <div className="text-xs text-[rgb(var(--muted))] line-through">
                        ${p.compareAtPrice}
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Badges */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {p.fastDelivery ? (
                    <span className="rounded-full border border-[rgb(var(--border))] bg-white px-3 py-1 text-[11px] font-semibold text-[rgb(var(--fg))]">
                      Fast delivery
                    </span>
                  ) : (
                    <span className="rounded-full border border-[rgb(var(--border))] bg-white px-3 py-1 text-[11px] font-semibold text-[rgb(var(--fg))]">
                      Scheduled delivery
                    </span>
                  )}

                  {p.inStock ? (
                    <span className="rounded-full border border-[rgb(var(--border))] bg-white px-3 py-1 text-[11px] font-semibold text-[rgb(var(--fg))]">
                      In stock
                    </span>
                  ) : (
                    <span className="rounded-full border border-[rgb(var(--border))] bg-white px-3 py-1 text-[11px] font-semibold text-[rgb(var(--fg))]">
                      Limited
                    </span>
                  )}

                  {p.utahOnly ? (
                    <span className="rounded-full border border-[rgb(var(--border))] bg-white px-3 py-1 text-[11px] font-semibold text-[rgb(var(--fg))]">
                      Utah only
                    </span>
                  ) : null}
                </div>

                {/* CTA */}
                <div className="mt-4 text-xs font-semibold text-[rgb(var(--accent))]">
                  View details →
                </div>
              </Link>
            );
          })}
        </div>

        {/* Mobile count */}
        <div className="mt-8 text-center text-xs text-[rgb(var(--muted))] md:hidden">
          {filtered.length} item{filtered.length === 1 ? '' : 's'} • Utah delivery only
        </div>
      </section>
    </main>
  );
}
