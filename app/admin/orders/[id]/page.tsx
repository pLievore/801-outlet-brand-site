import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAdminOrderDetail } from '../../../../src/lib/admin';
import { formatUsdCents as formatCents } from '../../../../src/lib/format';
import { OrderStatusActions } from '../../order-status-actions';

interface Props {
  params: Promise<{ id: string }>;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/15 text-yellow-300',
  paid: 'bg-blue-500/15 text-blue-300',
  shipped: 'bg-purple-500/15 text-purple-300',
  delivered: 'bg-green-500/15 text-green-300',
  cancelled: 'bg-red-500/15 text-red-300',
  refunded: 'bg-neutral-500/15 text-neutral-400',
};

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;
  const order = await getAdminOrderDetail(id);
  if (!order) notFound();

  const addr = order.shippingAddress;

  return (
    <div className="px-6 py-8 space-y-6 max-w-4xl">
      {/* Back link */}
      <Link href="/admin/orders" className="text-sm text-neutral-400 hover:text-white transition">
        ← Orders
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Order #{order.orderNumber}</h1>
          <p className="text-sm text-neutral-400">
            {new Date(order.createdAt).toLocaleString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <span
          className={
            'self-start rounded-full px-3 py-1 text-sm font-medium capitalize ' +
            (STATUS_COLORS[order.status] ?? 'bg-neutral-500/15 text-neutral-400')
          }
        >
          {order.status}
        </span>
      </div>

      {/* Status actions */}
      <OrderStatusActions orderId={order.id} currentStatus={order.status} />

      {/* Two columns */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Customer */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-1">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Customer</h2>
          {order.notes ? (
            <p className="text-sm text-white">{order.notes}</p>
          ) : null}
          <p className="text-sm text-neutral-300">{order.email}</p>
          {order.squarePaymentId && (
            <p className="text-xs text-neutral-500">Payment: {order.squarePaymentId}</p>
          )}
          {order.paidAt && (
            <p className="text-xs text-neutral-500">
              Paid {new Date(order.paidAt).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Shipping address */}
        {addr && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-1">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Shipping address
            </h2>
            <p className="text-sm text-white">{addr.line1}</p>
            {addr.line2 && <p className="text-sm text-neutral-300">{addr.line2}</p>}
            <p className="text-sm text-neutral-300">
              {addr.city}, {addr.state} {addr.postalCode}
            </p>
            {addr.country && addr.country !== 'US' && (
              <p className="text-sm text-neutral-300">{addr.country}</p>
            )}
          </div>
        )}
      </div>

      {/* Line items */}
      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400">Product</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400">SKU</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-neutral-400">Unit price</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-neutral-400">Qty</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-neutral-400">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3">
                  <div className="text-white">{item.productName}</div>
                  <div className="text-xs text-neutral-500">{item.variantName}</div>
                </td>
                <td className="px-4 py-3 text-neutral-400 text-xs">{item.sku}</td>
                <td className="px-4 py-3 text-right text-neutral-300">
                  {formatCents(item.unitPriceCents)}
                </td>
                <td className="px-4 py-3 text-right text-neutral-300">{item.quantity}</td>
                <td className="px-4 py-3 text-right text-white font-medium">
                  {formatCents(item.lineTotalCents)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="border-t border-white/10 px-4 py-4 space-y-1.5 text-sm">
          <div className="flex justify-between text-neutral-400">
            <span>Subtotal</span>
            <span>{formatCents(order.subtotalCents)}</span>
          </div>
          {order.taxCents > 0 && (
            <div className="flex justify-between text-neutral-400">
              <span>Tax</span>
              <span>{formatCents(order.taxCents)}</span>
            </div>
          )}
          {order.shippingCents > 0 && (
            <div className="flex justify-between text-neutral-400">
              <span>Shipping</span>
              <span>{formatCents(order.shippingCents)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-white/10 pt-2 font-semibold text-white">
            <span>Total</span>
            <span>{formatCents(order.totalCents)}</span>
          </div>
        </div>
      </div>

      {order.notes && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">Notes</h2>
          <p className="text-sm text-neutral-300">{order.notes}</p>
        </div>
      )}
    </div>
  );
}
