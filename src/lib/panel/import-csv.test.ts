import assert from 'node:assert/strict';
import { test } from 'node:test';

import { parseCsv, parseFlag, toImportRows } from './import-csv';

const HEADER =
  'variant_id,product_title,sku,status,category,dropship,price,quantity';

function rowsOf(csv: string) {
  const parsed = toImportRows(parseCsv(csv));
  assert.equal(parsed.error, undefined, parsed.error);
  assert.ok(parsed.rows);
  return parsed.rows;
}

test('a spreadsheet saved before the new columns still imports', () => {
  const rows = rowsOf(
    'variant_id,price,quantity\ngid://shopify/ProductVariant/1,1899.00,2'
  );

  assert.equal(rows.length, 1);
  assert.equal(rows[0].price, '1899.00');
  // Absent column means "leave it alone", never "clear it".
  assert.equal(rows[0].category, undefined);
  assert.equal(rows[0].dropship, undefined);
});

test('category travels as typed, for the server to validate', () => {
  const rows = rowsOf(
    `${HEADER}\ngid://shopify/ProductVariant/1,Aspen,ASP-1,ACTIVE, sectional ,,1899.00,0`
  );

  assert.equal(rows[0].category, 'sectional');
});

test('an empty category cell leaves the product alone', () => {
  const rows = rowsOf(
    `${HEADER}\ngid://shopify/ProductVariant/1,Aspen,ASP-1,ACTIVE,,,1899.00,0`
  );

  assert.equal(rows[0].category, undefined);
});

test('dropshipping is read from the spellings the operation types', () => {
  for (const [cell, expected] of [
    ['yes', true],
    ['YES', true],
    ['x', true],
    ['1', true],
    ['sim', true],
    ['no', false],
    ['FALSE', false],
    ['0', false],
    ['não', false],
  ] as const) {
    const rows = rowsOf(
      `${HEADER}\ngid://shopify/ProductVariant/1,Aspen,ASP-1,ACTIVE,Sofa,${cell},1899.00,0`
    );
    assert.equal(
      rows[0].dropship,
      expected,
      `expected ${JSON.stringify(cell)} to read as ${expected}`
    );
  }
});

test('an empty dropship cell is silence, not "no"', () => {
  const rows = rowsOf(
    `${HEADER}\ngid://shopify/ProductVariant/1,Aspen,ASP-1,ACTIVE,Sofa,,1899.00,0`
  );

  assert.equal(rows[0].dropship, undefined);
});

test('a dropship cell nobody can read stops the file', () => {
  const parsed = toImportRows(
    parseCsv(
      `${HEADER}\ngid://shopify/ProductVariant/1,Aspen,ASP-1,ACTIVE,Sofa,maybe,1899.00,0`
    )
  );

  assert.equal(parsed.rows, undefined);
  assert.match(parsed.error ?? '', /takes yes or no/);
  assert.match(parsed.error ?? '', /maybe/);
});

test('a file carrying only the new columns is still worth importing', () => {
  const rows = rowsOf(
    'variant_id,category,dropship\ngid://shopify/ProductVariant/1,Sofa,yes'
  );

  assert.equal(rows[0].category, 'Sofa');
  assert.equal(rows[0].dropship, true);
});

test('a file with no editable column at all is refused', () => {
  const parsed = toImportRows(parseCsv('variant_id,variant_title\nabc,Default'));

  assert.equal(parsed.rows, undefined);
  assert.match(parsed.error ?? '', /Nothing to import/);
  // The message has to name the new columns too, or it sends the operator
  // looking for a column that would in fact have worked.
  assert.match(parsed.error ?? '', /category/);
  assert.match(parsed.error ?? '', /dropship/);
});

test('the BOM Excel writes does not hide the first column', () => {
  const rows = rowsOf(
    '﻿variant_id,category\ngid://shopify/ProductVariant/1,Loveseat'
  );

  assert.equal(rows[0].variantId, 'gid://shopify/ProductVariant/1');
  assert.equal(rows[0].category, 'Loveseat');
});

test('quoted cells with commas and line breaks survive the parse', () => {
  const rows = rowsOf(
    'variant_id,description,category\n' +
      'gid://shopify/ProductVariant/1,"Deep, relaxed seating\nand a reversible chaise",Sectional'
  );

  assert.equal(
    rows[0].description,
    'Deep, relaxed seating\nand a reversible chaise'
  );
  assert.equal(rows[0].category, 'Sectional');
});

test('parseFlag tells empty, false and unreadable apart', () => {
  assert.equal(parseFlag(''), undefined);
  assert.equal(parseFlag('   '), undefined);
  assert.equal(parseFlag('no'), false);
  assert.equal(parseFlag('yes'), true);
  assert.equal(parseFlag('later'), null);
});
