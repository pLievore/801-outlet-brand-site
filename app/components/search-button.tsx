'use client';

import { useRef, useState } from 'react';
import { Search } from 'lucide-react';

import { HAPTIC, haptic } from '../../src/lib/haptics';
import { PredictiveSearch } from './predictive-search';
import { Button } from './ui/button';
import { Drawer } from './ui/dialog';

/**
 * Search on a phone, one tap from the header.
 *
 * Above `md` the search box itself is in the header and this is hidden. Below
 * it, the box has nowhere to live, and it used to sit inside the hamburger --
 * two taps and a scroll past the whole menu to reach the one control a shopper
 * uses to find a sofa. The magnifier sits next to the cart instead, where the
 * hand already is.
 */
export function SearchButton() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <Button
        ref={triggerRef}
        variant="ghost"
        size="icon"
        onClick={() => {
          haptic(HAPTIC.tap);
          setOpen(true);
        }}
        className="shrink-0 md:hidden"
        aria-label="Search products"
        aria-expanded={open}
      >
        <Search aria-hidden className="size-5" />
      </Button>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        triggerRef={triggerRef}
        title="Search"
        description="Find a piece by name, colour or material"
      >
        <div className="p-5">
          <PredictiveSearch
            autoFocus
            className="w-full"
            onNavigate={() => setOpen(false)}
          />
          <p className="mt-3 text-xs leading-relaxed text-[rgb(var(--muted))]">
            Try a name, a colour or a material — &ldquo;sectional&rdquo;,
            &ldquo;charcoal&rdquo;, &ldquo;leather&rdquo;.
          </p>
        </div>
      </Drawer>
    </>
  );
}
