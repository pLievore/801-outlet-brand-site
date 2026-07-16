import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, TrendingDown, TrendingUp } from 'lucide-react';

import { formatPercent } from './format';

export function PageHeader({
  eyebrow,
  title,
  titleAccent,
  subtitle,
  actions,
  back,
}: {
  eyebrow: string;
  title: string;
  titleAccent?: string;
  subtitle?: string;
  actions?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div>
      {back ? (
        <Link
          href={back.href}
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[rgb(var(--muted))] transition hover:text-[rgb(var(--fg))]"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          {back.label}
        </Link>
      ) : null}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--muted))]">
            {eyebrow}
          </p>
          <h1 className="mt-2 font-display text-4xl tracking-tight">
            {title}
            {titleAccent ? (
              <>
                {' '}
                <span className="italic">{titleAccent}</span>
              </>
            ) : null}
          </h1>
          {subtitle ? (
            <p className="mt-2 text-sm text-[rgb(var(--muted))]">{subtitle}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </div>
  );
}

export function StatCard({
  title,
  value,
  sub,
  trend,
  accent,
  href,
}: {
  title: string;
  value: string;
  sub?: string;
  /** Fractional change vs the previous period (0.25 = +25%). */
  trend?: number | null;
  accent?: boolean;
  href?: string;
}) {
  const up = typeof trend === 'number' && trend >= 0;
  const body = (
    <>
      {accent ? (
        <span className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-[rgb(var(--sage-ink))]/10 blur-2xl" />
      ) : null}
      <p className="relative text-xs font-semibold uppercase tracking-[0.14em] text-[rgb(var(--muted))]">
        {title}
      </p>
      <p className="relative mt-2 text-2xl font-bold tracking-tight tabular-nums md:text-[1.7rem] md:leading-none">
        {value}
      </p>
      <div className="relative mt-2 flex min-h-5 items-center gap-2">
        {typeof trend === 'number' ? (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
              up ? 'bg-[rgb(var(--sage-soft))] text-[rgb(var(--sage-ink))]' : 'bg-red-50 text-red-700'
            }`}
          >
            {up ? (
              <TrendingUp aria-hidden="true" className="size-3" />
            ) : (
              <TrendingDown aria-hidden="true" className="size-3" />
            )}
            {formatPercent(Math.abs(trend))}
          </span>
        ) : null}
        {sub ? (
          <span className="text-xs text-[rgb(var(--muted))]">{sub}</span>
        ) : null}
      </div>
    </>
  );

  const className = `group relative overflow-hidden rounded-2xl border p-4 transition ${
    accent
      ? 'border-[rgb(var(--sage-ink))]/25 bg-[rgb(var(--sage-soft))]/40'
      : 'border-[rgb(var(--border))] bg-white'
  } ${href ? 'hover:-translate-y-0.5 hover:shadow-md' : ''}`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {body}
      </Link>
    );
  }
  return <div className={className}>{body}</div>;
}

export function Panel({
  title,
  action,
  children,
  className = '',
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-3xl border border-[rgb(var(--border))] bg-white p-5 md:p-6 ${className}`}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

const STATUS_PILL: Record<string, string> = {
  ACTIVE: 'bg-[rgb(var(--sage-soft))] text-[rgb(var(--sage-ink))]',
  DRAFT: 'bg-amber-50 text-amber-700',
  ARCHIVED: 'bg-[rgb(var(--surface-muted))] text-[rgb(var(--muted))]',
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
        STATUS_PILL[status] ?? 'bg-[rgb(var(--surface-muted))] text-[rgb(var(--muted))]'
      }`}
    >
      {status.toLowerCase()}
    </span>
  );
}
