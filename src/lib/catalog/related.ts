/**
 * Which pieces to show under "Similar pieces".
 *
 * Shopify's own `productRecommendations` learns from order history, and this
 * shop has almost none — it returned near-arbitrary pieces, pairing a $800
 * sleeper with a $3,200 reclining set. Price is the honest signal here: someone
 * looking at a piece has a budget in mind, and the useful suggestion is another
 * piece they could actually buy instead.
 *
 * Ranking is by distance in price, then by what is sellable — a sold-out piece
 * at the perfect price is not an alternative, so availability wins the tie.
 */

import type { CatalogMoney, CatalogProductCard } from './types';
import { sortAvailableFirst } from './ordering';

/** Only what the ranking needs, so a detail page can pass its own shape. */
type PricedProduct = { id: string; price: CatalogMoney };

function priceOf(product: PricedProduct): number {
  // Guarded before `Number`, which reads an empty string as 0 and would rank a
  // product with no price as the cheapest thing in the shop.
  const raw = product.price?.amount?.trim();
  if (!raw) return Number.POSITIVE_INFINITY;

  const amount = Number(raw);
  return Number.isFinite(amount) ? amount : Number.POSITIVE_INFINITY;
}

/**
 * The `limit` closest pieces in price to `current`, sellable ones first.
 *
 * Deliberately not a fixed band: a hard "within 20%" window returns nothing on
 * a piece priced away from the rest of the catalogue, and an empty section is
 * worse than a slightly wider one.
 */
export function pickRelatedByPrice(
  candidates: CatalogProductCard[],
  current: PricedProduct,
  limit = 4
): CatalogProductCard[] {
  if (limit <= 0) return [];

  const target = priceOf(current);
  if (!Number.isFinite(target)) return [];

  const others = candidates.filter(
    (product) => product.id !== current.id && Number.isFinite(priceOf(product))
  );

  const byPrice = [...others].sort((left, right) => {
    const distance =
      Math.abs(priceOf(left) - target) - Math.abs(priceOf(right) - target);
    // Ties broken by handle so the section does not reshuffle between renders.
    return distance !== 0 ? distance : left.handle.localeCompare(right.handle);
  });

  // Stable, so within each availability group the price order above survives.
  return sortAvailableFirst(byPrice).slice(0, limit);
}
