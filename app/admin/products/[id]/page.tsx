import { notFound } from 'next/navigation';
import { supabaseAdmin } from '../../../../src/lib/supabase/admin';
import { ProductForm } from '../product-form';
import { ArchiveButton } from './archive-button';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}

export default async function EditProductPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const saved = sp.saved === '1';

  const { data: p } = await supabaseAdmin
    .from('products')
    .select('id, name, description, status, is_featured, created_at')
    .eq('id', id)
    .single();

  if (!p) notFound();

  const { data: variants } = await supabaseAdmin
    .from('product_variants')
    .select('id, sku, price_cents, compare_at_price_cents, stock_qty, low_stock_threshold')
    .eq('product_id', id)
    .order('created_at')
    .limit(1);

  const { data: images } = await supabaseAdmin
    .from('product_images')
    .select('url, sort_order')
    .eq('product_id', id)
    .order('sort_order');

  const variant = (variants ?? [])[0];
  const sortedImages = (images ?? []).sort((a, b) => a.sort_order - b.sort_order);

  const product = {
    id: p.id,
    name: p.name,
    description: p.description,
    status: p.status,
    isFeatured: p.is_featured,
    sku: variant?.sku ?? '',
    priceCents: variant?.price_cents ?? 0,
    compareCents: variant?.compare_at_price_cents ?? null,
    stockQty: variant?.stock_qty ?? 0,
    lowStockThreshold: variant?.low_stock_threshold ?? 5,
    imageUrl: sortedImages[0]?.url ?? '',
  };

  return (
    <div className="px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <a href="/admin/products" className="text-sm text-neutral-400 hover:text-white transition">
          ← Products
        </a>
        <ArchiveButton productId={id} />
      </div>
      <h1 className="text-xl font-bold text-white">Edit: {p.name}</h1>
      <ProductForm product={product} saved={saved} />
    </div>
  );
}
