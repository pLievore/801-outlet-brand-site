/**
 * Seeds fictitious customers + orders for demo/testing.
 * Run: npx tsx --env-file=.env.local scripts/seed-sales.ts
 *
 * Safe to re-run — uses unique emails so it won't duplicate.
 */
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function rnd<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rndInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const FIRST_NAMES = [
  'Emma','Liam','Olivia','Noah','Ava','Ethan','Sophia','Mason','Isabella','Logan',
  'Mia','Lucas','Charlotte','Aiden','Amelia','Jackson','Harper','Caden','Evelyn',
  'Grayson','Abigail','Carter','Emily','Jayden','Elizabeth','Wyatt','Mila','Sebastian',
  'Ella','Owen','Camila','Elijah','Luna','Caleb','Sofia','Ryan','Avery','Nathan',
  'Scarlett','Luke',
];

const LAST_NAMES = [
  'Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Wilson',
  'Anderson','Taylor','Thomas','Moore','Jackson','Martin','Lee','Perez','Thompson',
  'White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson','Walker','Young',
  'Allen','King','Wright',
];

const UTAH_CITIES = [
  { city: 'Salt Lake City', zip: '84101' },
  { city: 'Provo', zip: '84601' },
  { city: 'Ogden', zip: '84401' },
  { city: 'St. George', zip: '84770' },
  { city: 'Orem', zip: '84057' },
  { city: 'Sandy', zip: '84070' },
  { city: 'West Valley City', zip: '84120' },
  { city: 'Layton', zip: '84041' },
  { city: 'South Jordan', zip: '84095' },
  { city: 'Logan', zip: '84321' },
];

const STREETS = [
  '123 Maple St','456 Oak Ave','789 Pine Rd','321 Elm Blvd','654 Cedar Ln',
  '987 Birch Dr','147 Walnut Ct','258 Spruce Way','369 Willow Pl','741 Aspen Cir',
];

const STATUSES = [
  'paid','paid','paid','paid',
  'shipped','shipped','shipped',
  'delivered','delivered','delivered','delivered','delivered',
  'cancelled','pending',
] as const;

const PHONE_PREFIXES = ['801','385','435'];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Fetching existing products/variants…');

  const { data: variants } = await supabase
    .from('product_variants')
    .select('id, sku, name, price_cents, product_id, products!inner(name, status)')
    .eq('products.status', 'active' as never);

  if (!variants || variants.length === 0) {
    console.error('No active product variants found — run db:seed first.');
    process.exit(1);
  }

  // Build list of seedable items
  type V = typeof variants[0] & { products: { name: string } };
  const items = (variants as V[]).map((v) => ({
    variantId: v.id,
    sku: v.sku,
    variantName: v.name,
    productName: (v.products as { name: string }).name,
    priceCents: v.price_cents,
  }));

  console.log(`Found ${items.length} variants. Seeding customers & orders…`);

  const NUM_CUSTOMERS = 35;
  let createdCustomers = 0;
  let createdOrders = 0;

  for (let i = 0; i < NUM_CUSTOMERS; i++) {
    const first = rnd(FIRST_NAMES);
    const last = rnd(LAST_NAMES);
    const email = `${first.toLowerCase()}.${last.toLowerCase()}${rndInt(1, 99)}@example.com`;
    const { city, zip } = rnd(UTAH_CITIES);
    const street = rnd(STREETS);
    const phone = `+1${rnd(PHONE_PREFIXES)}${rndInt(1000000, 9999999)}`;
    const customerCreatedAt = daysAgo(rndInt(30, 365));

    // Skip if already exists
    const { data: existing } = await supabase
      .from('customers')
      .select('id')
      .eq('email', email)
      .single();

    let customerId: string;

    if (existing) {
      customerId = existing.id;
    } else {
      const { data: customer, error } = await supabase
        .from('customers')
        .insert({
          email,
          full_name: `${first} ${last}`,
          phone,
          created_at: customerCreatedAt,
        })
        .select('id')
        .single();

      if (error || !customer) {
        console.error(`Failed to insert customer ${email}:`, error?.message);
        continue;
      }
      customerId = customer.id;
      createdCustomers++;
    }

    // 1-4 orders per customer
    const numOrders = rndInt(1, 4);
    for (let j = 0; j < numOrders; j++) {
      const status = rnd(STATUSES);
      const orderDaysAgo = rndInt(1, 340);
      const createdAt = daysAgo(orderDaysAgo);
      const paidAt =
        status !== 'pending' && status !== 'cancelled'
          ? new Date(new Date(createdAt).getTime() + rndInt(1, 30) * 60_000).toISOString()
          : null;
      const shippedAt =
        status === 'shipped' || status === 'delivered'
          ? new Date(new Date(paidAt!).getTime() + rndInt(1, 3) * 86_400_000).toISOString()
          : null;

      // 1-3 line items
      const numItems = rndInt(1, 3);
      const lineItems = [];
      let subtotal = 0;

      for (let k = 0; k < numItems; k++) {
        const item = rnd(items);
        const qty = rndInt(1, 2);
        const lineTotal = item.priceCents * qty;
        subtotal += lineTotal;
        lineItems.push({
          variantId: item.variantId,
          sku: item.sku,
          productName: item.productName,
          variantName: item.variantName,
          unitPriceCents: item.priceCents,
          quantity: qty,
          lineTotalCents: lineTotal,
        });
      }

      const taxCents = Math.round(subtotal * 0.0695);
      const totalCents = subtotal + taxCents;

      const fullName = `${first} ${last}`;
      const shippingAddress = {
        line1: street,
        line2: '',
        city,
        state: 'UT',
        postalCode: zip,
        country: 'US',
        phone,
      };

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: customerId,
          email,
          status,
          subtotal_cents: subtotal,
          tax_cents: taxCents,
          shipping_cents: 0,
          total_cents: totalCents,
          shipping_address: shippingAddress,
          billing_address: shippingAddress,
          notes: fullName,
          created_at: createdAt,
          paid_at: paidAt,
          shipped_at: shippedAt,
        })
        .select('id')
        .single();

      if (orderError || !order) {
        console.error('Failed to insert order:', orderError?.message);
        continue;
      }

      // Insert line items
      await supabase.from('order_items').insert(
        lineItems.map((li) => ({
          order_id: order.id,
          variant_id: li.variantId,
          product_name: li.productName,
          variant_name: li.variantName,
          sku: li.sku,
          unit_price_cents: li.unitPriceCents,
          quantity: li.quantity,
          line_total_cents: li.lineTotalCents,
        }))
      );

      createdOrders++;
    }
  }

  console.log(`\n✓ Done!`);
  console.log(`  Customers created : ${createdCustomers}`);
  console.log(`  Orders created    : ${createdOrders}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
