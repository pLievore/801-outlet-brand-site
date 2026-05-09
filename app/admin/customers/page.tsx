import Link from 'next/link';
import { getAdminCustomers } from '../../../src/lib/admin';
import type { CustomerSortField } from '../../../src/lib/admin';
import { formatUsdCents } from '../../../src/lib/format';

export const revalidate = 30;

interface Props {
  searchParams: Promise<{
    search?: string;
    sort?: string;
    dir?: string;
    page?: string;
  }>;
}

const SORT_FIELDS: { key: CustomerSortField; label: string }[] = [
  { key: 'full_name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'order_count', label: 'Orders' },
  { key: 'total_spent', label: 'Total spent' },
  { key: 'last_order_at', label: 'Last order' },
  { key: 'created_at', label: 'Joined' },
];

const STATUS_COLORS: Record<string, string> = {
  paid: 'text-blue-400',
  shipped: 'text-purple-400',
  delivered: 'text-green-400',
  cancelled: 'text-red-400',
  pending: 'text-yellow-400',
  refunded: 'text-neutral-400',
};

function SortHeader({
  field,
  label,
  current,
  dir,
  search,
  page,
}: {
  field: CustomerSortField;
  label: string;
  current: CustomerSortField;
  dir: 'asc' | 'desc';
  search: string;
  page: number;
}) {
  const isActive = current === field;
  const nextDir = isActive && dir === 'desc' ? 'asc' : 'desc';
  const params = new URLSearchParams({
    ...(search ? { search } : {}),
    sort: field,
    dir: nextDir,
  });
  return (
    <th className="px-4 py-3 text-left">
      <a
        href={`/admin/customers?${params}`}
        className={
          'flex items-center gap-1 text-xs font-medium transition ' +
          (isActive ? 'text-white' : 'text-neutral-400 hover:text-white')
        }
      >
        {label}
        <span className="text-[10px]">
          {isActive ? (dir === 'desc' ? '↓' : '↑') : '↕'}
        </span>
      </a>
    </th>
  );
}

export default async function CustomersPage({ searchParams }: Props) {
  const sp = await searchParams;
  const search = sp.search ?? '';
  const sort = (SORT_FIELDS.some((f) => f.key === sp.sort) ? sp.sort : 'created_at') as CustomerSortField;
  const dir = sp.dir === 'asc' ? 'asc' : 'desc';
  const page = Math.max(1, Number(sp.page ?? 1));
  const pageSize = 25;

  const { customers, total } = await getAdminCustomers({ search, sort, dir, page, pageSize });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function pageUrl(p: number) {
    const params = new URLSearchParams({
      ...(search ? { search } : {}),
      sort,
      dir,
      ...(p > 1 ? { page: String(p) } : {}),
    });
    return `/admin/customers?${params}`;
  }

  return (
    <div className="px-6 py-8 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Customers</h1>
          <p className="text-sm text-neutral-400 mt-0.5">{total} total</p>
        </div>
      </div>

      {/* Search */}
      <form method="GET" action="/admin/customers" className="flex gap-2">
        <input type="hidden" name="sort" value={sort} />
        <input type="hidden" name="dir" value={dir} />
        <input
          type="search"
          name="search"
          defaultValue={search}
          placeholder="Search by name, email or phone…"
          className="w-full max-w-sm rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-orange-500/50 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/15 transition"
        >
          Search
        </button>
        {search && (
          <a
            href="/admin/customers"
            className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-neutral-400 hover:text-white transition"
          >
            Clear
          </a>
        )}
      </form>

      {/* Table */}
      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-x-auto">
        <table className="w-full text-sm min-w-[780px]">
          <thead>
            <tr className="border-b border-white/10">
              <SortHeader field="full_name" label="Name" current={sort} dir={dir} search={search} page={page} />
              <SortHeader field="email" label="Email" current={sort} dir={dir} search={search} page={page} />
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400">Phone</th>
              <SortHeader field="order_count" label="Orders" current={sort} dir={dir} search={search} page={page} />
              <SortHeader field="total_spent" label="Total spent" current={sort} dir={dir} search={search} page={page} />
              <SortHeader field="last_order_at" label="Last order" current={sort} dir={dir} search={search} page={page} />
              <SortHeader field="created_at" label="Joined" current={sort} dir={dir} search={search} page={page} />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {customers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-neutral-500">
                  No customers found.
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id} className="hover:bg-white/[0.03] transition group">
                  {/* Name */}
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">
                      {c.fullName ?? <span className="text-neutral-500 font-normal">—</span>}
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-4 py-3">
                    <a
                      href={`mailto:${c.email}`}
                      className="text-neutral-300 hover:text-orange-300 transition"
                    >
                      {c.email}
                    </a>
                  </td>

                  {/* Phone */}
                  <td className="px-4 py-3 text-neutral-400 text-xs">
                    {c.phone ?? '—'}
                  </td>

                  {/* Order count */}
                  <td className="px-4 py-3">
                    {c.orderCount > 0 ? (
                      <Link
                        href={`/admin/orders?search=${encodeURIComponent(c.email)}`}
                        className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-white hover:bg-white/15 transition"
                      >
                        {c.orderCount} order{c.orderCount !== 1 ? 's' : ''}
                      </Link>
                    ) : (
                      <span className="text-xs text-neutral-600">0</span>
                    )}
                  </td>

                  {/* Total spent */}
                  <td className="px-4 py-3">
                    {c.totalSpentCents > 0 ? (
                      <span className="font-medium text-white">
                        {formatUsdCents(c.totalSpentCents)}
                      </span>
                    ) : (
                      <span className="text-neutral-600 text-xs">—</span>
                    )}
                  </td>

                  {/* Last order */}
                  <td className="px-4 py-3">
                    {c.lastOrderAt ? (
                      <div>
                        <div className="text-xs text-neutral-300">
                          {new Date(c.lastOrderAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                        {c.lastOrderStatus && (
                          <div
                            className={
                              'text-[11px] capitalize ' +
                              (STATUS_COLORS[c.lastOrderStatus] ?? 'text-neutral-400')
                            }
                          >
                            {c.lastOrderStatus}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-neutral-600">—</span>
                    )}
                  </td>

                  {/* Joined */}
                  <td className="px-4 py-3 text-xs text-neutral-400">
                    {new Date(c.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
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
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <a href={pageUrl(page - 1)} className="rounded-xl bg-white/5 px-3 py-1.5 text-neutral-300 hover:bg-white/10 transition">
                ← Prev
              </a>
            )}
            <span className="rounded-xl bg-white/10 px-3 py-1.5 text-white">
              {page} / {totalPages}
            </span>
            {page < totalPages && (
              <a href={pageUrl(page + 1)} className="rounded-xl bg-white/5 px-3 py-1.5 text-neutral-300 hover:bg-white/10 transition">
                Next →
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
