'use client';

import { useState, useTransition } from 'react';
import { updateStock } from './actions';

export function StockCell({
  variantId,
  initialQty,
  threshold,
}: {
  variantId: string;
  initialQty: number;
  threshold: number;
}) {
  const [qty, setQty] = useState(initialQty);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(initialQty));
  const [pending, startTransition] = useTransition();

  const commit = () => {
    const newQty = Math.max(0, parseInt(draft, 10) || 0);
    if (newQty === qty) { setEditing(false); return; }
    startTransition(async () => {
      await updateStock(variantId, newQty);
      setQty(newQty);
      setEditing(false);
    });
  };

  const isLow = qty <= threshold;

  if (editing) {
    return (
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          min="0"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); }}
          autoFocus
          className="w-20 rounded-lg border border-orange-500/50 bg-neutral-800 px-2 py-1 text-sm text-white focus:outline-none"
        />
        <button
          onClick={commit}
          disabled={pending}
          className="rounded-lg bg-orange-500/20 px-2 py-1 text-xs text-orange-300 hover:bg-orange-500/30 transition"
        >
          {pending ? '…' : 'Save'}
        </button>
        <button
          onClick={() => setEditing(false)}
          className="text-neutral-500 hover:text-white text-xs"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => { setDraft(String(qty)); setEditing(true); }}
      className={
        'rounded-lg px-2.5 py-1 text-sm font-medium transition hover:ring-1 hover:ring-white/20 ' +
        (isLow
          ? 'bg-red-500/15 text-red-300'
          : qty <= threshold * 3
          ? 'bg-yellow-500/10 text-yellow-300'
          : 'text-neutral-300')
      }
      title="Click to edit"
    >
      {qty}
    </button>
  );
}
