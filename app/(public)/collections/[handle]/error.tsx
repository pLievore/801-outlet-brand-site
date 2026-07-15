'use client';

import { StorefrontRouteError } from '../../../components/storefront-route-error';

export default function CollectionError({ reset }: { reset: () => void }) {
  return (
    <StorefrontRouteError
      reset={reset}
      title="We could not load this collection"
    />
  );
}
