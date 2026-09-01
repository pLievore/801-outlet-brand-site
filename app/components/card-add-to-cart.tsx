'use client';

import { useState } from 'react';
import { Check, Loader2, Plus } from 'lucide-react';

import { HAPTIC, haptic } from '../../src/lib/haptics';
import { useCart } from './cart/cart-provider';
import { trackFunnelStep } from './track-event';

/**
 * Add to cart from the catalogue, without opening the product first.
 *
 * Only for a piece with exactly one buyable variant — anything with options
 * has nothing to add until someone picks them, and a card cannot ask which
 * colour. Those keep sending people to the page, which is where the question
 * can be answered.
 *
 * The button confirms in place for a moment rather than throwing the cart open:
 * someone adding from a list is usually adding more than one thing, and a
 * drawer over the list would interrupt exactly that.
 */
export function CardAddToCart({
  variantId,
  productHandle,
  productTitle,
}: {
  variantId: string;
  productHandle: string;
  productTitle: string;
}) {
  const { addLine, pending } = useCart();
  const [added, setAdded] = useState(false);
  const [failed, setFailed] = useState(false);

  const onAdd = async (event: React.MouseEvent) => {
    // The card is one big link; adding is not navigating.
    event.preventDefault();
    event.stopPropagation();
    if (pending) return;

    setFailed(false);
    const ok = await addLine(variantId, 1);
    haptic(ok ? HAPTIC.commit : HAPTIC.undo);

    if (!ok) {
      setFailed(true);
      return;
    }

    trackFunnelStep('add_to_cart', { handles: [productHandle] });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={onAdd}
      disabled={pending}
      aria-label={`Add ${productTitle} to cart`}
      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[rgb(var(--fg))] px-5 text-sm font-semibold text-white transition hover:bg-[rgb(var(--fg))]/90 disabled:opacity-60"
    >
      {pending ? (
        <Loader2 aria-hidden="true" className="size-4 animate-spin" />
      ) : added ? (
        <Check aria-hidden="true" className="size-4" />
      ) : (
        <Plus aria-hidden="true" className="size-4" />
      )}
      {added ? 'Added' : failed ? 'Try again' : 'Add to cart'}
      <span aria-live="polite" className="sr-only">
        {added ? `${productTitle} added to cart` : ''}
      </span>
    </button>
  );
}
