import type { Metadata } from 'next';

import { PageHeader } from '../../_components/ui';
import { NewProductForm } from './new-product-form';

export const metadata: Metadata = { title: 'New product — 801 Outlet Panel' };

export default function NewProductPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="CATALOG"
        title="New"
        titleAccent="product"
        subtitle="Created directly in Shopify with tracked inventory."
        back={{ href: '/admin/products', label: 'Back to products' }}
      />
      <NewProductForm />
    </div>
  );
}
