import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {
    // Prevent Next.js from selecting the parent directory when multiple
    // package-lock files exist on the development machine.
    root: process.cwd(),
  },
};

export default nextConfig;
