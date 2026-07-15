import {
  ApiType,
  shopifyApiProject,
} from '@shopify/api-codegen-preset';

const apiVersion = '2026-07';
const documents = ['./src/lib/shopify/queries/**/*.{ts,tsx}'];

const graphqlConfig = {
  schema: `https://shopify.dev/storefront-graphql-direct-proxy/${apiVersion}`,
  documents,
  projects: {
    default: shopifyApiProject({
      apiType: ApiType.Storefront,
      apiVersion,
      documents,
      outputDir: './src/lib/shopify/types',
      enumsAsConst: true,
    }),
  },
};

export default graphqlConfig;
