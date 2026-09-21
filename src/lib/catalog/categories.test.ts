import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  PRODUCT_CATEGORIES,
  isProductCategory,
  normalizeCategory,
  unknownCategoryMessage,
} from './categories';

test('every category resolves to its own stored spelling', () => {
  for (const category of PRODUCT_CATEGORIES) {
    assert.equal(normalizeCategory(category), category);
  }
});

test('casing, accents, separators and plurals are the same category', () => {
  for (const typed of ['sofa', 'SOFA', ' Sofas ', 'Sofá', 'sofás']) {
    assert.equal(
      normalizeCategory(typed),
      'Sofa',
      `expected ${JSON.stringify(typed)} to resolve to Sofa`
    );
  }

  assert.equal(normalizeCategory('accent-chair'), 'Accent chair');
  assert.equal(normalizeCategory('ACCENT_CHAIRS'), 'Accent chair');
});

test('the spellings the operation actually types resolve too', () => {
  assert.equal(normalizeCategory('couch'), 'Sofa');
  assert.equal(normalizeCategory('Sectional sofa'), 'Sectional');
  assert.equal(normalizeCategory('love seat'), 'Loveseat');
  assert.equal(normalizeCategory('sleeper sofa'), 'Sleeper');
  assert.equal(normalizeCategory('Coffee table'), 'Table');
});

test('an empty cell names no category, and is not an error on its own', () => {
  assert.equal(normalizeCategory(''), null);
  assert.equal(normalizeCategory('   '), null);
});

test('a value outside the list is refused rather than invented', () => {
  assert.equal(normalizeCategory('Chandelier'), null);
  assert.equal(normalizeCategory('sofa chair'), null);
});

test('the refusal tells the operator what the spreadsheet accepts', () => {
  const message = unknownCategoryMessage('  Chandelier ');

  assert.match(message, /Unknown category "Chandelier"/);
  for (const category of PRODUCT_CATEGORIES) {
    assert.ok(
      message.includes(category),
      `expected the message to list ${category}`
    );
  }
});

test('a stored productType is only ours when spelled exactly', () => {
  assert.equal(isProductCategory('Sectional'), true);
  assert.equal(isProductCategory('sectional'), false);
  assert.equal(isProductCategory('Chandelier'), false);
});

test('a sofa sold with its loveseat is its own category', () => {
  assert.equal(normalizeCategory('Sofa & Loveseat'), 'Sofa & Loveseat');
  for (const typed of [
    'sofa & loveseat set',
    'Sofa and Loveseat',
    'SOFA + LOVESEAT',
    'sofa&loveseat',
  ]) {
    assert.equal(
      normalizeCategory(typed),
      'Sofa & Loveseat',
      `expected ${JSON.stringify(typed)} to resolve to Sofa & Loveseat`
    );
  }

  // Everything else sold together stays under Set.
  assert.equal(normalizeCategory('Complete Living Room Set'), 'Set');
});
