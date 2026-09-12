import type { Metadata } from 'next';

import { PageHeader } from '../../_components/ui';
import { NewDiscountForm } from './new-discount-form';

export const metadata: Metadata = { title: 'Create coupon — 801 Outlet Panel' };

export default function NewDiscountPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="OPERATION"
        title="Create"
        titleAccent="coupon"
        subtitle="Generate promotional discount codes synced in real-time with Shopify."
        back={{ href: '/admin/discounts', label: 'Back to coupons' }}
      />
      <NewDiscountForm />
    </div>
  );
}
