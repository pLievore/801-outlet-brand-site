import 'server-only';

import {
  adminGraphql,
  assertNoUserErrors,
} from '../shopify-admin/client';

export type PanelVariant = {
  id: string;
  title: string;
  sku: string | null;
  price: string;
  compareAtPrice: string | null;
  inventoryQuantity: number;
  inventoryItemId: string;
};

export type PanelProduct = {
  id: string;
  title: string;
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  imageUrl: string | null;
  variants: PanelVariant[];
};

type ProductsResponse = {
  products: {
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    nodes: Array<{
      id: string;
      title: string;
      status: PanelProduct['status'];
      featuredImage: { url: string } | null;
      variants: {
        nodes: Array<{
          id: string;
          title: string;
          sku: string | null;
          price: string;
          compareAtPrice: string | null;
          inventoryQuantity: number | null;
          inventoryItem: { id: string };
        }>;
      };
    }>;
  };
};

const PRODUCTS_PAGE_QUERY = `#graphql
  query PanelProducts($query: String, $after: String) {
    products(first: 100, query: $query, sortKey: TITLE, after: $after) {
      pageInfo { hasNextPage endCursor }
      nodes {
        id
        title
        status
        featuredImage { url }
        variants(first: 50) {
          nodes {
            id
            title
            sku
            price
            compareAtPrice
            inventoryQuantity
            inventoryItem { id }
          }
        }
      }
    }
  }
`;

function adaptProduct(node: ProductsResponse['products']['nodes'][number]): PanelProduct {
  return {
    id: node.id,
    title: node.title,
    status: node.status,
    imageUrl: node.featuredImage?.url ?? null,
    variants: node.variants.nodes.map((variant) => ({
      id: variant.id,
      title: variant.title,
      sku: variant.sku,
      price: variant.price,
      compareAtPrice: variant.compareAtPrice,
      inventoryQuantity: variant.inventoryQuantity ?? 0,
      inventoryItemId: variant.inventoryItem.id,
    })),
  };
}

export async function listPanelProducts(search?: string): Promise<PanelProduct[]> {
  const products: PanelProduct[] = [];
  let after: string | null = null;

  do {
    const data: ProductsResponse = await adminGraphql<ProductsResponse>(
      PRODUCTS_PAGE_QUERY,
      {
        query: search ? `title:*${search.replace(/["\\]/g, '')}*` : null,
        after,
      }
    );
    products.push(...data.products.nodes.map(adaptProduct));
    after = data.products.pageInfo.hasNextPage
      ? data.products.pageInfo.endCursor
      : null;
  } while (after && products.length < 1000);

  return products;
}

let cachedLocationId: string | null = null;

export async function getPrimaryLocationId(): Promise<string> {
  if (cachedLocationId) return cachedLocationId;
  const data = await adminGraphql<{
    locations: { nodes: Array<{ id: string }> };
  }>(`#graphql
    query PanelPrimaryLocation {
      locations(first: 1) {
        nodes { id }
      }
    }
  `);
  const id = data.locations.nodes[0]?.id;
  if (!id) throw new Error('No inventory location found');
  cachedLocationId = id;
  return id;
}

export type StagedUploadTarget = {
  url: string;
  resourceUrl: string;
  parameters: Array<{ name: string; value: string }>;
};

/**
 * Uploads one image to Shopify's staged upload storage and returns the
 * resource URL to attach as product media. The file never touches disk and
 * is never exposed to the browser beyond the operator's own selection.
 */
export async function uploadImageToShopify(file: {
  filename: string;
  mimeType: string;
  bytes: ArrayBuffer;
}): Promise<string> {
  const data = await adminGraphql<{
    stagedUploadsCreate: {
      stagedTargets: StagedUploadTarget[] | null;
      userErrors: Array<{ field?: string[] | null; message: string }>;
    };
  }>(
    `#graphql
    mutation PanelStagedUpload($input: [StagedUploadInput!]!) {
      stagedUploadsCreate(input: $input) {
        stagedTargets {
          url
          resourceUrl
          parameters { name value }
        }
        userErrors { field message }
      }
    }
  `,
    {
      input: [
        {
          filename: file.filename,
          mimeType: file.mimeType,
          resource: 'IMAGE',
          httpMethod: 'POST',
          fileSize: String(file.bytes.byteLength),
        },
      ],
    }
  );
  assertNoUserErrors('stagedUploadsCreate', data.stagedUploadsCreate.userErrors);

  const target = data.stagedUploadsCreate.stagedTargets?.[0];
  if (!target) throw new Error('Shopify did not return an upload target');

  const form = new FormData();
  for (const parameter of target.parameters) {
    form.append(parameter.name, parameter.value);
  }
  form.append(
    'file',
    new Blob([file.bytes], { type: file.mimeType }),
    file.filename
  );

  const response = await fetch(target.url, { method: 'POST', body: form });
  if (!response.ok) {
    throw new Error(`Image upload failed with status ${response.status}`);
  }

  return target.resourceUrl;
}

