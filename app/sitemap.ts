import type { MetadataRoute } from 'next';
import { env } from '../src/config/env';
import { getCollections, getProducts } from '../src/lib/shopify';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.siteUrl.replace(/\/$/, '');
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, priority: 1, changeFrequency: 'weekly' },
    { url: `${base}/products`, lastModified: now, priority: 0.9, changeFrequency: 'daily' },
    { url: `${base}/about`, lastModified: now, priority: 0.5, changeFrequency: 'monthly' },
    { url: `${base}/delivery`, lastModified: now, priority: 0.5, changeFrequency: 'monthly' },
    { url: `${base}/contact`, lastModified: now, priority: 0.5, changeFrequency: 'monthly' },
    { url: `${base}/privacy`, lastModified: now, priority: 0.3, changeFrequency: 'yearly' },
    { url: `${base}/terms`, lastModified: now, priority: 0.3, changeFrequency: 'yearly' },
  ];

  const [products, collections] = await Promise.all([
    getProducts({ first: 250 }),
    getCollections({ first: 100 }),
  ]);
  const productRoutes: MetadataRoute.Sitemap = products.nodes.map((product) => ({
    url: `${base}/products/${product.handle}`,
    lastModified: new Date(product.updatedAt),
    priority: 0.7,
    changeFrequency: 'weekly',
  }));
  const collectionRoutes: MetadataRoute.Sitemap = collections.nodes.map(
    (collection) => ({
      url: `${base}/collections/${collection.handle}`,
      lastModified: new Date(collection.updatedAt),
      priority: 0.8,
      changeFrequency: 'daily',
    })
  );

  return [...staticRoutes, ...collectionRoutes, ...productRoutes];
}
