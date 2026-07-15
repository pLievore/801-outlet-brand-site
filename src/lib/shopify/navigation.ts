import 'server-only';

import type { NavigationLink } from '../navigation/types';
import { adaptMenuItem } from './adapters/menu';
import { getMenu } from './queries/menus';

const fallbackNavigation: NavigationLink[] = [
  {
    id: 'fallback-products',
    label: 'Catalog',
    href: '/products',
    external: false,
    children: [],
  },
  {
    id: 'fallback-delivery',
    label: 'Delivery',
    href: '/delivery',
    external: false,
    children: [],
  },
  {
    id: 'fallback-about',
    label: 'About',
    href: '/about',
    external: false,
    children: [],
  },
  {
    id: 'fallback-contact',
    label: 'Contact',
    href: '/contact',
    external: false,
    children: [],
  },
];

export async function getMainNavigation() {
  try {
    const menu = await getMenu('main-menu');
    if (!menu || menu.items.length === 0) return fallbackNavigation;

    return menu.items.map(adaptMenuItem);
  } catch (error) {
    console.warn('[shopify-menu]', {
      event: 'fallback_navigation',
      errorName: error instanceof Error ? error.name : 'UnknownError',
    });
    return fallbackNavigation;
  }
}
