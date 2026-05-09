import { Suspense } from 'react';
import { getRevenueKpis, getRevenueChart, getTopProducts, getAdminOrders, getLowStockCount, getSalesByCategory } from '../../src/lib/admin';
import type { Period } from '../../src/lib/admin';
import { formatUsdCents as formatCents } from '../../src/lib/format';
import { RevenueChart } from './components/revenue-chart';
import { OrdersChart } from './components/orders-chart';
import { SalesPieChart } from './components/sales-pie-chart';

export const revalidate = 60;

interface DashboardProps {
  searchParams: Promise<{ period?: string }>;
}

const PERIODS: { value: Period; label: string }[] = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
  { value: '12m', label: '12 months' },
];

export default async function AdminDashboard({ searchParams }: DashboardProps) {
  const sp = await searchParams;
  const period: Period = (['7d', '30d', '90d', '12m'].includes(sp.period ?? '') ? sp.period : '30d') as Period;

  const [kpis, chart, topProducts, { orders: recentOrders }, lowStockCount, salesByCategory] = await Promise.all([
    getRevenueKpis(),
    getRevenueChart(period),
    getTopProducts(period),
    getAdminOrders({ page: 1, pageSize: 8 }),
    getLowStockCount(),
    getSalesByCategory(period),
  ]);

  const kpiCards = [
    { label: 'Revenue (today)', value: formatCents(kpis.revenueToday) },
    { label: 'Revenue (this month)', value: formatCents(kpis.revenueThisMonth) },
    { label: 'Revenue (YTD)', value: formatCents(kpis.revenueYtd) },
    { label: 'Orders (this week)', value: String(kpis.ordersThisWeek) },
    { label: 'Orders (this month)', value: String(kpis.ordersThisMonth) },
    { label: 'Avg order value (30d)', value: formatCents(kpis.aov) },
  ];

  const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-500/15 text-yellow-300',
    paid: 'bg-blue-500/15 text-blue-300',
    shipped: 'bg-purple-500/15 text-purple-300',
    delivered: 'bg-green-500/15 text-green-300',
    cancelled: 'bg-red-500/15 text-red-300',
    refunded: 'bg-neutral-500/15 text-neutral-400',
  };

  return (
    <div className="px-6 py-8 space-y-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
        <div className="flex gap-1 rounded-xl bg-white/5 p-1">
          {PERIODS.map((p) => (
            <a
              key={p.value}
              href={`/admin?period=${p.value}`}
              className={
                'rounded-lg px-3 py-1.5 text-xs font-medium transition ' +
                (period === p.value
                  ? 'bg-white/10 text-white'
                  : 'text-neutral-400 hover:text-white')
              }
            >
              {p.label}
            </a>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {kpiCards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-xs text-neutral-400">{card.label}</div>
            <div className="mt-1 text-2xl font-bold text-white">{card.value}</div>
          </div>
        ))}
        {lowStockCount > 0 && (
          <a
            href="/admin/inventory?filter=low"
            className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-5 hover:bg-yellow-500/15 transition"
          >
            <div className="text-xs text-yellow-400">Low stock alerts</div>
            <div className="mt-1 text-2xl font-bold text-yellow-300">{lowStockCount}</div>
            <div className="mt-1 text-xs text-yellow-500">View inventory →</div>
          </a>
        )}
      </div>

      {/* Revenue chart */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-sm font-semibold text-white mb-4">Revenue over time</h2>
        <Suspense fallback={<div className="h-52 animate-pulse bg-white/5 rounded-xl" />}>
          <RevenueChart data={chart} />
        </Suspense>
      </div>

      {/* Orders chart + Sales by product */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-sm font-semibold text-white mb-4">Orders over time</h2>
          <Suspense fallback={<div className="h-52 animate-pulse bg-white/5 rounded-xl" />}>
            <OrdersChart data={chart} />
          </Suspense>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-sm font-semibold text-white mb-4">Sales by category</h2>
          <Suspense fallback={<div className="h-52 animate-pulse bg-white/5 rounded-xl" />}>
            <SalesPieChart data={salesByCategory} />
          </Suspense>
        </div>
      </div>

      {/* Two-col: top products + recent orders */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top products */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-sm font-semibold text-white mb-4">Top products ({period})</h2>
          {topProducts.length === 0 ? (
            <p className="text-sm text-neutral-500">No sales in this period.</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={p.sku} className="flex items-center gap-3">
                  <span className="text-xs text-neutral-600 w-5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">{p.productName}</div>
                    <div className="text-xs text-neutral-500">{p.sku} · {p.quantity} sold</div>
                  </div>
                  <div className="text-sm font-medium text-white">{formatCents(p.revenue)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent orders */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Recent orders</h2>
            <a href="/admin/orders" className="text-xs text-neutral-400 hover:text-white transition">
              View all →
            </a>
          </div>
          <div className="space-y-2">
            {recentOrders.map((order) => (
              <a
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/5 transition"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white">#{order.orderNumber}</div>
                  <div className="text-xs text-neutral-500 truncate">{order.email}</div>
                </div>
                <span
                  className={
                    'rounded-full px-2 py-0.5 text-[11px] font-medium ' +
                    (STATUS_COLORS[order.status] ?? 'bg-neutral-500/15 text-neutral-400')
                  }
                >
                  {order.status}
                </span>
                <div className="text-sm text-white">{formatCents(order.totalCents)}</div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
