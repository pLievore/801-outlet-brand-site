/**
 * The categories the operation classifies a piece under.
 *
 * Stored in Shopify's own `productType`, which the product page already shows
 * as a specification — a metafield would have been a second place to keep the
 * same fact. The list is closed on purpose: the column is typed by hand in a
 * spreadsheet, and "Sofa", "sofas" and "SOFÁ" landing as three categories is
 * exactly what a free-text column produces after a few weeks.
 *
 * Shared by the CSV import/export in the panel and the product editor.
 */

export const PRODUCT_CATEGORIES = [
  'Sectional',
  'Sofa',
  'Loveseat',
  'Sofa & Loveseat',
  'Recliner',
  'Accent chair',
  'Ottoman',
  'Sleeper',
  'Set',
  'Bed',
  'Table',
  'Other',
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

/**
 * Spellings the operation is likely to type for a category that already
 * exists. They are conveniences, not new categories: everything here resolves
 * to one of `PRODUCT_CATEGORIES`.
 */
const ALIASES: Record<string, ProductCategory> = {
  couch: 'Sofa',
  'sectional sofa': 'Sectional',
  'modular sectional': 'Sectional',
  'love seat': 'Loveseat',
  chair: 'Accent chair',
  armchair: 'Accent chair',
  'arm chair': 'Accent chair',
  'accent armchair': 'Accent chair',
  recliner_chair: 'Recliner',
  'reclining chair': 'Recliner',
  pouf: 'Ottoman',
  footstool: 'Ottoman',
  'sofa bed': 'Sleeper',
  'sleeper sofa': 'Sleeper',
  sofabed: 'Sleeper',
  'coffee table': 'Table',
  'side table': 'Table',
  'end table': 'Table',
  headboard: 'Bed',
  // A sofa sold with its matching loveseat is its own thing, and the most
  // common pairing in the shop -- hence a category rather than a spelling of
  // "Set", which stays for everything else sold together.
  'sofa & loveseat set': 'Sofa & Loveseat',
  'sofa and loveseat': 'Sofa & Loveseat',
  'sofa and loveseat set': 'Sofa & Loveseat',
  'sofa loveseat set': 'Sofa & Loveseat',
  'sofa + loveseat': 'Sofa & Loveseat',
  'sofa&loveseat': 'Sofa & Loveseat',
  'living room set': 'Set',
  'complete living room set': 'Set',
  'sofa set': 'Set',
};

/**
 * Comparison form: accents dropped, separators and casing flattened, and a
 * trailing plural removed, so `Sofás`, `sofa` and `SOFAS` are one value.
 */
function comparable(value: string): string {
  const flattened = value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return flattened.endsWith('s') ? flattened.slice(0, -1) : flattened;
}

const BY_COMPARABLE = new Map<string, ProductCategory>([
  ...PRODUCT_CATEGORIES.map(
    (category) => [comparable(category), category] as const
  ),
  ...Object.entries(ALIASES).map(
    ([alias, category]) => [comparable(alias), category] as const
  ),
]);

/**
 * The category as it should be stored, or `null` when the value does not name
 * one. An empty cell is not an error — it means "leave this product alone" —
 * so callers check for emptiness before asking.
 */
export function normalizeCategory(value: string): ProductCategory | null {
  const key = comparable(value);
  if (!key) return null;

  return BY_COMPARABLE.get(key) ?? null;
}

/** Whether a stored `productType` is one of ours, spelled exactly. */
export function isProductCategory(value: string): value is ProductCategory {
  return (PRODUCT_CATEGORIES as readonly string[]).includes(value);
}

/**
 * What the operator reads in the import preview when a cell names no category.
 * It lists the accepted values: the spreadsheet is where the mistake was made,
 * and the fix has to be possible without leaving it.
 */
export function unknownCategoryMessage(value: string): string {
  return `Unknown category "${value.trim()}". Use one of: ${PRODUCT_CATEGORIES.join(', ')}.`;
}
