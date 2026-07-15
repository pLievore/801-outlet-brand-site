import type { CatalogImage, CatalogMoney } from './types';

/** Payload returned by /api/search/predictive. Safe for the client: catalog data only. */
export type SearchSuggestions = {
  queries: string[];
  collections: Array<{ handle: string; title: string }>;
  products: Array<{
    handle: string;
    title: string;
    availableForSale: boolean;
    price: CatalogMoney;
    compareAtPrice: CatalogMoney | null;
    image: CatalogImage | null;
  }>;
};

export const EMPTY_SUGGESTIONS: SearchSuggestions = {
  queries: [],
  collections: [],
  products: [],
};

/** Minimum characters before predictive search fires. */
export const SUGGESTION_MIN_CHARS = 2;
