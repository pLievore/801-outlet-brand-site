import type { Metadata } from 'next';
import Image from 'next/image';
import { Instagram } from 'lucide-react';

import {
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
} from '../../src/lib/content/social';
import { buttonStyles } from '../components/ui/button';
import { NewTabHint } from '../components/ui/new-tab-hint';

export const metadata: Metadata = {
  title: 'Under maintenance — 801 Outlet',
  description:
    'Our site is temporarily under maintenance. Reach us on Instagram.',
};

export default function MaintenancePage() {
  return (
    <main className="relative mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-5 py-20 text-center">
      <span className="relative size-16 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-[rgb(var(--border))]">
        <Image
          src="/brand/icon-512x512.png"
          alt="801 Outlet"
          fill
          sizes="64px"
          className="object-contain p-2"
          priority
        />
      </span>

      <div className="mt-8 text-xs font-semibold uppercase tracking-[0.32em] text-[rgb(var(--muted))]">
        Under maintenance
      </div>

      <h1 className="mt-5 font-display text-5xl font-medium leading-[0.95] tracking-tight md:text-7xl">
        We&rsquo;ll be
        <br />
        <span className="italic text-[rgb(var(--accent))]">right back.</span>
      </h1>

      <p className="mt-6 max-w-md text-sm leading-relaxed text-[rgb(var(--muted))]">
        We&rsquo;re making a few improvements to the site. If you&rsquo;d like
        to get in touch, send us a message on Instagram.
      </p>

      <div className="mt-10 flex w-full max-w-xs justify-center">
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noreferrer"
          className={buttonStyles({
            variant: 'primary',
            size: 'lg',
            className: 'w-full',
          })}
        >
          <Instagram aria-hidden="true" className="size-4 shrink-0" />
          Message us on Instagram
          <NewTabHint />
        </a>
      </div>

      <p className="mt-6 text-xs text-[rgb(var(--muted))]">
        {INSTAGRAM_HANDLE}
      </p>

      <div className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 mx-auto h-72 max-w-md -translate-y-1/2 rounded-full bg-[rgb(var(--accent))]/10 blur-3xl" />
    </main>
  );
}
