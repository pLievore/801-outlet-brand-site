import type { HTMLAttributes } from 'react';

import type { CatalogMoney } from '../../../src/lib/catalog/types';
import { formatMoney } from '../../../src/lib/format';
import { cn } from '../../../src/lib/cn';

export function Price({
  money,
  compareAt,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  money: CatalogMoney;
  compareAt?: CatalogMoney | null;
}) {
  return (
    <div
      className={cn('flex items-baseline gap-2 tabular-nums', className)}
      {...props}
    >
      <span className="font-semibold">{formatMoney(money)}</span>
      {compareAt ? (
        <span className="text-xs text-[rgb(var(--muted))] line-through">
          {formatMoney(compareAt)}
        </span>
      ) : null}
    </div>
  );
}
