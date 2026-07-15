'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import type {
  CartActionResult,
  CartView,
} from '../../../src/lib/catalog/cart-view';
import {
  addCartLineAction,
  getCartAction,
  removeCartLineAction,
  updateCartLineAction,
} from '../../actions/cart';

type CartContextValue = {
  cart: CartView | null;
  /** True while the initial cart load or a mutation is in flight. */
  pending: boolean;
  /** Buyer-facing messages from the last failed operation. */
  errors: string[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addLine: (variantId: string, quantity: number) => Promise<boolean>;
  updateLine: (lineId: string, quantity: number) => Promise<void>;
  removeLine: (lineId: string) => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used inside CartProvider');
  }
  return context;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartView | null>(null);
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const loadedRef = useRef(false);

  const applyResult = useCallback(
    (result: CartActionResult): boolean => {
      const failed = (result.errors?.length ?? 0) > 0;
      setErrors(result.errors ?? []);
      // On failure keep the last known cart instead of clearing it.
      if (!failed || result.cart) {
        setCart(result.cart);
      }
      return !failed;
    },
    []
  );

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    let cancelled = false;
    setPending(true);
    getCartAction()
      .then((result) => {
        if (!cancelled) applyResult(result);
      })
      .finally(() => {
        if (!cancelled) setPending(false);
      });

    return () => {
      cancelled = true;
    };
  }, [applyResult]);

  const run = useCallback(
    async (operation: Promise<CartActionResult>): Promise<boolean> => {
      setPending(true);
      try {
        return applyResult(await operation);
      } finally {
        setPending(false);
      }
    },
    [applyResult]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      pending,
      errors,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addLine: async (variantId, quantity) => {
        const ok = await run(addCartLineAction(variantId, quantity));
        if (ok) setIsOpen(true);
        return ok;
      },
      updateLine: async (lineId, quantity) => {
        await run(updateCartLineAction(lineId, quantity));
      },
      removeLine: async (lineId) => {
        await run(removeCartLineAction(lineId));
      },
    }),
    [cart, pending, errors, isOpen, run]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
