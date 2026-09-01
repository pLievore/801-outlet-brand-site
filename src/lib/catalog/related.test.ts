import assert from 'node:assert/strict';
import { test } from 'node:test';

import { pickRelatedByPrice } from './related';
import type { CatalogProductCard } from './types';

function product(
  handle: string,
  amount: string,
  availableForSale = true,
  tags: string[] = []
): CatalogProductCard {
  return {
    id: `gid://shopify/Product/${handle}`,
    handle,
    title: handle,
    description: null,
    availableForSale,
    tags,
    price: { amount, currencyCode: 'USD' },
    compareAtPrice: null,
    images: [],
  };
}

const current = product('current', '1500.00');

test('picks the pieces closest in price', () => {
  const picked = pickRelatedByPrice(
    [
      product('far-cheap', '400.00'),
      product('near-under', '1450.00'),
      product('far-rich', '3200.00'),
      product('near-over', '1600.00'),
      product('mid', '2000.00'),
    ],
    current,
    3
  );

  assert.deepEqual(
    picked.map((entry) => entry.handle),
    ['near-under', 'near-over', 'mid']
  );
});

test('never suggests the piece being viewed', () => {
  const picked = pickRelatedByPrice(
    [product('current', '1500.00'), product('other', '1490.00')],
    current
  );

  assert.deepEqual(
    picked.map((entry) => entry.handle),
    ['other']
  );
});

test('a sellable piece outranks a sold-out one at a closer price', () => {
  const picked = pickRelatedByPrice(
    [
      product('sold-out-perfect', '1500.00', false),
      product('available-further', '1800.00'),
    ],
    current,
    2
  );

  assert.deepEqual(
    picked.map((entry) => entry.handle),
    ['available-further', 'sold-out-perfect']
  );
});

test('equal distances keep a stable order instead of reshuffling', () => {
  const candidates = [
    product('beta', '1600.00'),
    product('alpha', '1400.00'),
  ];

  assert.deepEqual(
    pickRelatedByPrice(candidates, current).map((entry) => entry.handle),
    pickRelatedByPrice([...candidates].reverse(), current).map(
      (entry) => entry.handle
    )
  );
});

test('a price that is not a number yields nothing rather than junk', () => {
  assert.deepEqual(
    pickRelatedByPrice([product('other', '900.00')], product('odd', 'n/a')),
    []
  );
});

test('candidates without a usable price are skipped', () => {
  const picked = pickRelatedByPrice(
    [product('broken', ''), product('fine', '1550.00')],
    current
  );

  assert.deepEqual(
    picked.map((entry) => entry.handle),
    ['fine']
  );
});

test('asking for nothing returns nothing', () => {
  assert.deepEqual(pickRelatedByPrice([product('a', '1.00')], current, 0), []);
});
