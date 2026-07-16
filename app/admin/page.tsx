import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  AlertTriangle,
  Download,
  FileUp,
  LineChart,
  Package,
  Plus,
  Store,
  type LucideIcon,
} from 'lucide-react';

import { getSalesSummary } from '../../src/lib/panel/analytics';
import {
  computeCatalogStats,
  listPanelProducts,
  LOW_STOCK_THRESHOLD,
} from '../../src/lib/panel/products';
import {
  CHART_PALETTE,
  financialStatusLabel,
  formatMoney,
  STATUS_COLORS,
} from './_components/format';
import { Panel, PageHeader, StatCard } from './_components/ui';
import { Donut, HBar, RevenueBarChart } from './_components/charts';

export const metadata: Metadata = { title: 'Overview — 801 Outlet Panel' };

const SHORTCUTS: Array<{
  href: string;
  label: string;
  icon: LucideIcon;
  external?: boolean;
}> = [
  { href: '/admin/products/new', label: 'New product', icon: Plus },
  { href: '/admin/products/import', label: 'Import CSV', icon: FileUp },
  { href: '/admin/products/export', label: 'Export CSV', icon: Download, external: true },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/sales', label: 'Sales', icon: LineChart },
  {
    href: 'https://801outlet.vercel.app',
    label: 'View store',
    icon: Store,
    external: true,
  },
];

export default async function AdminOverviewPage() {
  const [summary, products] = await Promise.all([
    getSalesSummary(30),
    listPanelProducts(),
  ]);
  const catalog = computeCatalogStats(products);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="OVERVIEW"
        title="Store"
        titleAccent="overview"
        subtitle="Sales from the last 30 days and the current state of the catalog."
        actions={
          <Link
            href="/admin/sales"
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[rgb(var(--border-strong))] bg-white px-4 text-sm font-semibold transition hover:border-[rgb(var(--fg))]"
          >
            <LineChart aria-hidden="true" className="size-4" />
            Full sales view
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          title="Revenue (30d)"
          value={formatMoney(summary.totalRevenue, summary.currencyCode)}
          trend={summary.revenueDelta}
          sub="vs previous 30d"
          accent
        />
        <StatCard
          title="Orders"
          value={String(summary.orderCount)}
          trend={summary.ordersDelta}
          sub="vs previous 30d"
        />
        <StatCard
          title="Average order"
          value={formatMoney(summary.averageOrderValue, summary.currencyCode)}
        />
        <StatCard title="Units sold" value={String(summary.unitsSold)} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel title="Revenue by day" className="xl:col-span-2">
          {summary.totalRevenue === 0 ? (
            <p className="text-sm text-[rgb(var(--muted))]">
              No sales recorded in the last 30 days.
            </p>
          ) : (
            <RevenueBarChart
              data={summary.daily}
              currency={summary.currencyCode}
            />
          )}
        </Panel>
        <Panel title="Orders by payment status">
          <Donut
            segments={summary.byStatus.map((entry, index) => ({
              label: financialStatusLabel(entry.status),
              value: entry.count,
              color:
                STATUS_COLORS[entry.status] ??
                CHART_PALETTE[index % CHART_PALETTE.length],
              hint: formatMoney(entry.revenue, summary.currencyCode),
            }))}
            centerLabel={{
              value: String(summary.orderCount),
              label: 'orders',
            }}
          />
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel
          title="Best sellers (30d)"
          action={
            <Link
              href="/admin/sales"
              className="text-xs font-semibold text-[rgb(var(--sage-ink))] hover:underline"
            >
              See sales
            </Link>
          }
        >
          <HBar
            rows={summary.bestSellers.slice(0, 6).map((item) => ({
              label: item.title,
              value: item.quantity,
              hint: formatMoney(item.revenue, summary.currencyCode),
            }))}
          />
        </Panel>

        <Panel
          title={`Low stock (≤ ${LOW_STOCK_THRESHOLD} units)`}
          action={
            <Link
              href="/admin/products?stock=low"
              className="text-xs font-semibold text-[rgb(var(--sage-ink))] hover:underline"
            >
              See all
            </Link>
          }
        >
          {catalog.lowStock.length === 0 ? (
            <p className="text-sm text-[rgb(var(--muted))]">
              Every active product has stock above the threshold.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {catalog.lowStock.map((entry) => (
                <li
                  key={`${entry.productId}-${entry.variantTitle ?? 'default'}`}
                  className="flex items-center gap-3"
                >
                  <span className="relative size-10 shrink-0 overflow-hidden rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--surface-muted))]">
                    {entry.imageUrl ? (
                      <Image
                        src={entry.imageUrl}
                        alt=""
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    ) : null}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {entry.title}
                    </p>
                    {entry.variantTitle ? (
                      <p className="truncate text-xs text-[rgb(var(--muted))]">
                        {entry.variantTitle}
                      </p>
                    ) : null}
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                      entry.quantity <= 0
                        ? 'bg-red-50 text-red-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    <AlertTriangle aria-hidden="true" className="size-3" />
                    {entry.quantity} left
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          title="Products"
          value={String(catalog.total)}
          href="/admin/products"
        />
        <StatCard
          title="Active"
          value={String(catalog.active)}
          href="/admin/products?status=ACTIVE"
        />
        <StatCard
          title="Drafts"
          value={String(catalog.draft)}
          href="/admin/products?status=DRAFT"
        />
        <StatCard
          title="Out of stock"
          value={String(catalog.outOfStock)}
          sub="active products"
          href="/admin/products?stock=out"
        />
      </div>

      <Panel title="Management">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
          {SHORTCUTS.map((shortcut) => {
            const inner = (
              <>
                <span className="flex size-9 items-center justify-center rounded-lg bg-[rgb(var(--surface-muted))] text-[rgb(var(--muted))] ring-1 ring-inset ring-[rgb(var(--border))] transition group-hover:bg-[rgb(var(--sage-soft))] group-hover:text-[rgb(var(--sage-ink))]">
                  <shortcut.icon aria-hidden="true" className="size-[18px]" />
                </span>
                {shortcut.label}
              </>
            );
            const className =
              'group flex flex-col items-center gap-2 rounded-2xl border border-[rgb(var(--border))] bg-white px-3 py-4 text-center text-sm font-semibold transition hover:-translate-y-0.5 hover:border-[rgb(var(--sage-ink))]/40 hover:shadow-md';
            return shortcut.external ? (
              <a key={shortcut.href} href={shortcut.href} className={className}>
                {inner}
              </a>
            ) : (
              <Link key={shortcut.href} href={shortcut.href} className={className}>
                {inner}
              </Link>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
