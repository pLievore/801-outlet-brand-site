import type { Metadata } from 'next';

import { PageHeader } from '../../_components/ui';
import { ImportManager } from './import-manager';

export const metadata: Metadata = { title: 'Import products — 801 Outlet Panel' };

export default function ImportPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CATALOG"
        title="Import"
        titleAccent="spreadsheet"
        subtitle="Upload a CSV exported from this panel (columns variant_id, price, compare_at_price, quantity — extra columns are ignored). Nothing is applied until you review and confirm the changes."
        back={{ href: '/admin/products', label: 'Back to products' }}
      />
      <ImportManager />
    </div>
  );
}
