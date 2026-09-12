'use server';

import { cookies, headers } from 'next/headers';

import {
  toCartAttributes,
  type Attribution,
} from '../../src/lib/analytics/attribution';
import type { CartActionResult } from '../../src/lib/catalog/cart-view';
import { adaptCart } from '../../src/lib/shopify/adapters/cart';
import {
  addCartLines,
  CartUserErrorsError,
  createCart,
  fetchCart,
  removeCartLines,
  updateCartBuyerIdentity,
  updateCartDiscountCodes,
  updateCartLines,
} from '../../src/lib/shopify/queries/cart';
import { getCustomerAccessToken } from '../../src/lib/shopify/customer/session';

const CART_COOKIE = 'shopify_cart_id';
const CART_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const VARIANT_GID_PATTERN = /^gid:\/\/shopify\/ProductVariant\/\d+$/;
const LINE_GID_PATTERN = /^gid:\/\/shopify\/CartLine\/[\w-]+(\?cart=[\w-]+)?$/;
const CART_GID_PATTERN = /^gid:\/\/shopify\/Cart\/[\w-]+(\?key=[\w-]+)?$/;

const GENERIC_ERROR =
  'We could not update your cart right now. Please try again.';

async function getBuyerIp(): Promise<string | undefined> {
  const headerList = await headers();
  const forwarded = headerList.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || undefined;
}

async function readCartId(): Promise<string | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(CART_COOKIE)?.value;
  return value && CART_GID_PATTERN.test(value) ? value : null;
}

async function persistCartId(cartId: string) {
  const cookieStore = await cookies();
  cookieStore.set(CART_COOKIE, cartId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: CART_COOKIE_MAX_AGE_SECONDS,
  });
}

const PENDING_DISCOUNT_COOKIE = 'shopify_pending_discount';

async function readPendingDiscount(): Promise<string | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(PENDING_DISCOUNT_COOKIE)?.value?.trim();
  return value ? value.toUpperCase() : null;
}

