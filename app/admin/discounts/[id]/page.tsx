import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getAdminDiscountById } from '../../../../src/lib/shopify-admin/discounts';
import { PageHeader } from '../../_components/ui';
import { EditDiscountForm } from './edit-discount-form';

export const metadata: Metadata = { title: 'Edit coupon — 801 Outlet Panel' };
export const dynamic = 'force-dynamic';

export default async function EditDiscountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getAdminDiscountById(id);

  if (!result.discount) {
    notFound();
  }

  const discount = result.discount;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="OPERATION"
        title="Edit"
        titleAccent={discount.code}
        subtitle="Update promotional details, redemption limits, or expiration schedule."
        back={{ href: '/admin/discounts', label: 'Back to coupons' }}
      />
      <EditDiscountForm discount={discount} />
    </div>
  );
}
