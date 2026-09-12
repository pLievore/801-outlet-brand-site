'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import type { NavigationLink } from '../../src/lib/navigation/types';
import { NewTabHint } from './ui/new-tab-hint';

/**
 * A header link that knows whether it is the page you are on.
 *
 * The desktop nav marked the current page nowhere at all, and the mobile menu
 * marked it with colour alone — which says nothing to a screen reader and
 * nothing to anyone who cannot separate those two greens. `aria-current` is the
 * programmatic half; the underline is the visible half that does not depend on
 * hue.
 */
export function NavLink({ link }: { link: NavigationLink }) {
  const pathname = usePathname();
  const active = isCurrent(pathname, link);

  const className =
    'rounded-full px-3 py-2 text-sm font-semibold transition ' +
    (active
      ? 'text-[rgb(var(--fg))] underline decoration-[rgb(var(--accent))] decoration-2 underline-offset-[6px]'
      : 'text-[rgb(var(--fg))] hover:bg-[rgb(var(--surface-muted))]');

  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noreferrer" className={className}>
        {link.label}
        <NewTabHint />
      </a>
    );
  }

  return (
    <Link
      href={link.href}
      aria-current={active ? 'page' : undefined}
      className={className}
    >
      {link.label}
    </Link>
  );
}

/**
 * Home only matches exactly — every path starts with "/", so a prefix test
 * would light it up on every page of the site.
 */
export function isCurrent(
  pathname: string,
  link: Pick<NavigationLink, 'href' | 'external'>
): boolean {
  if (link.external) return false;
  if (link.href === '/') return pathname === '/';
  return pathname === link.href || pathname.startsWith(`${link.href}/`);
}
