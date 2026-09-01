'use client';

import { AlertTriangle, RotateCw } from 'lucide-react';
import Link from 'next/link';

/**
 * What a panel route shows when its data does not arrive.
 *
 * Without a boundary the failure climbs to the root and takes the whole panel
 * down — the operator loses the navigation too, and the only way back is the
 * browser's back button. Scoped here, the shell survives and the retry is one
 * tap away.
 *
 * The message says which screen failed and offers the way out, because the
 * usual cause is a Shopify call that timed out and simply works on the retry.
 */
export function PanelRouteError({
  reset,
  title,
  hint,
}: {
  reset: () => void;
  title: string;
  hint?: string;
}) {
  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <span className="mx-auto inline-flex size-12 items-center justify-center rounded-full bg-[rgb(var(--accent-soft))]">
        <AlertTriangle
          aria-hidden="true"
          className="size-5 text-[rgb(var(--accent))]"
        />
      </span>

      <h1 className="mt-5 font-display text-3xl tracking-tight">{title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-[rgb(var(--muted))]">
        {hint ??
          'Shopify did not answer in time. Nothing was changed — trying again usually works.'}
      </p>

      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[rgb(var(--fg))] px-6 text-sm font-semibold text-white transition hover:bg-[rgb(var(--fg))]/90"
        >
          <RotateCw aria-hidden="true" className="size-4" />
          Try again
        </button>
        <Link
          href="/admin"
          className="inline-flex min-h-11 items-center rounded-full border border-[rgb(var(--border-strong))] px-6 text-sm font-semibold transition hover:border-[rgb(var(--fg))]"
        >
          Back to the panel
        </Link>
      </div>
    </div>
  );
}
