import 'server-only';

export const CUSTOMER_ACCOUNT_API_VERSION = '2026-07';

export class CustomerAccountConfigurationError extends Error {
  readonly keys: string[];

  constructor(keys: string[]) {
    super(`Invalid Customer Account API configuration: ${keys.join(', ')}`);
    this.name = 'CustomerAccountConfigurationError';
    this.keys = keys;
  }
}

export type CustomerAccountConfig = {
  shopId: string;
  clientId: string;
  authorizeUrl: string;
  tokenUrl: string;
  logoutUrl: string;
  graphqlUrl: string;
};

let cached: CustomerAccountConfig | undefined;

export function getCustomerAccountConfig(): CustomerAccountConfig {
  if (cached) return cached;

  const shopId = process.env.SHOPIFY_SHOP_ID?.trim() ?? '';
  const clientId = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID?.trim() ?? '';

  const invalid: string[] = [];
  if (!/^\d+$/.test(shopId)) invalid.push('SHOPIFY_SHOP_ID');
  if (!/^[0-9a-f-]{36}$/i.test(clientId)) {
    invalid.push('SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID');
  }
  if (invalid.length > 0) throw new CustomerAccountConfigurationError(invalid);

  cached = {
    shopId,
    clientId,
    authorizeUrl: `https://shopify.com/authentication/${shopId}/oauth/authorize`,
    tokenUrl: `https://shopify.com/authentication/${shopId}/oauth/token`,
    logoutUrl: `https://shopify.com/authentication/${shopId}/logout`,
    graphqlUrl: `https://shopify.com/${shopId}/account/customer/api/${CUSTOMER_ACCOUNT_API_VERSION}/graphql`,
  };

  return cached;
}

export function isCustomerAccountConfigured(): boolean {
  try {
    getCustomerAccountConfig();
    return true;
  } catch {
    return false;
  }
}
