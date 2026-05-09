import type { MetadataRoute } from 'next';
import { env } from '../src/config/env';

export default function robots(): MetadataRoute.Robots {
  const base = env.siteUrl.replace(/\/$/, '');
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
