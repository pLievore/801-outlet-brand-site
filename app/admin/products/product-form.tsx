'use client';

import { useActionState, useRef, useState } from 'react';
import { saveProduct } from './actions';

type ProductData = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  isFeatured: boolean;
  sku: string;
  priceCents: number;
  compareCents: number | null;
  stockQty: number;
  lowStockThreshold: number;
  imageUrl: string;
} | null;

function centsToStr(cents: number | null) {
  if (!cents) return '';
  return (cents / 100).toFixed(2);
}

export function ProductForm({ product, saved }: { product: ProductData; saved?: boolean }) {
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
  }

  function handleRemoveFile() {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  const [state, dispatch, pending] = useActionState(
    saveProduct.bind(null, product?.id ?? null),
    null,
  );
  const error = state?.error ?? null;

  return (
    <form ref={formRef} action={dispatch} className="space-y-6 max-w-2xl">
      {error && (
        <div className="rounded-xl bg-red-500/15 px-4 py-3 text-sm text-red-400">{error}</div>
      )}
      {saved && !error && (
        <div className="rounded-xl bg-green-500/15 px-4 py-3 text-sm text-green-400">
          Product saved successfully.
        </div>
      )}

      {/* Basic info */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white">Basic info</h2>

        <div>
          <label className="block text-xs text-neutral-400 mb-1.5">Name *</label>
          <input
            name="name"
            required
            defaultValue={product?.name ?? ''}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-orange-500/50 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs text-neutral-400 mb-1.5">Description</label>
          <textarea
            name="description"
            rows={4}
            defaultValue={product?.description ?? ''}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-orange-500/50 focus:outline-none resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-neutral-400 mb-1.5">Status</label>
            <select
              name="status"
              defaultValue={product?.status ?? 'draft'}
              className="w-full rounded-xl border border-white/10 bg-neutral-900 px-3 py-2.5 text-sm text-white focus:border-orange-500/50 focus:outline-none"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 text-sm text-neutral-300 cursor-pointer">
              <input
                type="checkbox"
                name="is_featured"
                defaultChecked={product?.isFeatured ?? false}
                className="rounded border-white/20 bg-white/10 text-orange-500 focus:ring-orange-500/30"
              />
              Featured product
            </label>
          </div>
        </div>
      </div>

      {/* Pricing & inventory */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white">Pricing &amp; inventory</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-neutral-400 mb-1.5">Price (USD) *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">$</span>
              <input
                name="price"
                type="number"
                step="0.01"
                min="0"
                required
                defaultValue={centsToStr(product?.priceCents ?? null)}
                className="w-full rounded-xl border border-white/10 bg-white/5 pl-7 pr-3 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-orange-500/50 focus:outline-none"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-neutral-400 mb-1.5">Compare at price</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">$</span>
              <input
                name="compare_price"
                type="number"
                step="0.01"
                min="0"
                defaultValue={centsToStr(product?.compareCents ?? null)}
                className="w-full rounded-xl border border-white/10 bg-white/5 pl-7 pr-3 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-orange-500/50 focus:outline-none"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-neutral-400 mb-1.5">SKU *</label>
            <input
              name="sku"
              required
              defaultValue={product?.sku ?? ''}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white font-mono placeholder-neutral-500 focus:border-orange-500/50 focus:outline-none"
              placeholder="PRD-001"
            />
          </div>

          <div>
            <label className="block text-xs text-neutral-400 mb-1.5">Stock qty</label>
            <input
              name="stock_qty"
              type="number"
              min="0"
              defaultValue={product?.stockQty ?? 0}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-orange-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-neutral-400 mb-1.5">Low stock alert</label>
            <input
              name="low_stock_threshold"
              type="number"
              min="0"
              defaultValue={product?.lowStockThreshold ?? 5}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-orange-500/50 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Image */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white">Primary image</h2>

        {/* Preview */}
        {(preview || product?.imageUrl) && (
          <div className="relative w-fit">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview ?? product!.imageUrl}
              alt=""
              className="h-36 w-36 rounded-xl object-cover border border-white/10"
            />
            {preview && (
              <button
                type="button"
                onClick={handleRemoveFile}
                className="absolute -top-2 -right-2 rounded-full bg-neutral-800 border border-white/10 p-0.5 text-neutral-400 hover:text-white transition"
                title="Remove selected file"
              >
                <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Upload zone */}
        <div>
          <input
            ref={fileInputRef}
            name="image_file"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            className="hidden"
            id="image_file_input"
          />
          <label
            htmlFor="image_file_input"
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/[0.03] px-4 py-6 text-center transition hover:border-orange-500/40 hover:bg-white/[0.05]"
          >
            <svg className="size-7 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <span className="text-sm text-neutral-400">
              {preview ? 'Change image' : 'Click to upload'}
            </span>
            <span className="text-xs text-neutral-600">JPG, PNG, WebP · max 5 MB</span>
          </label>
        </div>

        {/* URL fallback */}
        <div>
          <label className="block text-xs text-neutral-500 mb-1.5">Or paste image URL</label>
          <input
            name="image_url"
            type="url"
            defaultValue={product?.imageUrl ?? ''}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-orange-500/50 focus:outline-none"
            placeholder="https://…"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-400 transition disabled:opacity-60"
        >
          {pending ? 'Saving…' : 'Save product'}
        </button>
        <a
          href="/admin/products"
          className="rounded-full border border-white/10 px-6 py-2.5 text-sm font-medium text-neutral-300 hover:text-white hover:border-white/20 transition"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
