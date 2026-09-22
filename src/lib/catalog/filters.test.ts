import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildProductQuery,
  normalizeCatalogSearch,
  normalizePriceRange,
  parseCatalogAvailability,
  parseCatalogCategory,
  parseCatalogPrice,
  parseCatalogSort,
  priceBoundsOf,
  withinPriceRange,
} from './filters';

test('normalizes catalog query parameters without accepting arbitrary syntax', () => {
  assert.equal(normalizeCatalogSearch('  navy   sofa:*  '), 'navy sofa');
  assert.equal(parseCatalogSort('price_desc'), 'price_desc');
  assert.equal(parseCatalogSort('invalid'), 'featured');
  assert.equal(parseCatalogAvailability('available'), 'available');
  assert.equal(parseCatalogAvailability('false'), 'all');
  assert.equal(parseCatalogPrice('1540.509'), 1540.51);
  assert.equal(parseCatalogPrice('-1'), undefined);
});

test('builds only supported Shopify product filters', () => {
  assert.equal(
    buildProductQuery({ availability: 'available' }),
    'available_for_sale:true'
  );
  assert.equal(buildProductQuery({ availability: 'all' }), undefined);
  assert.deepEqual(normalizePriceRange(1800, 500), {
    minPrice: 500,
    maxPrice: 1800,
  });
});

test('price is filtered in memory, against the price the card shows', () => {
  assert.equal(withinPriceRange('1899.00', 1000, 2000), true);
  assert.equal(withinPriceRange('1899.00', 1900, undefined), false);
  assert.equal(withinPriceRange('1899.00', undefined, 1800), false);
  // No range asked for, and a price Shopify did not give us, both pass through
  // rather than emptying the catalogue.
  assert.equal(withinPriceRange('1899.00'), true);
  assert.equal(withinPriceRange('', 1000, 2000), true);
});

test('the slider ends round outwards to a figure worth reading', () => {
  assert.deepEqual(priceBoundsOf(['1199.00', '2499.00', '1899.00']), {
    min: 1150,
    max: 2500,
  });
  // One product still needs two distinct ends, or the slider has no travel.
  assert.deepEqual(priceBoundsOf(['1200.00']), { min: 1200, max: 1250 });
  assert.equal(priceBoundsOf([]), null);
});

test('a category filters by product type, quoted so it survives its spaces', () => {
  assert.equal(
    buildProductQuery({ availability: 'all', category: 'Sofa & Loveseat' }),
    'product_type:"Sofa & Loveseat"'
  );
  assert.equal(
    buildProductQuery({ availability: 'available', category: 'Sectional' }),
    'available_for_sale:true AND product_type:"Sectional"'
  );
});

test('a category in the URL is read through the catalogue list', () => {
  assert.equal(parseCatalogCategory('sectional'), 'Sectional');
  assert.equal(parseCatalogCategory('sofa & loveseat set'), 'Sofa & Loveseat');
  // A category the shop does not have filters nothing rather than everything.
  assert.equal(parseCatalogCategory('chandelier'), undefined);
  assert.equal(parseCatalogCategory(''), undefined);
  assert.equal(parseCatalogCategory(undefined), undefined);
});
