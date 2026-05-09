import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getInventoryMovements } from '../../../../src/lib/admin';

export const revalidate = 30;

interface Props {
  params: Promise<{ variantId: string }>;
  searchParams: Promise<{ page?: string }>;
}

const REASON_LABELS: Record<string, { label: string; color: string }> = {
  order_paid: { label: 'Order paid', color: 'text-blue-400' },
  order_cancelled: { label: 'Order cancelled', color: 'text-yellow-400' },
  manual_adjustment: { label: 'Manual adjustment', color: 'text-orange-400' },
  restock: { label: 'Restock', color: 'text-green-400' },
};

export default async function VariantMovementsPage({ params, searchParams }: Props) {
  const { variantId } = await params;
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1));
  const pageSize = 30;

  const data = await getInventoryMovements(variantId, page, pageSize);

  if (!data.sku && !data.variantName) notFound();

  const totalPages = Math.max(1, Math.ceil(data.total / pageSize));

  function pageUrl(p: number) {
    return `/admin/inventory/${variantId}${p > 1 ? `?page=${p}` : ''}`;
  }

  return (
    <div className="px-6 py-8 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/inventory" className="text-sm text-neutral-400 hover:text-white transition">
          ← Inventory
        </Link>
      </div>

      <div>
        <h1 className="text-xl font-bold text-white">Movement history</h1>
        <p className="mt-1 text-sm text-neutral-400">
          <span className="font-mono text-neutral-300">{data.sku}</span>
          {data.variantName && <span className="ml-2">· {data.variantName}</span>}
        </p>
      </div>

      {/* Current stock card */}
      <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
        <div className="text-sm text-neutral-400">Current stock</div>
        <div
          className={
            'text-2xl font-bold ' +
            (data.currentStock <= 5
              ? 'text-red-400'
              : data.currentStock <= 15
              ? 'text-yellow-400'
              : 'text-white')
          }
        >
          {data.currentStock}
        </div>
      </div>

      {/* Movements table */}
      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-x-auto">
        <table className="w-full text-sm min-w-[560px]">
          <thead>
            <tr className="border-b border-white/10 text-left">
              <th className="px-4 py-3 text-xs font-medium text-neutral-400">Date</th>
              <th className="px-4 py-3 text-xs font-medium text-neutral-400">Reason</th>
              <th className="px-4 py-3 text-xs font-medium text-neutral-400 text-right">Change</th>
              <th className="px-4 py-3 text-xs font-medium text-neutral-400">Notes</th>
              <th className="px-4 py-3 text-xs font-medium text-neutral-400">By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.movements.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-neutral-500">
                  No movements recorded yet.
                </td>
              </tr>
            ) : (
              data.movements.map((m) => {
                const reason = REASON_LABELS[m.reason] ?? { label: m.reason, color: 'text-neutral-400' };
                return (
                  <tr key={m.id} className="hover:bg-white/[0.03] transition">
                    <td className="px-4 py-3 text-xs text-neutral-400 whitespace-nowrap">
                      {new Date(m.createdAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${reason.color}`}>
                        {reason.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={
                          'text-sm font-bold ' +
                          (m.delta > 0 ? 'text-green-400' : 'text-red-400')
                        }
                      >
                        {m.delta > 0 ? '+' : ''}{m.delta}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-400 max-w-xs truncate">
                      {m.notes ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-500 truncate max-w-[140px]">
                      {m.adminEmail ?? 'system'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-500">{data.total} movements</span>
          <div className="flex gap-2">
            {page > 1 && (
              <a href={pageUrl(page - 1)} className="rounded-xl bg-white/5 px-3 py-1.5 text-neutral-300 hover:bg-white/10 transition">
                ← Prev
              </a>
            )}
            <span className="rounded-xl bg-white/10 px-3 py-1.5 text-white">{page} / {totalPages}</span>
            {page < totalPages && (
              <a href={pageUrl(page + 1)} className="rounded-xl bg-white/5 px-3 py-1.5 text-neutral-300 hover:bg-white/10 transition">
                Next →
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
