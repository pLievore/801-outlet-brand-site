import { getInventory } from '../../../src/lib/admin';
import { StockCell } from './stock-cell';

export const revalidate = 30;

interface Props {
  searchParams: Promise<{ filter?: string }>;
}

export default async function InventoryPage({ searchParams }: Props) {
  const sp = await searchParams;
  const lowOnly = sp.filter === 'low';

  const rows = await getInventory(lowOnly);

  return (
    <div className="px-6 py-8 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Inventory</h1>
        <div className="flex gap-1 rounded-xl bg-white/5 p-1">
          <a
            href="/admin/inventory"
            className={
              'rounded-lg px-3 py-1.5 text-xs font-medium transition ' +
              (!lowOnly ? 'bg-white/10 text-white' : 'text-neutral-400 hover:text-white')
            }
          >
            All
          </a>
          <a
            href="/admin/inventory?filter=low"
            className={
              'rounded-lg px-3 py-1.5 text-xs font-medium transition ' +
              (lowOnly ? 'bg-white/10 text-white' : 'text-neutral-400 hover:text-white')
            }
          >
            Low stock
          </a>
        </div>
      </div>

      {lowOnly && rows.length === 0 && (
        <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-6 text-sm text-green-300">
          All products are well-stocked.
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left">
              <th className="px-4 py-3 text-xs font-medium text-neutral-400">Product</th>
              <th className="px-4 py-3 text-xs font-medium text-neutral-400">SKU</th>
              <th className="px-4 py-3 text-xs font-medium text-neutral-400 text-center">Stock</th>
              <th className="px-4 py-3 text-xs font-medium text-neutral-400 text-center">Threshold</th>
              <th className="px-4 py-3 text-xs font-medium text-neutral-400">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((row) => (
              <tr key={row.variantId} className="hover:bg-white/[0.03] transition">
                <td className="px-4 py-3">
                  <a
                    href={`/admin/products/${row.productId}`}
                    className="font-medium text-white hover:text-orange-300 transition"
                  >
                    {row.productName}
                  </a>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-neutral-400">{row.sku}</td>
                <td className="px-4 py-3 text-center">
                  <StockCell
                    variantId={row.variantId}
                    initialQty={row.stockQty}
                    threshold={row.lowStockThreshold}
                  />
                </td>
                <td className="px-4 py-3 text-center text-neutral-400 text-sm">{row.lowStockThreshold}</td>
                <td className="px-4 py-3">
                  {row.isLow ? (
                    <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[11px] font-medium text-red-400">
                      Low stock
                    </span>
                  ) : (
                    <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-[11px] font-medium text-green-400">
                      OK
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <a
                    href={`/admin/inventory/${row.variantId}`}
                    className="text-xs text-neutral-400 hover:text-white transition"
                  >
                    History →
                  </a>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-neutral-500">
                  No inventory data.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-neutral-500">
        Click the stock number to edit inline. Changes are logged to inventory movements.
      </p>
    </div>
  );
}
