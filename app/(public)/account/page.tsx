import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PackageOpen } from 'lucide-react';

import {
  getCustomerOrders,
  getCustomerProfile,
  CustomerApiError,
} from '../../../src/lib/shopify/customer/api';
import {
  getCustomerAccessToken,
  isCustomerSignedIn,
} from '../../../src/lib/shopify/customer/session';
import { formatMoney } from '../../../src/lib/format';
import { buttonStyles } from '../../components/ui/button';
import { Container } from '../../components/ui/container';

export const metadata: Metadata = { title: 'My account — 801 Outlet' };

function formatStatus(value: string | null): string {
  if (!value) return '—';
  const label = value.replace(/_/g, ' ').toLowerCase();
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export default async function AccountPage() {
  const accessToken = await getCustomerAccessToken({ allowRefresh: false });

  if (!accessToken) {
    redirect(
      (await isCustomerSignedIn())
        ? '/api/auth/refresh?next=/account'
        : '/login'
    );
  }

  let profile;
  let orders;
  try {
    [profile, orders] = await Promise.all([
      getCustomerProfile(accessToken),
      getCustomerOrders(accessToken, 20),
    ]);
  } catch (error) {
    if (error instanceof CustomerApiError && error.statusCode === 401) {
      redirect('/api/auth/refresh?next=/account');
    }
    throw error;
  }

  return (
    <main>
      <Container className="py-12 md:py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--muted))]">
              MY ACCOUNT
            </p>
            <h1 className="mt-3 font-display text-4xl tracking-tight md:text-5xl">
              Hi, <span className="italic">{profile.displayName}</span>
            </h1>
            {profile.emailAddress ? (
              <p className="mt-2 text-sm text-[rgb(var(--muted))]">
                {profile.emailAddress}
              </p>
            ) : null}
          </div>
          <form action="/api/auth/logout" method="post">
            <button
              type="submit"
              className={buttonStyles({ variant: 'secondary', size: 'md' })}
            >
              Sign out
            </button>
          </form>
        </div>

        <section aria-labelledby="orders-heading" className="mt-10">
          <h2 id="orders-heading" className="text-lg font-bold">
            Order history
          </h2>

          {orders.length === 0 ? (
            <div className="mt-4 flex flex-col items-center gap-4 rounded-3xl border border-[rgb(var(--border))] bg-white px-6 py-14 text-center">
              <PackageOpen
                aria-hidden="true"
                className="size-9 text-[rgb(var(--muted))]"
              />
              <p className="text-sm text-[rgb(var(--muted))]">
                No orders yet. Your purchases will appear here.
              </p>
              <Link
                href="/products"
                className={buttonStyles({ variant: 'primary', size: 'md' })}
              >
                Browse products
              </Link>
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-3xl border border-[rgb(var(--border))] bg-white">
              <table className="w-full min-w-[36rem] text-left text-sm">
                <thead className="border-b border-[rgb(var(--border))] text-xs uppercase tracking-wide text-[rgb(var(--muted))]">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Order
                    </th>
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Date
                    </th>
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Payment
                    </th>
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Fulfillment
                    </th>
                    <th scope="col" className="px-5 py-3 text-right font-semibold">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgb(var(--border))]">
                  {orders.map((order) => {
                    const numericId = order.id.split('/').pop()?.split('?')[0];
                    return (
                    <tr key={order.id}>
                      <td className="px-5 py-4 font-semibold">
                        {numericId ? (
                          <Link
                            href={`/account/orders/${numericId}`}
                            className="underline-offset-2 hover:underline"
                          >
                            {order.name}
                          </Link>
                        ) : (
                          order.name
                        )}
                      </td>
                      <td className="px-5 py-4 text-[rgb(var(--muted))]">
                        {new Date(order.processedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-5 py-4">
                        {formatStatus(order.financialStatus)}
                      </td>
                      <td className="px-5 py-4">
                        {formatStatus(order.fulfillmentStatus)}
                      </td>
                      <td className="px-5 py-4 text-right font-semibold tabular-nums-tight">
                        {formatMoney(order.totalPrice)}
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </Container>
    </main>
  );
}
