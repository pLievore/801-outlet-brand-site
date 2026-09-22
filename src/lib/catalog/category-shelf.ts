/**
 * The categories the home page offers, built from the catalogue itself.
 *
 * The section used to be four hand-written cards pointing at `?q=Sectional`,
 * `?q=Sleeper` and `?q=Leather` — a free-text search standing in for a
 * category, one of which ("Leather") was never a category at all. Now that
 * products carry a real category, the shelf is whatever the shop actually has,
 * and cannot drift from it.
 */

import { isProductCategory, type ProductCategory } from './categories';
import type { CatalogImage, CatalogProductCard } from './types';
import { getAvailability } from './availability';

export type CategoryShelfEntry = {
  category: ProductCategory;
  count: number;
  /** A piece from the category, to show what it looks like. */
  image: CatalogImage | null;
};

/**
 * One entry per category with something in it, biggest first.
 *
 * A category with no products is left out rather than shown and leading to an
 * empty page, and a `productType` that is not one of ours is ignored: the
 * catalogue filter would not understand it, so the card would not work.
 *
 * The picture is taken from a piece that can be bought where there is one —
 * the shelf should look like the shop today, not like what it has sold.
 */
export function buildCategoryShelf(
  products: CatalogProductCard[]
): CategoryShelfEntry[] {
  const grouped = new Map<ProductCategory, CatalogProductCard[]>();

  for (const product of products) {
    if (!isProductCategory(product.productType)) continue;
    const list = grouped.get(product.productType) ?? [];
    list.push(product);
    grouped.set(product.productType, list);
  }

  const entries: CategoryShelfEntry[] = [];
  for (const [category, list] of grouped) {
    const withPhoto = list.filter((product) => product.images[0]);
    const sellable = withPhoto.find(
      (product) => getAvailability(product).purchasable
    );

    entries.push({
      category,
      count: list.length,
      image: (sellable ?? withPhoto[0])?.images[0] ?? null,
    });
  }

  return entries.sort(
    (left, right) =>
      right.count - left.count || left.category.localeCompare(right.category)
  );
}
