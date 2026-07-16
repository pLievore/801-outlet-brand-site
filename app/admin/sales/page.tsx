import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { DollarSign, Package, Receipt, TrendingUp } from 'lucide-react';

import {
  getSalesSummary,
  type SalesPeriodDays,
} from '../../../src/lib/panel/analytics';

export const metadata: Metadata = { title: 'Sales — 801 Outlet Panel' };

const PERIODS: Array<{ days: SalesPeriodDays; label: string }> = [
  { days: 7, label: 'Last 7 days' },
  { days: 30, label: 'Last 30 days' },
  { days: 60, label: 'Last 60 days' },
];

function formatMoney(value: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: value >= 1000 ? 0 : 2,
  }).format(value);
}

function formatDay(date: string): string {
  const [, month, day] = date.split('-');
  return `${Number(month)}/${Number(day)}`;
}

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period } = await searchParams;
  const days = (PERIODS.find((p) => String(p.days) === period)?.days ??
    30) as SalesPeriodDays;
  const summary = await getSalesSummary(days);

  const cards = [
    {
      label: 'Revenue',
      value: formatMoney(summary.totalRevenue, summary.currencyCode),
      icon: DollarSign,
    },
    { label: 'Orders', value: String(summary.orderCount), icon: Receipt },
    {
      label: 'Average order',
      value: formatMoney(summary.averageOrderValue, summary.currencyCode),
      icon: TrendingUp,
    },
    { label: 'Units sold', value: String(summary.unitsSold), icon: Package },
  ];

  const maxDaily = Math.max(...summary.daily.map((d) => d.revenue), 1);

  return (
    <main className="px-5 py-8 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--muted))]">
            ANALYTICS
          </p>
          <h1 className="mt-2 font-display text-4xl tracking-tight">
            Sales <span className="italic">analysis</span>
          </h1>
        </div>
        <nav className="flex gap-2" aria-label="Period">
          {PERIODS.map((p) => (
            <Link
              key={p.days}
              href={`/admin/sales?period=${p.days}`}
              className={
                p.days === days
                  ? 'inline-flex min-h-10 items-center rounded-full bg-[rgb(var(--fg))] px-4 text-sm font-semibold text-white'
                  : 'inline-flex min-h-10 items-center rounded-full border border-[rgb(var(--border-strong))] bg-white px-4 text-sm font-semibold transition hover:border-[rgb(var(--fg))]'
              }
            >
              {p.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-3xl border border-[rgb(var(--border))] bg-white p-5"
          >
            <div className="flex items-center gap-2 text-[rgb(var(--muted))]">
              <card.icon aria-hidden="true" className="size-4" />
              <p className="text-xs font-semibold uppercase tracking-[0.14em]">
                {card.label}
              </p>
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <section className="mt-6 rounded-3xl border border-[rgb(var(--border))] bg-white p-5 md:p-7">
        <h2 className="text-sm font-bold">Revenue by day</h2>
        {summary.totalRevenue === 0 ? (
          <p className="mt-6 text-sm text-[rgb(var(--muted))]">
            No sales recorded in this period.
          </p>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <div
              className="flex h-44 min-w-[560px] items-end gap-[3px]"
              role="img"
              aria-label="Bar chart of daily revenue"
            >
              {summary.daily.map((day) => (
                <div
                  key={day.date}
                  className="group relative flex-1"
                  title={`${formatDay(day.date)} — ${formatMoney(day.revenue, summary.currencyCode)} · ${day.orders} order${day.orders === 1 ? '' : 's'}`}
                >
                  <div
                    className="w-full rounded-t bg-[rgb(var(--sage-ink))]/80 transition group-hover:bg-[rgb(var(--sage-ink))]"
                    style={{
                      height: `${Math.max((day.revenue / maxDaily) * 176, day.revenue > 0 ? 4 : 1)}px`,
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 flex min-w-[560px] justify-between text-[11px] text-[rgb(var(--muted))]">
              <span>{formatDay(summary.daily[0].date)}</span>
              <span>{formatDay(summary.daily[summary.daily.length - 1].date)}</span>
            </div>
          </div>
        )}
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="rounded-3xl border border-[rgb(var(--border))] bg-white p-5 md:p-7">
          <h2 className="text-sm font-bold">Best sellers</h2>
          {summary.bestSellers.length === 0 ? (
            <p className="mt-4 text-sm text-[rgb(var(--muted))]">
              Nothing sold in this period.
            </p>
          ) : (
            <ol className="mt-4 space-y-3">
              {summary.bestSellers.map((item, index) => (
                <li
                  key={item.productId ?? item.title}
                  className="flex items-center gap-3"
                >
                  <span className="w-5 text-right text-xs font-bold text-[rgb(var(--muted))]">
                    {index + 1}
                  </span>
                  <span className="relative size-11 shrink-0 overflow-hidden rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface-muted))]">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt=""
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    ) : null}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{item.title}</p>
                    <p className="text-xs text-[rgb(var(--muted))]">
                      {item.quantity} unit{item.quantity === 1 ? '' : 's'}
                    </p>
                  </div>
                  <p className="text-sm font-bold">
                    {formatMoney(item.revenue, summary.currencyCode)}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="rounded-3xl border border-[rgb(var(--border))] bg-white p-5 md:p-7">
          <h2 className="text-sm font-bold">Recent orders</h2>
          {summary.recentOrders.length === 0 ? (
            <p className="mt-4 text-sm text-[rgb(var(--muted))]">
              No orders in this period.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-[rgb(var(--border))]">
              {summary.recentOrders.map((order) => (
                <li
                  key={order.id}
                  className="flex items-center justify-between gap-3 py-2.5"
                >
                  <div>
                    <p className="text-sm font-semibold">{order.name}</p>
                    <p className="text-xs text-[rgb(var(--muted))]">
                      {new Intl.DateTimeFormat('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        timeZone: summary.timezone,
                      }).format(new Date(order.createdAt))}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {order.financialStatus ? (
                      <span className="rounded-full bg-[rgb(var(--surface-muted))] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[rgb(var(--muted))]">
                        {order.financialStatus.toLowerCase().replace(/_/g, ' ')}
                      </span>
                    ) : null}
                    <p className="text-sm font-bold">
                      {formatMoney(order.total, summary.currencyCode)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <p className="mt-6 text-xs text-[rgb(var(--muted))]">
        Cancelled orders are excluded. Order data covers the trailing 60 days
        available to the panel&apos;s API access. Times shown in{' '}
        {summary.timezone}.
      </p>
    </main>
  );
}
