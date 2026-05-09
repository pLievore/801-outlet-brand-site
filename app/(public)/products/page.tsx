import Image from 'next/image';
import Link from 'next/link';
import {
  getCategoriesWithProducts,
  searchActiveProducts,
  type ProductSort,
} from '../../../src/lib/products';
import { formatUsdCents } from '../../../src/lib/format';
import { FadeIn, StaggerGrid, StaggerItem } from '../../components/motion';

export const revalidate = 60;

const SORT_OPTIONS: Array<{ value: ProductSort; label: string }> = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to high' },
  { value: 'price_desc', label: 'Price: High to low' },
];

function parseCents(input: string | undefined): number | undefined {
  if (!input) return undefined;
  const dollars = Number(input);
  if (!Number.isFinite(dollars) || dollars < 0) return undefined;
  return Math.round(dollars * 100);
}

function parseSort(input: string | undefined): ProductSort {
  if (input === 'price_asc' || input === 'price_desc' || input === 'newest') return input;
  return 'newest';
}

function parsePage(input: string | undefined): number {
  const n = Number(input ?? 1);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

function buildQuery(
  base: Record<string, string | undefined>,
  override: Record<string, string | undefined>
): string {
  const merged = { ...base, ...override };
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(merged)) {
    if (value && value.length > 0) params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: Promise<{
    category?: string;
    q?: string;
    sort?: string;
    priceMin?: string;
    priceMax?: string;
    page?: string;
  }>;
}) {
  const sp = (await searchParams) ?? {};
  const activeCategory = (sp.category || 'all').toLowerCase();
  const q = (sp.q || '').trim();
  const sort = parseSort(sp.sort);
  const priceMinCents = parseCents(sp.priceMin);
  const priceMaxCents = parseCents(sp.priceMax);
  const page = parsePage(sp.page);

  const [result, categories] = await Promise.all([
    searchActiveProducts({
      category: activeCategory,
      q,
      priceMinCents,
      priceMaxCents,
      sort,
      page,
      pageSize: 12,
    }),
    getCategoriesWithProducts(),
  ]);

  const baseQuery = {
    category: activeCategory === 'all' ? undefined : activeCategory,
    q: q || undefined,
    sort: sort === 'newest' ? undefined : sort,
    priceMin: sp.priceMin || undefined,
    priceMax: sp.priceMax || undefined,
  };

  const chipBase =
    'inline-flex items-center rounded-full border px-4 py-2 text-sm font-semibold transition ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg))] ' +
    'hover:-translate-y-[1px] hover:shadow-sm active:translate-y-0';

  const inputBase =
    'w-full rounded-xl border border-[rgb(var(--border))] bg-white px-4 py-2.5 text-sm transition ' +
    'focus:border-[rgb(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]/20';

  return (
    <main>
      <section className="mx-auto max-w-6xl px-5 pt-10 pb-14">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--muted))]">
              801 OUTLET • CATALOG
            </div>
            <h1 className="mt-3 font-display text-4xl font-medium tracking-tight md:text-6xl">
              Browse products
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[rgb(var(--muted))]">
              Utah-only delivery. Browse our curated catalog and reach out to order.
            </p>
          </div>

          <div className="hidden text-xs text-[rgb(var(--muted))] md:block">
            {result.total} item{result.total === 1 ? '' : 's'} • Utah delivery only
          </div>
        </div>

        {/* Search + filters — mobile-first */}
        <form
          method="get"
          action="/products"
          className="mt-8 flex flex-col gap-3"
        >
          {/* Preserve current category as hidden input */}
          {activeCategory !== 'all' ? (
            <input type="hidden" name="category" value={activeCategory} />
          ) : null}

          {/* Row 1: Search */}
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search products…"
            className={inputBase}
            aria-label="Search products"
          />

          {/* Row 2: Price range */}
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              name="priceMin"
              defaultValue={sp.priceMin ?? ''}
              placeholder="Min price ($)"
              min="0"
              step="1"
              inputMode="numeric"
              className={inputBase}
              aria-label="Minimum price"
            />
            <input
              type="number"
              name="priceMax"
              defaultValue={sp.priceMax ?? ''}
              placeholder="Max price ($)"
              min="0"
              step="1"
              inputMode="numeric"
              className={inputBase}
              aria-label="Maximum price"
            />
          </div>

          {/* Row 3: Sort + Apply */}
          <div className="grid grid-cols-[1fr_auto] gap-3">
            <select
              name="sort"
              defaultValue={sort}
              className={inputBase}
              aria-label="Sort"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-[rgb(var(--fg))] px-6 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-[1px] hover:shadow-sm active:translate-y-0"
            >
              Apply
            </button>
          </div>
        </form>

        {/* Category chips */}
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href={`/products${buildQuery(baseQuery, { category: undefined, page: undefined })}`}
            className={
              chipBase +
              (activeCategory === 'all'
                ? ' border-[rgb(var(--fg))] bg-[rgb(var(--fg))] text-white'
                : ' border-[rgb(var(--border))] bg-white text-[rgb(var(--fg))] hover:bg-neutral-50')
            }
          >
            All
          </Link>

          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/products${buildQuery(baseQuery, { category: c.slug, page: undefined })}`}
              className={
                chipBase +
                (activeCategory === c.slug
                  ? ' border-[rgb(var(--fg))] bg-[rgb(var(--fg))] text-white'
                  : ' border-[rgb(var(--border))] bg-white text-[rgb(var(--fg))] hover:bg-neutral-50')
              }
            >
              {c.name}
            </Link>
          ))}
        </div>

        {/* Results */}
        {result.products.length === 0 ? (
          <div className="relative mt-12 overflow-hidden rounded-3xl border border-[rgb(var(--border))] bg-white p-12 text-center sm:p-16">
            <div className="font-display text-3xl font-medium tracking-tight md:text-4xl">
              Nothing matched
              <span className="italic text-[rgb(var(--accent))]"> that filter.</span>
            </div>
            <p className="mx-auto mt-3 max-w-md text-sm text-[rgb(var(--muted))]">
              Try a different category or clear the search to see everything.
            </p>
            <Link
              href="/products"
              className="mt-7 inline-flex items-center justify-center rounded-full bg-[rgb(var(--fg))] px-7 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-[1px] hover:shadow-md"
            >
              See all products
            </Link>
            <div className="pointer-events-none absolute inset-x-0 -bottom-12 mx-auto h-40 max-w-sm rounded-full bg-[rgb(var(--accent))]/10 blur-3xl" />
          </div>
        ) : (
          <StaggerGrid className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {result.products.map((p) => {
              const primary = p.images[0];
              const secondary = p.images[1];
              const savings =
                p.compareAtPriceCents && p.compareAtPriceCents > p.priceCents
                  ? p.compareAtPriceCents - p.priceCents
                  : null;

              return (
                <StaggerItem key={p.slug}>
                  <Link
                    href={`/products/${p.slug}`}
                    className="group flex h-full flex-col rounded-2xl border border-[rgb(var(--border))] bg-white p-3 sm:p-4 transition hover:-translate-y-[1px] hover:shadow-sm"
                >
                  <div className="relative aspect-4/3 overflow-hidden rounded-xl bg-neutral-100">
                    {primary ? (
                      <Image
                        src={primary.url}
                        alt={primary.alt || p.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className={
                          'object-cover transition duration-300 ' +
                          (secondary ? 'opacity-100 group-hover:opacity-0' : 'opacity-100') +
                          ' group-hover:scale-[1.02]'
                        }
                      />
                    ) : null}

                    {secondary ? (
                      <Image
                        src={secondary.url}
                        alt={secondary.alt || p.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover opacity-0 transition duration-300 group-hover:opacity-100 group-hover:scale-[1.02]"
                      />
                    ) : null}

                    {savings !== null ? (
                      <div className="absolute left-3 top-3 rounded-full bg-[rgb(var(--fg))] px-3 py-1 text-xs font-semibold text-white">
                        Save {formatUsdCents(savings)}
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-4 flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold">{p.name}</div>
                      {p.description ? (
                        <div className="mt-1 text-xs text-[rgb(var(--muted))]">
                          {p.description}
                        </div>
                      ) : null}
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-semibold">
                        {formatUsdCents(p.priceCents)}
                      </div>
                      {p.compareAtPriceCents &&
                      p.compareAtPriceCents > p.priceCents ? (
                        <div className="text-xs text-[rgb(var(--muted))] line-through">
                          {formatUsdCents(p.compareAtPriceCents)}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full border border-[rgb(var(--border))] bg-white px-3 py-1 text-[11px] font-semibold text-[rgb(var(--fg))]">
                      {p.stockQty > 0 ? 'In stock' : 'Out of stock'}
                    </span>
                    {p.stockQty > 0 && p.stockQty <= 3 ? (
                      <span className="rounded-full border border-[rgb(var(--accent))] bg-[rgb(var(--accent))]/10 px-3 py-1 text-[11px] font-semibold text-[rgb(var(--accent))]">
                        Only {p.stockQty} left
                      </span>
                    ) : null}
                    <span className="rounded-full border border-[rgb(var(--border))] bg-white px-3 py-1 text-[11px] font-semibold text-[rgb(var(--fg))]">
                      Utah delivery
                    </span>
                  </div>

                  <div className="mt-4 text-xs font-semibold text-[rgb(var(--accent))]">
                    View details →
                  </div>
                </Link>
              </StaggerItem>
              );
            })}
          </StaggerGrid>
        )}

        {/* Pagination */}
        {result.totalPages > 1 ? (
          <nav
            className="mt-10 flex items-center justify-center gap-2"
            aria-label="Pagination"
          >
            {result.page > 1 ? (
              <Link
                href={`/products${buildQuery(baseQuery, {
                  page: String(result.page - 1),
                })}`}
                className="rounded-full border border-[rgb(var(--border))] bg-white px-4 py-2 text-sm font-semibold transition hover:bg-neutral-50"
              >
                ← Previous
              </Link>
            ) : null}

            <span className="text-xs text-[rgb(var(--muted))]">
              Page {result.page} of {result.totalPages}
            </span>

            {result.page < result.totalPages ? (
              <Link
                href={`/products${buildQuery(baseQuery, {
                  page: String(result.page + 1),
                })}`}
                className="rounded-full border border-[rgb(var(--border))] bg-white px-4 py-2 text-sm font-semibold transition hover:bg-neutral-50"
              >
                Next →
              </Link>
            ) : null}
          </nav>
        ) : null}

        <div className="mt-8 text-center text-xs text-[rgb(var(--muted))] md:hidden">
          {result.total} item{result.total === 1 ? '' : 's'} • Utah delivery only
        </div>
      </section>
    </main>
  );
}
