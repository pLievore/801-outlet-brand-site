'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, Check, Loader2, Percent, Tag } from 'lucide-react';

import { HAPTIC, haptic } from '../../../../src/lib/haptics';
import { createDiscountAction } from '../actions';
import { buttonStyles } from '../../../components/ui/button';

export function NewDiscountForm() {
  const [state, formAction, isPending] = useActionState(createDiscountAction, null);

  const [discountType, setDiscountType] = useState<'percentage' | 'fixed_amount'>('percentage');
  const [hasEndDate, setHasEndDate] = useState(false);
  const [hasUsageLimit, setHasUsageLimit] = useState(false);

  const inputClass =
    'min-h-11 w-full rounded-xl border border-[rgb(var(--border-strong))] bg-white px-4 text-sm outline-none transition focus:border-[rgb(var(--accent))] focus:ring-2 focus:ring-[rgb(var(--accent))]/15';

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      {state?.error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-800 flex items-start gap-3">
          <AlertCircle className="size-4 shrink-0 text-red-600 mt-0.5" />
          <div>
            <p className="font-semibold">Unable to create discount coupon</p>
            <p className="mt-0.5 text-red-700">{state.error}</p>
          </div>
        </div>
      ) : null}

      {/* Basic information */}
      <div className="rounded-3xl border border-[rgb(var(--border))] bg-white p-5 md:p-7 space-y-5">
        <div>
          <h2 className="text-sm font-bold text-[rgb(var(--fg))]">Coupon code & title</h2>
          <p className="mt-0.5 text-xs text-[rgb(var(--muted))]">
            Customers will enter this code at checkout or in their cart.
          </p>
        </div>

        <div>
          <label htmlFor="code" className="text-xs font-semibold text-[rgb(var(--muted))]">
            Discount code *
          </label>
          <div className="relative mt-1">
            <input
              id="code"
              name="code"
              type="text"
              required
              maxLength={50}
              placeholder="e.g. WELCOME10"
              autoCapitalize="characters"
              onChange={(e) => {
                e.target.value = e.target.value.toUpperCase();
              }}
              className={`font-mono uppercase tracking-wider font-bold ${inputClass}`}
            />
          </div>
          <p className="mt-1 text-[11px] text-[rgb(var(--muted))]">
            Use letters and numbers without spaces (e.g. SPRING20, VIP50).
          </p>
        </div>

        <div>
          <label htmlFor="title" className="text-xs font-semibold text-[rgb(var(--muted))]">
            Title / Description *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            maxLength={100}
            placeholder="e.g. Spring Sale 10% Off All Items"
            className={`mt-1 ${inputClass}`}
          />
          <p className="mt-1 text-[11px] text-[rgb(var(--muted))]">
            Shown to the customer when the discount applies to their cart.
          </p>
        </div>
      </div>

      {/* Discount value and type */}
      <div className="rounded-3xl border border-[rgb(var(--border))] bg-white p-5 md:p-7 space-y-5">
        <div>
          <h2 className="text-sm font-bold text-[rgb(var(--fg))]">Discount value</h2>
          <p className="mt-0.5 text-xs text-[rgb(var(--muted))]">
            Choose whether to discount by a percentage or a fixed dollar amount.
          </p>
        </div>

        <input type="hidden" name="discountType" value={discountType} />

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              setDiscountType('percentage');
              haptic(HAPTIC.tap);
            }}
            className={`flex items-center justify-center gap-2 rounded-2xl border p-4 text-xs font-bold transition ${
              discountType === 'percentage'
                ? 'border-[rgb(var(--accent))] bg-[rgb(var(--accent))]/5 text-[rgb(var(--fg))] ring-2 ring-[rgb(var(--accent))]/20'
                : 'border-[rgb(var(--border))] bg-neutral-50/50 text-[rgb(var(--muted))] hover:bg-neutral-100'
            }`}
          >
            <Percent className="size-4" /> Percentage discount
          </button>

          <button
            type="button"
            onClick={() => {
              setDiscountType('fixed_amount');
              haptic(HAPTIC.tap);
            }}
            className={`flex items-center justify-center gap-2 rounded-2xl border p-4 text-xs font-bold transition ${
              discountType === 'fixed_amount'
                ? 'border-[rgb(var(--accent))] bg-[rgb(var(--accent))]/5 text-[rgb(var(--fg))] ring-2 ring-[rgb(var(--accent))]/20'
                : 'border-[rgb(var(--border))] bg-neutral-50/50 text-[rgb(var(--muted))] hover:bg-neutral-100'
            }`}
          >
            <Tag className="size-4" /> Fixed dollar amount
          </button>
        </div>

        <div>
          <label htmlFor="value" className="text-xs font-semibold text-[rgb(var(--muted))]">
            {discountType === 'percentage' ? 'Percentage value (%) *' : 'Discount amount ($ USD) *'}
          </label>
          <div className="relative mt-1">
            <input
              id="value"
              name="value"
              type="number"
              required
              step={discountType === 'percentage' ? '1' : '0.01'}
              min={discountType === 'percentage' ? '1' : '0.01'}
              max={discountType === 'percentage' ? '100' : undefined}
              placeholder={discountType === 'percentage' ? '15' : '25.00'}
              className={`${inputClass} pr-12`}
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[rgb(var(--muted))]">
              {discountType === 'percentage' ? '%' : 'USD'}
            </span>
          </div>
        </div>
      </div>

      {/* Usage limits */}
      <div className="rounded-3xl border border-[rgb(var(--border))] bg-white p-5 md:p-7 space-y-5">
        <div>
          <h2 className="text-sm font-bold text-[rgb(var(--fg))]">Usage restrictions</h2>
          <p className="mt-0.5 text-xs text-[rgb(var(--muted))]">
            Optional controls to limit redemptions or enforce 1 per buyer.
          </p>
        </div>

        <div className="space-y-4">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hasUsageLimit}
              onChange={(e) => setHasUsageLimit(e.target.checked)}
              className="size-4 rounded border-[rgb(var(--border-strong))] text-[rgb(var(--accent))] focus:ring-[rgb(var(--accent))] mt-0.5"
            />
            <div>
              <span className="text-xs font-semibold text-[rgb(var(--fg))]">
                Limit total number of times this coupon can be used
              </span>
              <p className="text-[11px] text-[rgb(var(--muted))]">
                E.g. only the first 50 customers to redeem it.
              </p>
            </div>
          </label>

          {hasUsageLimit ? (
            <div className="pl-7">
              <label htmlFor="usageLimit" className="text-xs font-semibold text-[rgb(var(--muted))]">
                Maximum uses *
              </label>
              <input
                id="usageLimit"
                name="usageLimit"
                type="number"
                min="1"
                required={hasUsageLimit}
                placeholder="50"
                className={`mt-1 max-w-xs ${inputClass}`}
              />
            </div>
          ) : null}

          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              name="appliesOncePerCustomer"
              className="size-4 rounded border-[rgb(var(--border-strong))] text-[rgb(var(--accent))] focus:ring-[rgb(var(--accent))] mt-0.5"
            />
            <div>
              <span className="text-xs font-semibold text-[rgb(var(--fg))]">
                Limit to one use per customer
              </span>
              <p className="text-[11px] text-[rgb(var(--muted))]">
                Prevents the same customer account from reusing this coupon code across multiple orders.
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Expiration date */}
      <div className="rounded-3xl border border-[rgb(var(--border))] bg-white p-5 md:p-7 space-y-5">
        <div>
          <h2 className="text-sm font-bold text-[rgb(var(--fg))]">Active dates & expiration</h2>
          <p className="mt-0.5 text-xs text-[rgb(var(--muted))]">
            Coupon starts immediately upon creation. You can optionally set an expiration deadline.
          </p>
        </div>

        <div className="space-y-4">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hasEndDate}
              onChange={(e) => setHasEndDate(e.target.checked)}
              className="size-4 rounded border-[rgb(var(--border-strong))] text-[rgb(var(--accent))] focus:ring-[rgb(var(--accent))] mt-0.5"
            />
            <div>
              <span className="text-xs font-semibold text-[rgb(var(--fg))]">
                Set end / expiration date
              </span>
              <p className="text-[11px] text-[rgb(var(--muted))]">
                Coupon will automatically expire after the selected date and time.
              </p>
            </div>
          </label>

          {hasEndDate ? (
            <div className="pl-7 max-w-sm">
              <label htmlFor="endsAt" className="text-xs font-semibold text-[rgb(var(--muted))]">
                Expiration date and time *
              </label>
              <div className="relative mt-1">
                <input
                  id="endsAt"
                  name="endsAt"
                  type="datetime-local"
                  required={hasEndDate}
                  className={inputClass}
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Footer action buttons */}
      <div className="flex items-center justify-between pt-2">
        <Link
          href="/admin/discounts"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition"
        >
          <ArrowLeft className="size-3.5" /> Back to coupons
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/discounts"
            className="rounded-full border border-[rgb(var(--border))] px-5 py-2.5 text-xs font-semibold text-[rgb(var(--fg))] hover:bg-neutral-100 transition"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isPending}
            onClick={() => haptic(HAPTIC.commit)}
            className={buttonStyles({
              variant: 'primary',
              size: 'md',
              className: 'gap-2',
            })}
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Creating coupon…
              </>
            ) : (
              <>
                <Check className="size-4" /> Save coupon
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
