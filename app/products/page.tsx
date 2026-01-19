import Link from 'next/link';
import { categories, products } from '../../src/data/products';
import type { Product, ProductCategory } from '../../src/data/products';

export default function ProductsPage({
  searchParams,
}: {
  searchParams?: { category?: string };
}) {
  const active = ((searchParams?.category || 'all') as string).toLowerCase();

  const filtered: Product[] =
    active === 'all'
      ? products
      : products.filter((p: Product) => p.category === (active as ProductCategory));

  const chipBase =
    'inline-flex items-center rounded-full border px-4 py-2 text-sm font-semibold transition ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg))] ' +
    'hover:-translate-y-[1px] hover:shadow-sm active:translate-y-0';

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--muted))]">
            801 OUTLET • CATALOG
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Browse products
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[rgb(var(--muted))]">
            Utah-only delivery. Browse here, then complete your purchase on Shopify.
          </p>
        </div>

        <div className="text-xs text-[rgb(var(--muted))]">
          Showing <span className="font-semibold text-[rgb(var(--fg))]">{filtered.length}</span>{' '}
          items
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/products"
          className={
            chipBase +
            ` ${
              active === 'all'
                ? 'border-[rgb(var(--fg))] bg-[rgb(var(--fg))] text-white'
                : 'border-[rgb(var(--border))] bg-white text-[rgb(var(--fg))] hover:bg-neutral-50'
            }`
          }
        >
          All
        </Link>

        {categories.slice(0, 4).map((c: { key: ProductCategory; label: string }) => (
          <Link
            key={c.key}
            href={`/products?category=${c.key}`}
            className={
              chipBase +
              ` ${
                active === c.key
                  ? 'border-[rgb(var(--fg))] bg-[rgb(var(--fg))] text-white'
                  : 'border-[rgb(var(--border))] bg-white text-[rgb(var(--fg))] hover:bg-neutral-50'
              }`
            }
          >
            {c.label}
          </Link>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p: Product) => (
          <Link
            key={p.slug}
            href={`/products/${p.slug}`}
            className="group rounded-2xl border border-[rgb(var(--border))] bg-white p-4 transition hover:-translate-y-[1px] hover:shadow-sm"
          >
            <div className="relative aspect-4/3 overflow-hidden rounded-xl bg-neutral-100">
              {/* Badge SAVE */}
              {p.compareAtPrice ? (
                <div className="absolute left-3 top-3 z-10 rounded-full bg-[rgb(var(--fg))] px-3 py-1 text-xs font-semibold text-white">
                  Save ${p.compareAtPrice - p.price}
                </div>
              ) : null}

              {/* Imagem */}
              <img
                src={p.images[0]?.src}
                alt={p.images[0]?.alt || p.title}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                loading="lazy"
              />

              {/* Overlay premium */}
              <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/10 via-black/0 to-black/0 opacity-0 transition group-hover:opacity-100" />

              {/* Shine */}
              <div className="pointer-events-none absolute -left-1/2 top-0 h-full w-1/2 rotate-12 bg-white/20 opacity-0 blur-xl transition duration-500 group-hover:translate-x-[220%] group-hover:opacity-100" />
            </div>

            <div className="mt-4 flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">{p.title}</div>
                <div className="mt-1 text-xs text-[rgb(var(--muted))]">
                  {p.shortDescription}
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-semibold">${p.price}</div>
                {p.compareAtPrice ? (
                  <div className="text-xs text-[rgb(var(--muted))] line-through">
                    ${p.compareAtPrice}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-[rgb(var(--border))] bg-white px-3 py-1">
                {p.fastDelivery ? 'Fast delivery' : 'Scheduled delivery'}
              </span>
              <span className="rounded-full border border-[rgb(var(--border))] bg-white px-3 py-1">
                {p.inStock ? 'In stock' : 'Out of stock'}
              </span>
              <span className="rounded-full border border-[rgb(var(--border))] bg-white px-3 py-1">
                Utah only
              </span>
            </div>

            <div className="mt-4 text-xs font-semibold text-[rgb(var(--accent))]">
              View details →
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
