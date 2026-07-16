import type { MetadataRoute } from 'next';
import { env } from '../src/config/env';

export default function robots(): MetadataRoute.Robots {
  const base = env.siteUrl.replace(/\/$/, '');

  // Homologation deploys must never be indexed. Indexing is only allowed
  // when this deployment is explicitly marked as the public site.
  if (process.env.NEXT_PUBLIC_ALLOW_INDEXING !== 'true') {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
    };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/account/'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
