'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '../../../src/lib/admin';
import { supabaseAdmin } from '../../../src/lib/supabase/admin';

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export async function saveProduct(
  productId: string | null,
  _prevState: { error: string } | null,
  fd: FormData
): Promise<{ error: string } | null> {
  try {
    await requireAdmin();
  } catch {
    return { error: 'Unauthorized.' };
  }

  const name = fd.get('name') as string;
  const description = (fd.get('description') as string) || null;
  const status = (fd.get('status') as string) || 'draft';
  const isFeatured = fd.get('is_featured') === 'on';
  const sku = fd.get('sku') as string;
  const priceStr = fd.get('price') as string;
  const compareStr = (fd.get('compare_price') as string) || '';
  const stockStr = fd.get('stock_qty') as string;
  const lowThresholdStr = (fd.get('low_stock_threshold') as string) || '5';
  const imageUrlInput = (fd.get('image_url') as string) || '';
  const imageFile = fd.get('image_file');

  if (!name || !sku || !priceStr) {
    return { error: 'Name, SKU, and price are required.' };
  }

  try {

  // Upload image file to Supabase Storage if provided
  let imageUrl = imageUrlInput;
  if (imageFile instanceof File && imageFile.size > 0) {
    if (imageFile.size > 5 * 1024 * 1024) {
      return { error: 'Image must be smaller than 5 MB.' };
    }
    const ext = imageFile.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const { error: uploadError } = await supabaseAdmin.storage
      .from('products')
      .upload(path, buffer, { contentType: imageFile.type, upsert: false });
    if (uploadError) return { error: `Image upload failed: ${uploadError.message}` };
    const { data: { publicUrl } } = supabaseAdmin.storage.from('products').getPublicUrl(path);
    imageUrl = publicUrl;
  }

  const priceCents = Math.round(parseFloat(priceStr) * 100);
  const compareCents = compareStr ? Math.round(parseFloat(compareStr) * 100) : null;
  const stockQty = parseInt(stockStr, 10) || 0;
  const lowStockThreshold = parseInt(lowThresholdStr, 10) || 5;

  if (productId) {
    // Update product
    await supabaseAdmin
      .from('products')
      .update({ name, description, status: status as 'draft' | 'active' | 'archived', is_featured: isFeatured, updated_at: new Date().toISOString() })
      .eq('id', productId);

    // Update first variant
    const { data: variants } = await supabaseAdmin
      .from('product_variants')
      .select('id')
      .eq('product_id', productId)
      .limit(1);

    if (variants?.[0]) {
      await supabaseAdmin
        .from('product_variants')
        .update({ sku, price_cents: priceCents, compare_at_price_cents: compareCents, stock_qty: stockQty, low_stock_threshold: lowStockThreshold })
        .eq('id', variants[0].id);
    }

    // Update image if provided
    if (imageUrl) {
      const { data: imgs } = await supabaseAdmin
        .from('product_images')
        .select('id')
        .eq('product_id', productId)
        .order('sort_order')
        .limit(1);

      if (imgs?.[0]) {
        await supabaseAdmin.from('product_images').update({ url: imageUrl }).eq('id', imgs[0].id);
      } else {
        await supabaseAdmin.from('product_images').insert({ product_id: productId, url: imageUrl, sort_order: 0 });
      }
    }

    const { data: slugRow } = await supabaseAdmin.from('products').select('slug').eq('id', productId).single();
    revalidatePath('/admin/products');
    if (slugRow?.slug) revalidatePath(`/products/${slugRow.slug}`);
    redirect(`/admin/products/${productId}?saved=1`);
  } else {
    // Create product
    const slug = slugify(name);
    const { data: product, error } = await supabaseAdmin
      .from('products')
      .insert({ name, description, slug, status: status as 'draft' | 'active' | 'archived', is_featured: isFeatured })
      .select('id')
      .single();

    if (error || !product) return { error: error?.message ?? 'Failed to create product' };

    await supabaseAdmin.from('product_variants').insert({
      product_id: product.id,
      sku,
      name: 'Default',
      price_cents: priceCents,
      compare_at_price_cents: compareCents,
      stock_qty: stockQty,
      low_stock_threshold: lowStockThreshold,
      is_default: true,
    });

    if (imageUrl) {
      await supabaseAdmin
        .from('product_images')
        .insert({ product_id: product.id, url: imageUrl, sort_order: 0 });
    }

    revalidatePath('/admin/products');
    redirect(`/admin/products/${product.id}?saved=1`);
  }
  } catch (e) {
    // Re-throw Next.js redirect/notFound so the framework can handle navigation
    if ((e as { digest?: string }).digest?.startsWith('NEXT_REDIRECT')) throw e;
    return { error: (e as Error).message ?? 'Unexpected error.' };
  }
  return null;
}

export async function archiveProduct(productId: string) {
  await requireAdmin();
  await supabaseAdmin.from('products').update({ status: 'archived' }).eq('id', productId);
  revalidatePath('/admin/products');
  redirect('/admin/products');
}
