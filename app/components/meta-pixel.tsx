'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * The Meta Pixel.
 *
 * Deliberately absent until now (D-017, D-024): the funnel counts visits with
 * no cookie and no identifier, and the pixel is the opposite of that — it sets
 * `_fbp`, follows the visitor across sites and reports back to Meta. It is here
 * because the shop is buying ads, and an ad platform cannot optimise for sales
 * it never learns about.
 *
 * It loads only on the storefront, never in the panel: what the operator does
 * all day is not shopper behaviour, and feeding it to Meta would teach the
 * campaigns the wrong thing.
 *
 * Nothing loads without `NEXT_PUBLIC_META_PIXEL_ID`, so a deployment that has
 * not been given an id carries no tracking at all.
 */

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

/** True when a pixel id is configured for this build. */
export const metaPixelEnabled = Boolean(PIXEL_ID);

type MetaEvent =
  | 'ViewContent'
  | 'AddToCart'
  | 'InitiateCheckout'
  | 'Search'
  | 'Lead';

type MetaPayload = {
  content_ids?: string[];
  content_name?: string;
  content_type?: 'product';
  value?: number;
  currency?: string;
  num_items?: number;
  search_string?: string;
};

declare global {
  interface Window {
    fbq?: ((...args: unknown[]) => void) & { callMethod?: unknown };
  }
}

/**
 * One standard event. Safe to call from anywhere: if the pixel never loaded —
 * no id, a blocker, a browser that refused the script — this does nothing
 * rather than throwing inside whatever was actually happening, which is
 * usually somebody trying to buy a sofa.
 */
/**
 * The id Meta's catalogue knows an item by.
 *
 * Shopify's Facebook channel publishes one catalogue entry per variant, keyed
 * by the bare numeric variant id — not the handle, and not the
 * `shopify_US_<product>_<variant>` form its older feeds used. Confirmed
 * against the live catalogue before this was written, because a mismatch here
 * fails silently: dynamic ads simply never match a product, the campaign
 * spends without delivering, and nothing anywhere reports an error.
 */
export function catalogId(variantGid: string): string {
  return variantGid.split('/').pop() ?? variantGid;
}

export function metaTrack(event: MetaEvent, payload?: MetaPayload): void {
  if (typeof window === 'undefined' || !window.fbq) return;
  try {
    window.fbq('track', event, payload);
  } catch {
    // Analytics never breaks the page it measures.
  }
}

export function MetaPixel() {
  const pathname = usePathname();
  // Path only, deliberately. `useSearchParams` forces the whole tree into a
  // Suspense boundary or the build refuses to prerender it — a trap this repo
  // has already hit once — and a page-2 link is not a new page view anyway.
  //
  // The base snippet fires the first PageView itself; without this guard the
  // very first navigation would be counted twice.
  const firstRender = useRef(true);

  useEffect(() => {
    if (!PIXEL_ID) return;
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    // App Router navigates without reloading, so Meta never sees the new page
    // unless it is told. Without this every session looks like one page view.
    if (window.fbq) window.fbq('track', 'PageView');
  }, [pathname]);

  if (!PIXEL_ID) return null;

  return (
    <>
      {/*
        A plain script, rendered into the HTML by the server — not `next/script`.
        With `afterInteractive` the snippet lives in the JS bundle and only
        reaches the page after hydration, so it works for a real visitor but is
        invisible to anything that reads the page without running it. Meta's
        own setup tool is one of those: it fetched the page, found no `fbq` in
        the source and reported no pixel on a site that had one.

        The `if(f.fbq)return;` guard in Meta's snippet makes a second execution
        a no-op, so rendering it inline is safe.
      */}
      <script
        // Meta's own snippet, with only the id interpolated — no user input.
        dangerouslySetInnerHTML={{
          __html: `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${PIXEL_ID}');
fbq('track', 'PageView');`,
        }}
      />
      {/* For a visitor with JavaScript off, and a second marker for anything
          reading the page without running it. */}
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element -- Meta's tracking pixel is a bare 1x1 GIF, not content */}
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          alt=""
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
