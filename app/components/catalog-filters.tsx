'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2, Search } from 'lucide-react';

import type { ProductCategory } from '../../src/lib/catalog/categories';
import { HAPTIC, haptic } from '../../src/lib/haptics';
import { PriceRangeSlider } from './price-range-slider';

export type CatalogFilterState = {
  q: string;
  category: string;
  availability: string;
  sort: string;
  priceMin?: number;
  priceMax?: number;
};

/** How long typing settles before the catalogue is asked to filter. */
const TYPING_SETTLE_MS = 350;

/**
 * The filter bar, applied as it is used.
 *
 * Every control writes to the URL and lets the server component re-render, so
 * the result is still a real, shareable, indexable address -- the same one the
 * Apply button used to produce, just without the button. `replace` rather than
 * `push`: a shopper narrowing a search should not have to walk back through
 * every keystroke to leave the page.
 *
 * Typing settles for a moment first. A request per keystroke is a request per
 * keystroke for the server too, and the catalogue is not worth that.
 */
export function CatalogFilters({
  categories,
  sortOptions,
  initial,
  priceBounds,
  children,
}: {
  categories: readonly ProductCategory[];
  sortOptions: readonly { value: string; label: string }[];
  initial: CatalogFilterState;
  priceBounds: { min: number; max: number } | null;
  /** The clear link, rendered by the page. */
  children?: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  // Controls answer the finger immediately and the URL catches up. Reading
  // them straight from the props instead would make every select snap back to
  // its old value for as long as the server took to answer.
  const [form, setForm] = useState<CatalogFilterState>(initial);
  const [range, setRange] = useState<[number, number]>([
    initial.priceMin ?? priceBounds?.min ?? 0,
    initial.priceMax ?? priceBounds?.max ?? 0,
  ]);

  /** The last state this component asked for, to tell our own echo apart. */
  const pushed = useRef<CatalogFilterState>(initial);

  useEffect(() => {
    // Only adopt what the server sends when it is not the echo of our own
    // request: mid-typing, the echo is one keystroke old, and adopting it
    // would undo the letter just typed.
    const echo =
      initial.q === pushed.current.q &&
      initial.category === pushed.current.category &&
      initial.availability === pushed.current.availability &&
      initial.sort === pushed.current.sort &&
      initial.priceMin === pushed.current.priceMin &&
      initial.priceMax === pushed.current.priceMax;
    if (echo) return;

    // Back, forward, or the Clear link: the URL moved without us.
    pushed.current = initial;
    setForm(initial);
    setRange([
      initial.priceMin ?? priceBounds?.min ?? 0,
      initial.priceMax ?? priceBounds?.max ?? 0,
    ]);
  }, [initial, priceBounds]);

  // Changing category or availability changes which pieces the ends describe,
  // so the handles follow the new track rather than sitting off it.
  useEffect(() => {
    if (!priceBounds) return;
    setRange(([low, high]) => [
      Math.max(priceBounds.min, Math.min(low, priceBounds.max)),
      Math.min(priceBounds.max, Math.max(high, priceBounds.min)),
    ]);
  }, [priceBounds]);

  const apply = (patch: Partial<CatalogFilterState>) => {
    const next = { ...form, ...patch };
    const params = new URLSearchParams();
    if (next.q) params.set('q', next.q);
    if (next.category) params.set('category', next.category);
    if (next.availability && next.availability !== 'all') {
      params.set('availability', next.availability);
    }
    if (next.sort && next.sort !== 'featured') params.set('sort', next.sort);
    if (next.priceMin !== undefined) {
      params.set('priceMin', String(next.priceMin));
    }
    if (next.priceMax !== undefined) {
      params.set('priceMax', String(next.priceMax));
    }
    // `page` is deliberately dropped: page 4 of the old result is rarely page 4
    // of the new one, and is often nothing at all.
    const query = params.toString();

    setForm(next);
    pushed.current = next;
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    });
  };

  // Typing settles, then filters.
  useEffect(() => {
    if (form.q === pushed.current.q) return;

    const timer = setTimeout(() => apply({ q: form.q }), TYPING_SETTLE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.q]);

  const selectClass =
    'w-full rounded-xl border border-[rgb(var(--border))] bg-white px-4 py-2.5 text-sm transition ' +
    'focus:border-[rgb(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent)/0.2)]';

  const commitRange = () => {
    haptic(HAPTIC.tap);
    const atMin = !priceBounds || range[0] <= priceBounds.min;
    const atMax = !priceBounds || range[1] >= priceBounds.max;
    apply({
      // An untouched end is no filter at all, so it leaves the URL clean.
      priceMin: atMin ? undefined : range[0],
      priceMax: atMax ? undefined : range[1],
    });
  };

  return (
    <div className="rounded-2xl border border-[rgb(var(--border))] bg-white/70 p-4 sm:p-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
        <div className="relative">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[rgb(var(--muted))]"
          />
          <input
            type="search"
            name="q"
            value={form.q}
            onChange={(event) =>
              setForm((current) => ({ ...current, q: event.target.value }))
            }
            placeholder="Search sofas, sectionals…"
            className={`${selectClass} pl-10`}
            aria-label="Search products"
          />
          {pending ? (
            <Loader2
              aria-hidden
              className="absolute right-3.5 top-1/2 size-4 -translate-y-1/2 animate-spin text-[rgb(var(--muted))] motion-reduce:animate-none"
            />
          ) : null}
        </div>

        <select
          name="category"
          value={form.category}
          onChange={(event) => {
            haptic(HAPTIC.tap);
            apply({ category: event.target.value });
          }}
          className={selectClass}
          aria-label="Category"
        >
          <option value="">All categories</option>
          {categories.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          name="availability"
          value={form.availability}
          onChange={(event) => {
            haptic(HAPTIC.tap);
            apply({ availability: event.target.value });
          }}
          className={selectClass}
          aria-label="Availability"
        >
          <option value="all">All availability</option>
          <option value="available">In stock</option>
        </select>
      </div>

      {priceBounds ? (
        <div className="mt-4">
          <PriceRangeSlider
            min={priceBounds.min}
            max={priceBounds.max}
            value={range}
            onChange={setRange}
            onCommit={commitRange}
          />
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label className="text-xs font-semibold text-[rgb(var(--muted))]">
          Sort by
          <select
            name="sort"
            value={form.sort}
            onChange={(event) => {
              haptic(HAPTIC.tap);
              apply({ sort: event.target.value });
            }}
            className="ml-2 rounded-lg border border-[rgb(var(--border))] bg-white px-3 py-1.5 text-xs text-[rgb(var(--fg))]"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        {children}
      </div>

      <p aria-live="polite" className="sr-only">
        {pending ? 'Updating results' : 'Results updated'}
      </p>
    </div>
  );
}
