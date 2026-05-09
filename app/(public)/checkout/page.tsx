'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import Image from 'next/image';
import {
  useCartStore,
  selectSubtotalCents,
} from '../../../src/lib/cart/store';
import { formatUsdCents } from '../../../src/lib/format';
import { checkoutInputSchema } from '../../../src/lib/schemas';

// Use the raw input shape (before refinements) so React Hook Form types align
type CheckoutInput = {
  customer: { fullName: string; email: string; phone?: string };
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country?: string;
  };
};
import { startCheckout } from './actions';

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const hydrated = useCartStore((s) => s.hydrated);
  const clear = useCartStore((s) => s.clear);
  const subtotalCents = useCartStore(selectSubtotalCents);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(checkoutInputSchema) as any,
    defaultValues: {
      shippingAddress: { country: 'US', state: 'UT' },
    },
  });

  // Redirect to cart if empty after hydration
  useEffect(() => {
    if (hydrated && items.length === 0) {
      router.replace('/cart');
    }
  }, [hydrated, items.length, router]);

  if (!hydrated) {
    return (
      <main className="mx-auto max-w-5xl px-5 py-14">
        <div className="h-64 animate-pulse rounded-2xl bg-neutral-100" />
      </main>
    );
  }

  if (items.length === 0) return null;

  async function onSubmit(data: CheckoutInput) {
    setServerError(null);
    const lines = items.map((i) => ({
      variantId: i.variantId,
      quantity: i.quantity,
    }));

    const result = await startCheckout({ ...data, lines });

    if (!result.ok) {
      if (result.reason === 'square_not_configured') {
        setServerError(
          'Online checkout is not yet configured. Please call us to place your order.'
        );
      } else if (result.reason === 'insufficient_stock') {
        setServerError(result.details ?? 'Some items are out of stock.');
      } else {
        setServerError(result.details ?? 'Something went wrong. Please try again.');
      }
      return;
    }

    clear();
    router.push(result.redirectUrl);
  }

  const inputCls =
    'w-full rounded-xl border border-[rgb(var(--border))] bg-white px-4 py-3 text-sm ' +
    'placeholder:text-[rgb(var(--muted))] focus:border-[rgb(var(--accent))] focus:outline-none ' +
    'focus:ring-1 focus:ring-[rgb(var(--accent))]';
  const labelCls = 'mb-1 block text-xs font-semibold text-[rgb(var(--muted))] uppercase tracking-wide';
  const errorCls = 'mt-1 text-xs text-red-600';

  return (
    <main className="mx-auto max-w-5xl px-5 py-14">
      <div className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--muted))]">
        801 OUTLET • CHECKOUT
      </div>
      <h1 className="mt-3 font-display text-4xl font-medium tracking-tight md:text-5xl">Checkout</h1>

      <form
        onSubmit={handleSubmit(onSubmit as Parameters<typeof handleSubmit>[0])}
        className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]"
        noValidate
      >
        {/* â”€â”€ Left column: contact + address â”€â”€ */}
        <div className="space-y-8">
          {/* Contact */}
          <section className="rounded-2xl border border-[rgb(var(--border))] bg-white p-6">
            <h2 className="mb-5 text-base font-semibold">Contact information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="fullName" className={labelCls}>
                  Full name
                </label>
                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  className={inputCls}
                  placeholder="Jane Smith"
                  {...register('customer.fullName')}
                />
                {errors.customer?.fullName && (
                  <p className={errorCls}>{errors.customer.fullName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className={labelCls}>
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={inputCls}
                  placeholder="jane@example.com"
                  {...register('customer.email')}
                />
                {errors.customer?.email && (
                  <p className={errorCls}>{errors.customer.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className={labelCls}>
                  Phone <span className="font-normal normal-case text-[rgb(var(--muted))]">(optional)</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  className={inputCls}
                  placeholder="(801) 555-0100"
                  {...register('customer.phone')}
                />
              </div>
            </div>
          </section>

          {/* Shipping address */}
          <section className="rounded-2xl border border-[rgb(var(--border))] bg-white p-6">
            <h2 className="mb-5 text-base font-semibold">Shipping address</h2>
            <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-800">
              We currently deliver to <strong>Utah (UT) only</strong>.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="line1" className={labelCls}>
                  Address line 1
                </label>
                <input
                  id="line1"
                  type="text"
                  autoComplete="address-line1"
                  className={inputCls}
                  placeholder="123 Main St"
                  {...register('shippingAddress.line1')}
                />
                {errors.shippingAddress?.line1 && (
                  <p className={errorCls}>{errors.shippingAddress.line1.message}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="line2" className={labelCls}>
                  Address line 2 <span className="font-normal normal-case text-[rgb(var(--muted))]">(optional)</span>
                </label>
                <input
                  id="line2"
                  type="text"
                  autoComplete="address-line2"
                  className={inputCls}
                  placeholder="Apt 4B"
                  {...register('shippingAddress.line2')}
                />
              </div>

              <div>
                <label htmlFor="city" className={labelCls}>
                  City
                </label>
                <input
                  id="city"
                  type="text"
                  autoComplete="address-level2"
                  className={inputCls}
                  placeholder="Salt Lake City"
                  {...register('shippingAddress.city')}
                />
                {errors.shippingAddress?.city && (
                  <p className={errorCls}>{errors.shippingAddress.city.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="state" className={labelCls}>
                  State
                </label>
                <input
                  id="state"
                  type="text"
                  autoComplete="address-level1"
                  className={inputCls}
                  value="UT"
                  readOnly
                  {...register('shippingAddress.state')}
                />
                {errors.shippingAddress?.state && (
                  <p className={errorCls}>{errors.shippingAddress.state.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="postalCode" className={labelCls}>
                  ZIP code
                </label>
                <input
                  id="postalCode"
                  type="text"
                  autoComplete="postal-code"
                  className={inputCls}
                  placeholder="84101"
                  {...register('shippingAddress.postalCode')}
                />
                {errors.shippingAddress?.postalCode && (
                  <p className={errorCls}>{errors.shippingAddress.postalCode.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="country" className={labelCls}>
                  Country
                </label>
                <input
                  id="country"
                  type="text"
                  className={inputCls}
                  value="United States"
                  readOnly
                />
              </div>
            </div>
          </section>

          {serverError && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {serverError}
            </div>
          )}
        </div>

        {/* â”€â”€ Right column: order summary + CTA â”€â”€ */}
        <div className="lg:sticky lg:top-24">
          <div className="rounded-2xl border border-[rgb(var(--border))] bg-white p-6">
            <h2 className="mb-5 text-base font-semibold">Order summary</h2>

            <ul className="divide-y divide-[rgb(var(--border))]">
              {items.map((item) => (
                <li key={item.variantId} className="flex items-center gap-3 py-3">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.productName}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{item.productName}</div>
                    <div className="text-xs text-[rgb(var(--muted))]">
                      {item.variantName} Ã— {item.quantity}
                    </div>
                  </div>
                  <div className="text-sm font-semibold">
                    {formatUsdCents(item.unitPriceCents * item.quantity)}
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-5 space-y-2 border-t border-[rgb(var(--border))] pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-[rgb(var(--muted))]">Subtotal</span>
                <span>{formatUsdCents(subtotalCents)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[rgb(var(--muted))]">Shipping</span>
                <span className="text-[rgb(var(--muted))]">Quoted at delivery</span>
              </div>
              <div className="flex justify-between border-t border-[rgb(var(--border))] pt-3 font-semibold">
                <span>Total</span>
                <span>{formatUsdCents(subtotalCents)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 w-full rounded-full bg-[rgb(var(--fg))] py-3.5 text-sm font-semibold text-white transition hover:-translate-y-[1px] hover:shadow-sm disabled:opacity-50 disabled:translate-y-0 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Redirecting to payment…' : 'Pay with Square'}
            </button>

            <p className="mt-3 text-center text-xs text-[rgb(var(--muted))]">
              You&apos;ll be redirected to Square&apos;s secure checkout.
            </p>

            <div className="mt-4 text-center text-xs text-[rgb(var(--muted))]">
              <Link href="/cart" className="hover:underline">
                ← Back to cart
              </Link>
            </div>
          </div>
        </div>
      </form>
    </main>
  );
}
