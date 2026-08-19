/**
 * Inspects (and optionally updates) the Shopify delivery profile that backs
 * the checkout's shipping options.
 *
 * The storefront quotes the delivery prices from `src/lib/content/delivery.ts`,
 * but the checkout charges whatever Shopify has configured — so the two have to
 * be kept in step by hand. This script is the tool for that (D-021).
 *
 *   npm run shipping:rates          # read-only report
 *   npm run shipping:rates -- apply # write the rates
 */

import {
  DELIVERY_TIERS,
  EXPRESS_DELIVERY,
} from '../src/lib/content/delivery';

const SHOP_DOMAIN = 'xwn9c1-m8.myshopify.com';
const API_VERSION = '2026-07';

type GraphqlResponse<T> = { data?: T; errors?: Array<{ message?: string }> };

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

  const payload = (await response.json()) as GraphqlResponse<T>;
  if (payload.errors?.length) {
    throw new Error(
      payload.errors.map((error) => error.message).join('; ') ||
        `HTTP ${response.status}`
    );
  }
  if (!payload.data) throw new Error(`No data (HTTP ${response.status})`);
  return payload.data;
}

/**
 * Shipping rates in Shopify are alternatives the customer picks between, not
 * add-ons that stack. Express therefore cannot be a "+$60 checkbox": each
 * service level needs its own express twin, priced at tier + surcharge.
 */
function plannedRates() {
  const standard = DELIVERY_TIERS.map((tier) => ({
    name: tier.name,
    amount: tier.priceCents / 100,
  }));
  const express = DELIVERY_TIERS.map((tier) => ({
    name: `${tier.name} — Express 24h`,
    amount: (tier.priceCents + EXPRESS_DELIVERY.surchargeCents) / 100,
  }));
  return [...standard, ...express];
}

type ProfilesQuery = {
  deliveryProfiles: {
    nodes: Array<{
      id: string;
      name: string;
      default: boolean;
      profileLocationGroups: Array<{
        locationGroupZones: {
          nodes: Array<{
            zone: { id: string; name: string };
            methodDefinitions: {
              nodes: Array<{
                id: string;
                name: string;
                active: boolean;
                rateProvider:
                  | { __typename: 'DeliveryRateDefinition'; price: { amount: string; currencyCode: string } }
                  | { __typename: 'DeliveryParticipant' };
              }>;
            };
          }>;
        };
      }>;
    }>;
  };
};

const PROFILES_QUERY = `
  query DeliveryProfiles {
    deliveryProfiles(first: 10) {
      nodes {
        id
        name
        default
        profileLocationGroups {
          locationGroupZones(first: 10) {
            nodes {
              zone { id name }
              methodDefinitions(first: 30) {
                nodes {
                  id
                  name
                  active
                  rateProvider {
                    __typename
                    ... on DeliveryRateDefinition {
                      price { amount currencyCode }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

function printPlan() {
  console.log('\nRates the storefront advertises (src/lib/content/delivery.ts):');
  for (const rate of plannedRates()) {
    console.log(`    - ${rate.name} — $${rate.amount.toFixed(2)}`);
  }
  console.log(
    '\nExpress is a twin of each tier rather than a stacking surcharge:\n' +
      'Shopify shipping rates are alternatives the customer chooses between,\n' +
      'so a "+$60 express" add-on does not exist at checkout.'
  );
}

async function report() {
  let data: ProfilesQuery;

  try {
    data = await adminGraphql<ProfilesQuery>(PROFILES_QUERY);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes('Access denied')) throw error;

    console.error(
      'Cannot read delivery profiles: this app token lacks the shipping scopes.\n' +
        'Add read_shipping (plus write_shipping to apply changes) to the custom\n' +
        'app in Shopify Admin and reinstall it, or set the rates by hand under\n' +
        'Settings -> Shipping and delivery.'
    );
    printPlan();
    process.exit(2);
  }

  for (const profile of data.deliveryProfiles.nodes) {
    console.log(
      `\nProfile: ${profile.name}${profile.default ? ' (default)' : ''}\n  ${profile.id}`
    );
    for (const group of profile.profileLocationGroups) {
      for (const zoneNode of group.locationGroupZones.nodes) {
        console.log(`  Zone: ${zoneNode.zone.name}  ${zoneNode.zone.id}`);
        for (const method of zoneNode.methodDefinitions.nodes) {
          const price =
            method.rateProvider.__typename === 'DeliveryRateDefinition'
              ? `${method.rateProvider.price.amount} ${method.rateProvider.price.currencyCode}`
              : 'carrier-calculated';
          console.log(
            `    - ${method.name} — ${price}${method.active ? '' : ' [inactive]'}`
          );
        }
      }
    }
  }

  printPlan();
}

report().catch((error) => {
  console.error('failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
