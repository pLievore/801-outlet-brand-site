'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';

import type { CatalogProductCard as CatalogProductCardData } from '../../src/lib/catalog/types';
import { formatMoney } from '../../src/lib/format';
import { getAvailability } from '../../src/lib/catalog/availability';
import { Badge } from './ui/badge';
import { CardAddToCart } from './card-add-to-cart';
import { Price } from './ui/price';

function savingsFor(product: CatalogProductCardData) {
  if (!product.compareAtPrice) return null;
  if (product.compareAtPrice.currencyCode !== product.price.currencyCode) {
    return null;
  }

  const savings =
    Number(product.compareAtPrice.amount) - Number(product.price.amount);

  if (!Number.isFinite(savings) || savings <= 0) return null;

  return {
    amount: savings.toFixed(2),
    currencyCode: product.price.currencyCode,
  };
}

export function CatalogProductCard({
  product,
}: {
  product: CatalogProductCardData;
}) {
  const reduced = useReducedMotion();
  const primary = product.images[0];
  const secondary = product.images[1];
  const savings = savingsFor(product);
  const availability = getAvailability(product);

  return (
    <motion.div
      whileHover={
        reduced ? {} : { y: -3, boxShadow: '0 8px 28px rgba(0,0,0,0.09)' }
      }
      whileTap={reduced ? {} : { scale: 0.98 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="flex h-full flex-col overflow-hidden rounded-2xl border border-[rgb(var(--border))] bg-white transition-colors hover:border-[rgb(var(--accent))]/30"
    >
      <Link
        href={`/products/${product.handle}`}
        className="group flex flex-1 flex-col p-3 sm:p-4"
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
                alt={primary.alt || product.title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className={
                  'object-cover transition duration-300 ' +
                  (secondary
                    ? 'opacity-100 group-hover:opacity-0'
                    : 'opacity-100')
                }
              />
            </motion.div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-[rgb(var(--muted))]">
              Image coming soon
            </div>
          )}

          {secondary ? (
            <Image
              src={secondary.url}
              alt={secondary.alt || product.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover opacity-0 transition duration-300 group-hover:scale-[1.02] group-hover:opacity-100"
            />
          ) : null}

          {savings ? (
            <Badge className="absolute left-3 top-3 border-0 bg-[rgb(var(--fg))] text-white shadow-sm">
              Save {formatMoney(savings)}
            </Badge>
          ) : null}

          {!availability.purchasable ? (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/60 backdrop-blur-[2px]">
              <Badge className="bg-white shadow-sm">{availability.label}</Badge>
            </div>
          ) : null}
        </div>

        <div className="mt-3 flex flex-1 flex-col">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="line-clamp-2 text-sm font-semibold">
                {product.title}
              </div>
              {product.description ? (
                <div className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-[rgb(var(--muted))]">
                  {product.description}
                </div>
              ) : null}
            </div>

            <div className="shrink-0 text-right">
              <Price
                money={product.price}
                compareAt={product.compareAtPrice}
                className="flex-col items-end gap-0 text-sm"
              />
            </div>
          </div>

          <div className="mt-2">
            <Badge
              tone={availability.state === 'in-stock' ? 'sage' : undefined}
              className="px-2.5 py-0.5 text-[10px]"
            >
              {availability.label}
            </Badge>
          </div>

          <div className="mt-auto pt-3 text-xs font-semibold text-[rgb(var(--accent))] transition group-hover:translate-x-0.5">
            View details →
          </div>
        </div>
      </Link>

      {/* A sibling of the link, not a child: adding is not navigating. It sits
          inside the card's box because the border and background moved up to
          the wrapper — left on the link, which is full height, this was pushed
          out of the card and landed on the one below it. */}
      {product.soleVariantId && availability.purchasable ? (
        <div className="px-3 pb-3 sm:px-4 sm:pb-4">
          <CardAddToCart
            variantId={product.soleVariantId}
            productHandle={product.handle}
            productTitle={product.title}
          />
        </div>
      ) : null}
    </motion.div>
  );
}
