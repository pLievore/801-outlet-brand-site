'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin, adjustStock } from '../../../src/lib/admin';

export async function updateStock(variantId: string, newQty: number) {
  const admin = await requireAdmin();
  await adjustStock(variantId, newQty, admin.id);
  revalidatePath('/admin/inventory');
}
