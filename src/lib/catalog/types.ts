import type { ProductAttributeKey } from './attributes';

export type ProductAttributeValues = Partial<Record<ProductAttributeKey, string>>;

export type CatalogMoney = {
  amount: string;
  currencyCode: string;
};

export type CatalogImage = {
  url: string;
  alt: string | null;
  width: number | null;
  height: number | null;
};

export type CatalogProductCard = {
  id: string;
  handle: string;
  title: string;
  description: string | null;
  availableForSale: boolean;
  /** Drives the Coming soon / Sold out label; see `catalog/availability`. */
  tags: string[];
  price: CatalogMoney;
  compareAtPrice: CatalogMoney | null;
  images: CatalogImage[];
};

export type CatalogSelectedOption = {
  name: string;
  value: string;
};

export type CatalogProductVariant = {
  id: string;
  title: string;
  sku: string | null;
  availableForSale: boolean;
  currentlyNotInStock: boolean;
  quantityAvailable: number | null;
  price: CatalogMoney;
  compareAtPrice: CatalogMoney | null;
  selectedOptions: CatalogSelectedOption[];
  image: CatalogImage | null;
};

export type CatalogProductOption = {
  id: string;
  name: string;
  values: string[];
};

export type CatalogProductDetail = CatalogProductCard & {
  vendor: string;
  productType: string;
  tags: string[];
  /** Hand-maintained attributes from Shopify metafields. */
  attributes: ProductAttributeValues;
  seo: {
    title: string | null;
    description: string | null;
  };
  options: CatalogProductOption[];
  variants: CatalogProductVariant[];
};
