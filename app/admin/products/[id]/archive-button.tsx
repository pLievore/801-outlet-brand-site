'use client';

import { useTransition } from 'react';
import { archiveProduct } from '../actions';

export function ArchiveButton({ productId }: { productId: string }) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm('Archive this product? It will be hidden from the store.')) return;
    startTransition(() => {
      archiveProduct(productId);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="rounded-xl bg-red-500/15 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/25 transition disabled:opacity-50"
    >
      {pending ? 'Archiving…' : 'Archive'}
    </button>
  );
}
