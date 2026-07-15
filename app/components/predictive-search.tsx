'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

import {
  EMPTY_SUGGESTIONS,
  SUGGESTION_MIN_CHARS,
  type SearchSuggestions,
} from '../../src/lib/catalog/suggestions';
import { formatMoney } from '../../src/lib/format';
import { cn } from '../../src/lib/cn';

type SuggestionItem = {
  key: string;
  href: string;
  label: string;
  kind: 'query' | 'collection' | 'product';
  product?: SearchSuggestions['products'][number];
};

function toItems(suggestions: SearchSuggestions): SuggestionItem[] {
  return [
    ...suggestions.queries.map<SuggestionItem>((text) => ({
      key: `query:${text}`,
      href: `/products?q=${encodeURIComponent(text)}`,
      label: text,
      kind: 'query',
    })),
    ...suggestions.collections.map<SuggestionItem>((collection) => ({
      key: `collection:${collection.handle}`,
      href: `/collections/${collection.handle}`,
      label: collection.title,
      kind: 'collection',
    })),
    ...suggestions.products.map<SuggestionItem>((product) => ({
      key: `product:${product.handle}`,
      href: `/products/${product.handle}`,
      label: product.title,
      kind: 'product',
      product,
    })),
  ];
}

const KIND_LABEL: Record<SuggestionItem['kind'], string> = {
  query: 'Search',
  collection: 'Collection',
  product: 'Product',
};

export function PredictiveSearch({
  className,
  inputClassName,
  onNavigate,
}: {
  className?: string;
  inputClassName?: string;
  /** Called after a suggestion is chosen (e.g. to close the mobile drawer). */
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const listboxId = useId();
  const inputId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [term, setTerm] = useState('');
  const [suggestions, setSuggestions] = useState(EMPTY_SUGGESTIONS);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const items = useMemo(() => toItems(suggestions), [suggestions]);
  const trimmed = term.trim();

  useEffect(() => {
    if (trimmed.length < SUGGESTION_MIN_CHARS) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/search/predictive?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal }
        );
        if (!response.ok) return;

        const data = (await response.json()) as SearchSuggestions;
        setSuggestions(data);
        setActiveIndex(-1);
        setOpen(
          data.queries.length + data.collections.length + data.products.length >
            0
        );
      } catch {
        // Aborted or offline: keep whatever is currently shown.
      }
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [trimmed]);

  // Close when focus/click moves outside the combobox.
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  const navigate = (href: string) => {
    setOpen(false);
    setActiveIndex(-1);
    onNavigate?.();
    router.push(href);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      if (open) {
        event.preventDefault();
        setOpen(false);
        setActiveIndex(-1);
      }
      return;
    }

    if (!open || items.length === 0) return;

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      setActiveIndex((index) => {
        const next = index + delta;
        if (next < -1) return items.length - 1;
        if (next >= items.length) return -1;
        return next;
      });
      return;
    }

    if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      navigate(items[activeIndex].href);
    }
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <form
        action="/products"
        role="search"
        onSubmit={() => {
          setOpen(false);
          onNavigate?.();
        }}
      >
        <label htmlFor={inputId} className="sr-only">
          Search furniture
        </label>
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[rgb(var(--muted))]"
          />
          <input
            id={inputId}
            name="q"
            type="search"
            placeholder="Search furniture"
            autoComplete="off"
            role="combobox"
            aria-expanded={open}
            aria-controls={listboxId}
            aria-activedescendant={
              activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined
            }
            aria-autocomplete="list"
            value={term}
            onChange={(event) => {
              const value = event.target.value;
              setTerm(value);
              if (value.trim().length < SUGGESTION_MIN_CHARS) {
                setSuggestions(EMPTY_SUGGESTIONS);
                setOpen(false);
                setActiveIndex(-1);
              }
            }}
            onKeyDown={onKeyDown}
            onFocus={() => {
              if (items.length > 0 && trimmed.length >= SUGGESTION_MIN_CHARS) {
                setOpen(true);
              }
            }}
            className={cn(
              'min-h-11 w-full rounded-full border border-[rgb(var(--border-strong))] bg-white py-2 pl-11 pr-4 text-sm outline-none transition placeholder:text-[rgb(var(--muted))] focus:border-[rgb(var(--accent))] focus:ring-2 focus:ring-[rgb(var(--accent))]/15',
              inputClassName
            )}
          />
        </div>
      </form>

      <ul
        id={listboxId}
        role="listbox"
        aria-label="Search suggestions"
        hidden={!open}
        className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[70vh] overflow-y-auto rounded-2xl border border-[rgb(var(--border))] bg-white p-2 shadow-xl"
      >
        {items.map((item, index) => (
          <li
            key={item.key}
            id={`${listboxId}-${index}`}
            role="option"
            aria-selected={index === activeIndex}
          >
            <button
              type="button"
              tabIndex={-1}
              onClick={() => navigate(item.href)}
              onPointerEnter={() => setActiveIndex(index)}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition',
                index === activeIndex
                  ? 'bg-[rgb(var(--surface-muted))]'
                  : 'hover:bg-[rgb(var(--surface-muted))]'
              )}
            >
              {item.kind === 'product' && item.product ? (
                <>
                  <span className="relative size-11 shrink-0 overflow-hidden rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--surface-muted))]">
                    {item.product.image ? (
                      <Image
                        src={item.product.image.url}
                        alt={item.product.image.alt ?? ''}
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    ) : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">
                      {item.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-[rgb(var(--muted))]">
                      {formatMoney(item.product.price)}
                      {!item.product.availableForSale ? ' · Sold out' : ''}
                    </span>
                  </span>
                </>
              ) : (
                <>
                  <Search
                    aria-hidden="true"
                    className="size-4 shrink-0 text-[rgb(var(--muted))]"
                  />
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-[rgb(var(--muted))]">
                    {KIND_LABEL[item.kind]}
                  </span>
                </>
              )}
            </button>
          </li>
        ))}
        {trimmed.length >= SUGGESTION_MIN_CHARS ? (
          <li role="option" aria-selected={false} id={`${listboxId}-all`}>
            <button
              type="button"
              tabIndex={-1}
              onClick={() =>
                navigate(`/products?q=${encodeURIComponent(trimmed)}`)
              }
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl border-t border-[rgb(var(--border))] px-3 py-2.5 text-sm font-semibold text-[rgb(var(--accent))] transition hover:bg-[rgb(var(--surface-muted))]"
            >
              See all results for “{trimmed}”
            </button>
          </li>
        ) : null}
      </ul>
    </div>
  );
}
