import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '../../../../../src/lib/admin';
import { supabaseAdmin } from '../../../../../src/lib/supabase/admin';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const sp = req.nextUrl.searchParams;
  const status = sp.get('status') ?? '';
  const search = sp.get('search') ?? '';
  const from = sp.get('from') ?? ''; // YYYY-MM-DD
  const to = sp.get('to') ?? '';

  let query = supabaseAdmin
    .from('orders')
    .select(
      'order_number, created_at, status, email, subtotal_cents, shipping_cents, tax_cents, total_cents, paid_at, shipped_at, shipping_address, notes'
    )
    .order('created_at', { ascending: false })
    .limit(10000);

  if (status && status !== 'all') query = query.eq('status', status as 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded');
  if (search) query = query.or(`email.ilike.%${search}%,order_number.eq.${Number(search) || 0}`);
  if (from) query = query.gte('created_at', from);
  if (to) query = query.lte('created_at', to + 'T23:59:59Z');

  const { data, error } = await query;
  if (error) return new NextResponse('DB error', { status: 500 });

  const rows = data ?? [];

  function esc(val: unknown): string {
    if (val === null || val === undefined) return '';
    const s = String(val);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  }

  function cents(v: unknown) {
    const n = Number(v);
    return isNaN(n) ? '' : (n / 100).toFixed(2);
  }

  function addr(v: unknown) {
    if (!v || typeof v !== 'object') return '';
    const a = v as Record<string, string>;
    return [a.line1, a.line2, a.city, a.state, a.postal_code, a.country]
      .filter(Boolean)
      .join(', ');
  }

  const headers = [
    'Order #',
    'Date',
    'Status',
    'Email',
    'Subtotal',
    'Shipping',
    'Tax',
    'Total',
    'Paid at',
    'Shipped at',
    'Shipping address',
    'Notes',
  ];

  const csvRows = [
    headers.join(','),
    ...rows.map((r) =>
      [
        esc(r.order_number),
        esc(r.created_at ? new Date(r.created_at).toISOString().slice(0, 19).replace('T', ' ') : ''),
        esc(r.status),
        esc(r.email),
        esc(cents(r.subtotal_cents)),
        esc(cents(r.shipping_cents)),
        esc(cents(r.tax_cents)),
        esc(cents(r.total_cents)),
        esc(r.paid_at ? new Date(r.paid_at).toISOString().slice(0, 19).replace('T', ' ') : ''),
        esc(r.shipped_at ? new Date(r.shipped_at).toISOString().slice(0, 19).replace('T', ' ') : ''),
        esc(addr(r.shipping_address)),
        esc(r.notes),
      ].join(',')
    ),
  ].join('\r\n');

  const dateStr = new Date().toISOString().slice(0, 10);
  return new NextResponse(csvRows, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="orders-${dateStr}.csv"`,
    },
  });
}
