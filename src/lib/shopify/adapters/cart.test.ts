import assert from 'node:assert/strict';
import test from 'node:test';

import { adaptCart } from './cart';

const money = (amount: string) => ({ amount, currencyCode: 'USD' });

function shopifyCartFixture() {
  return {
    id: 'gid://shopify/Cart/abc',
    checkoutUrl: 'https://801outlet.com/checkouts/cn/abc',
    totalQuantity: 3,
    cost: {
      subtotalAmount: money('100.0'),
      totalAmount: money('107.5'),
      totalTaxAmount: money('7.5'),
    },
    discountCodes: [
      { code: 'SAVE10', applicable: true },
      { code: 'EXPIRED', applicable: false },
    ],
    lines: {
      nodes: [
        {
          id: 'gid://shopify/CartLine/1?cart=abc',
          quantity: 2,
          cost: { totalAmount: money('80.0') },
          merchandise: {
            id: 'gid://shopify/ProductVariant/11',
            title: 'Default Title',
            availableForSale: true,
            quantityAvailable: 5,
            price: money('40.0'),
            compareAtPrice: money('60.0'),
            selectedOptions: [{ name: 'Title', value: 'Default Title' }],
            image: {
              url: 'https://cdn.shopify.com/img.jpg',
              altText: null,
              width: 100,
              height: 100,
            },
            product: { handle: 'sofa-a', title: 'Sofa A' },
          },
        },
      ],
    },
  };
}

test('adapts a Shopify cart into the neutral cart view', () => {
  const view = adaptCart(shopifyCartFixture() as Parameters<typeof adaptCart>[0]);

  assert.equal(view.id, 'gid://shopify/Cart/abc');
  assert.equal(view.totalQuantity, 3);
  assert.equal(view.subtotal.amount, '100.0');
  assert.equal(view.total.amount, '107.5');
  assert.equal(view.totalTax?.amount, '7.5');
  assert.deepEqual(view.discountCodes, [
    { code: 'SAVE10', applicable: true },
    { code: 'EXPIRED', applicable: false },
  ]);

  const line = view.lines[0];
  assert.equal(line.quantity, 2);
  assert.equal(line.lineTotal.amount, '80.0');
  assert.equal(line.merchandise.variantId, 'gid://shopify/ProductVariant/11');
  assert.equal(line.merchandise.productHandle, 'sofa-a');
  assert.equal(line.merchandise.compareAtPrice?.amount, '60.0');
  assert.equal(line.merchandise.image?.url, 'https://cdn.shopify.com/img.jpg');
});

test('tolerates missing tax, image and compare-at price', () => {
  const fixture = shopifyCartFixture();
  fixture.cost.totalTaxAmount = null as never;
  fixture.lines.nodes[0].merchandise.compareAtPrice = null as never;
  fixture.lines.nodes[0].merchandise.image = null as never;

  const view = adaptCart(fixture as Parameters<typeof adaptCart>[0]);

  assert.equal(view.totalTax, null);
  assert.equal(view.lines[0].merchandise.compareAtPrice, null);
  assert.equal(view.lines[0].merchandise.image, null);
});
