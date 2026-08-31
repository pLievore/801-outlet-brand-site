import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  PIECE_SEPARATOR,
  PRODUCT_ATTRIBUTES,
  parseFeatures,
  splitPieces,
  toSpreadsheetAttributeValue,
  toStoredAttributeValue,
} from './attributes';

const dimensions = PRODUCT_ATTRIBUTES.find((spec) => spec.key === 'dimensions')!;
const features = PRODUCT_ATTRIBUTES.find((spec) => spec.key === 'features')!;

test('features are split one per line, ignoring blanks and padding', () => {
  assert.deepEqual(
    parseFeatures('Reversible chaise\n\n  Hidden storage  \nStain resistant\n'),
    ['Reversible chaise', 'Hidden storage', 'Stain resistant']
  );
});

test('an empty features value yields no items', () => {
  assert.deepEqual(parseFeatures(''), []);
  assert.deepEqual(parseFeatures('\n  \n'), []);
});

test('attribute keys are unique and safe as CSV column names', () => {
  const keys = PRODUCT_ATTRIBUTES.map((attribute) => attribute.key);

  assert.equal(new Set(keys).size, keys.length, 'duplicate attribute key');
  for (const key of keys) {
    assert.match(key, /^[a-z][a-z0-9_]*$/, `${key} is not a safe column name`);
  }
});

test('a single-line attribute folds line breaks into the piece separator', () => {
  // Exactly the shape that made the spreadsheet import fail against Shopify.
  const typed = '69.5" W x 139" L x 33.5" H\nOttoman: 33.5" W x 33.5" L x 18" H';

  const stored = toStoredAttributeValue(dimensions, typed);

  assert.equal(
    stored,
    '69.5" W x 139" L x 33.5" H ll Ottoman: 33.5" W x 33.5" L x 18" H'
  );
  assert.doesNotMatch(stored, /[\r\n]/, 'a single-line metafield rejects breaks');
});

test('carriage returns and blank lines do not survive the fold', () => {
  assert.equal(
    toStoredAttributeValue(dimensions, 'Sofa: 87" L\r\n\r\n  Chair: 38" L  \r\n'),
    `Sofa: 87" L${PIECE_SEPARATOR}Chair: 38" L`
  );
});

test('a single-piece value is left as it is', () => {
  const value = '132" W x 132" L x 35.6" H';
  assert.equal(toStoredAttributeValue(dimensions, value), value);
  assert.equal(toSpreadsheetAttributeValue(dimensions, value), value);
});

test('a multi-line attribute keeps its line breaks', () => {
  assert.equal(
    toStoredAttributeValue(features, 'Reversible chaise\r\nHidden storage'),
    'Reversible chaise\nHidden storage'
  );
});

test('the spreadsheet gets its line breaks back, so a cell round-trips', () => {
  const typed = 'Sofa: 87" L x 38" D x 36" H\nLoveseat: 62" L x 38" D x 36" H';

  const stored = toStoredAttributeValue(dimensions, typed);
  const backToSheet = toSpreadsheetAttributeValue(dimensions, stored);

  assert.equal(backToSheet, typed);
  assert.equal(toStoredAttributeValue(dimensions, backToSheet), stored);
});

test('values already stored with the separator split into their pieces', () => {
  assert.deepEqual(
    splitPieces('Sofa: 81.7" W ll Loveseat: 58.9" W ll Chair: 37.9" W'),
    ['Sofa: 81.7" W', 'Loveseat: 58.9" W', 'Chair: 37.9" W']
  );
  assert.deepEqual(splitPieces(''), []);
});

test('folding is idempotent, so re-importing an export changes nothing', () => {
  const once = toStoredAttributeValue(dimensions, 'Sofa: 87" L\nChair: 38" L');
  assert.equal(toStoredAttributeValue(dimensions, once), once);
});
