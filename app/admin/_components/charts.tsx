'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

import { formatMoney, formatShortDay } from './format';

export function RevenueBarChart({
  data,
  currency,
  height = 170,
}: {
  data: Array<{ date: string; revenue: number; orders: number }>;
  currency: string;
  height?: number;
}) {
  const max = Math.max(1, ...data.map((d) => d.revenue));
  const barWidth = 100 / Math.max(data.length, 1);
  const labelEvery = Math.ceil(data.length / 6);

  return (
    <div>
      <svg
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
        className="w-full"
        style={{ height }}
        role="img"
        aria-label="Bar chart of daily revenue"
      >
        {data.map((day, index) => {
          const barHeight = (day.revenue / max) * (height - 20);
          return (
            <motion.rect
              key={day.date}
              initial={{ height: 0, y: height - 16 }}
              animate={{
                height: Math.max(barHeight, day.revenue > 0 ? 2 : 0.75),
                y:
                  height -
                  16 -
                  Math.max(barHeight, day.revenue > 0 ? 2 : 0.75),
              }}
              transition={{ delay: index * 0.012, duration: 0.4, ease: 'easeOut' }}
              x={index * barWidth + barWidth * 0.15}
              width={barWidth * 0.7}
              rx={0.6}
              className={day.revenue > 0 ? 'fill-[#6f8352]' : 'fill-[#e2e5df]'}
            >
              <title>{`${formatShortDay(day.date)} — ${formatMoney(day.revenue, currency)} · ${day.orders} order${day.orders === 1 ? '' : 's'}`}</title>
            </motion.rect>
          );
        })}
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-[rgb(var(--muted))]">
        {data
          .filter((_, index) => index % labelEvery === 0)
          .map((day) => (
            <span key={day.date}>{formatShortDay(day.date)}</span>
          ))}
      </div>
    </div>
  );
}

export function Donut({
  segments,
  centerLabel,
  size = 148,
}: {
  segments: Array<{ label: string; value: number; color: string; hint?: string }>;
  centerLabel?: { value: string; label: string };
  size?: number;
}) {
  const total = Math.max(
    1,
    segments.reduce((sum, segment) => sum + segment.value, 0)
  );
  const radius = 60;
  const circumference = 2 * Math.PI * radius;

  const arcs: Array<(typeof segments)[number] & { dash: number; offset: number }> = [];
  for (const segment of segments) {
    const dash = (segment.value / total) * circumference;
    const previous = arcs[arcs.length - 1];
    arcs.push({
      ...segment,
      dash,
      offset: previous ? previous.offset + previous.dash : 0,
    });
  }

  if (segments.length === 0) {
    return (
      <p className="text-sm text-[rgb(var(--muted))]">No data in this period.</p>
    );
  }

  return (
    <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 150 150" className="-rotate-90" style={{ width: size, height: size }}>
          {arcs.map((arc) => (
            <circle
              key={arc.label}
              cx="75"
              cy="75"
              r={radius}
              fill="none"
              stroke={arc.color}
              strokeWidth="19"
              strokeDasharray={`${arc.dash} ${circumference - arc.dash}`}
              strokeDashoffset={-arc.offset}
            >
              <title>{`${arc.label}: ${arc.value}`}</title>
            </circle>
          ))}
        </svg>
        {centerLabel ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-xl font-bold leading-none tabular-nums">
              {centerLabel.value}
            </p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-[rgb(var(--muted))]">
              {centerLabel.label}
            </p>
          </div>
        ) : null}
      </div>
      <ul className="min-w-0 space-y-1.5 text-sm">
        {segments.map((segment) => (
          <li key={segment.label} className="flex items-center gap-2">
            <span
              className="size-2.5 shrink-0 rounded-sm"
              style={{ background: segment.color }}
            />
            <span className="min-w-0 truncate capitalize text-[rgb(var(--muted))]">
              {segment.label}
            </span>
            <span className="font-semibold tabular-nums">{segment.value}</span>
            {segment.hint ? (
              <span className="text-xs text-[rgb(var(--muted))]">
                {segment.hint}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function HBar({
  rows,
  emptyLabel = 'No data in this period.',
}: {
  rows: Array<{
    label: string;
    value: number;
    hint?: string;
    href?: string;
    imageUrl?: string | null;
  }>;
  emptyLabel?: string;
}) {
  const max = Math.max(1, ...rows.map((row) => row.value));
  if (rows.length === 0) {
    return <p className="text-sm text-[rgb(var(--muted))]">{emptyLabel}</p>;
  }

  return (
    <div className="space-y-2.5">
      {rows.map((row, index) => {
        const content = (
          <>
            <span
              className="w-28 shrink-0 truncate text-xs sm:w-40 sm:text-sm"
              title={row.label}
            >
              {row.label}
            </span>
            <div className="relative h-6 min-w-10 flex-1 overflow-hidden rounded bg-[rgb(var(--surface-muted))]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(row.value / max) * 100}%` }}
                transition={{ delay: index * 0.04, duration: 0.45, ease: 'easeOut' }}
                className="h-full rounded bg-[#6f8352]/80"
              />
            </div>
            <span className="w-20 shrink-0 text-right text-xs font-semibold tabular-nums sm:text-sm">
              {row.hint ?? row.value}
            </span>
          </>
        );
        return row.href ? (
          <Link
            key={row.label}
            href={row.href}
            className="-mx-1 flex items-center gap-2 rounded-lg px-1 py-1 transition hover:bg-[rgb(var(--surface-muted))] sm:gap-3"
          >
            {content}
          </Link>
        ) : (
          <div key={row.label} className="flex items-center gap-2 sm:gap-3">
            {content}
          </div>
        );
      })}
    </div>
  );
}
