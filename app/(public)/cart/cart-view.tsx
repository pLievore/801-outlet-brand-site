'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  selectSubtotalCents,
  useCartStore,
  useHydratedItemCount,
} from '../../../src/lib/cart/store';
import { formatUsdCents } from '../../../src/lib/format';

export function CartView() {
  const items = useCartStore((s) => s.items);
  const hydrated = useCartStore((s) => s.hydrated);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clear = useCartStore((s) => s.clear);
  const subtotalCents = useCartStore(selectSubtotalCents);
  const count = useHydratedItemCount();

  if (!hydrated) {
    return (
      <main className="mx-auto max-w-6xl px-5 py-14">
        <h1 className="font-display text-4xl font-medium tracking-tight md:text-5xl">Your cart</h1>
        <div className="mt-8 h-32 animate-pulse rounded-2xl bg-neutral-100" />
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="relative mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-5 py-20 text-center">
        <div className="text-xs font-semibold uppercase tracking-[0.32em] text-[rgb(var(--muted))]">
          801 Outlet · Cart
        </div>
        <h1 className="mt-5 font-display text-5xl font-medium leading-[0.95] tracking-tight md:text-7xl">
          Nothing in here
          <br />
          <span className="italic text-[rgb(var(--accent))]">just yet.</span>
        </h1>
        <p className="mt-6 max-w-md text-sm leading-relaxed text-[rgb(var(--muted))]">
          Slow living starts with the right pieces. Take a look — we&apos;ll keep your
          favorites here.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-full bg-[rgb(var(--fg))] px-7 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-[1px] hover:shadow-md active:translate-y-0"
          >
            Browse the catalog
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-[rgb(var(--border))] bg-white px-7 py-3.5 text-sm font-semibold text-[rgb(var(--fg))] transition hover:-translate-y-[1px] hover:bg-neutral-50 hover:shadow-sm active:translate-y-0"
          >
            Back to home
          </Link>
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 mx-auto h-72 max-w-md -translate-y-1/2 rounded-full bg-[rgb(var(--accent))]/10 blur-3xl" />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-14">
      <div className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--muted))]">
        801 OUTLET • CART
      </div>
      <h1 className="mt-3 font-display text-4xl font-medium tracking-tight md:text-5xl">
        Your cart
      </h1>
      <p className="mt-3 text-sm text-[rgb(var(--muted))]">
        {count} item{count === 1 ? '' : 's'} • Stock and delivery confirmed at checkout.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Items */}
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.variantId}
              className="flex gap-4 rounded-2xl border border-[rgb(var(--border))] bg-white p-4"
            >
              <Link
                href={`/products/${item.productSlug}`}
                className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-xl bg-neutral-100 sm:w-28"
              >
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.productName}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                ) : null}
              </Link>

              <div className="flex flex-1 flex-col justify-between gap-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/products/${item.productSlug}`}
                      className="text-sm font-semibold hover:text-[rgb(var(--accent))]"
                    >
                      {item.productName}
                    </Link>
                    <div className="mt-0.5 text-xs text-[rgb(var(--muted))]">
                      SKU: {item.sku}
                    </div>
                  </div>

                  <div className="text-right text-sm font-semibold tabular-nums">
                    {formatUsdCents(item.unitPriceCents * item.quantity)}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center rounded-full border border-[rgb(var(--border))] bg-white">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.variantId, item.quantity - 1)
                      }
                      className="px-3 py-1.5 text-sm font-semibold disabled:opacity-30"
                      aria-label="Decrease quantity"
                    >
                      âˆ’
                    </button>
                    <span className="w-8 text-center text-sm font-semibold tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.variantId, item.quantity + 1)
                      }
                      className="px-3 py-1.5 text-sm font-semibold"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.variantId)}
                    className="text-xs font-semibold text-[rgb(var(--muted))] underline-offset-2 hover:text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={clear}
            className="text-xs font-semibold text-[rgb(var(--muted))] underline-offset-2 hover:text-red-600 hover:underline"
          >
            Clear cart
          </button>
        </div>

        {/* Summary */}
        <aside className="h-fit rounded-2xl border border-[rgb(var(--border))] bg-white p-6">
          <h2 className="text-sm font-semibold">Order summary</h2>

          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-[rgb(var(--muted))]">Subtotal</dt>
              <dd className="font-semibold tabular-nums">
                {formatUsdCents(subtotalCents)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[rgb(var(--muted))]">Shipping</dt>
              <dd className="text-[rgb(var(--muted))]">Calculated at checkout</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[rgb(var(--muted))]">Tax</dt>
              <dd className="text-[rgb(var(--muted))]">Calculated at checkout</dd>
            </div>
          </dl>

          <div className="mt-4 flex items-end justify-between border-t border-[rgb(var(--border))] pt-4">
            <span className="text-sm font-semibold">Estimated total</span>
            <span className="text-lg font-semibold tabular-nums">
              {formatUsdCents(subtotalCents)}
            </span>
          </div>

          <Link
            href="/checkout"
            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[rgb(var(--fg))] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-[1px] hover:shadow-sm"
          >
            Proceed to Checkout
          </Link>

          <Link
            href="/products"
            className="mt-3 inline-flex w-full items-center justify-center text-xs font-semibold text-[rgb(var(--accent))] transition hover:opacity-80"
          >
            Continue shopping →
          </Link>

          <p className="mt-4 text-xs text-[rgb(var(--muted))]">
            Utah-only delivery. We&apos;ll confirm a delivery window after purchase.
          </p>
        </aside>
      </div>
    </main>
  );
}
