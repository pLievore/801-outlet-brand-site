'use server';

import { revalidatePath } from 'next/cache';

import {
  PRODUCT_ATTRIBUTES,
  toStoredAttributeValue,
} from '../../../src/lib/catalog/attributes';
import {
  normalizeCategory,
  unknownCategoryMessage,
} from '../../../src/lib/catalog/categories';
import {
  DROPSHIP_TAG_VALUE,
  hasDropshipTag,
} from '../../../src/lib/catalog/availability';
import type { ImportRow } from '../../../src/lib/panel/import-csv';
import { hasValidPanelSession } from '../../../src/lib/panel/session';
import {
  createPanelProduct,
  listPanelProducts,
  setInventoryQuantities,
  setProductAttributes,
  textToDescriptionHtml,
  updatePanelProductDetails,
  updateProductStatus,
  updateVariantInventoryPolicy,
  updateVariantPricing,
  type PanelProduct,
  type ProductAttributes,
} from '../../../src/lib/panel/products';
import { AdminUserErrorsError, ShopifyAdminError } from '../../../src/lib/shopify-admin/client';

export type PanelActionResult = { ok: boolean; error?: string };

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

export type { ImportRow };

export type ImportPreviewRow = {
  /** Stable identity for React, and for pairing preview rows with input rows. */
  key: string;
  label: string;
  action: 'update' | 'create' | 'none';
  changes: string[];
  valid: boolean;
  error?: string;
};

type Match = { product: PanelProduct; variant: PanelProduct['variants'][number] };

function buildIndex(products: PanelProduct[]) {
  const byVariant = new Map<string, Match>();
  const bySku = new Map<string, Match>();
  const byTitle = new Map<string, PanelProduct>();

  for (const product of products) {
    byTitle.set(product.title.trim().toLowerCase(), product);
    for (const variant of product.variants) {
      byVariant.set(variant.id, { product, variant });
      const sku = variant.sku?.trim().toLowerCase();
      if (sku) bySku.set(sku, { product, variant });
    }
  }

  return { byVariant, bySku, byTitle };
}

/**
 * Decides what a row refers to. `variant_id` is the strong key and comes from
 * the export; `sku` is the key the spreadsheet can carry on its own. A row with
 * neither — or with an sku the store has never seen — describes a new product.
 */
function resolveRow(
  row: ImportRow,
  index: ReturnType<typeof buildIndex>
): Match | null {
  if (row.variantId) return index.byVariant.get(row.variantId) ?? null;

  const sku = row.sku?.trim().toLowerCase();
  if (sku) return index.bySku.get(sku) ?? null;

  return null;
}

/**
 * Folds each attribute to the shape Shopify will store, before anything is
 * compared or written. A spreadsheet describes a sofa and its ottoman on two
 * lines; `dimensions` is a single-line metafield and would be rejected. Folding
 * here — rather than only at the write — keeps the preview honest: the diff
 * compares the stored form against the stored form, so a cell that only differs
 * by a line break is correctly reported as unchanged.
 */
function normalizeRows(rows: ImportRow[]): ImportRow[] {
  return rows.map((row) => {
    if (!row.attributes) return row;

    const attributes: ProductAttributes = {};
    for (const spec of PRODUCT_ATTRIBUTES) {
      const value = row.attributes[spec.key];
      if (value === undefined) continue;
      attributes[spec.key] = toStoredAttributeValue(spec, value);
    }

    return { ...row, attributes };
  });
}

function attributeChanges(
  current: ProductAttributes,
  incoming: ProductAttributes | undefined
): string[] {
  if (!incoming) return [];
  const changes: string[] = [];

  for (const spec of PRODUCT_ATTRIBUTES) {
    const next = incoming[spec.key];
    if (next === undefined) continue;
    const before = current[spec.key] ?? '';
    if (next === before) continue;
    changes.push(next === '' ? `${spec.key} cleared` : `${spec.key} updated`);
  }

  return changes;
}

/**
 * A product's category and its dropshipping flag belong to the product, while
 * the spreadsheet has one line per variant. Two lines of the same product
 * disagreeing is a mistake in the file, not something to resolve by letting
 * the last line win in silence.
 */
type ProductIntent = {
  category?: string;
  dropship?: boolean;
};

