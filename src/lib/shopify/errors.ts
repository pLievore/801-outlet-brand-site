export type ShopifyStorefrontErrorCode =
  | 'CONFIGURATION_ERROR'
  | 'REQUEST_FAILED'
  | 'REQUEST_TIMEOUT'
  | 'GRAPHQL_ERROR'
  | 'EMPTY_RESPONSE';

type ShopifyStorefrontErrorOptions = {
  code: ShopifyStorefrontErrorCode;
  operationName: string;
  message: string;
  statusCode?: number;
  graphQLErrors?: string[];
  hasPartialData?: boolean;
  retryable?: boolean;
  cause?: unknown;
};

export class ShopifyStorefrontError extends Error {
  readonly code: ShopifyStorefrontErrorCode;
  readonly operationName: string;
  readonly statusCode?: number;
  readonly graphQLErrors: string[];
  readonly hasPartialData: boolean;
  readonly retryable: boolean;

  constructor(options: ShopifyStorefrontErrorOptions) {
    super(options.message, { cause: options.cause });
    this.name = 'ShopifyStorefrontError';
    this.code = options.code;
    this.operationName = options.operationName;
    this.statusCode = options.statusCode;
    this.graphQLErrors = options.graphQLErrors ?? [];
    this.hasPartialData = options.hasPartialData ?? false;
    this.retryable = options.retryable ?? false;
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      operationName: this.operationName,
      statusCode: this.statusCode,
      graphQLErrorCount: this.graphQLErrors.length,
      hasPartialData: this.hasPartialData,
      retryable: this.retryable,
    };
  }
}

export function normalizeGraphQLErrors(errors: unknown): string[] {
  if (!Array.isArray(errors)) return [];

  return errors.slice(0, 10).map((error) => {
    if (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      typeof error.message === 'string'
    ) {
      return error.message.slice(0, 500);
    }

    return 'Unknown Shopify GraphQL error';
  });
}
