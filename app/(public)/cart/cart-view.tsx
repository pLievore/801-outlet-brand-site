'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';

import { formatMoney } from '../../../src/lib/format';
import { CartLineItem } from '../../components/cart/cart-line-item';
import { useCart } from '../../components/cart/cart-provider';
import { trackFunnelStep } from '../../components/track-event';
import { buttonStyles } from '../../components/ui/button';
import { Container } from '../../components/ui/container';

export function CartView() {
  const { cart, errors, pending } = useCart();
  const lines = cart?.lines ?? [];

  return (
    <main>
      <Container className="py-10 md:py-14">
        <h1 className="font-display text-4xl tracking-tight md:text-5xl">
          Your <span className="italic">cart</span>
        </h1>

        {errors.length > 0 ? (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-[rgb(var(--accent))]/40 bg-[rgb(var(--accent-soft))] p-4 text-sm leading-6"
          >
            {errors.map((message) => (
              <p key={message}>{message}</p>
            ))}
          </div>
        ) : null}

        {lines.length === 0 ? (
          <div className="mt-10 flex flex-col items-center gap-5 rounded-3xl border border-[rgb(var(--border))] bg-white px-6 py-16 text-center">
            <ShoppingBag
              aria-hidden="true"
              className="size-10 text-[rgb(var(--muted))]"
            />
            <div>
              <p className="text-base font-semibold">
                {pending ? 'Loading your cart…' : 'Your cart is empty.'}
              </p>
              {!pending ? (
                <p className="mt-1 text-sm text-[rgb(var(--muted))]">
                  New deals land every week — take a look.
                </p>
              ) : null}
            </div>
            {!pending ? (
              <Link
                href="/products"
                className={buttonStyles({ variant: 'primary', size: 'lg' })}
              >
                Browse products
              </Link>
            ) : null}
          </div>
        ) : (
          <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1.6fr_1fr]">
            <ul className="divide-y divide-[rgb(var(--border))] rounded-3xl border border-[rgb(var(--border))] bg-white px-5">
              {lines.map((line) => (
                <li key={line.id}>
                  <CartLineItem line={line} />
                </li>
              ))}
            </ul>

            {cart ? (
              <aside className="rounded-3xl border border-[rgb(var(--border))] bg-white p-6 lg:sticky lg:top-28">
                <h2 className="text-sm font-bold">Order summary</h2>
                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-[rgb(var(--muted))]">Subtotal</dt>
                    <dd className="font-semibold tabular-nums-tight">
                      {formatMoney(cart.subtotal)}
                    </dd>
                  </div>
                  {cart.discountCodes
                    .filter((discount) => discount.applicable)
                    .map((discount) => (
                      <div key={discount.code} className="flex justify-between">
                        <dt className="text-[rgb(var(--muted))]">
                          Discount ({discount.code})
                        </dt>
                        <dd className="font-semibold text-[rgb(var(--sage-ink))]">
                          Applied
                        </dd>
                      </div>
                    ))}
                  <div className="flex justify-between border-t border-[rgb(var(--border))] pt-2">
                    <dt className="font-semibold">Total</dt>
                    <dd className="font-semibold tabular-nums-tight">
                      {formatMoney(cart.total)}
                    </dd>
                  </div>
                </dl>
                <p className="mt-3 text-xs leading-relaxed text-[rgb(var(--muted))]">
                  Taxes, delivery and pickup options are confirmed at the secure
                  Shopify checkout.
                </p>
                <a
                  href={cart.checkoutUrl}
                  onClick={() =>
                      trackFunnelStep('checkout_start', {
                        handles: cart.lines.map(
                          (line) => line.merchandise.productHandle
                        ),
                      })
                    }
                  className={buttonStyles({
                    variant: 'primary',
                    size: 'lg',
                    className: `mt-5 w-full ${pending ? 'pointer-events-none opacity-60' : ''}`,
                  })}
                >
                  Check out
                </a>
                <Link
                  href="/products"
                  className={buttonStyles({
                    variant: 'ghost',
                    size: 'md',
                    className: 'mt-2 w-full',
                  })}
                >
                  Continue shopping
                </Link>
              </aside>
            ) : null}
          </div>
        )}
      </Container>
    </main>
  );
}
