import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from '../../../../../src/lib/supabase/server';
import { supabaseAdmin } from '../../../../../src/lib/supabase/admin';
import { getOrderForConfirmation } from '../../../../../src/lib/orders';
import { formatUsdCents } from '../../../../../src/lib/format';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const order = await getOrderForConfirmation(id);
  return {
    title: order ? `Order #${order.orderNumber} — 801 Outlet` : 'Order — 801 Outlet',
  };
}

export default async function OrderDetailPage({ params }: PageProps) {
  const user = await getServerSession();
  if (!user) redirect('/login?next=/account/orders');

  const { id } = await params;
  const order = await getOrderForConfirmation(id);
  if (!order) notFound();
  if (order.email !== user.email) notFound();

  const { data: extra } = await supabaseAdmin
    .from('orders')
    .select('shipping_address, paid_at, shipped_at')
    .eq('id', id)
    .maybeSingle();

  const addr = extra?.shipping_address as
    | {
        line1?: string;
        line2?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
      }
    | null;

  return (
    <main className="mx-auto max-w-3xl px-5 py-14">
      <div className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--muted))]">
        801 OUTLET • ORDER DETAIL
      </div>

      <div className="mt-3 flex items-start justify-between">
        <div>
          <h1 className="font-display text-4xl font-medium tracking-tight">Order #{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-[rgb(var(--muted))]">
            <StatusBadge status={order.status} />
          </p>
        </div>
        <Link href="/account/orders" className="text-sm text-[rgb(var(--muted))] hover:underline">
          ← Orders
        </Link>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-[rgb(var(--border))] bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold">Items</h2>
          <ul className="divide-y divide-[rgb(var(--border))] text-sm">
            {order.items.map((item, i) => (
              <li key={i} className="flex justify-between py-2.5">
                <div>
                  <div className="font-medium">{item.productName}</div>
                  <div className="text-xs text-[rgb(var(--muted))]">
                    SKU: {item.sku} × {item.quantity}
                  </div>
                </div>
                <div className="font-semibold">{formatUsdCents(item.lineTotalCents)}</div>
              </li>
            ))}
          </ul>

          <div className="mt-4 space-y-1.5 border-t border-[rgb(var(--border))] pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-[rgb(var(--muted))]">Subtotal</span>
              <span>{formatUsdCents(order.subtotalCents)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[rgb(var(--muted))]">Shipping</span>
              <span>{formatUsdCents(order.shippingCents)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[rgb(var(--muted))]">Tax</span>
              <span>{formatUsdCents(order.taxCents)}</span>
            </div>
            <div className="flex justify-between border-t border-[rgb(var(--border))] pt-2 font-semibold">
              <span>Total</span>
              <span>{formatUsdCents(order.totalCents)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {addr && (
            <div className="rounded-2xl border border-[rgb(var(--border))] bg-white p-6">
              <h2 className="mb-3 text-sm font-semibold">Shipping address</h2>
              <address className="not-italic text-sm leading-relaxed text-[rgb(var(--muted))]">
                {addr.line1}
                <br />
                {addr.line2 ? (
                  <>
                    {addr.line2}
                    <br />
                  </>
                ) : null}
                {addr.city}, {addr.state} {addr.postalCode}
                <br />
                {addr.country}
              </address>
            </div>
          )}

          <div className="rounded-2xl border border-[rgb(var(--border))] bg-white p-6">
            <h2 className="mb-3 text-sm font-semibold">Contact</h2>
            <p className="text-sm text-[rgb(var(--muted))]">{order.email}</p>
            {order.customerName && (
              <p className="text-sm text-[rgb(var(--muted))]">{order.customerName}</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-yellow-50 text-yellow-700',
    paid: 'bg-green-50 text-green-700',
    shipped: 'bg-blue-50 text-blue-700',
    delivered: 'bg-emerald-50 text-emerald-700',
    cancelled: 'bg-neutral-100 text-neutral-500',
    refunded: 'bg-red-50 text-red-700',
  };
  const cls = styles[status] ?? 'bg-neutral-100 text-neutral-500';
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${cls}`}
    >
      {status}
    </span>
  );
}
