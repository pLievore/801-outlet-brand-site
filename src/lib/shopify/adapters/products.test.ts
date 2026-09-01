import assert from 'node:assert/strict';
import test from 'node:test';

import type {
  CollectionByHandleQuery,
  ProductByHandleQuery,
} from '../types/storefront.generated';
import { adaptProductCard, adaptProductDetail } from './products';

type CollectionProduct = NonNullable<
  CollectionByHandleQuery['collection']
>['products']['nodes'][number];
type ProductDetail = NonNullable<ProductByHandleQuery['product']>;

test('adapts a Shopify collection product without leaking GraphQL types', () => {
  const source = {
    id: 'gid://shopify/Product/1',
    handle: 'linen-sofa',
    title: 'Linen Sofa',
    productType: '',
    vendor: '801 Outlet',
    availableForSale: true,
    featuredImage: {
      url: 'https://cdn.shopify.com/sofa.jpg',
      altText: 'Linen sofa',
      width: 1200,
      height: 900,
    },
    priceRange: {
      minVariantPrice: { amount: '699.00', currencyCode: 'USD' },
      maxVariantPrice: { amount: '699.00', currencyCode: 'USD' },
    },
    compareAtPriceRange: {
      minVariantPrice: { amount: '899.00', currencyCode: 'USD' },
      maxVariantPrice: { amount: '899.00', currencyCode: 'USD' },
    },
  } as CollectionProduct;

  assert.deepEqual(adaptProductCard(source), {
    id: 'gid://shopify/Product/1',
    handle: 'linen-sofa',
    title: 'Linen Sofa',
    description: null,
    availableForSale: true,
    tags: [],
    price: { amount: '699.00', currencyCode: 'USD' },
    compareAtPrice: { amount: '899.00', currencyCode: 'USD' },
    images: [
      {
        url: 'https://cdn.shopify.com/sofa.jpg',
        alt: 'Linen sofa',
        width: 1200,
        height: 900,
      },
    ],
    // This source selects no variants, so there is no single one to offer —
    // the catalogue card sends people to the page instead.
    soleVariantId: null,
  });
});

test('deduplicates product media and normalizes optional inventory', () => {
  const source = {
    id: 'gid://shopify/Product/1',
    handle: 'linen-sofa',
    title: 'Linen Sofa',
    description: 'A comfortable sofa.',
    descriptionHtml: '<p>A comfortable sofa.</p>',
    productType: 'Sofa',
    vendor: '801 Outlet',
    tags: [],
    availableForSale: true,
    updatedAt: '2026-07-15T00:00:00Z',
    seo: { title: '', description: '' },
    featuredImage: {
      url: 'https://cdn.shopify.com/sofa.jpg',
      altText: 'Linen sofa',
      width: 1200,
      height: 900,
    },
    priceRange: {
      minVariantPrice: { amount: '699.00', currencyCode: 'USD' },
      maxVariantPrice: { amount: '699.00', currencyCode: 'USD' },
    },
    compareAtPriceRange: {
      minVariantPrice: { amount: '0.00', currencyCode: 'USD' },
      maxVariantPrice: { amount: '0.00', currencyCode: 'USD' },
    },
    options: [{ id: 'option-1', name: 'Color', values: ['Sage'] }],
    media: {
      nodes: [
        {
          id: 'media-1',
          alt: 'Linen sofa',
          mediaContentType: 'IMAGE',
          previewImage: null,
          image: {
            url: 'https://cdn.shopify.com/sofa.jpg',
            altText: 'Linen sofa',
            width: 1200,
            height: 900,
          },
        },
      ],
    },
    variants: {
      nodes: [
        {
          id: 'gid://shopify/ProductVariant/1',
          title: 'Sage',
          sku: 'SOFA-SAGE',
          availableForSale: true,
          currentlyNotInStock: false,
          quantityAvailable: undefined,
          selectedOptions: [{ name: 'Color', value: 'Sage' }],
          price: { amount: '699.00', currencyCode: 'USD' },
          compareAtPrice: null,
          image: null,
        },
      ],
    },
  } as unknown as ProductDetail;

  const result = adaptProductDetail(source);

  assert.equal(result.images.length, 1);
  assert.equal(result.compareAtPrice, null);
  assert.equal(result.variants[0]?.quantityAvailable, null);
  assert.deepEqual(result.options[0], {
    id: 'option-1',
    name: 'Color',
    values: ['Sage'],
  });
});

/**
 * The catalogue can only offer "Add to cart" when there is exactly one thing to
 * add. A card has no room to ask which colour, so anything with a choice has to
 * keep sending people to the product page.
 */
test('offers a single variant to the card, and nothing when there is a choice', () => {
  const base = {
    id: 'gid://shopify/Product/1',
    handle: 'linen-sofa',
    title: 'Linen Sofa',
    availableForSale: true,
    featuredImage: null,
    priceRange: {
      minVariantPrice: { amount: '699.00', currencyCode: 'USD' },
      maxVariantPrice: { amount: '699.00', currencyCode: 'USD' },
    },
    compareAtPriceRange: {
      minVariantPrice: { amount: '699.00', currencyCode: 'USD' },
      maxVariantPrice: { amount: '699.00', currencyCode: 'USD' },
    },
  };

  const withVariants = (
    nodes: Array<{ id: string; availableForSale: boolean }>
  ) => adaptProductCard({ ...base, variants: { nodes } } as never);

  assert.equal(
    withVariants([{ id: 'gid://shopify/ProductVariant/1', availableForSale: true }])
      .soleVariantId,
    'gid://shopify/ProductVariant/1'
  );

  // Two to choose from: the card cannot decide, so it declines to.
  assert.equal(
    withVariants([
      { id: 'gid://shopify/ProductVariant/1', availableForSale: true },
      { id: 'gid://shopify/ProductVariant/2', availableForSale: true },
    ]).soleVariantId,
    null
  );

  // One listed, none sellable — nothing to add.
  assert.equal(
    withVariants([
      { id: 'gid://shopify/ProductVariant/1', availableForSale: false },
    ]).soleVariantId,
    null
  );

  // Two listed but only one sellable: that one is the answer.
  assert.equal(
    withVariants([
      { id: 'gid://shopify/ProductVariant/1', availableForSale: false },
      { id: 'gid://shopify/ProductVariant/2', availableForSale: true },
    ]).soleVariantId,
    'gid://shopify/ProductVariant/2'
  );
});
