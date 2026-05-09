/**
 * Seed script — populates Supabase with the legacy products from src/data/products.ts.
 *
 * Run:
 *   npm run db:seed
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.
 * Idempotent: safe to re-run.
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/lib/supabase/database.types';
import { products as legacyProducts } from '../src/data/products';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error(
    '✗ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n' +
      '  Set them in .env.local and run again.'
  );
  process.exit(1);
}

const supabase = createClient<Database>(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  console.log(`Seeding ${legacyProducts.length} products into ${url}…`);

  const { data: dbCategories, error: catErr } = await supabase
    .from('categories')
    .select('id, slug');
  if (catErr) throw catErr;
  const categoryIdBySlug = new Map(dbCategories.map((c) => [c.slug, c.id]));

  for (const lp of legacyProducts) {
    // 1. Upsert product (status=active so RLS makes it publicly readable)
    const { data: product, error: pErr } = await supabase
      .from('products')
      .upsert(
        {
          slug: lp.slug,
          name: lp.title,
          description: lp.shortDescription,
          status: 'active',
          is_featured: false,
        },
        { onConflict: 'slug' }
      )
      .select('id')
      .single();
    if (pErr) throw pErr;
    const productId = product.id;

    // 2. Upsert default variant
    const sku = `${lp.slug}-default`;
    const { error: vErr } = await supabase.from('product_variants').upsert(
      {
        product_id: productId,
        sku,
        name: 'Default',
        price_cents: lp.price * 100,
        compare_at_price_cents: lp.compareAtPrice ? lp.compareAtPrice * 100 : null,
        stock_qty: lp.inStock ? 10 : 0,
        low_stock_threshold: 3,
        attributes: lp.specs as unknown as Database['public']['Tables']['product_variants']['Insert']['attributes'],
        is_default: true,
      },
      { onConflict: 'sku' }
    );
    if (vErr) throw vErr;

    // 3. Replace product images (simpler than diffing)
    const { error: delImgErr } = await supabase
      .from('product_images')
      .delete()
      .eq('product_id', productId);
    if (delImgErr) throw delImgErr;

    if (lp.images.length > 0) {
      const imagesPayload = lp.images.map((img, i) => ({
        product_id: productId,
        url: img.src,
        alt: img.alt,
        sort_order: i,
      }));
      const { error: insImgErr } = await supabase
        .from('product_images')
        .insert(imagesPayload);
      if (insImgErr) throw insImgErr;
    }

    // 4. Link to category
    const categoryId = categoryIdBySlug.get(lp.category);
    if (categoryId) {
      const { error: pcErr } = await supabase.from('product_categories').upsert(
        { product_id: productId, category_id: categoryId },
        { onConflict: 'product_id,category_id' }
      );
      if (pcErr) throw pcErr;
    } else {
      console.warn(`  ! Category "${lp.category}" not found — skipping link for ${lp.slug}`);
    }

    console.log(`  ✓ ${lp.slug}`);
  }

  console.log('Done.');
}

main().catch((e) => {
  console.error('✗ Seed failed:', e);
  process.exit(1);
});
