import assert from 'node:assert/strict';
import { test } from 'node:test';

import { getAvailability, hasDropshipTag } from './availability';

test('an available product is in stock and purchasable', () => {
  const availability = getAvailability({ availableForSale: true, tags: [] });

  assert.equal(availability.state, 'in-stock');
  assert.equal(availability.label, 'In stock');
  assert.equal(availability.purchasable, true);
});

test('an unavailable product without tags reads as sold out', () => {
  const availability = getAvailability({ availableForSale: false, tags: [] });

  assert.equal(availability.state, 'sold-out');
  assert.equal(availability.label, 'Out of stock');
  assert.equal(availability.purchasable, false);
});

test('the coming-soon tag only applies while the product is out of stock', () => {
  const outOfStock = getAvailability({
    availableForSale: false,
    tags: ['sectional', 'coming-soon'],
  });
  assert.equal(outOfStock.state, 'coming-soon');
  assert.equal(outOfStock.purchasable, false);

  // Real stock wins: we sell it rather than hiding it behind the label.
  const restocked = getAvailability({
    availableForSale: true,
    tags: ['coming-soon'],
  });
  assert.equal(restocked.state, 'in-stock');
  assert.equal(restocked.purchasable, true);
});

test('the tag is matched regardless of casing, spacing or separator', () => {
  for (const tag of ['Coming Soon', 'COMING-SOON', 'coming_soon', ' coming soon ']) {
    assert.equal(
      getAvailability({ availableForSale: false, tags: [tag] }).state,
      'coming-soon',
      `expected ${JSON.stringify(tag)} to mark the product as coming soon`
    );
  }
});

test('unrelated tags never change the state', () => {
  assert.equal(
    getAvailability({ availableForSale: false, tags: ['soon', 'coming'] }).state,
    'sold-out'
  );
});

test('missing tags are tolerated', () => {
  assert.equal(getAvailability({ availableForSale: false }).state, 'sold-out');
});

test('a variant Shopify still sells with nothing left ships from the supplier', () => {
  const availability = getAvailability({
    availableForSale: true,
    tags: ['dropship'],
    quantityAvailable: 0,
  });

  assert.equal(availability.state, 'dropship');
  assert.equal(availability.label, 'Ships in up to 2 weeks');
  // The point of the state: it is bought today and arrives later.
  assert.equal(availability.purchasable, true);
});

test('the supplier wait is read from the stock, not from the tag', () => {
  // Someone ticked "continue selling" in Shopify and never tagged the product.
  const untagged = getAvailability({
    availableForSale: true,
    tags: [],
    quantityAvailable: 0,
  });
  assert.equal(untagged.state, 'dropship');

  // Tagged, but there are pieces on the floor: it sells as normal stock.
  const onTheFloor = getAvailability({
    availableForSale: true,
    tags: ['dropship'],
    quantityAvailable: 3,
  });
  assert.equal(onTheFloor.state, 'in-stock');
});

test('coming soon beats the supplier wait when both are true', () => {
  const availability = getAvailability({
    availableForSale: true,
    tags: ['dropship', 'Coming Soon'],
    quantityAvailable: 0,
  });

  assert.equal(availability.state, 'coming-soon');
  assert.equal(availability.purchasable, false);
});

test('a surface that does not query the count keeps reading as in stock', () => {
  assert.equal(
    getAvailability({ availableForSale: true, tags: ['dropship'] }).state,
    'in-stock'
  );
  assert.equal(
    getAvailability({
      availableForSale: true,
      tags: ['dropship'],
      quantityAvailable: null,
    }).state,
    'in-stock'
  );
});

test('a product out of stock and unsellable is sold out, tag or no tag', () => {
  assert.equal(
    getAvailability({
      availableForSale: false,
      tags: ['dropship'],
      quantityAvailable: 0,
    }).state,
    'sold-out'
  );
});

test('the dropship tag is matched like the coming-soon one', () => {
  for (const tag of ['Dropship', 'DROPSHIP', ' dropship ']) {
    assert.equal(
      hasDropshipTag([tag]),
      true,
      `expected ${JSON.stringify(tag)} to mark the product as dropship`
    );
  }
  assert.equal(hasDropshipTag(['drop ship']), false);
  assert.equal(hasDropshipTag(undefined), false);
});
