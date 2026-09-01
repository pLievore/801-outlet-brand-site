import assert from 'node:assert/strict';
import { test } from 'node:test';

import { sortAvailableFirst } from './ordering';
import type { CatalogProductCard } from './types';

function product(
  handle: string,
  availableForSale: boolean,
  tags: string[] = []
): CatalogProductCard {
  return {
    id: `gid://shopify/Product/${handle}`,
    handle,
    title: handle,
    description: null,
    availableForSale,
    tags,
    price: { amount: '100.00', currencyCode: 'USD' },
    compareAtPrice: null,
    images: [],
    soleVariantId: null,
  };
}

test('in stock comes first, then coming soon, then sold out', () => {
  const ordered = sortAvailableFirst([
    product('sold-out', false),
    product('coming-soon', false, ['coming-soon']),
    product('in-stock', true),
  ]);

  assert.deepEqual(
    ordered.map((entry) => entry.handle),
    ['in-stock', 'coming-soon', 'sold-out']
  );
});

test('the shopper-chosen order survives within each group', () => {
  const ordered = sortAvailableFirst([
    product('cheap-sold', false),
    product('cheap-available', true),
    product('mid-available', true),
    product('dear-sold', false),
    product('dear-available', true),
  ]);

  assert.deepEqual(
    ordered.map((entry) => entry.handle),
    [
      'cheap-available',
      'mid-available',
      'dear-available',
      'cheap-sold',
      'dear-sold',
    ],
    'products keep their relative order inside each availability group'
  );
});

test('the input array is not mutated', () => {
  const input = [product('sold', false), product('available', true)];
  const before = input.map((entry) => entry.handle);

  sortAvailableFirst(input);

  assert.deepEqual(input.map((entry) => entry.handle), before);
});

test('an empty catalogue is handled', () => {
  assert.deepEqual(sortAvailableFirst([]), []);
});
