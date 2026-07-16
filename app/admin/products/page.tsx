import type { Metadata } from 'next';
import Link from 'next/link';
import { Download, Upload } from 'lucide-react';

import { listPanelProducts } from '../../../src/lib/panel/products';
import { ProductsManager } from './products-manager';

export const metadata: Metadata = { title: 'Products — 801 Outlet Panel' };

export default async function PanelProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const search = q?.trim().slice(0, 100) || undefined;
  const products = await listPanelProducts(search);

  return (
    <main className="px-5 py-8 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--muted))]">
            CATALOG
          </p>
          <h1 className="mt-2 font-display text-4xl tracking-tight">
            Products <span className="italic">({products.length})</span>
          </h1>
        </div>
        <div className="flex gap-2">
          <a
            href="/admin/products/export"
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[rgb(var(--border-strong))] bg-white px-4 text-sm font-semibold transition hover:border-[rgb(var(--fg))]"
          >
            <Download aria-hidden="true" className="size-4" />
            Export CSV
          </a>
          <Link
            href="/admin/products/import"
            className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[rgb(var(--fg))] px-4 text-sm font-semibold text-white transition hover:bg-[rgb(var(--fg))]/90"
          >
            <Upload aria-hidden="true" className="size-4" />
            Import CSV
          </Link>
        </div>
      </div>

      <form method="get" className="mt-6 max-w-sm">
        <label htmlFor="q" className="sr-only">
          Search products
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={search ?? ''}
          placeholder="Search by title…"
          className="min-h-11 w-full rounded-full border border-[rgb(var(--border-strong))] bg-white px-5 text-sm outline-none transition focus:border-[rgb(var(--accent))] focus:ring-2 focus:ring-[rgb(var(--accent))]/15"
        />
      </form>

      <div className="mt-6">
        <ProductsManager products={products} />
      </div>
    </main>
  );
}
