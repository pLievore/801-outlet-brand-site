/**
 * Merchandising order for the catalogue.
 *
 * What the customer can buy today comes first. Shopify has no sort key for
 * availability, so the ordering is applied after fetching — which is why the
 * catalogue pages in memory (see `shopify/catalog`) instead of by cursor:
 * ordering only the current page would still show sold-out pieces ahead of
 * available ones on the next.
 */

import type { CatalogProductCard } from './types';
import { getAvailability } from './availability';

/**
 * Rank within the storefront: in stock, then arriving soon, then sold out.
 * "Coming soon" beats "Sold out" because it is a reason to come back.
 */
function availabilityRank(product: CatalogProductCard): number {
  const state = getAvailability(product).state;
  if (state === 'in-stock') return 0;
  if (state === 'coming-soon') return 1;
  return 2;
}

/**
 * Stable: products keep the order Shopify returned them in (the shopper's
 * chosen sort) within each availability group.
 */
export function sortAvailableFirst(
  products: CatalogProductCard[]
): CatalogProductCard[] {
  return [...products].sort(
    (left, right) => availabilityRank(left) - availabilityRank(right)
  );
}
