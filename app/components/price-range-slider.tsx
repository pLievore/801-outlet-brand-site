'use client';

import { useId } from 'react';

import { formatUsdCents } from '../../src/lib/format';

/**
 * Two handles on one track, for the price.
 *
 * Built from two native range inputs rather than pointer maths on a div: the
 * browser gives keyboard control, screen-reader semantics and touch handling
 * for free, and those are exactly the parts a hand-rolled slider gets wrong.
 * The track and the filled span are drawn underneath; only the thumbs take
 * pointer events, so whichever one is nearer the click is the one that grabs.
 *
 * Values change as the handle moves, but the catalogue is only asked to filter
 * on release — dragging across the whole range would otherwise fire a fetch per
 * pixel.
 */
export function PriceRangeSlider({
  min,
  max,
  value,
  onChange,
  onCommit,
}: {
  min: number;
  max: number;
  /** Current [minimum, maximum], always inside the bounds. */
  value: [number, number];
  onChange: (next: [number, number]) => void;
  onCommit: () => void;
}) {
  const labelId = useId();
  const step = 50;
  const [low, high] = value;

  const span = Math.max(1, max - min);
  const leftPercent = ((low - min) / span) * 100;
  const rightPercent = 100 - ((high - min) / span) * 100;

  const thumb =
    'pointer-events-none absolute inset-x-0 top-1/2 h-0 w-full -translate-y-1/2 appearance-none bg-transparent ' +
    'focus-visible:outline-none ' +
    '[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none ' +
    '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[rgb(var(--accent))] ' +
    '[&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:transition ' +
    '[&::-webkit-slider-thumb]:cursor-grab active:[&::-webkit-slider-thumb]:cursor-grabbing ' +
    'focus-visible:[&::-webkit-slider-thumb]:ring-2 focus-visible:[&::-webkit-slider-thumb]:ring-[rgb(var(--accent)/0.4)] ' +
    'focus-visible:[&::-webkit-slider-thumb]:ring-offset-2 ' +
    '[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:appearance-none ' +
    '[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[rgb(var(--accent))] ' +
    '[&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-sm';

  return (
    <div className="px-1">
      <div className="flex items-center justify-between text-xs">
        <span id={labelId} className="font-semibold text-[rgb(var(--muted))]">
          Price
        </span>
        <span className="font-semibold tabular-nums-tight">
          {formatUsdCents(Math.round(low * 100))} —{' '}
          {formatUsdCents(Math.round(high * 100))}
        </span>
      </div>

      <div className="relative mt-3 h-5">
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-[rgb(var(--border-strong))]" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-[rgb(var(--accent))]"
          style={{ left: `${leftPercent}%`, right: `${rightPercent}%` }}
        />

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={low}
          aria-label="Minimum price"
          aria-describedby={labelId}
          onChange={(event) => {
            // The handles cannot cross: the minimum stops one step short.
            const next = Math.min(Number(event.target.value), high - step);
            onChange([Math.max(min, next), high]);
          }}
          onPointerUp={onCommit}
          onKeyUp={onCommit}
          onTouchEnd={onCommit}
          className={thumb}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={high}
          aria-label="Maximum price"
          aria-describedby={labelId}
          onChange={(event) => {
            const next = Math.max(Number(event.target.value), low + step);
            onChange([low, Math.min(max, next)]);
          }}
          onPointerUp={onCommit}
          onKeyUp={onCommit}
          onTouchEnd={onCommit}
          className={thumb}
        />
      </div>

      <div className="mt-1 flex items-center justify-between text-[11px] text-[rgb(var(--muted))]">
        <span>{formatUsdCents(min * 100)}</span>
        <span>{formatUsdCents(max * 100)}</span>
      </div>
    </div>
  );
}
