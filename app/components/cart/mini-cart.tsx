'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';

import { formatMoney } from '../../../src/lib/format';
import { Button, buttonStyles } from '../ui/button';
import { Drawer } from '../ui/dialog';
import { CartLineItem } from './cart-line-item';
import { useCart } from './cart-provider';

export function CartButton() {
  const { cart, openCart } = useCart();
  const quantity = cart?.totalQuantity ?? 0;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={openCart}
      className="relative shrink-0"
      aria-label={
        quantity > 0 ? `Open cart, ${quantity} items` : 'Open cart, empty'
      }
    >
      <ShoppingBag aria-hidden="true" className="size-5" />
      {quantity > 0 ? (
        <span
          aria-hidden="true"
          className="absolute -right-0.5 -top-0.5 flex min-w-5 items-center justify-center rounded-full bg-[rgb(var(--accent))] px-1 py-0.5 text-[10px] font-bold leading-none text-white"
        >
          {quantity > 99 ? '99+' : quantity}
        </span>
      ) : null}
    </Button>
  );
}

export function MiniCart() {
  const { cart, errors, pending, isOpen, closeCart } = useCart();
  const triggerRef = useRef<HTMLElement>(null);
  const lines = cart?.lines ?? [];

  return (
    <Drawer
      open={isOpen}
      onClose={closeCart}
      triggerRef={triggerRef}
      title="Your cart"
      description={
        cart && cart.totalQuantity > 0
          ? `${cart.totalQuantity} ${cart.totalQuantity === 1 ? 'item' : 'items'}`
          : 'Your cart is empty'
      }
    >
      <div className="flex min-h-full flex-col p-5">
        {errors.length > 0 ? (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-[rgb(var(--accent))]/40 bg-[rgb(var(--accent-soft))] p-3 text-xs leading-5 text-[rgb(var(--fg))]"
          >
            {errors.map((message) => (
              <p key={message}>{message}</p>
            ))}
          </div>
        ) : null}

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-12 text-center">
            <ShoppingBag
              aria-hidden="true"
              className="size-10 text-[rgb(var(--muted))]"
            />
            <p className="text-sm text-[rgb(var(--muted))]">
              Your cart is empty.
            </p>
            <Link
              href="/products"
              onClick={closeCart}
              className={buttonStyles({ variant: 'primary', size: 'md' })}
            >
              Browse products
            </Link>
          </div>
        ) : (
          <>
            <ul className="divide-y divide-[rgb(var(--border))]">
              {lines.map((line) => (
                <li key={line.id}>
                  <CartLineItem line={line} onNavigate={closeCart} />
                </li>
              ))}
            </ul>

            <div className="mt-auto border-t border-[rgb(var(--border))] pt-4">
              {cart ? (
                <>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-[rgb(var(--muted))]">Subtotal</dt>
                      <dd className="font-semibold tabular-nums-tight">
                        {formatMoney(cart.subtotal)}
                      </dd>
                    </div>
                  </dl>
                  <p className="mt-2 text-xs leading-relaxed text-[rgb(var(--muted))]">
                    Taxes and delivery are calculated at checkout.
                  </p>
                  <a
                    href={cart.checkoutUrl}
                    className={buttonStyles({
                      variant: 'primary',
                      size: 'lg',
                      className: `mt-4 w-full ${pending ? 'pointer-events-none opacity-60' : ''}`,
                    })}
                  >
                    Check out
                  </a>
                  <Link
                    href="/cart"
                    onClick={closeCart}
                    className={buttonStyles({
                      variant: 'ghost',
                      size: 'md',
                      className: 'mt-2 w-full',
                    })}
                  >
                    View full cart
                  </Link>
                </>
              ) : null}
            </div>
          </>
        )}
      </div>
    </Drawer>
  );
}
