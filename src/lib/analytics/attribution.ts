/**
 * Campaign attribution carried from the first page view into the order.
 *
 * The anonymous funnel (D-017) answers "how many"; this answers "which
 * campaign paid for it". They are deliberately separate: the funnel stores
 * aggregate counts and nothing else, while this travels with a cart the
 * visitor chose to create and ends up on their order in Shopify, where an
 * identified record already exists.
 *
 * Only the campaign tags are kept — never a referrer URL, an identifier or
 * anything about the person.
 */

/** Attribute names as they appear on the order in Shopify admin. */
export const ATTRIBUTION_KEYS = {
  source: 'Source',
  medium: 'Medium',
  campaign: 'Campaign',
} as const;

export type Attribution = {
  source?: string;
  medium?: string;
  campaign?: string;
};

/** Campaign tags are short labels; anything longer is a mistake or an attack. */
const MAX_VALUE_LENGTH = 80;

/**
 * Keeps letters, digits and the punctuation campaign names actually use.
 * Everything else goes, so nothing odd reaches the order record.
 */
function sanitizeValue(value: string | null | undefined): string | undefined {
  if (!value) return undefined;

  const cleaned = value
    .trim()
    .slice(0, MAX_VALUE_LENGTH)
    .replace(/[^\p{L}\p{N} ._\-|+/]/gu, '')
    .trim();

  return cleaned || undefined;
}

/**
 * Reads the campaign tags from a URL query string. Falls back to the referrer
 * host when there are no UTM tags, so organic visits still say where they came
 * from — the host only, never the full URL.
 */
export function readAttribution(
  search: string,
  referrer = ''
): Attribution | null {
  const params = new URLSearchParams(search);

  const source = sanitizeValue(params.get('utm_source'));
  const medium = sanitizeValue(params.get('utm_medium'));
  const campaign = sanitizeValue(params.get('utm_campaign'));

  if (source || medium || campaign) {
    return {
      ...(source ? { source } : {}),
      ...(medium ? { medium } : {}),
      ...(campaign ? { campaign } : {}),
    };
  }

  let host = '';
  try {
    host = new URL(referrer).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return null;
  }
  // Our own pages are not a source.
  if (!host || host.endsWith('801outlet.com')) return null;

  const referrerSource = sanitizeValue(host);
  return referrerSource
    ? { source: referrerSource, medium: 'referral' }
    : null;
}

export type CartAttribute = { key: string; value: string };

/** Shopify cart attributes, which become the order's custom attributes. */
export function toCartAttributes(
  attribution: Attribution | null
): CartAttribute[] {
  if (!attribution) return [];

  const attributes: CartAttribute[] = [];
  for (const [field, key] of Object.entries(ATTRIBUTION_KEYS) as Array<
    [keyof Attribution, string]
  >) {
    const value = sanitizeValue(attribution[field]);
    if (value) attributes.push({ key, value });
  }

  return attributes;
}

/** Parses what `toCartAttributes` wrote, for the orders screen. */
export function fromOrderAttributes(
  attributes: Array<{ key: string; value?: string | null }>
): Attribution | null {
  const found: Attribution = {};

  for (const attribute of attributes) {
    const value = sanitizeValue(attribute.value ?? undefined);
    if (!value) continue;
    if (attribute.key === ATTRIBUTION_KEYS.source) found.source = value;
    if (attribute.key === ATTRIBUTION_KEYS.medium) found.medium = value;
    if (attribute.key === ATTRIBUTION_KEYS.campaign) found.campaign = value;
  }

  return found.source || found.medium || found.campaign ? found : null;
}

/** "instagram · paid_social · summer-sale" for a compact table cell. */
export function formatAttribution(attribution: Attribution | null): string {
  if (!attribution) return '';
  return [attribution.source, attribution.medium, attribution.campaign]
    .filter(Boolean)
    .join(' · ');
}
