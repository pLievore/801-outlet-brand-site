'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PencilLine } from 'lucide-react';

import type { PanelProduct } from '../../../src/lib/panel/products';
import { cn } from '../../../src/lib/cn';
import { saveProductAction } from './actions';

type VariantDraft = {
  price: string;
  compareAtPrice: string;
  quantity: string;
};

type ProductDraft = {
  status: PanelProduct['status'];
  variants: Record<string, VariantDraft>;
};

const STATUS_LABEL: Record<PanelProduct['status'], string> = {
  ACTIVE: 'Active',
  DRAFT: 'Draft',
  ARCHIVED: 'Archived',
};

function initialDraft(product: PanelProduct): ProductDraft {
  return {
    status: product.status,
    variants: Object.fromEntries(
      product.variants.map((variant) => [
        variant.id,
        {
          price: variant.price,
          compareAtPrice: variant.compareAtPrice ?? '',
          quantity: String(variant.inventoryQuantity),
        },
      ])
    ),
  };
}

function ProductRow({ product }: { product: PanelProduct }) {
  const [draft, setDraft] = useState(() => initialDraft(product));
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const statusChanged = draft.status !== product.status;
  const changedVariants = product.variants.map((variant) => {
    const value = draft.variants[variant.id];
    return {
      variant,
      value,
      pricingChanged:
        value.price !== variant.price ||
        value.compareAtPrice !== (variant.compareAtPrice ?? ''),
      quantityChanged: value.quantity !== String(variant.inventoryQuantity),
    };
  });
  const dirty =
    statusChanged ||
    changedVariants.some((entry) => entry.pricingChanged || entry.quantityChanged);

  const save = () => {
    setFeedback(null);
    startTransition(async () => {
      const result = await saveProductAction({
        productId: product.id,
        status: draft.status,
        statusChanged,
        variants: changedVariants.map(({ variant, value, pricingChanged, quantityChanged }) => ({
          id: variant.id,
          inventoryItemId: variant.inventoryItemId,
          price: value.price,
          compareAtPrice: value.compareAtPrice,
          quantity: Number(value.quantity),
          pricingChanged,
          quantityChanged,
        })),
      });
      setFeedback(
        result.ok
          ? { ok: true, text: 'Saved.' }
          : { ok: false, text: result.error ?? 'Failed.' }
      );
    });
  };

  // One tap when a piece sells in person: archive it and zero the stock.
  const markAsSold = () => {
    if (
      !window.confirm(
        `Mark "${product.title}" as sold? It will be archived and stock set to 0.`
      )
    ) {
      return;
    }
    setFeedback(null);
    startTransition(async () => {
      const result = await saveProductAction({
        productId: product.id,
        status: 'ARCHIVED',
        statusChanged: product.status !== 'ARCHIVED',
        variants: product.variants.map((variant) => ({
          id: variant.id,
          inventoryItemId: variant.inventoryItemId,
          price: variant.price,
          compareAtPrice: variant.compareAtPrice ?? '',
          quantity: 0,
          pricingChanged: false,
          quantityChanged: variant.inventoryQuantity !== 0,
        })),
      });
      if (result.ok) {
        setDraft((current) => ({
          status: 'ARCHIVED',
          variants: Object.fromEntries(
            Object.entries(current.variants).map(([id, value]) => [
              id,
              { ...value, quantity: '0' },
            ])
          ),
        }));
      }
      setFeedback(
        result.ok
          ? { ok: true, text: 'Marked as sold — archived with stock 0.' }
          : { ok: false, text: result.error ?? 'Failed.' }
      );
    });
  };

  const setVariant = (variantId: string, patch: Partial<VariantDraft>) =>
    setDraft((current) => ({
      ...current,
      variants: {
        ...current.variants,
        [variantId]: { ...current.variants[variantId], ...patch },
      },
    }));

  return (
    <div className="rounded-3xl border border-[rgb(var(--border))] bg-white p-5">
      <div className="flex flex-wrap items-center gap-4">
        <span className="relative size-14 shrink-0 overflow-hidden rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface-muted))]">
          {product.imageUrl ? (
            <Image src={product.imageUrl} alt="" fill sizes="56px" className="object-cover" />
          ) : null}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{product.title}</p>
          <p className="mt-0.5 text-xs text-[rgb(var(--muted))]">
            {product.variants.length}{' '}
            {product.variants.length === 1 ? 'variant' : 'variants'}
          </p>
        </div>
        <Link
          href={`/admin/products/${product.id.split('/').pop()}`}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[rgb(var(--border-strong))] bg-white px-4 text-xs font-semibold transition hover:border-[rgb(var(--fg))]"
        >
          <PencilLine aria-hidden="true" className="size-3.5" />
          Edit details
        </Link>
        <button
          type="button"
          onClick={markAsSold}
          disabled={pending}
          className="inline-flex min-h-9 items-center rounded-full border border-[rgb(var(--border-strong))] bg-white px-4 text-xs font-semibold text-[rgb(var(--muted))] transition hover:border-[rgb(var(--accent))] hover:text-[rgb(var(--accent))] disabled:opacity-60"
        >
          Mark as sold
        </button>
        <label className="flex items-center gap-2 text-xs font-semibold">
          Status
          <select
            value={draft.status}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                status: event.target.value as PanelProduct['status'],
              }))
            }
            className="min-h-9 rounded-full border border-[rgb(var(--border-strong))] bg-white px-3 text-xs font-semibold"
          >
            {Object.entries(STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={save}
          disabled={!dirty || pending}
          className={cn(
            'min-h-9 rounded-full px-5 text-xs font-semibold transition',
            dirty
              ? 'bg-[rgb(var(--fg))] text-white hover:bg-[rgb(var(--fg))]/90'
              : 'border border-[rgb(var(--border))] text-[rgb(var(--muted))]',
            pending && 'opacity-60'
          )}
        >
          {pending ? 'Saving…' : 'Save'}
        </button>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[34rem] text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-[rgb(var(--muted))]">
              <th className="py-2 pr-4 font-semibold">Variant</th>
              <th className="py-2 pr-4 font-semibold">SKU</th>
              <th className="py-2 pr-4 font-semibold">Price (USD)</th>
              <th className="py-2 pr-4 font-semibold">Compare-at</th>
              <th className="py-2 font-semibold">Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgb(var(--border))]">
            {product.variants.map((variant) => {
              const value = draft.variants[variant.id];
              return (
                <tr key={variant.id}>
                  <td className="py-2.5 pr-4">
                    {variant.title === 'Default Title' ? '—' : variant.title}
                  </td>
                  <td className="py-2.5 pr-4 text-[rgb(var(--muted))]">
                    {variant.sku || '—'}
                  </td>
                  <td className="py-2.5 pr-4">
                    <input
                      value={value.price}
                      onChange={(event) =>
                        setVariant(variant.id, { price: event.target.value })
                      }
                      inputMode="decimal"
                      aria-label={`Price for ${product.title} ${variant.title}`}
                      className="w-24 rounded-lg border border-[rgb(var(--border-strong))] px-2 py-1.5 text-sm tabular-nums"
                    />
                  </td>
                  <td className="py-2.5 pr-4">
                    <input
                      value={value.compareAtPrice}
                      onChange={(event) =>
                        setVariant(variant.id, {
                          compareAtPrice: event.target.value,
                        })
                      }
                      inputMode="decimal"
                      placeholder="—"
                      aria-label={`Compare-at price for ${product.title} ${variant.title}`}
                      className="w-24 rounded-lg border border-[rgb(var(--border-strong))] px-2 py-1.5 text-sm tabular-nums"
                    />
                  </td>
                  <td className="py-2.5">
                    <input
                      value={value.quantity}
                      onChange={(event) =>
                        setVariant(variant.id, { quantity: event.target.value })
                      }
                      inputMode="numeric"
                      aria-label={`Stock for ${product.title} ${variant.title}`}
                      className="w-20 rounded-lg border border-[rgb(var(--border-strong))] px-2 py-1.5 text-sm tabular-nums"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {feedback ? (
        <p
          role="status"
          className={cn(
            'mt-3 text-xs font-semibold',
            feedback.ok ? 'text-[rgb(var(--sage-ink))]' : 'text-[rgb(var(--accent))]'
          )}
        >
          {feedback.text}
        </p>
      ) : null}
    </div>
  );
}

export function ProductsManager({ products }: { products: PanelProduct[] }) {
  if (products.length === 0) {
    return (
      <div className="rounded-3xl border border-[rgb(var(--border))] bg-white px-6 py-16 text-center text-sm text-[rgb(var(--muted))]">
        No products found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {products.map((product) => (
        <ProductRow key={product.id} product={product} />
      ))}
    </div>
  );
}
