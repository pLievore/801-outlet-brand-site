'use client';

import { useActionState, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Copy,
  Loader2,
  Tag,
  Trash2,
} from 'lucide-react';

import type { AdminDiscountItem } from '../../../../src/lib/shopify-admin/discounts';
import { HAPTIC, haptic } from '../../../../src/lib/haptics';
import { deleteDiscountAction, updateDiscountAction } from '../actions';
import { buttonStyles } from '../../../components/ui/button';

export function EditDiscountForm({ discount }: { discount: AdminDiscountItem }) {
  const router = useRouter();
  const updateActionWithId = updateDiscountAction.bind(null, discount.id);
  const [state, formAction, isPending] = useActionState(updateActionWithId, null);

  const [copied, setCopied] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();

  // Format existing endsAt into "YYYY-MM-DDTHH:mm" for datetime-local input
  const initialEndDateStr = discount.endsAt
    ? new Date(discount.endsAt).toISOString().slice(0, 16)
    : '';

  const [hasEndDate, setHasEndDate] = useState(Boolean(discount.endsAt));
  const [endsAt, setEndsAt] = useState(initialEndDateStr);

  const [hasUsageLimit, setHasUsageLimit] = useState(discount.usageLimit !== null);
  const [usageLimit, setUsageLimit] = useState(
    discount.usageLimit !== null ? String(discount.usageLimit) : ''
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(discount.code);
    haptic(HAPTIC.tap);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = () => {
    if (
      confirm(
        `Are you sure you want to delete coupon "${discount.code}"? This will permanently remove it from Shopify.`
      )
    ) {
      haptic(HAPTIC.undo);
      startDeleteTransition(async () => {
        const res = await deleteDiscountAction(discount.id);
        if (res.ok) {
          router.push('/admin/discounts');
          router.refresh();
        } else {
          alert(res.error ?? 'Failed to delete coupon.');
        }
      });
    }
  };

  const inputClass =
    'min-h-11 w-full rounded-xl border border-[rgb(var(--border-strong))] bg-white px-4 text-sm outline-none transition focus:border-[rgb(var(--accent))] focus:ring-2 focus:ring-[rgb(var(--accent)/0.15)]';

  return (
    <div className="max-w-2xl space-y-6">
      {state?.error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-800 flex items-start gap-3">
          <AlertCircle className="size-4 shrink-0 text-red-600 mt-0.5" />
          <div>
            <p className="font-semibold">Unable to update coupon</p>
            <p className="mt-0.5 text-red-700">{state.error}</p>
          </div>
        </div>
      ) : null}

      {/* Overview card */}
      <div className="rounded-3xl border border-[rgb(var(--border))] bg-white p-5 md:p-7 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[rgb(var(--surface-muted))] p-3 text-[rgb(var(--fg))]">
              <Tag className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xl font-black tracking-wider text-[rgb(var(--fg))]">
                  {discount.code}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="rounded p-1 text-[rgb(var(--muted))] transition hover:text-[rgb(var(--fg))]"
                  title="Copy code"
                >
                  {copied ? (
                    <Check className="size-4 text-green-600" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-[rgb(var(--muted))]">
                {discount.usageCount} redemptions recorded
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-[rgb(var(--sage-soft))] px-3 py-1 text-xs font-bold text-[rgb(var(--sage-ink))]">
              {discount.discountType === 'percentage'
                ? `${discount.value}% OFF`
                : `$${discount.value.toFixed(2)} OFF`}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                discount.status === 'ACTIVE'
                  ? 'bg-[rgb(var(--sage-soft))] text-[rgb(var(--sage-ink))]'
                  : discount.status === 'EXPIRED'
                    ? 'bg-neutral-100 text-neutral-600'
                    : 'bg-blue-50 text-blue-700'
              }`}
            >
              {discount.status.toLowerCase()}
            </span>
          </div>
        </div>
      </div>

      <form action={formAction} className="space-y-6">
        {/* Title */}
        <div className="rounded-3xl border border-[rgb(var(--border))] bg-white p-5 md:p-7 space-y-4">
          <h2 className="text-sm font-bold text-[rgb(var(--fg))]">Coupon details</h2>

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
              defaultValue={discount.title}
              placeholder="e.g. VIP 15% Off Discount"
              className={`mt-1 ${inputClass}`}
            />
            <p className="mt-1 text-[11px] text-[rgb(var(--muted))]">
              Promotional title displayed in the cart summary when applied.
            </p>
          </div>
        </div>

        {/* Usage limits */}
        <div className="rounded-3xl border border-[rgb(var(--border))] bg-white p-5 md:p-7 space-y-5">
          <div>
            <h2 className="text-sm font-bold text-[rgb(var(--fg))]">Usage restrictions</h2>
            <p className="mt-0.5 text-xs text-[rgb(var(--muted))]">
              Control maximum redemptions or enforce one redemption per buyer.
            </p>
          </div>

          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hasUsageLimit}
                onChange={(e) => {
                  setHasUsageLimit(e.target.checked);
                  if (!e.target.checked) setUsageLimit('');
                }}
                className="size-4 rounded border-[rgb(var(--border-strong))] text-[rgb(var(--accent))] focus:ring-[rgb(var(--accent))] mt-0.5"
              />
              <div>
                <span className="text-xs font-semibold text-[rgb(var(--fg))]">
                  Limit total number of times this coupon can be used
                </span>
                <p className="text-[11px] text-[rgb(var(--muted))]">
                  Uncheck to make redemptions unlimited.
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
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                  placeholder="50"
                  className={`mt-1 max-w-xs ${inputClass}`}
                />
              </div>
            ) : null}

            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                name="appliesOncePerCustomer"
                defaultChecked={discount.appliesOncePerCustomer}
                className="size-4 rounded border-[rgb(var(--border-strong))] text-[rgb(var(--accent))] focus:ring-[rgb(var(--accent))] mt-0.5"
              />
              <div>
                <span className="text-xs font-semibold text-[rgb(var(--fg))]">
                  Limit to one use per customer
                </span>
                <p className="text-[11px] text-[rgb(var(--muted))]">
                  Prevents customers from reusing this code on subsequent purchases.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Expiration date */}
        <div className="rounded-3xl border border-[rgb(var(--border))] bg-white p-5 md:p-7 space-y-5">
          <div>
            <h2 className="text-sm font-bold text-[rgb(var(--fg))]">Expiration date</h2>
            <p className="mt-0.5 text-xs text-[rgb(var(--muted))]">
              Coupons without an expiration date remain active indefinitely.
            </p>
          </div>

          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hasEndDate}
                onChange={(e) => {
                  setHasEndDate(e.target.checked);
                  if (!e.target.checked) setEndsAt('');
                }}
                className="size-4 rounded border-[rgb(var(--border-strong))] text-[rgb(var(--accent))] focus:ring-[rgb(var(--accent))] mt-0.5"
              />
              <div>
                <span className="text-xs font-semibold text-[rgb(var(--fg))]">
                  Set end / expiration date
                </span>
                <p className="text-[11px] text-[rgb(var(--muted))]">
                  Coupon automatically deactivates after this time.
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
                    value={endsAt}
                    onChange={(e) => setEndsAt(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Actions */}
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
                  <Loader2 className="size-4 animate-spin" /> Saving changes…
                </>
              ) : (
                <>
                  <Check className="size-4" /> Save changes
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Danger zone */}
      <div className="rounded-3xl border border-red-200 bg-red-50/40 p-5 md:p-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-red-950">Delete coupon</h3>
          <p className="mt-0.5 text-xs text-red-800">
            Permanently remove this coupon from Shopify. This action cannot be undone.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-red-300 bg-white px-5 py-2.5 text-xs font-bold text-red-700 hover:bg-red-50 transition disabled:opacity-50"
        >
          {isDeleting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Trash2 className="size-4" />
          )}
          Delete coupon
        </button>
      </div>
    </div>
  );
}
