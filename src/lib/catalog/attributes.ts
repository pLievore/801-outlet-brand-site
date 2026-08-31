/**
 * Product attributes the operation maintains by hand: dimensions, colour,
 * material and features.
 *
 * They live as Shopify metafields under the `custom` namespace, in plain text,
 * because the people filling them work in a spreadsheet. The Shopify taxonomy
 * has `shopify.color-pattern` and `shopify.upholstery-material`, but those are
 * metaobject references picked from a fixed list — not something you can type
 * a value into from a CSV, which is what this flow needs.
 *
 * Shared by three surfaces: the CSV import/export in the panel, the Storefront
 * query that reads them, and the product page that shows them.
 */

export const ATTRIBUTE_NAMESPACE = 'custom';

export type ProductAttributeKey =
  | 'dimensions'
  | 'color'
  | 'material'
  | 'features';

export type ProductAttributeSpec = {
  key: ProductAttributeKey;
  /** Column name in the CSV and label on the product page. */
  label: string;
  /** Shopify metafield type. */
  type: 'single_line_text_field' | 'multi_line_text_field';
  /** Shown to the operator in Shopify admin. */
  description: string;
  /** Example value, used in the CSV template. */
  example: string;
};

export const PRODUCT_ATTRIBUTES: ProductAttributeSpec[] = [
  {
    key: 'dimensions',
    label: 'Dimensions',
    type: 'single_line_text_field',
    description:
      'Overall size as the customer should read it, e.g. 88"W x 36"D x 34"H.',
    example: '88"W x 36"D x 34"H',
  },
  {
    key: 'color',
    label: 'Color',
    type: 'single_line_text_field',
    description: 'Colour as described to the customer, e.g. Sage green.',
    example: 'Sage green',
  },
  {
    key: 'material',
    label: 'Material',
    type: 'single_line_text_field',
    description: 'Upholstery or main material, e.g. Performance chenille.',
    example: 'Performance chenille',
  },
  {
    key: 'features',
    label: 'Features',
    type: 'multi_line_text_field',
    description:
      'One feature per line: reversible chaise, hidden storage, and so on.',
    example: 'Reversible chaise\nHidden storage',
  },
];

/** CSV column name for an attribute — kept identical to the metafield key. */
export function attributeColumn(key: ProductAttributeKey): string {
  return key;
}

/**
 * Separator between the pieces of a multi-part value, as already stored in the
 * shop: `Sofa: 87" L … ll Loveseat: 62" L …`.
 *
 * A set with a sofa, a loveseat and an ottoman is described one piece per line
 * in the spreadsheet, which is the natural way to type it — but `dimensions`,
 * `color` and `material` are `single_line_text_field` metafields, and Shopify
 * rejects a value carrying a line break with "Value must be a single line text
 * string". Rather than ask the operation to type around the storage type, line
 * breaks are folded into this separator on the way in and unfolded on the way
 * back out to the spreadsheet.
 */
export const PIECE_SEPARATOR = ' ll ';

/** Matches the separator with whatever spacing it was typed with. */
const PIECE_SEPARATOR_PATTERN = /\s*\bll\b\s*/g;

/**
 * The value as Shopify must receive it. Single-line metafields cannot hold a
 * line break, so each break becomes the piece separator; multi-line ones keep
 * their breaks, normalised to `\n`.
 */
export function toStoredAttributeValue(
  spec: ProductAttributeSpec,
  value: string
): string {
  const normalized = value.replace(/\r\n?/g, '\n');
  if (spec.type === 'multi_line_text_field') return normalized.trim();

  return normalized
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join(PIECE_SEPARATOR)
    .trim();
}

/**
 * The value as the spreadsheet should show it: one piece per line, so a cell
 * edited with Alt+Enter round-trips through export and import unchanged.
 */
export function toSpreadsheetAttributeValue(
  spec: ProductAttributeSpec,
  value: string
): string {
  if (spec.type === 'multi_line_text_field') return value;
  return splitPieces(value).join('\n');
}

/** The pieces of a stored value — one per line as originally typed. */
export function splitPieces(value: string): string[] {
  return value
    .split(PIECE_SEPARATOR_PATTERN)
    .map((piece) => piece.trim())
    .filter(Boolean);
}

/** Features are stored as one line per item; empty lines are dropped. */
export function parseFeatures(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}