function intentConflict(
  seen: Map<string, ProductIntent>,
  productId: string,
  intent: ProductIntent
): string | null {
  const previous = seen.get(productId);
  if (!previous) {
    seen.set(productId, intent);
    return null;
  }

  if (
    intent.category !== undefined &&
    previous.category !== undefined &&
    intent.category !== previous.category
  ) {
    return 'The file gives this product two different categories.';
  }
  if (
    intent.dropship !== undefined &&
    previous.dropship !== undefined &&
    intent.dropship !== previous.dropship
  ) {
    return 'The file turns dropshipping both on and off for this product.';
  }

  seen.set(productId, { ...previous, ...intent });
  return null;
}

/** The category a row asks for, or the reason it cannot be read. */
function resolveCategory(
  row: ImportRow
): { category?: string; error?: string } {
  if (row.category === undefined) return {};

  const category = normalizeCategory(row.category);
  if (!category) return { error: unknownCategoryMessage(row.category) };
  return { category };
}

/** Whether a variant is currently sold past its stock. */
function sellsWithoutStock(variant: PanelProduct['variants'][number]): boolean {
  return variant.inventoryPolicy === 'CONTINUE';
}

/** The tag list a product should carry once dropshipping is on or off. */
function tagsWithDropship(tags: string[], dropship: boolean): string[] {
  const without = tags.filter((tag) => !hasDropshipTag([tag]));
  return dropship ? [...without, DROPSHIP_TAG_VALUE] : without;
}

/** Rejects a row that cannot become a product, with the reason to show. */
function validateNewRow(
  row: ImportRow,
  title: string,
  index: ReturnType<typeof buildIndex>,
  seenTitles: Set<string>,
  seenSkus: Set<string>
): string | null {
  if (row.variantId) return 'variant_id not found in the store.';
  if (!title) return 'New rows need a product_title.';
  if (!row.price || !MONEY_PATTERN.test(row.price)) {
    return 'New rows need a valid price.';
  }

  const titleKey = title.toLowerCase();
  if (index.byTitle.has(titleKey)) {
    return 'A product with this title already exists. Fill variant_id or sku to update it.';
  }
  if (seenTitles.has(titleKey)) {
    return 'The file repeats this title on more than one new row.';
  }

  const sku = row.sku?.trim().toLowerCase();
  if (sku && seenSkus.has(sku)) {
    return 'The file repeats this sku on more than one new row.';
  }
  if (
    row.quantity !== undefined &&
    (!Number.isInteger(row.quantity) || row.quantity < 0 || row.quantity > 100000)
  ) {
    return 'Invalid quantity.';
  }
  if (
    row.compareAtPrice !== undefined &&
    row.compareAtPrice !== '' &&
    !MONEY_PATTERN.test(row.compareAtPrice)
  ) {
    return 'Invalid compare-at price.';
  }

  return null;
}

