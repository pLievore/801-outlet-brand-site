'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';

import { getAvailability } from '../../src/lib/catalog/availability';
import type { CatalogProductCard as CatalogProductCardData } from '../../src/lib/catalog/types';
import { formatMoney } from '../../src/lib/format';

/**
 * The smaller card, for the shelf of further options under the featured row.
 *
 * It carries the photo, the name and the price, and nothing else: no add
 * button, no savings badge. Two of these fit across a phone, which is the
 * point — this shelf exists to show the shop has more, and the piece someone
 * actually wants gets the full card on the catalogue page.
 *
 * The catalogue itself stays one per row on a phone (a7428c5): a sofa is not
 * bought from a thumbnail.
 */
export function CompactProductCard({
  product,
}: {
  product: CatalogProductCardData;
}) {
  const reduced = useReducedMotion();
  const image = product.images[0];
  const availability = getAvailability(product);

  return (
    <motion.div
      whileHover={reduced ? {} : { y: -2 }}
      whileTap={reduced ? {} : { scale: 0.985 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="h-full"
    >
      <Link
        href={`/products/${product.handle}`}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[rgb(var(--border))] bg-white transition-colors hover:border-[rgb(var(--accent)/0.3)]"
      >
        <div className="relative aspect-4/3 overflow-hidden bg-neutral-100">
          {image ? (
            <Image
              src={image.url}
              alt={image.alt || product.title}
              fill
              sizes="(max-width: 640px) 45vw, 22vw"
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          ) : null}
          {availability.state !== 'in-stock' ? (
            <span className="absolute left-2 top-2 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-semibold text-[rgb(var(--fg))]">
              {availability.label}
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col p-3">
          <h3 className="line-clamp-2 text-xs font-semibold leading-snug">
            {product.title}
          </h3>
          <div className="mt-auto flex items-baseline gap-2 pt-2">
            <span className="text-sm font-semibold tabular-nums-tight">
              {formatMoney(product.price)}
            </span>
            {product.compareAtPrice ? (
              <span className="text-[11px] text-[rgb(var(--muted))] line-through tabular-nums-tight">
                {formatMoney(product.compareAtPrice)}
              </span>
            ) : null}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
