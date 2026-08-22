import 'server-only';

import type {
  CatalogAvailability,
  CatalogSort,
} from '../catalog/filters';
import { buildProductQuery } from '../catalog/filters';
import { sortAvailableFirst } from '../catalog/ordering';
import type { CatalogProductCard } from '../catalog/types';
import { adaptProductCard, type SearchProduct } from './adapters/products';
import { getProducts, searchProducts } from './queries/products';

type CatalogPageInfo = {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  /** 1-based page the caller is on. */
  page: number;
  totalPages: number;
};

/**
 * How many products are fetched before paging in memory. The catalogue is far
 * smaller than this, and ordering has to be global: sorting only the current
 * page would still leave sold-out pieces ahead of available ones on the next.
 */
const MAX_CATALOG_FETCH = 250;

/** Slices the ordered catalogue into the requested page. */
function paginate(
  products: CatalogProductCard[],
  requestedPage: number,
  pageSize: number
): { products: CatalogProductCard[]; pageInfo: CatalogPageInfo } {
  const totalPages = Math.max(1, Math.ceil(products.length / pageSize));
  const page = Math.min(Math.max(requestedPage, 1), totalPages);
  const start = (page - 1) * pageSize;

  return {
    products: products.slice(start, start + pageSize),
    pageInfo: {
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      page,
      totalPages,
    },
  };
}

export type ShopifyCatalogPage = {
  products: CatalogProductCard[];
  totalCount: number | null;
  pageInfo: CatalogPageInfo;
};

export type ShopifyCatalogInput = {
  search: string;
  availability: CatalogAvailability;
  sort: CatalogSort;
  minPrice?: number;
  maxPrice?: number;
  /** 1-based. */
  page?: number;
  pageSize?: number;
};

function productSort(sort: CatalogSort) {
  switch (sort) {
    case 'newest':
      return { sortKey: 'CREATED_AT' as const, reverse: true };
    case 'price_asc':
      return { sortKey: 'PRICE' as const, reverse: false };
    case 'price_desc':
      return { sortKey: 'PRICE' as const, reverse: true };
    case 'featured':
    default:
      return { sortKey: 'BEST_SELLING' as const, reverse: false };
  }
}

function searchSort(sort: CatalogSort) {
  switch (sort) {
    case 'price_asc':
      return { sortKey: 'PRICE' as const, reverse: false };
    case 'price_desc':
      return { sortKey: 'PRICE' as const, reverse: true };
    default:
      return { sortKey: 'RELEVANCE' as const, reverse: false };
  }
}

function searchFilters(input: ShopifyCatalogInput) {
  const filters: Array<{
    available?: boolean;
    price?: { min?: number; max?: number };
  }> = [];

  if (input.availability === 'available') {
    filters.push({ available: true });
  }
  if (input.minPrice !== undefined || input.maxPrice !== undefined) {
    filters.push({
      price: { min: input.minPrice, max: input.maxPrice },
    });
  }

  return filters.length > 0 ? filters : undefined;
}

export async function getShopifyCatalogPage(
  input: ShopifyCatalogInput
): Promise<ShopifyCatalogPage> {
  const pageSize = Math.max(1, Math.min(input.pageSize ?? 12, 48));
  const requestedPage = Math.max(1, Math.floor(input.page ?? 1));

  if (input.search) {
    const result = await searchProducts({
      query: input.search,
      first: MAX_CATALOG_FETCH,
      ...searchSort(input.sort),
      productFilters: searchFilters(input),
    });
    const matches = result.nodes.filter(
      (node): node is SearchProduct => node.__typename === 'Product'
    );
    const ordered = sortAvailableFirst(matches.map(adaptProductCard));
    const paged = paginate(ordered, requestedPage, pageSize);

    return {
      products: paged.products,
      totalCount: result.totalCount ?? ordered.length,
      pageInfo: paged.pageInfo,
    };
  }

  const result = await getProducts({
    first: MAX_CATALOG_FETCH,
    ...productSort(input.sort),
    query: buildProductQuery(input),
  });
  const ordered = sortAvailableFirst(result.nodes.map(adaptProductCard));
  const paged = paginate(ordered, requestedPage, pageSize);

  return {
    products: paged.products,
    totalCount: ordered.length,
    pageInfo: paged.pageInfo,
  };
}
