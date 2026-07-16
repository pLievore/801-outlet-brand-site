import type { Metadata } from 'next';
import { LineChart } from 'lucide-react';

export const metadata: Metadata = { title: 'Sales — 801 Outlet Panel' };

export default function SalesPage() {
  return (
    <main className="px-5 py-8 md:px-8">
      <p className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--muted))]">
        ANALYTICS
      </p>
      <h1 className="mt-2 font-display text-4xl tracking-tight">
        Sales <span className="italic">analysis</span>
      </h1>
      <div className="mt-8 flex max-w-xl flex-col items-center gap-4 rounded-3xl border border-[rgb(var(--border))] bg-white px-6 py-16 text-center">
        <LineChart aria-hidden="true" className="size-9 text-[rgb(var(--sage-ink))]" />
        <p className="text-sm font-semibold">Coming right after product management.</p>
        <p className="text-sm text-[rgb(var(--muted))]">
          Revenue by period, best sellers, average order value and payment
          status — powered by live order data.
        </p>
      </div>
    </main>
  );
}
