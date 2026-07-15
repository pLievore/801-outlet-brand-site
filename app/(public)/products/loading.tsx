export default function ProductsLoading() {
  return (
    <main>
      <section className="mx-auto max-w-6xl px-5 pb-14 pt-10">
        <p className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--muted))]">
          801 OUTLET · UTAH
        </p>
        <h1 className="mt-3 font-display text-4xl font-medium tracking-tight md:text-6xl">
          Browse furniture
        </h1>
        <div className="mt-8 h-32 animate-pulse rounded-2xl bg-neutral-200" />
        <div
          aria-busy="true"
          aria-live="polite"
          className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3"
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse rounded-2xl border border-[rgb(var(--border))] bg-white p-4"
            >
              <div className="aspect-4/3 rounded-xl bg-neutral-200" />
              <div className="mt-4 h-4 w-2/3 rounded bg-neutral-200" />
              <div className="mt-2 h-3 w-full rounded bg-neutral-100" />
              <div className="mt-3 h-5 w-16 rounded-full bg-neutral-100" />
            </div>
          ))}
        </div>
        <span className="sr-only">Loading products…</span>
      </section>
    </main>
  );
}
