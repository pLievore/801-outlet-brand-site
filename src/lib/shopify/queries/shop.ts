import 'server-only';

import type { ShopQuery } from '../types/storefront.generated';
import { shopifyStorefrontRequest } from '../client';
import { shopifyCacheTags } from '../constants';

export const SHOP_QUERY = `#graphql
  query Shop {
    shop {
      name
      description
      primaryDomain {
        host
        url
      }
    }
  }
` as const;

export async function getShop() {
  const result = await shopifyStorefrontRequest<ShopQuery>(SHOP_QUERY, {
    operationName: 'Shop',
    next: {
      revalidate: 3_600,
      tags: [shopifyCacheTags.all, shopifyCacheTags.shop],
    },
  });

  return result.data.shop;
}
