import type { CartQuery } from '../types/storefront.generated';
import type { CartLineView, CartView } from '../../catalog/cart-view';

type ShopifyCart = NonNullable<CartQuery['cart']>;
type ShopifyCartLine = ShopifyCart['lines']['nodes'][number];

function adaptCartLine(line: ShopifyCartLine): CartLineView | null {
  const merchandise = line.merchandise;
  // The fragment only selects ProductVariant; guard for safety.
  if (!('id' in merchandise)) return null;

  return {
    id: line.id,
    quantity: line.quantity,
    lineTotal: {
      amount: line.cost.totalAmount.amount,
      currencyCode: line.cost.totalAmount.currencyCode,
    },
    merchandise: {
      variantId: merchandise.id,
      variantTitle: merchandise.title,
      availableForSale: merchandise.availableForSale,
      quantityAvailable: merchandise.quantityAvailable ?? null,
      price: {
        amount: merchandise.price.amount,
        currencyCode: merchandise.price.currencyCode,
      },
      compareAtPrice: merchandise.compareAtPrice
        ? {
            amount: merchandise.compareAtPrice.amount,
            currencyCode: merchandise.compareAtPrice.currencyCode,
          }
        : null,
      selectedOptions: merchandise.selectedOptions.map((option) => ({
        name: option.name,
        value: option.value,
      })),
      image: merchandise.image
        ? {
            url: merchandise.image.url,
            alt: merchandise.image.altText ?? null,
            width: merchandise.image.width ?? null,
            height: merchandise.image.height ?? null,
          }
        : null,
      productHandle: merchandise.product.handle,
      productTitle: merchandise.product.title,
    },
  };
}

export function adaptCart(cart: ShopifyCart): CartView {
  return {
    id: cart.id,
    checkoutUrl: cart.checkoutUrl,
    totalQuantity: cart.totalQuantity,
    subtotal: {
      amount: cart.cost.subtotalAmount.amount,
      currencyCode: cart.cost.subtotalAmount.currencyCode,
    },
    total: {
      amount: cart.cost.totalAmount.amount,
      currencyCode: cart.cost.totalAmount.currencyCode,
    },
    totalTax: cart.cost.totalTaxAmount
      ? {
          amount: cart.cost.totalTaxAmount.amount,
          currencyCode: cart.cost.totalTaxAmount.currencyCode,
        }
      : null,
    discountCodes: cart.discountCodes.map((discount) => ({
      code: discount.code,
      applicable: discount.applicable,
    })),
    lines: cart.lines.nodes
      .map(adaptCartLine)
      .filter((line): line is CartLineView => line !== null),
  };
}
