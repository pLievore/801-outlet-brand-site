'use client';

import { useRef, useState, useTransition } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftCircle,
  ArrowRightCircle,
  ClipboardCopy,
  ImagePlus,
  Loader2,
  Trash2,
} from 'lucide-react';

import type { PanelProductDetail } from '../../../../src/lib/panel/products';
import {
  COMING_SOON_TAG_VALUE,
  hasComingSoonTag,
} from '../../../../src/lib/catalog/availability';
import { cn } from '../../../../src/lib/cn';
import { uploadProductImageAction } from '../new/actions';
import { resizeImage } from '../image-resize';
import { DrivePickerButton } from '../drive-picker';
import { saveProductAction } from '../actions';
import {
  addMediaAction,
  removeMediaAction,
  reorderMediaAction,
  saveDetailsAction,
} from './actions';

type Feedback = { ok: boolean; text: string } | null;

type VariantDraft = { price: string; compareAtPrice: string; quantity: string };

const STATUS_LABEL: Record<PanelProductDetail['status'], string> = {
  ACTIVE: 'Active',
  DRAFT: 'Draft',
  ARCHIVED: 'Archived',
};

function initialVariants(
  product: PanelProductDetail
): Record<string, VariantDraft> {
  return Object.fromEntries(
    product.variants.map((variant) => [
      variant.id,
      {
        price: variant.price,
        compareAtPrice: variant.compareAtPrice ?? '',
        quantity: String(variant.inventoryQuantity),
      },
    ])
  );
}

