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

function formatFilterPrice(amount: number) {
  return amount.toFixed(2);
}

export function buildProductQuery(filters: {
  availability: CatalogAvailability;
  category?: ProductCategory;
  minPrice?: number;
  maxPrice?: number;
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
  if (filters.minPrice !== undefined) {
    terms.push(`variants.price:>=${formatFilterPrice(filters.minPrice)}`);
  }
  if (filters.maxPrice !== undefined) {
    terms.push(`variants.price:<=${formatFilterPrice(filters.maxPrice)}`);
  }

  return terms.length > 0 ? terms.join(' AND ') : undefined;
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
