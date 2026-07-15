import {
  getCollectionByHandle,
  getCollections,
  getProductByHandle,
  getProducts,
  getRelatedProducts,
  getShop,
  ShopifyStorefrontError,
} from '../src/lib/shopify';

async function main() {
  const [shop, collections, products] = await Promise.all([
    getShop(),
    getCollections({ first: 20 }),
    getProducts({ first: 20 }),
  ]);

  const variants = products.nodes.flatMap((product) => product.variants.nodes);
  const productHandle = products.nodes[0]?.handle;
  const collectionHandle =
    collections.nodes.find((collection) => collection.handle === 'all-products')
      ?.handle ?? collections.nodes[0]?.handle;

  const [product, collection] = await Promise.all([
    productHandle ? getProductByHandle(productHandle) : null,
    collectionHandle
      ? getCollectionByHandle({ handle: collectionHandle, first: 5 })
      : null,
  ]);
  const relatedProducts = product
    ? await getRelatedProducts(product.id, 4)
    : [];

  console.log(
    JSON.stringify(
      {
        shop: shop.name,
        primaryDomain: shop.primaryDomain.url,
        collections: collections.nodes.length,
        products: products.nodes.length,
        variants: variants.length,
        availableProducts: products.nodes.filter(
          (product) => product.availableForSale
        ).length,
        inventoryReadable: variants.some(
          (variant) => variant.quantityAvailable !== null
        ),
        productSample: product
          ? {
              handle: product.handle,
              variants: product.variants.nodes.length,
              media: product.media.nodes.length,
              relatedProducts: relatedProducts.length,
            }
          : null,
        collectionSample: collection
          ? {
              handle: collection.handle,
              products: collection.products.nodes.length,
            }
          : null,
      },
      null,
      2
    )
  );
}

main().catch((error: unknown) => {
  if (error instanceof ShopifyStorefrontError) {
    console.error(JSON.stringify(error.toJSON(), null, 2));
  } else if (error instanceof Error) {
    console.error(
      JSON.stringify({ name: error.name, message: error.message }, null, 2)
    );
  } else {
    console.error(JSON.stringify({ message: 'Unknown Shopify check error' }));
  }

  process.exitCode = 1;
});
