'use server';

import { revalidatePath } from 'next/cache';

import { hasValidPanelSession } from '../../../src/lib/panel/session';
import {
  listPanelProducts,
  setInventoryQuantities,
  updateProductStatus,
  updateVariantPricing,
  type PanelProduct,
} from '../../../src/lib/panel/products';
import { AdminUserErrorsError } from '../../../src/lib/shopify-admin/client';

export type PanelActionResult = { ok: boolean; error?: string };

function errorMessage(error: unknown): string {
  if (error instanceof AdminUserErrorsError) {
    return error.userErrors.map((entry) => entry.message).join(' ');
  }
  return 'The update failed. Please try again.';
}

async function guard(): Promise<boolean> {
  return hasValidPanelSession();
}

const MONEY_PATTERN = /^\d+(\.\d{1,2})?$/;
const PRODUCT_GID = /^gid:\/\/shopify\/Product\/\d+$/;
const VARIANT_GID = /^gid:\/\/shopify\/ProductVariant\/\d+$/;
const INVENTORY_GID = /^gid:\/\/shopify\/InventoryItem\/\d+$/;

export async function saveProductAction(input: {
  productId: string;
  status: PanelProduct['status'];
  variants: Array<{
    id: string;
    inventoryItemId: string;
    price: string;
    compareAtPrice: string;
    quantity: number;
    pricingChanged: boolean;
    quantityChanged: boolean;
  }>;
  statusChanged: boolean;
}): Promise<PanelActionResult> {
  if (!(await guard())) return { ok: false, error: 'Session expired. Sign in again.' };

  if (!PRODUCT_GID.test(input.productId)) return { ok: false, error: 'Invalid product.' };
  if (!['ACTIVE', 'DRAFT', 'ARCHIVED'].includes(input.status)) {
    return { ok: false, error: 'Invalid status.' };
  }

  const pricing = input.variants.filter((variant) => variant.pricingChanged);
  const stock = input.variants.filter((variant) => variant.quantityChanged);

  for (const variant of pricing) {
    if (
      !VARIANT_GID.test(variant.id) ||
      !MONEY_PATTERN.test(variant.price) ||
      (variant.compareAtPrice !== '' && !MONEY_PATTERN.test(variant.compareAtPrice))
    ) {
      return { ok: false, error: 'Invalid price value.' };
    }
  }
  for (const variant of stock) {
    if (
      !INVENTORY_GID.test(variant.inventoryItemId) ||
      !Number.isInteger(variant.quantity) ||
      variant.quantity < 0 ||
      variant.quantity > 100000
    ) {
      return { ok: false, error: 'Invalid quantity value.' };
    }
  }

  try {
    if (input.statusChanged) {
      await updateProductStatus(input.productId, input.status);
    }
    if (pricing.length > 0) {
      await updateVariantPricing(
        input.productId,
        pricing.map((variant) => ({
          id: variant.id,
          price: variant.price,
          compareAtPrice:
            variant.compareAtPrice === '' ? null : variant.compareAtPrice,
        }))
      );
    }
    if (stock.length > 0) {
      await setInventoryQuantities(
        stock.map((variant) => ({
          inventoryItemId: variant.inventoryItemId,
          quantity: variant.quantity,
        }))
      );
    }

    revalidatePath('/admin/products');
    return { ok: true };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export type ImportRow = {
  variantId: string;
  price?: string;
  compareAtPrice?: string;
  quantity?: number;
};

export type ImportPreviewRow = {
  variantId: string;
  label: string;
  changes: string[];
  valid: boolean;
  error?: string;
};

export async function previewImportAction(
  rows: ImportRow[]
): Promise<{ ok: boolean; error?: string; preview?: ImportPreviewRow[] }> {
  if (!(await guard())) return { ok: false, error: 'Session expired. Sign in again.' };
  if (rows.length === 0 || rows.length > 500) {
    return { ok: false, error: 'The file must contain between 1 and 500 rows.' };
  }

  const products = await listPanelProducts();
  const byVariant = new Map(
    products.flatMap((product) =>
      product.variants.map((variant) => [
        variant.id,
        { product, variant },
      ] as const)
    )
  );

  const preview = rows.map((row): ImportPreviewRow => {
    const match = byVariant.get(row.variantId);
    if (!match) {
      return {
        variantId: row.variantId,
        label: row.variantId,
        changes: [],
        valid: false,
        error: 'Variant not found in the store.',
      };
    }

    const { product, variant } = match;
    const label =
      variant.title === 'Default Title'
        ? product.title
        : `${product.title} — ${variant.title}`;
    const changes: string[] = [];

    if (row.price !== undefined && row.price !== variant.price) {
      if (!MONEY_PATTERN.test(row.price)) {
        return { variantId: row.variantId, label, changes, valid: false, error: 'Invalid price.' };
      }
      changes.push(`price ${variant.price} → ${row.price}`);
    }
    const currentCompare = variant.compareAtPrice ?? '';
    if (row.compareAtPrice !== undefined && row.compareAtPrice !== currentCompare) {
      if (row.compareAtPrice !== '' && !MONEY_PATTERN.test(row.compareAtPrice)) {
        return { variantId: row.variantId, label, changes, valid: false, error: 'Invalid compare-at price.' };
      }
      changes.push(
        `compare-at ${currentCompare || '—'} → ${row.compareAtPrice || '—'}`
      );
    }
    if (row.quantity !== undefined && row.quantity !== variant.inventoryQuantity) {
      if (!Number.isInteger(row.quantity) || row.quantity < 0 || row.quantity > 100000) {
        return { variantId: row.variantId, label, changes, valid: false, error: 'Invalid quantity.' };
      }
      changes.push(`stock ${variant.inventoryQuantity} → ${row.quantity}`);
    }

    return { variantId: row.variantId, label, changes, valid: true };
  });

  return { ok: true, preview };
}

export async function applyImportAction(
  rows: ImportRow[]
): Promise<{ ok: boolean; error?: string; applied?: number }> {
  if (!(await guard())) return { ok: false, error: 'Session expired. Sign in again.' };

  const validation = await previewImportAction(rows);
  if (!validation.ok || !validation.preview) {
    return { ok: false, error: validation.error };
  }
  if (validation.preview.some((row) => !row.valid)) {
    return { ok: false, error: 'Fix the invalid rows before applying.' };
  }

  const products = await listPanelProducts();
  const byVariant = new Map(
    products.flatMap((product) =>
      product.variants.map((variant) => [
        variant.id,
        { product, variant },
      ] as const)
    )
  );

  const pricingByProduct = new Map<
    string,
    Array<{ id: string; price: string; compareAtPrice: string | null }>
  >();
  const stockUpdates: Array<{ inventoryItemId: string; quantity: number }> = [];
  let applied = 0;

  for (const row of rows) {
    const match = byVariant.get(row.variantId);
    if (!match) continue;
    const { product, variant } = match;

    const priceChanged = row.price !== undefined && row.price !== variant.price;
    const compareChanged =
      row.compareAtPrice !== undefined &&
      row.compareAtPrice !== (variant.compareAtPrice ?? '');
    if (priceChanged || compareChanged) {
      const list = pricingByProduct.get(product.id) ?? [];
      list.push({
        id: variant.id,
        price: row.price ?? variant.price,
        compareAtPrice:
          row.compareAtPrice === undefined
            ? variant.compareAtPrice
            : row.compareAtPrice === ''
              ? null
              : row.compareAtPrice,
      });
      pricingByProduct.set(product.id, list);
      applied += 1;
    }
    if (row.quantity !== undefined && row.quantity !== variant.inventoryQuantity) {
      stockUpdates.push({
        inventoryItemId: variant.inventoryItemId,
        quantity: row.quantity,
      });
      applied += 1;
    }
  }

  try {
    for (const [productId, variants] of pricingByProduct) {
      await updateVariantPricing(productId, variants);
    }
    if (stockUpdates.length > 0) {
      await setInventoryQuantities(stockUpdates);
    }
    revalidatePath('/admin/products');
    return { ok: true, applied };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}
