/**
 * Creates the product metafield definitions the CSV flow writes into
 * (`custom.dimensions`, `custom.color`, `custom.material`, `custom.features`).
 *
 * Definitions are required, not optional: a metafield without one is invisible
 * to the Storefront API, so the product page could never show the values. They
 * are created with storefront read access for exactly that reason.
 *
 * Safe to re-run — an existing definition is reported and left alone.
 *
 *   npm run metafields:setup
 */

import {
  ATTRIBUTE_NAMESPACE,
  PRODUCT_ATTRIBUTES,
} from '../src/lib/catalog/attributes';

const SHOP_DOMAIN = 'xwn9c1-m8.myshopify.com';
const API_VERSION = '2026-07';

async function adminGraphql<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  if (!token) throw new Error('SHOPIFY_ADMIN_ACCESS_TOKEN is not set');

  const response = await fetch(
    `https://${SHOP_DOMAIN}/admin/api/${API_VERSION}/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token,
      },
      body: JSON.stringify({ query, variables }),
    }
  );

  const payload = (await response.json()) as {
    data?: T;
    errors?: Array<{ message?: string }>;
  };
  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join('; '));
  }
  if (!payload.data) throw new Error(`No data (HTTP ${response.status})`);
  return payload.data;
}

const CREATE = `
  mutation CreateDefinition($definition: MetafieldDefinitionInput!) {
    metafieldDefinitionCreate(definition: $definition) {
      createdDefinition { id namespace key }
      userErrors { field message code }
    }
  }
`;

async function main() {
  for (const attribute of PRODUCT_ATTRIBUTES) {
    const data = await adminGraphql<{
      metafieldDefinitionCreate: {
        createdDefinition: { namespace: string; key: string } | null;
        userErrors: Array<{ message: string; code?: string }>;
      };
    }>(CREATE, {
      definition: {
        name: attribute.label,
        namespace: ATTRIBUTE_NAMESPACE,
        key: attribute.key,
        description: attribute.description,
        type: attribute.type,
        ownerType: 'PRODUCT',
        access: { storefront: 'PUBLIC_READ' },
      },
    });

    const result = data.metafieldDefinitionCreate;
    const taken = result.userErrors.find((error) => error.code === 'TAKEN');

    if (result.createdDefinition) {
      console.log(`created  ${ATTRIBUTE_NAMESPACE}.${attribute.key}`);
    } else if (taken) {
      console.log(`exists   ${ATTRIBUTE_NAMESPACE}.${attribute.key}`);
    } else {
      console.error(
        `failed   ${ATTRIBUTE_NAMESPACE}.${attribute.key}: ${result.userErrors
          .map((error) => error.message)
          .join('; ')}`
      );
      process.exitCode = 1;
    }
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error('failed:', message);
  if (message.includes('Access denied')) {
    console.error(
      'The app token needs write_metafield_definitions (and read/write_products).'
    );
  }
  process.exit(1);
});
