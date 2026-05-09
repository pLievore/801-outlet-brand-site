'use client';

import { useState, useTransition } from 'react';
import { changeOrderStatus } from './orders/actions';
import type { OrderStatus } from '../../src/lib/admin';

const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['cancelled'],
  paid: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
  refunded: [],
};

const ACTION_LABELS: Record<OrderStatus, string> = {
  shipped: 'Mark as Shipped',
  delivered: 'Mark as Delivered',
  cancelled: 'Cancel order',
  pending: '',
  paid: '',
  refunded: 'Refund',
};

const ACTION_STYLES: Record<OrderStatus, string> = {
  shipped: 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30',
  delivered: 'bg-green-500/20 text-green-300 hover:bg-green-500/30',
  cancelled: 'bg-red-500/20 text-red-300 hover:bg-red-500/30',
  pending: '',
  paid: '',
  refunded: 'bg-neutral-500/20 text-neutral-300 hover:bg-neutral-500/30',
};

export function OrderStatusActions({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const available = TRANSITIONS[currentStatus as OrderStatus] ?? [];
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  if (available.length === 0) return null;

  const onClick = (status: OrderStatus) => {
    if (!confirm(`Change status to "${status}"?`)) return;
    startTransition(async () => {
      await changeOrderStatus(orderId, status);
      setDone(true);
    });
  };

  return (
    <div className="flex gap-2">
      {available.map((status) => (
        <button
          key={status}
          onClick={() => onClick(status)}
          disabled={pending || done}
          className={
            'rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-50 ' +
            (ACTION_STYLES[status] ?? 'bg-white/10 text-white hover:bg-white/15')
          }
        >
          {done ? 'Updated ✓' : ACTION_LABELS[status]}
        </button>
      ))}
    </div>
  );
}
