/**
 * Reading the operation's spreadsheet.
 *
 * The file arrives from `/admin/products/import`, is parsed in the browser and
 * sent to the server as rows. Everything here is pure so it can be tested
 * without a Shopify store or a browser: what a cell means is decided once,
 * here, and the server action only decides what to do about it.
 *
 * Columns are matched by name, never by position: a spreadsheet saved before a
 * column existed keeps importing, and a column left out means "leave this
 * alone" rather than "clear it".
 */

import {
  PRODUCT_ATTRIBUTES,
  type ProductAttributeKey,
} from '../catalog/attributes';

/**
 * Same shape as the panel's `ProductAttributes`, spelled here so this module
 * stays free of the server-only Shopify client and can run in the browser,
 * where the file is read.
 */
type ProductAttributes = Partial<Record<ProductAttributeKey, string>>;

export type ImportRow = {
  /** Empty when the row describes a product that does not exist yet. */
  variantId: string;
  sku?: string;
  title?: string;
  description?: string;
  price?: string;
  compareAtPrice?: string;
  quantity?: number;
  attributes?: ProductAttributes;
  /**
   * As typed in the spreadsheet — validated against the closed list on the
   * server, where the error can be shown next to the row it came from.
   */
  category?: string;
  /** `undefined` when the column is absent or the cell is empty. */
  dropship?: boolean;
};

/** Minimal CSV parser with quoted-field support. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(cell);
      cell = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[index + 1] === '\n') index += 1;
      row.push(cell);
      cell = '';
      if (row.some((value) => value !== '')) rows.push(row);
      row = [];
    } else {
      cell += char;
    }
  }
  row.push(cell);
  if (row.some((value) => value !== '')) rows.push(row);
  return rows;
}

const TRUE_VALUES = new Set(['yes', 'y', 'true', '1', 'x', 'sim']);
const FALSE_VALUES = new Set(['no', 'n', 'false', '0', 'nao', 'não', '-']);

/**
 * How a yes/no cell is read. The spreadsheet is filled by two people on two
 * keyboards, so `yes`, `x`, `1` and `sim` all mean the same thing.
 *
 * An empty cell returns `undefined` — "leave this product as it is" — while an
 * explicit `no` is a decision to turn the flag off. A value that is neither
 * returns `null`, which the caller reports instead of guessing.
 */
export function parseFlag(value: string): boolean | null | undefined {
  const clean = value.trim().toLowerCase();
  if (!clean) return undefined;
  if (TRUE_VALUES.has(clean)) return true;
  if (FALSE_VALUES.has(clean)) return false;
  return null;
}

/** What the operator reads when a yes/no cell says something else. */
export function unknownFlagMessage(column: string, value: string): string {
  return `The ${column} column takes yes or no — "${value.trim()}" is neither.`;
}

export type ImportParseResult = { rows?: ImportRow[]; error?: string };

export function toImportRows(csv: string[][]): ImportParseResult {
  if (csv.length < 2) return { error: 'The file has no data rows.' };

  // Excel writes a UTF-8 BOM into the first header cell; strip it or the
  // first column never matches.
  const header = csv[0].map((cell) =>
    cell.replace(/^﻿/, '').trim().toLowerCase()
  );
  const columnOf = (name: string) => header.indexOf(name);

  const variantIndex = columnOf('variant_id');
  const skuIndex = columnOf('sku');
  if (variantIndex === -1 && skuIndex === -1) {
    return { error: 'The file needs a variant_id or an sku column.' };
  }

  const titleIndex = columnOf('product_title');
  const descriptionIndex = columnOf('description');
  const priceIndex = columnOf('price');
  const compareIndex = columnOf('compare_at_price');
  const quantityIndex = columnOf('quantity');
  const categoryIndex = columnOf('category');
  const dropshipIndex = columnOf('dropship');
  const attributeIndexes = PRODUCT_ATTRIBUTES.map((attribute) => ({
    key: attribute.key,
    index: columnOf(attribute.key),
  }));

  const editable = [
    titleIndex,
    descriptionIndex,
    priceIndex,
    compareIndex,
    quantityIndex,
    categoryIndex,
    dropshipIndex,
    ...attributeIndexes.map((attribute) => attribute.index),
  ].some((index) => index !== -1);
  if (!editable) {
    return {
      error:
        'Nothing to import: include at least one of product_title, description, price, compare_at_price, quantity, category, dropship, or an attribute column.',
    };
  }

  const cellAt = (line: string[], index: number) =>
    index === -1 ? undefined : (line[index] ?? '').trim();

  const rows: ImportRow[] = [];
  for (const line of csv.slice(1)) {
    const variantId = cellAt(line, variantIndex) ?? '';
    const sku = cellAt(line, skuIndex);
    const title = cellAt(line, titleIndex);

    // A row with no key and no title carries nothing we can act on.
    if (!variantId && !sku && !title) continue;

    const row: ImportRow = { variantId };
    if (sku !== undefined) row.sku = sku;
    if (title !== undefined) row.title = title;
    if (descriptionIndex !== -1) {
      row.description = line[descriptionIndex] ?? '';
    }
    if (priceIndex !== -1 && cellAt(line, priceIndex) !== '') {
      row.price = cellAt(line, priceIndex);
    }
    if (compareIndex !== -1) row.compareAtPrice = cellAt(line, compareIndex);
    if (quantityIndex !== -1 && cellAt(line, quantityIndex) !== '') {
      row.quantity = Number(cellAt(line, quantityIndex));
    }
    // An empty category cell leaves the product's category alone; clearing one
    // is done in the panel, where it cannot happen by dragging a blank down a
    // column.
    if (categoryIndex !== -1 && cellAt(line, categoryIndex) !== '') {
      row.category = cellAt(line, categoryIndex);
    }
    if (dropshipIndex !== -1) {
      const flag = parseFlag(line[dropshipIndex] ?? '');
      // An unreadable value stops the whole file: a cell nobody can read is a
      // typo, and importing the other 200 rows around it hides it.
      if (flag === null) {
        return {
          error: unknownFlagMessage('dropship', line[dropshipIndex] ?? ''),
        };
      }
      if (flag !== undefined) row.dropship = flag;
    }

    const attributes: ProductAttributes = {};
    for (const attribute of attributeIndexes) {
      if (attribute.index === -1) continue;
      attributes[attribute.key] = line[attribute.index] ?? '';
    }
    if (Object.keys(attributes).length > 0) row.attributes = attributes;

    rows.push(row);
  }

  return { rows };
}
