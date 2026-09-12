'use client';

import { useId, useState } from 'react';
import { Loader2, Tag, X } from 'lucide-react';

import { HAPTIC, haptic } from '../../../src/lib/haptics';
import { useCart } from './cart-provider';

export function CartCouponSection({
  compact = false,
  idPrefix,
}: {
  compact?: boolean;
  idPrefix?: string;
}) {
  const { cart, applyDiscount, removeDiscount, pending } = useCart();
  const autoId = useId();
  const inputId = idPrefix ? `${idPrefix}-coupon-input` : `coupon-input-${autoId}`;

  const [couponInput, setCouponInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  const appliedCodes = cart?.discountCodes.filter((d) => d.applicable) ?? [];

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = couponInput.trim().toUpperCase();
    if (!clean) return;

    setLoading(true);
    setFeedback(null);

    const success = await applyDiscount(clean);
    setLoading(false);

    if (success) {
      haptic(HAPTIC.commit);
      setFeedback({ type: 'success', message: `Coupon "${clean}" applied!` });
      setCouponInput('');
    } else {
      haptic(HAPTIC.undo);
      setFeedback({
        type: 'error',
        message: `Coupon "${clean}" is invalid, expired, or limit reached.`,
      });
    }
  };

  const handleRemove = async () => {
    haptic(HAPTIC.undo);
    setLoading(true);
    setFeedback(null);
    await removeDiscount();
    setLoading(false);
  };

  return (
    <div className={`border-t border-[rgb(var(--border))] ${compact ? 'mt-3 pt-3' : 'mt-5 pt-4'}`}>
      {appliedCodes.length > 0 ? (
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[rgb(var(--muted))]">
            Active Coupon
          </p>
          {appliedCodes.map((discount) => (
            <div
              key={discount.code}
              className="flex items-center justify-between rounded-xl border border-[rgb(var(--sage))]/40 bg-[rgb(var(--sage-soft))] px-3 py-1.5 text-xs font-semibold text-[rgb(var(--sage-ink))]"
            >
              <span className="flex items-center gap-1.5">
                <Tag className="size-3.5" aria-hidden="true" />
                {discount.code}
              </span>
              <button
                type="button"
                onClick={handleRemove}
                disabled={loading || pending}
                className="rounded p-1 text-[rgb(var(--sage-ink))] transition hover:bg-black/5 hover:text-red-700 disabled:opacity-50"
                aria-label={`Remove coupon ${discount.code}`}
                title="Remove coupon"
              >
                {loading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <X className="size-3.5" aria-hidden="true" />
                )}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <form onSubmit={handleApply} className="space-y-1.5">
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-[rgb(var(--muted))]"
          >
            Have a promo code?
          </label>
          <div className="flex gap-2">
            <input
              id={inputId}
              type="text"
              placeholder="e.g. SAVE10"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
              disabled={loading || pending}
              className={`min-w-0 flex-1 rounded-xl border border-[rgb(var(--border))] bg-white px-3 text-xs font-semibold uppercase tracking-wider transition focus:border-[rgb(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]/20 ${
                compact ? 'py-1.5' : 'py-2'
              }`}
            />
            <button
              type="submit"
              disabled={loading || pending || !couponInput.trim()}
              className={`rounded-xl bg-[rgb(var(--fg))] px-3.5 text-xs font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50 flex items-center justify-center gap-1 shrink-0 ${
                compact ? 'py-1.5' : 'py-2'
              }`}
            >
              {loading ? <Loader2 className="size-3 animate-spin" /> : 'Apply'}
            </button>
          </div>
        </form>
      )}

      {feedback ? (
        <p
          className={`mt-1.5 text-xs font-medium leading-tight ${
            feedback.type === 'error' ? 'text-red-600' : 'text-[rgb(var(--sage-ink))]'
          }`}
        >
          {feedback.message}
        </p>
      ) : null}
    </div>
  );
}
