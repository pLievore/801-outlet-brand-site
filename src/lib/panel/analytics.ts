import 'server-only';

import { adminGraphql } from '../shopify-admin/client';

export type SalesPeriodDays = 7 | 30 | 60;

export type DailyRevenue = {
  /** YYYY-MM-DD in the shop timezone. */
  date: string;
  revenue: number;
  orders: number;
};

export type BestSeller = {
  productId: string | null;
  title: string;
  imageUrl: string | null;
  quantity: number;
  revenue: number;
};

export type RecentOrder = {
  id: string;
  name: string;
  createdAt: string;
  financialStatus: string | null;
  total: number;
};

export type SalesSummary = {
  currencyCode: string;
  timezone: string;
  totalRevenue: number;
  orderCount: number;
  unitsSold: number;
  averageOrderValue: number;
  daily: DailyRevenue[];
  bestSellers: BestSeller[];
  recentOrders: RecentOrder[];
};

type OrdersResponse = {
  orders: {
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    nodes: Array<{
      id: string;
      name: string;
      createdAt: string;
      cancelledAt: string | null;
      displayFinancialStatus: string | null;
      currentTotalPriceSet: { shopMoney: { amount: string; currencyCode: string } };
      lineItems: {
        nodes: Array<{
          title: string;
          quantity: number;
          discountedTotalSet: { shopMoney: { amount: string } };
          product: { id: string; featuredImage: { url: string } | null } | null;
        }>;
      };
    }>;
  };
};

// The panel intentionally avoids customer fields (name, email, address):
// they are not needed for sales analysis and would require Shopify's
// protected-customer-data approval.
const ORDERS_QUERY = `#graphql
  query PanelOrders($query: String!, $after: String) {
    orders(first: 100, query: $query, sortKey: CREATED_AT, reverse: true, after: $after) {
      pageInfo { hasNextPage endCursor }
      nodes {
        id
        name
        createdAt
        cancelledAt
        displayFinancialStatus
        currentTotalPriceSet { shopMoney { amount currencyCode } }
        lineItems(first: 50) {
          nodes {
            title
            quantity
            discountedTotalSet { shopMoney { amount } }
            product { id featuredImage { url } }
          }
        }
      }
    }
  }
`;

let cachedShopInfo: { timezone: string; currencyCode: string } | null = null;

async function getShopInfo() {
  if (cachedShopInfo) return cachedShopInfo;
  const data = await adminGraphql<{
    shop: { ianaTimezone: string; currencyCode: string };
  }>(`#graphql
    query PanelShopInfo {
      shop { ianaTimezone currencyCode }
    }
  `);
  cachedShopInfo = {
    timezone: data.shop.ianaTimezone,
    currencyCode: data.shop.currencyCode,
  };
  return cachedShopInfo;
}

function toLocalDateString(iso: string, timeZone: string): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(iso));
}

/**
 * Sales summary for the last N days built from Admin API order data.
 * The `read_orders` scope only exposes the trailing 60 days, so periods are
 * capped accordingly.
 */
export async function getSalesSummary(
  days: SalesPeriodDays
): Promise<SalesSummary> {
  const { timezone, currencyCode } = await getShopInfo();

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const query = `created_at:>='${since.toISOString()}'`;

  const orders: OrdersResponse['orders']['nodes'] = [];
  let after: string | null = null;
  do {
    const data: OrdersResponse = await adminGraphql<OrdersResponse>(
      ORDERS_QUERY,
      { query, after }
    );
    orders.push(...data.orders.nodes);
    after = data.orders.pageInfo.hasNextPage
      ? data.orders.pageInfo.endCursor
      : null;
  } while (after && orders.length < 2000);

  const active = orders.filter((order) => !order.cancelledAt);

  // Pre-fill every day of the window so the chart shows gaps as zero.
  const dailyMap = new Map<string, { revenue: number; orders: number }>();
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = toLocalDateString(
      new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      timezone
    );
    dailyMap.set(date, { revenue: 0, orders: 0 });
  }

  const sellers = new Map<string, BestSeller>();
  let totalRevenue = 0;
  let unitsSold = 0;

  for (const order of active) {
    const amount = Number(order.currentTotalPriceSet.shopMoney.amount);
    totalRevenue += amount;

    const day = toLocalDateString(order.createdAt, timezone);
    const bucket = dailyMap.get(day);
    if (bucket) {
      bucket.revenue += amount;
      bucket.orders += 1;
    }

    for (const item of order.lineItems.nodes) {
      unitsSold += item.quantity;
      const key = item.product?.id ?? `custom:${item.title}`;
      const entry = sellers.get(key) ?? {
        productId: item.product?.id ?? null,
        title: item.title,
        imageUrl: item.product?.featuredImage?.url ?? null,
        quantity: 0,
        revenue: 0,
      };
      entry.quantity += item.quantity;
      entry.revenue += Number(item.discountedTotalSet.shopMoney.amount);
      sellers.set(key, entry);
    }
  }

  const orderCount = active.length;

  return {
    currencyCode,
    timezone,
    totalRevenue,
    orderCount,
    unitsSold,
    averageOrderValue: orderCount > 0 ? totalRevenue / orderCount : 0,
    daily: [...dailyMap.entries()].map(([date, value]) => ({
      date,
      revenue: value.revenue,
      orders: value.orders,
    })),
    bestSellers: [...sellers.values()]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10),
    recentOrders: active.slice(0, 12).map((order) => ({
      id: order.id,
      name: order.name,
      createdAt: order.createdAt,
      financialStatus: order.displayFinancialStatus,
      total: Number(order.currentTotalPriceSet.shopMoney.amount),
    })),
  };
}
