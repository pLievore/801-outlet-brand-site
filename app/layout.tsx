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

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: '801 Outlet — Premium Furniture Deals in Utah',
  description:
    'Sofas, beds, recliners and more. Utah-only delivery. Browse products and shop online.',
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
