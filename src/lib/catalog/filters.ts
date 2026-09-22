import { normalizeCategory, type ProductCategory } from './categories';

export type CatalogSort =
  | 'featured'
  | 'newest'
  | 'price_asc'
  | 'price_desc';

export type CatalogAvailability = 'all' | 'available';

export function parseCatalogSort(value: string | undefined): CatalogSort {
  if (
    value === 'newest' ||
    value === 'price_asc' ||
    value === 'price_desc'
  ) {
    return value;
  }

  return 'featured';
}

export function parseCatalogAvailability(
  value: string | undefined
): CatalogAvailability {
  return value === 'available' ? 'available' : 'all';
}

/**
 * The category a visitor asked for, or `undefined` for "every category".
 *
 * Read through `normalizeCategory`, so a link or a hand-typed `?category=sofa`
 * lands on the stored spelling instead of quietly matching nothing.
 */
export function parseCatalogCategory(
  value: string | undefined
): ProductCategory | undefined {
  if (!value) return undefined;
  return normalizeCategory(value) ?? undefined;
}

export function parseCatalogPrice(value: string | undefined) {
  if (!value) return undefined;

  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0 || amount > 1_000_000) {
    return undefined;
  }

  return Math.round(amount * 100) / 100;
}

export function normalizeCatalogSearch(value: string | undefined) {
  if (!value) return '';

  return value
    .normalize('NFKC')
    .replace(/[^\p{L}\p{N}\s'&-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100);
}

/**
 * The Shopify-side half of the filters.
 *
 * Price is deliberately absent: the slider needs the catalogue's real range to
 * draw its ends, and asking Shopify for a filtered set would make those ends
 * move with the filter — drag the maximum down once and the track would shrink
 * around it. The catalogue is small enough to filter by price in memory, where
 * the unfiltered range is still in hand. See `shopify/catalog`.
 */
export function buildProductQuery(filters: {
  availability: CatalogAvailability;
  category?: ProductCategory;
}) {
  const terms: string[] = [];

  if (filters.availability === 'available') {
    terms.push('available_for_sale:true');
  }
  if (filters.category) {
    // Quoted: every category with a space or an ampersand would otherwise be
    // read as two terms, and `Sofa & Loveseat` would match nothing.
    terms.push(`product_type:"${filters.category}"`);
  }

  return terms.length > 0 ? terms.join(' AND ') : undefined;
}

/** Whether a card's price sits inside the requested range. */
export function withinPriceRange(
  amount: string,
  minPrice?: number,
  maxPrice?: number
): boolean {
  // A price we cannot read is not a price outside the range: `Number('')` is
  // zero, and treating that as cheap would drop the piece from every filter
  // with a minimum.
  if (!amount.trim()) return true;
  const price = Number(amount);
  if (!Number.isFinite(price)) return true;
  if (minPrice !== undefined && price < minPrice) return false;
  if (maxPrice !== undefined && price > maxPrice) return false;
  return true;
}

/**
 * The ends of the slider: the cheapest and dearest piece in the catalogue,
 * rounded outwards to a round number so the track reads as $1,000-$2,500
 * rather than $1,199-$2,499.
 */
export function priceBoundsOf(amounts: string[]): { min: number; max: number } | null {
  const prices = amounts.map(Number).filter((price) => Number.isFinite(price));
  if (prices.length === 0) return null;

  const step = 50;
  const min = Math.floor(Math.min(...prices) / step) * step;
  const max = Math.ceil(Math.max(...prices) / step) * step;

  return { min: Math.max(0, min), max: max > min ? max : min + step };
}

export function normalizePriceRange(minPrice?: number, maxPrice?: number) {
  if (
    minPrice !== undefined &&
    maxPrice !== undefined &&
    minPrice > maxPrice
  ) {
    return { minPrice: maxPrice, maxPrice: minPrice };
  }

  return { minPrice, maxPrice };
}
