import './globals.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { Geist, Fraunces } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { env } from '../src/config/env';

const geistSans = Geist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist-sans',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  axes: ['SOFT', 'opsz'],
  variable: '--font-fraunces',
});

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: '801 Outlet — Premium Furniture Deals in Utah',
  description:
    'Sofas, beds, recliners and more. Utah-only delivery. Browse products and shop online.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${fraunces.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
