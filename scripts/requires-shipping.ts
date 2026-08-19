/**
 * Reports and fixes products that Shopify believes need no shipping.
 *
 * A variant whose inventory item has `requiresShipping: false` makes the
 * checkout skip delivery entirely: no address step, no shipping options, no
 * delivery charge. For a furniture store that silently gives every order free
 * delivery — the same class of bug as the $0 local delivery rate in D-021.
 *
 *   npm run shipping:required            # read-only report
 *   npm run shipping:required -- --apply # mark them as physical products
 */

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

type ProductsQuery = {
  products: {
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    nodes: Array<{
      title: string;
      status: string;
      variants: {
        nodes: Array<{
          title: string;
          inventoryItem: { id: string; requiresShipping: boolean };
        }>;
      };
    }>;
  };
};

const PRODUCTS_QUERY = `
  query ShippingAudit($after: String) {
    products(first: 100, after: $after, sortKey: TITLE) {
      pageInfo { hasNextPage endCursor }
      nodes {
        title
        status
        variants(first: 50) {
          nodes {
            title
            inventoryItem { id requiresShipping }
          }
        }
      }
    }
  }
`;

const UPDATE_ITEM = `
  mutation MarkPhysical($id: ID!) {
    inventoryItemUpdate(id: $id, input: { requiresShipping: true }) {
      inventoryItem { id requiresShipping }
      userErrors { field message }
    }
  }
`;

type Offender = { label: string; inventoryItemId: string; status: string };

async function collect(): Promise<Offender[]> {
  const offenders: Offender[] = [];
  let after: string | null = null;

  do {
    const data: ProductsQuery = await adminGraphql<ProductsQuery>(
      PRODUCTS_QUERY,
      { after }
    );

    for (const product of data.products.nodes) {
      for (const variant of product.variants.nodes) {
        if (variant.inventoryItem.requiresShipping) continue;
        const suffix =
          variant.title === 'Default Title' ? '' : ` / ${variant.title}`;
        offenders.push({
          label: `${product.title}${suffix}`,
          inventoryItemId: variant.inventoryItem.id,
          status: product.status,
        });
      }
    }

    after = data.products.pageInfo.hasNextPage
      ? data.products.pageInfo.endCursor
      : null;
  } while (after);

  return offenders;
}

async function main() {
  const shouldApply = process.argv.includes('--apply');
  const offenders = await collect();

  if (offenders.length === 0) {
    console.log('Every variant already requires shipping. Nothing to do.');
    return;
  }

  console.log(
    `${offenders.length} variant(s) marked as needing no shipping — the` +
      ' checkout skips delivery for these:\n'
  );
  for (const offender of offenders) {
    console.log(`  [${offender.status}] ${offender.label}`);
  }

  if (!shouldApply) {
    console.log('\nRead-only. Re-run with --apply to mark them as physical.');
    return;
  }

  console.log('\nApplying...');
  let fixed = 0;

  for (const offender of offenders) {
    const data = await adminGraphql<{
      inventoryItemUpdate: {
        userErrors: Array<{ field?: string[] | null; message: string }>;
      };
    }>(UPDATE_ITEM, { id: offender.inventoryItemId });

    const errors = data.inventoryItemUpdate.userErrors;
    if (errors.length > 0) {
      console.error(
        `  failed  ${offender.label}: ${errors.map((e) => e.message).join('; ')}`
      );
      continue;
    }
    fixed += 1;
    console.log(`  fixed   ${offender.label}`);
  }

  console.log(`\nDone: ${fixed}/${offenders.length}.`);
}

main().catch((error) => {
  console.error('failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