export async function createPanelProduct(input: {
  title: string;
  descriptionHtml: string;
  status: PanelProduct['status'];
  price: string;
  compareAtPrice: string | null;
  sku: string | null;
  quantity: number;
  imageResourceUrls: string[];
}): Promise<{ productId: string }> {
  const data = await adminGraphql<{
    productCreate: {
      product: {
        id: string;
        variants: {
          nodes: Array<{ id: string; inventoryItem: { id: string } }>;
        };
      } | null;
      userErrors: Array<{ field?: string[] | null; message: string }>;
    };
  }>(
    `#graphql
    mutation PanelProductCreate($product: ProductCreateInput!, $media: [CreateMediaInput!]) {
      productCreate(product: $product, media: $media) {
        product {
          id
          variants(first: 1) {
            nodes { id inventoryItem { id } }
          }
        }
        userErrors { field message }
      }
    }
  `,
    {
      product: {
        title: input.title,
        descriptionHtml: input.descriptionHtml,
        status: input.status,
      },
      media: input.imageResourceUrls.map((resourceUrl) => ({
        originalSource: resourceUrl,
        mediaContentType: 'IMAGE',
      })),
    }
  );
  assertNoUserErrors('productCreate', data.productCreate.userErrors);

  const product = data.productCreate.product;
  const variant = product?.variants.nodes[0];
  if (!product || !variant) {
    throw new Error('Product was not created');
  }

  const pricing = await adminGraphql<{
    productVariantsBulkUpdate: {
      userErrors: Array<{ field?: string[] | null; message: string }>;
    };
  }>(
    `#graphql
    mutation PanelNewVariantSetup($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        userErrors { field message }
      }
    }
  `,
    {
      productId: product.id,
      variants: [
        {
          id: variant.id,
          price: input.price,
          compareAtPrice: input.compareAtPrice,
          inventoryItem: {
            tracked: true,
            ...(input.sku ? { sku: input.sku } : {}),
          },
        },
      ],
    }
  );
  assertNoUserErrors(
    'productVariantsBulkUpdate',
    pricing.productVariantsBulkUpdate.userErrors
  );

  await setInventoryQuantities([
    { inventoryItemId: variant.inventoryItem.id, quantity: input.quantity },
  ]);

  return { productId: product.id };
}

export async function updateProductStatus(
  productId: string,
  status: PanelProduct['status']
) {
  const data = await adminGraphql<{
    productUpdate: {
      product: { id: string } | null;
      userErrors: Array<{ field?: string[] | null; message: string }>;
    };
  }>(
    `#graphql
    mutation PanelProductStatus($product: ProductUpdateInput!) {
      productUpdate(product: $product) {
        product { id }
        userErrors { field message }
      }
    }
  `,
    { product: { id: productId, status } }
  );
  assertNoUserErrors('productUpdate', data.productUpdate.userErrors);
}

export async function updateVariantPricing(
  productId: string,
  variants: Array<{ id: string; price: string; compareAtPrice: string | null }>
) {
  const data = await adminGraphql<{
    productVariantsBulkUpdate: {
      userErrors: Array<{ field?: string[] | null; message: string }>;
    };
  }>(
    `#graphql
    mutation PanelVariantPricing($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        userErrors { field message }
      }
    }
  `,
    { productId, variants }
  );
  assertNoUserErrors(
    'productVariantsBulkUpdate',
    data.productVariantsBulkUpdate.userErrors
  );
}

async function getAvailableQuantities(
  inventoryItemIds: string[],
  locationId: string
): Promise<Map<string, number>> {
  const result = new Map<string, number>();
  for (let index = 0; index < inventoryItemIds.length; index += 100) {
    const chunk = inventoryItemIds.slice(index, index + 100);
    const data = await adminGraphql<{
      nodes: Array<{
        id: string;
        inventoryLevel: {
          quantities: Array<{ quantity: number }>;
        } | null;
      } | null>;
    }>(
      `#graphql
      query PanelAvailableQuantities($ids: [ID!]!, $locationId: ID!) {
        nodes(ids: $ids) {
          ... on InventoryItem {
            id
            inventoryLevel(locationId: $locationId) {
              quantities(names: ["available"]) { quantity }
            }
          }
        }
      }
    `,
      { ids: chunk, locationId }
    );
    for (const node of data.nodes) {
      if (node?.id) {
        result.set(node.id, node.inventoryLevel?.quantities[0]?.quantity ?? 0);
      }
    }
  }
  return result;
}

export async function setInventoryQuantities(
  quantities: Array<{ inventoryItemId: string; quantity: number }>
) {
  const locationId = await getPrimaryLocationId();
  // 2026-07 requires changeFromQuantity (optimistic concurrency) on every
  // entry and an @idempotent key on the field.
  const current = await getAvailableQuantities(
    quantities.map((entry) => entry.inventoryItemId),
    locationId
  );
  const idempotencyKey = crypto.randomUUID();
  const data = await adminGraphql<{
    inventorySetQuantities: {
      userErrors: Array<{ field?: string[] | null; message: string }>;
    };
  }>(
    `#graphql
    mutation PanelSetInventory($input: InventorySetQuantitiesInput!) {
      inventorySetQuantities(input: $input) @idempotent(key: "${idempotencyKey}") {
        userErrors { field message }
      }
    }
  `,
    {
      input: {
        name: 'available',
        reason: 'correction',
        quantities: quantities.map((entry) => ({
          inventoryItemId: entry.inventoryItemId,
          locationId,
          quantity: entry.quantity,
          changeFromQuantity: current.get(entry.inventoryItemId) ?? 0,
        })),
      },
    }
  );
  assertNoUserErrors(
    'inventorySetQuantities',
    data.inventorySetQuantities.userErrors
  );
}
