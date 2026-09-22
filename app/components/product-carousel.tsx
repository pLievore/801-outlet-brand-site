'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import type { CatalogProductCard as CatalogProductCardData } from '../../src/lib/catalog/types';
import { CatalogProductCard } from './catalog-product-card';

/**
 * The featured row, swiped on a phone and laid out as a grid above `sm`.
 *
 * Stacked one per row, four sofas are four screens of scrolling before the
 * page gets on with itself. Sideways they cost one screen, and the thumb is
 * already doing that gesture on the product gallery (D-028).
 *
 * It never advances on its own. A row that moves while it is being read takes
 * away the card someone was looking at, and that is what teaches people to
 * ignore the whole area.
 *
 * Above `sm` the grid wins: four cards already fit on one line there, so a
 * carousel would only hide what is currently visible.
 */
export function ProductCarousel({
  products,
}: {
  products: CatalogProductCardData[];
}) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // Cards are narrower than the viewport. Use their actual snap positions,
    // including the final card whose position is limited by the scroll end.
    const onScroll = () => {
      const maxScroll = track.scrollWidth - track.clientWidth;
      let closest = 0;
      let distance = Infinity;

      Array.from(track.children).forEach((child, index) => {
        const card = child as HTMLElement;
        if (card.offsetWidth === 0) return;
        const target = Math.min(card.offsetLeft, maxScroll);
        const nextDistance = Math.abs(track.scrollLeft - target);
        if (nextDistance < distance) {
          closest = index;
          distance = nextDistance;
        }
      });

      setActive(closest);
    };

    track.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      track.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [products.length]);

  return (
    <div className="mt-8">
      <ul
        ref={trackRef}
        className={
          // Peeking the next card is the whole affordance: a row that ends
          // flush with the screen reads as a row of one.
          // Position the track so absolutely positioned screen-reader text
          // stays inside its scroll area instead of widening the document.
          'no-scrollbar relative -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-5 pb-1 ' +
          'sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4'
        }
      >
        {products.map((product) => (
          <li
            key={product.id}
            className="w-[82%] shrink-0 snap-start sm:w-auto sm:shrink"
          >
            <CatalogProductCard product={product} />
          </li>
        ))}
        <li className="w-[82%] shrink-0 snap-start sm:hidden">
          <Link
            href="/products"
            className="group flex h-full min-h-72 flex-col items-center justify-center rounded-2xl border border-[rgb(var(--sage)/0.3)] bg-[rgb(var(--sage-soft))] p-8 text-center text-[rgb(var(--sage-ink))] transition-colors hover:bg-[rgb(var(--sage)/0.15)] focus-visible:-outline-offset-4"
          >
            <span className="flex size-14 items-center justify-center rounded-full bg-[rgb(var(--sage-ink))] text-white">
              <ArrowRight aria-hidden="true" className="size-6" />
            </span>
            <span className="mt-6 font-display text-3xl leading-tight">
              More to discover
            </span>
            <span className="mt-3 text-sm leading-relaxed">
              Find your next favorite piece in our full collection.
            </span>
            <span className="mt-6 text-sm font-semibold underline underline-offset-4">
              Browse all products
            </span>
          </Link>
        </li>
      </ul>

      {products.length > 0 ? (
        <div
          aria-hidden
          className="mt-4 flex items-center justify-center gap-1.5 sm:hidden"
        >
          {[...products.map((product) => product.id), 'browse-all'].map((key, index) => (
            <span
              key={key}
              className={
                'h-1.5 rounded-full transition-all duration-300 ' +
                (index === active
                  ? 'w-5 bg-[rgb(var(--accent))]'
                  : 'w-1.5 bg-[rgb(var(--border-strong))]')
              }
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
