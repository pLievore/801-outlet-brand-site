/**
 * Configurações de ambiente
 * Valida e exporta variáveis de ambiente do projeto
 */

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  
  if (!value && !defaultValue) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  
  return value || defaultValue || '';
}

export const env = {
  // URLs
  shopifyStoreUrl: getEnvVar(
    'NEXT_PUBLIC_SHOPIFY_STORE_URL',
    'https://801outlet.com'
  ),
  
  // Contato
  phoneE164: getEnvVar(
    'NEXT_PUBLIC_PHONE_E164',
    '+1 385 201 6328'
  ),
  
  // Utilitários
  getPhoneHref: () => {
    return `tel:${env.phoneE164.replace(/[^+\d]/g, '')}`;
  },
  
  getShopifyUrl: (path = '', utmSource = 'brand_site', utmMedium = 'nav', utmCampaign = 'shop_redirect') => {
    const baseUrl = env.shopifyStoreUrl.replace(/\/$/, ''); // Remove trailing slash
    const fullPath = path ? `${baseUrl}${path.startsWith('/') ? path : '/' + path}` : baseUrl;
    const url = new URL(fullPath);
    url.searchParams.set('utm_source', utmSource);
    url.searchParams.set('utm_medium', utmMedium);
    url.searchParams.set('utm_campaign', utmCampaign);
    return url.toString();
  },
} as const;
