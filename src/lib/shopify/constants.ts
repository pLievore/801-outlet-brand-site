export const SHOPIFY_STOREFRONT_API_VERSION = '2026-07' as const;

export const SHOPIFY_DEFAULT_TIMEOUT_MS = 10_000;
export const SHOPIFY_DEFAULT_REVALIDATE_SECONDS = 300;

export const shopifyCacheTags = {
  all: 'shopify',
  shop: 'shopify:shop',
  menus: 'shopify:menus',
  products: 'shopify:products',
  collections: 'shopify:collections',
} as const;

export function shopifyMenuCacheTag(handle: string): string {
  return `${shopifyCacheTags.menus}:${handle}`;
}

export function shopifyProductCacheTag(handle: string): string {
  return `${shopifyCacheTags.products}:${handle}`;
}

export function shopifyCollectionCacheTag(handle: string): string {
  return `${shopifyCacheTags.collections}:${handle}`;
}
