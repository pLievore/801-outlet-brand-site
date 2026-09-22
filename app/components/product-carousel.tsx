'use client';

import { useEffect, useRef, useState } from 'react';

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

    // Which card is under the left edge, for the dots. Read on scroll rather
    // than tracked per gesture: the browser is already doing the maths.
    const onScroll = () => {
      const width = track.clientWidth;
      if (width === 0) return;
      setActive(Math.round(track.scrollLeft / width));
    };

    track.addEventListener('scroll', onScroll, { passive: true });
    return () => track.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="mt-8">
      <ul
        ref={trackRef}
        className={
          // Peeking the next card is the whole affordance: a row that ends
          // flush with the screen reads as a row of one.
          'no-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-1 ' +
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
      </ul>

      {products.length > 1 ? (
        <div
          aria-hidden
          className="mt-4 flex items-center justify-center gap-1.5 sm:hidden"
        >
          {products.map((product, index) => (
            <span
              key={product.id}
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
