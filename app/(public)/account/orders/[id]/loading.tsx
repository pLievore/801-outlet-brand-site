import { Container } from '../../../../components/ui/container';

/** Mirrors the order page: heading, line items, then the two detail cards. */
export default function LoadingOrder() {
  return (
    <Container className="py-12 md:py-16">
      <Bar className="h-3 w-28" />
      <Bar className="mt-4 h-11 w-64 max-w-full" />

      <div
        aria-hidden="true"
        className="mt-8 divide-y divide-[rgb(var(--border))] rounded-3xl border border-[rgb(var(--border))] bg-white px-5"
      >
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex items-center gap-4 py-5">
            <Bar className="size-16 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1">
              <Bar className="h-4 w-1/2 max-w-xs" />
              <Bar className="mt-2 h-3 w-24" />
            </div>
            <Bar className="h-4 w-16 shrink-0" />
          </div>
        ))}
      </div>

      <div aria-hidden="true" className="mt-6 grid gap-5 sm:grid-cols-2">
        {[0, 1].map((card) => (
          <div
            key={card}
            className="rounded-3xl border border-[rgb(var(--border))] bg-white p-6"
          >
            <Bar className="h-3 w-24" />
            <Bar className="mt-4 h-4 w-40" />
            <Bar className="mt-2 h-4 w-32" />
          </div>
        ))}
      </div>

      <span className="sr-only" role="status">
        Loading the order.
      </span>
    </Container>
  );
}

function Bar({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-md bg-[rgb(var(--surface-muted))] ${className}`}
    />
  );
}
