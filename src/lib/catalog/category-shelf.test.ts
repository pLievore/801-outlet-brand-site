import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildCategoryShelf } from './category-shelf';
import type { CatalogProductCard } from './types';

function card(
  handle: string,
  productType: string,
  options: { image?: string; availableForSale?: boolean } = {}
): CatalogProductCard {
  return {
    id: `gid://shopify/Product/${handle}`,
    handle,
    title: handle,
    productType,
    description: null,
    availableForSale: options.availableForSale ?? true,
    tags: [],
    price: { amount: '1899.00', currencyCode: 'USD' },
    compareAtPrice: null,
    images: options.image
      ? [{ url: options.image, alt: null, width: null, height: null }]
      : [],
    soleVariantId: null,
  };
}

test('the shelf is the catalogue, biggest category first', () => {
  const shelf = buildCategoryShelf([
    card('a', 'Sectional'),
    card('b', 'Sofa & Loveseat'),
    card('c', 'Sectional'),
    card('d', 'Sectional'),
    card('e', 'Sofa & Loveseat'),
    card('f', 'Sleeper'),
  ]);

  assert.deepEqual(
    shelf.map((entry) => [entry.category, entry.count]),
    [
      ['Sectional', 3],
      ['Sofa & Loveseat', 2],
      ['Sleeper', 1],
    ]
  );
});

test('a category the shop does not stock never reaches the shelf', () => {
  const shelf = buildCategoryShelf([card('a', 'Sectional')]);

  assert.equal(shelf.length, 1);
  assert.equal(
    shelf.some((entry) => entry.category === 'Bed'),
    false
  );
});

test('a productType the catalogue cannot filter by is left out', () => {
  // It would render a card leading to an empty page.
  const shelf = buildCategoryShelf([
    card('a', 'Chandelier'),
    card('b', ''),
    card('c', 'Sectional'),
  ]);

  assert.deepEqual(
    shelf.map((entry) => entry.category),
    ['Sectional']
  );
});

test('the picture comes from a piece someone can actually buy', () => {
  const shelf = buildCategoryShelf([
    card('sold', 'Sectional', { image: 'sold.jpg', availableForSale: false }),
    card('ready', 'Sectional', { image: 'ready.jpg' }),
  ]);

  assert.equal(shelf[0].image?.url, 'ready.jpg');
});

test('a category whose pieces have no photo still gets its card', () => {
  const shelf = buildCategoryShelf([card('a', 'Sectional')]);

  assert.equal(shelf[0].count, 1);
  assert.equal(shelf[0].image, null);
});
