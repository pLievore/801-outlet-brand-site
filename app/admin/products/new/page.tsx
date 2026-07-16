import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { NewProductForm } from './new-product-form';

export const metadata: Metadata = { title: 'New product — 801 Outlet Panel' };

export default function NewProductPage() {
  return (
    <main className="px-5 py-8 md:px-8">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[rgb(var(--muted))] transition hover:text-[rgb(var(--fg))]"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to products
      </Link>
      <p className="mt-4 text-xs font-semibold tracking-[0.22em] text-[rgb(var(--muted))]">
        CATALOG
      </p>
      <h1 className="mt-2 font-display text-4xl tracking-tight">
        New <span className="italic">product</span>
      </h1>
      <div className="mt-8">
        <NewProductForm />
      </div>
    </main>
  );
}
