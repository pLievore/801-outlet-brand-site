import 'server-only';

import { parseShopifyConfig, type ShopifyConfig } from './config-schema';

let cachedConfig: ShopifyConfig | undefined;

export function getShopifyConfig(): ShopifyConfig {
  cachedConfig ??= parseShopifyConfig(process.env);
  return cachedConfig;
}
