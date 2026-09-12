'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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
 * **Dragging along the bar picks a tab:** The mark follows the finger one to
 * one and the release commits, so a thumb can rake across without lifting. The
 * reading is positional — where the finger is over the bar — rather than by
 * distance travelled: each button is a quarter of the width, and asking for a
 * screen's worth of travel per tab would make the drag feel dead.
 *
 * **Smooth sliding indicator:** Rather than popping abruptly into place, the
 * orange bar glides smoothly across the bar using a GPU-driven transform with
 * the brand's ease-out-expo curve, giving immediate tactile visual feedback on
 * tap and following finger drags cleanly.
 *
 * **Global optimistic synchronization:** When a shopper taps any navigation link
 * anywhere on the site (including inside the hamburger menu or footer), the
 * orange indicator begins sliding immediately (0ms) without waiting for serverless
 * preview cold starts or network latency to resolve.
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
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const isDragging = useRef(false);
  const lastCrossed = useRef<number | null>(null);

  const [hover, setHover] = useState<number | null>(null);
  const [pending, setPending] = useState<{
    fromPathname: string;
    targetIndex: number;
  } | null>(null);

  const current = activeIndex(pathname);
  // When pathname updates to the new route, pending expires declaratively without an effect
  const pendingIndex =
    pending && pending.fromPathname === pathname ? pending.targetIndex : null;
  const marked = hover ?? pendingIndex ?? current;

  // Synchronize optimistic tab sliding with any link clicked across the entire site
  // (e.g. "Catalog" in the hamburger menu, footer links, header links).
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) {
        return;
      }
      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href) return;
      if (
        href.startsWith('http://') ||
        href.startsWith('https://') ||
        href.startsWith('//') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('#') ||
        anchor.target === '_blank'
      ) {
        return;
      }

      const idx = activeIndex(href);
      setPending({ fromPathname: pathname, targetIndex: idx });
    };

    document.addEventListener('click', handleDocumentClick, { capture: true });
    return () => {
      document.removeEventListener('click', handleDocumentClick, { capture: true });
    };
  }, [pathname]);

  const lastNavTime = useRef(0);

  const navigateToTab = useCallback(
    (index: number, href: string, isDragCommit = false) => {
      const now = typeof performance !== 'undefined' ? performance.now() : 0;
      if (now - lastNavTime.current < 150) return;
      lastNavTime.current = now;

      setPending({ fromPathname: pathname, targetIndex: index });
      haptic(isDragCommit ? HAPTIC.commit : HAPTIC.tap);
      if (pathname !== href) {
        router.push(href);
      }
    },
    [pathname, router]
  );

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
    dragStart.current = { x: event.clientX, y: event.clientY };
    isDragging.current = false;
    const over = tabUnder(event.clientX);
    lastCrossed.current = over;
    haptic(HAPTIC.tap);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (!dragStart.current) return;
    const deltaX = Math.abs(event.clientX - dragStart.current.x);
    if (!isDragging.current && deltaX > 6) {
      isDragging.current = true;
    }
    if (!isDragging.current) return;

    const over = tabUnder(event.clientX);
    if (over === lastCrossed.current) return;

    // One tick per tab crossed, not one per gesture: the bar should feel like
    // detents under the thumb.
    lastCrossed.current = over;
    setHover(over);
    haptic(HAPTIC.tap);
  };

  const endDrag = (event: React.PointerEvent<HTMLElement>) => {
    const wasDragging = isDragging.current;
    dragStart.current = null;
    isDragging.current = false;
    setHover(null);

    // If it was a deliberate drag along the bar, commit the navigation on release
    if (wasDragging) {
      const target = tabUnder(event.clientX);
      if (target >= 0) {
        navigateToTab(target, TABS[target].href, true);
      }
    }
  };

  return (
    <nav
      ref={navRef}
      aria-label="Primary"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={() => {
        dragStart.current = null;
        isDragging.current = false;
        setHover(null);
      }}
      className="pb-tab-bar fixed inset-x-0 bottom-0 z-40 flex border-t border-[rgb(var(--border))] bg-[rgb(var(--bg))]/95 backdrop-blur-xl lg:hidden print:hidden"
    >
      {/* Sliding orange indicator */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute left-0 top-0 z-20 h-[2px] w-1/4 transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          marked >= 0 ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          transform: `translate3d(${Math.max(0, marked) * 100}%, 0, 0)`,
        }}
      >
        <span className="mx-auto block h-full w-[56%] rounded-b bg-[rgb(var(--accent))]" />
      </span>

      {TABS.map((tab, index) => {
        const isCurrent = index === current;
        const isMarked = index === marked;

        return (
          <div
            key={tab.href}
            className="relative flex h-[var(--tab-bar-height)] flex-1 flex-col items-center justify-center"
          >
            <Link
              href={tab.href}
              prefetch
              aria-current={isCurrent ? 'page' : undefined}
              onClick={() => navigateToTab(index, tab.href)}
              className={`relative flex size-full flex-col items-center justify-center gap-0.5 transition-colors ${
                isMarked
                  ? 'text-[rgb(var(--fg))]'
                  : 'text-[rgb(var(--muted))]'
              }`}
            >
              <span className="relative">
                <tab.icon aria-hidden="true" className="size-5" />
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
            </Link>

            {/* The iPhone's only remaining route to a physical tick:
                a real native switch under the finger. Toggling it plays
                the system Taptic Engine tick on iOS Safari. */}
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
                onChange={() => navigateToTab(index, tab.href)}
                className="absolute inset-0 size-full cursor-pointer opacity-0"
              />
            </label>
          </div>
        );
      })}
    </nav>
  );
}
