export type CartItem = {
  variantId: string;
  productSlug: string;
  productName: string;
  variantName: string;
  sku: string;
  unitPriceCents: number;
  quantity: number;
  imageUrl: string | null;
};

export type AddToCartResult =
  | { ok: true }
  | { ok: false; reason: string };
