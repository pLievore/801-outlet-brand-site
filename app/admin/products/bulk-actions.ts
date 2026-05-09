'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '../../../src/lib/admin';
import { supabaseAdmin } from '../../../src/lib/supabase/admin';

export async function bulkUpdateProducts(
  productIds: string[],
  action: 'activate' | 'archive' | 'draft'
): Promise<{ error?: string }> {
  try {
    await requireAdmin();
  } catch {
    return { error: 'Unauthorized.' };
  }

  if (!productIds.length) return { error: 'No products selected.' };

  const status =
    action === 'activate' ? 'active' : action === 'archive' ? 'archived' : 'draft';

  const { error } = await supabaseAdmin
    .from('products')
    .update({ status, updated_at: new Date().toISOString() })
    .in('id', productIds);

  if (error) return { error: error.message };

  revalidatePath('/admin/products');
  return {};
}

export async function bulkDeleteProducts(
  productIds: string[]
): Promise<{ error?: string }> {
  try {
    await requireAdmin();
  } catch {
    return { error: 'Unauthorized.' };
  }

  if (!productIds.length) return { error: 'No products selected.' };

  const { error } = await supabaseAdmin
    .from('products')
    .delete()
    .in('id', productIds);

  if (error) return { error: error.message };

  revalidatePath('/admin/products');
  return {};
}
