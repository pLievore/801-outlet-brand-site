import { hasValidPanelSession } from '../../../../src/lib/panel/session';
import { listPanelProducts } from '../../../../src/lib/panel/products';

function csvCell(value: string | number | null): string {
  const text = value === null ? '' : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export async function GET() {
  if (!(await hasValidPanelSession())) {
    return new Response('Unauthorized', { status: 401 });
  }

  const products = await listPanelProducts();
  const header = [
    'variant_id',
    'product_title',
    'variant_title',
    'sku',
    'status',
    'price',
    'compare_at_price',
    'quantity',
  ];
  const rows = products.flatMap((product) =>
    product.variants.map((variant) =>
      [
        variant.id,
        product.title,
        variant.title,
        variant.sku ?? '',
        product.status,
        variant.price,
        variant.compareAtPrice ?? '',
        variant.inventoryQuantity,
      ]
        .map(csvCell)
        .join(',')
    )
  );

  const csv = [header.join(','), ...rows].join('\r\n');
  const date = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="801-outlet-products-${date}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
