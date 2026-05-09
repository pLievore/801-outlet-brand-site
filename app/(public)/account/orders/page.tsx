import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from '../../../../src/lib/supabase/server';
import { supabaseAdmin } from '../../../../src/lib/supabase/admin';
import { formatUsdCents } from '../../../../src/lib/format';

export const metadata = { title: 'My Orders — 801 Outlet' };

export default async function AccountOrdersPage() {
  const user = await getServerSession();
  if (!user) redirect('/login?next=/account/orders');

  const { data: orders } = await supabaseAdmin
    .from('orders')
    .select('id, order_number, status, total_cents, created_at')
    .eq('email', user.email ?? '')
    .order('created_at', { ascending: false });

  const rows = (orders ?? []) as Array<{
    id: string;
    order_number: number;
    status: string;
    total_cents: number;
    created_at: string;
  }>;

  return (
    <main className="mx-auto max-w-4xl px-5 py-14">
      <div className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--muted))]">
        801 OUTLET • MY ORDERS
      </div>
      <h1 className="mt-3 font-display text-4xl font-medium tracking-tight">Order history</h1>

      <div className="mt-2 text-sm text-[rgb(var(--muted))]">
        <Link href="/account" className="hover:underline">← Account</Link>
      </div>

      {rows.length === 0 ? (
        <div className="relative mt-12 overflow-hidden rounded-3xl border border-[rgb(var(--border))] bg-white p-10 text-center sm:p-14">
          <div className="font-display text-3xl font-medium tracking-tight md:text-4xl">
            No orders <span className="italic text-[rgb(var(--accent))]">just yet.</span>
          </div>
          <p className="mx-auto mt-3 max-w-md text-sm text-[rgb(var(--muted))]">
            Once you complete a purchase, you&apos;ll see it here with delivery details.
          </p>
          <Link
            href="/products"
            className="mt-7 inline-flex items-center justify-center rounded-full bg-[rgb(var(--fg))] px-7 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-[1px] hover:shadow-md"
          >
            Browse the catalog
          </Link>
          <div className="pointer-events-none absolute inset-x-0 -bottom-12 mx-auto h-40 max-w-sm rounded-full bg-[rgb(var(--accent))]/10 blur-3xl" />
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-[rgb(var(--border))] bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgb(var(--border))] text-xs text-[rgb(var(--muted))]">
                <th className="px-5 py-3 text-left font-semibold">Order</th>
                <th className="px-5 py-3 text-left font-semibold">Date</th>
                <th className="px-5 py-3 text-left font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((order) => (
                <tr key={order.id} className="border-b border-[rgb(var(--border))] last:border-0 hover:bg-neutral-50">
                  <td className="px-5 py-4">
                    <Link href={`/account/orders/${order.id}`} className="font-medium hover:underline">
                      #{order.order_number}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-[rgb(var(--muted))]">
                    {new Date(order.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-5 py-4 text-right font-semibold">
                    {formatUsdCents(order.total_cents)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${cls}`}>
      {status}
    </span>
  );
}
