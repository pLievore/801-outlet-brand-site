'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';

import type { CartLineView } from '../../../src/lib/catalog/cart-view';
import { formatMoney } from '../../../src/lib/format';
import { useCart } from './cart-provider';
import { HAPTIC, haptic } from '../../../src/lib/haptics';

export function CartLineItem({
  line,
  onNavigate,
}: {
  line: CartLineView;
  onNavigate?: () => void;
}) {
  const { updateLine, removeLine, pending } = useCart();
  const merchandise = line.merchandise;
  const showVariantTitle =
    merchandise.variantTitle && merchandise.variantTitle !== 'Default Title';
  const atMax =
    merchandise.quantityAvailable !== null &&
    line.quantity >= merchandise.quantityAvailable;

  return (
    <div className="flex gap-4 py-4">
      <Link
        href={`/products/${merchandise.productHandle}`}
        onClick={onNavigate}
        className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface-muted))]"
        aria-hidden="true"
        tabIndex={-1}
      >
        {merchandise.image ? (
          <Image
            src={merchandise.image.url}
            alt=""
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : null}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <Link
            href={`/products/${merchandise.productHandle}`}
            onClick={onNavigate}
            className="min-w-0 text-sm font-semibold leading-5 hover:underline"
          >
            {merchandise.productTitle}
          </Link>
          <span className="shrink-0 text-sm font-semibold tabular-nums-tight">
            {formatMoney(line.lineTotal)}
          </span>
        </div>

        {showVariantTitle ? (
          <p className="mt-0.5 text-xs text-[rgb(var(--muted))]">
            {merchandise.variantTitle}
          </p>
        ) : null}

        {!merchandise.availableForSale ? (
          <p className="mt-1 text-xs font-semibold text-[rgb(var(--accent))]">
            No longer available — remove to check out
          </p>
        ) : null}

        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-center rounded-full border border-[rgb(var(--border-strong))] bg-white">
            <button
              type="button"
              onClick={() => {
                haptic(HAPTIC.tap);
                updateLine(line.id, line.quantity - 1);
              }}
              disabled={pending}
              className="flex size-8 items-center justify-center rounded-full transition hover:bg-[rgb(var(--surface-muted))] disabled:opacity-40"
              aria-label={`Decrease quantity of ${merchandise.productTitle}`}
            >
              <Minus aria-hidden="true" className="size-3.5" />
            </button>
            <span
              className="w-7 text-center text-sm font-semibold tabular-nums"
              aria-live="polite"
            >
              {line.quantity}
            </span>
            <button
              type="button"
              onClick={() => {
                haptic(HAPTIC.tap);
                updateLine(line.id, line.quantity + 1);
              }}
              disabled={pending || atMax}
              className="flex size-8 items-center justify-center rounded-full transition hover:bg-[rgb(var(--surface-muted))] disabled:opacity-40"
              aria-label={`Increase quantity of ${merchandise.productTitle}`}
            >
              <Plus aria-hidden="true" className="size-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              haptic(HAPTIC.undo);
              removeLine(line.id);
            }}
            disabled={pending}
            className="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-[rgb(var(--muted))] transition hover:text-[rgb(var(--fg))] disabled:opacity-40"
            aria-label={`Remove ${merchandise.productTitle} from cart`}
          >
            <Trash2 aria-hidden="true" className="size-3.5" />
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
