'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, LayoutGrid, ShoppingBag, User } from 'lucide-react';

import { HAPTIC, haptic } from '../../src/lib/haptics';
import { useCart } from './cart/cart-provider';

/**
 * The bottom bar, on phones.
 *
 * Everything used to live behind the hamburger, which put the cart two taps
 * and a reach to the top corner away on a device held at the bottom. These four
 * are the destinations a shopper returns to; the menu keeps the long tail —
 * collections, policies, the showroom — because a bar that tried to hold all of
 * it would hold none of it well.
 *
 * **Dragging along the bar picks a tab.** The mark follows the finger one to
 * one and the release commits, so a thumb can rake across without lifting. The
 * reading is positional — where the finger is over the bar — rather than by
 * distance travelled: each button is a quarter of the width, and asking for a
 * screen's worth of travel per tab would make the drag feel dead.
 *
 * **It carries a native switch per button.** Since iOS 26.5 only physical
 * manipulation of a native control reaches the Taptic Engine, so a transparent
 * switch under the finger is the one path left that still ticks on an iPhone —
 * on tap and on each tab the drag crosses.
 */

const TABS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/products', label: 'Shop', icon: LayoutGrid },
  { href: '/cart', label: 'Cart', icon: ShoppingBag },
  { href: '/account', label: 'Account', icon: User },
] as const;

function activeIndex(pathname: string): number {
  let best = -1;
  TABS.forEach((tab, index) => {
    const matches =
      tab.href === '/'
        ? pathname === '/'
        : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
    if (matches && (best === -1 || tab.href.length > TABS[best].href.length)) {
      best = index;
    }
  });
  return best;
}

export function MobileTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { cart } = useCart();
  const quantity = cart?.totalQuantity ?? 0;

  const navRef = useRef<HTMLElement>(null);
  const dragging = useRef(false);
  const lastCrossed = useRef<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);

  const current = activeIndex(pathname);
  const marked = hover ?? current;

  /**
   * Which tab the finger is over, from the bar's own geometry. Clamped so a
   * thumb that slides off the end still resolves to the end button.
   */
  const tabUnder = (clientX: number): number => {
    const box = navRef.current?.getBoundingClientRect();
    if (!box?.width) return current;
    const index = Math.floor(((clientX - box.left) / box.width) * TABS.length);
    return Math.max(0, Math.min(TABS.length - 1, index));
  };

  const onPointerDown = (event: React.PointerEvent<HTMLElement>) => {
    if (event.pointerType === 'mouse') return;
    dragging.current = true;
    lastCrossed.current = tabUnder(event.clientX);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (!dragging.current) return;
    const over = tabUnder(event.clientX);
    if (over === lastCrossed.current) return;

    // One tick per tab crossed, not one per gesture: the bar should feel like
    // detents under the thumb.
    lastCrossed.current = over;
    setHover(over);
    haptic(HAPTIC.tap);
  };

  const endDrag = (event: React.PointerEvent<HTMLElement>) => {
    if (!dragging.current) return;
    dragging.current = false;

    const target = tabUnder(event.clientX);
    setHover(null);
    if (target !== current) router.push(TABS[target].href);
  };

  return (
    <nav
      ref={navRef}
      aria-label="Primary"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={() => {
        dragging.current = false;
        setHover(null);
      }}
      className="pb-safe fixed inset-x-0 bottom-0 z-40 flex border-t border-[rgb(var(--border))] bg-[rgb(var(--bg))]/95 backdrop-blur-xl lg:hidden print:hidden"
    >
      {TABS.map((tab, index) => {
        const isCurrent = index === current;
        const isMarked = index === marked;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            prefetch
            aria-current={isCurrent ? 'page' : undefined}
            onClick={() => haptic(HAPTIC.tap)}
            className={`relative flex min-h-[58px] flex-1 flex-col items-center justify-center gap-1 transition-colors ${
              isMarked
                ? 'text-[rgb(var(--fg))]'
                : 'text-[rgb(var(--muted))]'
            }`}
          >
            {isMarked ? (
              <span
                aria-hidden="true"
                className="absolute inset-x-[22%] top-0 h-[2px] rounded-b bg-[rgb(var(--accent))]"
              />
            ) : null}

            <span className="relative">
              <tab.icon aria-hidden="true" className="size-[22px]" />
              {tab.href === '/cart' && quantity > 0 ? (
                <span
                  aria-hidden="true"
                  className="absolute -right-2 -top-1.5 flex min-w-4 items-center justify-center rounded-full bg-[rgb(var(--accent))] px-1 text-[10px] font-bold leading-4 text-white"
                >
                  {quantity > 99 ? '99+' : quantity}
                </span>
              ) : null}
            </span>
            <span className="text-[11px] font-semibold">{tab.label}</span>
            {tab.href === '/cart' && quantity > 0 ? (
              <span className="sr-only">{quantity} items in cart</span>
            ) : null}

            {/* The iPhone's only remaining route to a tick: a real native
                control under the finger, transparent and inert to everything
                else. Hidden from assistive tech — the link above is the
                control that matters. */}
            <label
              htmlFor={`tab-switch-${index}`}
              aria-hidden="true"
              className="absolute inset-0 z-10 block cursor-pointer"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <input
                type="checkbox"
                id={`tab-switch-${index}`}
                {...{ switch: '' }}
                tabIndex={-1}
                aria-hidden="true"
                className="absolute inset-0 size-full cursor-pointer opacity-0"
              />
            </label>
          </Link>
        );
      })}
    </nav>
  );
}