export async function previewImportAction(
  input: ImportRow[]
): Promise<{ ok: boolean; error?: string; preview?: ImportPreviewRow[] }> {
  if (!(await guard())) return { ok: false, error: 'Session expired. Sign in again.' };
  if (input.length === 0 || input.length > 500) {
    return { ok: false, error: 'The file must contain between 1 and 500 rows.' };
  }

  const rows = normalizeRows(input);

  const products = await listPanelProducts();
  const index = buildIndex(products);

  // Guard against a file that would create the same product twice.
  const seenTitles = new Set<string>();
  const seenSkus = new Set<string>();
  // Product-level intent, collected across the variant rows of each product.
  const intents = new Map<string, ProductIntent>();

  const preview = rows.map((row, position): ImportPreviewRow => {
    const match = resolveRow(row, index);

    if (!match) {
      const key = `new:${position}`;
      const title = row.title?.trim() ?? '';
      const label = title || `Row ${position + 2}`;

      const error = validateNewRow(row, title, index, seenTitles, seenSkus);
      if (error) {
        return { key, label, action: 'none', changes: [], valid: false, error };
      }

      const category = resolveCategory(row);
      if (category.error) {
        return {
          key,
          label,
          action: 'none',
          changes: [],
          valid: false,
          error: category.error,
        };
      }

      seenTitles.add(title.toLowerCase());
      const sku = row.sku?.trim().toLowerCase();
      if (sku) seenSkus.add(sku);

      const changes = [`create as draft at ${row.price}`];
      if (row.quantity !== undefined) changes.push(`stock ${row.quantity}`);
      if (category.category) changes.push(`category ${category.category}`);
      if (row.dropship) changes.push('dropshipping on');
      const filled = PRODUCT_ATTRIBUTES.filter(
        (spec) => (row.attributes?.[spec.key] ?? '').trim() !== ''
      );
      if (filled.length > 0) changes.push(filled.map((spec) => spec.key).join(', '));

      return { key, label, action: 'create', changes, valid: true };
    }

    const { product, variant } = match;
    const key = variant.id;
    const label =
      variant.title === 'Default Title'
        ? product.title
        : `${product.title} / ${variant.title}`;
    const changes: string[] = [];

    if (row.price !== undefined && row.price !== variant.price) {
      if (!MONEY_PATTERN.test(row.price)) {
        return { key, label, action: 'none', changes, valid: false, error: 'Invalid price.' };
      }
      changes.push(`price ${variant.price} to ${row.price}`);
    }
    const currentCompare = variant.compareAtPrice ?? '';
    if (row.compareAtPrice !== undefined && row.compareAtPrice !== currentCompare) {
      if (row.compareAtPrice !== '' && !MONEY_PATTERN.test(row.compareAtPrice)) {
        return {
          key,
          label,
          action: 'none',
          changes,
          valid: false,
          error: 'Invalid compare-at price.',
        };
      }
      changes.push(
        `compare-at ${currentCompare || 'none'} to ${row.compareAtPrice || 'none'}`
      );
    }
    if (row.quantity !== undefined && row.quantity !== variant.inventoryQuantity) {
      if (!Number.isInteger(row.quantity) || row.quantity < 0 || row.quantity > 100000) {
        return { key, label, action: 'none', changes, valid: false, error: 'Invalid quantity.' };
      }
      changes.push(`stock ${variant.inventoryQuantity} to ${row.quantity}`);
    }

    const nextTitle = row.title?.trim();
    if (nextTitle && nextTitle !== product.title) changes.push('title updated');
    if (row.description !== undefined && row.description !== product.description) {
      changes.push('description updated');
    }
    changes.push(...attributeChanges(product.attributes, row.attributes));

    const category = resolveCategory(row);
    if (category.error) {
      return {
        key,
        label,
        action: 'none',
        changes,
        valid: false,
        error: category.error,
      };
    }
    const conflict = intentConflict(intents, product.id, {
      category: category.category,
      dropship: row.dropship,
    });
    if (conflict) {
      return { key, label, action: 'none', changes, valid: false, error: conflict };
    }

    if (category.category && category.category !== product.productType) {
      changes.push(
        `category ${product.productType || 'none'} to ${category.category}`
      );
    }
    if (row.dropship !== undefined && row.dropship !== sellsWithoutStock(variant)) {
      changes.push(row.dropship ? 'dropshipping on' : 'dropshipping off');
    }

    return {
      key,
      label,
      action: changes.length > 0 ? 'update' : 'none',
      changes,
      valid: true,
    };
  });

  return { ok: true, preview };
}

