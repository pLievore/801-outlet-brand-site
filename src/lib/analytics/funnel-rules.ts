/**
 * Pure funnel rules — names, labels and classification, with no storage.
 *
 * Split out of `funnel.ts` because that module is `server-only`: keeping the
 * logic here lets it be unit tested, and lets client components import the
 * step names without dragging Redis along.
 */

export const FUNNEL_STEPS = [
  'session',
  'product_view',
  'add_to_cart',
  'checkout_start',
] as const;

export type FunnelStep = (typeof FUNNEL_STEPS)[number];

export const FUNNEL_STEP_LABEL: Record<FunnelStep | 'purchase', string> = {
  session: 'Visits',
  product_view: 'Product views',
  add_to_cart: 'Added to cart',
  checkout_start: 'Checkout started',
  purchase: 'Orders placed',
};

/**
 * Steps that can be attributed to a specific product. `session` cannot — it
 * happens before the visitor has looked at anything.
 */
export const PRODUCT_FUNNEL_STEPS = [
  'product_view',
  'add_to_cart',
  'checkout_start',
] as const;

export type ProductFunnelStep = (typeof PRODUCT_FUNNEL_STEPS)[number];

export function isProductFunnelStep(step: string): step is ProductFunnelStep {
  return (PRODUCT_FUNNEL_STEPS as readonly string[]).includes(step);
}

export const TRAFFIC_SOURCES = [
  'instagram',
  'facebook',
  'google',
  'tiktok',
  'direct',
  'other',
] as const;

export type TrafficSource = (typeof TRAFFIC_SOURCES)[number];

export const TRAFFIC_SOURCE_LABEL: Record<TrafficSource, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  google: 'Google',
  tiktok: 'TikTok',
  direct: 'Direct',
  other: 'Other',
};

/**
 * Buckets a referrer/UTM pair into a fixed set of sources. Only the bucket
 * name is ever stored — the raw referrer is discarded.
 */
export function classifyTrafficSource(
  referrer: string,
  utmSource: string
): TrafficSource {
  let host = '';
  try {
    host = new URL(referrer).hostname.toLowerCase();
  } catch {
    // No or invalid referrer.
  }
  const utm = utmSource.trim().toLowerCase();
  const haystack = `${utm} ${host}`;

  if (haystack.includes('instagram') || utm === 'ig') return 'instagram';
  if (
    haystack.includes('facebook') ||
    /(^|\.)fb\.com$/.test(host) ||
    utm === 'fb'
  ) {
    return 'facebook';
  }
  if (haystack.includes('tiktok')) return 'tiktok';
  if (haystack.includes('google')) return 'google';

  // Internal navigation opening in a new tab still counts as direct.
  if (host.endsWith('801outlet.com')) return 'direct';
  if (!host && !utm) return 'direct';
  return 'other';
}

/** Shopify handles are lowercase, digits and dashes. Anything else is junk. */
const HANDLE_PATTERN = /^[a-z0-9][a-z0-9-]{0,79}$/;

/** One beacon never carries more handles than a cart plausibly holds. */
const MAX_HANDLES_PER_EVENT = 20;

/**
 * Keeps the counters honest: only well-formed handles are stored, so a
 * crafted beacon cannot fill Redis with arbitrary field names.
 */
export function sanitizeHandles(input: unknown): string[] {
  const list = Array.isArray(input) ? input : [input];
  const handles = new Set<string>();

  for (const entry of list) {
    if (typeof entry !== 'string') continue;
    const handle = entry.trim().toLowerCase();
    if (HANDLE_PATTERN.test(handle)) handles.add(handle);
    if (handles.size >= MAX_HANDLES_PER_EVENT) break;
  }

  return [...handles];
}

/** YYYY-MM-DD in the store's timezone, matching the sales dashboards. */
export function funnelDateKey(
  instant: Date = new Date(),
  timeZone = 'America/Denver'
): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(instant);
}