async function persistPendingDiscount(code: string) {
  const cookieStore = await cookies();
  cookieStore.set(PENDING_DISCOUNT_COOKIE, code.trim().toUpperCase(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

async function clearPendingDiscount() {
  const cookieStore = await cookies();
  cookieStore.delete(PENDING_DISCOUNT_COOKIE);
}

function clampQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) return 1;
  return Math.min(99, Math.max(1, Math.trunc(quantity)));
}

function toResult(
  cart: Awaited<ReturnType<typeof fetchCart>>
): CartActionResult {
  return { cart: cart ? adaptCart(cart) : null };
}

function toErrorResult(error: unknown): CartActionResult {
  if (error instanceof CartUserErrorsError) {
    const messages = error.userErrors
      .map((userError) => userError.message)
      .filter(Boolean);
    return { cart: null, errors: messages.length > 0 ? messages : [GENERIC_ERROR] };
  }

  // Storefront client errors were already logged with safe details.
  return { cart: null, errors: [GENERIC_ERROR] };
}

export async function getCartAction(): Promise<CartActionResult> {
  const cartId = await readCartId();
  if (!cartId) return { cart: null };

  try {
    return toResult(await fetchCart(cartId, await getBuyerIp()));
  } catch (error) {
    return toErrorResult(error);
  }
}

export async function addCartLineAction(
  variantId: string,
  quantity: number,
  /** Campaign the visit arrived on; recorded only when the cart is created. */
  attribution?: Attribution | null
): Promise<CartActionResult> {
  if (!VARIANT_GID_PATTERN.test(variantId)) {
    return { cart: null, errors: [GENERIC_ERROR] };
  }

  const line = { merchandiseId: variantId, quantity: clampQuantity(quantity) };
  const buyerIp = await getBuyerIp();

  try {
    const cartId = await readCartId();
    const existingCart = cartId ? await fetchCart(cartId, buyerIp) : null;

    let cart = existingCart
      ? await addCartLines(existingCart.id, [line], buyerIp)
      : await createCart([line], buyerIp, toCartAttributes(attribution ?? null));

    if (cart && cart.id !== cartId) {
      await persistCartId(cart.id);

      // Fresh cart: attach the signed-in customer so checkout is prefilled.
      const customerToken = await getCustomerAccessToken().catch(() => null);
      if (customerToken) {
        try {
          cart = (await updateCartBuyerIdentity(cart.id, customerToken)) ?? cart;
        } catch {
          // Buyer identity is best-effort; the cart itself is intact.
        }
      }
    }

    if (cart) {
      const pendingDiscount = await readPendingDiscount();
      if (pendingDiscount) {
        try {
          const withDiscount = await updateCartDiscountCodes(
            cart.id,
            [pendingDiscount],
            buyerIp
          );
          if (withDiscount) {
            cart = withDiscount;
            await clearPendingDiscount();
          }
        } catch {
          // Pending discount application is best-effort.
        }
      }
    }

    return toResult(cart);
  } catch (error) {
    return toErrorResult(error);
  }
}

export async function updateCartLineAction(
  lineId: string,
  quantity: number
): Promise<CartActionResult> {
  const cartId = await readCartId();
  if (!cartId || !LINE_GID_PATTERN.test(lineId)) {
    return { cart: null, errors: [GENERIC_ERROR] };
  }

  const buyerIp = await getBuyerIp();

  try {
    const normalized = clampQuantity(quantity);
    const cart =
      quantity <= 0
        ? await removeCartLines(cartId, [lineId], buyerIp)
        : await updateCartLines(
            cartId,
            [{ id: lineId, quantity: normalized }],
            buyerIp
          );

    return toResult(cart);
  } catch (error) {
    return toErrorResult(error);
  }
}

export async function removeCartLineAction(
  lineId: string
): Promise<CartActionResult> {
  const cartId = await readCartId();
  if (!cartId || !LINE_GID_PATTERN.test(lineId)) {
    return { cart: null, errors: [GENERIC_ERROR] };
  }

  try {
    return toResult(
      await removeCartLines(cartId, [lineId], await getBuyerIp())
    );
  } catch (error) {
    return toErrorResult(error);
  }
}

export async function applyCartDiscountAction(
  code: string
): Promise<CartActionResult> {
  const cleanCode = code.trim().toUpperCase();
  if (!cleanCode) {
    return { cart: null, errors: ['Please enter a coupon code.'] };
  }

  const cartId = await readCartId();
  if (!cartId) {
    // No cart created yet: persist pending discount so it automatically attaches when any item is added!
    await persistPendingDiscount(cleanCode);
    return { cart: null, errors: [] };
  }

  try {
    const buyerIp = await getBuyerIp();
    const rawCart = await updateCartDiscountCodes(cartId, [cleanCode], buyerIp);
    if (!rawCart) {
      return { cart: null, errors: [GENERIC_ERROR] };
    }

    const adapted = adaptCart(rawCart);
    const match = adapted.discountCodes.find(
      (dc) => dc.code.toUpperCase() === cleanCode
    );

    if (match && !match.applicable) {
      // Revert so invalid code doesn't stick
      await updateCartDiscountCodes(cartId, [], buyerIp);
      return {
        cart: adapted,
        errors: [`Coupon "${cleanCode}" is invalid, expired, or usage limit reached.`],
      };
    }

    await clearPendingDiscount();
    return { cart: adapted };
  } catch (error) {
    return toErrorResult(error);
  }
}

export async function removeCartDiscountAction(): Promise<CartActionResult> {
  await clearPendingDiscount();
  const cartId = await readCartId();
  if (!cartId) {
    return { cart: null, errors: [GENERIC_ERROR] };
  }

  try {
    const rawCart = await updateCartDiscountCodes(cartId, [], await getBuyerIp());
    return toResult(rawCart);
  } catch (error) {
    return toErrorResult(error);
  }
}

