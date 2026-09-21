/**
 * Availability states shown on the storefront.
 *
 * The operator asked to stop deleting products that run out: a sold piece
 * keeps its page, its photos and its search ranking, and tells the visitor
 * what to expect instead of 404-ing. Restocking it is then a stock edit
 * rather than a re-listing.
 */

export type AvailabilityState =
  | 'in-stock'
  | 'dropship'
  | 'sold-out'
  | 'coming-soon';

/**
 * Tag the operator puts on a product in Shopify to mark it as arriving soon.
 * Matched loosely so `coming-soon`, `Coming Soon` and `COMING SOON` all work —
 * tags are typed by hand and Shopify keeps their casing.
 */
const COMING_SOON_TAG = 'coming soon';

/** The spelling the panel writes when the operator ticks "Coming soon". */
export const COMING_SOON_TAG_VALUE = 'coming-soon';

/** Tag the panel writes when the operator ticks "Dropshipping". */
export const DROPSHIP_TAG_VALUE = 'dropship';

const DROPSHIP_TAG = 'dropship';

/** Weeks quoted for a piece that ships from the supplier rather than the floor. */
export const DROPSHIP_LEAD_TIME_WEEKS = 2;

/** What the shopper is told about the wait, in one place for every surface. */
export const DROPSHIP_NOTICE = `Ships in up to ${DROPSHIP_LEAD_TIME_WEEKS} weeks`;

/**
 * Carried on the cart line, which Shopify hands to the order: the operation
 * opens a paid order and sees on the line itself that the piece comes from the
 * supplier, without cross-checking the catalogue.
 */
export const DROPSHIP_LINE_ATTRIBUTE_KEY = 'Delivery';

export type AvailabilityInput = {
  availableForSale: boolean;
  tags?: string[];
  /**
   * Units Shopify reports for the variant, where the surface knows them. The
   * catalogue card does not query it and leaves it out, which keeps the card
   * on the behaviour it had before dropshipping existed.
   */
  quantityAvailable?: number | null;
};

export type Availability = {
  state: AvailabilityState;
  /** Customer-facing label. */
  label: string;
  /** Whether the piece can be put in a cart right now. */
  purchasable: boolean;
};

const AVAILABILITY: Record<AvailabilityState, Availability> = {
  'in-stock': { state: 'in-stock', label: 'In stock', purchasable: true },
  // Sold from the supplier's stock, not the showroom floor: it can be bought
  // today and arrives later, so the label is the wait rather than the state.
  dropship: {
    state: 'dropship',
    label: DROPSHIP_NOTICE,
    purchasable: true,
  },
  // The state keeps its name; only what the shopper reads changed.
  'sold-out': { state: 'sold-out', label: 'Out of stock', purchasable: false },
  'coming-soon': {
    state: 'coming-soon',
    label: 'Coming soon',
    purchasable: false,
  },
};

function hasTag(tags: string[] | undefined, expected: string): boolean {
  if (!tags?.length) return false;
  return tags.some(
    (tag) => tag.trim().toLowerCase().replace(/[-_]/g, ' ') === expected
  );
}

export function hasComingSoonTag(tags: string[] | undefined): boolean {
  return hasTag(tags, COMING_SOON_TAG);
}

/**
 * The operator's intent, as the panel and the spreadsheet record it. The
 * storefront does not decide the label from this tag — see `getAvailability`.
 */
export function hasDropshipTag(tags: string[] | undefined): boolean {
  return hasTag(tags, DROPSHIP_TAG);
}

/**
 * Real stock always wins over a tag: if a piece marked "coming soon" or sold
 * as a dropship turns out to be on the floor, we sell it as in stock rather
 * than quoting a wait for something the customer could take home today.
 *
 * Dropshipping is read from the facts, not from the tag: a variant Shopify
 * still sells with nothing left is, by definition, coming from the supplier.
 * The tag is what the panel writes to put Shopify in that state; keying the
 * notice off the state itself means a variant switched to "continue selling"
 * by hand in Shopify cannot end up sold with no delivery notice at all.
 *
 * "Coming soon" beats dropshipping. Both can be true at once — a piece on
 * order with the supplier, marked as arriving — and the more restrictive
 * reading is the honest one: we do not promise two weeks on a piece the
 * operator has flagged as not yet sellable.
 */
export function getAvailability(product: AvailabilityInput): Availability {
  if (!product.availableForSale) {
    return hasComingSoonTag(product.tags)
      ? AVAILABILITY['coming-soon']
      : AVAILABILITY['sold-out'];
  }

  // Undefined means the surface did not ask Shopify for a count, not that the
  // count is zero: those surfaces keep reading as plain "In stock".
  const outOfStock =
    product.quantityAvailable != null && product.quantityAvailable <= 0;
  if (!outOfStock) return AVAILABILITY['in-stock'];

  return hasComingSoonTag(product.tags)
    ? AVAILABILITY['coming-soon']
    : AVAILABILITY['dropship'];
}
