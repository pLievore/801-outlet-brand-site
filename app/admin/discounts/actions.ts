'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { hasValidPanelSession } from '../../../src/lib/panel/session';
import {
  createAdminDiscount,
  deleteAdminDiscount,
  updateAdminDiscount,
  type DiscountInput,
} from '../../../src/lib/shopify-admin/discounts';

type ActionResult = { ok: boolean; error?: string; id?: string };

export async function createDiscountAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const authed = await hasValidPanelSession();
  if (!authed) {
    return { ok: false, error: 'Unauthorized session.' };
  }

  const code = (formData.get('code') as string)?.trim().toUpperCase();
  const title = (formData.get('title') as string)?.trim();
  const discountType = formData.get('discountType') as 'percentage' | 'fixed_amount';
  const rawValue = Number(formData.get('value'));
  const endsAtRaw = formData.get('endsAt') as string;
  const usageLimitRaw = formData.get('usageLimit') as string;
  const appliesOncePerCustomer = formData.get('appliesOncePerCustomer') === 'on';

  if (!code) {
    return { ok: false, error: 'Coupon code is required.' };
  }
  if (!title) {
    return { ok: false, error: 'Discount title is required.' };
  }
  if (!discountType || (discountType !== 'percentage' && discountType !== 'fixed_amount')) {
    return { ok: false, error: 'Invalid discount type.' };
  }
  if (!Number.isFinite(rawValue) || rawValue <= 0) {
    return { ok: false, error: 'Discount value must be greater than zero.' };
  }
  if (discountType === 'percentage' && rawValue > 100) {
    return { ok: false, error: 'Percentage discount cannot exceed 100%.' };
  }

  const endsAt = endsAtRaw?.trim() ? new Date(endsAtRaw.trim()).toISOString() : null;
  const usageLimit = usageLimitRaw?.trim() ? Math.max(1, parseInt(usageLimitRaw.trim(), 10)) : null;

  const payload: DiscountInput = {
    code,
    title,
    discountType,
    value: rawValue,
    endsAt,
    usageLimit,
    appliesOncePerCustomer,
  };

  const res = await createAdminDiscount(payload);
  if (res.error || !res.id) {
    return { ok: false, error: res.error ?? 'Failed to create coupon in Shopify.' };
  }

  revalidatePath('/admin/discounts');
  redirect('/admin/discounts');
}

export async function updateDiscountAction(
  id: string,
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const authed = await hasValidPanelSession();
  if (!authed) {
    return { ok: false, error: 'Unauthorized session.' };
  }

  const title = (formData.get('title') as string)?.trim();
  const endsAtRaw = formData.get('endsAt') as string;
  const usageLimitRaw = formData.get('usageLimit') as string;
  const appliesOncePerCustomer = formData.get('appliesOncePerCustomer') === 'on';

  if (!title) {
    return { ok: false, error: 'Discount title is required.' };
  }

  const endsAt = endsAtRaw?.trim() ? new Date(endsAtRaw.trim()).toISOString() : null;
  const usageLimit = usageLimitRaw?.trim() ? Math.max(1, parseInt(usageLimitRaw.trim(), 10)) : null;

  const res = await updateAdminDiscount(id, {
    title,
    endsAt,
    usageLimit,
    appliesOncePerCustomer,
  });

  if (res.error) {
    return { ok: false, error: res.error };
  }

  revalidatePath('/admin/discounts');
  redirect('/admin/discounts');
}

export async function deleteDiscountAction(id: string): Promise<ActionResult> {
  const authed = await hasValidPanelSession();
  if (!authed) {
    return { ok: false, error: 'Unauthorized session.' };
  }

  const res = await deleteAdminDiscount(id);
  if (res.error) {
    return { ok: false, error: res.error };
  }

  revalidatePath('/admin/discounts');
  return { ok: true };
}
