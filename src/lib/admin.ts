import 'server-only';
import { supabaseAdmin } from './supabase/admin';
import { getServerSession } from './supabase/server';
import { redirect } from 'next/navigation';

// ─── Auth guard ───────────────────────────────────────────────────────────────

export async function requireAdmin() {
  const user = await getServerSession();
  if (!user) redirect('/admin/login');

  const { data: adminRecord } = await supabaseAdmin
    .from('admin_users')
    .select('id, role, full_name, email')
    .eq('auth_user_id', user.id)
    .single();

  if (!adminRecord) redirect('/admin/login?error=unauthorized');
  return adminRecord;
}

// ─── KPI helpers ─────────────────────────────────────────────────────────────

export type Period = '7d' | '30d' | '90d' | '12m';

function periodStart(period: Period): string {
  const now = new Date();
  switch (period) {
    case '7d':
      now.setDate(now.getDate() - 7);
      break;
    case '30d':
      now.setDate(now.getDate() - 30);
      break;
    case '90d':
      now.setDate(now.getDate() - 90);
      break;
    case '12m':
      now.setFullYear(now.getFullYear() - 1);
      break;
  }
  return now.toISOString();
}

export interface RevenueKpis {
  revenueToday: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
  revenueYtd: number;
  ordersToday: number;
  ordersThisWeek: number;
  ordersThisMonth: number;
  aov: number; // average order value cents, last 30d
}

export async function getRevenueKpis(): Promise<RevenueKpis> {
  const now = new Date();

  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);

  const monthStart = new Date(now);
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const ytdStart = new Date(now.getFullYear(), 0, 1);

  const { data: orders } = await supabaseAdmin
    .from('orders')
    .select('total_cents, created_at')
    .eq('status', 'paid')
    .gte('created_at', ytdStart.toISOString());

  const rows = orders ?? [];

  const todayIso = todayStart.toISOString();
  const weekIso = weekStart.toISOString();
  const monthIso = monthStart.toISOString();

  const filterSum = (since: string) =>
    rows.filter((o) => o.created_at >= since).reduce((a, o) => a + (o.total_cents ?? 0), 0);
  const filterCount = (since: string) => rows.filter((o) => o.created_at >= since).length;

  const last30 = rows.filter((o) => o.created_at >= weekStart.toISOString());
  const aov = last30.length
    ? Math.round(last30.reduce((a, o) => a + (o.total_cents ?? 0), 0) / last30.length)
    : 0;

  return {
    revenueToday: filterSum(todayIso),
    revenueThisWeek: filterSum(weekIso),
    revenueThisMonth: filterSum(monthIso),
    revenueYtd: rows.reduce((a, o) => a + (o.total_cents ?? 0), 0),
    ordersToday: filterCount(todayIso),
    ordersThisWeek: filterCount(weekIso),
    ordersThisMonth: filterCount(monthIso),
    aov,
  };
}

export interface ChartPoint {
  date: string; // YYYY-MM-DD
  revenue: number; // cents
  orders: number;
}

export async function getRevenueChart(period: Period): Promise<ChartPoint[]> {
  const since = periodStart(period);

  const { data } = await supabaseAdmin
    .from('orders')
    .select('total_cents, created_at')
    .eq('status', 'paid')
    .gte('created_at', since)
    .order('created_at');

  const map = new Map<string, ChartPoint>();
  for (const row of data ?? []) {
    const day = row.created_at.slice(0, 10);
    const existing = map.get(day) ?? { date: day, revenue: 0, orders: 0 };
    existing.revenue += row.total_cents ?? 0;
    existing.orders += 1;
    map.set(day, existing);
  }

  // Fill in gaps
  const result: ChartPoint[] = [];
  const start = new Date(since);
  const end = new Date();
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().slice(0, 10);
    result.push(map.get(key) ?? { date: key, revenue: 0, orders: 0 });
  }
  return result;
}

export interface TopProduct {
  productName: string;
  sku: string;
  quantity: number;
  revenue: number; // cents
}

