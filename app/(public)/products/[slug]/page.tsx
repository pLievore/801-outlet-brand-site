import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ShieldCheck, Store, Truck } from 'lucide-react';

import { env } from '../../../../src/config/env';
import {
  PRODUCT_ATTRIBUTES,
  parseFeatures,
} from '../../../../src/lib/catalog/attributes';
import {
  getAvailability,
  type AvailabilityState,
} from '../../../../src/lib/catalog/availability';
import { pickRelatedByPrice } from '../../../../src/lib/catalog/related';
import { formatMoney } from '../../../../src/lib/format';
import { safeJsonLd } from '../../../../src/lib/seo';
import {
  getProductByHandle,
  getProducts,
} from '../../../../src/lib/shopify';
import {
  adaptProductCard,
  adaptProductDetail,
} from '../../../../src/lib/shopify/adapters/products';
import { PurchasePanel } from '../../../components/cart/purchase-panel';
import { CatalogProductCard } from '../../../components/catalog-product-card';
import { TrackEvent } from '../../../components/track-event';
import { TrackProductInterest } from '../../../components/track-product-interest';
import {
  FadeIn,
  FadeMount,
  StaggerGrid,
  StaggerItem,
} from '../../../components/motion';
import { ProductGallery } from '../../../components/product-gallery';

export const revalidate = 300;

type PageProps = { params: Promise<{ slug: string }> };

/** How each availability state reads to a shopping crawler. */
const OFFER_AVAILABILITY: Record<AvailabilityState, string> = {
  'in-stock': 'https://schema.org/InStock',
  dropship: 'https://schema.org/BackOrder',
  'coming-soon': 'https://schema.org/PreOrder',
  'sold-out': 'https://schema.org/OutOfStock',
};

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
  // Sold out vs Coming soon vs shipping from the supplier: the operator marks
  // the difference in Shopify instead of deleting the product, and the count
  // tells a piece on the floor from one that is ordered in. See
  // `catalog/availability`.
  const availability = getAvailability({
    availableForSale: inStock,
    tags: product.tags,
    quantityAvailable: primaryVariant?.quantityAvailable,
  });
  // No count is shown to the shopper. The page says whether a piece can be
  // bought, not how nearly gone it is — how many are left is the shop's
  // business, and putting a number on it turns stock into a nudge.
  // Shopify's own recommendations learn from order history this shop does not
  // have yet, so they paired pieces across wildly different budgets. Price is
  // the signal that means something here — see `catalog/related`.
  const related = pickRelatedByPrice(
    (await getProducts({ first: 100 })).nodes.map(adaptProductCard),
    { id: product.id, price },
    4
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
      // A piece sold from the supplier is on back order, not out of stock:
      // OutOfStock would have Google drop it from the shopping surfaces it is
      // still perfectly buyable on.
      availability: OFFER_AVAILABILITY[
        getAvailability({
          availableForSale: variant.availableForSale,
          tags: product.tags,
          quantityAvailable: variant.quantityAvailable,
        }).state
      ],
      url: `${env.siteUrl}/products/${product.handle}`,
    })),
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:py-14">
      <TrackEvent step="product_view" handle={product.handle} />
      <TrackProductInterest
        handle={product.handle}
        title={product.title}
        image={product.images[0]?.url}
        price={formatMoney(price)}
      />
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
              <span className="rounded-full border border-[rgb(var(--border))] bg-white px-3 py-1">
                Delivery & pickup at checkout
              </span>
            </div>

            <div className="mt-8 rounded-2xl border border-[rgb(var(--border))] bg-white p-5">
              <PurchasePanel
                options={product.options}
                variants={product.variants}
                unavailableLabel={availability.label}
                productTags={product.tags}
                productHandle={product.handle}
                productTitle={product.title}
              />
              <a
                href={smsHref}
                className="mt-4 flex w-full items-center justify-center rounded-full border border-[rgb(var(--border))] px-6 py-3 text-sm font-semibold transition hover:bg-neutral-50"
              >
                Text us about this piece
              </a>
            </div>

            {/* Local Utah Trust & Delivery signals */}
            <div className="mt-5 rounded-2xl border border-[rgb(var(--border))] bg-neutral-50/70 p-4 text-xs">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg border border-[rgb(var(--border))] bg-white text-[rgb(var(--accent))] shadow-xs">
                    <Truck className="size-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-[rgb(var(--fg))]">Fast Utah Delivery</p>
                    <p className="text-[rgb(var(--muted))] leading-relaxed">
                      Doorstep or room-of-choice delivery across Salt Lake County and Utah Valley.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg border border-[rgb(var(--border))] bg-white text-[rgb(var(--sage-ink))] shadow-xs">
                    <Store className="size-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-[rgb(var(--fg))]">Free Showroom Pickup</p>
                    <p className="text-[rgb(var(--muted))] leading-relaxed">
                      Inspect and pick up in South Salt Lake during weekend hours or by appointment.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg border border-[rgb(var(--border))] bg-white text-emerald-700 shadow-xs">
                    <ShieldCheck className="size-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-[rgb(var(--fg))]">100% In-Person Guarantee</p>
                    <p className="text-[rgb(var(--muted))] leading-relaxed">
                      No surprises. See actual floor photos or test sit before completing your order.
                    </p>
                  </div>
                </div>
              </div>
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
