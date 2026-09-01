import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { env } from '../../../../src/config/env';
import { safeJsonLd } from '../../../../src/lib/seo';
import {
  getCollectionByHandle,
  getCollections,
} from '../../../../src/lib/shopify';
import { sortAvailableFirst } from '../../../../src/lib/catalog/ordering';
import { adaptProductCard } from '../../../../src/lib/shopify/adapters/products';
import { CatalogProductCard } from '../../../components/catalog-product-card';
import {
  FadeIn,
  FadeMount,
  StaggerGrid,
  StaggerItem,
} from '../../../components/motion';

export const revalidate = 300;

type PageProps = { params: Promise<{ handle: string }> };

export async function generateStaticParams() {
  const collections = await getCollections({ first: 100 });
  return collections.nodes.map((collection) => ({
    handle: collection.handle,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const collection = await getCollectionByHandle({ handle, first: 1 });

  if (!collection) return { title: 'Collection not found — 801 Outlet' };

  const title = collection.seo.title || collection.title;
  const description =
    collection.seo.description || collection.description || undefined;

  return {
    title: `${title} — 801 Outlet`,
    description,
    alternates: { canonical: `/collections/${collection.handle}` },
    openGraph: {
      title,
      description,
      images: collection.image ? [{ url: collection.image.url }] : undefined,
    },
  };
}

export default async function CollectionPage({ params }: PageProps) {
  const { handle } = await params;
  const collection = await getCollectionByHandle({ handle, first: 24 });

  if (!collection) notFound();

  // Sellable pieces lead the grid here too, not just on /products.
  const products = sortAvailableFirst(
    collection.products.nodes.map(adaptProductCard)
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: collection.seo.title || collection.title,
    description: collection.seo.description || collection.description || undefined,
    url: `${env.siteUrl}/collections/${collection.handle}`,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Products',
          item: `${env.siteUrl}/products`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: collection.title,
          item: `${env.siteUrl}/collections/${collection.handle}`,
        },
      ],
    },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: products.length,
      itemListElement: products.map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: product.title,
        url: `${env.siteUrl}/products/${product.handle}`,
      })),
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      <FadeMount delay={0} distance={10} duration={0.35}>
        <Link
          className="text-xs font-semibold tracking-[0.18em] text-[rgb(var(--muted))] transition hover:text-[rgb(var(--fg))]"
          href="/products"
        >
          ← ALL PRODUCTS
        </Link>
      </FadeMount>

      <section
        className={
          'mt-6 overflow-hidden rounded-3xl border border-[rgb(var(--border))] bg-white ' +
          (collection.image ? 'grid md:grid-cols-[1.05fr_0.95fr]' : '')
        }
      >
        <FadeMount delay={0.05} distance={20}>
          <div className="flex h-full flex-col justify-center p-7 sm:p-10 md:p-12">
            <p className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--accent))]">
              SHOP THE COLLECTION
            </p>
            <h1 className="mt-4 font-display text-4xl font-medium tracking-tight sm:text-5xl md:text-6xl">
              {collection.title}
            </h1>
            {collection.description ? (
              <p className="mt-5 max-w-2xl text-sm leading-relaxed text-[rgb(var(--muted))] sm:text-base">
                {collection.description}
              </p>
            ) : null}
            <p className="mt-6 text-xs font-medium text-[rgb(var(--muted))]">
              {products.length} {products.length === 1 ? 'piece' : 'pieces'} shown
            </p>
          </div>
        </FadeMount>

        {collection.image ? (
          <div className="relative min-h-72 bg-neutral-100 md:min-h-[26rem]">
            <Image
              src={collection.image.url}
              alt={collection.image.altText || collection.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 45vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent" />
          </div>
        ) : null}
      </section>

      {products.length > 0 ? (
        <section className="mt-12 md:mt-16">
          <FadeIn>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--muted))]">
                  CURATED FURNITURE
                </p>
                <h2 className="mt-3 font-display text-3xl font-medium tracking-tight md:text-4xl">
                  Explore the <span className="italic">collection</span>
                </h2>
              </div>
            </div>
          </FadeIn>

          <StaggerGrid className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <StaggerItem key={product.id}>
                <CatalogProductCard product={product} />
              </StaggerItem>
            ))}
          </StaggerGrid>
        </section>
      ) : (
        <section className="mt-12 rounded-3xl border border-dashed border-[rgb(var(--border))] bg-white px-6 py-16 text-center">
          <h2 className="font-display text-3xl font-medium">
            New pieces are on the way
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-[rgb(var(--muted))]">
            This collection is currently empty. Browse the complete catalog for
            available furniture.
          </p>
          <Link
            href="/products"
            className="mt-7 inline-flex rounded-full bg-[rgb(var(--fg))] px-6 py-3 text-sm font-semibold text-white"
          >
            Browse all products
          </Link>
        </section>
      )}
    </div>
  );
}