export function ProductEditor({ product }: { product: PanelProductDetail }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [title, setTitle] = useState(product.title);
  const [description, setDescription] = useState(product.descriptionText);
  const [tags, setTags] = useState(product.tags.join(', '));
  const [mediaOrder, setMediaOrder] = useState(product.media);
  const [detailsFeedback, setDetailsFeedback] = useState<Feedback>(null);
  const [mediaFeedback, setMediaFeedback] = useState<Feedback>(null);
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [savingDetails, startDetails] = useTransition();
  const [mutatingMedia, startMedia] = useTransition();

  const [status, setStatus] = useState(product.status);
  const [variants, setVariants] = useState(() => initialVariants(product));
  const [sellingFeedback, setSellingFeedback] = useState<Feedback>(null);
  const [savingSelling, startSelling] = useTransition();

  const tagList = tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
  const comingSoon = hasComingSoonTag(tagList);

  const detailsDirty =
    title !== product.title ||
    description !== product.descriptionText ||
    tags !== product.tags.join(', ');

  /**
   * The one tag the storefront reads, offered as a switch so nobody has to
   * remember how to spell it. Off simply removes every spelling of it.
   */
  const toggleComingSoon = () => {
    const without = tagList.filter((tag) => !hasComingSoonTag([tag]));
    setTags(
      (comingSoon ? without : [...without, COMING_SOON_TAG_VALUE]).join(', ')
    );
  };

  const statusChanged = status !== product.status;
  const variantChanges = product.variants.map((variant) => {
    const value = variants[variant.id];
    return {
      variant,
      value,
      pricingChanged:
        value.price !== variant.price ||
        value.compareAtPrice !== (variant.compareAtPrice ?? ''),
      quantityChanged: value.quantity !== String(variant.inventoryQuantity),
    };
  });
  const sellingDirty =
    statusChanged ||
    variantChanges.some(
      (entry) => entry.pricingChanged || entry.quantityChanged
    );

  const setVariant = (id: string, patch: Partial<VariantDraft>) => {
    setVariants((current) => ({ ...current, [id]: { ...current[id], ...patch } }));
    setSellingFeedback(null);
  };

  const saveSelling = () => {
    setSellingFeedback(null);
    startSelling(async () => {
      const result = await saveProductAction({
        productId: product.id,
        status,
        statusChanged,
        variants: variantChanges.map(
          ({ variant, value, pricingChanged, quantityChanged }) => ({
            id: variant.id,
            inventoryItemId: variant.inventoryItemId,
            price: value.price,
            compareAtPrice: value.compareAtPrice,
            quantity: Number(value.quantity),
            pricingChanged,
            quantityChanged,
          })
        ),
      });
      setSellingFeedback(
        result.ok
          ? { ok: true, text: 'Saved.' }
          : { ok: false, text: result.error ?? 'Failed.' }
      );
      if (result.ok) router.refresh();
    });
  };

  const saveDetails = () => {
    setDetailsFeedback(null);
    startDetails(async () => {
      const result = await saveDetailsAction({
        productId: product.id,
        title,
        description,
        tags: tagList,
      });
      setDetailsFeedback(
        result.ok
          ? { ok: true, text: 'Saved.' }
          : { ok: false, text: result.error ?? 'Failed.' }
      );
      if (result.ok) router.refresh();
    });
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= mediaOrder.length) return;
    const next = [...mediaOrder];
    [next[index], next[target]] = [next[target], next[index]];
    setMediaOrder(next);
    setMediaFeedback(null);
    startMedia(async () => {
      const result = await reorderMediaAction({
        productId: product.id,
        orderedMediaIds: next.map((media) => media.id),
      });
      if (!result.ok) {
        setMediaOrder(mediaOrder);
        setMediaFeedback({ ok: false, text: result.error ?? 'Failed.' });
      } else {
        router.refresh();
      }
    });
  };

  const remove = (mediaId: string) => {
    if (!window.confirm('Remove this photo? This cannot be undone.')) return;
    setMediaFeedback(null);
    startMedia(async () => {
      const result = await removeMediaAction({ productId: product.id, mediaId });
      if (result.ok) {
        setMediaOrder((current) =>
          current.filter((media) => media.id !== mediaId)
        );
        router.refresh();
      } else {
        setMediaFeedback({ ok: false, text: result.error ?? 'Failed.' });
      }
    });
  };

  async function addPhotos(list: FileList | File[] | null) {
    if (!list || list.length === 0) return;
    const files = [...list]
      .filter((file) => /^image\/(jpeg|png|webp)$/.test(file.type))
      .slice(0, 12);
    if (files.length === 0) return;

    setMediaFeedback(null);
    try {
      const resourceUrls: string[] = [];
      for (let index = 0; index < files.length; index += 1) {
        setUploading(`Uploading photo ${index + 1} of ${files.length}…`);
        const resized = await resizeImage(files[index]);
        const formData = new FormData();
        formData.append('file', resized);
        const upload = await uploadProductImageAction(formData);
        if (!upload.ok || !upload.resourceUrl) {
          setMediaFeedback({
            ok: false,
            text: upload.error ?? 'Photo upload failed.',
          });
          return;
        }
        resourceUrls.push(upload.resourceUrl);
      }

      setUploading('Attaching photos…');
      const result = await addMediaAction({
        productId: product.id,
        resourceUrls,
      });
      if (result.ok) {
        setMediaFeedback({
          ok: true,
          text: 'Photos added. Shopify takes a few seconds to process them — refresh if they do not appear yet.',
        });
        router.refresh();
      } else {
        setMediaFeedback({ ok: false, text: result.error ?? 'Failed.' });
      }
    } finally {
      setUploading(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  const copyListing = async () => {
    const price = product.variants[0]?.price;
    const lines = [
      product.title,
      '',
      price ? `$${price}` : null,
      '',
      description.trim() || null,
      '',
      `More photos & secure checkout: https://801outlet.com/products/${product.handle}`,
    ].filter((line): line is string => line !== null);
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setMediaFeedback({
        ok: false,
        text: 'Could not access the clipboard on this device.',
      });
    }
  };

  const inputClass =
    'w-full rounded-xl border border-[rgb(var(--border-strong))] bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[rgb(var(--accent))] focus:ring-2 focus:ring-[rgb(var(--accent))]/15';

  return (
    <div className="space-y-6">
      {/* Details */}
      <section className="rounded-3xl border border-[rgb(var(--border))] bg-white p-5 md:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-bold">Details</h2>
          <button
            type="button"
            onClick={saveDetails}
            disabled={!detailsDirty || savingDetails}
            className={cn(
              'min-h-9 rounded-full px-5 text-xs font-semibold transition',
              detailsDirty
                ? 'bg-[rgb(var(--fg))] text-white hover:bg-[rgb(var(--fg))]/90'
                : 'border border-[rgb(var(--border))] text-[rgb(var(--muted))]',
              savingDetails && 'opacity-60'
            )}
          >
            {savingDetails ? 'Saving…' : 'Save details'}
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <label className="block text-xs font-semibold">
            Title
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={255}
              className={cn(inputClass, 'mt-1.5')}
            />
          </label>
          <label className="block text-xs font-semibold">
            Description
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={6}
              maxLength={10000}
              placeholder="Blank line = new paragraph."
              className={cn(inputClass, 'mt-1.5 leading-6')}
            />
          </label>

          <div>
            <label className="block text-xs font-semibold">
              Tags
              <input
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                placeholder="sectional, clearance"
                className={cn(inputClass, 'mt-1.5')}
              />
            </label>
            <p className="mt-1.5 text-[11px] text-[rgb(var(--muted))]">
              Separate with commas.
            </p>

            <label className="mt-3 flex items-start gap-2.5 rounded-xl bg-[rgb(var(--surface-muted))] px-3 py-2.5">
              <input
                type="checkbox"
                checked={comingSoon}
                onChange={toggleComingSoon}
                className="mt-0.5 size-4"
              />
              <span className="text-xs">
                <span className="font-semibold">Coming soon</span>
                <span className="block text-[11px] leading-relaxed text-[rgb(var(--muted))]">
                  Shown instead of &ldquo;Sold out&rdquo; while the product is
                  out of stock. With stock available it sells as normal.
                </span>
              </span>
            </label>
          </div>
        </div>

        {detailsFeedback ? (
          <p
            role="status"
            className={cn(
              'mt-3 text-xs font-semibold',
              detailsFeedback.ok
                ? 'text-[rgb(var(--sage-ink))]'
                : 'text-[rgb(var(--accent))]'
            )}
          >
            {detailsFeedback.text}
          </p>
        ) : null}
      </section>

      {/* Price, stock and status */}
      <section className="rounded-3xl border border-[rgb(var(--border))] bg-white p-5 md:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold">Price &amp; stock</h2>
            <p className="mt-0.5 text-xs text-[rgb(var(--muted))]">
              Stock is what decides Sold out on the storefront.
            </p>
          </div>
          <button
            type="button"
            onClick={saveSelling}
            disabled={!sellingDirty || savingSelling}
            className={cn(
              'min-h-9 rounded-full px-5 text-xs font-semibold transition',
              sellingDirty
                ? 'bg-[rgb(var(--fg))] text-white hover:bg-[rgb(var(--fg))]/90'
                : 'border border-[rgb(var(--border))] text-[rgb(var(--muted))]',
              savingSelling && 'opacity-60'
            )}
          >
            {savingSelling ? 'Saving…' : 'Save price & stock'}
          </button>
        </div>

        <label className="mt-4 block text-xs font-semibold sm:max-w-56">
          Status
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as PanelProductDetail['status']);
              setSellingFeedback(null);
            }}
            className={cn(inputClass, 'mt-1.5')}
          >
            {(
              Object.keys(STATUS_LABEL) as Array<PanelProductDetail['status']>
            ).map((value) => (
              <option key={value} value={value}>
                {STATUS_LABEL[value]}
              </option>
            ))}
          </select>
        </label>

        <div className="mt-4 space-y-4">
          {product.variants.map((variant) => (
            <div
              key={variant.id}
              className="rounded-2xl bg-[rgb(var(--surface-muted))] p-3.5"
            >
              {product.variants.length > 1 ||
              variant.title !== 'Default Title' ? (
                <div className="mb-2.5 text-xs font-semibold">
                  {variant.title}
                </div>
              ) : null}
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="block text-[11px] font-semibold">
                  Price
                  <input
                    inputMode="decimal"
                    value={variants[variant.id].price}
                    onChange={(event) =>
                      setVariant(variant.id, { price: event.target.value })
                    }
                    className={cn(inputClass, 'mt-1')}
                  />
                </label>
                <label className="block text-[11px] font-semibold">
                  Compare at
                  <input
                    inputMode="decimal"
                    placeholder="none"
                    value={variants[variant.id].compareAtPrice}
                    onChange={(event) =>
                      setVariant(variant.id, {
                        compareAtPrice: event.target.value,
                      })
                    }
                    className={cn(inputClass, 'mt-1')}
                  />
                </label>
                <label className="block text-[11px] font-semibold">
                  Stock
                  <input
                    inputMode="numeric"
                    value={variants[variant.id].quantity}
                    onChange={(event) =>
                      setVariant(variant.id, { quantity: event.target.value })
                    }
                    className={cn(inputClass, 'mt-1')}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>

        {sellingFeedback ? (
          <p
            role="status"
            className={cn(
              'mt-3 text-xs font-semibold',
              sellingFeedback.ok
                ? 'text-[rgb(var(--sage-ink))]'
                : 'text-[rgb(var(--accent))]'
            )}
          >
            {sellingFeedback.text}
          </p>
        ) : null}
      </section>

      {/* Photos */}
      <section className="rounded-3xl border border-[rgb(var(--border))] bg-white p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold">Photos</h2>
            <p className="mt-0.5 text-xs text-[rgb(var(--muted))]">
              The first photo is the cover shown across the store.
            </p>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading !== null}
            className="inline-flex min-h-9 items-center gap-2 rounded-full bg-[rgb(var(--fg))] px-4 text-xs font-semibold text-white transition hover:bg-[rgb(var(--fg))]/90 disabled:opacity-60"
          >
            {uploading ? (
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            ) : (
              <ImagePlus aria-hidden="true" className="size-4" />
            )}
            {uploading ?? 'Add photos'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(event) => void addPhotos(event.target.files)}
          />
          <DrivePickerButton
            max={12}
            disabled={uploading !== null}
            onPick={(files) => void addPhotos(files)}
          />
        </div>

        {mediaOrder.length === 0 ? (
          <p className="mt-5 text-sm text-[rgb(var(--muted))]">
            No photos yet — add the first one above.
          </p>
        ) : (
          <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {mediaOrder.map((media, index) => (
              <li
                key={media.id}
                className="group relative overflow-hidden rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--surface-muted))]"
              >
                <div className="relative aspect-square">
                  {media.imageUrl ? (
                    <Image
                      src={media.imageUrl}
                      alt={media.alt ?? ''}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-[rgb(var(--muted))]">
                      Processing…
                    </div>
                  )}
                  {index === 0 ? (
                    <span className="absolute left-2 top-2 rounded-full bg-[rgb(var(--fg))]/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                      Cover
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center justify-between gap-1 p-2">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={index === 0 || mutatingMedia}
                      aria-label="Move photo earlier"
                      className="flex size-8 items-center justify-center rounded-lg text-[rgb(var(--muted))] transition hover:bg-[rgb(var(--surface-muted))] hover:text-[rgb(var(--fg))] disabled:opacity-30"
                    >
                      <ArrowLeftCircle aria-hidden="true" className="size-4.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={index === mediaOrder.length - 1 || mutatingMedia}
                      aria-label="Move photo later"
                      className="flex size-8 items-center justify-center rounded-lg text-[rgb(var(--muted))] transition hover:bg-[rgb(var(--surface-muted))] hover:text-[rgb(var(--fg))] disabled:opacity-30"
                    >
                      <ArrowRightCircle aria-hidden="true" className="size-4.5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(media.id)}
                    disabled={mutatingMedia}
                    aria-label="Remove photo"
                    className="flex size-8 items-center justify-center rounded-lg text-[rgb(var(--muted))] transition hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                  >
                    <Trash2 aria-hidden="true" className="size-4.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {mediaFeedback ? (
          <p
            role="status"
            className={cn(
              'mt-3 text-xs font-semibold',
              mediaFeedback.ok
                ? 'text-[rgb(var(--sage-ink))]'
                : 'text-[rgb(var(--accent))]'
            )}
          >
            {mediaFeedback.text}
          </p>
        ) : null}
      </section>

      {/* Marketplace listing pack */}
      <section className="rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--sage-soft))]/50 p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold">Facebook Marketplace</h2>
            <p className="mt-0.5 max-w-md text-xs leading-5 text-[rgb(var(--muted))]">
              Copies a ready-to-paste listing — title, price, description and
              the product link. Save the photos above straight from this page.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void copyListing()}
            className="inline-flex min-h-9 items-center gap-2 rounded-full bg-[rgb(var(--sage-ink))] px-4 text-xs font-semibold text-white transition hover:bg-[rgb(var(--sage-ink))]/90"
          >
            <ClipboardCopy aria-hidden="true" className="size-4" />
            {copied ? 'Copied!' : 'Copy listing text'}
          </button>
        </div>
      </section>
    </div>
  );
}
