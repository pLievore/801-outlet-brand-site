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
    buildProductQuery({
      availability: 'available',
      minPrice: 500,
      maxPrice: 1800,
    }),
    'available_for_sale:true AND variants.price:>=500.00 AND variants.price:<=1800.00'
  );
  assert.equal(buildProductQuery({ availability: 'all' }), undefined);
  assert.deepEqual(normalizePriceRange(1800, 500), {
    minPrice: 500,
    maxPrice: 1800,
  });
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
