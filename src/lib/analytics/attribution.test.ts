import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  formatAttribution,
  fromOrderAttributes,
  readAttribution,
  toCartAttributes,
} from './attribution';

test('utm tags are read from the query string', () => {
  assert.deepEqual(
    readAttribution('?utm_source=instagram&utm_medium=paid&utm_campaign=summer'),
    { source: 'instagram', medium: 'paid', campaign: 'summer' }
  );
});

test('a partial set of tags is still attribution', () => {
  assert.deepEqual(readAttribution('?utm_source=google'), {
    source: 'google',
  });
});

test('without utm tags the referrer host is the source', () => {
  assert.deepEqual(readAttribution('', 'https://www.facebook.com/some/post'), {
    source: 'facebook.com',
    medium: 'referral',
  });
});

test('our own pages and empty referrers are not a source', () => {
  assert.equal(readAttribution('', 'https://801outlet.com/products'), null);
  assert.equal(readAttribution('', ''), null);
  assert.equal(readAttribution('', 'not-a-url'), null);
});

test('utm tags win over the referrer', () => {
  assert.deepEqual(
    readAttribution('?utm_source=newsletter', 'https://facebook.com/'),
    { source: 'newsletter' }
  );
});

test('values are cleaned and length-capped', () => {
  const attribution = readAttribution(
    `?utm_source=${encodeURIComponent('  <script>ig  ')}&utm_campaign=${'x'.repeat(200)}`
  );

  assert.equal(attribution?.source, 'scriptig');
  assert.equal(attribution?.campaign?.length, 80);
});

test('a value left with nothing usable is dropped', () => {
  assert.equal(readAttribution('?utm_source=%3C%3E%21'), null);
});

test('cart attributes round-trip through the order', () => {
  const attribution = { source: 'instagram', campaign: 'summer-sale' };
  const cartAttributes = toCartAttributes(attribution);

  assert.deepEqual(cartAttributes, [
    { key: 'Source', value: 'instagram' },
    { key: 'Campaign', value: 'summer-sale' },
  ]);
  assert.deepEqual(fromOrderAttributes(cartAttributes), attribution);
});

test('no attribution produces no cart attributes', () => {
  assert.deepEqual(toCartAttributes(null), []);
  assert.equal(fromOrderAttributes([]), null);
  assert.equal(
    fromOrderAttributes([{ key: 'Gift note', value: 'happy birthday' }]),
    null,
    'unrelated order attributes are ignored'
  );
});

test('attribution renders as a compact label', () => {
  assert.equal(
    formatAttribution({ source: 'instagram', medium: 'paid', campaign: 'x' }),
    'instagram · paid · x'
  );
  assert.equal(formatAttribution({ source: 'google' }), 'google');
  assert.equal(formatAttribution(null), '');
});
