import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import {
  CustomerApiError,
  getCustomerOrder,
} from '../../../../../src/lib/shopify/customer/api';
import {
  getCustomerAccessToken,
  isCustomerSignedIn,
} from '../../../../../src/lib/shopify/customer/session';
import { formatMoney } from '../../../../../src/lib/format';
import { Container } from '../../../../components/ui/container';

export const metadata: Metadata = { title: 'Order details — 801 Outlet' };

type PageProps = { params: Promise<{ id: string }> };

function formatStatus(value: string | null): string {
  if (!value) return '—';
  const label = value.replace(/_/g, ' ').toLowerCase();
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  const accessToken = await getCustomerAccessToken({ allowRefresh: false });
  if (!accessToken) {
    redirect(
      (await isCustomerSignedIn())
        ? `/api/auth/refresh?next=/account/orders/${id}`
        : '/login'
    );
  }

  let order;
  try {
    order = await getCustomerOrder(accessToken, `gid://shopify/Order/${id}`);
  } catch (error) {
    if (error instanceof CustomerApiError && error.statusCode === 401) {
      redirect(`/api/auth/refresh?next=/account/orders/${id}`);
    }
    throw error;
  }

  // The API only returns orders that belong to the authenticated customer.
  if (!order) notFound();

  return (
    <main>
      <Container size="narrow" className="py-12 md:py-16">
        <Link
          href="/account"
          className="text-xs font-semibold tracking-[0.18em] text-[rgb(var(--muted))] transition hover:text-[rgb(var(--fg))]"
        >
          ← MY ACCOUNT
        </Link>

        <div className="mt-5 flex flex-wrap items-baseline justify-between gap-3">
          <h1 className="font-display text-4xl tracking-tight">
            Order <span className="italic">{order.name}</span>
          </h1>
          <p className="text-sm text-[rgb(var(--muted))]">
            {new Date(order.processedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
            {' · '}
            {formatStatus(order.financialStatus)}
          </p>
        </div>

        <ul className="mt-8 divide-y divide-[rgb(var(--border))] rounded-3xl border border-[rgb(var(--border))] bg-white px-5">
          {order.lineItems.map((item) => (
            <li key={item.id} className="flex items-center gap-4 py-4">
              <span className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface-muted))]">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.imageAlt ?? ''}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : null}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-5">{item.name}</p>
                <p className="mt-0.5 text-xs text-[rgb(var(--muted))]">
                  Qty {item.quantity}
                </p>
              </div>
              {item.price ? (
                <span className="text-sm font-semibold tabular-nums-tight">
                  {formatMoney(item.price)}
                </span>
              ) : null}
            </li>
          ))}
        </ul>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div className="rounded-3xl border border-[rgb(var(--border))] bg-white p-6">
            <h2 className="text-sm font-bold">Summary</h2>
            <dl className="mt-4 space-y-2 text-sm">
              {order.subtotal ? (
                <div className="flex justify-between">
                  <dt className="text-[rgb(var(--muted))]">Subtotal</dt>
                  <dd className="tabular-nums-tight">{formatMoney(order.subtotal)}</dd>
                </div>
              ) : null}
              {order.totalShipping ? (
                <div className="flex justify-between">
                  <dt className="text-[rgb(var(--muted))]">Shipping</dt>
                  <dd className="tabular-nums-tight">
                    {formatMoney(order.totalShipping)}
                  </dd>
                </div>
              ) : null}
              {order.totalTax ? (
                <div className="flex justify-between">
                  <dt className="text-[rgb(var(--muted))]">Tax</dt>
                  <dd className="tabular-nums-tight">{formatMoney(order.totalTax)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between border-t border-[rgb(var(--border))] pt-2 font-semibold">
                <dt>Total</dt>
                <dd className="tabular-nums-tight">{formatMoney(order.totalPrice)}</dd>
              </div>
            </dl>
          </div>

          {order.shippingAddressLines.length > 0 ? (
            <div className="rounded-3xl border border-[rgb(var(--border))] bg-white p-6">
              <h2 className="text-sm font-bold">Delivery address</h2>
              <p className="mt-4 text-sm leading-6 text-[rgb(var(--muted))]">
                {order.shippingAddressLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </p>
            </div>
          ) : null}
        </div>
      </Container>
    </main>
  );
}
