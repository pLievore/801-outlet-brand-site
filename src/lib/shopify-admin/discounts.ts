import 'server-only';

import {
  adminGraphql,
  assertNoUserErrors,
} from './client';

export type DiscountStatus = 'ACTIVE' | 'EXPIRED' | 'SCHEDULED';

export type AdminDiscountItem = {
  id: string;
  title: string;
  code: string;
  status: DiscountStatus;
  summary: string;
  startsAt: string;
  endsAt: string | null;
  usageLimit: number | null;
  appliesOncePerCustomer: boolean;
  usageCount: number;
  discountType: 'percentage' | 'fixed_amount';
  value: number; // e.g. 10 for 10% or 50 for $50
};

export type DiscountInput = {
  title: string;
  code: string;
  discountType: 'percentage' | 'fixed_amount';
  value: number;
  startsAt?: string;
  endsAt?: string | null;
  usageLimit?: number | null;
  appliesOncePerCustomer?: boolean;
};

type GraphQLDiscountNode = {
  id: string;
  codeDiscount?: {
    __typename?: string;
    title?: string;
    status?: string;
    summary?: string;
    startsAt?: string;
    endsAt?: string | null;
    usageLimit?: number | null;
    appliesOncePerCustomer?: boolean;
    asyncUsageCount?: number | string;
    codes?: {
      nodes?: Array<{ id?: string; code?: string }>;
    };
    customerGets?: {
      value?:
        | { __typename: 'DiscountPercentage'; percentage?: number | string }
        | { __typename: 'DiscountAmount'; amount?: { amount?: string | number; currencyCode?: string } }
        | null;
    };
  };
};

const DISCOUNTS_QUERY = `#graphql
  query AdminDiscounts($first: Int!) {
    codeDiscountNodes(first: $first, sortKey: CREATED_AT, reverse: true) {
      nodes {
        id
        codeDiscount {
          __typename
          ... on DiscountCodeBasic {
            title
            status
            summary
            startsAt
            endsAt
            usageLimit
            appliesOncePerCustomer
            asyncUsageCount
            codes(first: 10) {
              nodes {
                id
                code
              }
            }
            customerGets {
              value {
                __typename
                ... on DiscountPercentage {
                  percentage
                }
                ... on DiscountAmount {
                  amount {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
    }
  }
` as const;

const DISCOUNT_BY_ID_QUERY = `#graphql
  query AdminDiscountById($id: ID!) {
    codeDiscountNode(id: $id) {
      id
      codeDiscount {
        __typename
        ... on DiscountCodeBasic {
          title
          status
          summary
          startsAt
          endsAt
          usageLimit
          appliesOncePerCustomer
          asyncUsageCount
          codes(first: 1) {
            nodes {
              id
              code
            }
          }
          customerGets {
            value {
              __typename
              ... on DiscountPercentage {
                percentage
              }
              ... on DiscountAmount {
                amount {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  }
` as const;

const CREATE_DISCOUNT_MUTATION = `#graphql
  mutation CreateDiscountCodeBasic($basicCodeDiscount: DiscountCodeBasicInput!) {
    discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
      codeDiscountNode {
        id
      }
      userErrors {
        field
        message
        code
      }
    }
  }
` as const;

const UPDATE_DISCOUNT_MUTATION = `#graphql
  mutation UpdateDiscountCodeBasic($id: ID!, $basicCodeDiscount: DiscountCodeBasicInput!) {
    discountCodeBasicUpdate(id: $id, basicCodeDiscount: $basicCodeDiscount) {
      codeDiscountNode {
        id
      }
      userErrors {
        field
        message
        code
      }
    }
  }
` as const;

const DELETE_DISCOUNT_MUTATION = `#graphql
  mutation DeleteDiscountCode($id: ID!) {
    discountCodeDelete(id: $id) {
      deletedCodeDiscountId
      userErrors {
        field
        message
        code
      }
    }
  }
` as const;

function adaptDiscountNode(node: GraphQLDiscountNode | null | undefined): AdminDiscountItem | null {
  const cd = node?.codeDiscount;
  if (!cd || cd.__typename !== 'DiscountCodeBasic') return null;

  const firstCode = cd.codes?.nodes?.[0]?.code ?? cd.title ?? '';
  const valueObj = cd.customerGets?.value;
  let discountType: 'percentage' | 'fixed_amount' = 'percentage';
  let value = 0;

  if (valueObj?.__typename === 'DiscountPercentage') {
    discountType = 'percentage';
    // Shopify stores percentage as e.g. 0.1 for 10%
    value = Math.round(Number(valueObj.percentage ?? 0) * 100);
  } else if (valueObj?.__typename === 'DiscountAmount') {
    discountType = 'fixed_amount';
    value = Number(valueObj.amount?.amount ?? 0);
  }

  return {
    id: node.id,
    title: cd.title ?? '',
    code: firstCode,
    status: (cd.status as DiscountStatus) || 'ACTIVE',
    summary: cd.summary ?? '',
    startsAt: cd.startsAt ?? new Date().toISOString(),
    endsAt: cd.endsAt ?? null,
    usageLimit: cd.usageLimit ?? null,
    appliesOncePerCustomer: Boolean(cd.appliesOncePerCustomer),
    usageCount: Number(cd.asyncUsageCount ?? 0),
    discountType,
    value,
  };
}

export type GetDiscountsResult = {
  discounts: AdminDiscountItem[];
  missingScope?: boolean;
  error?: string;
};

