export default function ProductsLoading() {
  return (
    <main>
      <section className="mx-auto max-w-6xl px-5 pt-10 pb-14">
        <div className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--muted))]">
          801 OUTLET • CATALOG
        </div>
        <h1 className="mt-3 font-display text-4xl font-medium tracking-tight md:text-6xl">
          Browse products
        </h1>

        <div
          aria-busy="true"
          aria-live="polite"
          className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border border-[rgb(var(--border))] bg-white p-4"
            >
              <div className="aspect-4/3 rounded-xl bg-neutral-200" />
              <div className="mt-4 h-4 w-2/3 rounded bg-neutral-200" />
              <div className="mt-2 h-3 w-full rounded bg-neutral-100" />
              <div className="mt-3 flex gap-2">
                <div className="h-5 w-16 rounded-full bg-neutral-100" />
                <div className="h-5 w-20 rounded-full bg-neutral-100" />
              </div>
            </div>
          ))}
        </div>

        <span className="sr-only">Loading products…</span>
      </section>
    </main>
  );
}
