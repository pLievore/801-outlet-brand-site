import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from '../../../src/lib/supabase/server';
import { supabaseAdmin } from '../../../src/lib/supabase/admin';
import { formatUsdCents } from '../../../src/lib/format';

export const metadata = { title: 'My Account — 801 Outlet' };

const ORDERS_ICON = (
  <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7L12 3 4 7m16 0v10l-8 4m8-14l-8 4m0 0L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const PROFILE_ICON = (
  <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM4 21a8 8 0 0116 0" />
  </svg>
);

const SHOP_ICON = (
  <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l1.5-4h15L21 9M3 9v10a2 2 0 002 2h14a2 2 0 002-2V9M3 9h18M9 13h6" />
  </svg>
);

export default async function AccountPage() {
  const user = await getServerSession();
  if (!user) redirect('/login?next=/account');

  const { data: customer } = await supabaseAdmin
    .from('customers')
    .select('full_name, email, phone')
    .eq('auth_user_id', user.id)
    .maybeSingle();

  const { data: orders } = await supabaseAdmin
    .from('orders')
    .select('id, order_number, status, total_cents, created_at')
    .eq('email', user.email ?? '')
    .order('created_at', { ascending: false })
    .limit(5);

  const displayName = customer?.full_name ?? user.email ?? 'there';
  const firstName = displayName.split(' ')[0];

  const tiles: Array<{
    href: string;
    label: string;
    sub: string;
    icon: React.ReactNode;
  }> = [
    {
      href: '/account/orders',
      label: 'Orders',
      sub: orders?.length ? `${orders.length} recent` : 'No orders yet',
      icon: ORDERS_ICON,
    },
    {
      href: '/account/profile',
      label: 'Profile',
      sub: 'Name, phone, password',
      icon: PROFILE_ICON,
    },
    {
      href: '/products',
      label: 'Shop',
      sub: 'Browse the catalog',
      icon: SHOP_ICON,
    },
  ];

  return (
    <main className="mx-auto max-w-4xl px-5 py-14">
      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[rgb(var(--muted))]">
        801 Outlet · My Account
      </div>
      <h1 className="mt-3 font-display text-5xl font-medium tracking-tight md:text-6xl">
        Hi, <span className="italic text-[rgb(var(--accent))]">{firstName}</span>
      </h1>
      <p className="mt-2 text-sm text-[rgb(var(--muted))]">{user.email}</p>

      <div className="mt-12 grid gap-3 sm:grid-cols-3">
        {tiles.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="group flex flex-col gap-4 rounded-3xl border border-[rgb(var(--border))] bg-white p-6 transition will-change-transform hover:-translate-y-[2px] hover:border-[rgb(var(--accent))]/40 hover:shadow-[0_8px_28px_rgba(0,0,0,0.06)]"
          >
            <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-[rgb(var(--accent-soft))] text-[rgb(var(--accent))] transition group-hover:scale-105">
              {t.icon}
            </div>
            <div>
              <div className="text-base font-semibold">{t.label}</div>
              <div className="mt-1 text-xs text-[rgb(var(--muted))]">{t.sub}</div>
            </div>
            <div className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-[rgb(var(--accent))] transition group-hover:translate-x-0.5">
              Open
              <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      {orders && orders.length > 0 ? (
        <div className="mt-14">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="font-display text-2xl font-medium tracking-tight md:text-3xl">
              Recent <span className="italic">orders</span>
            </h2>
            <Link
              href="/account/orders"
              className="text-sm font-semibold text-[rgb(var(--accent))] transition hover:opacity-80"
            >
              View all →
            </Link>
          </div>
          <div className="overflow-hidden rounded-3xl border border-[rgb(var(--border))] bg-white">
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
                {orders.map((order) => {
                  const row = order as unknown as {
                    id: string;
                    order_number: number;
                    status: string;
                    total_cents: number;
                    created_at: string;
                  };
                  return (
                    <tr
                      key={row.id}
                      className="border-b border-[rgb(var(--border))] transition last:border-0 hover:bg-neutral-50"
                    >
                      <td className="px-5 py-4">
                        <Link
                          href={`/account/orders/${row.id}`}
                          className="font-medium tabular-nums hover:underline"
                        >
                          #{row.order_number}
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-[rgb(var(--muted))]">
                        {new Date(row.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="px-5 py-4 text-right font-semibold tabular-nums">
                        {formatUsdCents(row.total_cents)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
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
