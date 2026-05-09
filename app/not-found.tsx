import Link from 'next/link';

export const metadata = {
  title: 'Lost a couch — 801 Outlet',
};

export default function NotFound() {
  return (
    <main className="relative mx-auto flex min-h-[80vh] max-w-3xl flex-col items-center justify-center px-5 py-20 text-center">
      <div className="text-xs font-semibold uppercase tracking-[0.32em] text-[rgb(var(--muted))]">
        404 · Off-route
      </div>

      <h1 className="mt-5 font-display text-6xl font-medium leading-[0.95] tracking-tight md:text-8xl">
        We searched the
        <br />
        <span className="italic text-[rgb(var(--accent))]">whole showroom.</span>
      </h1>

      <p className="mt-6 max-w-md text-sm leading-relaxed text-[rgb(var(--muted))]">
        This page didn&apos;t make it out of the warehouse. Let&apos;s point you somewhere
        more comfortable.
      </p>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/products"
          className="inline-flex items-center justify-center rounded-full bg-[rgb(var(--fg))] px-7 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-[1px] hover:shadow-md active:translate-y-0"
        >
          Browse the catalog
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full border border-[rgb(var(--border))] bg-white px-7 py-3.5 text-sm font-semibold text-[rgb(var(--fg))] transition hover:-translate-y-[1px] hover:bg-neutral-50 hover:shadow-sm active:translate-y-0"
        >
          Back to home
        </Link>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 mx-auto h-72 max-w-md -translate-y-1/2 rounded-full bg-[rgb(var(--accent))]/10 blur-3xl" />
    </main>
  );
}