export async function getAdminDiscounts(first = 50): Promise<GetDiscountsResult> {
  try {
    const data = await adminGraphql<{
      codeDiscountNodes: {
        nodes: GraphQLDiscountNode[];
      };
    }>(DISCOUNTS_QUERY, { first });

    const nodes = data?.codeDiscountNodes?.nodes ?? [];
    const discounts = nodes
      .map(adaptDiscountNode)
      .filter((d): d is AdminDiscountItem => d !== null);

    return { discounts };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (
      message.includes('read_discounts') ||
      message.includes('ACCESS_DENIED') ||
      message.includes('access scope')
    ) {
      return { discounts: [], missingScope: true };
    }
    return { discounts: [], error: message };
  }
}

export function toDiscountGid(id: string): string {
  if (id.startsWith('gid://shopify/DiscountCodeNode/')) return id;
  const cleanId = id.split('/').pop() ?? id;
  return `gid://shopify/DiscountCodeNode/${cleanId}`;
}

export async function getAdminDiscountById(
  id: string
): Promise<{ discount: AdminDiscountItem | null; error?: string }> {
  try {
    const gid = toDiscountGid(id);
    const data = await adminGraphql<{
      codeDiscountNode: GraphQLDiscountNode;
    }>(DISCOUNT_BY_ID_QUERY, { id: gid });

    const discount = adaptDiscountNode(data?.codeDiscountNode);
    return { discount };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { discount: null, error: message };
  }
}

export async function createAdminDiscount(
  input: DiscountInput
): Promise<{ id: string | null; error?: string }> {
  try {
    const startsAt = input.startsAt
      ? new Date(input.startsAt).toISOString()
      : new Date().toISOString();

    const endsAt = input.endsAt ? new Date(input.endsAt).toISOString() : null;

    const valuePayload =
      input.discountType === 'percentage'
        ? { percentage: input.value / 100 }
        : {
            discountAmount: {
              amount: input.value,
              appliesOnEachItem: false,
            },
          };

    const basicCodeDiscount: Record<string, unknown> = {
      title: input.title.trim(),
      code: input.code.trim().toUpperCase(),
      startsAt,
      endsAt,
      usageLimit: input.usageLimit ? Math.max(1, input.usageLimit) : null,
      appliesOncePerCustomer: Boolean(input.appliesOncePerCustomer),
      customerGets: {
        value: valuePayload,
        items: {
          all: true,
        },
      },
      customerSelection: {
        all: true,
      },
    };

    const data = await adminGraphql<{
      discountCodeBasicCreate: {
        codeDiscountNode?: { id: string };
        userErrors?: Array<{ field?: string[]; message: string; code?: string }>;
      };
    }>(CREATE_DISCOUNT_MUTATION, { basicCodeDiscount });

    assertNoUserErrors(
      'discountCodeBasicCreate',
      data.discountCodeBasicCreate?.userErrors
    );

    return { id: data.discountCodeBasicCreate?.codeDiscountNode?.id ?? null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { id: null, error: message };
  }
}

export async function updateAdminDiscount(
  id: string,
  input: Partial<DiscountInput>
): Promise<{ success: boolean; error?: string }> {
  try {
    const basicCodeDiscount: Record<string, unknown> = {};

    if (input.title !== undefined) {
      basicCodeDiscount.title = input.title.trim();
    }
    if (input.code !== undefined) {
      basicCodeDiscount.code = input.code.trim().toUpperCase();
    }
    if (input.startsAt !== undefined) {
      basicCodeDiscount.startsAt = new Date(input.startsAt).toISOString();
    }
    if (input.endsAt !== undefined) {
      basicCodeDiscount.endsAt = input.endsAt
        ? new Date(input.endsAt).toISOString()
        : null;
    }
    if (input.usageLimit !== undefined) {
      basicCodeDiscount.usageLimit = input.usageLimit
        ? Math.max(1, input.usageLimit)
        : null;
    }
    if (input.appliesOncePerCustomer !== undefined) {
      basicCodeDiscount.appliesOncePerCustomer = Boolean(
        input.appliesOncePerCustomer
      );
    }
    if (input.discountType && input.value !== undefined) {
      basicCodeDiscount.customerGets = {
        value:
          input.discountType === 'percentage'
            ? { percentage: input.value / 100 }
            : {
                discountAmount: {
                  amount: input.value,
                  appliesOnEachItem: false,
                },
              },
        items: { all: true },
      };
    }

    const gid = toDiscountGid(id);
    const data = await adminGraphql<{
      discountCodeBasicUpdate: {
        codeDiscountNode?: { id: string };
        userErrors?: Array<{ field?: string[]; message: string }>;
      };
    }>(UPDATE_DISCOUNT_MUTATION, { id: gid, basicCodeDiscount });

    assertNoUserErrors(
      'discountCodeBasicUpdate',
      data.discountCodeBasicUpdate?.userErrors
    );

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}

export async function deleteAdminDiscount(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const gid = toDiscountGid(id);
    const data = await adminGraphql<{
      discountCodeDelete: {
        deletedCodeDiscountId?: string;
        userErrors?: Array<{ field?: string[]; message: string }>;
      };
    }>(DELETE_DISCOUNT_MUTATION, { id: gid });

    assertNoUserErrors(
      'discountCodeDelete',
      data.discountCodeDelete?.userErrors
    );

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}
