'use server';

import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { env } from '../../../src/config/env';
import {
  createCheckoutLink,
  isSquareConfigured,
} from '../../../src/lib/square';
import {
  attachSquareCheckout,
  createPendingOrder,
} from '../../../src/lib/orders';
import { checkoutInputSchema } from '../../../src/lib/schemas';
import { getServerSession } from '../../../src/lib/supabase/server';

const cartLineSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().min(1),
});

const startCheckoutSchema = z.object({
  customer: checkoutInputSchema.shape.customer,
  shippingAddress: checkoutInputSchema.shape.shippingAddress,
  lines: z.array(cartLineSchema).min(1),
});

export type StartCheckoutInput = z.infer<typeof startCheckoutSchema>;

export type StartCheckoutResult =
  | { ok: true; redirectUrl: string; orderId: string; orderNumber: number }
  | { ok: false; reason: string; details?: string };

/**
 * Server action: validate cart against DB, create pending order, get Square Hosted Checkout URL.
 *
 * Without Square credentials this returns a clear error so the UI can show "Checkout not yet
 * configured" while the rest of the flow keeps working.
 */
export async function startCheckout(
  raw: unknown
): Promise<StartCheckoutResult> {
  const parsed = startCheckoutSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      reason: 'invalid_input',
      details: parsed.error.issues.map((i) => i.message).join('; '),
    };
  }
  const input = parsed.data;

  if (!isSquareConfigured()) {
    return {
      ok: false,
      reason: 'square_not_configured',
      details:
        'Set SQUARE_ACCESS_TOKEN, SQUARE_LOCATION_ID, and SQUARE_WEBHOOK_SIGNATURE_KEY in .env.local.',
    };
  }

  const sessionUser = await getServerSession();

  const orderResult = await createPendingOrder({
    customer: input.customer,
    shippingAddress: input.shippingAddress,
    lines: input.lines,
    authUserId: sessionUser?.id ?? null,
  });

  if (!orderResult.ok) return orderResult;

  const siteUrl = env.siteUrl.replace(/\/$/, '');
  const redirectUrl = `${siteUrl}/checkout/success?orderId=${orderResult.orderId}`;

  let checkout;
  try {
    checkout = await createCheckoutLink({
      idempotencyKey: randomUUID(),
      orderId: orderResult.orderId,
      redirectUrl,
      buyerEmail: input.customer.email,
      buyerPhone: input.customer.phone || undefined,
      lineItems: orderResult.lineItems.map((l) => ({
        name: l.productName,
        quantity: l.quantity,
        unitPriceCents: l.unitPriceCents,
        note: l.sku,
      })),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'unknown_error';
    return {
      ok: false,
      reason: 'square_create_failed',
      details: message,
    };
  }

  await attachSquareCheckout({
    orderId: orderResult.orderId,
    checkoutId: checkout.checkoutId,
    squareOrderId: checkout.squareOrderId,
  });

  return {
    ok: true,
    redirectUrl: checkout.url,
    orderId: orderResult.orderId,
    orderNumber: orderResult.orderNumber,
  };
}
