import Link from 'next/link';

export const metadata = {
  title: 'Payment Cancelled — 801 Outlet',
};

export default function CheckoutCancelPage() {
  return (
    <main className="mx-auto max-w-xl px-5 py-20 text-center">
      <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-neutral-100">
        <svg
          className="size-8 text-[rgb(var(--muted))]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>

      <div className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--muted))]">
        801 OUTLET • PAYMENT CANCELLED
      </div>
      <h1 className="mt-3 font-display text-4xl font-medium tracking-tight">Payment cancelled</h1>
      <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--muted))]">
        No charge was made. Your cart items are still saved — you can return to checkout whenever
        you&apos;re ready.
      </p>

      <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/checkout"
          className="rounded-full bg-[rgb(var(--fg))] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-[1px] hover:shadow-sm"
        >
          Return to checkout
        </Link>
        <Link
          href="/cart"
          className="rounded-full border border-[rgb(var(--border))] px-6 py-3 text-sm font-semibold transition hover:bg-neutral-50"
        >
          View cart
        </Link>
      </div>
    </main>
  );
}
