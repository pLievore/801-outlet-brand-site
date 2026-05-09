'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AddToCartResult, CartItem } from './types';

type CartState = {
  items: CartItem[];
  hydrated: boolean;
  addItem: (
    item: Omit<CartItem, 'quantity'>,
    qty: number,
    stockQty: number
  ) => AddToCartResult;
  updateQuantity: (variantId: string, qty: number) => void;
  removeItem: (variantId: string) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      hydrated: false,

      addItem: (item, qty, stockQty) => {
        if (qty < 1) return { ok: false, reason: 'Quantity must be at least 1' };
        const items = get().items;
        const existing = items.find((i) => i.variantId === item.variantId);
        const newQty = (existing?.quantity ?? 0) + qty;
        if (newQty > stockQty) {
          return { ok: false, reason: `Only ${stockQty} in stock` };
        }
        if (existing) {
          set({
            items: items.map((i) =>
              i.variantId === item.variantId ? { ...i, quantity: newQty } : i
            ),
          });
        } else {
          set({ items: [...items, { ...item, quantity: qty }] });
        }
        return { ok: true };
      },

      updateQuantity: (variantId, qty) => {
        if (qty < 1) {
          get().removeItem(variantId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.variantId === variantId ? { ...i, quantity: qty } : i
          ),
        });
      },

      removeItem: (variantId) => {
        set({ items: get().items.filter((i) => i.variantId !== variantId) });
      },

      clear: () => {
        set({ items: [] });
      },
    }),
    {
      name: 'cart-v1',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
      partialize: (state) => ({ items: state.items }),
    }
  )
);

export const selectItemCount = (s: CartState): number =>
  s.items.reduce((n, i) => n + i.quantity, 0);

export const selectSubtotalCents = (s: CartState): number =>
  s.items.reduce((c, i) => c + i.unitPriceCents * i.quantity, 0);

/**
 * Hook that returns the cart item count, but only after hydration.
 * Before hydration, returns null (header should hide the badge).
 */
export function useHydratedItemCount(): number | null {
  const hydrated = useCartStore((s) => s.hydrated);
  const count = useCartStore(selectItemCount);
  return hydrated ? count : null;
}
