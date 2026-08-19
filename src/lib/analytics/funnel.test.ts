import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  classifyTrafficSource,
  isProductFunnelStep,
  sanitizeHandles,
} from './funnel-rules';

test('traffic sources are bucketed from referrer or utm', () => {
  assert.equal(
    classifyTrafficSource('https://l.instagram.com/', ''),
    'instagram'
  );
  assert.equal(classifyTrafficSource('', 'ig'), 'instagram');
  assert.equal(classifyTrafficSource('https://m.facebook.com/', ''), 'facebook');
  assert.equal(classifyTrafficSource('https://www.google.com/', ''), 'google');
  assert.equal(classifyTrafficSource('', ''), 'direct');
  assert.equal(
    classifyTrafficSource('https://801outlet.com/products', ''),
    'direct'
  );
  assert.equal(classifyTrafficSource('https://example.com/', ''), 'other');
});

test('only product steps carry a product dimension', () => {
  assert.equal(isProductFunnelStep('product_view'), true);
  assert.equal(isProductFunnelStep('add_to_cart'), true);
  assert.equal(isProductFunnelStep('checkout_start'), true);
  // A visit happens before the visitor has looked at anything.
  assert.equal(isProductFunnelStep('session'), false);
});

test('handles are normalised and malformed ones are dropped', () => {
  assert.deepEqual(sanitizeHandles('Linen-Sofa'), ['linen-sofa']);
  assert.deepEqual(sanitizeHandles(['a-sofa', 'a-sofa']), ['a-sofa'], 'dedupes');
  assert.deepEqual(sanitizeHandles(['ok-handle', 'not a handle!', '']), [
    'ok-handle',
  ]);
  assert.deepEqual(sanitizeHandles(['-leading-dash']), []);
  assert.deepEqual(sanitizeHandles([123, null, undefined]), []);
  assert.deepEqual(sanitizeHandles('a'.repeat(200)), [], 'rejects long values');
});

test('a beacon cannot carry an unbounded number of handles', () => {
  const many = Array.from({ length: 60 }, (_, index) => `sofa-${index}`);

  assert.equal(sanitizeHandles(many).length, 20);
});
