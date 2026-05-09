import Link from 'next/link';
import { getOrderForConfirmation } from '../../../../src/lib/orders';

export const metadata = {
  title: 'Order Confirmed — 801 Outlet',
};

interface Props {
  searchParams: Promise<{ orderId?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { orderId } = await searchParams;
  const order = orderId ? await getOrderForConfirmation(orderId) : null;

  return (
    <main className="mx-auto max-w-2xl px-5 py-20 text-center">
      {/* Check icon */}
      <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-green-100">
        <svg
          className="size-8 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <div className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--muted))]">
        801 OUTLET • ORDER CONFIRMED
      </div>

      {order ? (
        <>
          <h1 className="mt-3 font-display text-4xl font-medium tracking-tight">
            Thank you{order.customerName ? `, ${order.customerName.split(' ')[0]}` : ''}!
          </h1>
          <p className="mt-2 text-lg font-medium text-[rgb(var(--accent))]">
            Order #{order.orderNumber}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--muted))]">
            We received your payment and will contact you at{' '}
            <strong className="text-[rgb(var(--fg))]">{order.email}</strong> within 24–48 hours
            to schedule your Utah delivery window.
          </p>

          {/* Items summary */}
          <div className="mt-8 rounded-2xl border border-[rgb(var(--border))] bg-white p-6 text-left">
            <h2 className="mb-4 text-sm font-semibold">Your order</h2>
            <ul className="divide-y divide-[rgb(var(--border))] text-sm">
              {order.items.map((item, i) => (
                <li key={i} className="flex justify-between py-2.5">
                  <span>
                    {item.productName}{' '}
                    <span className="text-[rgb(var(--muted))]">Ã— {item.quantity}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <>
          <h1 className="mt-3 font-display text-4xl font-medium tracking-tight">Payment received!</h1>
          <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--muted))]">
            Thank you for your order. You&apos;ll receive a confirmation email shortly. We&apos;ll
            contact you within 24–48 hours to schedule your Utah delivery window.
          </p>
        </>
      )}

      <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/products"
          className="rounded-full bg-[rgb(var(--fg))] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-[1px] hover:shadow-sm"
        >
          Continue shopping
        </Link>
        <Link
          href="/"
          className="rounded-full border border-[rgb(var(--border))] px-6 py-3 text-sm font-semibold transition hover:bg-neutral-50"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
