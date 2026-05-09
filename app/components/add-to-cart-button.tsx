'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../../src/lib/cart/store';
import type { CartItem } from '../../src/lib/cart/types';

type Props = {
  item: Omit<CartItem, 'quantity'>;
  stockQty: number;
};

export function AddToCartButton({ item, stockQty }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const [qty, setQty] = useState(1);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const inStock = stockQty > 0;
  const maxQty = Math.max(1, stockQty);

  const onAdd = () => {
    if (!inStock) return;
    const result = addItem(item, qty, stockQty);
    if (result.ok) {
      setFeedback({ type: 'success', message: `✓ Added ${qty > 1 ? `${qty}×` : ''} to cart` });
    } else {
      setFeedback({ type: 'error', message: result.reason });
    }
    window.setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-stretch gap-2">
        {/* Quantity picker */}
        <div className="flex items-center rounded-full border border-[rgb(var(--border))] bg-white">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={!inStock || qty <= 1}
            className="px-3 py-2.5 text-sm font-semibold disabled:opacity-30 transition hover:text-[rgb(var(--accent))]"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="w-8 text-center text-sm font-semibold tabular-nums">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
            disabled={!inStock || qty >= maxQty}
            className="px-3 py-2.5 text-sm font-semibold disabled:opacity-30 transition hover:text-[rgb(var(--accent))]"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        {/* Add to cart */}
        <motion.button
          type="button"
          onClick={onAdd}
          disabled={!inStock}
          whileHover={inStock ? { y: -1, boxShadow: '0 6px 20px rgba(0,0,0,0.12)' } : {}}
          whileTap={inStock ? { scale: 0.97, y: 0 } : {}}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className={
            'flex-1 inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold ' +
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg))] ' +
            (inStock
              ? 'bg-[rgb(var(--fg))] text-white'
              : 'cursor-not-allowed bg-[rgb(var(--fg))] text-white opacity-50')
          }
        >
          {inStock ? 'Add to Cart' : 'Out of stock'}
        </motion.button>
      </div>

      {/* Animated feedback */}
      <div className="h-5" aria-live="polite">
        <AnimatePresence mode="wait">
          {feedback ? (
            <motion.div
              key={feedback.message}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className={
                'text-xs font-medium ' +
                (feedback.type === 'error' ? 'text-red-600' : 'text-[rgb(var(--accent))]')
              }
            >
              {feedback.message}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
