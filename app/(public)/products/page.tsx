import type { Metadata } from 'next';
import Link from 'next/link';

import {
  normalizeCatalogSearch,
  normalizePriceRange,
  parseCatalogAvailability,
  parseCatalogPrice,
  parseCatalogSort,
} from '../../../src/lib/catalog/filters';
import { getShopifyCatalogPage } from '../../../src/lib/shopify/catalog';
import { CatalogProductCard } from '../../components/catalog-product-card';
import { StaggerGrid, StaggerItem } from '../../components/motion';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Furniture Catalog — 801 Outlet',
  description:
    'Browse premium outlet furniture available for delivery and pickup in Utah.',
  alternates: { canonical: '/products' },
};

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to high' },
  { value: 'price_desc', label: 'Price: High to low' },
] as const;

type SearchParams = {
  q?: string;
  sort?: string;
  availability?: string;
  priceMin?: string;
  priceMax?: string;
  page?: string;
};

/** 1-based page number from the URL; anything odd falls back to page 1. */
function parsePage(value: string | undefined): number {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 && page <= 500 ? page : 1;
}

function buildQuery(
  base: Record<string, string | undefined>,
  override: Record<string, string | undefined>
) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...base, ...override })) {
    if (value) params.set(key, value);
  }

  const query = params.toString();
  return query ? `?${query}` : '';
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const search = normalizeCatalogSearch(params.q);
  const sort = parseCatalogSort(params.sort);
  const availability = parseCatalogAvailability(params.availability);
  const parsedPrices = normalizePriceRange(
    parseCatalogPrice(params.priceMin),
    parseCatalogPrice(params.priceMax)
  );
  const page = parsePage(params.page);

  const result = await getShopifyCatalogPage({
    search,
    sort,
    availability,
    ...parsedPrices,
    page,
    pageSize: 12,
  });

  const baseQuery = {
    q: search || undefined,
    sort: sort === 'featured' ? undefined : sort,
    availability:
      availability === 'available' ? availability : undefined,
    priceMin: params.priceMin || undefined,
    priceMax: params.priceMax || undefined,
  };
  const hasFilters = Boolean(
    search ||
      availability === 'available' ||
      parsedPrices.minPrice !== undefined ||
      parsedPrices.maxPrice !== undefined ||
      sort !== 'featured'
  );
  const inputClass =
    'w-full rounded-xl border border-[rgb(var(--border))] bg-white px-4 py-2.5 text-sm transition ' +
    'focus:border-[rgb(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]/20';

  return (
    <main>
      <section className="mx-auto max-w-6xl px-5 pb-14 pt-10">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--muted))]">
              801 OUTLET · UTAH
            </p>
            <h1 className="mt-3 font-display text-4xl font-medium tracking-tight md:text-6xl">
              Browse furniture
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[rgb(var(--muted))]">
              Premium outlet pieces with live pricing and availability from our
              Shopify catalog.
            </p>
          </div>

          <p className="hidden text-xs text-[rgb(var(--muted))] md:block">
            {result.totalCount !== null
              ? `${result.totalCount} matching ${result.totalCount === 1 ? 'piece' : 'pieces'}`
              : `${result.products.length} ${result.products.length === 1 ? 'piece' : 'pieces'} shown`}
          </p>
        </div>

        <form
          method="get"
          action="/products"
          className="mt-8 rounded-2xl border border-[rgb(var(--border))] bg-white/70 p-4 sm:p-5"
        >
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,0.7fr))_auto]">
            <input
              type="search"
              name="q"
              defaultValue={search}
              placeholder="Search sofas, sectionals, colors…"
              className={inputClass}
              aria-label="Search products"
            />
            <input
              type="number"
              name="priceMin"
              defaultValue={params.priceMin ?? ''}
              placeholder="Min price"
              min="0"
              step="1"
              inputMode="decimal"
              className={inputClass}
              aria-label="Minimum price in US dollars"
            />
            <input
              type="number"
              name="priceMax"
              defaultValue={params.priceMax ?? ''}
              placeholder="Max price"
              min="0"
              step="1"
              inputMode="decimal"
              className={inputClass}
              aria-label="Maximum price in US dollars"
            />
            <select
              name="availability"
              defaultValue={availability}
              className={inputClass}
              aria-label="Availability"
            >
              <option value="all">All availability</option>
              <option value="available">In stock</option>
            </select>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-[rgb(var(--fg))] px-6 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-px hover:shadow-sm"
            >
              Apply
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label className="text-xs font-semibold text-[rgb(var(--muted))]">
              Sort by
              <select
                name="sort"
                defaultValue={sort}
                className="ml-2 rounded-lg border border-[rgb(var(--border))] bg-white px-3 py-1.5 text-xs text-[rgb(var(--fg))]"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            {hasFilters ? (
              <Link
                href="/products"
                className="text-xs font-semibold text-[rgb(var(--muted))] underline decoration-[rgb(var(--border))] underline-offset-4 transition hover:text-[rgb(var(--fg))]"
              >
                Clear filters
              </Link>
            ) : null}
          </div>
        </form>

        {result.products.length === 0 ? (
          <div className="relative mt-12 overflow-hidden rounded-3xl border border-[rgb(var(--border))] bg-white p-12 text-center sm:p-16">
            <h2 className="font-display text-3xl font-medium tracking-tight md:text-4xl">
              Nothing matched
              <span className="italic text-[rgb(var(--accent))]">
                {' '}
                this search.
              </span>
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-[rgb(var(--muted))]">
              Try a broader term or clear the filters to see every available
              piece.
            </p>
            <Link
              href="/products"
              className="mt-7 inline-flex items-center justify-center rounded-full bg-[rgb(var(--fg))] px-7 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-px hover:shadow-md"
            >
              See all products
            </Link>
            <div className="pointer-events-none absolute inset-x-0 -bottom-12 mx-auto h-40 max-w-sm rounded-full bg-[rgb(var(--accent))]/10 blur-3xl" />
          </div>
        ) : (
          <StaggerGrid className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {result.products.map((product) => (
              <StaggerItem key={product.id}>
                <CatalogProductCard product={product} />
              </StaggerItem>
            ))}
          </StaggerGrid>
        )}

        {result.pageInfo.hasNextPage || result.pageInfo.hasPreviousPage ? (
          <nav
            className="mt-10 flex items-center justify-center gap-3"
            aria-label="Catalog pagination"
          >
            {result.pageInfo.hasPreviousPage ? (
              <Link
                href={`/products${buildQuery(baseQuery, {
                  page:
                    result.pageInfo.page - 1 === 1
                      ? undefined
                      : String(result.pageInfo.page - 1),
                })}`}
                className="rounded-full border border-[rgb(var(--border))] bg-white px-5 py-2.5 text-sm font-semibold transition hover:bg-neutral-50"
              >
                ← Previous
              </Link>
            ) : null}
            <span className="text-xs text-[rgb(var(--muted))]">
              Page {result.pageInfo.page} of {result.pageInfo.totalPages}
            </span>
            {result.pageInfo.hasNextPage ? (
              <Link
                href={`/products${buildQuery(baseQuery, {
                  page: String(result.pageInfo.page + 1),
                })}`}
                className="rounded-full border border-[rgb(var(--border))] bg-white px-5 py-2.5 text-sm font-semibold transition hover:bg-neutral-50"
              >
                Next →
              </Link>
            ) : null}
          </nav>
        ) : null}

        <p className="mt-8 text-center text-xs text-[rgb(var(--muted))] md:hidden">
          {result.totalCount !== null
            ? `${result.totalCount} matching ${result.totalCount === 1 ? 'piece' : 'pieces'}`
            : `${result.products.length} ${result.products.length === 1 ? 'piece' : 'pieces'} shown`}
        </p>
      </section>
    </main>
  );
}
