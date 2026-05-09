'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import type { ProductCardData } from '../../src/lib/products';
import { formatUsdCents } from '../../src/lib/format';

export function ProductCard({ p }: { p: ProductCardData }) {
  const reduced = useReducedMotion();
  const primary = p.images[0];
  const secondary = p.images[1];
  const savings =
    p.compareAtPriceCents && p.compareAtPriceCents > p.priceCents
      ? p.compareAtPriceCents - p.priceCents
      : null;

  return (
    <motion.div
      whileHover={reduced ? {} : { y: -3, boxShadow: '0 8px 28px rgba(0,0,0,0.09)' }}
      whileTap={reduced ? {} : { scale: 0.98 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="h-full"
    >
      <Link
        href={`/products/${p.slug}`}
        className="group flex h-full flex-col rounded-2xl border border-[rgb(var(--border))] bg-white p-3 sm:p-4 transition-colors hover:border-[rgb(var(--accent))]/30"
      >
        <div className="relative aspect-4/3 overflow-hidden rounded-xl bg-neutral-100">
          {primary ? (
            <motion.div
              className="absolute inset-0"
              whileHover={reduced ? {} : { scale: 1.04 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <Image
                src={primary.url}
                alt={primary.alt || p.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className={
                  'object-cover transition duration-300 ' +
                  (secondary ? 'opacity-100 group-hover:opacity-0' : 'opacity-100')
                }
              />
            </motion.div>
          ) : null}

          {secondary ? (
            <Image
              src={secondary.url}
              alt={secondary.alt || p.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover opacity-0 transition duration-300 group-hover:opacity-100 group-hover:scale-[1.02]"
            />
          ) : null}

          {savings !== null ? (
            <div className="absolute left-3 top-3 rounded-full bg-[rgb(var(--fg))] px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-sm">
              Save {formatUsdCents(savings)}
            </div>
          ) : null}

          {p.stockQty === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/60 backdrop-blur-[2px]">
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[rgb(var(--muted))] shadow-sm">
                Out of stock
              </span>
            </div>
          ) : null}
        </div>

        <div className="mt-3 flex flex-1 flex-col">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="truncate text-sm font-semibold">{p.name}</div>
              {p.description ? (
                <div className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-[rgb(var(--muted))]">
                  {p.description}
                </div>
              ) : null}
            </div>

            <div className="shrink-0 text-right">
              <div className="text-sm font-semibold">{formatUsdCents(p.priceCents)}</div>
              {p.compareAtPriceCents && p.compareAtPriceCents > p.priceCents ? (
                <div className="text-[11px] text-[rgb(var(--muted))] line-through">
                  {formatUsdCents(p.compareAtPriceCents)}
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {p.stockQty > 0 ? (
              <span className="rounded-full border border-[rgb(var(--border))] bg-white px-2.5 py-0.5 text-[10px] font-semibold text-[rgb(var(--fg))]">
                In stock
              </span>
            ) : null}
            {p.stockQty > 0 && p.stockQty <= 3 ? (
              <span className="rounded-full border border-[rgb(var(--accent))] bg-[rgb(var(--accent))]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[rgb(var(--accent))]">
                Only {p.stockQty} left
              </span>
            ) : null}
          </div>

          <div className="mt-auto pt-3 text-xs font-semibold text-[rgb(var(--accent))] transition group-hover:translate-x-0.5">
            View details →
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
