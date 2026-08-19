import type { MetadataRoute } from 'next';
import { env } from '../src/config/env';
import { POLICY_LAST_UPDATED } from '../src/lib/content/policies';
import { getCollections, getProducts } from '../src/lib/shopify';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.siteUrl.replace(/\/$/, '');
  const now = new Date();
  // Policy pages change on a review, not on a deploy — dating them by their
  // actual revision keeps crawlers from re-fetching unchanged legal text.
  const policyUpdated = POLICY_LAST_UPDATED;

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, priority: 1, changeFrequency: 'weekly' },
    { url: `${base}/products`, lastModified: now, priority: 0.9, changeFrequency: 'daily' },
    { url: `${base}/showroom`, lastModified: now, priority: 0.7, changeFrequency: 'monthly' },
    { url: `${base}/about`, lastModified: now, priority: 0.5, changeFrequency: 'monthly' },
    { url: `${base}/delivery`, lastModified: policyUpdated, priority: 0.5, changeFrequency: 'monthly' },
    { url: `${base}/contact`, lastModified: now, priority: 0.5, changeFrequency: 'monthly' },
    { url: `${base}/pickup`, lastModified: policyUpdated, priority: 0.4, changeFrequency: 'yearly' },
    { url: `${base}/returns`, lastModified: policyUpdated, priority: 0.4, changeFrequency: 'yearly' },
    { url: `${base}/privacy`, lastModified: policyUpdated, priority: 0.3, changeFrequency: 'yearly' },
    { url: `${base}/terms`, lastModified: policyUpdated, priority: 0.3, changeFrequency: 'yearly' },
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
