import type { Metadata } from 'next';
import Link from 'next/link';

import { ImportManager } from './import-manager';

export const metadata: Metadata = { title: 'Import products — 801 Outlet Panel' };

export default function ImportPage() {
  return (
    <main className="px-5 py-8 md:px-8">
      <Link
        href="/admin/products"
        className="text-xs font-semibold tracking-[0.18em] text-[rgb(var(--muted))] transition hover:text-[rgb(var(--fg))]"
      >
        ← PRODUCTS
      </Link>
      <h1 className="mt-3 font-display text-4xl tracking-tight">
        Import <span className="italic">spreadsheet</span>
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[rgb(var(--muted))]">
        Upload a CSV exported from this panel (columns{' '}
        <code>variant_id, price, compare_at_price, quantity</code> — extra
        columns are ignored). Nothing is applied until you review and confirm
        the changes below.
      </p>
      <div className="mt-6">
        <ImportManager />
      </div>
    </main>
  );
}
