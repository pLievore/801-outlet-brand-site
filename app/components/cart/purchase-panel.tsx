'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Minus, Plus } from 'lucide-react';

import type {
  CatalogProductDetail,
  CatalogProductVariant,
} from '../../../src/lib/catalog/types';
import { formatMoney } from '../../../src/lib/format';
import { cn } from '../../../src/lib/cn';
import { trackFunnelStep } from '../track-event';
import { useCart } from './cart-provider';
import { HAPTIC, haptic } from '../../../src/lib/haptics';

type PurchasePanelProps = {
  options: CatalogProductDetail['options'];
  variants: CatalogProductVariant[];
  /**
   * What the button says when nothing can be added — "Sold out" or
   * "Coming soon", decided by the page from the product's availability.
   */
  unavailableLabel?: string;
  /** Attributes the add-to-cart event to this product in the funnel. */
  productHandle?: string;
};

function isDefaultOnly(
  options: PurchasePanelProps['options'],
  variants: CatalogProductVariant[]
) {
  return (
    variants.length === 1 &&
    options.every(
      (option) =>
        option.values.length === 1 || option.name.toLowerCase() === 'title'
    )
  );
}

export function PurchasePanel({
  options,
  variants,
  unavailableLabel = 'Currently unavailable',
  productHandle,
}: PurchasePanelProps) {
  const { addLine, pending } = useCart();
  const defaultOnly = isDefaultOnly(options, variants);

  /**
   * A phone shows the buy button once, at the top, and then loses it behind a
   * gallery and a description that are both taller than the screen. Deciding to
   * buy at the bottom of the page meant scrolling back up to act on it.
   *
   * The bar appears only after the real button has left the screen, so the two
   * are never on screen at the same time saying the same thing.
   */
  const actionsRef = useRef<HTMLDivElement>(null);
  const [showBar, setShowBar] = useState(false);

  useEffect(() => {
    const target = actionsRef.current;
    if (!target || typeof IntersectionObserver === 'undefined') return;

    // Gated on the viewport as well as on Tailwind's `lg:hidden`, because the
    // bar also reserves room at the foot of the document — and reserving it on
    // a desktop, where the bar never shows, would be a strip of dead space.
    const phone = window.matchMedia('(max-width: 1023px)');
    let offScreen = false;

    const sync = () => setShowBar(phone.matches && offScreen);

    const observer = new IntersectionObserver(
      ([entry]) => {
        offScreen = !entry.isIntersecting;
        sync();
      },
      { rootMargin: '0px 0px -8px 0px' }
    );
    observer.observe(target);
    phone.addEventListener('change', sync);

    return () => {
      observer.disconnect();
      phone.removeEventListener('change', sync);
    };
  }, []);

  // The bar floats over the page, so the document has to end above it —
  // otherwise it sits on top of the last thing in the footer.
  useEffect(() => {
    if (!showBar) return;
    const previous = document.body.style.paddingBottom;
    // On top of the room the layout already keeps for the tab bar.
    document.body.style.paddingBottom = '4.75rem';
    return () => {
      document.body.style.paddingBottom = previous;
    };
  }, [showBar]);

  const [selected, setSelected] = useState<Record<string, string>>(() => {
    if (defaultOnly) return {};
    // Preselect the first available variant's options, if any.
    const initial = variants.find((variant) => variant.availableForSale);
    return Object.fromEntries(
      (initial ?? variants[0])?.selectedOptions.map((option) => [
        option.name,
        option.value,
      ]) ?? []
    );
  });
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState<string | null>(null);

  const visibleOptions = defaultOnly
    ? []
    : options.filter((option) => option.name.toLowerCase() !== 'title');

  const selectedVariant = useMemo(() => {
    if (defaultOnly) return variants[0] ?? null;

    return (
      variants.find((variant) =>
        variant.selectedOptions.every(
          (option) => selected[option.name] === option.value
        )
      ) ?? null
    );
  }, [defaultOnly, selected, variants]);

  const inStock = Boolean(selectedVariant?.availableForSale);
  const maxQuantity =
    selectedVariant?.quantityAvailable != null &&
    selectedVariant.quantityAvailable > 0
      ? selectedVariant.quantityAvailable
      : 99;
  const boundedQuantity = Math.min(quantity, maxQuantity);

  const variantForValue = (optionName: string, value: string) =>
    variants.find((variant) =>
      variant.selectedOptions.every((option) =>
        option.name === optionName
          ? option.value === value
          : selected[option.name] === option.value
      )
    );

  const onAdd = async () => {
    if (!selectedVariant || !inStock) return;
    setFeedback(null);
    const ok = await addLine(selectedVariant.id, boundedQuantity);
    setFeedback(ok ? null : 'We could not add this item. Please try again.');
    // The one moment on the whole storefront worth confirming in the hand.
    haptic(ok ? HAPTIC.commit : HAPTIC.undo);
    if (ok) {
      setQuantity(1);
      trackFunnelStep(
        'add_to_cart',
        productHandle ? { handles: [productHandle] } : undefined
      );
    }
  };

  return (
    <div>
      {visibleOptions.map((option) => (
        <fieldset key={option.id} className="mt-5 first:mt-0">
          <legend className="text-xs font-semibold uppercase tracking-[0.16em] text-[rgb(var(--muted))]">
            {option.name}
            {selected[option.name] ? (
              <span className="ml-2 normal-case tracking-normal text-[rgb(var(--fg))]">
                {selected[option.name]}
              </span>
            ) : null}
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {option.values.map((value) => {
              const active = selected[option.name] === value;
              const match = variantForValue(option.name, value);
              const unavailable = match ? !match.availableForSale : false;

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setSelected((current) => ({
                      ...current,
                      [option.name]: value,
                    }))
                  }
                  aria-pressed={active}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                    active
                      ? 'border-[rgb(var(--fg))] bg-[rgb(var(--fg))] text-white'
                      : 'border-[rgb(var(--border-strong))] bg-white hover:border-[rgb(var(--fg))]',
                    unavailable && 'opacity-50'
                  )}
                >
                  {value}
                  {unavailable ? (
                    <span className="sr-only"> (sold out)</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}

      {!defaultOnly && selectedVariant ? (
        <p className="mt-4 text-sm font-semibold tabular-nums-tight">
          {formatMoney(selectedVariant.price)}
          {selectedVariant.compareAtPrice ? (
            <span className="ml-2 font-normal text-[rgb(var(--muted))] line-through">
              {formatMoney(selectedVariant.compareAtPrice)}
            </span>
          ) : null}
        </p>
      ) : null}

      <div ref={actionsRef} className="mt-5 flex items-stretch gap-3">
        <div className="flex items-center rounded-full border border-[rgb(var(--border-strong))] bg-white">
          <button
            type="button"
            onClick={() => {
              haptic(HAPTIC.tap);
              setQuantity((value) => Math.max(1, value - 1));
            }}
            disabled={!inStock || boundedQuantity <= 1}
            className="flex size-11 items-center justify-center rounded-full transition hover:bg-[rgb(var(--surface-muted))] disabled:opacity-40"
            aria-label="Decrease quantity"
          >
            <Minus aria-hidden="true" className="size-4" />
          </button>
          <span
            className="w-9 text-center text-sm font-semibold tabular-nums"
            aria-live="polite"
          >
            {boundedQuantity}
          </span>
          <button
            type="button"
            onClick={() =>
              setQuantity((value) => Math.min(maxQuantity, value + 1))
            }
            disabled={!inStock || boundedQuantity >= maxQuantity}
            className="flex size-11 items-center justify-center rounded-full transition hover:bg-[rgb(var(--surface-muted))] disabled:opacity-40"
            aria-label="Increase quantity"
          >
            <Plus aria-hidden="true" className="size-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={onAdd}
          disabled={!inStock || pending}
          className="min-h-11 flex-1 rounded-full bg-[rgb(var(--fg))] px-6 text-sm font-semibold text-white transition hover:bg-[rgb(var(--fg))]/90 disabled:cursor-not-allowed disabled:opacity-55"
        >
          {!selectedVariant
            ? 'Select options'
            : !inStock
              ? unavailableLabel
              : pending
                ? 'Adding…'
                : 'Add to cart'}
        </button>
      </div>

      {feedback ? (
        <p role="alert" className="mt-3 text-xs font-semibold text-[rgb(var(--accent))]">
          {feedback}
        </p>
      ) : null}

      {/* Phone only: the desktop panel never leaves the screen. */}
      {showBar && inStock ? (
        <div className="above-tab-bar fixed inset-x-0 z-40 border-t border-[rgb(var(--border))] bg-[rgb(var(--bg))]/95 px-4 py-3 backdrop-blur-xl lg:hidden">
          <div className="mx-auto flex max-w-2xl items-center gap-3">
            {selectedVariant ? (
              <div className="min-w-0">
                <p className="truncate text-base font-bold tabular-nums-tight">
                  {formatMoney(selectedVariant.price)}
                </p>
                {selectedVariant.compareAtPrice ? (
                  <p className="text-xs text-[rgb(var(--muted))] line-through">
                    {formatMoney(selectedVariant.compareAtPrice)}
                  </p>
                ) : null}
              </div>
            ) : null}
            <button
              type="button"
              onClick={onAdd}
              disabled={pending}
              className="min-h-12 flex-1 rounded-full bg-[rgb(var(--fg))] px-6 text-sm font-semibold text-white transition hover:bg-[rgb(var(--fg))]/90 disabled:opacity-55"
            >
              {pending ? 'Adding…' : 'Add to cart'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
