import type { NavigationLink } from '../../navigation/types';
import type { MenuQuery } from '../types/storefront.generated';

type GeneratedMenuItem = NonNullable<MenuQuery['menu']>['items'][number];
type ShopifyMenuItem = Pick<
  GeneratedMenuItem,
  'id' | 'title' | 'type' | 'url'
> & {
  items?: ShopifyMenuItem[];
};

const pageHandleOverrides: Record<string, string> = {
  contact: '/contact',
  'test-showroom-booking': '/showroom',
};

export function normalizeShopifyMenuUrl(
  url: string | null | undefined,
  type: ShopifyMenuItem['type']
) {
  if (type === 'FRONTPAGE') return { href: '/', external: false };
  if (type === 'CATALOG') return { href: '/products', external: false };

  let parsed: URL;
  try {
    parsed = new URL(url ?? '/', 'https://801outlet.com');
  } catch {
    return { href: '/', external: false };
  }

  if (!['801outlet.com', 'www.801outlet.com'].includes(parsed.hostname)) {
    return { href: parsed.toString(), external: true };
  }

  if (parsed.pathname.startsWith('/pages/')) {
    const handle = parsed.pathname.slice('/pages/'.length).replace(/\/$/, '');
    return {
      href: pageHandleOverrides[handle] ?? `/${handle}`,
      external: false,
    };
  }

  if (parsed.pathname === '/collections/all') {
    return { href: '/products', external: false };
  }

  return {
    href: `${parsed.pathname}${parsed.search}${parsed.hash}` || '/',
    external: false,
  };
}

export function adaptMenuItem(item: ShopifyMenuItem): NavigationLink {
  const normalized = normalizeShopifyMenuUrl(item.url, item.type);

  return {
    id: item.id,
    label: item.title,
    ...normalized,
    children: (item.items ?? []).map(adaptMenuItem),
  };
}
