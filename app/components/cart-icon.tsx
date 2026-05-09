'use client';

import Link from 'next/link';
import { useHydratedItemCount } from '../../src/lib/cart/store';

export function CartIcon() {
  const count = useHydratedItemCount();

  return (
    <Link
      href="/cart"
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

      {count !== null && count > 0 ? (
        <span
          className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-[rgb(var(--accent))] text-[10px] font-bold text-white"
          aria-hidden="true"
        >
          {count > 99 ? '99+' : count}
        </span>
      ) : null}
    </Link>
  );
}
