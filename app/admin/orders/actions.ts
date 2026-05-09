'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin, updateOrderStatus } from '../../../src/lib/admin';
import type { OrderStatus } from '../../../src/lib/admin';

export async function changeOrderStatus(orderId: string, status: OrderStatus) {
  await requireAdmin();
  await updateOrderStatus(orderId, status);
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath('/admin/orders');
  revalidatePath('/admin');
}
