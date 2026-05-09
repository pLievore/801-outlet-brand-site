import Link from 'next/link';
import { getAdminOrders } from '../../../src/lib/admin';
import { formatUsdCents as formatCents } from '../../../src/lib/format';

export const revalidate = 30;

interface Props {
  searchParams: Promise<{ status?: string; search?: string; page?: string }>;
}

const STATUSES = ['all', 'pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded'];

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/15 text-yellow-300',
  paid: 'bg-blue-500/15 text-blue-300',
  shipped: 'bg-purple-500/15 text-purple-300',
  delivered: 'bg-green-500/15 text-green-300',
  cancelled: 'bg-red-500/15 text-red-300',
  refunded: 'bg-neutral-500/15 text-neutral-400',
};

export default async function OrdersPage({ searchParams }: Props) {
  const sp = await searchParams;
  const status = sp.status ?? 'all';
  const search = sp.search ?? '';
  const page = Number(sp.page ?? 1);
  const pageSize = 20;

  const { orders, total } = await getAdminOrders({ status, search, page, pageSize });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function pageUrl(p: number) {
    const params = new URLSearchParams({
      ...(status !== 'all' ? { status } : {}),
      ...(search ? { search } : {}),
      ...(p > 1 ? { page: String(p) } : {}),
    });
    return '/admin/orders' + (params.size ? '?' + params.toString() : '');
  }

  return (
    <div className="px-6 py-8 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Orders</h1>
        <a
          href={`/api/admin/orders/export?status=${status}&search=${encodeURIComponent(search)}`}
          className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm font-medium text-neutral-300 hover:bg-white/15 hover:text-white transition"
          download
        >
          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Export CSV
        </a>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Status tabs */}
        <div className="flex gap-1 flex-wrap rounded-xl bg-white/5 p-1">
          {STATUSES.map((s) => (
            <a
              key={s}
              href={`/admin/orders?status=${s}${search ? `&search=${search}` : ''}`}
              className={
                'rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ' +
                (status === s
                  ? 'bg-white/10 text-white'
                  : 'text-neutral-400 hover:text-white')
              }
            >
              {s}
            </a>
          ))}
        </div>

        {/* Search */}
        <form method="GET" action="/admin/orders" className="flex gap-2">
          <input type="hidden" name="status" value={status} />
          <input
            type="search"
            name="search"
            defaultValue={search}
            placeholder="Email or order #"
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-neutral-500 focus:border-orange-500/50 focus:outline-none w-48"
          />
          <button
            type="submit"
            className="rounded-xl bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/15 transition"
          >
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left">
              <th className="px-4 py-3 text-xs font-medium text-neutral-400">Order #</th>
              <th className="px-4 py-3 text-xs font-medium text-neutral-400">Customer</th>
              <th className="px-4 py-3 text-xs font-medium text-neutral-400">Status</th>
              <th className="px-4 py-3 text-xs font-medium text-neutral-400 text-right">Total</th>
              <th className="px-4 py-3 text-xs font-medium text-neutral-400">Items</th>
              <th className="px-4 py-3 text-xs font-medium text-neutral-400">Date</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-neutral-500">
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-white/[0.03] transition">
                  <td className="px-4 py-3 font-medium text-white">#{order.orderNumber}</td>
                  <td className="px-4 py-3 text-neutral-300 max-w-[180px] truncate">{order.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        'rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ' +
                        (STATUS_COLORS[order.status] ?? 'bg-neutral-500/15 text-neutral-400')
                      }
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-white">{formatCents(order.totalCents)}</td>
                  <td className="px-4 py-3 text-neutral-400">{order.itemCount}</td>
                  <td className="px-4 py-3 text-neutral-400 text-xs">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-xs text-orange-400 hover:text-orange-300 transition"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-500">
            {total} order{total !== 1 ? 's' : ''}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <a
                href={pageUrl(page - 1)}
                className="rounded-xl bg-white/5 px-3 py-1.5 text-neutral-300 hover:bg-white/10 transition"
              >
                ← Prev
              </a>
            )}
            <span className="rounded-xl bg-white/10 px-3 py-1.5 text-white">
              {page} / {totalPages}
            </span>
            {page < totalPages && (
              <a
                href={pageUrl(page + 1)}
                className="rounded-xl bg-white/5 px-3 py-1.5 text-neutral-300 hover:bg-white/10 transition"
              >
                Next →
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
