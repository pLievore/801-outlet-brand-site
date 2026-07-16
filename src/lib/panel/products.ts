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

export async function setInventoryQuantities(
  quantities: Array<{ inventoryItemId: string; quantity: number }>
) {
  const locationId = await getPrimaryLocationId();
  const data = await adminGraphql<{
    inventorySetQuantities: {
      userErrors: Array<{ field?: string[] | null; message: string }>;
    };
  }>(
    `#graphql
    mutation PanelSetInventory($input: InventorySetQuantitiesInput!) {
      inventorySetQuantities(input: $input) {
        userErrors { field message }
      }
    }
  `,
    {
      input: {
        name: 'available',
        reason: 'correction',
        ignoreCompareQuantity: true,
        quantities: quantities.map((entry) => ({
          inventoryItemId: entry.inventoryItemId,
          locationId,
          quantity: entry.quantity,
        })),
      },
    }
  );
  assertNoUserErrors(
    'inventorySetQuantities',
    data.inventorySetQuantities.userErrors
  );
}
