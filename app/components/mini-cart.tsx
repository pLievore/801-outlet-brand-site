'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useCartStore,
  selectSubtotalCents,
  useHydratedItemCount,
} from '../../src/lib/cart/store';
import { formatUsdCents } from '../../src/lib/format';

export function MiniCart() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((s) => s.items);
  const hydrated = useCartStore((s) => s.hydrated);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotalCents = useCartStore(selectSubtotalCents);
  const count = useHydratedItemCount();

  // Portal requires browser — only mount after hydration
  useEffect(() => setMounted(true), []);

  return (
    <>
      {/* Trigger button */}
      <motion.button
        onClick={() => setOpen(true)}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.94 }}
        transition={{ duration: 0.15 }}
        className="relative inline-flex items-center justify-center rounded-full p-2 transition hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg))]"
        aria-label={count ? `Cart with ${count} item${count === 1 ? '' : 's'}` : 'Cart'}
      >
        <svg
          className="size-5 text-[rgb(var(--fg))]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <AnimatePresence>
          {count !== null && count > 0 ? (
            <motion.span
              key="badge"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-[rgb(var(--accent))] text-[10px] font-bold text-white"
              aria-hidden="true"
            >
              {count > 99 ? '99+' : count}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </motion.button>

      {/* Backdrop + Slide-over panel — rendered via portal to escape header's DOM */}
      {mounted && createPortal(
        <>
          {/* Backdrop */}
          <AnimatePresence>
            {open && (
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
                aria-hidden="true"
                onClick={() => setOpen(false)}
              />
            )}
          </AnimatePresence>

          {/* Slide-over panel */}
          <AnimatePresence>
            {open && (
              <motion.div
                key="panel"
                role="dialog"
                aria-label="Shopping cart"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                className="fixed inset-y-0 right-0 z-50 flex h-dvh w-full max-w-sm flex-col bg-[rgb(var(--bg))] shadow-2xl"
              >
            <div className="flex items-center justify-between border-b border-[rgb(var(--border))] px-5 py-4">
              <h2 className="text-base font-semibold">
                Your cart {count !== null && count > 0 ? `(${count})` : ''}
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-1 transition hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent))]"
                aria-label="Close cart"
              >
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {!hydrated || items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <svg
                    className="size-12 text-neutral-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <p className="mt-4 text-sm text-[rgb(var(--muted))]">Your cart is empty</p>
                  <Link
                    href="/products"
                    onClick={() => setOpen(false)}
                    className="mt-4 rounded-full bg-[rgb(var(--fg))] px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-[1px] hover:shadow-sm"
                  >
                    Browse products
                  </Link>
                </div>
              ) : (
                <ul className="space-y-4">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.li
                        key={item.variantId}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="flex gap-3"
                      >
                        <Link
                          href={`/products/${item.productSlug}`}
                          onClick={() => setOpen(false)}
                          className="relative aspect-square w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-100"
                        >
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt={item.productName}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          ) : null}
                        </Link>
                        <div className="flex min-w-0 flex-1 flex-col justify-between">
                          <div>
                            <Link
                              href={`/products/${item.productSlug}`}
                              onClick={() => setOpen(false)}
                              className="line-clamp-2 text-sm font-medium hover:underline"
                            >
                              {item.productName}
                            </Link>
                            <p className="mt-0.5 text-xs text-[rgb(var(--muted))]">
                              {item.variantName} × {item.quantity}
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold">
                              {formatUsdCents(item.unitPriceCents * item.quantity)}
                            </span>
                            <button
                              onClick={() => removeItem(item.variantId)}
                              className="text-xs text-[rgb(var(--muted))] hover:text-red-600 focus-visible:outline-none transition"
                              aria-label={`Remove ${item.productName}`}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-[rgb(var(--border))] px-5 py-5 space-y-3">
                <div className="flex justify-between text-sm font-semibold">
                  <span>Subtotal</span>
                  <span>{formatUsdCents(subtotalCents)}</span>
                </div>
                <Link
                  href="/checkout"
                  onClick={() => setOpen(false)}
                  className="block w-full rounded-full bg-[rgb(var(--fg))] py-3.5 text-center text-sm font-semibold text-white transition hover:-translate-y-[1px] hover:shadow-sm"
                >
                  Checkout
                </Link>
                <Link
                  href="/cart"
                  onClick={() => setOpen(false)}
                  className="block w-full rounded-full border border-[rgb(var(--border))] py-3 text-center text-sm font-semibold transition hover:bg-neutral-50"
                >
                  View cart
                </Link>
              </div>
            )}
          </motion.div>
            )}
          </AnimatePresence>
        </>,
        document.body
      )}
    </>
  );
}
