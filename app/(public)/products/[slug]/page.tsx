import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { env } from '../../../../src/config/env';
import {
  PRODUCT_ATTRIBUTES,
  parseFeatures,
} from '../../../../src/lib/catalog/attributes';
import { getAvailability } from '../../../../src/lib/catalog/availability';
import { sortAvailableFirst } from '../../../../src/lib/catalog/ordering';
import { formatMoney } from '../../../../src/lib/format';
import { safeJsonLd } from '../../../../src/lib/seo';
import {
  getProductByHandle,
  getProducts,
  getRelatedProducts,
} from '../../../../src/lib/shopify';
import {
  adaptProductCard,
  adaptProductDetail,
} from '../../../../src/lib/shopify/adapters/products';
import { PurchasePanel } from '../../../components/cart/purchase-panel';
import { CatalogProductCard } from '../../../components/catalog-product-card';
import { TrackEvent } from '../../../components/track-event';
import {
  FadeIn,
  FadeMount,
  StaggerGrid,
  StaggerItem,
} from '../../../components/motion';
import { ProductGallery } from '../../../components/product-gallery';

export const revalidate = 300;

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const products = await getProducts({ first: 250 });
  return products.nodes.map((product) => ({ slug: product.handle }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const shopifyProduct = await getProductByHandle(slug);

  if (!shopifyProduct) return { title: 'Product not found — 801 Outlet' };

  const product = adaptProductDetail(shopifyProduct);
  const title = product.seo.title || product.title;
  const description = product.seo.description || product.description || undefined;

  return {
    title: `${title} — 801 Outlet`,
    description,
    alternates: { canonical: `/products/${product.handle}` },
    openGraph: {
      title,
      description,
      type: 'website',
      images: product.images[0]
        ? [
            {
              url: product.images[0].url,
              width: product.images[0].width ?? undefined,
              height: product.images[0].height ?? undefined,
              alt: product.images[0].alt || product.title,
            },
          ]
        : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const shopifyProduct = await getProductByHandle(slug);

  if (!shopifyProduct) notFound();

  const product = adaptProductDetail(shopifyProduct);
  const primaryVariant =
    product.variants.find((variant) => variant.availableForSale) ??
    product.variants[0];
  const price = primaryVariant?.price ?? product.price;
  const compareAtPrice =
    primaryVariant?.compareAtPrice ?? product.compareAtPrice;
  const inStock = Boolean(primaryVariant?.availableForSale);
  // Sold out vs Coming soon: the operator marks the difference with a tag in
  // Shopify instead of deleting the product. See `catalog/availability`.
  const availability = getAvailability({ availableForSale: inStock, tags: product.tags });
  const quantity = primaryVariant?.quantityAvailable ?? null;
  const showLowStock = inStock && quantity !== null && quantity <= 3;
  const related = sortAvailableFirst(
    (await getRelatedProducts(product.id, 4)).map(adaptProductCard)
  );
  const smsHref = env.getSmsHref(
    `Hi 801 Outlet, I would like more information about ${product.title}: ${env.siteUrl}/products/${product.handle}`
  );
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description ?? undefined,
    image: product.images.map((image) => image.url),
    sku: primaryVariant?.sku ?? undefined,
    brand: product.vendor
      ? { '@type': 'Brand', name: product.vendor }
      : undefined,
    url: `${env.siteUrl}/products/${product.handle}`,
    offers: product.variants.map((variant) => ({
      '@type': 'Offer',
      price: variant.price.amount,
      priceCurrency: variant.price.currencyCode,
      sku: variant.sku ?? undefined,
      availability: variant.availableForSale
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `${env.siteUrl}/products/${product.handle}`,
    })),
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:py-14">
      <TrackEvent step="product_view" handle={product.handle} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />

      <FadeMount delay={0} distance={10} duration={0.35}>
        <Link
          className="text-xs font-semibold tracking-[0.18em] text-[rgb(var(--muted))] transition hover:text-[rgb(var(--fg))]"
          href="/products"
        >
          ← BACK TO COLLECTION
        </Link>
      </FadeMount>

      <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10">
        <FadeMount delay={0.05} distance={24}>
          {product.images.length > 0 ? (
            <ProductGallery
              images={product.images}
              productName={product.title}
            />
          ) : (
            <div className="flex aspect-4/3 items-center justify-center rounded-3xl border border-[rgb(var(--border))] bg-neutral-100 text-sm font-medium text-[rgb(var(--muted))]">
              Product imagery coming soon
            </div>
          )}
        </FadeMount>

        <FadeMount delay={0.15} distance={24}>
          <div className="flex flex-col">
            {product.vendor ? (
              <p className="text-xs font-semibold tracking-[0.2em] text-[rgb(var(--accent))]">
                {product.vendor.toUpperCase()}
              </p>
            ) : null}
            <h1 className="mt-3 font-display text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
              {product.title}
            </h1>

            <div className="mt-5 flex items-end gap-3">
              <div className="text-2xl font-semibold">
                {formatMoney(price)}
              </div>
              {compareAtPrice ? (
                <div className="pb-0.5 text-sm text-[rgb(var(--muted))] line-through">
                  {formatMoney(compareAtPrice)}
                </div>
              ) : null}
            </div>

            {product.description ? (
              <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-[rgb(var(--muted))]">
                {product.description}
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-2 text-xs">
              <span
                className={
                  'rounded-full border px-3 py-1 font-medium ' +
                  (inStock
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-[rgb(var(--border))] bg-white text-[rgb(var(--muted))]')
                }
              >
                {inStock ? `✓ ${availability.label}` : availability.label}
              </span>
              {showLowStock ? (
                <span className="rounded-full border border-[rgb(var(--accent))] bg-[rgb(var(--accent))]/10 px-3 py-1 font-semibold text-[rgb(var(--accent))]">
                  Only {quantity} left
                </span>
              ) : null}
              <span className="rounded-full border border-[rgb(var(--border))] bg-white px-3 py-1">
                Delivery & pickup at checkout
              </span>
            </div>

            <div className="mt-8 rounded-2xl border border-[rgb(var(--border))] bg-white p-5">
              <PurchasePanel
                options={product.options}
                variants={product.variants}
                unavailableLabel={availability.label}
                productHandle={product.handle}
              />
              <a
                href={smsHref}
                className="mt-4 flex w-full items-center justify-center rounded-full border border-[rgb(var(--border))] px-6 py-3 text-sm font-semibold transition hover:bg-neutral-50"
              >
                Text us about this piece
              </a>
            </div>

            <div className="mt-7 rounded-2xl border border-[rgb(var(--border))] bg-white p-5">
              <div className="text-sm font-semibold">Product details</div>
              <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                {product.productType ? (
                  <div>
                    <dt className="text-xs text-[rgb(var(--muted))]">Type</dt>
                    <dd className="font-medium">{product.productType}</dd>
                  </div>
                ) : null}
                {primaryVariant?.sku ? (
                  <div>
                    <dt className="text-xs text-[rgb(var(--muted))]">SKU</dt>
                    <dd className="font-medium">{primaryVariant.sku}</dd>
                  </div>
                ) : null}
                {primaryVariant?.selectedOptions
                  .filter((option) => option.name.toLowerCase() !== 'title')
                  .map((option) => (
                    <div key={option.name}>
                      <dt className="text-xs text-[rgb(var(--muted))]">
                        {option.name}
                      </dt>
                      <dd className="font-medium">{option.value}</dd>
                    </div>
                  ))}
                {PRODUCT_ATTRIBUTES.filter(
                  (spec) =>
                    spec.key !== 'features' &&
                    product.attributes[spec.key] &&
                    // Some products carry colour as a variant option, which is
                    // already listed above — don't say it twice.
                    !primaryVariant?.selectedOptions.some(
                      (option) =>
                        option.name.toLowerCase() === spec.label.toLowerCase()
                    )
                ).map((spec) => (
                  <div key={spec.key}>
                    <dt className="text-xs text-[rgb(var(--muted))]">
                      {spec.label}
                    </dt>
                    <dd className="font-medium">{product.attributes[spec.key]}</dd>
                  </div>
                ))}
              </dl>

              {product.attributes.features ? (
                <div className="mt-5 border-t border-[rgb(var(--border))] pt-4">
                  <div className="text-xs text-[rgb(var(--muted))]">Features</div>
                  <ul className="mt-2 space-y-1.5 text-sm">
                    {parseFeatures(product.attributes.features).map((feature) => (
                      <li key={feature} className="flex gap-2">
                        <span
                          aria-hidden="true"
                          className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[rgb(var(--accent))]"
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <p className="mt-4 text-xs leading-relaxed text-[rgb(var(--muted))]">
                Delivery and pickup availability are confirmed during Shopify
                checkout.
              </p>
            </div>
          </div>
        </FadeMount>
      </div>

      {related.length > 0 ? (
        <section className="mt-16">
          <FadeIn>
            <p className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--muted))]">
              YOU MAY ALSO LIKE
            </p>
            <h2 className="mt-3 font-display text-3xl font-medium tracking-tight md:text-4xl">
              Similar <span className="italic">pieces</span>
            </h2>
          </FadeIn>

          <StaggerGrid className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {related.map((relatedProduct) => (
              <StaggerItem key={relatedProduct.id}>
                <CatalogProductCard product={relatedProduct} />
              </StaggerItem>
            ))}
          </StaggerGrid>
        </section>
      ) : null}
    </div>
  );
}
