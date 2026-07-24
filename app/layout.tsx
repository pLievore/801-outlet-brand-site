import './globals.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { Geist, Instrument_Serif } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { env } from '../src/config/env';

const geistSans = Geist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist-sans',
});

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  display: 'swap',
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
});

const SITE_TITLE = '801 Outlet — Premium Furniture Deals in Utah';
const SITE_DESCRIPTION =
  'Sofas, beds, recliners and more. Utah-only delivery. Browse products and shop online.';

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  // Icons and preview images come from the app/ file conventions
  // (favicon.ico, icon.png, apple-icon.png, opengraph-image.png).
  openGraph: {
    type: 'website',
    siteName: '801 Outlet',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: env.siteUrl,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${instrumentSerif.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
