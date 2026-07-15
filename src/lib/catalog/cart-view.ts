import type { CatalogImage, CatalogMoney, CatalogSelectedOption } from './types';

/** Client-safe presentation of a Shopify cart. */
export type CartLineView = {
  id: string;
  quantity: number;
  lineTotal: CatalogMoney;
  merchandise: {
    variantId: string;
    variantTitle: string;
    availableForSale: boolean;
    quantityAvailable: number | null;
    price: CatalogMoney;
    compareAtPrice: CatalogMoney | null;
    selectedOptions: CatalogSelectedOption[];
    image: CatalogImage | null;
    productHandle: string;
    productTitle: string;
  };
};

export type CartView = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  subtotal: CatalogMoney;
  total: CatalogMoney;
  totalTax: CatalogMoney | null;
  discountCodes: Array<{ code: string; applicable: boolean }>;
  lines: CartLineView[];
};

export type CartActionResult = {
  cart: CartView | null;
  /** Buyer-facing messages from Shopify user errors, if any. */
  errors?: string[];
};
