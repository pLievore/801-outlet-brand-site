import type { MetadataRoute } from 'next';
import { env } from '../src/config/env';
import { getAllActiveProductSlugs } from '../src/lib/products';

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

  const slugs = await getAllActiveProductSlugs();
  const productRoutes: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${base}/products/${slug}`,
    lastModified: now,
    priority: 0.7,
    changeFrequency: 'weekly',
  }));

  return [...staticRoutes, ...productRoutes];
}
