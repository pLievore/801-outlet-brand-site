import Link from 'next/link';
import { getAdminProducts } from '../../../src/lib/admin';
import { ProductsTable } from './products-table';

export const revalidate = 30;

interface Props {
  searchParams: Promise<{ status?: string; search?: string; page?: string }>;
}

const STATUSES = ['all', 'active', 'archived', 'draft'];

export default async function AdminProductsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const status = sp.status ?? 'all';
  const search = sp.search ?? '';
  const page = Number(sp.page ?? 1);
  const pageSize = 20;

  const { products, total } = await getAdminProducts({ status, search, page, pageSize });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function pageUrl(p: number) {
    const params = new URLSearchParams({
      ...(status !== 'all' ? { status } : {}),
      ...(search ? { search } : {}),
      ...(p > 1 ? { page: String(p) } : {}),
    });
    return '/admin/products' + (params.size ? '?' + params.toString() : '');
  }

  return (
    <div className="px-6 py-8 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Products</h1>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-400 transition"
        >
          + New product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 flex-wrap rounded-xl bg-white/5 p-1">
          {STATUSES.map((s) => (
            <a
              key={s}
              href={`/admin/products?status=${s}${search ? `&search=${search}` : ''}`}
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

        <form method="GET" action="/admin/products" className="flex gap-2">
          <input type="hidden" name="status" value={status} />
          <input
            type="search"
            name="search"
            defaultValue={search}
            placeholder="Search products�"
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

      {/* Table with bulk actions */}
      <ProductsTable products={products} />

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-500">{total} product{total !== 1 ? 's' : ''}</span>
          <div className="flex gap-2">
            {page > 1 && (
              <a href={pageUrl(page - 1)} className="rounded-xl bg-white/5 px-3 py-1.5 text-neutral-300 hover:bg-white/10 transition">
                Prev
              </a>
            )}
            <span className="rounded-xl bg-white/10 px-3 py-1.5 text-white">
              {page} / {totalPages}
            </span>
            {page < totalPages && (
              <a href={pageUrl(page + 1)} className="rounded-xl bg-white/5 px-3 py-1.5 text-neutral-300 hover:bg-white/10 transition">
                Next
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
