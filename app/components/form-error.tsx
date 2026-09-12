'use client';

import { useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * The banner a form shows when a submission fails — and takes focus when it
 * appears.
 *
 * `role="alert"` alone reads the message once, but leaves the cursor on the
 * submit button at the bottom of the form. Someone using a keyboard or a screen
 * reader hears something went wrong and then has to hunt upwards for it. Moving
 * focus to the message puts them at the explanation, and the next Tab continues
 * from there into the fields that need fixing.
 *
 * `tabIndex={-1}` makes it focusable by script without adding a stop to the tab
 * order for everyone else.
 */
export function FormError({ children }: { children: string | null }) {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (children) ref.current?.focus();
  }, [children]);

  if (!children) return null;

  return (
    <p
      ref={ref}
      role="alert"
      tabIndex={-1}
      className="flex items-start gap-2.5 rounded-xl border border-[rgb(var(--accent))]/40 bg-[rgb(var(--accent-soft))] px-4 py-3 text-sm leading-6 outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent))]"
    >
      <AlertCircle
        aria-hidden="true"
        className="mt-0.5 size-4 shrink-0 text-[rgb(var(--accent))]"
      />
      <span>{children}</span>
    </p>
  );
}
