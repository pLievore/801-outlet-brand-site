/**
 * Reports and fixes which products are published to the headless sales channel.
 *
 * In a headless store `ACTIVE` is not enough: a product the Storefront API can
 * see must also be published to the channel that serves the site. A product
 * created through the Admin API — by the panel or by the spreadsheet import —
 * is published to nothing, so it exists in Shopify and simply does not exist
 * for the storefront, with no error anywhere (D-026).
 *
 *   npm run publish:channel              # read-only report
 *   npm run publish:channel -- --apply   # publish everything that is missing
 *
 * Publishing is deliberately independent of status: a draft is published to the
 * channel too, so that flipping it to Active is the only step left when the
 * piece is ready.
 *
 * Requires read_publications (and write_publications to apply) on the token.
 */

// Marks the file as a module: a script with no imports shares the global scope
// with the other standalone scripts, and their identical helpers collide.
export {};

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

type Publication = { id: string; name: string };

async function listPublications(): Promise<Publication[]> {
  const data = await adminGraphql<{
    publications: { nodes: Publication[] };
  }>(`
    query PublishChannelPublications {
      publications(first: 25) {
        nodes { id name }
      }
    }
  `);
  return data.publications.nodes;
}

type ProductRow = {
  id: string;
  title: string;
  status: string;
  resourcePublications: {
    nodes: Array<{ publication: { id: string }; isPublished: boolean }>;
  };
};

async function listProducts(): Promise<ProductRow[]> {
  const products: ProductRow[] = [];
  let cursor: string | null = null;

  for (;;) {
    const data: {
      products: {
        nodes: ProductRow[];
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
      };
    } = await adminGraphql(
      `
      query PublishChannelProducts($cursor: String) {
        products(first: 100, after: $cursor) {
          nodes {
            id
            title
            status
            resourcePublications(first: 25) {
              nodes { publication { id } isPublished }
            }
          }
          pageInfo { hasNextPage endCursor }
        }
      }
    `,
      { cursor }
    );

    products.push(...data.products.nodes);
    if (!data.products.pageInfo.hasNextPage) break;
    cursor = data.products.pageInfo.endCursor;
  }

  return products;
}

async function publish(productId: string, publicationId: string) {
  const data = await adminGraphql<{
    publishablePublish: {
      userErrors: Array<{ field?: string[] | null; message: string }>;
    };
  }>(
    `
    mutation PublishChannelPublish($id: ID!, $input: [PublicationInput!]!) {
      publishablePublish(id: $id, input: $input) {
        userErrors { field message }
      }
    }
  `,
    { id: productId, input: [{ publicationId }] }
  );

  const errors = data.publishablePublish.userErrors;
  if (errors.length > 0) {
    throw new Error(errors.map((error) => error.message).join('; '));
  }
}

async function main() {
  const args = process.argv.slice(2);
  const shouldApply = args.includes('--apply');

  const configured = process.env.SHOPIFY_HEADLESS_PUBLICATION_ID?.trim();
  const publications = await listPublications();

  console.log('Sales channels on this shop:');
  for (const publication of publications) {
    const mark = publication.id === configured ? ' <- configured' : '';
    console.log(`  ${publication.name}${mark}`);
    console.log(`    ${publication.id}`);
  }

  if (!configured) {
    console.error(
      '\nSHOPIFY_HEADLESS_PUBLICATION_ID is not set. Copy the id of the channel' +
        ' that serves the storefront from the list above into the env.'
    );
    process.exitCode = 1;
    return;
  }

  const target = publications.find(
    (publication) => publication.id === configured
  );
  if (!target) {
    console.error(
      `\nSHOPIFY_HEADLESS_PUBLICATION_ID points at ${configured}, which this shop does not have.`
    );
    process.exitCode = 1;
    return;
  }

  const products = await listProducts();
  const missing = products.filter(
    (product) =>
      !product.resourcePublications.nodes.some(
        (entry) => entry.publication.id === target.id && entry.isPublished
      )
  );

  console.log(`\nTarget channel: ${target.name}`);
  console.log(`Products: ${products.length}`);
  console.log(`  published:   ${products.length - missing.length}`);
  console.log(`  missing:     ${missing.length}`);

  if (missing.length === 0) {
    console.log('\nNothing to do — every product is on the channel.');
    return;
  }

  for (const product of missing) {
    console.log(`  ${product.status.padEnd(8)} ${product.title}`);
  }

  if (!shouldApply) {
    console.log('\nRead-only. Re-run with --apply to publish these.');
    return;
  }

  console.log('');
  let done = 0;
  for (const product of missing) {
    try {
      await publish(product.id, target.id);
      done += 1;
      console.log(`published  ${product.title}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`FAILED     ${product.title}: ${message}`);
      process.exitCode = 1;
    }
  }

  console.log(`\n${done} of ${missing.length} published to ${target.name}.`);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error('failed:', message);
  if (message.includes('Access denied')) {
    console.error(
      'The app token needs read_publications and write_publications. Changing' +
        ' scopes requires updating the app install, not only releasing a version.'
    );
  }
  process.exit(1);
});
