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

test('preserves external menu destinations explicitly', () => {
  assert.deepEqual(
    normalizeShopifyMenuUrl('https://example.com/help', 'HTTP'),
    { href: 'https://example.com/help', external: true }
  );
});
