import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getAllActiveProductSlugs,
  getProductBySlug,
  getRelatedProducts,
} from '../../../../src/lib/products';
import { formatUsdCents } from '../../../../src/lib/format';
import { ProductCard } from '../../../components/product-card';
import { AddToCartButton } from '../../../components/add-to-cart-button';
import { ProductGallery } from '../../../components/product-gallery';
import { FadeIn, FadeMount, StaggerGrid, StaggerItem } from '../../../components/motion';

export const revalidate = 60;

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getAllActiveProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'Product not found — 801 Outlet' };

  return {
    title: `${product.name} — 801 Outlet`,
    description: product.description ?? undefined,
    openGraph: {
      title: product.name,
      description: product.description ?? undefined,
      images: product.images[0] ? [{ url: product.images[0].url }] : undefined,
    },
  };
}

const SPEC_LABELS: Record<string, string> = {
  material: 'Material',
  color: 'Color',
  dimensions: 'Dimensions',
  seating: 'Seating',
  condition: 'Condition',
};

function specEntries(attributes: Record<string, unknown>) {
  return Object.entries(SPEC_LABELS).flatMap(([key, label]) => {
    const value = attributes[key];
    if (typeof value !== 'string' || value.length === 0) return [];
    return [{ key, label, value }];
  });
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const p = await getProductBySlug(slug);

  if (!p) notFound();

  const related = await getRelatedProducts(slug, 4);

  const specs = specEntries(p.attributes);
  const showLowStock = p.stockQty > 0 && p.stockQty <= 3;
  const inStock = p.stockQty > 0;

  // Product JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: p.name,
    description: p.description ?? undefined,
    sku: p.sku,
    image: p.images.map((i) => i.url),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: (p.priceCents / 100).toFixed(2),
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <FadeMount delay={0} distance={10} duration={0.35}>
        <Link
          className="text-xs font-semibold tracking-[0.18em] text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition"
          href="/products"
        >
          ← BACK TO CATALOG
        </Link>
      </FadeMount>

      <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* LEFT: Gallery */}
        <FadeMount delay={0.05} distance={24}>
          <ProductGallery images={p.images} productName={p.name} />
        </FadeMount>

        {/* RIGHT: Details */}
        <FadeMount delay={0.15} distance={24}>
          <div className="flex flex-col">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">{p.name}</h1>

            <div className="mt-3 flex items-end gap-3">
              <div className="text-2xl font-semibold">{formatUsdCents(p.priceCents)}</div>
              {p.compareAtPriceCents && p.compareAtPriceCents > p.priceCents ? (
                <div className="text-sm text-[rgb(var(--muted))] line-through">
                  {formatUsdCents(p.compareAtPriceCents)}
                </div>
              ) : null}
            </div>

            {p.description ? (
              <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--muted))]">
                {p.description}
              </p>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-2 text-xs">
              <span
                className={
                  'rounded-full border px-3 py-1 font-medium ' +
                  (inStock
                    ? 'border-green-200 bg-green-50 text-green-800'
                    : 'border-[rgb(var(--border))] bg-white text-[rgb(var(--muted))]')
                }
              >
                {inStock ? '✓ In stock' : 'Out of stock'}
              </span>
              {showLowStock ? (
                <span className="rounded-full border border-[rgb(var(--accent))] bg-[rgb(var(--accent))]/10 px-3 py-1 font-semibold text-[rgb(var(--accent))]">
                  Only {p.stockQty} left
                </span>
              ) : null}
              <span className="rounded-full border border-[rgb(var(--border))] bg-white px-3 py-1">
                🚚 Utah delivery
              </span>
            </div>

            {/* Add to cart */}
            <div className="mt-7">
              <AddToCartButton
                item={{
                  variantId: p.variantId,
                  productSlug: p.slug,
                  productName: p.name,
                  variantName: p.sku.replace(`${p.slug}-`, ''),
                  sku: p.sku,
                  unitPriceCents: p.priceCents,
                  imageUrl: p.images[0]?.url ?? null,
                }}
                stockQty={p.stockQty}
              />
            </div>

            {specs.length > 0 ? (
              <div className="mt-7 rounded-2xl border border-[rgb(var(--border))] bg-white p-5">
                <div className="text-sm font-semibold">Details</div>

                <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                  {specs.map((s) => (
                    <div key={s.key}>
                      <dt className="text-xs text-[rgb(var(--muted))]">{s.label}</dt>
                      <dd className="font-medium">{s.value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-4 text-xs text-[rgb(var(--muted))]">
                  Delivery is available in Utah only. After purchase, we&apos;ll confirm a delivery
                  window.
                </div>
              </div>
            ) : null}
          </div>
        </FadeMount>
      </div>

      {related.length > 0 ? (
        <section className="mt-16">
          <FadeIn>
            <div className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--muted))]">
              YOU MAY ALSO LIKE
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
              Similar pieces
            </h2>
          </FadeIn>

          <StaggerGrid className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {related.map((rp) => (
              <StaggerItem key={rp.slug}>
                <ProductCard p={rp} />
              </StaggerItem>
            ))}
          </StaggerGrid>
        </section>
      ) : null}
    </div>
  );
}
