'use client';

import Link from 'next/link';

export function StorefrontRouteError({
  reset,
  title = 'We could not load this page',
}: {
  reset: () => void;
  title?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl px-5 py-24 text-center">
      <p className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--muted))]">
        TEMPORARILY UNAVAILABLE
      </p>
      <h1 className="mt-4 font-display text-4xl font-medium tracking-tight">
        {title}
      </h1>
      <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-[rgb(var(--muted))]">
        Please try again. If the problem continues, you can return to the
        catalog.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-[rgb(var(--fg))] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Try again
        </button>
        <Link
          href="/products"
          className="rounded-full border border-[rgb(var(--border))] bg-white px-6 py-3 text-sm font-semibold transition hover:bg-neutral-50"
        >
          Back to catalog
        </Link>
      </div>
    </div>
  );
}
