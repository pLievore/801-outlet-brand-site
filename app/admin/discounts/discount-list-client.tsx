'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Copy, Check, Edit2, Plus, Tag, Trash2, Search } from 'lucide-react';

import type { AdminDiscountItem } from '../../../src/lib/shopify-admin/discounts';
import { deleteDiscountAction } from './actions';
import { buttonStyles } from '../../components/ui/button';

export function DiscountListClient({
  discounts,
}: {
  discounts: AdminDiscountItem[];
}) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'EXPIRED' | 'SCHEDULED'>('ALL');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDelete = (id: string, code: string) => {
    if (confirm(`Are you sure you want to permanently delete coupon "${code}" from Shopify?`)) {
      setDeletingId(id);
      startTransition(async () => {
        const res = await deleteDiscountAction(id);
        setDeletingId(null);
        if (!res.ok) {
          alert(res.error ?? 'Failed to delete coupon.');
        }
      });
    }
  };

  const filtered = discounts.filter((d) => {
    if (filter !== 'ALL' && d.status !== filter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return d.code.toLowerCase().includes(q) || d.title.toLowerCase().includes(q);
  });

  const dateFormat = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Denver',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="space-y-4">
      {/* Search & filter controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative min-w-0 flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[rgb(var(--muted))]" />
          <input
            type="search"
            placeholder="Search coupon by code or title…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-[rgb(var(--border))] bg-white pl-10 pr-4 py-2 text-xs transition focus:border-[rgb(var(--accent))] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--accent))]"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'ACTIVE', 'SCHEDULED', 'EXPIRED'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(status)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                filter === status
                  ? 'bg-[rgb(var(--fg))] text-white'
                  : 'bg-[rgb(var(--surface-muted))] text-[rgb(var(--muted))] hover:bg-neutral-200'
              }`}
            >
              {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[rgb(var(--border))] bg-white p-12 text-center">
          <Tag className="size-10 text-[rgb(var(--muted))] stroke-[1.5]" />
          <h3 className="mt-4 text-base font-semibold">No discount coupons found</h3>
          <p className="mt-1 text-xs text-[rgb(var(--muted))] max-w-sm">
            {search || filter !== 'ALL'
              ? 'No coupons match your filter criteria. Try clearing search filters.'
              : 'Create promotional coupons for holidays, new shoppers, or showroom events.'}
          </p>
          <Link
            href="/admin/discounts/new"
            className={buttonStyles({
              variant: 'primary',
              size: 'sm',
              className: 'mt-5 gap-1.5',
            })}
          >
            <Plus className="size-4" /> Create coupon
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[rgb(var(--border))] bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[rgb(var(--border))] bg-[rgb(var(--surface-muted))] font-semibold uppercase tracking-wider text-[rgb(var(--muted))]">
                <tr>
                  <th className="px-5 py-3">Code / Title</th>
                  <th className="px-5 py-3">Discount Value</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Expiration Date</th>
                  <th className="px-5 py-3">Usage</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgb(var(--border))]">
                {filtered.map((discount) => {
                  const isExp = discount.status === 'EXPIRED';
                  const isAct = discount.status === 'ACTIVE';

                  return (
                    <tr key={discount.id} className="transition hover:bg-neutral-50/50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm tracking-wider text-[rgb(var(--fg))]">
                            {discount.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(discount.code)}
                            className="rounded p-1 text-[rgb(var(--muted))] transition hover:text-[rgb(var(--fg))]"
                            title="Copy code"
                          >
                            {copiedCode === discount.code ? (
                              <Check className="size-3.5 text-green-600" />
                            ) : (
                              <Copy className="size-3.5" />
                            )}
                          </button>
                        </div>
                        <p className="mt-0.5 text-xs text-[rgb(var(--muted))] line-clamp-1">
                          {discount.title}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-lg bg-[rgb(var(--sage-soft))] px-2.5 py-1 font-bold text-[rgb(var(--sage-ink))]">
                          {discount.discountType === 'percentage'
                            ? `${discount.value}% OFF`
                            : `$${discount.value.toFixed(2)} OFF`}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
                            isAct
                              ? 'bg-[rgb(var(--sage-soft))] text-[rgb(var(--sage-ink))]'
                              : isExp
                                ? 'bg-neutral-100 text-neutral-600'
                                : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {discount.status.toLowerCase()}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-[rgb(var(--muted))]">
                        {discount.endsAt ? (
                          <span>{dateFormat.format(new Date(discount.endsAt))}</span>
                        ) : (
                          <span className="italic text-neutral-400">No expiration</span>
                        )}
                      </td>

                      <td className="px-5 py-4 font-semibold text-[rgb(var(--fg))]">
                        {discount.usageLimit ? (
                          <span>
                            {discount.usageCount} / {discount.usageLimit} uses
                          </span>
                        ) : (
                          <span>{discount.usageCount} uses (unlimited)</span>
                        )}
                        {discount.appliesOncePerCustomer ? (
                          <span className="block text-[10px] text-[rgb(var(--muted))] font-normal">
                            1 per customer
                          </span>
                        ) : null}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/discounts/${discount.id.split('/').pop()}`}
                            className="rounded-lg p-1.5 text-[rgb(var(--muted))] transition hover:bg-neutral-100 hover:text-[rgb(var(--fg))]"
                            title="Edit coupon"
                          >
                            <Edit2 className="size-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(discount.id, discount.code)}
                            disabled={isPending && deletingId === discount.id}
                            className="rounded-lg p-1.5 text-[rgb(var(--muted))] transition hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                            title="Delete coupon"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
