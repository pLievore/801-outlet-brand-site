/**
 * Waiting states for the panel.
 *
 * Every panel page reads Shopify on the server, so there is a real gap between
 * the tap and the screen. Without a `loading.tsx` the browser holds the
 * previous page and nothing says anything is happening — the panel reads as
 * frozen, and the operator taps again.
 *
 * The skeletons repeat the geometry of the page they stand in for, so the real
 * content does not shove anything sideways when it lands. They are decoration:
 * `aria-hidden`, with one polite announcement for anyone not looking at the
 * screen.
 */

export function Bar({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-md bg-[rgb(var(--surface-muted))] ${className}`}
    />
  );
}

/** The heading block every panel page opens with. */
export function HeaderSkeleton({ actions = 1 }: { actions?: number }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="w-full max-w-md">
        <Bar className="h-3 w-28" />
        <Bar className="mt-3 h-9 w-64" />
        <Bar className="mt-3 h-4 w-80 max-w-full" />
      </div>
      {actions > 0 ? (
        <div className="flex gap-2">
          {Array.from({ length: actions }).map((_, index) => (
            <Bar key={index} className="h-9 w-28 rounded-full" />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-3xl border border-[rgb(var(--border))] bg-white p-5 ${className}`}
    >
      <Bar className="h-3 w-24" />
      <Bar className="mt-3 h-7 w-32" />
      <Bar className="mt-2 h-3 w-20" />
    </div>
  );
}

export function StatRowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  );
}

/** Rows of a table or list, at the height the real rows occupy. */
export function ListSkeleton({
  rows = 6,
  withThumb = false,
}: {
  rows?: number;
  withThumb?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-3xl border border-[rgb(var(--border))] bg-white"
    >
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className={`flex items-center gap-4 px-5 py-4 ${
            index > 0 ? 'border-t border-[rgb(var(--border))]' : ''
          }`}
        >
          {withThumb ? <Bar className="size-12 shrink-0 rounded-xl" /> : null}
          <div className="min-w-0 flex-1">
            <Bar className="h-4 w-1/2 max-w-xs" />
            <Bar className="mt-2 h-3 w-1/3 max-w-[12rem]" />
          </div>
          <Bar className="hidden h-8 w-24 shrink-0 rounded-full sm:block" />
        </div>
      ))}
    </div>
  );
}

/** The one thing a screen reader should hear while a page is on its way. */
export function LoadingAnnouncement({ children }: { children: string }) {
  return (
    <span className="sr-only" role="status">
      {children}
    </span>
  );
}