export async function getTopProducts(period: Period, limit = 10): Promise<TopProduct[]> {
  const since = periodStart(period);

  const { data } = await supabaseAdmin
    .from('order_items')
    .select('product_name, sku, quantity, line_total_cents, order:orders!inner(created_at, status)')
    .eq('order.status', 'paid')
    .gte('order.created_at', since);

  const map = new Map<string, TopProduct>();
  for (const item of data ?? []) {
    const key = item.sku;
    const existing = map.get(key) ?? {
      productName: item.product_name,
      sku: item.sku,
      quantity: 0,
      revenue: 0,
    };
    existing.quantity += item.quantity;
    existing.revenue += item.line_total_cents;
    map.set(key, existing);
  }

  return [...map.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

// ─── Orders chart ────────────────────────────────────────────────────────────

export async function getOrdersChart(period: Period): Promise<ChartPoint[]> {
  return getRevenueChart(period);
}

// ─── Sales by product ────────────────────────────────────────────────────────

export interface CategorySlice {
  name: string;
  revenue: number; // cents
}

export async function getSalesByCategory(period: Period, limit = 6): Promise<CategorySlice[]> {
  const since = periodStart(period);

  // 1. Fetch paid order items in period
  const { data: items } = await supabaseAdmin
    .from('order_items')
    .select('variant_id, line_total_cents, order:orders!inner(created_at, status)')
    .eq('order.status', 'paid')
    .gte('order.created_at', since);

  const rows = items ?? [];
  if (!rows.length) return [];

  // 2. variant_id → product_id
  const variantIds = [...new Set(rows.map((r) => r.variant_id).filter(Boolean))] as string[];
  const { data: variants } = await supabaseAdmin
    .from('product_variants')
    .select('id, product_id')
    .in('id', variantIds);

  const variantToProduct = new Map<string, string>();
  for (const v of variants ?? []) variantToProduct.set(v.id, v.product_id);

  // 3. product_id → category_id (use first category per product)
  const productIds = [...new Set(variantToProduct.values())];
  const { data: pcs } = await supabaseAdmin
    .from('product_categories')
    .select('product_id, category_id')
    .in('product_id', productIds);

  const productToCategory = new Map<string, string>();
  for (const pc of pcs ?? []) {
    if (!productToCategory.has(pc.product_id)) productToCategory.set(pc.product_id, pc.category_id);
  }

  // 4. category_id → name (root categories only for clarity)
  const categoryIds = [...new Set(productToCategory.values())];
  const { data: cats } = await supabaseAdmin
    .from('categories')
    .select('id, name, parent_id')
    .in('id', categoryIds);

  // If category has a parent, use parent name instead (collapse sub-categories)
  const allCatIds = [...new Set((cats ?? []).map((c) => c.parent_id).filter(Boolean))] as string[];
  let parentNames = new Map<string, string>();
  if (allCatIds.length) {
    const { data: parents } = await supabaseAdmin
      .from('categories')
      .select('id, name')
      .in('id', allCatIds);
    for (const p of parents ?? []) parentNames.set(p.id, p.name);
  }

  const catIdToName = new Map<string, string>();
  for (const c of cats ?? []) {
    catIdToName.set(c.id, c.parent_id && parentNames.get(c.parent_id) ? parentNames.get(c.parent_id)! : c.name);
  }

  // 5. Aggregate revenue by category name
  const revenueMap = new Map<string, number>();
  for (const item of rows) {
    const productId = item.variant_id ? variantToProduct.get(item.variant_id) : undefined;
    const categoryId = productId ? productToCategory.get(productId) : undefined;
    const categoryName = categoryId ? (catIdToName.get(categoryId) ?? 'Uncategorized') : 'Uncategorized';
    revenueMap.set(categoryName, (revenueMap.get(categoryName) ?? 0) + item.line_total_cents);
  }

  const sorted = [...revenueMap.entries()]
    .map(([name, revenue]) => ({ name, revenue }))
    .sort((a, b) => b.revenue - a.revenue);

  if (sorted.length <= limit) return sorted;

  const top = sorted.slice(0, limit - 1);
  const otherRevenue = sorted.slice(limit - 1).reduce((s, r) => s + r.revenue, 0);
  return [...top, { name: 'Other', revenue: otherRevenue }];
}

// ─── Orders list ─────────────────────────────────────────────────────────────

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export interface AdminOrder {
  id: string;
  orderNumber: number;
  email: string;
  status: OrderStatus;
  totalCents: number;
  createdAt: string;
  paidAt: string | null;
  shippedAt: string | null;
  itemCount: number;
}

export interface AdminOrderDetail extends AdminOrder {
  subtotalCents: number;
  taxCents: number;
  shippingCents: number;
  notes: string | null;
  shippingAddress: Record<string, string> | null;
  squarePaymentId: string | null;
  items: Array<{
    id: string;
    productName: string;
    variantName: string;
    sku: string;
    unitPriceCents: number;
    quantity: number;
    lineTotalCents: number;
  }>;
}

export async function getAdminOrders(opts: {
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ orders: AdminOrder[]; total: number }> {
  const page = opts.page ?? 1;
  const pageSize = opts.pageSize ?? 20;

  let q = supabaseAdmin
    .from('orders')
    .select('id, order_number, email, status, total_cents, created_at, paid_at, shipped_at', {
      count: 'exact',
    });

  if (opts.status && opts.status !== 'all') q = q.eq('status', opts.status as OrderStatus);
  if (opts.search) q = q.or(`email.ilike.%${opts.search}%,order_number.eq.${Number(opts.search) || 0}`);

  q = q
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  const { data, count } = await q;

  // Get item counts per order
  const ids = (data ?? []).map((o) => o.id);
  const { data: itemRows } = ids.length
    ? await supabaseAdmin
        .from('order_items')
        .select('order_id, quantity')
        .in('order_id', ids)
    : { data: [] };

  const countMap = new Map<string, number>();
  for (const r of itemRows ?? []) {
    countMap.set(r.order_id, (countMap.get(r.order_id) ?? 0) + r.quantity);
  }

  return {
    orders: (data ?? []).map((o) => ({
      id: o.id,
      orderNumber: o.order_number,
      email: o.email,
      status: o.status as OrderStatus,
      totalCents: o.total_cents,
      createdAt: o.created_at,
      paidAt: o.paid_at,
      shippedAt: o.shipped_at,
      itemCount: countMap.get(o.id) ?? 0,
    })),
    total: count ?? 0,
  };
}

export async function getAdminOrderDetail(id: string): Promise<AdminOrderDetail | null> {
  const { data: o } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (!o) return null;

  const { data: items } = await supabaseAdmin
    .from('order_items')
    .select('*')
    .eq('order_id', id);

  return {
    id: o.id,
    orderNumber: o.order_number,
    email: o.email,
    status: o.status as OrderStatus,
    totalCents: o.total_cents,
    subtotalCents: o.subtotal_cents,
    taxCents: o.tax_cents ?? 0,
    shippingCents: o.shipping_cents ?? 0,
    createdAt: o.created_at,
    paidAt: o.paid_at,
    shippedAt: o.shipped_at,
    notes: o.notes,
    shippingAddress: o.shipping_address as Record<string, string> | null,
    squarePaymentId: o.square_payment_id,
    itemCount: (items ?? []).reduce((a, i) => a + i.quantity, 0),
    items: (items ?? []).map((i) => ({
      id: i.id,
      productName: i.product_name,
      variantName: i.variant_name,
      sku: i.sku,
      unitPriceCents: i.unit_price_cents,
      quantity: i.quantity,
      lineTotalCents: i.line_total_cents,
    })),
  };
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  await supabaseAdmin
    .from('orders')
    .update({
      status,
      ...(status === 'shipped' ? { shipped_at: new Date().toISOString() } : {}),
    })
    .eq('id', id);
}

// ─── Admin products ───────────────────────────────────────────────────────────

export interface AdminProduct {
  id: string;
  slug: string;
  name: string;
  status: string;
  priceCents: number;
  stockQty: number;
  sku: string;
  variantId: string;
  createdAt: string;
}

export async function getAdminProducts(opts: {
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ products: AdminProduct[]; total: number }> {
  const page = opts.page ?? 1;
  const pageSize = opts.pageSize ?? 20;

  let q = supabaseAdmin
    .from('products')
    .select(
      'id, slug, name, status, created_at',
      { count: 'exact' }
    );

  if (opts.status && opts.status !== 'all') q = q.eq('status', opts.status as 'draft' | 'active' | 'archived');
  if (opts.search) q = q.ilike('name', `%${opts.search}%`);

  q = q
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  const { data, count } = await q;

  // Fetch first variant per product
  const productIds = (data ?? []).map((p) => p.id);
  const { data: variantRows } = productIds.length
    ? await supabaseAdmin
        .from('product_variants')
        .select('id, product_id, sku, price_cents, stock_qty')
        .in('product_id', productIds)
        .eq('is_default', true)
    : { data: [] };

  const variantMap = new Map(
    (variantRows ?? []).map((v) => [v.product_id, v])
  );

  return {
    products: (data ?? []).map((p) => {
      const variant = variantMap.get(p.id);
      return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        status: p.status,
        priceCents: variant?.price_cents ?? 0,
        stockQty: variant?.stock_qty ?? 0,
        sku: variant?.sku ?? '',
        variantId: variant?.id ?? '',
        createdAt: p.created_at,
      };
    }),
    total: count ?? 0,
  };
}

// ─── Inventory ────────────────────────────────────────────────────────────────

export interface InventoryRow {
  variantId: string;
  productId: string;
  productName: string;
  sku: string;
  stockQty: number;
  lowStockThreshold: number;
  isLow: boolean;
}

export async function getInventory(lowOnly = false): Promise<InventoryRow[]> {
  // Get active product IDs first
  const { data: activeProducts } = await supabaseAdmin
    .from('products')
    .select('id, name')
    .eq('status', 'active');

  const productMap = new Map((activeProducts ?? []).map((p) => [p.id, p.name]));
  const productIds = [...productMap.keys()];

  if (productIds.length === 0) return [];

  const { data } = await supabaseAdmin
    .from('product_variants')
    .select('id, product_id, sku, stock_qty, low_stock_threshold')
    .in('product_id', productIds)
    .order('stock_qty', { ascending: true });

  const rows = (data ?? []).map((v) => {
    const threshold = v.low_stock_threshold ?? 5;
    return {
      variantId: v.id,
      productId: v.product_id,
      productName: productMap.get(v.product_id) ?? '—',
      sku: v.sku,
      stockQty: v.stock_qty,
      lowStockThreshold: threshold,
      isLow: v.stock_qty <= threshold,
    };
  });

  return lowOnly ? rows.filter((r) => r.isLow) : rows;
}

export async function adjustStock(variantId: string, newQty: number, adminId: string) {
  // Get current qty for delta calculation
  const { data: current } = await supabaseAdmin
    .from('product_variants')
    .select('stock_qty')
    .eq('id', variantId)
    .single();

  const delta = newQty - (current?.stock_qty ?? 0);

  await supabaseAdmin
    .from('product_variants')
    .update({ stock_qty: newQty })
    .eq('id', variantId);

  await supabaseAdmin.from('inventory_movements').insert({
    variant_id: variantId,
    delta,
    reason: 'manual_adjustment',
    created_by: adminId,
  });
}

export async function getLowStockCount(): Promise<number> {
  const { count } = await supabaseAdmin
    .from('product_variants')
    .select('id', { count: 'exact', head: true })
    .lte('stock_qty', 5);

  return count ?? 0;
}

// ─── Customers ────────────────────────────────────────────────────────────────

export type CustomerSortField =
  | 'full_name'
  | 'email'
  | 'created_at'
  | 'last_order_at'
  | 'order_count'
  | 'total_spent';

export interface AdminCustomer {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  createdAt: string;
  orderCount: number;
  totalSpentCents: number;
  lastOrderAt: string | null;
  lastOrderStatus: string | null;
}

export async function getAdminCustomers(opts: {
  search?: string;
  sort?: CustomerSortField;
  dir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}): Promise<{ customers: AdminCustomer[]; total: number }> {
  const page = opts.page ?? 1;
  const pageSize = opts.pageSize ?? 25;
  const sort = opts.sort ?? 'created_at';
  const dir = opts.dir ?? 'desc';

  // Base customer query
  let q = supabaseAdmin
    .from('customers')
    .select('id, email, full_name, phone, created_at', { count: 'exact' });

  if (opts.search) {
    q = q.or(
      `email.ilike.%${opts.search}%,full_name.ilike.%${opts.search}%,phone.ilike.%${opts.search}%`
    );
  }

  // Sort by customer fields directly; order-derived fields sorted client-side
  const directSortFields: CustomerSortField[] = ['full_name', 'email', 'created_at'];
  if (directSortFields.includes(sort)) {
    q = q.order(sort, { ascending: dir === 'asc' });
  } else {
    q = q.order('created_at', { ascending: false });
  }

  // Fetch all for derived sort, or paginate for direct sort
  const isDerivedSort = !directSortFields.includes(sort);
  if (!isDerivedSort) {
    q = q.range((page - 1) * pageSize, page * pageSize - 1);
  }

  const { data: customers, count } = await q;
  if (!customers || customers.length === 0) return { customers: [], total: 0 };

  // Fetch aggregated order stats for these customers
  const ids = customers.map((c) => c.id);
  const { data: orders } = await supabaseAdmin
    .from('orders')
    .select('customer_id, total_cents, status, created_at')
    .in('customer_id', ids)
    .in('status', ['paid', 'shipped', 'delivered']);

  // Build stats map
  const statsMap = new Map<
    string,
    { count: number; totalCents: number; lastAt: string | null; lastStatus: string | null }
  >();

  for (const o of orders ?? []) {
    if (!o.customer_id) continue;
    const s = statsMap.get(o.customer_id) ?? {
      count: 0,
      totalCents: 0,
      lastAt: null,
      lastStatus: null,
    };
    s.count++;
    s.totalCents += o.total_cents;
    if (!s.lastAt || o.created_at > s.lastAt) {
      s.lastAt = o.created_at;
      s.lastStatus = o.status;
    }
    statsMap.set(o.customer_id, s);
  }

  let result: AdminCustomer[] = customers.map((c) => {
    const stats = statsMap.get(c.id);
    return {
      id: c.id,
      email: c.email,
      fullName: c.full_name,
      phone: c.phone,
      createdAt: c.created_at,
      orderCount: stats?.count ?? 0,
      totalSpentCents: stats?.totalCents ?? 0,
      lastOrderAt: stats?.lastAt ?? null,
      lastOrderStatus: stats?.lastStatus ?? null,
    };
  });

  // Client-side sort for derived fields
  if (isDerivedSort) {
    result.sort((a, b) => {
      let va: number | string | null;
      let vb: number | string | null;
      if (sort === 'order_count') { va = a.orderCount; vb = b.orderCount; }
      else if (sort === 'total_spent') { va = a.totalSpentCents; vb = b.totalSpentCents; }
      else { va = a.lastOrderAt; vb = b.lastOrderAt; }

      if (va === null && vb === null) return 0;
      if (va === null) return 1;
      if (vb === null) return -1;
      const cmp = va < vb ? -1 : va > vb ? 1 : 0;
      return dir === 'asc' ? cmp : -cmp;
    });

    const totalDerived = result.length;
    result = result.slice((page - 1) * pageSize, page * pageSize);
    return { customers: result, total: totalDerived };
  }

  return { customers: result, total: count ?? 0 };
}

// ─── Inventory movements ──────────────────────────────────────────────────────

export interface InventoryMovement {
  id: string;
  delta: number;
  reason: string;
  notes: string | null;
  createdAt: string;
  adminEmail: string | null;
  newQty: number | null; // variant stock_qty at time of record (not stored — approximate from variant)
}

export async function getInventoryMovements(
  variantId: string,
  page = 1,
  pageSize = 30
): Promise<{ movements: InventoryMovement[]; total: number; variantName: string; sku: string; currentStock: number }> {
  const from = (page - 1) * pageSize;

  const [movRes, varRes] = await Promise.all([
    supabaseAdmin
      .from('inventory_movements')
      .select('id, delta, reason, notes, created_at, created_by', { count: 'exact' })
      .eq('variant_id', variantId)
      .order('created_at', { ascending: false })
      .range(from, from + pageSize - 1),

    supabaseAdmin
      .from('product_variants')
      .select('sku, name, stock_qty')
      .eq('id', variantId)
      .single(),
  ]);

  const rawMovements = movRes.data ?? [];
  const total = movRes.count ?? 0;

  // Fetch admin emails for created_by ids
  const adminIds = [...new Set(rawMovements.map((m) => m.created_by).filter(Boolean))] as string[];
  let adminMap = new Map<string, string>();
  if (adminIds.length > 0) {
    const { data: admins } = await supabaseAdmin
      .from('admin_users')
      .select('id, email')
      .in('id', adminIds);
    adminMap = new Map((admins ?? []).map((a) => [a.id, a.email]));
  }

  const movements: InventoryMovement[] = rawMovements.map((m) => ({
    id: m.id,
    delta: m.delta,
    reason: m.reason,
    notes: m.notes,
    createdAt: m.created_at,
    adminEmail: m.created_by ? (adminMap.get(m.created_by) ?? null) : null,
    newQty: null,
  }));

  return {
    movements,
    total,
    variantName: varRes.data?.name ?? '',
    sku: varRes.data?.sku ?? '',
    currentStock: varRes.data?.stock_qty ?? 0,
  };
}

