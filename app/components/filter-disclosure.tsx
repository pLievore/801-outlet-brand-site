'use client';

import { useId, useState, type ReactNode } from 'react';
import { SlidersHorizontal } from 'lucide-react';

import { HAPTIC, haptic } from '../../src/lib/haptics';

/**
 * Filters, folded away on a phone.
 *
 * Stacked, the five controls run most of a phone screen tall, so the catalogue
 * opened on a form rather than on sofas — the visitor had to scroll past the
 * tools to reach the thing they came for. On a wide screen the same controls
 * sit on one line and cost nothing, so there they stay open and this collapses
 * to a plain wrapper.
 *
 * The count rides on the button so the state is legible while it is shut: a
 * closed panel that is silently filtering the results is how someone concludes
 * the shop is empty.
 */
export function FilterDisclosure({
  activeCount,
  children,
}: {
  activeCount: number;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <>
      <button
        type="button"
        onClick={() => {
          haptic(HAPTIC.tap);
          setOpen((value) => !value);
        }}
        aria-expanded={open}
        aria-controls={panelId}
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-[rgb(var(--border-strong))] bg-white px-5 text-sm font-semibold transition hover:border-[rgb(var(--fg))] lg:hidden"
      >
        <SlidersHorizontal aria-hidden="true" className="size-4" />
        {open ? 'Hide filters' : 'Filters'}
        {activeCount > 0 ? (
          <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-[rgb(var(--accent))] px-1.5 text-[11px] font-bold text-white">
            {activeCount}
          </span>
        ) : null}
      </button>

      <div
        id={panelId}
        // `lg:block` overrides the hidden state above the breakpoint, where the
        // toggle itself is gone and there would be no way to open it again.
        className={`${open ? 'mt-3 block' : 'hidden'} lg:mt-0 lg:block`}
      >
        {children}
      </div>
    </>
  );
}
