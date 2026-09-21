'use server';

import { revalidatePath } from 'next/cache';

import {
  normalizeCategory,
  unknownCategoryMessage,
} from '../../../../src/lib/catalog/categories';
import { hasValidPanelSession } from '../../../../src/lib/panel/session';
import {
  appendProductMedia,
  deleteProductMedia,
  reorderProductMedia,
  textToDescriptionHtml,
  updatePanelProductDetails,
  updateVariantInventoryPolicy,
} from '../../../../src/lib/panel/products';
import { AdminUserErrorsError, ShopifyAdminError } from '../../../../src/lib/shopify-admin/client';

const PRODUCT_GID = /^gid:\/\/shopify\/Product\/\d+$/;
const VARIANT_GID = /^gid:\/\/shopify\/ProductVariant\/\d+$/;
const MEDIA_GID = /^gid:\/\/shopify\/MediaImage\/\d+$/;
// Staged upload resource URLs always live on Shopify's storage.
const RESOURCE_URL_PATTERN =
  /^https:\/\/[a-z0-9.-]+\.(googleapis|shopifycloud)\.com\//;

type ActionResult = { ok: boolean; error?: string };

function errorMessage(error: unknown): string {
  if (error instanceof AdminUserErrorsError) {
    return error.userErrors.map((entry) => entry.message).join(' ');
  }
  // A missing Shopify scope is actionable — say so instead of "try again",
  // which invites retrying something that can never succeed.
  if (error instanceof ShopifyAdminError && error.message) {
    return error.message;
  }
  return 'The update failed. Please try again.';
}

function revalidateProduct(productId: string) {
  revalidatePath('/admin/products');
  revalidatePath(`/admin/products/${productId.split('/').pop()}`);
}

/**
 * Tags are free text typed by hand, so they are trimmed, de-duplicated
 * case-insensitively and capped. Shopify itself allows 250 per product.
 */
function normalizeTags(input: string[] | undefined): string[] | undefined {
  if (!input) return undefined;

  const seen = new Map<string, string>();
  for (const raw of input) {
    if (typeof raw !== 'string') continue;
    const tag = raw.trim().replace(/,/g, ' ').replace(/\s+/g, ' ').slice(0, 60);
    if (!tag) continue;
    const key = tag.toLowerCase();
    if (!seen.has(key)) seen.set(key, tag);
    if (seen.size >= 60) break;
  }

  return [...seen.values()];
}

export async function saveDetailsAction(input: {
  productId: string;
  title: string;
  description: string;
  tags?: string[];
  /** One of `PRODUCT_CATEGORIES`, or an empty string to clear it. */
  category?: string;
  /**
   * Ticking dropshipping also has to put every variant on `CONTINUE`, or
   * Shopify refuses the cart line the moment stock runs out and the piece the
   * operator meant to keep selling quietly stops selling.
   */
  dropship?: boolean;
  variantIds?: string[];
}): Promise<ActionResult> {
  if (!(await hasValidPanelSession())) {
    return { ok: false, error: 'Session expired. Sign in again.' };
  }
  if (!PRODUCT_GID.test(input.productId)) {
    return { ok: false, error: 'Invalid product.' };
  }
  const title = input.title.trim();
  if (title.length < 2 || title.length > 255) {
    return { ok: false, error: 'Enter a product title.' };
  }

  let productType: string | undefined;
  if (input.category !== undefined) {
    const typed = input.category.trim();
    if (typed === '') {
      productType = '';
    } else {
      const category = normalizeCategory(typed);
      if (!category) return { ok: false, error: unknownCategoryMessage(typed) };
      productType = category;
    }
  }

  try {
    const tags = normalizeTags(input.tags);
    await updatePanelProductDetails({
      productId: input.productId,
      title,
      descriptionHtml: textToDescriptionHtml(input.description),
      ...(tags ? { tags } : {}),
      ...(productType !== undefined ? { productType } : {}),
    });

    if (input.dropship !== undefined) {
      const variantIds = (input.variantIds ?? []).filter((id) =>
        VARIANT_GID.test(id)
      );
      if (variantIds.length > 0) {
        await updateVariantInventoryPolicy(
          input.productId,
          variantIds.map((id) => ({
            id,
            inventoryPolicy: input.dropship ? 'CONTINUE' : 'DENY',
          }))
        );
      }
    }

    revalidateProduct(input.productId);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function addMediaAction(input: {
  productId: string;
  resourceUrls: string[];
}): Promise<ActionResult> {
  if (!(await hasValidPanelSession())) {
    return { ok: false, error: 'Session expired. Sign in again.' };
  }
  if (!PRODUCT_GID.test(input.productId)) {
    return { ok: false, error: 'Invalid product.' };
  }
  if (input.resourceUrls.length === 0 || input.resourceUrls.length > 12) {
    return { ok: false, error: 'Add between 1 and 12 photos at a time.' };
  }
  if (input.resourceUrls.some((url) => !RESOURCE_URL_PATTERN.test(url))) {
    return { ok: false, error: 'Invalid image reference.' };
  }

  try {
    await appendProductMedia(input.productId, input.resourceUrls);
    revalidateProduct(input.productId);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function removeMediaAction(input: {
  productId: string;
  mediaId: string;
}): Promise<ActionResult> {
  if (!(await hasValidPanelSession())) {
    return { ok: false, error: 'Session expired. Sign in again.' };
  }
  if (!PRODUCT_GID.test(input.productId) || !MEDIA_GID.test(input.mediaId)) {
    return { ok: false, error: 'Invalid photo reference.' };
  }

  try {
    await deleteProductMedia([input.mediaId]);
    revalidateProduct(input.productId);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function reorderMediaAction(input: {
  productId: string;
  orderedMediaIds: string[];
}): Promise<ActionResult> {
  if (!(await hasValidPanelSession())) {
    return { ok: false, error: 'Session expired. Sign in again.' };
  }
  if (!PRODUCT_GID.test(input.productId)) {
    return { ok: false, error: 'Invalid product.' };
  }
  if (
    input.orderedMediaIds.length === 0 ||
    input.orderedMediaIds.length > 24 ||
    input.orderedMediaIds.some((id) => !MEDIA_GID.test(id))
  ) {
    return { ok: false, error: 'Invalid photo order.' };
  }

  try {
    await reorderProductMedia(input.productId, input.orderedMediaIds);
    revalidateProduct(input.productId);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}
