import assert from 'node:assert/strict';
import test from 'node:test';

import { normalizeShopifyMenuUrl } from './menu';

test('maps Online Store menu destinations to headless routes', () => {
  assert.deepEqual(
    normalizeShopifyMenuUrl(
      'https://801outlet.com/collections/all',
      'CATALOG'
    ),
    { href: '/products', external: false }
  );
  assert.deepEqual(
    normalizeShopifyMenuUrl(
      'https://801outlet.com/pages/contact',
      'PAGE'
    ),
    { href: '/contact', external: false }
  );
  assert.deepEqual(
    normalizeShopifyMenuUrl(
      'https://801outlet.com/pages/test-showroom-booking',
      'PAGE'
    ),
    { href: '/showroom', external: false }
  );
});

test('rewrites links built on the checkout-only store domains', () => {
  // Shopify emits menu URLs on the primary domain, now shop.801outlet.com.
  assert.deepEqual(
    normalizeShopifyMenuUrl(
      'https://shop.801outlet.com/pages/test-showroom-booking',
      'PAGE'
    ),
    { href: '/showroom', external: false }
  );
  assert.deepEqual(
    normalizeShopifyMenuUrl(
      'https://xwn9c1-m8.myshopify.com/pages/contact',
      'PAGE'
    ),
    { href: '/contact', external: false }
  );
  assert.deepEqual(
    normalizeShopifyMenuUrl(
      'https://shop.801outlet.com/collections/sofas',
      'COLLECTION'
    ),
    { href: '/collections/sofas', external: false }
  );
});

test('preserves external menu destinations explicitly', () => {
  assert.deepEqual(
    normalizeShopifyMenuUrl('https://example.com/help', 'HTTP'),
    { href: 'https://example.com/help', external: true }
  );
});
