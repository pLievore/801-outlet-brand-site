import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Panel photo uploads arrive as FormData (resized client-side to
      // ~<1.5 MB each); Vercel still caps any request at ~4.5 MB.
      bodySizeLimit: '8mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
    ],
  },
  turbopack: {
    // Prevent Next.js from selecting the parent directory when multiple
    // package-lock files exist on the development machine.
    root: process.cwd(),
  },
  async redirects() {
    // Public URLs served by the current Shopify theme (from its sitemap on
    // July 15, 2026) mapped to the headless routes, so equity and bookmarks
    // survive the DNS cutover. Content pages without a dedicated equivalent
    // point to the closest destination; see docs/17 for pending decisions.
    const permanent = true;
    const pageRedirects = [
      ['about-us', '/about'],
      ['contact', '/contact'],
      ['visit-our-showroom', '/showroom'],
      ['test-showroom-booking', '/showroom'],
      ['shipping-information', '/delivery'],
      ['delivery-policy', '/delivery'],
      ['privacy-policy', '/privacy'],
      ['cookies-policy', '/privacy'],
      ['data-sharing-opt-out', '/privacy'],
      ['terms-of-service', '/terms'],
      ['refund-policy', '/terms'],
      ['returns-refunds', '/terms'],
      ['warranty-policy', '/terms'],
      ['payment-policy', '/terms'],
      ['faqs', '/contact'],
    ].map(([handle, destination]) => ({
      source: `/pages/${handle}`,
      destination,
      permanent,
    }));

    return [
      ...pageRedirects,
      // Shopify's canonical policy URLs.
      { source: '/policies/privacy-policy', destination: '/privacy', permanent },
      { source: '/policies/terms-of-service', destination: '/terms', permanent },
      { source: '/policies/refund-policy', destination: '/terms', permanent },
      { source: '/policies/shipping-policy', destination: '/delivery', permanent },
      // Theme search → catalog search (keeps the q parameter).
      { source: '/search', destination: '/products', permanent },
      // Blog exists only in the backlog; send visitors home for now.
      { source: '/blogs/:path*', destination: '/', permanent: false },
      // Remaining theme page handles without an equivalent.
      { source: '/pages/:path*', destination: '/', permanent: false },
    ];
  },
};

export default nextConfig;
