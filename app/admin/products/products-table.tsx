'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { bulkUpdateProducts, bulkDeleteProducts } from './bulk-actions';
import { formatUsdCents as formatCents } from '../../../src/lib/format';

type Product = {
  id: string;
  name: string;
  slug: string;
  status: string;
  sku: string | null;
  priceCents: number;
  stockQty: number;
  createdAt: string;
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-500/15 text-green-300',
  archived: 'bg-neutral-500/15 text-neutral-400',
  draft: 'bg-yellow-500/15 text-yellow-300',
};

export function ProductsTable({ products }: { products: Product[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const allIds = products.map((p) => p.id);
  const allSelected = allIds.length > 0 && allIds.every((id) => selected.has(id));

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(allIds));
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function runBulk(action: 'activate' | 'archive' | 'draft') {
    setError(null);
    startTransition(async () => {
      const ids = Array.from(selected);
      const res = await bulkUpdateProducts(ids, action);
      if (res.error) setError(res.error);
      else setSelected(new Set());
    });
  }

  function runDelete() {
    if (!confirm(`Delete ${selected.size} product(s)? This cannot be undone.`)) return;
    setError(null);
    startTransition(async () => {
      const ids = Array.from(selected);
      const res = await bulkDeleteProducts(ids);
      if (res.error) setError(res.error);
      else setSelected(new Set());
    });
  }

  return (
    <div className="space-y-3">
      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-2.5">
          <span className="text-sm font-medium text-orange-300">
            {selected.size} selected
          </span>
          <div className="flex gap-2 ml-auto flex-wrap">
            <button
              onClick={() => runBulk('activate')}
              disabled={isPending}
              className="rounded-lg bg-green-500/15 px-3 py-1.5 text-xs font-medium text-green-300 hover:bg-green-500/25 transition disabled:opacity-50"
            >
              Set Active
            </button>
            <button
              onClick={() => runBulk('draft')}
              disabled={isPending}
              className="rounded-lg bg-yellow-500/15 px-3 py-1.5 text-xs font-medium text-yellow-300 hover:bg-yellow-500/25 transition disabled:opacity-50"
            >
              Set Draft
            </button>
            <button
              onClick={() => runBulk('archive')}
              disabled={isPending}
              className="rounded-lg bg-neutral-500/15 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:bg-neutral-500/25 transition disabled:opacity-50"
            >
              Archive
            </button>
            <button
              onClick={runDelete}
              disabled={isPending}
              className="rounded-lg bg-red-500/15 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/25 transition disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-500/15 px-4 py-3 text-sm text-red-400">{error}</div>
      )}

      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="border-b border-white/10 text-left">
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="rounded border-white/20 bg-white/10 text-orange-500 focus:ring-orange-500/30"
                />
              </th>
              <th className="px-4 py-3 text-xs font-medium text-neutral-400">Product</th>
              <th className="px-4 py-3 text-xs font-medium text-neutral-400">SKU</th>
              <th className="px-4 py-3 text-xs font-medium text-neutral-400">Status</th>
              <th className="px-4 py-3 text-xs font-medium text-neutral-400 text-right">Price</th>
              <th className="px-4 py-3 text-xs font-medium text-neutral-400 text-right">Stock</th>
              <th className="px-4 py-3 text-xs font-medium text-neutral-400">Created</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {products.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm text-neutral-500">
                  No products found.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr
                  key={p.id}
                  className={
                    'transition ' +
                    (selected.has(p.id) ? 'bg-orange-500/5' : 'hover:bg-white/[0.03]')
                  }
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(p.id)}
                      onChange={() => toggle(p.id)}
                      className="rounded border-white/20 bg-white/10 text-orange-500 focus:ring-orange-500/30"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{p.name}</div>
                    <div className="text-xs text-neutral-500">{p.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-400 font-mono">{p.sku || '—'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        'rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ' +
                        (STATUS_COLORS[p.status] ?? 'bg-neutral-500/15 text-neutral-400')
                      }
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-white">{formatCents(p.priceCents)}</td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={
                        p.stockQty <= 5
                          ? 'text-red-400 font-medium'
                          : p.stockQty <= 15
                          ? 'text-yellow-400'
                          : 'text-neutral-300'
                      }
                    >
                      {p.stockQty}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-400">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="text-xs text-orange-400 hover:text-orange-300 transition"
                    >
                      Edit →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