export async function applyImportAction(
  input: ImportRow[]
): Promise<{ ok: boolean; error?: string; applied?: number }> {
  if (!(await guard())) return { ok: false, error: 'Session expired. Sign in again.' };

  const rows = normalizeRows(input);
  const validation = await previewImportAction(rows);
  if (!validation.ok || !validation.preview) {
    return { ok: false, error: validation.error };
  }
  const preview = validation.preview;
  if (preview.some((row) => !row.valid)) {
    return { ok: false, error: 'Fix the invalid rows before applying.' };
  }

  const products = await listPanelProducts();
  const index = buildIndex(products);

  const pricingByProduct = new Map<
    string,
    Array<{ id: string; price: string; compareAtPrice: string | null }>
  >();
  const stockUpdates: Array<{ inventoryItemId: string; quantity: number }> = [];
  // One `productUpdate` per product: title, description, category and the
  // dropship tag all live on the product, and a row that only changes the
  // category still has to send the fields it is not changing.
  const detailUpdates = new Map<
    string,
    {
      productId: string;
      title: string;
      description: string;
      productType?: string;
      tags?: string[];
    }
  >();
  const policyUpdates = new Map<
    string,
    Array<{ id: string; inventoryPolicy: 'DENY' | 'CONTINUE' }>
  >();
  const attributeUpdates: Array<{
    productId: string;
    attributes: ProductAttributes;
  }> = [];
  const creations: ImportRow[] = [];
  let applied = 0;

  rows.forEach((row, position) => {
    const previewRow = preview[position];
    if (previewRow.action === 'none') return;

    if (previewRow.action === 'create') {
      creations.push(row);
      applied += 1;
      return;
    }

    const match = resolveRow(row, index);
    if (!match) return;
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

    const nextTitle = row.title?.trim();
    const titleChanged = Boolean(nextTitle) && nextTitle !== product.title;
    const descriptionChanged =
      row.description !== undefined && row.description !== product.description;

    const category = resolveCategory(row).category;
    const categoryChanged = Boolean(category) && category !== product.productType;
    const tagChanged =
      row.dropship !== undefined && row.dropship !== hasDropshipTag(product.tags);

    if (titleChanged || descriptionChanged || categoryChanged || tagChanged) {
      const current = detailUpdates.get(product.id);
      detailUpdates.set(product.id, {
        productId: product.id,
        title: nextTitle || current?.title || product.title,
        description:
          row.description === undefined
            ? (current?.description ?? product.description)
            : row.description,
        ...(categoryChanged ? { productType: category } : {}),
        ...(tagChanged
          ? { tags: tagsWithDropship(product.tags, row.dropship as boolean) }
          : {}),
      });
      applied += 1;
    }

    if (row.dropship !== undefined && row.dropship !== sellsWithoutStock(variant)) {
      const list = policyUpdates.get(product.id) ?? [];
      list.push({
        id: variant.id,
        inventoryPolicy: row.dropship ? 'CONTINUE' : 'DENY',
      });
      policyUpdates.set(product.id, list);
    }

    if (attributeChanges(product.attributes, row.attributes).length > 0) {
      attributeUpdates.push({
        productId: product.id,
        attributes: row.attributes ?? {},
      });
      applied += 1;
    }
  });

  try {
    for (const [productId, variants] of pricingByProduct) {
      await updateVariantPricing(productId, variants);
    }
    if (stockUpdates.length > 0) {
      await setInventoryQuantities(stockUpdates);
    }
    for (const update of detailUpdates.values()) {
      await updatePanelProductDetails({
        productId: update.productId,
        title: update.title,
        descriptionHtml: textToDescriptionHtml(update.description),
        ...(update.productType !== undefined
          ? { productType: update.productType }
          : {}),
        ...(update.tags ? { tags: update.tags } : {}),
      });
    }
    // After the tag, so a product never carries the label without Shopify
    // being willing to sell it.
    for (const [productId, variants] of policyUpdates) {
      await updateVariantInventoryPolicy(productId, variants);
    }
    for (const update of attributeUpdates) {
      await setProductAttributes(update.productId, update.attributes);
    }

    // New products always land as drafts: they have no photos yet, and
    // publishing stays a deliberate step taken in the panel afterwards.
    for (const row of creations) {
      const { productId } = await createPanelProduct({
        title: (row.title ?? '').trim(),
        descriptionHtml: textToDescriptionHtml(row.description ?? ''),
        status: 'DRAFT',
        price: row.price ?? '0',
        compareAtPrice:
          row.compareAtPrice && row.compareAtPrice !== '' ? row.compareAtPrice : null,
        sku: row.sku?.trim() || null,
        quantity: row.quantity ?? 0,
        imageResourceUrls: [],
        ...(resolveCategory(row).category
          ? { productType: resolveCategory(row).category }
          : {}),
        ...(row.dropship
          ? { tags: [DROPSHIP_TAG_VALUE], inventoryPolicy: 'CONTINUE' as const }
          : {}),
      });
      if (row.attributes) {
        await setProductAttributes(productId, row.attributes);
      }
    }

    revalidatePath('/admin/products');
    return { ok: true, applied };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}
