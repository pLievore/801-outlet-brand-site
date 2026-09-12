'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Flame,
  Mail,
  MessageSquare,
  Phone,
  Search,
  ShoppingCart,
  Trash2,
  Users,
} from 'lucide-react';

import { HAPTIC, haptic } from '../../../src/lib/haptics';
import type { LeadRecord, LeadStatus } from '../../../src/lib/leads/types';
import { buttonStyles } from '../../components/ui/button';

export function LeadListClient({ initialLeads }: { initialLeads: LeadRecord[] }) {
  const [leads, setLeads] = useState<LeadRecord[]>(initialLeads);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | LeadStatus>('ALL');
  const [cartFilter, setCartFilter] = useState<'ALL' | 'HAS_CART' | 'PHONE' | 'EMAIL'>('ALL');
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleCopy = (lead: LeadRecord) => {
    const summary = [
      `Lead: ${lead.contact} (${lead.channel.toUpperCase()})`,
      `Status: ${lead.status.toUpperCase()}`,
      lead.topProduct
        ? `Top Interest: ${lead.topProduct.title} (${lead.topProduct.viewCount} views)`
        : 'No views yet',
      lead.cart?.hasItems
        ? `Cart: ${lead.cart.totalQuantity} items ($${lead.cart.totalAmount})`
        : 'Cart: Empty',
    ].join('\n');

    navigator.clipboard.writeText(summary);
    haptic(HAPTIC.tap);
    setCopiedId(lead.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStatusChange = (id: string, newStatus: LeadStatus) => {
    haptic(HAPTIC.tap);
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
    );

    startTransition(async () => {
      try {
        await fetch('/api/leads', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, status: newStatus }),
        });
      } catch {}
    });
  };

  const handleDelete = (id: string, contact: string) => {
    if (confirm(`Delete lead "${contact}"?`)) {
      haptic(HAPTIC.undo);
      setDeletingId(id);
      setLeads((prev) => prev.filter((l) => l.id !== id));

      startTransition(async () => {
        try {
          await fetch(`/api/leads?id=${encodeURIComponent(id)}`, {
            method: 'DELETE',
          });
        } catch {}
        setDeletingId(null);
      });
    }
  };

  const filtered = leads.filter((lead) => {
    if (statusFilter !== 'ALL' && lead.status !== statusFilter) return false;
    if (cartFilter === 'HAS_CART' && !lead.cart?.hasItems) return false;
    if (cartFilter === 'PHONE' && lead.channel !== 'phone') return false;
    if (cartFilter === 'EMAIL' && lead.channel !== 'email') return false;

    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const matchContact = lead.contact.toLowerCase().includes(q);
    const matchProduct = lead.views.some((v) =>
      v.title.toLowerCase().includes(q)
    );
    return matchContact || matchProduct;
  });

  const totalViewsAcrossLeads = leads.reduce((acc, l) => acc + l.totalViews, 0);
  const leadsWithCart = leads.filter((l) => l.cart?.hasItems).length;

  // Find top product overall across all leads
  const productViewTally: Record<string, { title: string; count: number }> = {};
  for (const lead of leads) {
    for (const v of lead.views) {
      if (!productViewTally[v.handle]) {
        productViewTally[v.handle] = { title: v.title, count: 0 };
      }
      productViewTally[v.handle].count += v.viewCount;
    }
  }

  const topOverallProduct = Object.values(productViewTally).sort(
    (a, b) => b.count - a.count
  )[0];

  const dateFormat = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Denver',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Top KPI Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-2xl border border-[rgb(var(--border))] bg-white p-4">
          <span className="text-xs font-semibold text-[rgb(var(--muted))]">
            Total Leads
          </span>
          <p className="mt-2 text-2xl font-bold tracking-tight text-[rgb(var(--fg))] sm:text-3xl">
            {leads.length}
          </p>
        </div>

        <div className="rounded-2xl border border-[rgb(var(--border))] bg-white p-4">
          <span className="text-xs font-semibold text-emerald-800">
            Added to Cart (High Intent)
          </span>
          <p className="mt-2 text-2xl font-bold tracking-tight text-emerald-700 sm:text-3xl">
            {leadsWithCart}
          </p>
        </div>

        <div className="rounded-2xl border border-[rgb(var(--border))] bg-white p-4">
          <span className="text-xs font-semibold text-[rgb(var(--muted))]">
            Product Views Tracked
          </span>
          <p className="mt-2 text-2xl font-bold tracking-tight text-[rgb(var(--fg))] sm:text-3xl">
            {totalViewsAcrossLeads}
          </p>
        </div>

        <div className="rounded-2xl border border-[rgb(var(--border))] bg-white p-4">
          <span className="text-xs font-semibold text-[rgb(var(--accent))]">
            Top Viewed Sofa
          </span>
          <p className="mt-2 truncate text-sm font-bold text-[rgb(var(--fg))]">
            {topOverallProduct ? topOverallProduct.title : '—'}
          </p>
          {topOverallProduct ? (
            <span className="text-[11px] text-[rgb(var(--muted))]">
              {topOverallProduct.count} total views
            </span>
          ) : null}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[rgb(var(--border))] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[rgb(var(--muted))]" />
          <input
            type="text"
            placeholder="Search leads by contact or sofa name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-[rgb(var(--border))] bg-neutral-50/50 pl-10 pr-4 text-xs font-medium outline-none transition focus:border-[rgb(var(--accent))] focus:bg-white"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(['ALL', 'new', 'contacted', 'converted'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => {
                setStatusFilter(st);
                haptic(HAPTIC.tap);
              }}
              className={
                'rounded-lg px-2.5 py-1.5 text-xs font-bold transition ' +
                (statusFilter === st
                  ? 'bg-[rgb(var(--fg))] text-white'
                  : 'bg-neutral-100 text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))]')
              }
            >
              {st === 'ALL'
                ? 'All Status'
                : st === 'new'
                  ? 'New'
                  : st === 'contacted'
                    ? 'Contacted'
                    : 'Converted'}
            </button>
          ))}

          <span className="hidden text-[rgb(var(--border-strong))] sm:inline">|</span>

          {(['ALL', 'HAS_CART', 'PHONE', 'EMAIL'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => {
                setCartFilter(filter);
                haptic(HAPTIC.tap);
              }}
              className={
                'rounded-lg px-2.5 py-1.5 text-xs font-bold transition ' +
                (cartFilter === filter
                  ? 'bg-[rgb(var(--accent))] text-white'
                  : 'bg-neutral-100 text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))]')
              }
            >
              {filter === 'ALL'
                ? 'All Channels'
                : filter === 'HAS_CART'
                  ? '🛒 In Cart'
                  : filter === 'PHONE'
                    ? '📱 Phone'
                    : '✉️ Email'}
            </button>
          ))}
        </div>
      </div>

      {/* Leads List */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[rgb(var(--border-strong))] bg-white p-12 text-center">
          <Users className="mx-auto size-10 text-[rgb(var(--muted))]" />
          <h3 className="mt-3 text-sm font-bold text-[rgb(var(--fg))]">
            No leads found
          </h3>
          <p className="mt-1 text-xs text-[rgb(var(--muted))]">
            {leads.length === 0
              ? 'Leads captured via the $50 welcome discount modal or browsing will appear here automatically.'
              : 'Try changing your search query or filters.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((lead) => {
            const isExpanded = expandedLeadId === lead.id;
            const topProd = lead.topProduct;
            const smsMessage = encodeURIComponent(
              `Hi! This is 801 Outlet in South Salt Lake. We noticed you've been checking out the ${
                topProd?.title ?? 'furniture pieces'
              } on our site! Would you like to test-sit it in our showroom this weekend or have any questions about Utah delivery? Your $50 off coupon WELCOME50 is ready!`
            );
            const smsHref =
              lead.channel === 'phone'
                ? `sms:${lead.contact}?&body=${smsMessage}`
                : undefined;
            const telHref =
              lead.channel === 'phone' ? `tel:${lead.contact}` : undefined;
            const mailtoHref =
              lead.channel === 'email'
                ? `mailto:${lead.contact}?subject=${encodeURIComponent(
                    'Your $50 Off Coupon & Furniture Question - 801 Outlet'
                  )}`
                : undefined;

            return (
              <div
                key={lead.id}
                className="overflow-hidden rounded-2xl border border-[rgb(var(--border))] bg-white shadow-xs transition hover:border-[rgb(var(--border-strong))]"
              >
                {/* Main Card Row */}
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    {/* Left: Contact Info & Status */}
                    <div className="flex items-start gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-sm font-bold text-[rgb(var(--fg))]">
                        {lead.channel === 'phone' ? (
                          <Phone className="size-4 text-[rgb(var(--accent))]" />
                        ) : (
                          <Mail className="size-4 text-[rgb(var(--sage-ink))]" />
                        )}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-sm font-bold text-[rgb(var(--fg))]">
                            {lead.contact}
                          </span>
                          <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] font-bold uppercase text-[rgb(var(--muted))]">
                            {lead.channel}
                          </span>

                          {/* Status Dropdown */}
                          <select
                            value={lead.status}
                            onChange={(e) =>
                              handleStatusChange(
                                lead.id,
                                e.target.value as LeadStatus
                              )
                            }
                            aria-label={`Lead status for ${lead.contact}`}
                            className={
                              'rounded-md px-2 py-0.5 text-[11px] font-bold outline-none ' +
                              (lead.status === 'new'
                                ? 'bg-amber-100 text-amber-900'
                                : lead.status === 'contacted'
                                  ? 'bg-blue-100 text-blue-900'
                                  : lead.status === 'converted'
                                    ? 'bg-emerald-100 text-emerald-900'
                                    : 'bg-neutral-100 text-neutral-700')
                            }
                          >
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="converted">Converted</option>
                            <option value="archived">Archived</option>
                          </select>
                        </div>

                        <p className="mt-1 text-xs text-[rgb(var(--muted))]">
                          Captured {dateFormat.format(new Date(lead.createdAt))}
                          {lead.updatedAt !== lead.createdAt ? (
                            <span>
                              {' '}
                              · Active {dateFormat.format(new Date(lead.updatedAt))}
                            </span>
                          ) : null}
                        </p>
                      </div>
                    </div>

                    {/* Middle: Top Interest Product Highlight */}
                    <div className="flex flex-1 items-center gap-3 rounded-xl border border-neutral-100 bg-neutral-50/70 p-2.5 lg:max-w-md">
                      {topProd?.image ? (
                        <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-white">
                          <Image
                            src={topProd.image}
                            alt=""
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-neutral-200 text-[10px] text-[rgb(var(--muted))]">
                          Sofa
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <span className="block text-[10px] font-bold uppercase tracking-wide text-[rgb(var(--muted))]">
                          Top Interest
                        </span>
                        <p className="truncate text-xs font-bold text-[rgb(var(--fg))]">
                          {topProd ? topProd.title : 'General catalog browsing'}
                        </p>
                        <div className="mt-0.5 flex items-center gap-2 text-[11px]">
                          {topProd?.price ? (
                            <span className="font-semibold text-[rgb(var(--fg))]">
                              {topProd.price}
                            </span>
                          ) : null}
                          {topProd ? (
                            <span className="inline-flex items-center gap-1 font-bold text-amber-600">
                              <Flame className="size-3" />
                              {topProd.viewCount}{' '}
                              {topProd.viewCount === 1 ? 'view' : 'views'}
                            </span>
                          ) : (
                            <span className="text-[rgb(var(--muted))]">
                              {lead.totalViews} views total
                            </span>
                          )}
                        </div>
                      </div>

                      {topProd ? (
                        <Link
                          href={`/products/${topProd.handle}`}
                          target="_blank"
                          className="rounded-lg p-1.5 text-[rgb(var(--muted))] hover:bg-white hover:text-[rgb(var(--fg))]"
                          title="View product page"
                        >
                          <ExternalLink className="size-4" />
                        </Link>
                      ) : null}
                    </div>

                    {/* Right: Cart Status & Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Cart Indicator */}
                      {lead.cart?.hasItems ? (
                        <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">
                          <ShoppingCart className="size-3.5" />
                          <span>
                            {lead.cart.totalQuantity} in cart ($
                            {lead.cart.totalAmount})
                          </span>
                        </div>
                      ) : (
                        <span className="rounded-xl border border-[rgb(var(--border))] px-2.5 py-1.5 text-[11px] font-medium text-[rgb(var(--muted))]">
                          No cart items
                        </span>
                      )}

                      {/* Quick Follow-up Buttons */}
                      {smsHref ? (
                        <a
                          href={smsHref}
                          className={buttonStyles({
                            variant: 'primary',
                            size: 'sm',
                            className: 'gap-1.5 bg-emerald-600 hover:bg-emerald-700',
                          })}
                        >
                          <MessageSquare className="size-3.5" /> SMS
                        </a>
                      ) : null}

                      {telHref ? (
                        <a
                          href={telHref}
                          className={buttonStyles({
                            variant: 'secondary',
                            size: 'sm',
                            className: 'gap-1.5',
                          })}
                        >
                          <Phone className="size-3.5" /> Call
                        </a>
                      ) : null}

                      {mailtoHref ? (
                        <a
                          href={mailtoHref}
                          className={buttonStyles({
                            variant: 'secondary',
                            size: 'sm',
                            className: 'gap-1.5',
                          })}
                        >
                          <Mail className="size-3.5" /> Email
                        </a>
                      ) : null}

                      {/* Copy Info Button */}
                      <button
                        type="button"
                        onClick={() => handleCopy(lead)}
                        className="rounded-lg border border-[rgb(var(--border))] p-2 text-[rgb(var(--muted))] transition hover:bg-neutral-50 hover:text-[rgb(var(--fg))]"
                        title="Copy lead info"
                      >
                        {copiedId === lead.id ? (
                          <Check className="size-4 text-emerald-600" />
                        ) : (
                          <Copy className="size-4" />
                        )}
                      </button>

                      {/* Expand Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setExpandedLeadId(isExpanded ? null : lead.id);
                          haptic(HAPTIC.tap);
                        }}
                        className="rounded-lg border border-[rgb(var(--border))] p-2 text-[rgb(var(--muted))] transition hover:bg-neutral-50 hover:text-[rgb(var(--fg))]"
                        title="Expand view details"
                      >
                        {isExpanded ? (
                          <ChevronUp className="size-4" />
                        ) : (
                          <ChevronDown className="size-4" />
                        )}
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        disabled={deletingId === lead.id}
                        onClick={() => handleDelete(lead.id, lead.contact)}
                        className="rounded-lg border border-[rgb(var(--border))] p-2 text-[rgb(var(--muted))] transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                        title="Delete lead"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Detailed Breakdown */}
                {isExpanded ? (
                  <div className="border-t border-[rgb(var(--border))] bg-neutral-50/50 p-4 sm:p-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* Products Viewed Breakdown */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--fg))]">
                          Sofas & Products Viewed ({lead.views.length})
                        </h4>
                        {lead.views.length === 0 ? (
                          <p className="text-xs text-[rgb(var(--muted))]">
                            No specific product pages recorded yet.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {lead.views.map((v) => (
                              <div
                                key={v.handle}
                                className="flex items-center justify-between rounded-xl border border-[rgb(var(--border))] bg-white p-2.5 text-xs"
                              >
                                <div className="min-w-0 flex-1">
                                  <Link
                                    href={`/products/${v.handle}`}
                                    target="_blank"
                                    className="font-bold text-[rgb(var(--fg))] hover:underline"
                                  >
                                    {v.title}
                                  </Link>
                                  {v.price ? (
                                    <span className="ml-2 text-[rgb(var(--muted))]">
                                      {v.price}
                                    </span>
                                  ) : null}
                                </div>
                                <span className="ml-3 rounded-full bg-amber-100 px-2.5 py-0.5 font-bold text-amber-900">
                                  {v.viewCount}x viewed
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Cart Details Breakdown */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--fg))]">
                          Cart Activity
                        </h4>
                        {lead.cart?.hasItems ? (
                          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 text-xs">
                            <p className="font-bold text-emerald-950">
                              Active Cart: {lead.cart.totalQuantity} items ·
                              Total: ${lead.cart.totalAmount}
                            </p>
                            <ul className="mt-2 space-y-1">
                              {lead.cart.items.map((item, idx) => (
                                <li
                                  key={idx}
                                  className="flex justify-between text-emerald-900"
                                >
                                  <span>
                                    {item.quantity}x {item.title}
                                  </span>
                                  <span className="font-semibold">
                                    ${item.price}
                                  </span>
                                </li>
                              ))}
                            </ul>
                            {lead.cart.discountCode ? (
                              <p className="mt-2 border-t border-emerald-200 pt-1 text-[11px] font-bold text-emerald-800">
                                Coupon Active: {lead.cart.discountCode}
                              </p>
                            ) : null}
                          </div>
                        ) : (
                          <div className="rounded-xl border border-[rgb(var(--border))] bg-white p-3 text-xs text-[rgb(var(--muted))]">
                            Customer has not added any piece to the cart yet.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
